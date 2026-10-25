# Manage Dataset Versions, Leakage and Coverage

An evaluation score is meaningful only in relation to the cases and conditions that produced it. If a team changes cases, edits expected answers and improves the agent in the same week, a higher score may reflect any combination of those changes. Dataset versioning preserves the evidence needed to distinguish product improvement from a different measurement instrument.

For Beacon, imagine a suite containing retention, ownership and effective-date questions. Developers inspect failures and modify retrieval. That is normal development. The challenge is to keep a separate source of evidence about behavior beyond the cases that directly shaped those changes.

## Version the complete case contract

A dataset snapshot should identify case definitions, fixtures, reference facts and grader versions. A case identifier can remain stable while its revision changes. Preserve the reason for each revision: typo correction, clarified policy, repaired fixture or newly accepted alternative. Hashing the files helps detect accidental changes, but a hash alone does not explain their meaning.

Record corpus and environment versions too. If the evaluation retrieves from a changing document index, the same case file can produce a different problem tomorrow. Use a frozen corpus for controlled comparisons. Keep live integration monitoring separate and label it clearly when changing external state is intentional.

When a defective case is repaired, rerun relevant baselines on the repaired snapshot. Do not compare the candidate on the corrected suite against a baseline measured on the defective one. The two scores answer different questions.

## Protect useful holdouts

A development set is for iteration. A holdout set is for an assessment that has not directly guided those iterations. Access control, restricted grader explanations and a documented release process help preserve that distinction. Once a holdout case has been repeatedly inspected and optimized against, treat it as development evidence and replenish the holdout deliberately.

Split by underlying task family when examples are closely related. If two cases ask about the same policy passage with small wording changes, putting one in development and one in holdout can leak the essential solution. Grouping by document, customer scenario or generated template may be more appropriate than random row splitting.

Leakage can also come from test names, reference answers included in agent-visible context, filenames or tool responses. Inspect the complete input actually shown to the agent. A hidden answer in fixture metadata can invalidate a test even when the final prompt looks clean.

## Report coverage, not just size

Track which important behaviors the suite exercises: valid answers, ambiguity, contradictory evidence, permissions, tool failures and time constraints. A thousand straightforward extraction cases do not establish resilience to a single permission boundary. Coverage labels make these gaps visible.

Keep proportions interpretable. A balanced capability suite intentionally overrepresents uncommon but important cases. A workload-weighted estimate uses a different sampling logic. Report each separately or provide an explicit weighting scheme. Avoid implying that a curated stress suite estimates the frequency of failures in ordinary usage.

## Worked example: a score that moves backward

Dataset version one has eighty cases; Beacon passes sixty-eight. Version two adds twenty difficult access-boundary cases and repairs five ambiguous references. Beacon now passes seventy-eight out of one hundred. The raw percentage falls from eighty-five to seventy-eight, but that does not establish a regression.

Run the old and new agent on version two. Compare case-level outcomes on the same snapshot, then inspect the new slice separately. Keep a migration note explaining why version two is harder and which old results remain comparable. A transparent report can show genuine improvement while acknowledging that the measurement changed.

## Practice

Create a dataset manifest containing identifiers, revisions, fixture hashes, coverage labels and access policy. Make one intentional reference correction and write its migration note. Split twelve related cases by task family. Inspect the exact agent-visible payload for each holdout case and remove any answer-bearing metadata that is not part of the real task.

## Completion checklist

- Dataset, fixture, corpus and grader versions are recorded together.
- Every case revision has a rationale and review history.
- Related cases remain grouped across development and holdout splits.
- Agent-visible metadata cannot reveal hidden answers.
- Comparisons use the same snapshot and disclose coverage changes.

## Continue learning

Continue with [the next lesson](/articles/evals-deterministic-checks-executable-tests). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [SWE-bench: Evaluation infrastructure](https://github.com/SWE-bench/SWE-bench)
- [pytest: How to use fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html)
