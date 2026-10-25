# Add Regression Evals and Release Gates to CI

A regression evaluation asks whether a change breaks behavior the team already depends on. Running it in continuous integration makes that question part of ordinary delivery rather than a special activity before a demonstration. The workflow needs more than a command that prints a score. It must preserve evidence, classify failures and enforce a release policy the team understands.

Beacon's repository contains deterministic tests, a small agent smoke suite and a larger reviewed regression suite. The team wants quick feedback on ordinary changes while retaining stronger evidence for releases. They design separate lanes with explicit purposes rather than running every expensive evaluation on every keystroke.

## Choose evaluation lanes

Fast checks can validate dataset schemas, fixture availability, grader self-tests and application contracts. A small smoke suite can detect obvious agent breakage. A broader regression suite can run for release candidates or on a schedule appropriate to the team. Live monitoring remains separate because changing external state makes it unsuitable as the sole reproducible gate.

Define which changes trigger which lane. Editing a tool schema may require action-behavior cases; changing retrieval may require grounding and coverage cases. Also retain a core cross-cutting suite so selective execution does not miss interactions. Document the selection logic and test that it cannot silently skip all relevant cases.

Keep execution budgets bounded. A failed dependency should produce a clear infrastructure status, not an indefinite waiting job. Rate limits and provider outages require a defined retry policy that does not selectively rerun only agent failures until the dashboard turns green.

## Make gates explicit

A gate can combine mandatory checks and tolerated variation. For example, the team's policy may block any observed unauthorized write, require all deterministic contract tests to pass and require review of material quality regressions. Thresholds are product decisions, not universal constants.

Record how inconclusive runs are handled. If half the suite fails to initialize, a high score on the remaining cases should not pass the gate automatically. Require minimum valid coverage or a human decision under a documented exception process. Exceptions need an owner, rationale and expiry so temporary workarounds do not become invisible policy.

Keep gate logic separate from report presentation. A chart may show rounded percentages, while the decision should use exact case outcomes and policy rules. A rounded “100%” can conceal one failed case in a large suite.

## Preserve artifacts securely

Store the dataset manifest, candidate version, grader versions, result table and selected traces as workflow artifacts. GitHub Actions documents artifact upload and retention as a way to preserve workflow outputs. Configure access and retention according to the sensitivity of the evidence; traces may include synthetic or permissioned document content.

Do not expose production credentials to untrusted pull-request code. Evaluation jobs that need secrets require a trusted execution design. A content-only validation job can often run without model credentials, while a protected agent run happens after the appropriate repository controls are satisfied.

## Worked example: an actionable failure

A pull request changes Beacon's task tool description. The smoke suite passes, but the action regression suite finds two duplicate-write failures in after-commit timeout cases. The report links each failure to its case, trace and final-state difference. The gate blocks because uniqueness is mandatory.

The developer can reproduce the cases locally with the same fixtures and inspect the retry behavior. After a fix, the full affected suite reruns. The report retains the original failure evidence and the new result. Merely rerunning the failed stochastic trials until they pass would not establish that the underlying regression was repaired.

## Practice

Design a CI workflow with content validation, grader self-tests and a protected agent regression job. Write a machine-readable gate policy and a failure report template. Simulate a provider outage, an unauthorized action and a small quality regression. Confirm that the workflow distinguishes infrastructure uncertainty from a measured product failure.

## Completion checklist

- Evaluation lanes have explicit scope and trigger rules.
- Gates distinguish mandatory boundaries from graded quality.
- Invalid coverage cannot silently produce a passing result.
- Artifacts preserve reproducible evidence with controlled access.
- Reruns and exceptions follow documented policies.

## Continue learning

Continue with [the next lesson](/articles/evals-production-failures-regression-cases). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [GitHub Actions: Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [GitHub Actions: Store and share workflow data](https://docs.github.com/en/actions/tutorials/store-and-share-data)
