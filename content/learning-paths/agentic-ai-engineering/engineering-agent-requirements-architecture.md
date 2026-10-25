# Define Your Agent’s Requirements and Architecture

The capstone begins with a requirement document, not a framework choice. You will build a delivery investigation assistant that explains the latest permitted order status and prepares a staff review packet when necessary. The project combines retrieval, authenticated tool use, structured state and human handoff without granting unrestricted business authority.

Use fictional fixtures throughout development. The design should be realistic enough to expose authorization and evidence problems while remaining reproducible for another learner. A reviewer must be able to tell what the agent is supposed to do before reading its implementation.

## Describe users and supported tasks

Identify the primary user and the decisions the assistant supports. A customer wants to understand a delayed shipment. A support reviewer wants a concise account of unresolved evidence. These users need different views of the same task, with appropriate access restrictions.

Write three supported tasks: explain a normal shipment, investigate a carrier exception and prepare a staff review packet. Add explicit unsupported tasks such as issuing compensation, modifying delivery addresses or contacting external parties. Unsupported capabilities should be absent from the tool set, not merely discouraged by wording.

For each task, define required inputs and acceptable outcomes. Ambiguous order identity should produce clarification. Missing carrier evidence should produce a qualified answer or escalation. A complete answer is not mandatory when the evidence cannot support one.

## Define evidence and output contracts

Specify the authoritative sources for each fact. Order ownership comes from authenticated application records. Carrier status comes from a carrier adapter. Policy eligibility comes from an applicable document version. The model should not resolve these facts by inventing plausible details.

Define the output fields before writing prompts. A useful response includes outcome, explanation, source identifiers, observation times, missing information and review status. Review packets need the unresolved decision and completed checks.

Write validation rules for both shape and meaning. Required JSON fields can be checked with a schema. A cited carrier event belonging to the identified order requires a semantic or relational check. Keep those validation layers separate in the architecture.

## Draw the trust boundaries

The user request and retrieved documents are untrusted inputs. The authenticated session, authorization service and tool implementations establish trusted scope. Model outputs propose actions but do not authorize them.

A practical architecture is:

```text
User interface -> authenticated task service
Task service -> context builder -> model adapter
Model proposal -> validator -> scoped tool adapter
Tool observation -> task state and evidence store
Validated final result -> user interface or staff review queue
```

Identify where credentials live, which records persist and who can inspect traces. Model context should contain only information needed for the current task. Review access and retention for stored documents, tool results and generated responses.

## Set measurable acceptance conditions

Create named fixture cases and expected outcomes. A normal shipment must cite the latest available event. An unauthorized order must return no private details. A carrier timeout must not become a confident current-status claim. A duplicate review request must not create redundant cases.

Include operational limits as requirements. Specify maximum execution time, bounded tool use and cancellation behavior. Choose provisional values that fit your fixture task, then refine them from measured runs. Distinguish a product requirement from an arbitrary implementation default.

Document assumptions. Perhaps the carrier API returns events in a stable schema, or the fixture policy corpus has complete version metadata. If those assumptions are false in production, the design needs additional handling rather than optimistic inference.

## Exercise

Write a two-page capstone specification containing users, supported tasks, non-supported actions, data sources, tool contracts, state fields and acceptance cases. Draw the architecture and label each trust boundary.

Give the specification to another learner and ask them to identify one ambiguous completion rule and one missing failure outcome. Resolve both before implementation. Then choose the smallest architecture capable of satisfying the agreed cases.

## Completion checklist

- Supported tasks and acceptable incomplete outcomes are explicit.
- Each material fact has an identified authoritative source.
- Trust boundaries keep permissions outside model control.
- Named fixture cases make the requirements independently testable.

## Continue learning

[Implement the capstone workflow](/articles/engineering-end-to-end-business-workflow). [Review component responsibilities](/articles/engineering-agent-anatomy).

## References

- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
- [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/)
