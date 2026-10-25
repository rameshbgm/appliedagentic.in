# Prompt Chaining, Routing and Parallel Execution

Many useful AI applications need several model-assisted steps without requiring open-ended autonomy. A document may need classification, extraction, validation and a user-facing explanation. Composition patterns help you organize these steps while keeping their boundaries visible. Start with the shape of the work, then choose how much decision-making the model needs.

This lesson uses an invoice-processing example. The system receives a fictional invoice, extracts a small set of fields and prepares a review record. It does not approve payment. That separation lets you study workflow composition without introducing unnecessary financial authority.

## Chain stages when outputs depend on earlier work

A chain runs steps in a defined order. Classification identifies whether a document is an invoice. Extraction produces structured fields. Validation compares those fields with deterministic rules. Explanation prepares a readable summary of unresolved issues.

Give every stage an input and output contract. The extractor should return a schema with invoice identifier, supplier, currency, line items and total. The validator should receive that structured representation rather than parse a prose answer again. If extraction cannot identify the currency, validation should report a missing field, not assume a local default.

Avoid asking a later language-model call to repair an earlier error invisibly. Preserve the extracted value and validation result separately. Reviewers need to know whether a number came from the document, a calculation or a model suggestion.

## Route when tasks need different capabilities

A router chooses among known paths. An invoice, support request and shipping document may require different schemas and tools. A model can classify ambiguous text, but the application owns the destination list and decides what to do when classification is uncertain.

Include an unknown or review path. Forcing every document into a supported category creates confident processing of unsupported inputs. Test documents that contain multiple document types or only fragments of a familiar format.

Routing does not require unlimited tool choice. A useful design may use a model for one category decision followed by a fixed pipeline. Measure whether that approach solves the problem before introducing dynamic planning inside every branch.

## Parallelize independent work

Parallel execution is useful when operations do not depend on each other's results. Two independent checks might inspect arithmetic and required metadata. Their results can be joined after both complete. If one check requires fields produced by another, running them simultaneously creates a data dependency error rather than a speed improvement.

Define what happens when only one branch succeeds. Can the task return a partial review, or does it need both checks? Give each branch a deadline and capture typed outcomes. A join stage should not silently treat a failed branch as a passing result.

An illustrative workflow is:

```text
Classify document
If invoice:
    extract fields
    run arithmetic check and required-field check independently
    join check results
    prepare review summary
Else:
    request a supported document or send to manual review
```

The checks can be ordinary code. A language model is useful for language-heavy extraction or explanation, while arithmetic is generally better handled deterministically.

## Keep composition observable

Assign identifiers to the overall task and each stage. Record the schema version, input source, outcome and duration. This lets you identify whether a poor final answer began with routing, extraction, validation or synthesis.

When changing a stage, test downstream assumptions. Adding a new routing category can affect analytics and review queues. Changing the extractor's field names can break validation even if the generated JSON looks reasonable. Treat stage contracts like ordinary software interfaces.

Avoid multiplying model calls without a reason. Every extra stage creates another interface and another failure mode. If one call reliably extracts the required fields and deterministic validation handles the rest, a complex chain may add cost without useful behavior.

## Exercise

Design an invoice review workflow with one router, two dependent stages and two independent checks. Specify the input and output for each. Add an unsupported document case and a timeout in one parallel branch.

Walk through the partial-failure result from the user's perspective. State what the system knows, which check did not finish and whether a reviewer may safely proceed.

## Completion checklist

- Each stage has a defined input and output contract.
- Routing includes an unsupported or uncertain outcome.
- Parallel branches have no hidden dependencies.
- Join logic handles failed and partial results explicitly.

## Continue learning

[Add bounded planning](/articles/engineering-planning-tool-use-feedback). [Build document processing](/articles/engineering-document-processing-agent).

## References

- [Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [JSON Schema object reference](https://json-schema.org/understanding-json-schema/reference/object)
