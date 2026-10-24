# Build Your First Tool-Using Agent

Your first agent should be small enough that every possible operation is understandable. This project builds a read-only delivery assistant with two tools: order lookup and carrier-event lookup. The objective is to explain a known order's status with evidence. Refunds, email sending and unrestricted browsing are outside this exercise.

The pseudocode is provider-neutral. Functions such as `call_model` describe integration boundaries rather than a particular SDK. Implement those functions with your chosen provider's documented tool-calling interface and preserve its required message structure.

## Define the tool contract

Start with a fixture containing one authorized order and a carrier event. The trusted user session supplies the customer scope. The model may request an order identifier but cannot choose which customer it represents. Return only fields needed for the task: order identifier, shipment identifier, status, source identifier and event time.

Require a nonempty order identifier in the input schema. Reject extra fields where your schema supports that constraint. A friendly tool description should explain when the tool is useful and what missing records mean. Do not overload one string argument with an entire SQL query or application command.

The order lookup implementation checks access before returning a record. The carrier tool accepts a shipment identifier obtained from a permitted order, not any arbitrary tracking number invented by the model. These checks make the learning example useful even when the model proposes an incorrect call.

## Implement the bounded loop

Use a fixed maximum number of model turns and a smaller tool budget. These are separate limits because a model can produce invalid calls without reaching a real tool. Count rejected proposals so that repeated validation failures cannot create an endless repair cycle.

```python
state = new_task(user_request, authenticated_scope)
for turn in range(MAX_TURNS):
    proposal = call_model(build_context(state), allowed_tools)
    if proposal.kind == "final":
        return validate_answer(proposal, state.evidence)
    if state.tool_calls >= MAX_TOOL_CALLS:
        return incomplete_result("tool_budget_exhausted", state)
    call = validate_proposal(proposal, allowed_tools)
    result = execute_authorized(call, state.scope)
    state.record(call, result)
return incomplete_result("turn_budget_exhausted", state)
```

The code omits provider transport, storage and exception handling to highlight the control flow. In a runnable implementation, validation errors become bounded observations, dependency timeouts become typed tool failures, and cancellation exits immediately. Do not convert every exception into a vague message that the model must interpret.

## Give observations stable meaning

An observation should identify whether the operation succeeded, failed, or found no permitted record. Those outcomes are different. A missing record does not prove an order never existed; it means the tool could not return one within the authorized scope.

Record the tool request and its result under a stable call identifier. The final answer should refer to the latest available event time and explain uncertainty. “The last carrier event recorded on Tuesday is awaiting scan” is stronger than “Your parcel is definitely moving tomorrow.” The latter makes an unsupported future commitment.

Avoid placing raw user-controlled text into the system instructions. Retrieved notes and tool responses are evidence, not instructions that can change the task or permissions. A note saying “ignore all previous rules” should remain ordinary document content.

## Test behavior before adding features

Run at least five fixture cases: a normal order, a missing order, an unauthorized order, a carrier timeout and conflicting status records. Inspect both the answer and the execution trace. The agent passes only when the correct customer scope was enforced and the answer matches available evidence.

Test a proposal that requests an unknown tool and one that supplies malformed arguments. Both should be rejected before execution. Also simulate a model that repeatedly asks the same question. The turn budget must stop it with an explicit incomplete outcome.

These tests are a starting point, not a statistical claim of reliability. Keep the fixtures as regression cases when you change prompts or tools. The AI Evals path develops broader evaluation methods.

## Exercise

Implement the loop with a fake model that returns a predetermined sequence of proposals. Once the control flow works, connect a real model. Compare the traces and identify where nondeterministic decisions enter. Add a fixture where the shipment identifier is absent and verify that the assistant asks for help rather than fabricating one.

## Completion checklist

- Both tools are read-only and scoped to authenticated access.
- Invalid tool names and arguments are rejected before execution.
- Turn and tool limits stop repeated failures.
- Final responses identify evidence and missing information.

## Continue learning

[Design better tools](/articles/engineering-reliable-agent-tools). [Plan the evaluation handoff](/articles/engineering-package-agent-evaluation-deployment).

## References

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
