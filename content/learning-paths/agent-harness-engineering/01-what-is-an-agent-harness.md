# What Is an Agent Harness?

A model can propose a useful next action without being able to manage an entire job. It might choose a search tool, interpret the result and ask for another search. Something still has to call the model, execute the tool, store the result and decide whether execution may continue. That surrounding software is the agent harness. Understanding this boundary helps you improve reliability without expecting a better instruction to solve every operational problem.

## Separate reasoning from execution

Think of a research assistant preparing a supplier comparison. The model reasons about which facts are missing. The harness provides a constrained search tool, records which supplier pages were retrieved and makes a new model request with those observations. If the model proposes emailing the comparison, the harness checks whether that action is authorized. The model's suggestion is an input to a decision process; it is not an execution permission.

A useful harness usually manages an execution loop, context construction, tool dispatch and persistent run state. Production needs can add budgets, approval requests, isolation, tracing and recovery. These responsibilities do not require a large framework. A small program with explicit contracts can be easier to inspect than a collection of loosely coordinated abstractions. Add machinery to address observed failures and requirements.

The distinction is functional rather than a naming rule. A product called a framework may supply a complete harness, and a small SDK application may implement one. Identify the actual behavior: who enforces limits, who holds credentials and who remembers an unfinished operation after a crash?

## Work through one task

Suppose the user asks, “Compare three suppliers using public information and save a draft.” Begin with a run record containing the request, allowed tools, output location and a maximum number of steps. On each iteration, build the model input from trusted instructions, current task state and relevant observations. Validate the model response before selecting either a final answer or a tool execution.

```text
run = create_run(request, policy, budget)
while run.may_continue():
    proposal = model(build_context(run))
    if proposal.is_final:
        verify_completion(proposal, run)
        return finish(run, proposal)
    call = validate_tool_request(proposal)
    authorize(call, run.policy)
    observation = execute(call, run.execution_context)
    append_event(run, call, observation)
return stop_with_reason(run)
```

This is teaching pseudocode, not a complete secure runtime. Notice that the harness owns continuation and authorization. A tool result cannot grant itself new privileges. Saving a draft must use a permitted location, and a network operation must use a controlled interface. A final message saying “done” does not prove that a file exists or contains the required comparison.

## Recognize the limits of a loop

A loop alone does not make long work reliable. If the process exits after saving a draft but before recording success, restarting may repeat the write. If tool output fills the context window, the next model request may lose essential constraints. If a search result contains malicious instructions, the model may request an unrelated action. Each failure belongs to a different harness responsibility, so describe it precisely before adding a fix.

Use a run identifier to tie actions and observations together. Preserve execution facts separately from model-authored summaries. Store the original user request and policy as immutable inputs to a run version. Keep terminal states explicit: completed, failed, cancelled or awaiting review. A stopped run should tell its caller what was achieved and what remains uncertain.

Harnesses support evaluation, but an agent harness is different from an evaluation harness. The agent harness performs the job. An evaluation harness supplies test cases, resets environments, runs trials and grades outcomes. You can test several agent harness versions with the same evaluation harness to understand whether runtime changes improve results.

## Practice

Draw a supplier-research run from request to saved draft. Mark every place that needs model reasoning, deterministic validation, durable storage or user authorization. Inject a malformed tool argument and an unavailable search service. Write down the expected state transition for each failure. Then explain which evidence would prove that the output was saved correctly without relying on the model's final message.

## Completion checklist

- Identify the component that actually executes each tool.
- Explain why model output cannot grant execution permission.
- Name the persistent facts required to understand a stopped run.
- Distinguish agent execution from evaluation infrastructure.

Continue with [Models, Frameworks, Harnesses and Sandboxes Explained](/articles/harness-models-frameworks-harnesses-sandboxes) and [Build a Minimal Agent Execution Loop](/articles/harness-minimal-execution-loop).

## References

- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
