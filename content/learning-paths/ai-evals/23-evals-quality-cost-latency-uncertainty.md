# Interpret Quality, Cost, Latency and Uncertainty

An evaluation report should help someone make a decision. A single quality score rarely contains enough information. Two agents can pass the same number of tasks while failing different requirements, consuming different budgets and exposing users to different delays. A useful scorecard keeps those dimensions visible and explains the uncertainty around the observed results.

Beacon's team compares a concise agent with a more deliberative configuration. The second agent retrieves more evidence and retries some failed tool calls. It may improve task success while increasing latency and cost. Whether that is worthwhile depends on the product's operating constraints and the severity of remaining failures.

## Define denominators and units

Report task counts, trial counts, invalid runs and the relevant sampling frame. “Ninety percent success” should identify ninety percent of what. A balanced stress suite, a representative workload sample and a release regression suite answer different questions even when all produce percentages.

For cost, include the components your decision requires: model usage, retrieval, external tools and infrastructure if material. Distinguish estimated provider charges from measured billed amounts. Record pricing assumptions and dates rather than treating cost estimates as timeless facts. This lesson uses illustrative cost units to avoid implying current vendor pricing.

For latency, measure from the user's request to the defined completion event. Also inspect component spans to diagnose bottlenecks. A final answer arriving quickly may still precede an unfinished external action, so completion needs an explicit definition. Report timeouts separately instead of removing them from latency summaries without explanation.

## Show distributions and tradeoffs

A median can hide slow tail behavior. Include relevant percentiles or a small distribution summary, with sample counts. High percentiles estimated from tiny samples are unstable; do not report several decimal places that imply unsupported precision.

Keep mandatory safety or authorization failures outside an average quality tradeoff. A faster agent with one observed unauthorized write does not become acceptable because its prose score is higher. The release policy should state which boundaries block launch and which dimensions permit balancing.

For stochastic outcomes, provide an interval or another uncertainty description appropriate to the design. Binomial methods apply under particular assumptions; repeated trials on the same tasks may require clustered analysis. A narrow-looking interval from incorrectly treating correlated runs as independent can mislead reviewers.

## Worked example: compare complete operating policies

Suppose two configurations run the same forty tasks with three trials each. Configuration A succeeds on ninety of one hundred twenty trials, uses a median of five cost units and has a median latency of six seconds. Configuration B succeeds on one hundred two trials, uses nine cost units and has a median latency of eleven seconds. All values are invented for this exercise.

B improves observed trial success by ten percentage points while using more resources. Inspect task-level changes and tail latency before recommending it. If B's gain comes entirely from repeated attempts on a few cases, the improvement may not generalize broadly. If A fails common tasks and B fixes them, the benefit may be practically important despite the additional cost.

Now add one unauthorized-read event in B. The decision changes under a policy that blocks such events. The scorecard should expose the violation directly rather than burying it inside the remaining eighteen failed trials. A report that makes this easy to see is more valuable than a visually impressive composite score.

## Communicate limits candidly

Write a short decision statement: what the evidence supports, what remains uncertain and what action follows. Avoid interpreting “no observed failures” as proof of zero risk. A finite suite can fail to expose a defect. State coverage gaps and the planned monitoring or additional assessment needed for the intended deployment scope.

## Practice

Create a scorecard for two fictional candidates. Include per-task outcomes, invalid runs, median and tail latency, resource usage and mandatory-boundary events. Write a recommendation for a low-volume internal tool, then reconsider it for a latency-sensitive workflow. Explain which operating constraint changes the decision.

## Completion checklist

- Counts, units and sampling frames accompany every summary.
- Cost assumptions and latency completion events are explicit.
- Distributions expose tail behavior and timeouts.
- Uncertainty methods match task and trial dependence.
- The recommendation states practical tradeoffs and remaining gaps.

## Continue learning

Continue with [the next lesson](/articles/evals-capstone-release-readiness-report). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [SciPy: binomtest and proportion confidence intervals](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binomtest.html)
- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
