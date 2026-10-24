# Designing Reliable Tools for AI Agents

A tool is a capability exposed through a contract. Its quality affects whether an agent can choose it correctly, supply valid arguments and understand its result. Good tools make the useful operation obvious and the dangerous operation impossible without appropriate authorization. A clever prompt cannot repair an interface that accepts arbitrary commands with unclear effects.

The delivery assistant needs to retrieve order status and carrier observations. Those are useful business operations. It does not need a general `run_sql` tool or a function called `do_stuff` that accepts an unstructured paragraph.

## Name operations by their purpose

Choose names that explain what an operation does and distinguish nearby capabilities. `lookup_order_status` and `lookup_carrier_events` communicate different information sources. Avoid names that hide mutations behind read-like verbs. A tool named `preview_refund` must not issue a refund as an incidental side effect.

Descriptions should state when the tool is useful, required preconditions, important limitations and the meaning of its outputs. Keep them focused enough that the agent can compare tools without reading an essay. Use examples when they clarify a non-obvious argument, but do not embed production credentials or real customer records.

Design at the right level of abstraction. A single operation can perform several deterministic internal steps if those steps form one coherent business capability. The model should not have to reconstruct database joins or API pagination rules that the application already understands.

## Validate more than argument shape

An input schema can require an order identifier and constrain optional fields. It cannot establish that the order belongs to the requester. Use trusted identity to enforce that relationship in server code. Derive tenant scope from the session rather than accepting it as a freely chosen model argument.

Perform business validation after authorization. A shipment lookup should verify that the shipment is associated with an accessible order. A mutation, if exposed in a later project, should also verify the current state and any required approval. Do not equate syntactically valid inputs with permitted actions.

For expensive or destructive operations, use narrower contracts and explicit limits. A bulk tool should define maximum batch size and partial-failure behavior. A free-form filter string can conceal an unexpectedly broad query unless the implementation constrains it.

## Return observations the agent can use

Prefer structured results with stable field meanings. An illustrative lookup contract is:

```json
{
  "outcome": "found",
  "order_id": "O-204",
  "shipment_id": "S-18",
  "status": "dispatched",
  "observed_at": "2026-10-01T10:20:00Z",
  "source_id": "order:O-204:v7"
}
```

A missing authorized record should return a distinct outcome, not a fabricated object full of empty strings. A dependency failure should explain whether retry may help without leaking credentials or internal implementation details. Error messages should be useful to the controller and safe for model context.

Limit response size. Return the fields relevant to the task rather than an entire customer profile. If the agent needs additional detail, expose a deliberate follow-up operation. This makes data use easier to inspect and reduces irrelevant context.

## Design retries and observations together

Read-only lookups are often easier to retry than mutations, but they can still be costly or return different snapshots. Record operation identifiers and observation times. For operations with side effects, use application-level idempotency and server-side state checks rather than assuming a repeated model call is harmless.

A tool should report what actually happened. “Request accepted” and “action completed” are different statuses. If an asynchronous operation returns a job identifier, the controller must not present the final business effect as complete before checking the job result.

Review failed tool calls as interface feedback. Repeated confusion between two tools may indicate overlapping descriptions. Repeated malformed arguments may indicate an unnatural input contract. Change one aspect at a time and compare behavior on a stable set of tasks.

## Exercise

Specify two delivery tools with names, descriptions, schemas and typed outcomes. Write fixtures for success, missing data, unauthorized access and upstream timeout. Add one malformed call and one valid-looking call that references another customer's order.

Ask another learner to choose the appropriate tool using only your descriptions. If they cannot reliably distinguish them, revise the contract before adding more prompting.

## Completion checklist

- Tool names match their effects and business purpose.
- Authorization and business rules run outside the model.
- Results distinguish missing data, failure, acceptance and completion.
- Tool tests cover malformed and unauthorized calls.

## Continue learning

[Connect external services](/articles/engineering-apis-databases). [Add an MCP connection](/articles/engineering-first-mcp-integration).

## References

- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
- [Model Context Protocol architecture](https://modelcontextprotocol.io/docs/learn/architecture)
