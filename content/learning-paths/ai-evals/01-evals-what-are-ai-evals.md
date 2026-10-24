# What Are AI Evals, and Why Do Agents Need Them?

A convincing demonstration answers one question: can this agent do something useful once? A useful evaluation answers a different question: under specified conditions, how consistently does the system satisfy an explicit requirement? That distinction matters when an agent can call tools, change records and continue after an error. A fluent final message can conceal a failed update, an unnecessary disclosure or a task that was never completed.

In this lesson, you will turn an informal expectation into a small evaluation. The examples use an invented internal research assistant called Beacon. All numbers are teaching examples, not reported performance of a commercial model. Beacon searches a fictional company handbook and returns an answer with evidence. Later lessons extend the same assistant with actions and failure recovery.

## Separate the components

A task defines the starting situation, user request and success criteria. A trial is one attempt to complete that task. A grader examines evidence and produces a result. An evaluation suite collects tasks and runs them under recorded conditions. Anthropic's evaluation guide uses these concepts to describe agent testing; they are useful vocabulary even when you build the runner yourself.

For Beacon, a task might ask, “How many days can a contractor retain a customer export?” The fixture contains a policy allowing seven days, a document owner and an effective date. A grader checks whether the answer states seven days, cites the right policy and avoids inventing an exception. Another grader checks whether Beacon accessed a document outside the user's permissions. These results remain separate because an accurate answer does not excuse unauthorized access.

The final answer is only one evidence source. Capture retrieved document identifiers, tool inputs, tool results, external writes, termination reason and the configuration used. Store a concise result record alongside the trace so reviewers can inspect failures without rerunning a potentially expensive agent.

## Build one useful case

Start with an ordinary request that an informed colleague can grade without guessing. Write the accepted facts and prohibited behavior before running the agent. Keep the fixture independent of the answer generator. Otherwise, the same mistaken assumption can appear in both the implementation and its supposed test.

An illustrative record looks like this:

```json
{
  "case_id": "retention-contractor-01",
  "request": "How long may a contractor keep a customer export?",
  "fixture": "handbook-2026-04",
  "required_days": 7,
  "required_source": "policy-retention-12",
  "forbidden_events": ["unauthorized_document_read"]
}
```

The grader should compare normalized facts rather than require one exact sentence. “Seven calendar days” and “7 days” may both satisfy the fact check. A reference answer is an example of correctness, not necessarily the only valid wording.

## Worked example: a misleading average

Suppose you run ten distinct cases once. Eight produce correct facts, nine provide valid citations and ten finish within the time budget. Reporting an average of 90 percent across these dimensions hides whether the same cases pass all requirements. If only seven satisfy every mandatory check, end-to-end task success is seven out of ten.

Keep both the component results and the combined result. The components guide debugging; the combined result describes the user experience. Report the denominator and the selected cases. Ten carefully selected examples provide useful early feedback, but they do not establish a reliable population-wide success rate.

A failure must also have a usable classification. Distinguish an agent error from a broken fixture, missing dependency or grader defect. Preserve failed runs instead of silently dropping them. The team should be able to explain why any run was excluded and how that decision changes the reported result.

## Practice

Choose one action or answer your planned agent must provide. Write five cases: two ordinary requests, one ambiguous request, one missing-evidence request and one permission boundary. For each, record required behavior, forbidden behavior and observable evidence. Run a baseline without trying to improve it first. Inspect every failure manually and revise ambiguous task descriptions before expanding the suite.

## Completion checklist

- Each case has a stable identifier, fixture and explicit user request.
- Required facts and prohibited actions can be checked independently.
- Traces, configuration and termination reasons are retained.
- The report includes denominators and distinguishes infrastructure failures.
- A reviewer can reproduce one failure from the saved case and fixture.

## Continue learning

Continue with [the next lesson](/articles/evals-model-application-agent-evaluation). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
- [Python: unittest](https://docs.python.org/3/library/unittest.html)
