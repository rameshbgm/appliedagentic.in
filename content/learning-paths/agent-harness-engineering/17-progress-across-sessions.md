# Preserve Progress Across Sessions

A new model session does not automatically know what an earlier session attempted, which files changed or which checks failed. A durable handoff gives the next session a trustworthy starting point. It should combine structured execution facts with concise narrative context, so the agent can continue useful work without replaying every previous conversation.

## Define the handoff record

Include the original objective, current task, completed requirements, unresolved questions and next recommended action. Reference artifacts by stable identifier and version. Record the environment image or dependency lock state, the latest checkpoint and pending external actions. Keep budget and authorization information in authoritative runtime records rather than a free-form note.

A progress note is useful for explanations, but it is not proof. “All tests pass” should link to a check result for a specific artifact version. “Uploaded the report” should reference a confirmed action record. The next session can then distinguish verified facts from the previous agent's interpretation.

Write the handoff at a deliberate session boundary. If possible, finish a small task, verify artifacts and commit the progress record atomically with the task-state transition. If the session must stop mid-task, state exactly what remains incomplete. Honest partial progress is more useful than a polished note that implies completion.

## Restart a report-building session

Session one creates a retrieval adapter and a sample document index. It records the adapter version, index checksum and passing fixture results. The next task is citation validation, with one known issue involving superseded documents. Session two begins by verifying artifact access and reading that issue before making new model calls.

```text
handoff = load_latest_handoff(run)
state = load_authoritative_task_state(run)
assert handoff.checkpoint_id == state.accepted_checkpoint
verify_artifact_versions(handoff.artifacts)
reconcile_pending_actions(state)
context = original_goal + state + handoff.narrative + next_task
```

If the workspace changed between sessions, the harness should detect the mismatch and refresh its view. A stale note about file locations can otherwise send the new agent into repeated repairs or cause it to overwrite unrelated work. Treat external changes as new evidence rather than as corruption to be erased automatically.

## Keep workspace state coherent

For code tasks, use version control and clean task boundaries when appropriate. Record which changes belong to the run and which were present beforehand. Avoid resetting the workspace simply to obtain a clean status; that can destroy user work. An isolated checkout can reduce conflicts, but it still requires explicit artifact and branch ownership.

For non-code tasks, use immutable drafts and manifests. A manifest can list source versions, generated files and validation results. The next session should not infer completeness from the presence of a filename alone. A file may be partially written or refer to stale inputs.

## Measure continuity quality

Look for repeated searches, duplicated edits, forgotten constraints and unsupported completion claims. These indicate a weak handoff or context selection problem. Compare runs with compact notes, structured state and combinations of both. Measure whether the next session resumes the correct task and whether previous side effects are repeated.

Do not make handoffs excessively detailed. A hundred pages of history recreates the original context problem. Preserve authoritative records in storage and provide a concise, navigable index. Let the next session retrieve specific artifacts when needed under current authorization.

## Preserve ownership when people intervene

A human may edit the draft or repository between agent sessions. Record the observed baseline and compare it with current state before continuing. Incorporate legitimate changes rather than assuming the earlier session's version is the only correct one. If two edits conflict, preserve both versions and resolve the conflict through the application's normal workflow. A good handoff helps the next agent collaborate with ongoing work; it should not become a reason to overwrite changes made after the previous checkpoint.

## Practice

Stop a coding or document run after one completed task and one incomplete task. Give a fresh session only the handoff and authorized artifacts. Ask it to identify current progress before continuing. Score whether it chooses the correct next task, retains the user constraints and avoids repeating an earlier external operation.

## Completion checklist

- Link progress claims to verified evidence.
- Preserve incomplete work and unresolved actions explicitly.
- Detect artifact and workspace changes on resume.
- Keep handoffs concise while retaining retrieval paths to detail.

Continue with [Context Compaction and Persistent State](/articles/harness-compaction-persistent-state) and [A Resumable Agent Runtime](/articles/harness-capstone-resumable-runtime).

## References

- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
- [SQLite: Atomic commit](https://www.sqlite.org/atomiccommit.html)
