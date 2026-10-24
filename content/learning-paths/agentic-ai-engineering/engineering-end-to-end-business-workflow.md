# Implement an End-to-End Business Workflow

The capstone specification now becomes a working application. Build the delivery assistant as a small collection of explicit components rather than a single large prompt. The model adapter handles provider-specific messages. Tool adapters handle business operations. The controller manages the loop. State and evidence stores make the run inspectable.

Begin with fixtures and a fake model. This may feel slower than connecting a live model immediately, but it separates ordinary software errors from uncertain model behavior. Once the control flow is correct, replace the fake adapter without changing authorization or completion rules.

## Implement adapters independently

Create an order adapter that accepts a validated identifier and trusted customer scope. Return a minimal typed observation. Create a carrier adapter with a fixed destination, response validation and a finite timeout. Create a policy retriever that enforces access and document applicability.

Test each adapter directly. A model is unnecessary for checking that another customer's order cannot be read. Likewise, malformed API responses should fail in the adapter before they enter a context packet.

Use stable source identifiers and observation times in successful results. Keep dependency failures distinct from absent records. A timeout does not establish that no shipment event exists, and an unauthorized lookup should not expose private record existence.

## Build the controller and task state

The controller should accept a goal and trusted scope, create a task record, assemble context and process proposals. Track attempted calls, evidence, remaining budget and terminal status. Count invalid proposals as attempts so repeated repair cannot run indefinitely.

A high-level implementation sequence is:

```text
Create task with authenticated scope
Load fixture evidence or invoke permitted read tools
Build the next context packet
Validate the model proposal
Execute only permitted operations within the remaining budget
Persist observation and updated task state
Validate the final answer or prepare a review packet
```

Persist important state transitions before reporting them as complete. If the application says a review case exists, that case should already be stored. Avoid acknowledging an operation based only on a model's intention to perform it.

## Connect the live model behind a narrow interface

Define a model-adapter response with known kinds such as tool proposal, clarification and final answer. Map your provider's actual response format into this internal representation. Preserve required tool-call identifiers when building subsequent provider messages.

Keep provider-specific details out of business adapters. If you change the model provider later, order authorization and carrier response validation should remain the same. Record the model configuration and prompt or context-builder version for each run.

Use structured outputs where supported, but continue application-side validation. A response can match the schema while citing an unavailable source or making a claim inconsistent with the selected evidence.

## Implement the review path

Create review packets only for defined triggers. Include the original goal, selected evidence, completed checks and unresolved decision. Assign the packet to a real application queue or owner in the fixture system.

Give the customer a truthful status. “Your case is awaiting review” should correspond to a persisted record. If packet creation fails, report that the automatic investigation could not complete and retain the task for recovery; do not claim the handoff succeeded.

Use a stable task identifier for retry and duplicate detection. Resuming the same request should retrieve the existing review record rather than blindly create another one. Any future mutation path will also need action-specific idempotency and fresh authorization.

## Verify the full workflow

Run the acceptance fixtures from the specification. Inspect the final answer and trace together. Check that unauthorized data never entered the model context, that citations match evidence and that terminal states reflect actual outcomes.

Then introduce failures at each boundary: missing order, malformed carrier response, unavailable policy source, invalid model proposal and failed review persistence. A useful implementation tells you which component failed and preserves safe partial progress.

## Exercise

Build the fixture implementation and record one successful trace and one escalated trace. Replace the fake model with a live adapter and rerun the same cases. Identify which outputs became variable and which controls remained deterministic.

Prepare a short implementation note describing component boundaries, configuration and how another learner can run the fixtures without production credentials.

## Completion checklist

- Business adapters can be tested without a model.
- The controller enforces budgets and persists meaningful transitions.
- Live model output is validated before tools or UI use it.
- Review creation and duplicate handling reflect actual stored state.

## Continue learning

[Package and evaluate the implementation](/articles/engineering-package-agent-evaluation-deployment). [Revisit the requirements](/articles/engineering-agent-requirements-architecture).

## References

- [Python sqlite3 documentation](https://docs.python.org/3/library/sqlite3.html)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
- [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/)
