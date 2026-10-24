# Evaluate Recovery from Tool and Environment Failures

Production tools do not always return a clean success or failure. A request can time out after a write commits. A search index can be unavailable. A worker can stop between saving progress and reporting completion. Recovery evaluation tests how the agent and its runtime behave under these controlled disruptions. It should reveal duplicate actions, lost progress and misleading success claims.

Beacon creates a follow-up task after retrieving policy evidence. The evaluator simulates a tracker timeout after the record has already been stored. A naive retry can create a duplicate. A useful recovery policy checks the operation's identity or reconciles state before deciding whether to repeat the action.

## Specify the failure model

A test should identify where the failure occurs and what state remains. “The tool fails” is incomplete. Distinguish rejection before execution, timeout during execution, timeout after commit, malformed response and partial result. Each produces a different recovery problem.

Use controlled fakes or fault injection in isolated infrastructure. Python's mock library supports replacing dependencies and specifying behavior; the important design principle is to make the failure reproducible. For stateful workflows, a realistic fake that stores records may reveal more than a stub that always returns a fixed string.

Keep a separate category for failures in the evaluation infrastructure. If the runner cannot initialize the fixture, that trial has not meaningfully tested the agent's recovery. Report it as invalid or infrastructure failure according to the run policy. Do not silently remove it from the denominator without explanation.

## Grade the recovery contract

Define permitted retries, execution budgets and escalation rules. A transient read failure may permit a bounded retry. A protected write with uncertain completion may require state reconciliation. A permanent permission denial should not trigger repeated attempts with broader credentials.

Inspect final state as well as messages. The agent should not report success when the record is absent, nor report complete failure when it has created the requested record but cannot retrieve a confirmation. The correct response may explain uncertainty and provide a safe next step.

Check whether repeated execution remains one logical action. An idempotency key or equivalent application mechanism can help, but the evaluation should verify the observed effect rather than assume the mechanism works. Replaying the same request should not produce a second task if the contract requires uniqueness.

## Worked example: three timeout policies

Policy A retries immediately after any timeout. Policy B never retries and reports failure. Policy C queries by the operation identifier, confirms whether the task exists and retries only when the state permits it.

In an illustrative after-commit timeout case, A creates two tasks, B leaves one correct task but gives a misleading failure message, and C leaves one task with an accurate confirmation. In a before-execution failure, C must still complete the action or explain why it cannot. One favorable scenario is insufficient; test both sides of the uncertainty.

Add boundedness checks. A recovery loop that eventually succeeds after hundreds of calls may violate cost and runtime limits. Record retries, tool calls, elapsed time and termination reason. A cleanly reported, controlled stop can be preferable to an endless attempt to satisfy the request.

## Practice

Implement five deterministic fault scenarios for one action tool: pre-execution rejection, after-commit timeout, malformed response, temporary unavailability and permanent permission denial. Run each from a reset fixture. Verify record counts, unrelated state, retry limits and the accuracy of the final user message. Then repeat the after-commit case with the same logical operation identifier.

## Completion checklist

- Failure timing and surviving state are defined precisely.
- Controlled fakes reproduce each fault consistently.
- Final state and user-facing claims are graded together.
- Retries respect authorization, uniqueness and execution budgets.
- Agent failures are distinguished from broken evaluation infrastructure.

## Continue learning

Continue with [the next lesson](/articles/evals-isolated-evaluation-harness). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Python: unittest.mock](https://docs.python.org/3/library/unittest.mock.html)
- [pytest: How to use fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html)
