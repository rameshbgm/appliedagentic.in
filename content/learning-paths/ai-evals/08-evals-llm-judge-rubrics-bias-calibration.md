# LLM-as-Judge: Rubrics, Bias and Calibration

A language-model judge can assess qualities that are difficult to capture with simple assertions: whether an explanation addresses the question, whether a summary preserves a qualification or whether a response uses evidence appropriately. The judge is still another fallible system. Its outputs become useful measurement only after you define the task, calibrate its decisions and inspect its failure patterns.

Beacon's team wants to grade answers that summarize several handbook passages. A keyword check cannot reliably determine whether the answer reverses an exception. The team therefore builds a judge that sees the question, allowed evidence, candidate answer and an anchored rubric. It does not receive the candidate's model name or the developer's preferred outcome.

## Give the judge a bounded job

Ask for specific judgments rather than “overall quality.” For example, identify material claims, match them to evidence and flag contradictions. Require a structured result with the criterion, decision and short supporting evidence span. The explanation is a review aid; it does not prove the judgment is correct.

Keep the rubric concise enough to interpret consistently. Each level needs observable anchors. “Excellent” is not an anchor. “All material claims are supported by the provided passages, and no exception is omitted” is more operational. Where the rubric cannot resolve a case, allow an uncertain or needs-review result instead of forcing a confident number.

Treat candidate text as data. A malicious answer may contain instructions asking the judge to assign a perfect score. Delimit the answer, state the trusted grading instructions separately and test this attack explicitly. A judge that follows candidate instructions cannot provide dependable evaluation evidence.

## Calibrate against reviewed cases

Build a calibration set with straightforward examples and difficult boundaries. Have qualified reviewers label it using the same rubric and evidence. Resolve ambiguous cases before treating their labels as reference judgments. Keep a separate validation portion so you do not repeatedly tune the judge against every available example.

Compare the judge with the reviewed labels. Inspect false acceptances and false rejections separately. A judge that often accepts unsupported claims can be dangerous even if it agrees on most easy cases. Report results by criterion and by relevant slices such as long answers, conflicting policies and missing evidence.

Agreement statistics can summarize behavior. Cohen's kappa, for example, adjusts observed agreement using expected agreement from label frequencies. It is not a measure of objective truth and can behave differently under skewed label distributions. Always inspect the confusion table and examples alongside any agreement score.

## Worked example: agreement hides the costly error

Imagine a reviewed set of one hundred answers. Eighty are acceptable and twenty contain unsupported policy claims. The judge accepts all eighty good answers and also accepts ten bad answers. Its raw agreement is ninety percent, but it misses half of the unsupported-claim cases.

If that judge controls a release gate for grounding, overall agreement is a poor primary criterion. The team should investigate false acceptance, strengthen rubric anchors and test the revised judge on untouched reviewed cases. These are illustrative counts; the acceptable tradeoff depends on the product's consequences and review process.

For pairwise judging, randomize candidate order and repeat with the order reversed on a sample. If judgments change substantially, position may be influencing results. Hide model and configuration labels. Normalize presentation only when doing so does not remove meaningful quality differences. Record the judge model, prompt, rubric and settings because changing any of them changes the measurement.

## Practice

Create twelve reviewed answer examples: four correct, four unsupported and four ambiguous. Write an evidence-grounding rubric and a structured judge prompt. Compare its decisions with your labels, then review every disagreement. Add two candidate answers containing instructions to the judge and verify that those instructions do not influence the verdict.

## Completion checklist

- The judge evaluates explicit criteria using supplied evidence.
- Calibration includes difficult negative examples and uncertainty.
- False acceptances and false rejections are reported separately.
- Candidate identity and order are controlled in comparisons.
- Judge versions and prompt-injection tests are retained.

## Continue learning

Continue with [the next lesson](/articles/evals-automated-grading-human-review). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [scikit-learn: Cohen kappa score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.cohen_kappa_score.html)
- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
