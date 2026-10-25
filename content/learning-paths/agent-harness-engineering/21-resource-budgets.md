# Enforce Token, Cost and Runtime Budgets

A runtime budget is an enforceable allocation, not merely a target in the system prompt. Agent workloads can expand through retries, parallel tools and long context. A reliable harness checks available resources before dispatch, reserves capacity for concurrent operations and records actual consumption afterward.

## Separate budget dimensions

Track model tokens, estimated monetary cost, wall-clock duration and tool-specific resources independently. A cheap model call can still take too long; a fast parallel batch can exceed a spending limit. Some tools have their own external charges, so model-token accounting is only part of the total budget.

Use a versioned pricing configuration when translating usage into cost. Record the price assumptions and currency rather than treating estimates as invoices. Provider pricing and billing rules can change, and missing usage data should remain unknown rather than becoming zero. The runtime can use conservative estimates to limit exposure even when exact settlement arrives later.

Define budgets at the run, tenant and service level. A run-level cap controls one job, while tenant and service limits protect shared capacity. Decide whether unused reservations expire, how cancelled operations are settled and who may increase a limit during execution.

## Reserve before parallel dispatch

Suppose a run has ten budget units remaining and proposes three operations estimated to cost four units each. If all workers independently check the same balance, they can collectively overspend. Reserve units atomically before dispatch. Only operations whose reservations succeed may proceed.

```text
estimate = estimate_upper_bound(operation, limits)
reservation = ledger.try_reserve(run_id, estimate)
if not reservation:
    stop_or_choose_smaller_authorized_operation()
try:
    result, usage = execute(operation)
    ledger.settle(reservation, actual_or_conservative_usage(usage))
except uncertain_outcome:
    ledger.keep_or_settle_conservatively(reservation)
```

An upper bound may still be approximate if provider behavior or external charges are not fully predictable. Document that limitation and use safety margins. Do not promise an exact financial cap unless every relevant charge is covered by a reliable pre-execution bound.

## Budget context and retries

Estimate input usage after context assembly, including tool schemas and conversation history. Restrict requested output size to the remaining allocation. A large retrieved document can make the next call expensive even if the model's answer is short. Consider smaller excerpts or deliberate retrieval rather than blindly increasing the budget.

Retries consume the same run allocation unless your product explicitly provides a separate reserve. Count failed and uncertain requests appropriately. A retry storm should hit a limit and surface an operational problem rather than silently spending more because no final answer was produced.

## Design graceful exhaustion

When a budget is nearly exhausted, preserve useful progress and stop before starting work that cannot finish safely. A research assistant can save a partial comparison with a clear list of missing evidence. A publication workflow should not begin an external write if it lacks time to record or reconcile the result under its operating contract.

Reserve a small amount of time and capacity for final state persistence and status reporting. A deterministic summary of completed artifacts can be more reliable than another costly model call. Budget exhaustion should have its own terminal reason so it is not confused with model refusal or a tool outage.

## Prevent budget resets on recovery

Persist consumption and outstanding reservations outside the worker process. A restarted session must not receive a fresh full budget simply because its in-memory counter began at zero. Reconcile abandoned reservations using action state and provider evidence where available. Keep uncertain charges conservative until a defined settlement rule applies. Test concurrent recovery attempts against the same ledger, ensuring that a stale worker cannot release another worker's reservation or settle the same usage twice.

## Practice

Create a ledger with a twenty-unit run budget. Launch four concurrent operations, each reserving six units. Verify that only the permitted subset starts. Add one timeout with unknown usage and one cancellation before dispatch. Show how reservations are settled without double counting, and explain the remaining uncertainty in the cost report.

## Completion checklist

- Track independent resource limits and pricing assumptions.
- Reserve capacity atomically before concurrent work.
- Include retries, context and uncertain requests in accounting.
- Save progress and report budget exhaustion explicitly.

Continue with [Execution Limits and Cancellation](/articles/harness-limits-timeouts-cancellation) and [Queues and Worker Concurrency](/articles/harness-queues-workers-concurrency).

## References

- [PostgreSQL: Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Node.js: AbortController and AbortSignal](https://nodejs.org/api/globals.html#class-abortcontroller)
