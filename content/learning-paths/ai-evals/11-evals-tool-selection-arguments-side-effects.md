# Measure Tool Selection, Arguments and Side Effects

Tool use is where an agent's interpretation becomes an action. A correct explanation does not guarantee a correct tool call. The agent may choose the wrong operation, confuse two identifiers, omit a required approval or perform the same write twice. Evaluating tools therefore requires a contract for selection, arguments and resulting state.

For Beacon, the user asks, “Open a follow-up with the retention-policy owner.” Available tools include document search, employee lookup, task creation and document editing. The correct outcome is a tracker task. Editing the policy would be an unauthorized expansion of the request even if the agent later creates the task correctly.

## Grade selection in context

A tool-selection check should ask whether the chosen operation is appropriate and permitted, not whether the agent copied a reference trace. Multiple read tools may be valid. A write tool may require additional user authorization. Some tasks should result in no tool call because the request lacks a necessary identifier or falls outside scope.

Create cases where tool names are similar but consequences differ. For example, distinguish `preview_export` from `send_export`, or `find_owner` from `change_owner`. Clear tool descriptions help the implementation, but the evaluation should still verify that the actual operation matches the task contract.

Report unnecessary but harmless reads separately from unauthorized writes. Both can indicate problems, yet they have different consequences and should not share an unexplained error count.

## Check arguments semantically

Schema validation catches missing fields and wrong types. Semantic checks verify that the values identify the intended objects. A valid employee identifier can still belong to the wrong person. A syntactically valid date can still violate the requested deadline.

Resolve expected identifiers from the fixture rather than hard-coding incidental ordering. If the policy owner changes in a new fixture version, the expected owner should come from that policy snapshot. This keeps the test focused on the relationship the agent must infer.

For protected operations, evaluate authorization independently of the model's confidence. A tool call must carry the required scoped capability or approval record. Natural-language claims such as “the user probably intended this” should not satisfy an authorization assertion.

## Worked example: inspect the state difference

Imagine an initial tracker containing tasks T1 and T2. The expected result is one new task assigned to owner U7 with source P12. After execution, the database contains T1, T2 and T3. T3 has the correct title and source but is assigned to U9, while T2's due date has also changed.

A title-based grader would pass. A semantic argument check catches the wrong owner, and a before-and-after state comparison catches the unrelated edit. Report both defects. The second defect may indicate a broader tool-scoping problem that deserves attention even after the owner lookup is fixed.

Use an allowlist of expected state changes. For each run, compare the observed change set with permitted changes. Ignore only explicitly allowed metadata differences. A blanket rule that ignores all non-title fields can hide consequential changes to permissions, recipients or ownership.

## Handle retries and duplicates

A timeout can occur after a server commits a write. The next agent step may repeat the operation. Construct a fixture that simulates this ambiguity and verify the expected idempotency behavior. The evaluation should inspect whether one logical action produced one external effect, not merely count successful tool responses.

Keep a distinct check for missing action. An agent that avoids all writes may satisfy “no unauthorized changes” while failing every legitimate request. Safety and usefulness need separate denominators so a refusal-only policy does not look perfect.

## Practice

Build eight tool cases: correct operation, wrong operation, wrong identifier, missing required field, invalid date, duplicate retry, unrelated edit and appropriate clarification. Grade schema, semantic arguments, authorization and state changes separately. Explain which evidence each check uses and how it avoids depending on a single reference sequence.

## Completion checklist

- Tool selection is judged against intent and permissions.
- Argument values are checked against fixture relationships.
- Authorization is validated independently of model text.
- State differences expose duplicate and unrelated writes.
- Useful completion and safe refusal are measured separately.

## Continue learning

Continue with [the next lesson](/articles/evals-multistep-repeated-trials). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Python: unittest](https://docs.python.org/3/library/unittest.html)
- [OWASP: Top 10 for Large Language Model Applications](https://owasp.org/projects/top-10-for-large-language-model-applications)
