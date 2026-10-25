# Manage Retries Without Repeating Consequential Actions

Retries are straightforward until an operation changes something outside the harness. If a network connection fails after a service creates a ticket, repeating the request may create another ticket. The runtime sees a failure to receive a response, not necessarily a failure to perform the action. Reliable retry design starts by preserving that uncertainty.

## Classify operations and errors

Separate read-only operations from writes, and separate deterministic validation failures from transient service failures. A schema error should not be retried with identical input. A rate limit may be retryable after a delay. A timeout during a write requires reconciliation unless the external interface provides a suitable idempotency contract.

Assign a stable logical action identifier before dispatch. Keep it across retries of that action and use a different attempt identifier for each network attempt. Where the provider supports idempotency keys, derive the key from the persisted action identity, not a fresh random value on each attempt. Verify the provider's retention window and behavior when the same key is used with different arguments.

Store an argument digest with the action. If the model changes the recipient, amount or destination, that is a new action requiring fresh validation and authorization. Reusing an old idempotency key for changed input can produce an error or return the result of the earlier request, depending on the service contract.

## Trace an ambiguous ticket creation

An agent is authorized to create one support ticket. The harness commits action A17, its validated arguments and a pending state. It sends the request using A17 as the idempotency key. The service creates ticket T88, but the response is lost. The harness records unknown rather than failed-to-create.

```text
persist(action_id, argument_hash, status="prepared")
try:
    result = provider.create(arguments, idempotency_key=action_id)
    persist_result(action_id, result)
except timeout:
    mark_uncertain(action_id)
    result = reconcile_or_retry_same_action(action_id)
```

If the provider supports looking up the operation by action identifier, reconciliation can discover T88. If its idempotent API safely returns the original outcome, a retry can do the same. If neither exists, automatic repetition may be unsafe. Escalate with a clear record of the attempted action instead of pretending the harness can guarantee exactly-once behavior across arbitrary systems.

## Couple local state carefully

A database transaction can atomically store a pending action and enqueue an outbox record in the same database. A separate dispatcher reads the outbox and performs the remote operation. This prevents a crash between committing application state and publishing a work message from silently losing the action. It does not make the remote write part of your local database transaction.

Likewise, a unique constraint can deduplicate local action records, but it cannot undo two remote writes that already happened. Document which guarantee belongs to local persistence, which belongs to the provider and which remains a reconciliation responsibility. Avoid using “exactly once” as a blanket description of a system with multiple independent failure boundaries.

## Bound the retry policy

Use a maximum number of attempts and an overall deadline. Add exponential backoff with jitter for transient failures so many workers do not retry in lockstep. Honor service-provided retry guidance when available. Check current cancellation and authorization before every retry; an earlier allowed attempt does not justify continuing after access was revoked.

Record each attempt with its classification, delay and result. Report logical actions separately from attempts in operational metrics. A high eventual success rate can conceal a retry storm that increases latency and loads a struggling dependency. Measure duplicate external effects and unresolved actions directly.

## Design compensations honestly

Some effects can be compensated, but compensation is another operation with its own failure modes. Deleting a duplicate draft may be straightforward; retracting a message does not guarantee recipients never saw it. Define compensation only where the external system supports an appropriate business action, and authorize it explicitly. Preserve the original effect and its compensation as separate records. This prevents incident reports from rewriting history as though a confirmed action never happened, and helps reviewers understand residual consequences.

## Practice

Implement a fake ticket provider that creates a ticket and drops the first response. Run your harness with and without stable idempotency keys. Add a crash after the provider succeeds but before the local result commit. Show that recovery identifies the original ticket, and document what your runtime does when the provider cannot reconcile an action.

## Completion checklist

- Preserve logical action identity across network attempts.
- Distinguish uncertain outcomes from confirmed failures.
- Keep argument digests and provider idempotency semantics explicit.
- Bound retries and recheck policy before repeating execution.

Continue with [Checkpoints and Resume](/articles/harness-checkpoints-resume) and [Queues, Workers and Concurrency Controls](/articles/harness-queues-workers-concurrency).

## References

- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Amazon SQS: At-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html)
