# Turn Production Failures into Regression Cases

Production reveals combinations that a curated suite may miss: unfamiliar language, unusual document structure, stale permissions or an interrupted action at exactly the wrong moment. A useful evaluation program turns those observations into durable cases. The goal is to preserve the failure mechanism while removing unnecessary sensitive data and dependence on changing production systems.

Beacon produces an incorrect retention answer after retrieving an expired policy. The user reports the problem, and the team has a trace containing document identifiers, timestamps and the generated answer. That evidence supports investigation, but it is not yet a safe, reproducible regression fixture.

## Preserve evidence and classify the failure

Capture the relevant run identifiers, configuration versions, document snapshot and tool events before they disappear. Access to production traces should remain controlled. An evaluation author should receive only the evidence needed for the investigation, under the organization's handling rules.

Classify the observed defect without assuming its cause. “Wrong deadline” is an outcome. “Retriever favored expired policies” is a hypothesis. Inspect whether the current policy was indexed, whether the retrieval result included effective dates, whether context assembly retained them and whether the agent selected the right source. Different causes require different fixes and tests.

Record user impact separately from technical symptoms. A wrong deadline that caused no action in one incident can still represent a consequential failure mode. Conversely, an error message that looked alarming may have accompanied a safely completed operation. Reconstruct final state where actions were involved.

## Build a minimal faithful fixture

Create synthetic documents that preserve the decisive relationships: old and new policy dates, similar titles and the clause that changes the answer. Replace names and identifiers consistently. Avoid simply deleting fields if doing so changes the reasoning problem.

Freeze the corpus and clock. Reproduce the error using the original configuration if available. If the error cannot be reproduced, retain the case as an observed scenario with that limitation rather than claiming a confirmed regression test. Add deterministic component tests when the underlying defect can be isolated, such as a parser that drops effective dates.

Write expected behavior from reviewed policy facts, not by copying the desired output of the fixed agent. Include permitted alternatives and relevant forbidden behavior. The regression should test the requirement, not the exact implementation of the repair.

## Worked example: fix the family, not one sentence

The production request says, “What is the storage deadline for this export?” The expired document says fourteen days; the current document says seven. The team creates a synthetic case preserving those dates and the shared title.

After fixing retrieval, Beacon passes the original case. The team then adds variants: reversed document order, a different title format, an exception applying to another population and a missing effective date. These variants test whether the fix addresses the mechanism rather than recognizing one phrase. Keep the original incident case for regression and reserve fresh related cases for assessment where practical.

Do not let incident cases overwhelm the workload report. A suite assembled from failures is intentionally difficult and valuable for regression detection. Its score does not estimate the overall production failure rate. Maintain representative sampling separately so improvements are interpreted against the right denominator.

## Close the learning loop

Attach the case identifier to the issue or incident record. Record the root-cause hypothesis, fix, affected components and evaluation evidence. Monitor whether the same failure family recurs after release. If it does, inspect whether the fixture omitted an important condition or whether the deployed configuration differs from the evaluated candidate.

## Practice

Invent a production incident involving an expired source. Write an evidence checklist and a synthetic reconstruction. Create one minimal regression case and three related variants. Explain which details preserve the causal mechanism and which details were removed for privacy. Run both baseline and repaired configurations on the same fixture snapshot.

## Completion checklist

- Observed outcome and suspected cause are distinguished.
- Sensitive evidence is handled with controlled access.
- Synthetic fixtures preserve decisive relationships and dates.
- Regression cases test requirements rather than memorized wording.
- Incident suites remain separate from workload-rate estimates.

## Continue learning

Continue with [the next lesson](/articles/evals-quality-cost-latency-uncertainty). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [pytest: How to use fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html)
