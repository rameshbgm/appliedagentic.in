# Evaluate Outcomes and Execution Traces

An agent can reach the right answer through a poor process, and it can follow a reasonable process without completing the task. Outcome grading and trace inspection answer different questions. The outcome tells you whether the user's contract was satisfied. The trace helps establish which actions occurred and whether mandatory boundaries were respected. A good evaluation uses both without confusing them.

Beacon is asked to research a policy and create a follow-up task for its owner. The final response includes a task link. That is promising evidence, but the evaluator must still inspect the tracker, verify the linked record and check for unintended writes. A transcript alone cannot establish the entire external outcome.

## Define the observable outcome

Write assertions about final state: one new task exists, the owner matches the policy record, the description contains the relevant source and no unrelated records changed. These assertions should accept valid implementations that produce the same contractual result.

Do not require one exact sequence of retrieval calls unless the sequence itself matters. An agent may search by title, filter by owner or retrieve directly by identifier. Penalizing every unfamiliar path makes the suite brittle and discourages legitimate improvements. In contrast, an approval-required write must have a valid approval before execution. That ordering is part of the contract, not an implementation preference.

Capture initial state so the grader can distinguish a newly created record from one that already existed. For repeated trials, reset the environment or allocate a new namespace. Otherwise, a previous success can leave artifacts that make later failures appear successful.

## Collect a trace with evidence boundaries

A useful trace records event identifiers, timestamps, tool names, validated arguments, results, errors and relevant state transitions. Include run and case identifiers so events can be joined without relying on text search. Retain configuration versions and termination reasons.

Avoid treating hidden model reasoning as required evidence. Observable messages, tool calls, decisions exposed by the application and final state are sufficient for many operational checks. If the system produces a short decision explanation, treat it as a claim to inspect, not proof that the explanation caused the action.

Redact secrets and restrict sensitive trace access. Evaluation logs can contain document contents and tool responses that the ordinary application would protect. The evaluation environment needs its own access rules and retention policy.

## Worked example: four apparently similar runs

Run A creates one correct task and reports its link. Run B reports the same words but never calls the tracker. Run C creates the correct task twice after a timeout. Run D creates one correct task after reading a restricted source.

An answer-only judge might accept all four. Final-state checks reject B and C. A permission trace check rejects D. A passes the defined contract. This small example shows why dimensions should remain separate: the different failures require different engineering fixes.

Now consider Run E, which retrieves two additional public documents before creating the correct task. Unless the task has a specific efficiency constraint, this may still be a valid success. Report extra tool use as a diagnostic measure rather than automatically converting every detour into failure. Unnecessary actions matter when they affect cost, latency or risk, and those effects should have explicit criteria.

## Practice

Create five synthetic traces and corresponding before-and-after state snapshots for an action task. Include a false success message, a duplicate write, unauthorized access, a valid alternative route and a complete success. Implement outcome assertions first, then add only the trace checks needed to detect violations that final state cannot reveal.

## Completion checklist

- The evaluator inspects initial and final external state.
- Outcome checks accept legitimate alternative implementations.
- Mandatory ordering and permission rules are explicit.
- Trace events are linked to cases and configuration versions.
- Logs preserve useful evidence while respecting data access rules.

## Continue learning

Continue with [the next lesson](/articles/evals-tool-selection-arguments-side-effects). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
- [SWE-bench: Evaluation infrastructure](https://github.com/SWE-bench/SWE-bench)
