# Design Policies for Tool Execution

Tool descriptions tell a model what it can request. Execution policies tell the runtime what it may actually do. Keeping those concerns separate allows an agent to reason flexibly while deterministic controls enforce resource access, approval requirements and spending limits. A policy engine can be small; the essential property is that every dispatch goes through it.

## Evaluate the complete action

A tool name alone is rarely enough to assess an operation. Sending an internal draft to its owner differs from sending the same draft to a public address. Evaluate the authenticated principal, resource, arguments, destination, run state and current policy version. A valid schema is a prerequisite, not a permission decision.

Use explicit decisions such as allow, deny or require approval. Include a machine-readable reason and the policy version used. Keep explanations suitable for users without revealing sensitive policy internals. A denial should not invite the model to bypass the same rule through a more general tool such as a shell or arbitrary HTTP client.

Default behavior matters. Decide what happens when a tool lacks a policy entry, a resource cannot be resolved or the policy service is unavailable. For consequential actions, an unknown decision should stop dispatch rather than inherit permission from a previous unrelated call. Availability requirements should be handled deliberately, not by a silent allow-on-error fallback.

## Build a document publication policy

Suppose an assistant can save drafts and publish approved reports. Saving into its assigned private workspace may be allowed automatically. Publishing externally requires a reviewer and an exact content digest. Publishing to an unapproved destination is denied. The same model and tool schema can serve all three cases while policy distinguishes the actual action.

```text
action = canonicalize(validated_tool_call)
resource = resolve_action_resource(action)
decision = policy.evaluate(
    principal=run.principal,
    action=action,
    resource=resource,
    state=current_run_state,
    policy_version=current_policy_version
)
if decision == DENY: record_denial_and_stop_dispatch()
if decision == REQUIRE_APPROVAL: persist_pending_action()
if decision == ALLOW: dispatch_with_current_lease()
```

Canonicalization should preserve meaning while producing a stable representation for hashing and review. Do not remove meaningful distinctions such as recipient order when the service treats them differently. Bind approvals and audit records to the exact canonical action version.

## Prevent policy bypass through composition

Two individually allowed tools can combine into an unintended capability. A read tool can retrieve sensitive content, and a network tool can transmit it. A generic code runner can perform actions that narrow adapters would reject. Review the combined capability surface rather than treating every tool independently.

Use data classification and destination rules where the application needs them. Keep high-risk generic tools out of ordinary workflows when narrow tools suffice. If arbitrary execution is necessary, enforce boundaries at the sandbox and network layers as well as the policy layer. A model promise not to combine tools is not an enforcement mechanism.

## Make policies testable

Represent representative allow, deny and approval cases as fixtures. Include cross-tenant identifiers, changed destinations, stale approvals and revoked permissions. Run these tests deterministically at the policy boundary. Separately evaluate whether tool descriptions guide the model toward useful permitted actions instead of repeated denials.

Record denial patterns to improve product design. Frequent denial of the same reasonable task may reveal that users need a safer supported workflow. It does not automatically mean the policy should be relaxed. First determine the intended action, required controls and whether a narrower adapter can satisfy the need.

## Version decisions across deployments

Store policy versions with decisions so a resumed run can explain why an earlier action was permitted and why a later one is blocked. A cached allow decision should have a defined scope and lifetime. If a deployment changes the policy, decide which pending actions require reevaluation and invalidate stale caches accordingly. This is especially important for approval waits, where hours can pass between proposal and dispatch. Historical explanation and current enforcement are both necessary; one must not replace the other.

## Practice

Write a policy table for save_draft, read_document and publish_report. Include private and public destinations, two tenants and an expired approval. Simulate a model trying to publish through a generic HTTP tool after publish_report is denied. Show which additional boundary prevents that bypass and explain how the user receives an actionable result.

## Completion checklist

- Evaluate principal, resource, arguments and destination together.
- Return explicit allow, deny or approval decisions.
- Recheck current policy immediately before dispatch.
- Test combinations of tools for unintended capabilities.

Continue with [Approval, Denial and Escalation Flows](/articles/harness-approval-flows) and [Credentials and Tool Access Boundaries](/articles/harness-credentials-access-boundaries).

## References

- [OWASP: Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [Model Context Protocol: Security best practices](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices)
