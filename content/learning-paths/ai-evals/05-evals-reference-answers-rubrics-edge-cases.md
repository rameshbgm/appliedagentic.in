# Build Reference Answers, Rubrics and Edge Cases

A reference answer can be useful and still be too narrow. If Beacon answers “seven calendar days” while the reference says “7 days,” a string comparison may reject correct work. The opposite mistake occurs when a broad language judge accepts a fluent answer that omits the deadline. Good reference material describes the facts, permissible interpretations and prohibited conclusions separately from one example response.

This lesson builds a scoring contract for a fictional retention-policy question. The objective is not to produce a beautiful model answer. It is to make different graders reach defensible judgments from the same evidence, including when the agent produces an unexpected but valid response.

## Store facts independently of prose

Start with a fact sheet. Include the effective policy identifier, applicable population, retention limit, relevant exceptions and the evidence location. Then add one or more example responses illustrating acceptable wording. Mark them as examples rather than exhaustive templates.

For numerical answers, define units and tolerances deliberately. A calculated amount may permit a rounding tolerance, while a policy deadline often requires an exact value. Date comparisons need an explicit timezone and boundary convention. Otherwise, two graders may disagree because one interprets “by Friday” as the beginning of the day and another as the end.

If a response must cite evidence, specify what makes the citation valid: an allowed source identifier, a resolvable location and support for the associated claim. Merely containing a familiar document title is weaker than linking the correct passage. Separate citation format from evidential support.

## Anchor a rubric

A rubric translates judgment into observable levels. For evidence use, a simple teaching rubric might award zero for unsupported central claims, one for partially supported claims and two when every material claim is supported by the supplied policy. Add concrete examples at each level so reviewers understand the intended boundary.

Avoid mixing unrelated dimensions inside one criterion. “Accurate, concise and friendly” is difficult to score consistently because an answer can satisfy some parts and fail others. Keep factual completeness, evidence support and presentation separate. Then state how mandatory checks combine with graded dimensions.

Rubrics should also explain abstention. When the fixture lacks the necessary date, a targeted clarification may be fully correct. When the date is available, unnecessary clarification may be a failure to use evidence. The same sentence can receive different judgments depending on the case state.

## Worked example: a boundary table

Consider four variants of one task. The first contains a current seven-day policy. The second contains an expired fourteen-day policy and the current seven-day replacement. The third contains two current policies applying to different populations. The fourth omits the user's population.

A rigid reference sentence of “Seven days” only fits the first case. The second additionally tests selection of the effective policy. The third requires identifying the relevant population. The fourth should accept clarification rather than guessing. Write the expected behavior for each variant before generating responses. These are genuinely different reasoning boundaries, not simply paraphrases.

Now ask two reviewers to score ten synthetic answers. If they disagree on three, inspect the disagreements. A disagreement may expose an ambiguous rubric, a missing fact or a valid alternative that the author overlooked. Calculate agreement if useful, but do not treat the statistic as a replacement for examining the actual cases.

## Practice

Choose one factual task and write a fact sheet, two valid response examples and two invalid examples. Create a three-level rubric for evidence quality. Add four boundary variants that change the expected behavior. Have a second reviewer score the examples without seeing your original labels, then update the rubric with specific clarifications rather than broad instructions to “be stricter.”

## Completion checklist

- References distinguish required facts from example wording.
- Numerical units, tolerances and date boundaries are explicit.
- Rubric levels have observable anchors and examples.
- Missing information and conflicting evidence have accepted branches.
- Reviewer disagreements produce documented rubric improvements.

## Continue learning

Continue with [the next lesson](/articles/evals-dataset-versions-leakage-coverage). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Python: unittest](https://docs.python.org/3/library/unittest.html)
- [scikit-learn: Cohen kappa score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.cohen_kappa_score.html)
