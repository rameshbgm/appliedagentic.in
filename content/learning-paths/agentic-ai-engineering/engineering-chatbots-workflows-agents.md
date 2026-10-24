# Chatbots, Workflows and Agents: Choosing the Right Approach

A team asks for an AI assistant to answer customer questions and resolve requests. That description hides several different engineering problems. Explaining a return policy requires access to reliable information. Checking an order requires authenticated retrieval. Issuing a refund changes a business record. Before choosing a framework or model, decide which decisions need language understanding and which actions should remain ordinary application logic.

This lesson uses a fictional office equipment supplier. Its customers ask about delivery, warranties and invoices. The examples are design exercises, not claims about a deployed service. The goal is to choose an architecture whose behavior you can explain and test.

## Identify the source of uncertainty

A chatbot describes an interaction style: users exchange messages with a system. The implementation behind that interface may be a single model call, retrieval followed by generation, a workflow or an agent. Calling something a chatbot tells you little about its access or decision-making authority.

A workflow follows a program-defined sequence. For an invoice request, authenticate the user, fetch the permitted invoice, format the response and return it. A language model can classify the request or explain the result without choosing the next action. The application determines what happens if the invoice is missing.

An agent chooses among available actions based on the current task and observations. A delivery investigation might require looking up an order, checking which carrier has it, then deciding whether tracking details answer the question. That flexibility is useful when the appropriate sequence cannot be fixed beforehand. It also creates more possible failure paths.

## Separate flexibility from authority

The need to choose tools does not automatically justify permission to change data. A research agent can investigate broadly while remaining read-only. A tightly scripted workflow can still perform a consequential action. Treat decision flexibility and action authority as separate design dimensions.

For each candidate action, record its inputs, authorization rule, observable result and reversibility. A customer-facing answer and a refund should not share an undifferentiated permission flag. Authentication belongs to trusted application code; model-generated customer identifiers must never establish ownership of an order.

Bound the agent's choices with a small tool set. If a task can be solved with order lookup and carrier lookup, exposing the entire company database increases risk and confusion without adding useful capability.

## Work through an architecture decision

Consider three requests. “What is your warranty period?” can use retrieval and a single grounded answer. “Send me invoice INV-204” can use a fixed authorized retrieval workflow, with a separate delivery step if sending is permitted. “Why has my shipment stopped moving?” may justify a bounded investigative agent because its next lookup depends on earlier results.

A decision record for the third request could read:

```text
Goal: explain shipment status using permitted records
Allowed actions: lookup_order, lookup_carrier_event
Maximum tool calls: 4
Successful result: dated explanation with source identifiers
Escalation: conflicting records or missing carrier evidence
Forbidden action: modify shipment or promise compensation
```

The limit of four is an illustrative product choice, not a recommended universal value. Test it against representative tasks. If the agent repeatedly reaches the limit while making valid progress, reconsider the task boundary or tool design before raising it.

## Evaluate the simplest candidate first

Implement a small baseline before adding dynamic planning. Record whether each test request was answered correctly, which facts were missing and whether the system attempted an unauthorized action. A flexible agent is justified when it fixes observed limitations and the additional cost and execution time fit the product.

Inspect failed examples rather than judging only fluent answers. A convincing explanation built from the wrong customer's order is a severe failure. A clear request for missing information can be a correct outcome. Define both in advance so that the system is not rewarded simply for always producing an answer.

## Exercise

Collect six fictional support requests. For each, choose a single-call answer, a fixed workflow or a bounded agent. Explain the uncertainty that motivates your choice. List available data, permitted actions and a stopping condition. Then identify one request that should escalate because the evidence is insufficient.

Build a paper trace for two of the requests. Write the user input, each permitted operation and the expected result. A colleague should be able to follow the trace without guessing hidden business rules.

## Completion checklist

- I can distinguish the conversation interface from the execution architecture.
- Every proposed action has an authorization rule outside the model.
- My design explains why dynamic tool selection is needed.
- I have a simpler baseline and a defined escalation outcome.

## Continue learning

[Explore agent components](/articles/engineering-agent-anatomy). [Build the first loop](/articles/engineering-first-tool-using-agent).

## References

- [Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
