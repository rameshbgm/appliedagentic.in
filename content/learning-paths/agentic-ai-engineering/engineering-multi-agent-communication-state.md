# Designing Communication and Shared State

Multi-agent systems need a way to exchange findings without turning every agent's text into shared truth. Communication should carry task-specific evidence and status. Shared state should record ownership, versions and the distinction between observations and interpretations. Without these boundaries, concurrent agents can overwrite useful work or amplify each other's mistakes.

The supplier comparison project has two specialists collecting delivery policies. They must agree on field meanings while retaining differences in the underlying documents. A shared table called `best_answer` would hide too much; a set of versioned findings is more inspectable.

## Prefer task messages over conversational noise

A useful message identifies the task, sender, intended recipient, message type and relevant artifact. Examples include assigned, progress, result, blocked and cancelled. A free-form chat stream can be helpful for collaboration, but important state changes should not depend on a model correctly interpreting casual prose.

Keep messages compact. Return the selected policy fields, cited passages and unresolved questions rather than copying the entire research transcript. Preserve references to the original evidence so the coordinator can inspect details when necessary.

Treat another agent's output as untrusted until validated. A specialist may misunderstand the task, cite an inaccessible source or return stale information. Its role label does not make its findings authoritative.

## Give state fields clear owners

Choose which component may update each field. A specialist can own its evidence bundle and status. The coordinator can own the overall coverage assessment and final synthesis. A trusted orchestration service can own cancellation and execution limits.

Avoid multiple agents writing the same mutable summary without coordination. Last-write-wins behavior can silently discard important qualifications. Use append-only findings, version checks or transactions appropriate to your storage system.

An illustrative record is:

```json
{
  "task_id": "comparison-17",
  "supplier": "fixture-A",
  "finding_version": 2,
  "owner": "supplier-A-researcher",
  "delivery_window": "see cited conditions",
  "source_ids": ["policy:A:v3:section4"],
  "unresolved": ["commercial-order exception"]
}
```

The deliberately qualified field avoids reducing a conditional policy to a single unsupported number. The coordinator should preserve that condition when comparing suppliers.

## Handle stale and conflicting results

Include source observation times and task versions. A result produced for an older user question may no longer apply after the user changes the product or destination. Reject or revalidate it before merging.

When two findings disagree, record the disagreement. Determine whether the difference comes from document versions, product scope, extraction error or a real policy conflict. Do not resolve it by majority vote unless the task's evidence model actually supports that method.

A coordinator can request targeted clarification, retrieve the original passage or mark the field unresolved. The correct response depends on the decision cost and available evidence. Synthesis should not make contradictions disappear merely to produce a clean table.

## Keep snapshots and traces coherent

A final answer should correspond to a known state snapshot. Otherwise one paragraph may use an old finding while another uses an updated one. Record the versions included in synthesis and invalidate the answer if a material change arrives before delivery.

Use correlation identifiers to connect parent tasks, specialist work and tool calls. A trace should make it possible to follow a final claim back to a finding and its source observation. Store only the data needed for that review, with appropriate access controls.

Test out-of-order events. A late “in progress” message must not replace a completed status. A duplicate result should not count as a second independent source. A cancelled task should not revive because an old worker returns a response.

## Exercise

Create a shared-state schema for two supplier specialists and one coordinator. Assign an owner to every field. Simulate simultaneous updates, a duplicate message and a result from an older task version.

Add two conflicting findings and write the coordinator's response. Preserve the original evidence and explain the precise question that must be resolved before the comparison can be completed.

## Completion checklist

- Messages identify task, type, sender and artifact references.
- Shared fields have explicit update owners and version rules.
- Conflicts preserve evidence until they are resolved or disclosed.
- Final synthesis records the exact finding versions it used.

## Continue learning

[Design orchestration contracts](/articles/engineering-supervisor-specialist-handoffs). [Build a research agent](/articles/engineering-research-agent-source-citations).

## References

- [How we built our multi-agent research system](https://www.anthropic.com/research/multi-agent-research-system)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
- [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/)
