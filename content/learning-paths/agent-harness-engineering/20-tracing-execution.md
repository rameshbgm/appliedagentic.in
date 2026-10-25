# Trace Model Calls, Tool Execution and State Changes

A single user request can trigger many model calls, tool attempts and worker sessions. Without linked traces, a slow or incorrect answer looks like one opaque failure. Observability should reveal the causal path from request to outcome while protecting sensitive content and distinguishing actual execution from model proposals.

## Define identifiers and spans

Use a stable run identifier for the logical job, attempt identifiers for worker sessions and action identifiers for tool operations. A distributed trace can contain spans for context construction, model invocation, policy evaluation, tool dispatch and checkpoint persistence. Parent-child relationships show which operation caused another; links can connect asynchronous continuations that do not fit a simple nested call tree.

Record useful attributes such as tool name, schema version, model identifier, policy outcome, duration, token usage and safe error category. Avoid dumping raw prompts or authentication headers into span attributes. If debugging requires payload capture, use protected storage, explicit retention and access controls rather than ordinary telemetry fields.

A trace is not automatically an audit ledger. Sampling or ingestion failures can omit spans. Keep consequential authorization and action records in durable application storage when your system requires them. Observability helps investigate performance and behavior; audit records establish the application's authoritative decision history.

## Trace a resumable research run

The first attempt searches documents and pauses for approval. A later worker resumes, uploads a report and confirms completion. Both attempts belong to one logical run. The upload span references the approved action identifier and artifact digest. A lost response creates an uncertain action event, followed by a separate reconciliation span.

```text
run R8
  attempt A1: context -> model -> search -> checkpoint
  approval event P4: exact artifact and destination
  attempt A2: policy recheck -> upload U2 -> timeout
  attempt A3: reconcile U2 -> confirmed result -> complete
```

This representation explains why a final response took longer without suggesting three different uploads occurred. Count logical actions and network attempts separately. A provider retry may be one action with several attempts, and an evaluation should not confuse those attempts with independent successes.

## Build useful measurements

Measure end-to-end latency and break it into queue wait, model time, tool time, approval wait and recovery time. Track task success alongside cost and limits. A lower average latency can hide worse tail latency or increased failure rates. Use percentiles and group by workload where appropriate rather than comparing unrelated tasks in one average.

Record model usage from provider responses when available, while retaining conservative reservations for budgeting. Distinguish missing usage data from zero usage. A timeout can still incur cost, so observability and accounting should preserve uncertain usage until reconciled or conservatively settled.

## Keep traces interpretable

Bound event volume and payload size. A loop that logs every token as an independent event can overwhelm storage and obscure important state transitions. Start with meaningful operation boundaries and add detail for specific investigations. Use structured error categories so dashboards do not depend on matching free-form messages.

Propagate trace context across queues and workers with a controlled metadata format. Do not let user-supplied headers spoof privileged execution identity. Trace propagation carries correlation, not authorization. Redact sensitive baggage and avoid using high-cardinality document contents as metric labels.

## Preserve causal links through asynchronous work

A queue continuation may start long after its parent span ends. Link it to the originating run and action rather than fabricating a continuously active request span. This makes waiting time and execution time easier to distinguish. Retain a protected lookup from logical run identifier to relevant trace identifiers so investigation does not depend on one telemetry backend's search conventions. Document sampling decisions; an absent span should be interpreted as missing telemetry, not proof that an operation never ran.

## Practice

Instrument a run that performs two searches, waits for approval and experiences one upload timeout. Produce a trace showing all attempts and a summary that separates queue, model, tool and review time. Verify that secrets are absent, that a sampled-out span does not erase the durable action record and that operators can locate the final artifact.

## Completion checklist

- Correlate logical runs, attempts and actions.
- Trace policy checks and recovery as well as model calls.
- Separate sampled telemetry from durable audit evidence.
- Measure latency, quality and consumption together.

Continue with [Audit Logs and Emergency Stops](/articles/harness-audit-emergency-stop) and [Comparing Harness Versions](/articles/harness-capstone-compare-versions).

## References

- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [OWASP: Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
