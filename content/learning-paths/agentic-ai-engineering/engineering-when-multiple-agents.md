# When to Use Multiple Agents

Multiple agents can divide work, isolate context and support different capabilities. They also create coordination overhead, inconsistent assumptions and more places for failures to hide. The architectural question is whether those additional boundaries improve a measurable task outcome. A larger agent count is not a quality metric.

Imagine a research assistant comparing delivery practices across three fictional suppliers. Independent investigations may be useful because each supplier has different documents. A single order-status lookup, however, is unlikely to benefit from three agents debating the same short record.

## Look for natural task boundaries

A promising decomposition has subproblems that can progress independently and return compact, verifiable results. Each supplier investigation can collect policy evidence without waiting for another supplier's findings. A coordinator can then compare the same fields across all three.

A poor decomposition splits tightly coupled decisions across agents that constantly need one another's state. If one agent extracts an order identifier, another merely passes it along and a third calls a lookup, the communication may add complexity without real specialization.

Write the expected specialist output before choosing agents. If you cannot specify what a useful handoff looks like, the boundary is probably not ready. A role name such as “expert researcher” does not substitute for a contract.

## Compare with a strong single-agent baseline

Build a baseline with a suitable context package and tools. Test whether it fails because of missing information, poor tools, context interference or an actual need for independent exploration. Multi-agent architecture should address an identified limitation rather than conceal a weak baseline.

Use the same task set and resource accounting for the comparison. Record outcome quality, supported claims, execution time, model usage and external tool calls. If the multi-agent design receives much more evidence or a much larger budget, interpret its improvement accordingly.

Do not generalize a published benchmark result to every business task. Task structure, available tools, model configuration and grading criteria matter. Your deployment decision needs evidence from your actual workflow.

## Define specialization precisely

Specialization can mean different tools, distinct information scope, a different output contract or an independent review role. A supplier researcher may have access only to that supplier's permitted documents. A synthesis agent may compare evidence without accessing account-specific records.

Keep authority narrow. Delegation should not expand permissions. If the coordinator cannot read a private account, asking a specialist to retrieve it is still unauthorized. Pass trusted scope explicitly through server-side orchestration.

Separate investigation from critique when the critique can add independent checks. A reviewer that sees only the polished answer may repeat its assumptions. Give the reviewer access to relevant source passages and a concrete rubric for checking coverage and support.

## Plan for partial results

A coordinator needs rules for missing, late or contradictory specialist outputs. It might compare two suppliers while labeling the third unavailable, or it might stop because the decision requires all three. Decide that behavior as a product requirement.

An illustrative specialist contract is:

```text
Supplier: fixture-A
Required fields: delivery window, exceptions, source references
Output status: complete | incomplete | unavailable
Constraints: no account data, no external messaging
Completion: every reported field has a supporting passage
```

The contract makes aggregation possible. Without it, the coordinator receives three essays with incompatible definitions and may smooth their differences into an unsupported comparison.

## Exercise

Choose one research task and one support task. Design both as a single agent first. Then propose a multi-agent decomposition and explain the specific limitation it addresses. Identify each specialist's inputs, tools, outputs and authority.

Create a fixture where one specialist is unavailable and another returns unsupported claims. Decide what the coordinator can safely conclude. Estimate the extra coordination work and define the evidence that would justify keeping the architecture.

## Completion checklist

- Independent subproblems justify agent boundaries.
- A single-agent baseline exists for comparison.
- Specialist roles have explicit output and permission contracts.
- Partial and unsupported results have defined handling rules.

## Continue learning

[Choose an orchestration pattern](/articles/engineering-supervisor-specialist-handoffs). [Design shared state](/articles/engineering-multi-agent-communication-state).

## References

- [How we built our multi-agent research system](https://www.anthropic.com/research/multi-agent-research-system)
- [Building effective agents](https://www.anthropic.com/research/building-effective-agents)
