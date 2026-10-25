# Implement Step Limits, Timeouts and Cancellation

An agent can keep producing plausible actions after useful progress has stopped. It can also wait forever for a tool or continue after a user presses cancel. Execution limits make these behaviors governable. Design them as runtime rules with explicit stop reasons, rather than instructions the model is expected to obey voluntarily.

## Use several kinds of limit

A step limit bounds reasoning cycles. A tool-call limit bounds individual operations, including calls returned together in one model response. A deadline bounds wall-clock time. A token or cost budget bounds consumption. These limits catch different failure modes, so one cannot replace all the others. Ten model steps can still launch a hundred parallel tools if the runtime counts only turns.

Set a run deadline when the job is accepted and propagate the remaining time to each operation. A tool timeout should be the smaller of its configured maximum and the remaining run time. Use a monotonic clock for elapsed time inside a process; persist an absolute deadline for recovery across workers. Recalculate remaining time after every wait and retry.

Cancellation needs a durable request, not only a signal in the current web server. Store cancel_requested with the requester and timestamp. Workers check it before model calls, before tool dispatch and at supported interruption points. A web request disconnect should not automatically cancel a durable job unless that behavior is part of the product contract.

## Work through a cancellation race

A user cancels while an agent is waiting for a read-only search. The worker can abort the local request and stop. Now consider cancellation during a remote invoice submission. Closing the connection does not prove the invoice was not created. Mark the action as uncertain, stop further dispatch and reconcile using its stable action identifier.

```text
remaining = run.deadline - now()
if remaining <= 0 or run.cancel_requested:
    stop_before_dispatch()
operation_deadline = min(remaining, tool.maximum_duration)
result = execute_with_abort_signal(operation_deadline)
```

An abort signal is a cooperative mechanism. The called library must honor it, and the underlying operation may already have reached another system. For local child processes, cancellation can require terminating the entire process group and checking that descendants exited. For sandbox workers, ask the execution service to terminate the environment and retain the termination result.

## Reserve time for orderly stopping

Do not spend the entire deadline on the final model call. Reserve time to persist state, reconcile known actions and produce a truthful status. If a run has a sixty-second limit and a tool can consume fifty-nine seconds, your application may lose its opportunity to record the result before infrastructure termination. Choose headroom based on measured storage and shutdown latency.

A budget check must also happen before reserving parallel work. If three tools each need a maximum ten-second execution slot, a scheduler may run them concurrently within a deadline, but it still needs sufficient capacity and accounting. Do not treat a cancellation check at the start of the batch as valid for tools dispatched much later.

## Report useful stop information

Return a structured reason such as step_limit, deadline or cancelled_by_user. Include completed artifacts and unresolved actions when access rules permit. The agent's final prose should reflect the recorded state. Avoid asking a model to invent a completion summary when the runtime no longer has budget for another call; a deterministic status message is acceptable.

Metrics should separate useful completion from limit exhaustion. Frequent step-limit stops can indicate weak task decomposition, a failing dependency or a budget that is too small. Raise limits only after examining traces. Otherwise the change may increase cost while preserving the original failure pattern.

## Check infrastructure limits too

Application deadlines must fit inside hosting and queue constraints. A worker cannot perform orderly cleanup after its platform forcibly terminates the process. Keep the runtime deadline shorter than the infrastructure limit, and monitor shutdown paths under load. If your task legitimately needs hours, divide it into durable continuations rather than stretching one request beyond its intended lifetime. Persist the remaining logical budget across those continuations so a session reset cannot accidentally grant another full allocation.

## Practice

Build a fake tool that ignores cancellation for five seconds, another that cooperates immediately and a third that records an external side effect before delaying its response. Cancel each run at a known time. Verify that no later tool starts, that durable state records what remains unknown and that a restarted worker respects the cancellation request.

## Completion checklist

- Count model turns and tool operations separately.
- Propagate remaining deadlines through retries and waits.
- Persist cancellation and stop future dispatch promptly.
- Reconcile external effects instead of assuming abort means rollback.

Continue with [Safe Retries](/articles/harness-retries-idempotency) and [Token, Cost and Runtime Budgets](/articles/harness-resource-budgets).

## References

- [Node.js: AbortController and AbortSignal](https://nodejs.org/api/globals.html#class-abortcontroller)
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
