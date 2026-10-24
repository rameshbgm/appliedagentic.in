# Model, Application and Agent Evaluation

When an AI system returns an incorrect answer, “the model failed” is only a hypothesis. The retriever may have supplied the wrong policy. The application may have truncated a critical passage. A tool may have returned a stale value. The agent may have received correct evidence and still chosen an unauthorized action. An evaluation strategy should locate these differences rather than collapse every outcome into one model score.

Beacon, our fictional research assistant, offers a useful example. A model produces language. The application retrieves handbook excerpts and formats a response. An agent version can also open a follow-up task in a work tracker. Each layer introduces behavior that a narrower test cannot establish. Your goal is to choose evaluation boundaries that match the decision you need to make.

## Evaluate the model under controlled inputs

A model-level case supplies a fixed input and examines the generated output. For example, present one paragraph about retention and ask for a structured answer containing a number of days and a source identifier. This helps compare extraction or instruction-following under controlled conditions.

Keep the prompt, examples, response schema and sampling settings recorded. A comparison between models using different prompts measures two configurations, not an isolated model effect. That can be a valid product decision, but describe it accurately. Avoid attributing the whole difference to the model when tool descriptions or retrieval context also changed.

A model benchmark can help identify candidates. It cannot guarantee behavior in your own workflow because its tasks, tools and environment may differ. Treat external benchmark results as background evidence rather than a substitute for application-specific cases.

## Evaluate the application contract

An application evaluation begins before retrieval and ends at the user-visible response. Supply the real user request, the corpus snapshot and the relevant user context. Check whether retrieval found the needed policy, whether the answer uses it and whether the interface returns the expected schema.

This layer can expose preprocessing failures that a model test misses. Imagine that Beacon correctly reads any provided policy, but document ingestion removes table headings. A question about regional retention limits now lacks the relationship between regions and values. Replacing the language model does not repair the damaged corpus. A focused ingestion test and an end-to-end application case provide better evidence.

Use contract tests for stable boundaries such as parser outputs, date normalization and schema validation. Reserve model-based grading for judgments that actually require language understanding. Simple checks are easier to inspect and less expensive to run repeatedly.

## Evaluate execution and state changes

An agent evaluation adds an environment in which actions have consequences. The fixture should include initial records, tool permissions and expected final state. Capture the action trace and inspect both intended and unintended effects.

Suppose the request is, “Create a follow-up for the policy owner and include the source.” A final message saying “Done” is insufficient. Query the tracker and verify that one task exists, the owner is correct and the cited document is attached. Also verify that the agent did not create duplicate tasks or change the source policy. Outcome assertions test the contract; trace checks reveal how the agent crossed relevant boundaries.

## Worked example: diagnose by narrowing

Consider twelve failed end-to-end cases. Rerunning the language step with the correct policy resolves seven. Those seven point toward retrieval or context assembly. Of the remaining five, three produce correct answers but write the wrong tracker field. Two still state an unsupported exception even with correct context.

This classification suggests three investigations: retrieval quality, tool argument construction and answer grounding. The counts are an illustrative debugging exercise, not proof of causality. Confirm the diagnosis by changing one suspected component and rerunning paired cases. Preserve the original failed configurations so the improvement remains auditable.

## Practice

Draw the boundaries of your system from request to final state. Select one requirement at each layer. Write a model extraction case, an application retrieval case and an agent action case for the same user goal. Identify which artifacts each test needs and which failures it cannot detect. Run them in order and explain how a pass at one layer can coexist with a failure at another.

## Completion checklist

- Evaluation boundaries match an explicit engineering decision.
- Model inputs are controlled when isolating model behavior.
- Application cases include retrieval and preprocessing.
- Agent cases inspect persisted state and unintended side effects.
- Reports name the complete configuration being compared.

## Continue learning

Continue with [the next lesson](/articles/evals-define-success-before-building). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
- [SWE-bench: Evaluation infrastructure](https://github.com/SWE-bench/SWE-bench)
