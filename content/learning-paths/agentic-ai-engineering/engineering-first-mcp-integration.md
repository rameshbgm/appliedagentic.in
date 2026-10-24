# Building Your First MCP Integration

Model Context Protocol, or MCP, standardizes how applications connect to capabilities and context supplied by servers. It can make a business tool reusable across compatible hosts. It does not decide whether an agent should execute a particular action, and it does not replace the underlying service's authorization checks.

For this project, expose the delivery assistant's read-only order lookup through an MCP server. The educational goal is to understand responsibilities and validate the end-to-end boundary. Use the official SDK documentation appropriate to your chosen language and installed version for exact implementation syntax.

## Understand the participants

The host is the application containing the agent experience and governing its connections. An MCP client maintains a connection to a server on the host's behalf. The server exposes capabilities such as tools or resources. The host can connect to multiple servers, each representing a different capability boundary.

Keep protocol responsibilities separate from business responsibilities. MCP provides a way to describe and invoke a tool; the order service still decides whether the authenticated requester can inspect order O-204. The host still controls whether the agent may request that tool during this task.

A server's advertised description is useful metadata, not a grant of trust. Inspect the server's origin, permissions and behavior before connecting it to sensitive data. Remote connections also require an appropriate authentication and authorization configuration following the current protocol and deployment guidance.

## Define one read-only capability

Start with `lookup_order_status`. Its input includes a validated order identifier. Its result contains the permitted order status, shipment identifier, observation time and source identifier. The server obtains trusted identity from the actual authenticated connection or application context, not from a model-written `customer_id` field.

An illustrative tool declaration is:

```json
{
  "name": "lookup_order_status",
  "description": "Read the status of an order available to this requester.",
  "inputSchema": {
    "type": "object",
    "properties": {"order_id": {"type": "string", "minLength": 1}},
    "required": ["order_id"],
    "additionalProperties": false
  }
}
```

This demonstrates a contract, not a complete server implementation. Follow your SDK's supported result format and transport setup. Keep the real order adapter independently testable so that changing the protocol layer does not rewrite business authorization logic.

## Connect and inspect before using the model

Use the official inspection tooling or a test client to discover the server's capabilities. Confirm that the expected tool appears with the intended schema. Invoke it directly against fixtures before allowing model-driven selection. This separates protocol and authentication problems from model behavior.

Test malformed arguments, unknown order identifiers and unauthorized records. Confirm that the response does not reveal whether another customer's private record exists. Check that credentials and internal stack traces are absent from returned errors.

Choose transport based on the actual deployment and supported protocol version. Local process connections and remote HTTP connections have different operational characteristics. Do not assume a local demonstration's identity and filesystem access model is appropriate for a shared production server.

## Add the host policy

Expose only the tool needed for the current task. A server may advertise more capabilities than this agent should use. The host can maintain an allowlist and apply approval rules before routing proposed calls. The server should still enforce its own authorization because another client may bypass this host entirely.

Treat tool results as evidence. A returned order note containing instructions to send data elsewhere must not change the host's policy. Restrict network destinations and side effects in application code rather than relying on the model to reject every malicious sentence.

Record server identity, tool name, call identifier, safe arguments and outcome in the task trace. These observations help diagnose whether a failure began with capability discovery, argument generation, authorization or the upstream service.

## Exercise

Build or sketch a local MCP server around the existing read-only fixture adapter. Discover the tool with a test client, then connect it to the bounded agent loop. Run a permitted lookup, an unauthorized lookup and a server-unavailable case.

Write a responsibility table assigning capability discovery, user authentication, record authorization, model selection and run limits to the appropriate component. Any responsibility assigned only to “the model” deserves another review.

## Completion checklist

- I can explain host, client and server responsibilities.
- The MCP server retains server-side record authorization.
- Direct protocol tests pass before model-driven tests begin.
- Host policy limits which advertised tools the agent can execute.

## Continue learning

[Connect APIs and databases](/articles/engineering-apis-databases). [Design human review](/articles/engineering-human-review-escalation).

## References

- [Model Context Protocol architecture](https://modelcontextprotocol.io/docs/learn/architecture)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
- [OWASP prompt injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
