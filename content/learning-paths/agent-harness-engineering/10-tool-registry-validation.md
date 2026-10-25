# Build a Tool Registry with Schema Validation

A tool registry is the boundary between a model's proposed action and application code. It maps a limited set of names to validated, authorized implementations. A reliable registry does more than list functions: it defines input and output contracts, execution properties and policy information that the harness can enforce consistently.

## Specify a tool contract

For each tool, record a stable name, schema version, input schema, output schema and implementation. Add whether it is read-only, which resource scopes it requires, its timeout and maximum output size. A write tool should declare its idempotency and reconciliation behavior. These declarations help the runtime choose a safe execution path without inferring risk from a function name.

Make required fields explicit and decide whether additional properties are allowed. Validate nested objects and array limits. A schema that accepts any string for a URL still needs application checks for destination access and unwanted internal network requests. Structural validation and business authorization are different decisions.

Do not let the model choose implementation paths, executable module names or class constructors. Resolve the validated public tool name through an in-memory or database-backed registry controlled by the application. Unknown names should produce a bounded protocol error, not a dynamic import attempt.

## Design a document search tool

Consider search_documents with query, collection_id and max_results. The schema bounds query length and max_results. The policy layer verifies collection ownership using the run's tenant identity. The implementation uses parameterized database access and returns document identifiers, excerpts and source versions. It does not return raw credentials or unrelated database columns.

```text
proposal = parse_model_tool_call(response)
tool = registry.lookup(proposal.name, run.toolset_version)
args = validate(tool.input_schema, proposal.arguments)
resource = resolve_resource(args.collection_id)
authorize(run.principal, tool.required_scope, resource)
result = tool.execute(args, scoped_execution_context)
validate(tool.output_schema, result)
return bounded_observation(result)
```

The execution context carries tenant identity and scoped credentials supplied by the server. Do not accept tenant_id from the model as proof of identity. If the API requires it in arguments, compare it to the authenticated execution context or remove it from the model-visible schema entirely.

## Treat outputs as untrusted data

Tools can fail, return malformed payloads or expose hostile document text. Validate the output envelope before passing observations onward. Keep status, error category, provenance and data separate. A document excerpt containing an instruction is still document content. Do not promote it to a policy change or use it to register new tools.

Bound outputs in bytes or tokens and preserve a reference to the complete artifact where useful. If an output is truncated, include that fact. A model should be able to request an authorized page or range instead of receiving an unmarked fragment that appears complete. Preserve stable result identifiers so later citations can be checked.

## Version tools deliberately

Changing argument meaning without changing a schema version can break resumed runs. If collection_id once meant a public collection and now means a tenant-private workspace, old calls may be interpreted incorrectly. Keep old adapters available for active runs or migrate checkpoints explicitly. Record the effective toolset version in every run.

Test the registry with unknown tools, extra properties, oversized arrays, unauthorized identifiers and invalid output payloads. Use deterministic tests for these rules; asking a model whether validation worked is unnecessary. Then run model-driven evaluations to discover confusing descriptions or argument patterns that your deterministic fixtures did not anticipate.

## Design descriptions for correct use

A precise tool description should explain the operation's purpose, important argument meanings and meaningful failure categories. Avoid exposing implementation secrets or implying permissions broader than the runtime grants. Give similar tools clearly distinct responsibilities so the model does not have to guess whether save_draft also publishes. Evaluate confusing selections with representative tasks, then improve descriptions or merge redundant tools where appropriate. The registry is both an execution contract for software and an interface that a model must learn to use from supplied context.

## Practice

Implement search_documents and save_draft in a small registry. Give each a distinct permission scope and output limit. Feed the runtime five invalid calls, including an authorized-looking collection identifier from another tenant. Confirm that no implementation executes before both validation and authorization succeed, and that failures produce safe, useful observations.

## Completion checklist

- Resolve tools through a controlled registry.
- Validate nested inputs and bounded outputs.
- Bind resource access to authenticated execution context.
- Version tool semantics for resumable runs.

Continue with [Sandboxed Code and File Operations](/articles/harness-code-file-sandboxing) and [Execution Policies](/articles/harness-tool-execution-policies).

## References

- [JSON Schema: Object validation](https://json-schema.org/understanding-json-schema/reference/object)
- [Model Context Protocol: Security best practices](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices)
