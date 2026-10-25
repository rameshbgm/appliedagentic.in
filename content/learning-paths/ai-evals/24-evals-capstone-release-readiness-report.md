# Build an Evaluation Suite and Release Readiness Report

The capstone brings the learning path together around one concrete decision: is a specified version of Beacon ready for a defined pilot? You will build the evaluation evidence and write the decision report. Readiness is scoped to users, tasks, permissions and operating conditions. It is not a claim that the agent is universally reliable.

Beacon researches a fictional handbook, answers with citations and can create a follow-up task after approval. Use synthetic documents and an isolated tracker. If you built a different agent in the engineering path, adapt the same evaluation structure to its actual contract rather than adding irrelevant features solely to match this example.

## Define the assessment scope

Write the intended users, supported tasks, allowed data sources and permitted actions. Identify mandatory boundaries, such as no cross-team reads and no protected writes without approval. Define expected behavior for missing evidence, conflicting policy and tool failure.

Select a baseline and candidate configuration. Freeze their prompts, tools, model settings and corpus snapshot. State whether the comparison uses equal budgets or intended production budgets. List external dependencies and unresolved sources of variability. The report should make the tested system identifiable without exposing credentials.

Choose an explicit release policy before seeing candidate scores. Include how invalid runs, grader uncertainty and mandatory violations affect the decision. If the suite is too small to justify the intended deployment, reduce the scope or gather more evidence rather than inventing precision.

## Assemble the evidence package

Create a versioned case collection spanning ordinary requests, ambiguous requests, missing evidence, conflicting sources, authorization boundaries and controlled tool failures. Keep development cases separate from a reviewed assessment collection. Label coverage and provenance. Preserve related task families together when splitting.

Implement deterministic checks for schemas, required identifiers and final-state differences. Add an evidence-grounding judge only where interpretation is necessary, and calibrate it with reviewed examples. Keep human review criteria and adjudication records. Include grader self-tests so the measurement logic can be checked independently of the agent.

Build or reuse an isolated evaluation harness. Each trial should have its own namespace, a fixed clock where relevant and bounded execution. Save initial state, tool traces, final state, grader outputs and configuration identifiers. Confirm that setup and grading failures are distinct from agent failures.

## Run, inspect and compare

Execute the baseline and candidate on the same snapshot using a documented trial plan. Inspect every mandatory violation, grader disagreement and infrastructure anomaly. Review a sample of apparent passes to detect false acceptance. Do not replace unfavorable trials with reruns without a declared policy.

Produce paired case results and task-family slices. Report quality, inappropriate abstention, unsupported guessing, cost, latency and uncertainty with clear denominators. Separate representative workload estimates from stress-case performance. Preserve the raw evidence behind every summary.

## Worked example: write a bounded decision

Imagine a candidate improves ordinary policy answers but fails one after-commit timeout case by creating a duplicate task. The release policy treats duplicate protected actions as blocking. A defensible report recommends withholding the action feature while allowing further assessment of a read-only pilot, if that narrower scope is separately authorized and evaluated.

That recommendation is more useful than “the agent scored eighty-eight percent.” It names the failed contract, the affected feature, the remaining evidence and the next test. After a repair, rerun the affected family and the core suite. Keep the original report so reviewers can trace why the decision changed.

## Practice: deliverables and review

Submit a dataset manifest, case files, fixture snapshots, grader definitions, runner instructions, result table and readiness report. The report should lead with the scoped recommendation, then explain mandatory findings, observed improvements, regressions, coverage gaps and operational follow-up. Include links to evidence rather than pasting sensitive traces into an unrestricted document.

Ask a reviewer who did not build the agent to reproduce one successful and one failed case. Their experience tests whether the evaluation package is genuinely usable. If reproduction requires undocumented local state, repair the package before treating it as release evidence.

## Completion checklist

- Scope and release policy were written before candidate inspection.
- Cases, fixtures, graders and candidates are versioned.
- Runs are isolated, bounded and reproducible.
- Reports preserve regressions and uncertainty alongside improvements.
- An independent reviewer can reproduce representative outcomes.

## Continue learning

Continue with [the next lesson](/articles/evals-what-are-ai-evals). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [GitHub Actions: Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
