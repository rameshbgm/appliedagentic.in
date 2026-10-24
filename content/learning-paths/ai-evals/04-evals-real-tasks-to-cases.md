# Turn Real User Tasks into Evaluation Cases

A dataset built entirely from the developer's favorite examples can make an agent look reliable while missing the work users actually do. Real tasks introduce incomplete wording, uncommon document names, conflicting constraints and inconvenient tool states. Turning those requests into evaluations requires more than copying a conversation. You need to preserve the decision problem and reconstruct the conditions under which a correct outcome is possible.

Beacon's team wants to evaluate a handbook research workflow. They begin with a small collection of permissioned, appropriately handled support requests and interviews with staff. They do not treat raw production text as automatically suitable for a test corpus. Personal details, customer identifiers and secrets need explicit handling before examples enter shared development infrastructure.

## Preserve intent and reconstruct state

For each candidate request, identify the user's goal, relevant evidence and expected final state. A question such as “Can I keep this file until Friday?” requires dates and policy context. Replacing every date with an arbitrary placeholder can destroy the reasoning problem. Instead, create a synthetic but coherent timeline that preserves the same relationship between export date, deadline and requested extension.

The fixture should contain the documents and tool results needed to solve the task. Record effective dates, document identifiers and permission scope. If the case depends on a tool failure, define the failure intentionally. A live endpoint that sometimes changes its response is a poor foundation for a regression case unless testing that live integration is the explicit purpose.

Write the accepted outcome before running the candidate. Include valid alternatives where needed. A request with an unknown export date may require clarification. A test author should not invent a date merely to make the task easy to score.

## Sample the workload deliberately

Create coverage labels that reflect meaningful differences: task family, document type, ambiguity, language, permission scope and consequence level. Avoid collecting dozens of paraphrases of one easy case while leaving another workflow untested. Similar wording can be useful for robustness testing, but it should not masquerade as broad task diversity.

Use separate collections for representative workload and stress cases. Representative sampling helps estimate expected behavior for the selected workload. Stress cases help discover weaknesses at difficult boundaries. Combining them into one unlabeled average makes the result hard to interpret because the mix no longer has a clear meaning.

When the production workload is unknown, state that limitation. Start with a structured coverage plan and update it as usage becomes observable. An honestly scoped dataset is more useful than a large collection whose origin and relevance cannot be explained.

## Worked example: avoid duplicate evidence

Suppose the team collects sixty requests. Thirty refer to the same retention policy using slightly different wording. Another fifteen ask who owns a document. Ten require comparing effective dates, and five involve access restrictions.

If all sixty count equally, retrieval of the retention policy dominates the result. The team creates a workload report preserving the observed frequencies and a capability report with balanced task families. They group near-duplicate requests by underlying policy and goal so related variants stay together when splitting development and holdout sets. This prevents a paraphrase of the same task from appearing on both sides and giving a misleading impression of generalization.

Each case receives a provenance record: source category, transformation steps, reviewer, fixture version and intended coverage. Store sensitive provenance separately if access restrictions require it. The public-facing test case should contain only what its runners and reviewers are authorized to see.

## Practice

Collect twelve fictionalized tasks from one workflow. Group them by underlying user goal rather than surface wording. Construct four runnable fixtures, including one missing-data case and one permission boundary. Ask another person to solve the cases using only the fixture. If they need undocumented background knowledge, either add that evidence or make the uncertainty part of the expected outcome.

## Completion checklist

- User intent survives anonymization and synthetic reconstruction.
- Every task has sufficient, versioned starting evidence.
- Coverage labels describe meaningful workflow differences.
- Near-duplicate task families remain grouped during splitting.
- Provenance and access restrictions are documented.

## Continue learning

Continue with [the next lesson](/articles/evals-reference-answers-rubrics-edge-cases). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [pytest: How to use fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html)
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
