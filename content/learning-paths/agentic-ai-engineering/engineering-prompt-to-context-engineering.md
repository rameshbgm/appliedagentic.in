# From Prompt Engineering to Context Engineering

A strong instruction cannot compensate for missing evidence, stale state or an overwhelming transcript. Context engineering treats the complete information supplied to a model as an engineering artifact. That includes instructions, user intent, retrieved material, tool descriptions, prior observations and output requirements. The question is what the model needs for the next decision, not how much information can be squeezed into a request.

Consider an assistant explaining a delivery delay. The next useful action may require the shipment identifier and last carrier event. Hundreds of earlier chat messages about unrelated invoices are unlikely to help. Good context makes the relevant decision easier while keeping its limitations visible.

## Design a context contract

Define the purpose of each context component. Instructions establish the task and behavioral boundaries. Trusted state identifies the authenticated scope and progress. Evidence supplies facts from external records. Tool descriptions explain the available operations. Output requirements describe the response the application can accept.

Keep these categories distinguishable in your message construction. A retrieved page can contain text that resembles an instruction; its position as evidence should not grant it permission to override the application. Separate formatting does not by itself prevent prompt injection, so enforce permissions in the tool layer too.

A context contract should say which fields are required and which are optional. For a delivery explanation, require order identifier, latest known event and source time. If current tracking is unavailable, explicitly include that absence. Otherwise the model may interpret an omitted field as permission to infer a plausible fact.

## Select information for the next decision

Ask what decision happens next. Before order lookup, the model needs the user's request and eligible tool contract. After lookup, it needs the returned shipment identifier and the reason a carrier call may help. Before final synthesis, it needs the selected evidence and any unresolved disagreement.

This staged approach avoids presenting every tool and document at every turn. It also reduces accidental reliance on irrelevant instructions. Selection should be based on explicit task fields, access rules and measured usefulness, not only on similarity to the user's wording.

Record why evidence was selected in application metadata. A source may be relevant because it contains the exact order identifier, because it is the latest permitted record, or because it contradicts another observation. Those reasons help reviewers diagnose selection failures later.

## Build a useful evidence packet

The following packet illustrates structure rather than a provider-specific format:

```text
Task: explain delay for authorized order O-204
Known facts:
- Order record says dispatched; observed at 10:20 UTC
- Carrier record says awaiting first scan; observed at 10:25 UTC
Unresolved issue: no physical carrier scan is available
Allowed next action: retrieve permitted carrier events
Final answer requirement: separate confirmed facts from uncertainty
```

The packet preserves a disagreement rather than compressing both records into “shipment in transit.” It contains timestamps and distinguishes an internal dispatch status from a carrier observation. The model can now explain what each source establishes.

Avoid inserting a long narrative summary when structured fields would preserve the meaning more precisely. Summaries are useful, but they can silently remove qualifications. Keep source identifiers so that a reviewer can return to the original observation.

## Measure context changes as product changes

Removing information may improve focus or remove necessary evidence. Adding examples may clarify the task or cause inappropriate copying. Treat both as hypotheses. Run the same representative requests before and after a context change and inspect factual accuracy, correct tool selection and appropriate uncertainty.

When a failure occurs, distinguish four causes: the right fact was unavailable, available but not selected, selected but misinterpreted, or contradicted by another source. Each requires a different fix. Increasing the context limit addresses none of these automatically.

Keep a version for the context builder, not just the instruction text. A deployment that changes retrieval filters can alter behavior even when the prompt stays identical.

## Exercise

Capture a fictional agent request as a context inventory. Label every piece as instruction, trusted state, evidence, tool contract or output requirement. Remove irrelevant items, preserve identifiers and timestamps, and write a reason for every remaining component. Then create a second packet for a later step in the same task.

Ask a colleague to answer the question using only each packet. If they need a missing fact, your agent probably will too. Add a test case that protects this fact from future context changes.

## Completion checklist

- Each context component has a purpose and a trust level.
- Missing facts and contradictions remain explicit.
- Evidence includes identifiers and observation times.
- Context-builder changes have repeatable behavioral checks.

## Continue learning

[Design structured instructions](/articles/engineering-instructions-examples-structured-outputs). [Select context by task](/articles/engineering-select-context-each-task).

## References

- [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
