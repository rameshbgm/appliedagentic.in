# Break Large Goals into Verifiable Tasks

A large goal such as “build a supplier research assistant” contains many hidden requirements. If the harness gives that goal to a model repeatedly, the agent may work on attractive details while missing essential behavior. A task structure makes progress inspectable and gives each session a bounded objective with evidence of completion.

## Decompose around observable outcomes

Write tasks that produce artifacts or verifiable behavior. “Improve the interface” is difficult to close objectively. “Add a document search form that shows a source link for every result” provides a clearer outcome. Include acceptance criteria, dependencies, required access and the expected evidence for each task.

Keep task size small enough to complete and verify within an execution session, while avoiding fragmentation into meaningless actions. Reading a file is usually an execution step, not a user-valued task. Building a tested retrieval adapter can be a task. The right granularity depends on complexity, tooling and the reliability of available checks.

Separate required scope from optional improvements. A task queue should preserve the original requirements even when the agent discovers useful extras. Otherwise the system can spend its entire budget polishing work that was never necessary while declaring the central request complete.

## Build a dependency graph

For a cited research assistant, define document ingestion, retrieval, answer generation, citation verification and a user workflow. Retrieval depends on ingestion. Citation verification depends on stable document identifiers. A usable workflow depends on the necessary components being connected. Represent these relationships explicitly rather than relying on list order alone.

```text
T1: ingest sample documents -> indexed records + source IDs
T2: retrieve relevant passages [depends T1] -> ranked results
T3: generate grounded answers [depends T2] -> cited response
T4: verify citations [depends T3] -> validation report
T5: demonstrate full workflow [depends T4] -> recorded acceptance run
```

The harness selects only tasks whose dependencies are satisfied and whose required capabilities are available. If a prerequisite fails, mark downstream work blocked with a reason. Do not ask the model to improvise missing credentials or silently replace a required integration with a fake implementation.

## Bind completion to evidence

Each task should reference evidence such as a passing check, an artifact checksum or a confirmed provider response. The agent may propose that a task is complete, but the harness should validate the required evidence before changing its durable status. For subjective requirements, use a documented reviewer or evaluation rubric rather than an invented binary test.

Evidence can become stale. If a later task changes a shared component, earlier checks may need to run again. Track which artifacts and versions support each acceptance criterion. You do not need an elaborate build system initially, but you do need to know whether a result describes the current implementation.

## Allow controlled replanning

Discovery may reveal that the original decomposition was incomplete. Permit the agent to propose task changes with reasons and dependency updates. Keep a revision history. Changes to user-visible scope or consequential permissions should follow the application's authorization rules rather than being accepted as ordinary planning edits.

Watch for cycles, repeated reopening and tasks that expand indefinitely. A planner can create busywork just as an executor can loop. Limit planning overhead and measure completed requirements, not the number of tasks created. The simplest plan that preserves important dependencies is often easier to operate and review.

## Distinguish blocked from unfinished

An unfinished task may be ready for another execution step, while a blocked task depends on missing evidence, credentials or another task. Store the blocking reason and the condition that would clear it. This prevents the scheduler from repeatedly assigning work that cannot progress. If a dependency is optional, document the fallback behavior and its effect on the final result. The agent should not silently treat a blocked required integration as completed just because an alternative demonstration was easy to produce.

## Practice

Decompose a document assistant into five to eight tasks. For each, write an acceptance criterion and the artifact or check that proves it. Introduce a requirement that changes citation format halfway through. Update the dependency graph and identify which evidence must be refreshed before the final workflow can be accepted.

## Completion checklist

- Describe tasks through observable outcomes.
- Preserve required scope and dependency relationships.
- Validate completion evidence against current artifact versions.
- Record replanning without silently expanding authorization.

Continue with [Progress Across Sessions](/articles/harness-progress-across-sessions) and [Completion Checks and Recovery](/articles/harness-completion-recovery).

## References

- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
- [Anthropic: Harness design for long-running application development](https://www.anthropic.com/research/harness-design-long-running-apps)
