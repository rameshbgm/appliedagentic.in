# Compare Models, Prompts and Agent Configurations Fairly

A configuration comparison should answer a specific decision: should this team replace its current agent setup with a proposed alternative under defined operating conditions? The candidate may change a model, prompt, retrieval setting, tool description or retry policy. Fairness means making those differences explicit and controlling other conditions well enough to interpret the result.

Beacon's team wants to compare a revised prompt with the current prompt. If the revision runs against a newer corpus, gets a larger execution budget and is evaluated by a different judge, a higher score cannot be attributed to the prompt. It measures a bundle of changes. That bundle may still be worth shipping, but the report must describe it accurately.

## Name the experimental question

Write the candidate difference and intended benefit. “Improve answers” is broad. “Reduce unsupported policy exceptions without increasing unnecessary abstention” produces clearer metrics and cases. Specify which requirements remain mandatory and which tradeoffs are acceptable.

Record the complete configurations: model identifier, instructions, retrieval index snapshot, tool schemas, sampling settings, context limits, retry policy and grader versions. A model alias that changes behind the scenes weakens reproducibility; retain provider-returned version information where available and disclose unresolved variability.

Decide whether budgets are equal or operationally realistic. An equal-cost comparison answers one question; a comparison at each configuration's intended production settings answers another. Report tool calls, usage and latency so readers can see what additional resources purchased any quality gain.

## Use paired cases and preserve outcomes

Run both candidates on the same case snapshot and reset fixtures. Pair results by case and trial plan. This reduces confusion from task-mix differences. When environmental load varies over time, interleave or randomize candidate execution order rather than running all baseline trials during quiet hours and all candidate trials during peak load.

Keep case-level transitions: both pass, baseline-only pass, candidate-only pass and both fail. An aggregate increase can hide regressions on important cases. Slice by task family, permission scope, ambiguity and other relevant labels defined before inspecting the results.

Avoid choosing the best-looking subset after the run and presenting it as the primary result. Exploratory slices can reveal useful hypotheses, but label them as exploratory and test important findings on fresh cases. Repeatedly testing many candidates against one holdout gradually turns it into development data.

## Worked example: the same total hides different behavior

On fifty shared cases, both candidates pass thirty-five. The baseline alone passes five, the candidate alone passes seven and both fail three. Baseline success is forty out of fifty; candidate success is forty-two out of fifty. The candidate gains two net cases but regresses on five previously successful cases.

Inspect those five before recommending release. If two involve unauthorized document access, a small aggregate improvement does not resolve the mandatory-boundary failure. If all five are marginal style judgments with a poorly calibrated grader, repair the measurement before drawing conclusions.

For stochastic agents, repeat trials under the same plan and report uncertainty. A small difference may be compatible with random variation. A paired statistical method may be appropriate depending on the data and assumptions; explain the method rather than applying an independent-proportions test automatically to correlated results. Include practical effect size as well as statistical evidence.

## Practice

Compare two prompts on twelve fixed cases with three trials per case. Interleave execution order, preserve all traces and report the four outcome categories. Add quality, abstention, cost and latency columns. Write a recommendation that names one benefit, one regression and one limitation of the sample, then specify what additional evidence would resolve the uncertainty.

## Completion checklist

- The comparison tests an explicit decision and candidate change.
- Cases, fixtures and graders are shared across candidates.
- Budgets and execution order are controlled or disclosed.
- Paired regressions remain visible alongside net gains.
- Uncertainty and holdout reuse limit the strength of conclusions.

## Continue learning

Continue with [the next lesson](/articles/evals-regression-ci-release-gates). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [SciPy: binomtest and proportion confidence intervals](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binomtest.html)
- [pytest: How to use fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html)
