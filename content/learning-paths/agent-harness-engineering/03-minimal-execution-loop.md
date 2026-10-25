# Build a Minimal Agent Execution Loop

A minimal harness is useful because you can inspect every transition between reasoning and action. Start with a read-only task: an agent may search a local document collection and produce a cited answer. Keep network writes and arbitrary code outside the initial tool set. The goal is to establish a sound execution contract before adding more capability.

## Define the response contract

Represent model responses as a discriminated choice: either a final answer or a request for one allowed tool. Do not search free-form prose for a command to execute. Parse the provider response, validate its structure and reject unknown variants. Tool names must resolve through your registry, not through dynamic evaluation of strings.

Define one search tool with a query string and a bounded result count. Require a nonempty query, enforce a maximum query length and reject unexpected properties. Schema validation catches malformed structure; application validation still decides whether a collection belongs to the current tenant. A valid identifier can reference an unauthorized resource.

A model request also needs an explicit budget. Start with six model turns and a per-tool timeout appropriate to your local search service. These numbers are exercise settings, not universal recommendations. Budget exhaustion should produce an honest partial result and a machine-readable stop reason rather than pretending the task succeeded.

## Implement the control flow

The following pseudocode emphasizes responsibility boundaries. Storage and model adapters are intentionally abstract so the pattern can be implemented with different providers.

```text
run = store.create(request, tenant, limits)
for step in range(run.max_steps):
    if store.cancel_requested(run.id):
        return store.finish(run.id, "cancelled")
    response = model.call(context_for(run))
    proposal = parse_response(response)
    store.append(run.id, "model_response", proposal)
    if proposal.kind == "final":
        return store.finish(run.id, "completed", proposal.answer)
    tool = registry.require(proposal.tool_name)
    arguments = tool.schema.validate(proposal.arguments)
    policy.require_allowed(run, tool, arguments)
    result = tool.execute(arguments, deadline=run.deadline)
    store.append(run.id, "tool_result", bound_output(result))
return store.finish(run.id, "step_limit")
```

If your provider can return multiple tool calls, decide explicitly whether your first implementation supports them. Reject an unsupported shape or execute calls under a documented ordering rule. Accidental parallel execution becomes dangerous once tools share state. Do not let an implementation convenience quietly establish concurrency semantics.

## Make errors part of the protocol

A tool failure should return a structured observation such as category, retryability and a safe message. Avoid returning raw stack traces or credentials to the model. A missing document and a service outage mean different things: the first may be evidence about the task, while the second means the agent could not inspect the evidence.

Handle provider errors outside the model conversation. If authentication fails, terminate with a configuration error. If a request is rate-limited, the harness may retry within its deadline. If the response fails validation repeatedly, stop with an explicit protocol failure. Asking the model to fix malformed output should not create an unbounded loop.

## Inspect a worked run

Ask, “What is our documented retention period for support transcripts?” The first search returns two policies, one superseded. The second search retrieves the current policy's revision date. The final answer cites the current document and notes the relevant scope. Your trace should connect the question, both searches, document identifiers and final answer.

Now remove the current policy from the collection. A sound run can finish by saying the available evidence is insufficient. Completion means the task's response contract was fulfilled, not that the model always found an affirmative answer. Evaluate citation correctness separately rather than hard-coding the expected prose into the harness.

## Review the boundary before expanding

Keep the first implementation deliberately observable. A developer should be able to reconstruct every tool call from stored events and identify the exact input that produced it. Do not add a general shell merely because one search query is inconvenient to express. Improve the narrow tool contract first. Before adding a write tool, introduce an action ledger and decide how recovery handles a lost response. This sequencing lets each new capability inherit explicit controls instead of creating a second, less disciplined execution path.

## Practice

Implement the loop with a deterministic fake model first. Feed it an unknown tool, oversized arguments, two tool calls and a final answer after the step budget expires. Then connect a real model adapter. Keep the same invariants and inspect how often real responses exercise paths your fake tests missed.

## Completion checklist

- Dispatch tools only through an explicit registry.
- Validate structure and authorize resources separately.
- Bound turns, tool duration and observation size.
- Preserve distinguishable stop reasons and safe errors.

Continue with [Run Lifecycle Design](/articles/harness-run-lifecycle) and [Tool Registries with Schema Validation](/articles/harness-tool-registry-validation).

## References

- [JSON Schema: Object validation](https://json-schema.org/understanding-json-schema/reference/object)
- [Node.js: AbortController and AbortSignal](https://nodejs.org/api/globals.html#class-abortcontroller)
