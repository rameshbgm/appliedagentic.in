# Implement Completion Checks and Recovery Procedures

An agent's final message is a claim about completion. The harness needs evidence that the requested outcome exists and satisfies its requirements. Completion checks turn a confident statement into a verifiable result. Recovery procedures define what to do when checks fail, dependencies disappear or earlier actions remain uncertain.

## Build a requirement-to-evidence map

List the user's required outcomes and the evidence that proves each one. A saved report requires a valid artifact reference and readable content. A deployed service requires a confirmed deployment identifier and a relevant health check. A cited answer requires sources that support its claims. Choose checks that assess the actual outcome rather than merely repeating the implementation's own status flag.

Some requirements are subjective. A report may need clear language or an appropriate design. Use a rubric, evaluator or human review where necessary, and record that judgment with its scope and limitations. Do not reduce subjective quality to an arbitrary file-size threshold just because it is easy to automate.

Separate task success from operational cleanliness. A report might be correct while a temporary environment remains active. Conversely, all workers can shut down cleanly while the report is missing a required section. The final lifecycle transition should account for both required outcome checks and unresolved operational risks.

## Verify a completed research report

Suppose a run must compare three suppliers, cite sources and save a private draft. Check that all three suppliers appear, the required comparison fields are present, citations resolve to stored evidence and the draft is readable at the authorized location. Then inspect the action ledger for any uncertain writes or unfinished approvals.

```text
checks = evaluate_acceptance_criteria(run.requirements, artifacts)
operations = inspect_unresolved_actions(run)
if checks.passed and operations.safe_to_finish:
    finish(run, "completed", evidence=checks.results)
else:
    plan = classify_and_propose_recovery(checks, operations)
    execute_only_authorized_recovery(plan)
```

The recovery plan should target the failure. A missing citation may require another search. An unavailable storage service may require a bounded retry. An uncertain upload requires reconciliation. Restarting the entire workflow can duplicate work and lose useful evidence, so prefer a precise continuation where the state model supports it.

## Classify recoverable failures

Distinguish transient dependency failures, invalid model outputs, stale artifacts, authorization changes and unmet requirements. Each category needs a defined response. A revoked credential is not fixed by repeated retries. A malformed model response may be retried within a protocol budget. A failed acceptance check may justify another implementation task if the original request authorizes it.

Preserve failure evidence before repair. Otherwise a successful retry can erase the information needed to understand the incident. Store the failed check's artifact version and reason. Keep sensitive data protected and avoid making raw errors visible to users when a safe explanation is sufficient.

## Avoid infinite repair loops

Give recovery its own limits and escalation rules. Repeatedly editing a report until a judge happens to approve it can overfit the evaluator rather than improve the result. Track which requirement is being repaired, what changed and whether independent evidence supports the improvement. Stop when budget or authorization prevents further useful work.

The final user-facing status should name the confirmed outcome and any material limitation. If publication was not confirmed, say so even if the draft is complete. If a run stopped after producing partial artifacts, provide those artifacts when appropriate and state what remains to be done.

## Verify cleanup with the right priority

Cleanup failures should be visible, but their treatment depends on consequence. A temporary file left in an isolated expiring workspace differs from an active credential or publicly reachable service left behind. Classify cleanup obligations and decide which ones block completion. Record any deferred cleanup job with an owner and expiry. This keeps the runtime from hiding operational debt while also avoiding an endless repair loop over a harmless artifact that can be removed through a normal retention process.

## Practice

Create three failures in a report workflow: a missing required section, a broken source link and an upload whose response is lost. Write a different recovery path for each. Demonstrate that the harness preserves earlier evidence, performs only necessary authorized actions and cannot declare completion while an important outcome remains uncertain.

## Completion checklist

- Connect every required outcome to meaningful evidence.
- Check unresolved actions before declaring success.
- Match recovery behavior to failure category.
- Bound repair loops and report remaining uncertainty honestly.

Continue with [Resource Budgets](/articles/harness-resource-budgets) and [Comparing Harness Versions](/articles/harness-capstone-compare-versions).

## References

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
