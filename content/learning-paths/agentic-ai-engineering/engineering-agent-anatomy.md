# Anatomy of an AI Agent: Model, Tools, State and Control

An agent is easier to engineer when its behavior is divided into explicit responsibilities. The model interprets the task and proposes an action. A tool performs a permitted operation. State records relevant facts and progress. Application control decides whether a proposed action can execute and whether the run should continue. These components collaborate, but they should not be interchangeable.

Return to the office supplier's delivery assistant. A customer asks why an order is late. A useful system must connect the question to an authenticated order, inspect carrier observations and produce a supported explanation. Its ability to generate text is only one part of that process.

## The model proposes decisions

The model receives instructions, the user task, available tool descriptions and selected observations. Its output may be a proposed tool call, a request for clarification or a final response. Treat that output as a proposal requiring validation, not as trusted executable code.

Give the model a narrow objective. “Explain the latest delivery status using the supplied records” is more testable than “Make the customer happy.” Include a definition of completion and acceptable uncertainty. The model should be able to report that two records conflict rather than invent a story that joins them.

Do not require disclosure of hidden reasoning as an audit mechanism. Store concise action summaries, tool requests, observations and decisions that the application actually acted upon. Those artifacts can explain behavior without depending on inaccessible internal processes.

## Tools expose bounded capabilities

A tool contract includes a name, description, input schema, authorization requirements and output shape. A lookup tool should return explicit fields such as order identifier, shipment identifier, latest event time and status. Clear contracts reduce the need for the model to infer structure from arbitrary prose.

Input validation checks shape and permissible values. Authorization checks whether this user can access this record. Business validation checks whether the action makes sense in the current state. Passing a JSON schema does not establish permission or business correctness.

The tool's implementation owns its credentials. It should derive customer scope from trusted session context and use parameterized database queries. A model-generated field such as `customer_id` cannot override that scope.

## State separates facts from instructions

Maintain a task state record independent of the chat transcript. The transcript describes interactions; the state describes what the application currently knows. Store source identifiers and timestamps alongside facts so that later steps can recognize stale or contradictory information.

For example:

```json
{
  "task": "explain_delivery_delay",
  "order_id": "O-204",
  "evidence": [{"source": "carrier:C-19", "status": "awaiting_scan"}],
  "attempted_tools": ["lookup_order", "lookup_carrier_event"],
  "remaining_calls": 2,
  "outcome": "in_progress"
}
```

This illustrative record deliberately excludes credentials and unnecessary customer details. Production storage also needs access controls, retention decisions and an owner responsible for deletion. Persistent state is useful only when its lifecycle is defined.

## Control makes the loop finite

Application control validates the proposed action, executes it, appends the result and calls the model again if appropriate. It also enforces tool-call limits, timeouts, cancellation and terminal outcomes. A run may finish successfully, require more information, escalate to a person or fail because an external dependency is unavailable.

Distinguish tool failure from task failure. If carrier tracking is unavailable, the system may still explain the last confirmed order event while clearly identifying the missing evidence. It must not label an incomplete investigation as a verified current status.

A useful architecture test is to remove the model temporarily. Can you still inspect state, reject an unauthorized call and stop the run? If those controls depend on a cooperative model response, their enforcement is misplaced.

## Exercise

Draw your agent as four components: decision model, tools, state and controller. Trace a successful request and a failed carrier lookup. For every arrow, specify the data crossing it. Add one intentionally malformed tool call and explain which component rejects it.

Write a state example for an ambiguous request involving two orders. The record should preserve both candidates without choosing one prematurely. Decide what user-facing clarification is needed before further action.

## Completion checklist

- Model output is validated before any operation executes.
- Tool permission checks use trusted identity and scope.
- State records evidence separately from instructions.
- The controller has finite limits and explicit terminal outcomes.

## Continue learning

[Select an architecture](/articles/engineering-chatbots-workflows-agents). [Implement a bounded loop](/articles/engineering-first-tool-using-agent).

## References

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
