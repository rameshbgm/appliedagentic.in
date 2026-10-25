# Combine Automated Grading with Human Review

Automated grading makes repeated evaluation practical, but it does not eliminate the need for human judgment. Reviewers help define success, resolve ambiguous evidence and detect grader behavior that a dashboard can hide. The useful question is not whether humans or automation are better in general. It is which decisions each can make reliably, at what cost and with what evidence.

Beacon's suite contains deterministic state checks, a language-model grounding judge and expert review of selected cases. The design goal is to route attention deliberately. Every case should have a clear grading path, and the final report should distinguish automated observations from reviewed conclusions.

## Build a layered workflow

Run inexpensive checks first: fixture validity, output schema, required source identifiers and prohibited tool events. Invalid fixtures should stop grading rather than consume reviewer time as apparent agent failures. Deterministic failures can often be diagnosed directly from evidence.

Next, run language-based checks for claims that require interpretation. Preserve the judge's criterion-level result and evidence. Route uncertain judgments, disagreement between graders and designated high-consequence cases to human review. Avoid a workflow in which the model judge decides which of its own mistakes deserve inspection without any independent sampling.

Include a random sample of apparently passing cases. Otherwise, the team may discover false failures but never notice false passes. Add targeted sampling for known weak slices such as conflicting documents, long traces or permission boundaries. Keep the sampling rules in the report so readers understand what human review actually covered.

## Give reviewers a usable evidence package

A reviewer needs the user request, relevant fixture facts, candidate output, trace summary and the rubric. Hide the candidate identity when practical. If the reviewer sees “new model” or “approved release,” expectations can affect the decision.

Decide whether reviewers see automated grades before labeling. For an independent agreement study, they should generally label first without those grades. For debugging, seeing the automated explanation may be useful. These are different activities and should not be mixed in one agreement statistic.

Use short structured reasons for decisions. A reviewer who marks an answer wrong should identify the unsupported claim or violated requirement. Preserve room for an “ambiguous case” classification. Forcing all uncertainty into pass or fail encourages inconsistent labels and conceals defects in the task definition.

## Worked example: review changes the interpretation

Suppose a suite contains two hundred trials. Automated grading reports one hundred eighty passes. The team reviews all twenty failures plus a random sample of thirty passes. Reviewers confirm fifteen failures, find five grader false rejections and discover three false acceptances among the sampled passes.

The team can correct the specifically reviewed labels, but it should not claim that the remaining one hundred fifty unreviewed passes are now verified. Report the automated score, reviewed sample findings and any estimate with its sampling assumptions. If the three false acceptances reveal a systematic rubric defect, repair the grader and rerun the entire suite rather than patching only visible examples.

When reviewers disagree, use adjudication. A third reviewer or designated domain owner examines the evidence and records the rationale. Do not simply average contradictory labels for a mandatory safety requirement. Determine whether the issue lies in the response, rubric or source policy.

## Keep feedback from contaminating measurement

Human review often generates improvements to prompts and graders. That is useful development work. After a case has driven those changes, do not keep presenting it as untouched validation evidence. Maintain separate reviewed development and validation collections, and rotate new cases into assessment as the workflow matures.

## Practice

Design a review plan for one hundred evaluation cases with a limited reviewer budget. Specify which cases receive mandatory review, which are randomly sampled and which disagreements trigger adjudication. Write a reviewer form with criterion, decision, evidence span and ambiguity reason. Test the form with two reviewers on ten cases before scaling it.

## Completion checklist

- Review routing combines mandatory, uncertain and sampled cases.
- Reviewers receive the evidence needed to apply the rubric.
- Independent labeling is separated from assisted debugging.
- Disagreements produce an adjudicated rationale or case repair.
- Reports disclose the extent and limitations of human review.

## Continue learning

Continue with [the next lesson](/articles/evals-outcomes-execution-traces). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [scikit-learn: Cohen kappa score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.cohen_kappa_score.html)
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
