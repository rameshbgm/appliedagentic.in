# Designing Human Review and Escalation

Human review is most useful when the system knows why it needs help and what the reviewer must decide. A vague message saying “please check this” moves the reasoning burden to a person without giving them enough context. A well-designed handoff preserves evidence, identifies the unresolved issue and limits what approval authorizes.

The delivery assistant can explain tracking evidence automatically. A request for compensation may require a staff decision. The escalation should carry the investigation forward instead of making the customer repeat everything and the reviewer reconstruct the trace.

## Define review triggers before deployment

Use explicit triggers tied to task conditions. Examples include conflicting authoritative records, missing identity confirmation, an unsupported request, a consequential proposed action or exhaustion of the execution budget. Model uncertainty may be one signal, but self-reported confidence alone is a weak review policy.

Distinguish clarification from approval and escalation. Clarification asks the user for missing information. Approval authorizes a particular operation. Escalation transfers responsibility to someone with a different capability or decision authority. Combining them in one generic state makes resumption and auditing difficult.

Specify the owner of each review queue and the response expectations. A handoff without an accountable destination is an unfinished task, even if the agent emitted a review flag correctly.

## Build a review packet

Include the user's goal, authenticated scope where appropriate, relevant evidence, completed actions, unresolved questions and the exact proposed next action. Keep the packet concise enough to inspect while allowing access to source details.

For a fictional compensation request, the packet could say:

```text
Request: customer asks for delivery compensation
Verified evidence: order O-204; dispatch event; carrier exception
Completed action: explanation drafted, no compensation issued
Unresolved rule: policy exception requires staff judgment
Proposed next step: reviewer chooses an eligible resolution
```

Separate facts from suggestions. If the model recommends a resolution, identify it as a proposal and show the policy evidence behind it. A reviewer should not mistake generated reasoning for an authoritative business decision.

Avoid collecting unnecessary sensitive information for review. The packet should expose the minimum information required to decide, with the same access restrictions as the underlying records.

## Bind approval to the actual operation

An approval should identify the actor, action, target, parameters, validity window and relevant policy version. If the proposed operation changes, earlier approval may no longer apply. Do not interpret a generic “looks good” as unlimited authority for subsequent actions.

Before executing an approved mutation, recheck current state and permission. The order may have changed while review was pending. If a material precondition differs, stop and request a revised decision rather than applying stale authorization.

Record execution separately from approval. The reviewer may approve an action that later fails at the external service. The customer-facing status must reflect the actual result, not merely the existence of an approval event.

## Design pause and resume deliberately

Persist the task state, review packet and proposed operation before pausing. On resume, verify that the reviewing person had the required role and that the approval still matches the current action. Restore the relevant context without replaying completed side effects.

The user should see a truthful status while waiting. “Awaiting staff review” is different from “resolution completed.” If the request expires or is declined, record a terminal outcome and explain the next available option.

Test duplicate reviewer responses and repeated resume requests. The application should not execute the same approved mutation twice. Use durable action identifiers and idempotent execution patterns appropriate to the underlying service.

## Exercise

Design three handoffs: an ambiguous order requiring clarification, contradictory tracking requiring specialist review and a compensation proposal requiring approval. For each, define the trigger, recipient, packet, allowed response and resume behavior.

Change the proposed compensation target after approval in your fixture. Demonstrate that the original approval cannot authorize the changed operation. Then simulate an external execution failure and show the accurate user-facing result.

## Completion checklist

- Clarification, approval and escalation use distinct states.
- Review packets distinguish evidence from proposals.
- Approval is scoped to an exact action and checked again before execution.
- Resume behavior cannot duplicate consequential actions.

## Continue learning

[Apply support handoff](/articles/engineering-customer-support-agent). [Prepare deployment evidence](/articles/engineering-package-agent-evaluation-deployment).

## References

- [OWASP prompt injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
