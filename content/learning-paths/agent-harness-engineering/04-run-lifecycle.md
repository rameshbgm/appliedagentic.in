# Design the Agent Run Lifecycle

An agent run is more than a request that eventually returns text. It can wait for a worker, request approval, lose its lease or stop after a deadline. A lifecycle model turns those situations into explicit states that application code, operators and users can understand. Without it, a single “running” flag often conceals jobs that have already failed or are waiting indefinitely.

## Define states and permitted transitions

Begin with queued, running, awaiting approval, completed, failed and cancelled. Add recovering only if it has a clear owner and behavior. Distinguish state from diagnostic reason: a failed run may have reason provider authentication, tool protocol or deadline exceeded. A completed run may still contain warnings or an answer that evidence was insufficient.

A transition should have a precondition. Only a queued run may be claimed by a worker. Only the worker holding the current lease may append execution results. An approval decision applies only to the pending action version it references. Completed runs should not silently return to running; create a new attempt or an explicit continuation with a lineage record.

Model durable transitions in the database rather than relying solely on in-memory objects. Store a monotonically increasing version and use compare-and-swap updates. If two workers race to claim a run, only one should satisfy the expected version and queued state. The loser must reload rather than assuming its local copy is authoritative.

## Walk through an approval pause

A report agent finishes its draft and requests an external upload. The harness creates a pending action with an argument digest, moves the run to awaiting approval and releases its execution worker. The run is durable even though no model call is active. A review service later records an authorized decision and schedules a continuation.

```text
queued -> running -> awaiting_approval
                     |
           approved exact action
                     |
                  queued -> running -> completed
```

Before execution resumes, the harness checks the current policy and resource access again. Approval is necessary but may no longer be sufficient if credentials were revoked or the destination changed. If the draft changed, the approved action digest no longer matches. The runtime must request a new decision rather than interpreting an old approval as a general permission slip.

## Treat attempts and runs separately

A run identifies the user's logical job. An attempt identifies one execution period or retry. Track both. A worker crash can end an attempt without changing the job's identity. The replacement worker receives a new attempt identifier and a newer lease epoch, loads committed state and reconciles unfinished actions.

This separation improves reporting. “Three attempts, one completed report” is different from “three independent reports.” It also helps prevent misleading billing or duplicate notifications. Emit user-facing completion once per logical transition, using a durable notification record if necessary, rather than whenever a worker reaches the end of its function.

## Define terminal behavior

A terminal transition should include the final artifact reference, stop reason, timestamps and unresolved operations. Record facts such as a tool timing out without claiming the remote service reversed its work. Cancelled means the runtime stopped future work as defined by its cancellation policy; it does not guarantee that every external effect was undone.

Consider retention and privacy when storing traces. Keep enough information to explain outcomes, but do not make durable state a dump of every secret or retrieved document. An event can reference an access-controlled artifact by hash and identifier. Document which records can be deleted and how that affects replay or audit requirements.

## Make state visible to callers

Expose a status endpoint that reads durable state rather than asking the active worker for its memory. Include the last committed progress time and whether the job is waiting for a person, capacity or recovery. A stale heartbeat should trigger investigation, not an automatic assertion that no external work occurred. Clients can poll or subscribe to changes without holding the original execution connection open. This also makes service restarts less disruptive because the user interface can reconnect to the same logical run and its existing artifacts.

## Practice

Draw a transition table for a document assistant that requires upload approval. For each transition, list its caller, expected previous state, database transaction and emitted event. Simulate two simultaneous worker claims, an approval after cancellation and an upload result from an expired worker. Decide which writes must be rejected and which evidence must remain available for reconciliation.

## Completion checklist

- Distinguish logical runs from execution attempts.
- Enforce state transitions with concurrency checks.
- Resume approval waits without occupying a worker.
- Record terminal outcomes without overstating external guarantees.

Build on this with [Checkpoints and Resume](/articles/harness-checkpoints-resume) and [Approval, Denial and Escalation Flows](/articles/harness-approval-flows).

## References

- [PostgreSQL: Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
