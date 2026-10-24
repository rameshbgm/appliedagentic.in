# Build a Research Agent with Source Citations

This project turns the retrieval lessons into a complete research assistant. The agent compares delivery policies for three fictional suppliers and writes a short briefing with source citations. It must preserve qualifications, identify missing evidence and stop within a defined search budget. The goal is a defensible answer, not the largest possible document.

Use a fixture corpus before connecting live sources. Include one general policy and one exception for each supplier, plus an obsolete version and an irrelevant document. This gives you known evidence against which to inspect the agent's behavior.

## Define the research contract

Ask a precise question: compare standard delivery windows and commercial-order exceptions for a specified destination. Define the permitted sources, applicable date and expected output fields. If the destination or order class is missing, the agent should ask for clarification rather than compare incompatible terms.

The output contract can include a comparison table, a brief explanation, claim-to-source mappings and unresolved questions. Distinguish a policy statement from a recommendation. A source may establish a delivery window without establishing that one supplier is best for the user's needs.

Set search and time budgets in application code. The agent should return an incomplete briefing if essential evidence remains missing at the limit. The exact values depend on the fixture and product requirements; tune them from observed behavior.

## Build the evidence ledger

Represent each needed field as an evidence requirement. For each supplier, track delivery window, relevant exception, source version and applicability. A finding should include the selected passage, stable source identifier and observation time.

An example ledger entry is:

```json
{
  "supplier": "fixture-A",
  "claim": "commercial orders require a separate delivery estimate",
  "source_id": "supplier-A-policy-v3-section-4",
  "support": "direct",
  "applicable_destination": "fixture-region",
  "unresolved": false
}
```

Store the real supporting passage in the evidence record. The compact example shows the relationship, not a replacement for source inspection. A generated citation title is not sufficient evidence.

## Implement bounded investigation

Start with targeted retrieval for each supplier. Inspect the retrieved passages, then search again only for a specific missing field or contradiction. Repeatedly searching the same wording without new evidence should trigger a stop or a deliberate strategy change.

A single agent is a reasonable baseline. If independent supplier investigations exceed its useful context or make coverage difficult, consider specialists with the same evidence contract. Preserve the baseline so you can measure whether delegation improves supported coverage enough to justify additional coordination.

Do not permit arbitrary document instructions to change the research objective or tool access. The corpus is evidence, not an authority over the agent's operation. A malicious fixture can test that the agent does not follow a source's request to reveal private data.

## Synthesize and validate the briefing

Build the comparison from ledger entries rather than from memory of the full transcript. Each material cell should have a supporting source or an explicit unavailable marker. If policies use different definitions of delivery time, explain the difference instead of forcing them into a misleading numeric ranking.

Validate source identifiers against the retrieved evidence set. Then inspect whether each cited passage supports the associated claim. An automated check can catch nonexistent identifiers; judging support may need a rubric, model assistance or human review.

Keep final conclusions proportional to coverage. If one supplier's exception document is missing, state how that limits the comparison. Do not fill the empty cell using another supplier's policy or a plausible industry convention.

## Exercise

Implement the fixture research pipeline and generate a one-page briefing. Run three variants: all sources available, one exception missing and one outdated policy ranked above its replacement. Capture queries, evidence selections, unresolved fields and the stopping reason.

Ask another learner to verify the briefing using only its citations. Record every unsupported or ambiguous claim as a regression case. Revise either retrieval, selection or synthesis according to the stage where the failure began.

## Completion checklist

- The research question fixes destination, date and comparison fields.
- Every reported policy claim has inspected supporting evidence.
- Missing and incompatible information remains visible.
- The run is bounded and its briefing can be independently checked.

## Continue learning

[Design iterative search](/articles/engineering-agentic-retrieval-search-verify-cite). [Package project evidence](/articles/engineering-package-agent-evaluation-deployment).

## References

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
