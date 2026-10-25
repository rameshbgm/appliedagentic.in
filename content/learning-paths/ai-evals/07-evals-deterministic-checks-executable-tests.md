# Deterministic Checks and Executable Tests

Not every evaluation requires another language model. If a requirement concerns a JSON schema, a numeric field, an existing record or a prohibited tool event, an executable check is often clearer. Deterministic graders apply explicit logic to saved evidence. Their main advantage is inspectability: a reviewer can see exactly why a result passed or failed.

Deterministic does not mean infallible. A precise check can encode the wrong requirement. The task author must still decide which observable behavior represents success. In this lesson, Beacon creates a follow-up task after finding a policy. We will grade both its structured response and the resulting tracker state.

## Start at stable boundaries

Use schema validation to check required fields, types and permitted values. A response containing a task identifier should not pass if that identifier is an empty string. Validate meaning separately from structure: a well-formed identifier can still refer to the wrong record.

Normalize only differences that the requirement permits. Whitespace and equivalent date formats may be harmless; changing a currency or dropping a negative sign is not. Write normalization rules next to the assertion so the reviewer can distinguish intentional flexibility from accidental permissiveness.

For a tool-using agent, inspect events and persisted state. A successful tool response alone is insufficient if the tool fixture can return success without storing the requested change. Query the resulting state directly. Conversely, a timeout after a successful write may still leave the desired record present. That outcome needs an explicit classification rather than an assumption that all timeouts mean no action occurred.

## Build independent assertions

Suppose the fixture starts with two tracker tasks. The user asks Beacon to create one follow-up assigned to policy owner Mira. A useful grader checks that exactly one additional task exists, its owner is Mira, its policy reference is correct and the original two tasks are unchanged.

Illustrative Python, independent of any model SDK:

```python
def grade(before, after, expected):
    created = [row for key, row in after.items() if key not in before]
    checks = {
        "one_created": len(created) == 1,
        "existing_unchanged": all(after.get(k) == v for k, v in before.items()),
    }
    if len(created) == 1:
        checks["owner"] = created[0]["owner"] == expected["owner"]
        checks["source"] = created[0]["source"] == expected["source"]
    return {"pass": all(checks.values()), "checks": checks}
```

In a real system, ignore explicitly permitted server-generated differences such as update timestamps when comparing unchanged records. Do not ignore all metadata automatically: an audit owner or permission field may be central to the contract. Define a comparison projection with the fields that matter.

## Test the grader itself

Create synthetic evidence for a correct run and several incorrect runs. Include zero created tasks, two duplicate tasks, the wrong owner and an unintended edit to an existing task. The grader should reject each for the expected reason. These tests are worthwhile because the grader is a measurement instrument that will influence release decisions.

Also test incomplete evidence. If the state snapshot is missing, return an invalid-evaluation status instead of declaring the agent successful. A check that catches an exception and returns true can silently turn infrastructure failures into inflated performance.

## Worked example: exactness at the right level

Suppose ten responses refer to the same policy using different sentence structures. Exact string matching passes only four. A fact-level check accepting the integer seven and the correct policy identifier passes eight. Manual inspection finds that one of those eight also recommends an unsupported exception.

The lesson is not that the broader check is wrong. It checks a narrower claim: required facts are present. Add a separate unsupported-claim grader rather than pretending the fact assertion proves the entire answer is correct. Maintain a clear relationship between each check and the claim it supports.

## Practice

Implement three assertions for a fictional action tool: correct record creation, no duplicate creation and no changes to unrelated records. Write at least five synthetic traces and state snapshots that exercise the checks. Include an incomplete snapshot and require the grader to distinguish invalid evidence from an agent failure.

## Completion checklist

- Every check maps to a stated requirement.
- Schema validity and semantic correctness are separate.
- Final state is inspected for consequential actions.
- Graders have synthetic positive and negative examples.
- Missing evidence produces an explicit invalid-run classification.

## Continue learning

Continue with [the next lesson](/articles/evals-llm-judge-rubrics-bias-calibration). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Python: unittest](https://docs.python.org/3/library/unittest.html)
- [pytest: How to use fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html)
