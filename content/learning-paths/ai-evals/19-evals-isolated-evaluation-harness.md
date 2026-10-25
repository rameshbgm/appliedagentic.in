# Build an Evaluation Harness with Isolated Test Environments

An evaluation harness is the infrastructure that runs cases and records results. It prepares the environment, invokes an agent, collects evidence, applies graders and cleans up. It differs from an agent harness, which controls the agent's own execution loop. The two may interact, but keeping their responsibilities distinct prevents the system under test from controlling its own measurement.

Beacon's evaluator needs a frozen document corpus and a fake tracker. Each trial must begin with the same logical records while receiving a unique namespace. Without isolation, one trial can leave a task that makes the next trial look successful or causes an unrelated duplicate-action failure.

## Design the run lifecycle

Use explicit stages: validate the case, prepare fixtures, execute the agent, capture final state, grade evidence, persist the report and clean up. Each stage should have a distinct status and error category. A setup failure is not an agent failure. A grader crash is not evidence that the agent passed or failed the requirement.

Allocate stable identifiers for the suite snapshot, case, trial and candidate configuration. Save these identifiers with every trace event and artifact. The report should point to the exact fixture and grader versions used, allowing a reviewer to reconstruct the tested conditions later.

Treat budgets as part of the run contract. Specify maximum wall time, tool calls and model usage where applicable. When a budget is exceeded, record a controlled termination reason and capture whatever state exists. Do not lose the trace merely because the run did not finish normally.

## Isolate state and permissions

Give each trial its own database schema, tenant namespace, temporary directory or equivalent sandbox. The appropriate mechanism depends on the application, but the invariant is simple: a trial must not read or alter another trial's state. Parallel execution makes this especially important.

Use synthetic credentials scoped to the evaluation environment. Keep production write endpoints inaccessible to ordinary test cases. If a live integration check is explicitly needed, run it under a separate policy with bounded, reviewable effects and label its results accordingly. Controlled regression runs should not depend on changing external systems.

Freeze time when dates affect the result. A retention case that passes on Monday and fails on Friday because the fixture uses the real clock is not reproducible. Supply an evaluation clock or fixed timestamps. Also record locale and timezone when formatting or deadline calculations depend on them.

## Worked example: a minimal runner

The following pseudocode describes responsibilities rather than a particular framework API:

```text
for case in suite:
    environment = prepare(case.fixture, unique_namespace())
    try:
        run = execute(candidate, case.request, environment, budget)
        evidence = capture(run.trace, environment.final_state())
        result = grade(case.criteria, evidence)
        persist(case.id, run.id, candidate.version, result, evidence)
    except SetupError:
        persist_infrastructure_failure(case.id)
    finally:
        environment.cleanup()
```

A production runner needs more detailed exception handling. If execution fails after a write, capture state before cleanup. If grading fails, preserve evidence so the grader can be repaired and rerun without repeating the agent's actions. Cleanup failures should be visible and retried safely rather than ignored.

Suppose two parallel trials share one fake tracker. Each expects exactly one new task. Both create a task, and each grader sees two new tasks. The agent may be correct while the harness produces false failures. Unique namespaces remove the interference. Add a harness self-test that runs identical cases concurrently and confirms isolation.

## Practice

Build a small runner for three cases using temporary directories and an in-memory tracker. Save a case manifest, execution trace, final state and grader output for each trial. Force one setup error and one grader error. Confirm that both are distinguishable from an ordinary agent failure and that evidence remains available after cleanup.

## Completion checklist

- Setup, execution, grading and cleanup have distinct statuses.
- Trial state and credentials are isolated.
- Time, corpus and configuration versions are controlled.
- Evidence survives execution and grader failures.
- Concurrent harness self-tests detect cross-trial interference.

## Continue learning

Continue with [the next lesson](/articles/evals-fair-configuration-comparisons). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [pytest: How to use fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html)
- [SWE-bench: Evaluation infrastructure](https://github.com/SWE-bench/SWE-bench)
