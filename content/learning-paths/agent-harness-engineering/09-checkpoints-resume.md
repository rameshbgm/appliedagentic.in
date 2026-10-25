# Build Checkpoints and Resume Interrupted Runs

A checkpoint tells a replacement worker where reliable progress ends. It must preserve enough information to continue without repeating harmful operations or trusting incomplete output. Saving the latest conversation is useful, but it does not establish crash consistency across files, database records and external services.

## Define a recoverable boundary

A checkpoint can include the committed event sequence, task-state version, pending action identifiers, artifact references and remaining budgets. Store the harness and tool schema versions needed to interpret it. A worker should create checkpoints at deliberate boundaries: after a validated tool result is committed, after a task artifact is verified or before a durable approval wait.

Make the checkpoint and related local state changes atomic where possible. If your database stores both an event and a state transition, use one transaction. If an artifact lives in object storage, upload it under an immutable identifier, verify its checksum and then commit a reference. An abandoned upload can be cleaned up later; a committed reference to an incomplete object is harder to recover from.

A checkpoint does not make remote operations atomic. If the process dies between an external write and the local result commit, recovery must reconcile that action before continuing. This is why action preparation, idempotency and checkpoints form one design rather than independent features.

## Walk through a crash

A report agent stores draft D4, records its checksum and prepares upload action U9. The upload succeeds, but the worker crashes before recording the provider's object identifier. A replacement worker loads checkpoint C12 and sees U9 in prepared or uncertain state. It must not ask the model to upload a fresh copy immediately.

```text
claim_new_lease(run)
checkpoint = load_latest_committed_checkpoint(run)
verify_artifacts(checkpoint.artifact_refs)
for action in checkpoint.unresolved_actions:
    reconcile(action)
state = rebuild_from_events(checkpoint.event_sequence)
resume_with_current_policy(state)
```

Reconciliation might query the destination using U9 or retry under the provider's stable idempotency key. If the outcome cannot be determined safely, pause for review. The checkpoint makes uncertainty visible; it does not remove uncertainty by itself.

## Prevent stale workers from writing

A crashed-looking worker can return after a network partition. Use a lease epoch or fencing token on writes to durable run state. A new worker obtains a higher epoch. Storage operations reject results from an older epoch. A lease timeout alone is insufficient if the old worker can still modify shared state after another worker takes over.

External services may not support your fencing token. Route their actions through a dispatcher that checks current ownership immediately before dispatch and uses stable action identities. Even then, account for the race after dispatch. No local lease can recall a request already accepted by another system.

## Verify recovery rather than assuming it

Introduce crash points before action preparation, after preparation, after remote success and before checkpoint commit. Restart from each point. Check final artifacts, number of external effects, unresolved records and budget accounting. A successful happy-path resume does not prove safety at the most important interruption boundaries.

Version checkpoints so runtime upgrades can reject incompatible state cleanly. A recovery tool should report why a checkpoint is unreadable and preserve it for migration. Never silently start a new run because parsing failed; that can repeat actions under a new identity and erase the connection to earlier work.

## Separate replay from re-execution

Replaying committed events rebuilds local state; it should not invoke external tools again. Make that distinction explicit in your code. A replay handler can update a task projection from an existing confirmed result, while an execution handler dispatches a new authorized action. Mixing the two can turn a recovery or debugging command into another publication attempt. Test the replay path with a provider adapter that fails if called, ensuring that reconstruction uses historical facts without producing new side effects.

## Practice

Build a local artifact writer with a database checkpoint. Use temporary files followed by atomic rename for completed local artifacts, and record checksums. Kill the worker at four marked points. Show that recovery either produces one verified artifact or pauses with an explicit unresolved operation. Repeat with a deliberately corrupted artifact to ensure validation catches it.

## Completion checklist

- Commit related local state changes atomically.
- Verify artifact existence and checksums before resuming.
- Reconcile unresolved external actions first.
- Reject stale workers and incompatible checkpoint versions.

Continue with [Safe Retries](/articles/harness-retries-idempotency) and [Queues and Worker Concurrency](/articles/harness-queues-workers-concurrency).

## References

- [SQLite: Atomic commit](https://www.sqlite.org/atomiccommit.html)
- [PostgreSQL: Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
