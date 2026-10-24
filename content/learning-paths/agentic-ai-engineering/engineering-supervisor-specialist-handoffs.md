# Supervisor, Specialist and Handoff Patterns

Once you decide that multiple agents are useful, you still need to choose how work moves between them. A supervisor can delegate subproblems and remain responsible for the final result. A handoff can transfer active responsibility to another specialist. These patterns have different implications for state, user experience and failure recovery.

Use a fictional supplier comparison as the example. Two research specialists gather policy evidence, while a coordinator assembles the comparison. A separate compliance reviewer may inspect claims that depend on a restricted policy interpretation. The architecture needs clear ownership at every point.

## Use a supervisor for coordinated subproblems

In a supervisor pattern, the coordinator holds the overall task contract. It assigns bounded investigations, receives results, checks coverage and produces the final answer. Specialists should return structured evidence, not simply declare success.

The supervisor decides whether another investigation is useful, but application code still enforces budgets and permissions. A model-generated delegation request should not create unlimited child work. Define the maximum number of tasks, active workers, retries and elapsed time.

Avoid turning the supervisor into a message relay that adds no judgment or validation. Its useful responsibilities include identifying gaps, reconciling output schemas, detecting unsupported claims and deciding whether the overall task is complete.

## Use handoffs for a change in responsibility

A handoff transfers the active task or conversation to another owner. For example, a support assistant may hand a technical troubleshooting request to a specialist with a different tool set. The transfer should include enough context for continuity and a clear indication of who now responds to the user.

Define whether the previous agent can resume automatically. An uncontrolled chain of handoffs can create loops and inconsistent ownership. Record the previous owner, new owner, transfer reason and permitted return conditions.

A human handoff is a responsibility change too. It should persist the task and evidence rather than merely display a suggestion to contact support. The same product questions apply: who owns it, what information travels and how does it end?

## Define the task envelope

Use a task envelope that includes the objective, required output, trusted scope, evidence inputs, deadline and completion criteria. A specialist should not infer these from a vague role description.

```json
{
  "task_id": "research-fixture-A",
  "objective": "Find the applicable delivery policy",
  "required_fields": ["window", "exceptions", "sources"],
  "scope": "approved_supplier_A_documents",
  "status": "assigned",
  "return_to": "comparison_coordinator"
}
```

The example is a contract sketch. Production systems should include the appropriate version identifiers, access enforcement and correlation metadata. Scope is enforced by orchestration and tools, not by trusting the specialist to obey a string.

Validate returned results against the envelope. A response can be fluent yet omit exceptions or cite documents outside the permitted corpus. Treat invalid results as failed or incomplete work, with bounded repair if useful.

## Handle nested work and failures

Delegation creates a tree of responsibility. Each parent should know which tasks are active, completed, cancelled or failed. Cancellation of the overall request should propagate to unfinished child work where the underlying operations support it.

A failed specialist may be retried if the failure is transient and the remaining budget allows it. Reassigning the same task repeatedly can waste resources or produce inconsistent evidence. Preserve previous attempts and state why a retry was chosen.

The final answer should reflect coverage honestly. If one supplier's documents were unavailable, the coordinator cannot claim a complete three-way comparison. State the missing evidence and its effect on the conclusion.

## Exercise

Draw two versions of the supplier comparison: one using a supervisor and one using a handoff to a specialist. Identify the active owner after each event. Write a task envelope and a valid specialist result.

Introduce a late result, a malformed result and a cyclic handoff request. Define how the orchestration layer handles each without losing responsibility or exceeding the task budget.

## Completion checklist

- The overall task has one accountable owner at each point.
- Delegations include objective, scope, deadline and return contract.
- Returned results are validated before synthesis.
- Cancellation, retry and cyclic transfer behavior are defined.

## Continue learning

[Evaluate whether delegation helps](/articles/engineering-when-multiple-agents). [Manage communication and state](/articles/engineering-multi-agent-communication-state).

## References

- [How we built our multi-agent research system](https://www.anthropic.com/research/multi-agent-research-system)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
- [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/)
