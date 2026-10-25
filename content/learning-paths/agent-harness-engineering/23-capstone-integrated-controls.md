# Integrate Tools, Approvals and Execution Traces

A reliable runtime must connect its controls, not merely implement them in separate demonstrations. This capstone extends your resumable research agent with an approved publication action and an observable execution trail. The objective is to show that validation, permissions, human decisions and recovery describe the same logical operation across multiple sessions.

## Define the publication workflow

The agent prepares a private report, requests approval for one destination and publishes only the approved artifact version. Use a mock publication provider in the exercise so you can simulate ambiguous outcomes without sending real documents. Give the provider an idempotency interface and a lookup endpoint for reconciliation.

Add a publish_report tool with an immutable artifact reference and destination identifier. The model cannot provide an arbitrary bearer token or override the tenant. The tool registry validates structure, the policy engine resolves access and the approval service records a qualified reviewer's decision. Each component receives the same action identity.

The approval interface should show the destination, visibility, report preview and artifact digest. A model-generated summary may explain the request, but the reviewer must be able to inspect the actual payload. Store the decision independently from the chat transcript so a worker can resume after the original connection closes.

## Trace the integrated execution

The first worker creates the draft and pauses. A reviewer approves it. The second worker rechecks policy and dispatches publication. The provider accepts the request but drops its response. A third attempt reconciles the action and records the confirmed publication identifier.

```text
A1: draft D7 -> prepare publication P3 -> awaiting approval
review: approve P3 version 1 and digest H7
A2: current policy check -> dispatch P3 -> timeout
A3: reconcile P3 -> provider object O9 -> completed
```

The trace should connect all three attempts under one run while preserving the distinct action and review identifiers. The audit ledger should show that only one publication was authorized and confirmed. A timeout span must not be interpreted as proof that publication failed.

## Test controls together

Change the draft after approval and confirm that publication is blocked. Revoke destination access before the second worker starts and confirm a policy failure. Cancel the run after approval but before dispatch and confirm no provider request occurs. Return a stale result from the first worker and confirm its lease epoch cannot update current state.

Then disable the publication tool during an active batch. Future dispatches should stop under your defined propagation rule, while already dispatched actions are reconciled. These tests reveal integration gaps that isolated unit tests miss, such as a continuation path that forgets to recheck cancellation.

## Protect evidence and diagnostics

Keep report content and credentials out of ordinary trace attributes. Reference protected artifacts by identifier and digest. Confirm that another tenant cannot inspect the report, approval record or detailed trace. Observability endpoints are part of the access-control surface, even when operators find them convenient for debugging.

Define a redacted user-facing status for each failure. A stale approval should explain that the report changed and requires review. A revoked destination should identify the access problem without exposing secrets. An uncertain provider outcome should preserve the draft and state that publication is being reconciled rather than claiming success or failure prematurely.

## Review the evidence as another operator

Ask a colleague to inspect one failed scenario using only the playbook and recorded identifiers. They should be able to determine whether publication was authorized, whether it was dispatched and whether the provider confirmed the effect. If they must infer these facts from conversational prose, strengthen the ledger or status views. The integration is successful when people can operate it accurately under uncertainty, not only when the ordinary demonstration produces an attractive final message.

## Practice and deliverables

Produce a demonstration with five scenarios: ordinary approval, changed artifact, revoked access, cancellation and lost provider response. For each, save a compact state timeline, final artifact reference and expected number of external effects. Include the deterministic checks that establish those outcomes.

Write an operator playbook for an unresolved publication. It should describe how to inspect the action, query the provider and record a confirmed result without creating a fresh action accidentally. Keep manual reconciliation authorized and audited, with the original uncertain evidence preserved.

## Completion checklist

- Bind publication, approval and traces to one action identity.
- Revalidate artifact, policy and cancellation on resume.
- Reconcile lost responses without duplicate publication.
- Protect diagnostic records and document operator recovery.

Continue with [Comparing Harness Versions](/articles/harness-capstone-compare-versions) and revisit [Approval Flows](/articles/harness-approval-flows).

## References

- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [OWASP: Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
