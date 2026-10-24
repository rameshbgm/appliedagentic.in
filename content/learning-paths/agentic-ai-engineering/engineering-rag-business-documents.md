# Building RAG with Your Business Documents

Retrieval-augmented generation, or RAG, supplies external evidence to a model before it writes an answer. It is useful when answers depend on company documents that change over time or should remain outside a model's training data. A useful RAG system retrieves the right permitted passages and makes their limits visible; it does not simply attach a search box to a model.

This project answers warranty questions for the office supplier. The fictional corpus contains a general policy, a product-specific exception and an older superseded policy. A correct answer depends on the product, purchase date and applicable document version.

## Prepare documents as evidence

Give every source a stable identifier, version, owner, access scope and effective date. Extract text while preserving headings, tables and relationships that affect meaning. A table row about commercial devices should not lose its column heading during extraction.

Split long documents into coherent chunks. A chunk should contain enough context to interpret its claims. Fixed token windows are convenient but can separate an exception from the rule it qualifies. Heading-aware splitting, limited overlap and metadata can help, but test them against your actual documents rather than assuming one chunk size works everywhere.

Store the original source location with each chunk. A citation should lead to a document or passage that a permitted reader can inspect. An internal vector identifier alone is useful for debugging but is usually a poor user-facing reference.

## Retrieve within the right scope

The user's identity determines the eligible document set. Apply access restrictions before returning text to the model. Then use an appropriate search strategy, such as keyword search, vector search or a combination. Exact model numbers and policy identifiers can make lexical matching particularly valuable.

Retrieve candidates, remove duplicates and select passages that jointly cover the question. If the general policy and a product exception conflict, keep both and examine their applicability. A high similarity score is not a probability that the passage answers the question correctly.

For a historical warranty question, the effective date may matter more than the newest upload date. Keep both fields if your documents distinguish them. A recently uploaded copy of an old policy should not automatically replace the policy that governed the purchase.

## Build the answer from a source bundle

A source bundle could look like this:

```text
Question: warranty for model P-42 purchased in March
Source A: general policy v3, effective January
Passage: standard coverage period and exclusions
Source B: P-42 exception v1, effective February
Passage: product-specific coverage condition
Missing fact: whether the purchase was commercial
```

The agent can explain the applicable rule and ask for the missing purchase classification. It should not select the more generous rule merely because it seems helpful. Make the answer contract require a source for each material claim and an explicit missing-information field.

Citations support inspection, but the presence of a link does not prove the claim is supported. Validate that cited source identifiers were actually retrieved and test whether the cited passage establishes the relevant statement. Do not let the model invent a public URL from a document title.

## Diagnose failures by stage

A wrong answer can begin with bad extraction, poor chunking, missing metadata, failed retrieval, inappropriate selection or unsupported generation. Capture enough stage-level information to identify the cause. Without that separation, teams often change prompts to compensate for a retrieval problem.

Create a small labeled fixture set before scaling the corpus. Include questions whose answers require an exception, questions that refer to old policies and questions with no answer in the documents. The system should decline to invent missing policy details.

Treat document refresh as an engineering workflow. Update the index, retire superseded versions according to the task rules and verify that deleted content no longer appears in new retrieval results. Preserve any required audit history in an appropriately restricted store.

## Exercise

Create three short fictional warranty documents with different versions and one exception. Build a retrieval fixture mapping five questions to the passages needed to answer them. Include one unanswerable question. Then implement or sketch ingestion, access filtering, search, selection and answer generation as separate functions.

Change a policy's effective date and explain which fixture outcomes should change. This exposes whether your pipeline understands applicability or merely retrieves similar text.

## Completion checklist

- Chunks preserve source identity and necessary qualifications.
- Retrieval enforces access and applicable document versions.
- Answers use valid citations and disclose missing facts.
- Failures can be traced to extraction, retrieval, selection or generation.

## Continue learning

[Plan iterative retrieval](/articles/engineering-agentic-retrieval-search-verify-cite). [Design structured responses](/articles/engineering-instructions-examples-structured-outputs).

## References

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
