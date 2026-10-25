# Compare Harness Versions Using the Same Evaluation Suite

A harness change can improve reliability, increase overhead or shift failures into a different part of the workflow. Compare versions using controlled evaluations rather than a few memorable demonstrations. Keep the task set, environment and grading rules stable enough to isolate the change while acknowledging that model-driven runs remain variable.

## Define the comparison question

Choose one meaningful change, such as adding action reconciliation, changing context compaction or introducing a new scheduling policy. State the expected benefit and possible cost. For example, reconciliation should reduce duplicate external effects after lost responses, but may increase recovery latency and provider calls.

Freeze the evaluation dataset, document fixtures, tool schemas, model configuration and sandbox image for the comparison. Record all versions. If you change the model and harness together, you are comparing complete configurations rather than measuring the harness change alone. That can be useful, but label the conclusion accurately.

Use separate development cases and held-out cases. Debugging against every test until it passes can overfit the suite. Add production failures as regression cases when appropriate, while preserving independent coverage for behaviors you did not optimize directly.

## Build outcome and process measurements

Measure whether the requested artifact is correct, citations resolve and external effects are authorized. Add operational metrics such as duplicate effects, unresolved actions, recovery success, latency and resource use. Trace-level checks can identify policy bypasses or unnecessary tool loops even when the final document looks acceptable.

```text
for case in fixed_suite:
    for version in randomized_order([baseline, candidate]):
        environment = reset_fixture(case)
        result = run_agent(version, case, environment)
        grades = grade_outcome_and_invariants(result, environment)
        save_trial(case, version, result.trace_id, grades)
```

Reset state between trials. Otherwise one version may benefit from cached documents or an artifact created by the other. Keep external services mocked or isolated where necessary to avoid real duplicate writes and uncontrolled costs. Record environmental failures separately so they do not disappear into a generic task-failure category.

## Interpret repeated trials

Run multiple trials for tasks with variable model behavior. Report trial counts, success rates and uncertainty rather than presenting one percentage as a precise universal truth. Pair results by task where the design supports it, and inspect whether improvements are concentrated in one easy category while harder tasks regress.

For a teaching example, suppose the baseline creates duplicate mock publications in four of twenty injected lost-response trials, while the candidate creates none in twenty. That is encouraging evidence for this fixture and sample, not proof that duplicates are impossible. Inspect the action records and test other crash boundaries before making a broader reliability claim.

## Make release decisions explicit

Define non-negotiable invariants before running the comparison. A candidate that is faster but permits cross-tenant access should fail the release gate regardless of average score. For quality and efficiency trade-offs, specify acceptable ranges and review material regressions. Do not hide a severe failure behind a weighted aggregate that happens to remain positive.

Keep representative traces from successes and failures. Aggregate metrics tell you whether behavior changed; traces help explain why. If the candidate improves only because its prompt includes answers from the test set, the apparent gain does not reflect a better runtime. Review contamination and grader weaknesses alongside implementation changes.

## Preserve a reproducible comparison record

Save the evaluation configuration, randomized order, fixture hashes and grader versions with the results. If an external dependency changes, record the change and decide whether the affected trials remain comparable. Keep raw trial outcomes accessible under appropriate permissions so reviewers can recompute aggregates. A release recommendation should explain both observed gains and remaining blind spots, including task categories absent from the suite. This makes the evaluation useful for the next harness change instead of a one-time score with no recoverable context.

## Practice and deliverables

Compare your capstone runtime before and after adding crash-safe action reconciliation. Use ordinary tasks, duplicate queue deliveries, stale approvals and lost provider responses. Produce a table with trial counts, task success, duplicate effects, unresolved actions, latency and consumption. Include one trace explaining a remaining limitation and a clear release recommendation tied to your acceptance criteria.

## Completion checklist

- Change one factor or label full-configuration comparisons accurately.
- Reset environments and preserve held-out coverage.
- Report repeated-trial evidence and uncertainty.
- Gate releases on critical invariants and inspect failure traces.

Review [Completion Checks and Recovery](/articles/harness-completion-recovery) and [Tracing Agent Execution](/articles/harness-tracing-execution) when interpreting results.

## References

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
