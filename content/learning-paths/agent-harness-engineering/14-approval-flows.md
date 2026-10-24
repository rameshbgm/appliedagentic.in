# Implement Approval, Denial and Escalation Flows

Human approval is useful only when the reviewer can understand and control the exact action being proposed. A generic “continue?” prompt gives little evidence about recipients, content or consequences. Design approval as a durable runtime protocol with a concrete action, a qualified reviewer and a decision that cannot be silently reused for changed work.

## Persist the proposed action

Before requesting review, validate the tool arguments, resolve the destination and store the proposed action. Include its logical identifier, canonical argument digest, artifact references, expected effect and expiration. The review interface should render this record rather than a model-generated paraphrase alone. A summary can help, but it must not hide the actual action.

Bind approval to the action version. If an agent edits the report, changes a recipient or selects a different environment, the existing decision is stale. Create a new pending version and request review again where required. Do not treat an approval as a reusable token for a broad category of actions.

Choose reviewers through application authorization. The person chatting with an agent may not have authority to approve every production operation. Verify reviewer identity and scope at decision time. Record denial and escalation distinctly so the run can report whether the action was rejected or simply requires a different decision maker.

## Work through an external upload

The agent prepares a report for a named partner portal. The harness saves the report as an immutable artifact and computes its digest. It stores upload action U21 and moves the run to awaiting approval. The reviewer sees the destination, report preview and expected visibility. On approval, a continuation is queued without keeping the original worker alive.

```text
pending = store_action(tool, args_hash, artifact_hash, expires_at)
request_review(pending, authorized_reviewer_group)
decision = record_authenticated_review(pending.version)
if decision.approved:
    verify_current_policy_and_artifact(pending)
    enqueue_continuation(run.id, pending.id)
else:
    preserve_draft_and_report_decision(run.id)
```

Immediately before dispatch, check that approval is unexpired, the run is not cancelled and the action digest still matches. Also check current access to the destination. An approved action should not proceed after the destination account is revoked merely because the review happened earlier.

## Handle waiting and disagreement

Approval waits need a defined lifetime. An expired request should transition to a visible state and stop occupying execution resources. If the user revises the request while review is pending, decide whether that revision cancels the old action or creates a new run version. Preserve lineage so reviewers can understand why an earlier request disappeared.

A denial should not trigger repeated attempts to obtain approval through another channel. Return the decision and preserve useful preparatory artifacts. Escalation should follow a defined routing rule, with an explanation of why another reviewer is needed. Avoid asking the model to choose a more permissive person.

## Test the boundary

Important tests include approval for an old artifact, duplicated reviewer submissions, a decision after cancellation and a worker that dispatches after its lease expires. Use a database uniqueness constraint or equivalent to prevent contradictory terminal decisions for the same review version. Keep an immutable history if decisions can later be superseded through a formal process.

Measure approval latency and stale-request frequency separately from model latency. If users frequently approve without inspecting details, improve the action presentation and risk grouping. Reducing the number of requests can help, but combining unrelated consequential actions into one vague prompt weakens meaningful control.

## Keep approval accessible and specific

Use plain language for the expected effect and make the destination easy to distinguish. Show meaningful changes between review versions rather than forcing reviewers to compare entire reports manually. Provide a clear denial path and preserve the prepared draft after rejection when policy permits. Approval quality depends on attention as well as correctness of the backend record. A technically precise hash is useful for binding, while a readable preview and concrete recipient make the decision understandable to the person responsible for it.

## Practice

Build a mock approval screen for report upload. Display an artifact hash, destination, visibility and action expiry. Change the report after approval and confirm dispatch is rejected. Then submit the same approval twice and cancel the run before its continuation starts. Verify that every outcome has one clear durable record.

## Completion checklist

- Present a concrete, immutable action for review.
- Verify reviewer authority and record exact action versions.
- Recheck policy, cancellation and expiration before execution.
- Preserve denial and escalation without approval-seeking loops.

Continue with [Run Lifecycle Design](/articles/harness-run-lifecycle) and [Audit Logs and Emergency Stops](/articles/harness-audit-emergency-stop).

## References

- [OWASP: Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [PostgreSQL: Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
