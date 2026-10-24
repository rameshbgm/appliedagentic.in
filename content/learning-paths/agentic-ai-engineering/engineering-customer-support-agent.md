# Build a Customer Support Agent with Human Handoff

A customer support agent needs more than a friendly tone. It must identify the kind of request, use the right information source and recognize when the next decision belongs to a person. This project combines policy retrieval with authenticated order lookup and an explicit handoff path. The first version remains read-only.

Use fictional customers and orders. Include questions about warranties, shipment status and compensation. These requests look similar in conversation but require different evidence and authority. A reliable design makes those differences explicit.

## Define supported intents and boundaries

Begin with three supported outcomes: answer a public policy question, explain the status of an accessible order, or prepare a staff review packet. Unsupported requests should receive a clear limitation and an appropriate next step. The agent should not claim it can modify an order when no such operation exists.

For policy questions, retrieve applicable documents. For account-specific questions, authenticate the requester and enforce record scope in server code. For compensation decisions, retrieve the relevant policy but escalate any judgment the product has reserved for staff.

Do not use conversational familiarity as proof of identity. A person who knows an order number is not necessarily authorized to inspect it. The tool adapter must enforce the same access rules as the normal application.

## Build a small routing workflow

A model-assisted classifier can choose the likely intent, but the application owns the route list and permissions. Include an ambiguous route that asks for clarification. A question containing both a tracking request and a policy complaint may require more than one supported step.

A useful workflow sketch is:

```text
Receive request and trusted session
Classify supported intent
Retrieve policy or authorized order evidence
Check whether evidence supports a complete answer
If unresolved or staff judgment required:
    create a review packet
Otherwise:
    deliver a grounded answer with source details
```

Keep the review-packet operation separate from external messaging. Creating an internal task record does not automatically authorize sending email or contacting a third party. Integrate those capabilities only when the product explicitly requires and governs them.

## Design the customer-facing answer

A good answer states what is confirmed, what remains uncertain and what happens next. For a carrier exception, identify the last observed status and time. Avoid promising a new delivery date unless the evidence establishes it.

Use understandable citations. Public policy links can be shown directly. Internal order evidence may need a safe source label or account page rather than a raw database identifier. Never expose another customer's information in the answer or its references.

If the system hands off, say that review is pending and identify what the reviewer will decide. Do not tell the customer a resolution is complete when the agent has merely drafted a recommendation.

## Preserve continuity in the handoff

The staff packet should include the customer's goal, relevant order, selected evidence, attempted operations and unresolved decision. Distinguish direct source facts from the agent's suggestion. Include the exact policy passage that motivated escalation.

Persist the packet with an accountable owner or queue. A boolean `needs_review` field without a recipient leaves the task unfinished. Define how staff accept, decline or request more information, and how the customer can see the resulting status.

Test repeated requests. If the customer refreshes or asks again, the system should find the existing open review rather than create duplicate cases. Use stable task identifiers and deliberate deduplication rules.

## Evaluate representative behavior

Build fixtures for a public policy answer, a normal order lookup, an unauthorized order, ambiguous identity, a carrier timeout and a staff-only exception. Inspect the route, tool calls, evidence and final response. A polite answer with the wrong record is a failed case.

Add a retrieved note containing a malicious instruction. Verify that it cannot change tool permissions or force disclosure. The goal is layered enforcement: the model should treat notes as evidence, while the application independently blocks unauthorized operations.

## Exercise

Implement the read-only support workflow with fixture tools. Produce one complete answer and one staff packet. Then simulate a duplicate customer request and a missing carrier record. Show that the agent preserves useful progress without inventing an outcome or creating redundant reviews.

## Completion checklist

- Intent routing leads to the correct evidence source.
- Account lookups enforce trusted authentication and scope.
- Answers separate confirmed facts from unresolved issues.
- Human handoffs preserve evidence and have an accountable destination.

## Continue learning

[Design review mechanics](/articles/engineering-human-review-escalation). [Connect scoped services](/articles/engineering-apis-databases).

## References

- [OWASP prompt injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
