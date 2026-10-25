# Models, Frameworks, Harnesses and Sandboxes Explained

Architecture discussions become confusing when every component is called an agent platform. A model, framework, harness and sandbox solve different problems, even when one product packages all four. Drawing those boundaries makes operational decisions concrete. You can then change a model without silently changing permissions, or replace an execution environment without rewriting the business workflow.

## Map four responsibilities

The model produces responses from supplied context. Depending on its interface, a response can contain text, structured data or proposed tool calls. It does not automatically know the current filesystem or your application's authorization rules. Those capabilities come from the surrounding application.

A framework supplies reusable development abstractions: tool definitions, graph nodes, message types or persistence integrations. It can reduce repetitive code, but its guarantees depend on how those components are configured. Importing a library does not establish your application's recovery behavior or tenant boundary.

The harness controls a particular execution. It constructs context, invokes the model, dispatches permitted tools, records observations and decides what happens next. The sandbox constrains code execution through operating system or virtualization controls. It can restrict files, network access and resources. Calling a directory a workspace does not make it an isolation boundary.

## Follow a coding task across the boundaries

Imagine an assistant repairing a failing report generator. The model proposes reading the test output. A framework may translate that proposal into a typed tool call. The harness validates the tool name, checks run permissions and sends it to a worker. The worker runs a command inside a sandbox with a limited workspace and resource allocation. The result returns through the harness, which filters it, stores an event and decides how much output to include in the next request.

```text
user task -> harness -> model proposal
                 |
          policy + validation
                 |
          sandboxed tool worker
                 |
      durable observation -> next model turn
```

Assign ownership explicitly. The harness should not trust the model to enforce a timeout. The sandbox should not infer whether the user approved a particular external publication. The framework should not decide which customer owns a resource unless your application supplies that context. Security and business intent meet at deliberate interfaces.

## Compare implementation options

For a read-only internal assistant, a harness may expose narrow server-side tools without allowing arbitrary code. A separate code sandbox may be unnecessary because the model cannot submit executable programs. You still need authorization, input validation, output limits and protection against unintended network requests.

For an assistant that edits and runs customer-provided code, the execution environment requires stronger separation. Review whether a container shares a kernel, whether privileged mode is enabled, what directories are mounted and whether the host's container socket is reachable. A permissive container can expose the host despite looking like a separate environment. The correct boundary depends on your threat model and hosting controls.

A framework can accelerate either design. Evaluate it against required behaviors rather than its vocabulary. Ask whether you can persist a run before dispatching work, reject a tool call after schema validation, revoke authorization while waiting for approval, and inspect a complete execution trace. If a library hides these transitions, decide whether extension points are sufficient before building around it.

## Avoid responsibility gaps

Write a responsibility table with a single owner for each invariant. For example, “all writes stay inside the assigned workspace” belongs to the tool worker and operating system boundary; “a reviewer approved this exact deployment” belongs to policy enforcement; “an interrupted payment is not duplicated” requires a durable action record and provider reconciliation. Several layers can contribute, but ownership must remain clear.

Version these layers independently in run metadata. Record the model identifier, tool schema version, harness build and environment image digest. If results change, this information helps identify whether the cause was reasoning, orchestration, dependency changes or execution conditions. A model label alone cannot reproduce the run.

## Practice

Take a small agent application and label every dependency as model access, development abstraction, execution control, storage or isolation. Then remove the framework from your diagram and describe which responsibilities remain. Compare a read-only document assistant with a code-executing assistant, and justify the different environment controls each one needs.

## Completion checklist

- Explain the role of each architectural component.
- Identify a real isolation boundary rather than a naming convention.
- Assign ownership for permission checks and execution limits.
- Record enough version information to compare runs.

Next, implement [a Minimal Agent Execution Loop](/articles/harness-minimal-execution-loop) and examine [Tool Runtime Isolation](/articles/harness-code-file-sandboxing).

## References

- [Docker: Engine security](https://docs.docker.com/engine/security/)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
