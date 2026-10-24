# Designing Instructions, Examples and Structured Outputs

An agent instruction is a compact specification of what the system should accomplish, which evidence it should use and how it should behave when it cannot finish. It is not a substitute for authorization or runtime controls. Effective instructions make desired decisions observable so that you can test them.

This lesson designs the answer contract for the delivery assistant. The product needs a factual explanation, supporting sources and a clear indication of whether more information is required. A paragraph that sounds helpful but hides missing evidence does not satisfy that requirement.

## Write instructions around decisions

Start with the objective and completion criteria. For example: explain the latest known status of the permitted order, distinguish internal and carrier records, and cite the evidence used. Then specify what to do when information is missing or contradictory. Ask for clarification when the order is ambiguous; report uncertainty when a carrier record is unavailable.

Use precise language for scope. “Do not change orders” is understandable, but the tool layer should also exclude mutation operations. “Use only current evidence” needs a definition of current, such as the most recent accessible observation within the task's time requirements.

Avoid stacking many overlapping rules. If two instructions conflict, decide their precedence in application design. A demand to always answer must not undermine an instruction to acknowledge insufficient evidence. Put the acceptable incomplete outcome directly into the contract.

## Choose examples that teach boundaries

A successful example demonstrates the response format. A boundary example demonstrates what should happen when the system cannot satisfy the normal path. Include both. For the delivery assistant, pair a clear carrier event with an example where the order says dispatched but no scan exists.

Do not teach the model to guess identifiers or copy account details from examples. Use obviously fictional values and vary them. Explain which features matter: the source timestamp, the distinction between records and the escalation flag. A model can otherwise imitate incidental details rather than the intended rule.

Keep examples separate from live evidence. Their purpose is to illustrate behavior, not to establish facts about the current user's order. This is especially important when examples resemble real documents.

## Define an output schema

A structured output makes the application's expectations explicit. An illustrative shape is:

```json
{
  "status": "answered",
  "explanation": "The order is marked dispatched, but no carrier scan is available.",
  "source_ids": ["order:O-204", "carrier:C-19"],
  "needs_human_review": false,
  "missing_information": ["physical carrier scan"]
}
```

Specify required fields and allowed status values. Decide whether unknown fields are rejected. Limit field lengths and list sizes when that helps downstream handling. Follow the structured-output features supported by your chosen model provider rather than assuming every JSON Schema feature is available.

Schema validity is only one layer. A syntactically valid response can cite nonexistent sources, misstate the order or claim completion without evidence. Validate source identifiers against the task record. Apply business rules to statuses and review flags. Treat the response as untrusted input until those checks pass.

## Handle invalid responses deliberately

A repair attempt should be bounded and should identify the actual validation error. If a source identifier is absent, return that precise issue to the model or fail with a typed result. Do not repeatedly ask “please fix the JSON” when the problem is an unsupported business claim.

Store the raw provider response only where access and retention rules permit. Keep the validated representation separately so that later application components do not accidentally use unverified fields. Escape rendered text and avoid treating generated content as executable markup or commands.

Compare changes with a fixed test set. Adding an example can improve one case while narrowing the model's behavior too much elsewhere. Include ambiguity, missing records, tool failure and a deliberately conflicting user instruction.

## Exercise

Write a ten-line instruction contract and two fictional examples for the delivery assistant. Define a JSON schema and three semantic rules that the schema cannot express by itself. Create one response that passes shape validation but fails evidence validation. Then explain how the application will report that failure.

Revise an instruction that says “always provide a confident answer.” Replace it with explicit conditions for an answered, incomplete or escalated outcome. Demonstrate all three with a small fixture.

## Completion checklist

- Instructions define success and acceptable incomplete outcomes.
- Examples include a boundary case and no real customer data.
- Output validation checks both shape and meaning.
- Repair attempts are bounded and report specific failures.

## Continue learning

[Understand complete context design](/articles/engineering-prompt-to-context-engineering). [Ground answers with retrieval](/articles/engineering-rag-business-documents).

## References

- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
- [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
