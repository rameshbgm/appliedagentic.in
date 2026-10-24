# Add Audit Logs and Emergency Stop Controls

When an agent behaves unexpectedly, operators need two capabilities: understand what happened and stop further execution. Audit logs support accountable investigation; emergency stops limit additional activity. They should share stable identifiers but remain distinct systems. A detailed trace does not stop an agent, and a stop button does not explain an earlier external action.

## Record decisions and effects

An audit event should identify the logical run, attempt, action, actor, resource and timestamp. Record tool schema and policy versions, authorization decisions, approval references and confirmed outcomes. Preserve argument or artifact hashes when full content is too sensitive to store in ordinary logs. Link to protected artifacts through access-controlled identifiers.

Do not claim that a proposed action occurred. Distinguish proposed, authorized, dispatched, confirmed, uncertain and rejected states. A timeout after dispatch belongs in the uncertain category until reconciliation establishes the result. This distinction is essential when users ask whether a message was sent or a record was changed.

Audit storage needs integrity and access controls appropriate to the application. Restrict who can append, view or delete records. Define retention rules and monitor ingestion failures. If your product requires an audit record before a consequential action, make dispatch depend on a durable record rather than an asynchronous log call that can be dropped silently.

## Design stop scope deliberately

Useful stop scopes include one run, one tenant, one tool and the entire service. A run cancellation should stop that job without disabling unrelated work. A tool-level stop can block publication while leaving read-only analysis available. Record the reason, actor and effective time for every change.

```text
before_each_dispatch:
    require_active_run_lease()
    require_not_cancelled(run)
    require_tenant_enabled(run.tenant)
    require_tool_enabled(tool.name)
    require_service_execution_enabled()
```

Workers should check durable stop state at dispatch boundaries, not only at startup. Propagate cancellation to in-flight operations where supported. Terminate sandbox environments when appropriate, while recognizing that remote services may already have accepted an action. Stopping future work and reversing past effects are separate operations.

## Walk through a publication incident

An operator notices repeated reports going to the wrong destination. They disable the publication tool globally and cancel affected runs. Queued publication actions remain recorded but cannot dispatch. In-flight uploads are reconciled using their action identifiers. Read-only analysis continues only if policy allows it and the incident does not affect its safety.

The audit trail should show the configuration change, blocked dispatches, uncertain in-flight actions and confirmed external objects. A recovery operator can then decide whether to remove published artifacts through separately authorized operations. Do not have an emergency stop automatically perform broad compensating writes without a clear policy.

## Keep observability and privacy aligned

Logs can become a secondary data leak. Redact credentials, authentication headers and unnecessary personal information before persistence. Use structured fields rather than concatenating raw request objects. A tool error may include a sensitive URL or token even if the normal success path is safe.

Monitor whether stop propagation meets your operational target. Test with idle workers, active model calls, sandbox processes and blocked network operations. The target should describe what is controlled: for example, no new tool dispatch after the stop is observed. Avoid promising immediate reversal of all external activity.

## Exercise the stop path regularly

An emergency control that is never tested can fail because workers cache state, permissions drift or a new dispatch path bypasses the check. Include a safe drill in operational testing and record the observed propagation delay. Verify who can activate and clear a stop, and require an explicit reason before restarting affected work. Resumption should reconcile pending actions and apply current policy. Simply reenabling the tool must not cause a hidden backlog of stale publications to execute without review.

## Practice

Add a tool-level disable switch to a test runtime. Queue three writes, start one and disable the tool before the others begin. Verify that later dispatches are blocked, the first action is reconciled and every decision appears in the audit trail. Attempt to retrieve the trace as another tenant and confirm access is denied.

## Completion checklist

- Record proposals, dispatches and confirmed effects separately.
- Protect audit records and avoid secret leakage.
- Support scoped, durable execution stops.
- Reconcile in-flight effects after stopping future work.

Continue with [Tracing Agent Execution](/articles/harness-tracing-execution) and [Completion Checks and Recovery](/articles/harness-completion-recovery).

## References

- [OWASP: Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
