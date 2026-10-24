# Evaluate Multi-Step Tasks Across Repeated Runs

One successful run does not establish that an agent will repeat the result. Model sampling, retrieval ranking, tool timing and branching decisions can produce different outcomes from the same task. Repeated trials make that variation visible. They also introduce statistical choices that must be reported carefully, especially when many trials share the same underlying task.

Beacon's team evaluates a workflow that searches two policies, identifies the effective rule and creates a follow-up. A failure at any step can prevent completion. The evaluator runs multiple independent attempts from a reset fixture and saves each outcome, rather than selecting the most convincing demonstration.

## Define the unit of measurement

A task is the problem. A trial is an attempt at that problem. Report both counts. Ten tasks with ten trials each are not the same evidence as one hundred diverse tasks with one trial each. Repeated trials estimate variability for selected tasks; task diversity addresses coverage.

Reset state and allocate independent run identifiers. If a successful trial leaves a tracker task behind, later trials may benefit from that artifact or create duplicates for reasons unrelated to the intended test. Also record whether the environment includes controlled randomness, live external services or simulated failures.

Keep sampling settings and execution budgets fixed when the comparison requires them. A candidate allowed twice as many retries has a different operating policy. That may be worth testing, but include its added cost and latency rather than attributing the result solely to better reasoning.

## Distinguish success measures

Trial success rate is successful trials divided by valid trials. At-least-one success across several attempts answers whether a user could succeed by trying repeatedly. All-attempt success answers a stricter consistency question. These measures are not interchangeable.

Under an illustrative assumption of independent attempts with constant success probability p, the chance of at least one success in k attempts is one minus `(1 - p)` raised to k. The chance that all k succeed is `p` raised to k. Real attempts may be correlated, so these equations explain the distinction rather than automatically justify an estimate for your system.

For p equal to 0.8 and k equal to three, the illustrative at-least-one probability is 0.992, while all-three success is 0.512. A high retry-assisted success rate can coexist with inconsistent individual execution. State which user experience your metric represents.

## Worked example: preserve task differences

Suppose Beacon runs five trials on each of four tasks. Task A passes five, B passes five, C passes four and D passes one. The pooled trial success rate is fifteen out of twenty, or seventy-five percent. That average hides a concentrated weakness on D.

Report the per-task counts and inspect D's failures. Perhaps it contains conflicting effective dates. Add related cases to development and retain separate assessment examples. Do not simply increase retries until the difficult task eventually passes and then report only that success.

For uncertainty, a binomial interval can describe a success proportion when its assumptions fit. Trials clustered within tasks require care: treating all correlated trials as independent can understate uncertainty. For broader task-level conclusions, resampling by task or another appropriate clustered method may be more defensible. Explain the method and avoid precision unsupported by the sample.

## Practice

Run four tasks five times each using reset fixtures. Produce a table containing passes, failures, termination reasons, cost and latency by task. Compare trial success, at-least-one success and all-trial success. Identify one failure cluster and propose a new case that tests the suspected cause without duplicating the original wording.

## Completion checklist

- Reports distinguish task counts from trial counts.
- Every trial starts from a controlled, reset state.
- Retry budgets and success definitions are explicit.
- Per-task results reveal concentrated weaknesses.
- Uncertainty calculations state assumptions and clustering limits.

## Continue learning

Continue with [the next lesson](/articles/evals-retrieval-relevance-coverage). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [SciPy: binomtest and proportion confidence intervals](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binomtest.html)
- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
