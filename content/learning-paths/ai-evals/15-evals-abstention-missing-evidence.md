# Test Abstention When Evidence Is Missing

An assistant that always answers will eventually invent facts. An assistant that always declines will avoid many factual errors while providing little value. Abstention evaluation measures whether the system distinguishes answerable requests from those needing clarification, additional evidence or escalation. The goal is appropriate action under uncertainty, not a high refusal rate.

Beacon receives, “Can I keep the export until Friday?” The corpus contains a seven-day retention rule, but the export date is missing. A confident yes or no would require an assumption. A useful response asks for the export date and explains why it matters, without demanding irrelevant personal information.

## Label answerability from the fixture

Decide whether the supplied evidence is sufficient for the requested conclusion. This judgment belongs to the case definition, not to the agent's expressed confidence. A fluent answer can be unsupported; a hesitant answer can still have enough evidence available.

Create separate case categories. Answerable cases contain sufficient, nonconflicting evidence. Missing-variable cases require a targeted clarification. Missing-source cases require a statement that the policy was not found. Conflicting-source cases may require identifying the conflict and escalating to the owner. Permission-limited cases require respecting the access boundary rather than obtaining the answer through another user's scope.

Do not combine all categories into one generic “cannot answer” label. The correct next step differs. A question about an unknown date can be clarified; a restricted policy may require an approved access process; an unresolved contradiction may need a domain owner.

## Measure usefulness and restraint together

Report answer accuracy among answerable cases and appropriate abstention among unanswerable cases. Also measure unnecessary abstention: cases where enough evidence was present but the agent declined. This prevents a refusal-only system from appearing strong.

For clarification cases, assess whether the requested information is necessary and sufficient to continue. “Please provide more context” is often too vague. “What date was the export created?” identifies the missing variable. If the agent asks for a passport number to answer a retention question, the clarification itself creates an inappropriate data request.

For abstention text, check that the agent does not quietly include the unsupported answer after its disclaimer. “I cannot confirm, but it is probably fourteen days” still exposes the user to an invented policy. Grade the substantive claims, not merely the presence of uncertainty words.

## Worked example: a balanced scorecard

Suppose a teaching suite has twenty answerable cases and twenty insufficient-evidence cases. Beacon correctly answers eighteen of the first group and unnecessarily declines two. It handles sixteen insufficient-evidence cases appropriately and guesses in four.

The report shows ninety percent correct answering, ten percent unnecessary abstention, eighty percent appropriate handling of insufficient evidence and twenty percent unsupported guessing in that group. A single overall score would obscure the tradeoff. Add category-level results to distinguish missing dates from conflicting sources; the agent may handle one well and the other poorly.

Do not interpret the forty-case mixture as the expected production frequency of insufficient evidence unless its sampling reflects production. The balanced suite is useful for capability diagnosis. A workload estimate requires representative sampling or explicit weighting.

## Test recovery after clarification

A clarification is only part of the interaction. Add a second turn that supplies the missing date and verify that Beacon uses it correctly. The agent should not ask the same question again or forget the original request. Preserve the user's permission scope and original evidence boundary across turns.

## Practice

Create eight cases: two answerable, two missing a necessary variable, two missing a source and two containing conflicting evidence. Define the accepted response branch for each. Add a follow-up turn to the missing-variable cases and grade whether the agent completes the task after clarification.

## Completion checklist

- Answerability labels come from available evidence and requirements.
- Clarification, abstention and escalation have distinct criteria.
- Unnecessary refusals and unsupported guesses are both measured.
- Clarifying questions request only relevant information.
- Multi-turn cases verify completion after missing facts arrive.

## Continue learning

Continue with [the next lesson](/articles/evals-prompt-injection-test-cases). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Ragas: Faithfulness](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/)
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
