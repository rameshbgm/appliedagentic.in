# Package Your Agent for Evaluation and Deployment

A working demonstration becomes a reviewable engineering artifact when another person can reproduce it, inspect its boundaries and measure its behavior. Packaging is therefore part of the capstone, not an administrative step after the interesting work. The package should explain what the agent does, which evidence it uses and what remains unresolved.

This lesson prepares the delivery assistant for the AI Evals and Agent Harness Engineering paths. Engineering delivers the task implementation. Evaluation measures its behavior. Harness work strengthens how it runs over time. The handoff should preserve the same task definitions and fixtures across all three.

## Version the complete behavior package

Record the code revision, dependency lockfile, model configuration, instruction version, context-builder version, tool schemas and fixture corpus version. An instruction file alone is insufficient because changes in retrieval filters or adapters can alter the agent's behavior.

Document environment variables by purpose without storing credentials. Provide a fixture mode that runs without production access. Separate required secrets from optional integrations and explain how missing configuration is reported.

Include the data contracts. Reviewers should be able to inspect input schemas, task-state fields, tool observations, final outputs and review packets. Document which fields contain sensitive information and which are safe for ordinary logs.

## Build a reproducible evaluation handoff

Create a named case set from the requirements: normal shipment, ambiguous identity, missing order, unauthorized order, carrier exception, timeout, conflicting evidence and duplicate review. For each, specify expected outcome and important constraints.

A case record could read:

```text
Case: carrier_timeout
Input: authorized order with unavailable carrier service
Expected outcome: qualified answer or review
Required evidence: last accessible order observation
Forbidden behavior: invent a current carrier event
Trace check: bounded retry and explicit dependency failure
```

Keep expected facts separate from a single exact answer string. Valid wording can vary while preserving the required meaning. Conversely, fluent wording should not pass when a forbidden tool action occurred.

Record repeated trials where model variability matters. Report the number of cases, number of trials and observed failure categories. A tiny fixture set is useful regression coverage, not proof of general production reliability.

## Preserve evidence for review

For selected runs, include sanitized traces connecting the user goal, context selection, tool requests, observations and final result. The reviewer should be able to follow a cited fact back to its source record. Keep raw sensitive payloads restricted or replace them with fictional fixtures.

Explain known limitations. The current assistant may support only a small policy corpus, one carrier adapter or read-only operations. Those are concrete boundaries. List the behavior that would need new requirements and evaluation before expanding them.

Classify failures by stage. A retrieval miss, authorization bug, malformed model response and failed review persistence call for different fixes. This classification also helps the next learning path turn observed failures into regression cases.

## Define operational requirements

Specify execution limits, timeout behavior, cancellation, retry policy and storage retention. Identify who owns the service and the staff review queue. A task that cannot finish should end in a visible state rather than disappear into an application log.

Separate application readiness from deployment mechanics. A clean build confirms that the code can compile in its target environment; it does not establish that live credentials, database permissions or external service contracts are correct. Verify those through the appropriate environment checks before serving real users.

Prepare a rollback and disable path appropriate to the deployment. The team should be able to stop new agent runs while preserving investigation records. Do not assume a prompt change is the only way to contain faulty behavior.

## Exercise

Create a package containing a README, configuration example, fixture corpus, named acceptance cases, sanitized sample traces and a known-limitations note. Ask another learner to run the fixture mode from a clean checkout and report any missing step.

Write a one-page readiness report with observed outcomes, unresolved failures and the exact package versions tested. Hand the same case set to an evaluator and the same task lifecycle to a harness engineer.

## Completion checklist

- Another learner can reproduce fixture behavior without production secrets.
- Behavior versions include context, tools and data as well as code.
- Evaluation cases check outcomes and forbidden actions.
- Operational ownership, limits and incomplete-task handling are documented.

## Continue learning

[Review the implementation](/articles/engineering-end-to-end-business-workflow). [Improve the research project](/articles/engineering-research-agent-source-citations).

## References

- [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
