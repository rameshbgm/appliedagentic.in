# Selecting the Right Context for Each Task

An agent rarely needs every document it can access. It needs the information that supports the current decision, including facts that challenge an attractive answer. Context selection is therefore a product policy as well as a search problem. Relevance alone is insufficient: a highly similar record can belong to another customer or describe an obsolete process.

The delivery assistant has three available sources: an order record, a warehouse dispatch event and a carrier event. A selection policy should explain which records enter the next model request, in what form and why.

## Filter before ranking

Start with hard eligibility rules. Apply tenant, customer and document-level access restrictions before allowing text into the model context. Then check whether the record applies to the identified order and whether its effective time matches the user's question. A historical status question requires historical evidence; blindly preferring the newest record can be wrong.

Use similarity ranking only among eligible records. Store access decisions in trusted code rather than asking the model to recognize confidential documents. A redacted document may still contain identifiers that cross boundaries, so define and test the redaction process too.

After filtering, rank candidates using task-specific criteria. Exact identifiers, record type, observation time and source authority may matter more than surface wording. The policy can be simple at first, provided its choices are inspectable.

## Budget for coverage, not volume

A context budget should reserve space for instructions, tool contracts, task state and the final output. The remaining space is available for evidence. Count tokens using the chosen provider's supported tokenizer or estimation method; word counts are only a rough planning aid.

Select a useful range of evidence. Five nearly identical warehouse notes may add less than one independent carrier event. Deduplicate repeated content while preserving distinct observations and source identifiers. Keep conflicting evidence when it is relevant, even if it makes the answer harder to produce.

Avoid arbitrary truncation in the middle of a record. A sentence such as “delivery is guaranteed” can become misleading if the next sentence states an exception. Prefer coherent passages with necessary qualifications and enough surrounding context to interpret them.

## Work through a selection decision

Suppose the customer asks whether delivery is confirmed for Thursday. Candidate A is a warehouse note saying dispatched. Candidate B is a carrier estimate for Thursday, recorded yesterday. Candidate C is a newer exception event indicating an address issue. Candidate D is a similar shipment belonging to another customer.

D must be excluded by access and identity rules. A explains the internal state, but it does not establish a delivery commitment. B provides the earlier estimate. C changes its interpretation. A useful packet includes B and C, plus A if it helps explain the sequence. It should not summarize the three as “Thursday delivery confirmed.”

Record the decision in a compact selection log:

```text
Included: carrier estimate, later exception, dispatch record
Excluded: other customer's shipment
Reason: answer needs timeline and unresolved exception
Unresolved: no updated delivery commitment available
```

The log need not be sent to the user verbatim. It gives engineers a way to understand why the model saw particular evidence.

## Revisit selection as the task develops

The best packet changes after a tool call. An address exception may make a permitted address-validation lookup useful. Once that result arrives, the next packet should preserve the exception and the validation result while dropping irrelevant earlier tool details.

Do not overwrite the original event history when compacting the current context. Keep durable source references outside the model request. A summary can serve immediate decisions, while the original evidence remains available for review and later retrieval.

Evaluate selection and generation separately. If the relevant exception never reaches the model, changing answer instructions will not solve the underlying issue. Create fixtures that assert the presence of essential records and the absence of inaccessible ones before evaluating the final wording.

## Exercise

Create eight fictional records for two orders. Include one duplicate, one stale estimate, one contradiction and one unauthorized record. Write a selection function or decision table for a current delivery question and a historical question. Explain why the selected sets differ.

Set a deliberately small evidence budget and identify which details must survive compression. Have another learner answer from your selected packet and check whether they can identify the unresolved issue.

## Completion checklist

- Access and identity filters run before semantic ranking.
- The evidence set preserves meaningful contradictions.
- Context budgeting leaves room for instructions and output.
- Selection tests can fail independently of answer-quality tests.

## Continue learning

[Design memory with provenance](/articles/engineering-session-working-long-term-memory). [Build agentic retrieval](/articles/engineering-agentic-retrieval-search-verify-cite).

## References

- [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
