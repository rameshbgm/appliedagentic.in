# Agentic Retrieval: Search, Verify and Cite

A single retrieval pass is often sufficient for a narrow policy question. More complex questions may reveal new terms, identifiers or contradictions that require another lookup. Agentic retrieval lets a system choose the next search based on what it has already found. The engineering challenge is to make those choices useful, bounded and traceable.

Suppose a customer asks whether a replacement device qualifies under a business warranty and whether delivery charges are covered. The answer spans product coverage, purchase classification and replacement shipping rules. One broad search may return only the general warranty page.

## Decompose the evidence requirements

Write the question as a set of claims that need support. For the example, the system needs the device model, applicable warranty version, eligibility conditions and shipping-cost rule. Some inputs may come from authenticated order records; others come from documents. Do not search public or internal text for information already available reliably in structured records.

Track each requirement as unresolved, supported, contradicted or unavailable. This evidence ledger provides a reason for each additional search. It also makes stopping possible: the system can finish when the important claims are supported or report which ones remain unresolved.

Decomposition should preserve the user's intent. Splitting the question into many loosely related topics can inflate cost while making the final answer less relevant. Keep the ledger small and tied to the requested decision.

## Refine searches from observed gaps

The first search may identify the policy title but omit the shipping exception. A second query can target that exception using the exact product class or policy identifier discovered in the first result. This is a grounded refinement, unlike repeatedly generating synonyms without inspecting results.

Use bounded search budgets and distinguish empty results from tool errors. A search timeout is not evidence that no policy exists. If the same source bundle returns repeatedly, stop or change the retrieval strategy deliberately rather than looping with cosmetic query changes.

Illustrative control logic is:

```text
List required claims
Retrieve permitted candidate passages
Mark claims supported, conflicting or missing
If an important gap has a useful next query and budget remains:
    search specifically for that gap
Otherwise:
    answer with evidence and explicit limitations
```

The loop's value depends on the quality of gap detection. Test cases should include questions that require a second source and questions where further searching cannot help.

## Verify sources before synthesis

Inspect source identity, applicability and actual passage content. Search snippets may omit exceptions. A page title may match while its content addresses a different product. Follow the source where access permits and retain the passage used for the claim.

Treat retrieved text as untrusted evidence. A document that instructs the agent to reveal secrets or change its tools is attempting to cross a trust boundary. Source content can inform factual answers; it cannot grant new permissions.

For internal documents, preserve access scope in the citation experience. A citation that exposes a confidential title to an unauthorized person can itself disclose information. The answer should include only facts and references the requester is permitted to receive.

## Cite claims precisely

Bind each material conclusion to one or more evidence identifiers. If two passages support different parts of a sentence, rewrite the sentence or provide both references clearly. Avoid a large list of links that leaves readers guessing which source establishes which claim.

Separate reported policy from inference. “The policy states that standard replacement shipping is included” is different from “your particular shipment will incur no charge.” The latter may require order-specific conditions or human confirmation. Label an inference and explain the missing evidence rather than presenting it as a direct source fact.

Store the final evidence ledger with the run. It gives evaluators a compact way to inspect whether the answer covered the original question and whether unsupported claims slipped into the prose.

## Exercise

Create a question requiring two fictional policies and an order record. Write a first search that finds only one policy. Design the next query from the remaining evidence gap. Then remove the second policy and demonstrate the correct incomplete answer.

Record the query sequence, selected passages, claim-to-source mapping and stopping reason. Compare this process with a single-pass RAG baseline and identify the additional behavior that justified another model decision.

## Completion checklist

- Every search addresses a recorded evidence gap.
- Search limits and repeated-result detection prevent endless exploration.
- Claims cite inspected, applicable passages.
- Missing evidence produces an explicit limitation rather than a guess.

## Continue learning

[Build the research project](/articles/engineering-research-agent-source-citations). [Select the correct context](/articles/engineering-select-context-each-task).

## References

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
