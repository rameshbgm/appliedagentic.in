# Build a Resumable Agent Runtime

This capstone combines the earlier lessons into a runtime that can continue a research task after interruption. Keep the business task modest: inspect an authorized document collection, create a cited comparison and save a private draft. The engineering challenge is durable execution, not the number of tools. A small system with demonstrable guarantees is a stronger result than a large interface with unclear recovery behavior.

## Define the acceptance contract

The runtime must preserve one logical run across worker attempts, enforce tool permissions and budgets, and resume without duplicating a saved draft. It must identify uncertain external actions before continuing. Completion requires a readable draft, valid source references and a durable record of which requirements were checked.

Use a relational database or another store with suitable conditional writes and transaction semantics. Define records for runs, attempts, events, actions, checkpoints and artifacts. Store immutable identifiers and versions. Keep sensitive document contents in protected artifact storage rather than scattering them through queue messages and ordinary logs.

Implement two tools first: search_documents and save_draft. The search tool is read-only and tenant-scoped. The draft tool writes to an assigned destination using a stable action identifier. A deterministic fake model makes it possible to test execution behavior before introducing variable model responses.

## Build the vertical slice

Start a run, claim it with a lease, construct context and dispatch one validated search. Commit the result and checkpoint. Then ask the model to produce a draft, validate required fields and save it through the action ledger. A completion check verifies that the stored artifact is readable and references the expected source identifiers.

```text
accept -> persist run -> queue
worker claim -> load checkpoint -> reconcile actions
context -> model proposal -> validate -> authorize
prepare action -> execute tool -> commit result
checkpoint -> verify outcome -> terminal transition
```

Every arrow crossing a process or storage boundary is a potential failure point. Mark those points in your design before writing the recovery code. If a draft write succeeds and the result commit fails, the next worker should find or safely reuse the same logical action rather than inventing a second draft.

## Inject failures deliberately

Add controlled crash points after tool preparation, after tool success and before checkpoint commit. Restart with a new worker attempt each time. Introduce a duplicate queue message and a stale worker returning after its lease expired. Verify final artifact count, action state and accepted lease epoch.

Also test invalid arguments, unauthorized collection identifiers and budget exhaustion. A resumable runtime must preserve policy, not merely progress. If access is revoked between attempts, recovery should stop before executing another tool. If the checkpoint schema is incompatible with the current worker, report a migration problem rather than starting over silently.

## Document the guarantees

Write a short guarantee table. For local state, describe which writes are atomic. For remote tools, describe idempotency support and reconciliation limits. For cancellation, state when future dispatch stops and what happens to already dispatched work. For artifacts, state how checksums and ownership are verified.

Avoid claiming universal exactly-once execution. Your system may provide one logical draft through a specific adapter while another provider exposes uncertain outcomes. A useful engineering report identifies these boundaries and shows test evidence. It does not hide them behind a broad reliability label.

## Keep the first release inspectable

Choose one storage backend and one worker protocol for the exercise. Avoid adding multiple orchestration libraries before the fundamental recovery paths are clear. Keep adapters narrow so they can be replaced by deterministic fakes during tests. A reviewer should be able to locate the claim transaction, action preparation, checkpoint commit and completion decision directly. This inspectability is part of the deliverable because operational guarantees are difficult to assess when control flow is scattered across opaque callbacks.

## Practice and deliverables

Run a reproducible demonstration from a clean database with seeded documents. Save the initial request, event timeline, crash injection points and final artifact manifest. Include commands for starting workers, triggering cancellation and inspecting unresolved actions. Another developer should be able to repeat the recovery exercise without reading the implementation first.

Add a concise operational guide covering stuck leases, failed jobs and abandoned artifacts. Describe which repairs are safe to automate and which require an authorized operator. Keep test fixtures separate from production credentials and real customer documents.

## Completion checklist

- Resume the same logical run after each injected crash.
- Prevent duplicate draft effects under redelivery.
- Preserve authorization and budgets during recovery.
- Deliver reproducible evidence and a clear guarantee table.

Continue with [Integrating Tools, Approvals and Traces](/articles/harness-capstone-integrated-controls) and [Comparing Harness Versions](/articles/harness-capstone-compare-versions).

## References

- [SQLite: Atomic commit](https://www.sqlite.org/atomiccommit.html)
- [Amazon SQS: At-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
