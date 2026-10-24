# Define Success Before You Build

A requirement such as “provide a high-quality answer quickly” leaves every important decision unresolved. What facts must be present? What evidence is acceptable? How quickly is quickly? Is a correct answer acceptable if the agent accessed a restricted record? Evaluation design becomes easier when the team answers these questions before implementation. The resulting contract guides development, grading and release review.

For Beacon, imagine a user asking for the approved retention period for a customer export. The business goal is to help the user act on current policy. A polished paragraph is not the goal. An answer that gives the current period, links the governing document and identifies uncertainty when policy conflicts arise is closer to the actual need.

## Translate goals into observable claims

Write acceptance criteria as statements about evidence. “Accurate” becomes “states the retention period in the effective policy fixture.” “Helpful” becomes “includes the next permitted step when the evidence is insufficient.” “Safe” becomes “does not read records outside the user's document scope.” Each statement should identify where the grader will look.

Separate mandatory requirements from preferences. A mandatory requirement can block task success. A preference helps rank otherwise acceptable outputs. For example, correct policy and authorized access are mandatory; a concise explanation is preferred. Averaging these into one score can let excellent style compensate for a dangerous action.

Also distinguish a product requirement from a proposed threshold. A team might initially propose that ninety-five out of one hundred ordinary cases must pass. That number is a local decision requiring justification, not a universal standard. Record the expected harm, workload, review capacity and available sample size behind any threshold.

## Include valid alternatives

Users often ask questions with several acceptable answers. A task can permit a direct answer, a targeted clarification or a handoff, depending on the evidence. List these branches explicitly. A grader that demands a direct answer when the source is missing rewards confident fabrication.

For a conflicting-policy fixture, success may require identifying both documents and escalating to the owner. For an unambiguous fixture, the same escalation could be an avoidable refusal. The accepted behavior depends on the task state. Write that dependency into the case instead of grading every response with a universal helpfulness prompt.

Avoid requiring one exact tool sequence unless sequence is itself a requirement. Two retrieval calls and one well-chosen retrieval call may both produce valid evidence. In contrast, approval must precede a protected write if that is the permission contract. Distinguish flexible implementation choices from mandatory causal ordering.

## Worked example: a release contract

Suppose Beacon will initially serve a small internal pilot. The team defines four checks: correct retention fact, supporting citation, no unauthorized document access and a response within a stated execution budget. They also create explicit branches for missing or conflicting policy evidence.

In a trial suite of forty cases, thirty-six satisfy all checks. Two return unsupported facts, one reveals a restricted document title and one times out. Calling this “ninety percent ready” obscures the restricted-document defect. The team records that unauthorized access blocks release regardless of the aggregate score, while the other defects require investigation and a rerun. This is an example decision policy, not a recommendation that forty cases are sufficient for every launch.

The contract should name its owner and change process. If a reviewer discovers that a criterion incorrectly rejects valid behavior, revise the criterion with a rationale and rerun affected baselines. Do not quietly loosen it only for a favored candidate. Requirements evolve, but comparisons need a traceable definition of success.

## Practice

Select a user request from your own planned agent. Write one paragraph describing the real-world outcome. Convert it into five observable assertions and identify the evidence for each. Add a missing-data branch and a permission-denied branch. Ask a colleague to grade three invented responses without explanation from you; disagreements reveal where the contract remains ambiguous.

## Completion checklist

- Required outcomes are observable in answers, traces or final state.
- Mandatory boundaries are separate from graded preferences.
- Valid clarification and abstention branches are explicit.
- Every threshold has an owner and a written rationale.
- Criterion changes trigger documented baseline reevaluation.

## Continue learning

Continue with [the next lesson](/articles/evals-real-tasks-to-cases). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [Python: unittest](https://docs.python.org/3/library/unittest.html)
