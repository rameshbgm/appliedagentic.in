# Planning, Tool Use and Feedback Loops

Planning helps an agent organize uncertain work, but a written plan is not evidence that the work succeeded. A useful plan connects the user's goal to a small set of next actions and changes when observations contradict assumptions. The controller must still enforce permissions, limits and completion criteria.

The delivery assistant begins with a late shipment question. It might plan to identify the order, inspect the latest carrier event and explain the result. If the order has two shipments, the plan must change. Continuing with the first shipment found would be a planning failure even if every tool call was technically valid.

## Plan at the right level

A plan should describe verifiable subgoals rather than vague intentions. “Find the authorized order” has a recognizable result. “Understand everything about the customer” is unbounded and unnecessary. Keep early plans short because the agent has not yet observed all relevant facts.

Distinguish planned actions from completed actions in state. A task list that marks an item complete merely because the model wrote a sentence creates false progress. Completion should depend on a tool result, validated artifact or user clarification appropriate to the subgoal.

Do not make a long initial plan mandatory for every request. A straightforward lookup may need only one operation. Planning overhead should be justified by uncertainty or dependency, not by a desire to make the agent appear sophisticated.

## Turn observations into next-step decisions

After each tool call, evaluate what changed. Did the observation resolve a required fact, expose a new ambiguity or fail to return usable information? The next action should address a specific remaining gap. Repeating the same lookup without new inputs is rarely a useful plan revision.

Use an explicit state representation:

```text
Goal: explain delayed shipment
Completed: authorized order located
Observation: order has two shipments
Unresolved: which shipment the user means
Next action: ask the user to identify the delayed item
Stop condition: clarification required before further lookup
```

The correct next action is a question, not another speculative carrier request. A robust agent can stop before completing the original goal when progress depends on information only the user can provide.

## Verify progress independently of the plan

A model can claim that it checked a source even when no corresponding operation occurred. Verify important progress against the actual trace. If the final explanation cites a carrier event, the task record should contain that event and its source identifier.

For a code-producing agent, successful execution may require tests and artifact inspection. For a research agent, it may require supported claims and citations. Define verification according to the task rather than reusing a generic “looks complete” judgment.

Verification can be deterministic, model-assisted or human-reviewed. Match the method to the failure cost and what can actually be checked. A second model agreeing with the first does not prove that either inspected the right source.

## Bound revision and recovery

A feedback loop needs a finite budget. Set limits for turns, tool calls, elapsed time and repeated failures. If the plan repeatedly changes without producing new evidence, terminate with an incomplete result and a concise explanation of the unresolved gap.

Classify recovery options. A transient read failure may justify a retry. An authorization denial should not trigger attempts through alternate tools to reach the same protected record. Missing user input should trigger clarification. A contradictory source should trigger verification or an explicit uncertainty statement.

Preserve useful partial results when stopping. A human reviewer should receive the task goal, completed checks, evidence, failed attempts and remaining question. Avoid restarting the entire investigation just because the automatic path reached its limit.

## Exercise

Write a three-step plan for a shipment investigation, then introduce one unexpected observation at each step: two matching orders, a carrier timeout and conflicting event dates. For each, choose a revised action and a stopping condition.

Create a progress table with planned, attempted, verified and unresolved states. Demonstrate that a model's self-reported completion cannot mark a step verified without the required evidence.

## Completion checklist

- Plans contain small subgoals with observable results.
- Tool observations determine meaningful plan revisions.
- Verification checks actual evidence or artifacts.
- Recovery respects authorization and finite execution budgets.

## Continue learning

[Build human review](/articles/engineering-human-review-escalation). [Understand the first loop](/articles/engineering-first-tool-using-agent).

## References

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Building effective agents](https://www.anthropic.com/research/building-effective-agents)
