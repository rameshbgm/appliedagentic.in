# Build Queues, Workers and Concurrency Controls

A durable queue separates accepting an agent job from executing it. The web server can acknowledge the request while workers perform longer tasks. This improves resilience and capacity management, but queues introduce duplicate deliveries, ownership races and ordering questions. Design the worker protocol around those realities rather than assuming one message always means one execution.

## Identify jobs and attempts

A queue message should reference a durable run or action identifier. Store the authoritative request and state in your database. Keep messages small and avoid embedding long-lived credentials or entire sensitive documents. The worker loads current state after receiving the message, so cancellation and policy changes can take effect while a job waits.

Assume redelivery unless your specific system contract proves otherwise. A worker may complete work and crash before acknowledging the message. Another worker can then receive the same job. Deduplicate through durable state, action identities and conditional claims. A queue-level feature alone does not solve duplicate remote side effects.

Use a lease for active ownership and renew it while work is progressing. The lease needs an epoch or fencing token so an expired worker cannot later commit stale results. Heartbeats show liveness, not necessarily useful progress, so monitor both lease renewal and meaningful execution events.

## Work through a duplicate delivery

Workers A and B receive messages for run R12. Both load the queued state, but only A succeeds in the database transition that claims the run. B sees the newer version and does not start another model loop. Later, A loses connectivity and its lease expires. Worker C claims a new epoch and reconciles any unresolved action before continuing.

```text
message = queue.receive()
claim = store.try_claim(message.run_id, expected_state="queued")
if not claim.acquired:
    acknowledge_or_defer_duplicate(message)
    return
try:
    resume_and_execute(claim.run, fencing_token=claim.epoch)
    queue.acknowledge(message)
except recoverable_worker_failure:
    preserve_state_for_redelivery()
```

Acknowledgment timing matters. Acknowledge only after durable progress reaches the boundary your retry design expects. If a long run spans many sessions, queue separate continuations rather than holding one delivery indefinitely. Document how visibility timeouts, lease timeouts and job deadlines interact.

## Control concurrency at several levels

Set limits for total workers, per-tenant runs, per-tool calls and model-provider requests. A global worker limit does not prevent one tenant from monopolizing all capacity. A per-run step budget does not prevent hundreds of runs from overwhelming a shared dependency. Use fair scheduling and explicit backpressure when limits are reached.

Shared mutable resources require additional coordination. Two agents editing the same draft can overwrite each other even if they have separate run identifiers. Use resource ownership, optimistic version checks or task-specific serialization. Keep critical sections small and avoid holding a database lock while waiting for a long model response.

## Handle poison jobs and overload

A malformed job that always fails should not cycle forever. Bound delivery attempts and route exhausted jobs to a reviewable failure queue or terminal state. Preserve the reason and affected run identifier. Dead-letter storage is an operational signal, not a substitute for user-visible failure reporting.

Measure queue age, active runs, retry rates and dependency saturation. When arrival rate exceeds processing capacity, adding retries can make the problem worse. Reject or defer new work with clear status rather than accepting an unlimited backlog whose deadlines are already impossible to meet.

## Coordinate message visibility and progress

A visibility timeout hides a delivery temporarily; it does not prove exclusive ownership of the underlying business action. Renew it only while the worker still owns the durable lease, and avoid treating renewal success as permission to bypass state checks. If work consistently exceeds the timeout, split it into smaller continuations or adjust the configuration based on measured duration. Track messages that become visible again while an old worker is active, because that overlap is an important recovery test rather than an exceptional impossibility.

## Practice

Run two workers against a queue containing the same run identifier twice. Inject a crash after a tool succeeds and before acknowledgment. Verify that recovery produces one logical result, rejects stale commits and reports duplicate delivery separately from duplicate execution. Then add a per-tenant concurrency limit and demonstrate fair progress for another tenant.

## Completion checklist

- Reference durable job state from queue messages.
- Expect redelivery and claim work conditionally.
- Use leases with stale-worker protection.
- Bound concurrency, retries and backlog age.

Continue with [Safe Retries](/articles/harness-retries-idempotency) and [Resource Budgets](/articles/harness-resource-budgets).

## References

- [Amazon SQS: At-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html)
- [PostgreSQL: Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
