# Implement Context Compaction and Persistent State

Long runs accumulate more information than a model can use effectively in one request. Compaction reduces that working context, while persistent state preserves the facts needed to continue. Treating these as the same mechanism creates subtle failures: a concise summary can omit an unfinished write, and a complete event log can be too large to send to the model.

## Define three stores

Use an event history for execution facts, structured task state for current progress and a working summary for model continuity. The event history records proposals, authorization decisions, action attempts and results. Task state records requirements, dependencies and artifact references. The summary explains what the next reasoning step needs to know in a compact form.

Give each summary a covered event range and a state version. If later events change the task, the context builder can combine the summary with newer facts. A summary should never replace the records it describes when those records are still needed for recovery or audit. Retention policy can archive them separately, but deletion must be a deliberate product decision.

Sensitive content requires the same access controls in summaries as in original documents. A summary can leak a customer address even after the source record is no longer selected. Apply authorization and retention rules to derived artifacts, not only to source files.

## Compact a document research session

Suppose a run has collected twenty extracts while drafting a comparison. The runtime stores full extracts as artifacts and maintains a table of source identifiers, verified claims and unresolved questions. It asks a summarizer to preserve only task-relevant narrative, references and uncertainty. After compaction, the next model turn receives that summary, the structured state and any recent events.

```text
snapshot = read_state(version=42)
summary = summarize(relevant_events(up_to=180), snapshot)
validate_required_fields(summary)
store_summary(summary, state_version=42, through_event=180)
next_context = trusted_inputs + snapshot + summary + events_after(180)
```

Required fields might include the current objective, unanswered questions and artifact identifiers. They should not include model-authored assertions that a tool completed successfully unless validated against the event store. If summary validation fails, keep the previous working context or stop safely; silently using an incomplete handoff can be worse than a visible retry.

## Choose compaction or a fresh session

Compaction shortens history within the current interaction pattern. A fresh session reconstructs context from a task snapshot and selected artifacts. Both can work, but they have different costs. A reset can reduce accumulated conversational confusion while depending more heavily on a complete handoff. Compaction can retain continuity while carrying forward mistaken assumptions.

Make the choice measurable. Record summary size, missing-context incidents, repeated searches and recovery success. Run tasks that require facts from early and late phases. Check whether the agent preserves user constraints and whether artifact references remain accessible. A shorter prompt is not automatically a better prompt if it removes the decisive evidence.

## Handle changes and failures

Use optimistic concurrency when writing a summary. If task state changes while summarization is running, the result may be stale. Store it with its original version and rebuild before relying on it for a consequential decision. Do not overwrite a newer summary with an older asynchronous response.

A model-independent state schema makes recovery easier. Store a task identifier, status, requirement evidence and artifact hashes in ordinary structured records. You can change model providers without asking the new model to reinterpret every old conversation. Keep schema migration rules explicit so an older worker cannot misread newly introduced fields.

## Preserve uncertainty in compact state

A good summary says which claims remain tentative and why. Converting “supplier B may support this region” into “supplier B supports this region” changes the task's evidence, even if the sentence is shorter. Include uncertainty fields and source references in structured task state. Test compaction with contradictory documents and incomplete tool results, then verify that the next session still seeks resolution. Compression should remove repetition, not strengthen conclusions beyond what the underlying records justify.

## Practice

Take a long trace and produce a compact handoff. Deliberately omit an unresolved remote action, then restart the run and observe the risk. Add validation that compares unresolved action identifiers with the durable ledger. Finally, change a source document and demonstrate how the next session detects the old summary's stale evidence reference.

## Completion checklist

- Separate event history, structured progress and working summaries.
- Version summaries by state and covered event range.
- Preserve access controls for derived context.
- Test continuity after both compaction and a fresh session.

Continue with [Checkpoints and Resume](/articles/harness-checkpoints-resume) and [Progress Across Sessions](/articles/harness-progress-across-sessions).

## References

- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
- [Anthropic: Harness design for long-running application development](https://www.anthropic.com/research/harness-design-long-running-apps)
