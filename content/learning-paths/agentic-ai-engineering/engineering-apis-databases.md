# Connecting Agents to APIs and Databases

Most useful agents operate on existing systems. They look up an order, retrieve a policy or inspect a support ticket. The integration layer translates a model's proposed business operation into a safe application request. It should reduce the external system's complexity and authority to the minimum needed for the task.

This lesson connects the delivery assistant to a fictional order database and carrier API. The design applies whether the actual backend is relational storage, a business service or a search system. The model should see a coherent tool contract rather than internal credentials and arbitrary query access.

## Establish identity at the application boundary

Authenticate the requester before starting an account-specific task. Store the resulting user or tenant scope in trusted server state. Pass that scope directly to the tool adapter. Do not let the model choose a customer identity by generating an argument.

Service credentials belong in managed secrets or server-side environment configuration. They should never enter model context, tool descriptions, client bundles or user-visible traces. Use service accounts with the narrowest practical permissions and rotate them through your normal operational process.

Authorization needs to happen on every relevant request. A run resumed hours later may no longer have the same access. Treat a previously successful lookup as an observation from that time, not as a permanent grant to inspect or modify the record.

## Use fixed operations and parameterized queries

Expose a small business operation such as `lookup_order_status(order_id)`. The adapter can query the database using trusted customer scope and validated order identifier. Avoid an arbitrary SQL tool unless the product explicitly requires such capability and has a separately designed containment model.

Illustrative Python code is:

```python
row = connection.execute(
    "SELECT order_id, shipment_id, status FROM orders "
    "WHERE customer_id = ? AND order_id = ?",
    (trusted_customer_id, validated_order_id)
).fetchone()
```

The placeholder syntax is specific to this SQLite example; other database drivers use their own supported parameter conventions. Parameters protect values from becoming query syntax. They do not replace access checks, query design or database permissions.

Normalize the returned row into a documented tool response. Exclude payment details or addresses if the delivery explanation does not require them. A narrow query is easier to review than fetching an entire record and hoping downstream redaction removes everything unnecessary.

## Wrap external APIs deliberately

The carrier adapter should own URL construction, authentication, pagination, timeouts and response parsing. Accept a validated shipment identifier and construct requests against an allowlisted service. Do not accept arbitrary model-supplied URLs for an internal API client.

Map external statuses to a stable internal representation while retaining source values where needed for interpretation. If the provider adds an unknown status, return an explicit unrecognized-state outcome rather than silently mapping it to success. Schema validation should catch missing required fields.

Choose retry rules based on operation semantics and the provider's documented behavior. Timeouts do not prove that a remote mutation did not happen. Read-only calls may be retried within limits, while consequential actions need idempotency and reconciliation. Honor rate-limit guidance without allowing retries to exceed the task's total deadline.

## Make integration failures observable

Give each task and operation a correlation identifier. Record the tool name, duration, outcome and safe error classification. Avoid logging credentials, raw private documents or unrestricted request bodies. Detailed logs are useful only when the team can store and inspect them appropriately.

Test failures at the boundary. Simulate an expired credential, a response with a missing field, a timeout and an authorized record that has been deleted. The agent should receive a typed result that enables an honest response. It should not invent data because a parser returned an empty object.

## Exercise

Implement a fixture database with two customers and four orders. Build a lookup adapter using parameterized queries and trusted customer scope. Add a fake carrier API that can return a normal event, an unknown status or a timeout.

Demonstrate that changing a model-supplied order identifier cannot expose another customer's record. Inspect the normalized observation and remove every field that the answer does not need.

## Completion checklist

- Credentials and identity scope stay outside model-controlled arguments.
- Queries use supported parameterization and explicit authorization filters.
- API adapters enforce allowed destinations, timeouts and response validation.
- Traces identify failures without exposing sensitive payloads.

## Continue learning

[Design useful tool contracts](/articles/engineering-reliable-agent-tools). [Connect via MCP](/articles/engineering-first-mcp-integration).

## References

- [Python sqlite3 documentation](https://docs.python.org/3/library/sqlite3.html)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
- [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/)
