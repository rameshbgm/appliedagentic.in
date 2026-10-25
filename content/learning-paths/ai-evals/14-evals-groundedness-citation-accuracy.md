# Evaluate Groundedness and Citation Accuracy

An answer can be factually plausible and still be unsupported by the evidence the application was allowed to use. It can also include a real citation that does not support the adjacent claim. Groundedness and citation accuracy address these problems. They are especially important for assistants whose value depends on answering from a specific, governed knowledge source.

Beacon is asked about a retention policy. Its answer states a seven-day limit, a regional exception and a supposed manager override. The supplied policy supports the limit and exception but says nothing about a manager override. A polished explanation with three document links should not pass merely because the links resolve.

## Distinguish related questions

Correctness asks whether a claim is true under the task's reference facts. Groundedness asks whether supplied evidence supports it. Citation validity asks whether the referenced source exists and is accessible in the permitted context. Citation support asks whether that source substantiates the associated claim. These dimensions overlap but are not identical.

A model may know a true general fact that is outside the allowed evidence. If the product promises source-bounded answers, that claim still needs qualification or omission. Conversely, a retrieved document can contain an outdated statement. Faithfully repeating it may be grounded in the passage while still failing the task's effective-date requirement.

Define the evidence boundary in each case. Is the agent allowed to use only retrieved handbook documents, or may it add clearly labeled general knowledge? The grader must apply the same contract the user experiences.

## Decompose claims carefully

Break the answer into material factual claims. Preserve qualifiers such as population, date, region and exceptions. “Contractors in Region A may retain an export for seven days unless a signed exception applies” should not become a simple “seven days” fact that loses the condition.

Then map each claim to supporting evidence. Record supported, contradicted and insufficient-evidence judgments separately. A contradiction is more informative than merely absent support. When using a model judge for this mapping, calibrate it with reviewed examples where qualifiers change the meaning.

A simple claim-support rate is supported material claims divided by all material claims. This is a teaching metric, not a universal product score. Ragas documents a related faithfulness approach; implementations differ in claim extraction and entailment judgments. Record the method rather than treating its output as self-explanatory.

## Worked example: a citation-rich wrong answer

Suppose Beacon produces four material claims. Three are supported by allowed passages. The fourth claims that a manager can extend retention without review. It cites the general policy, which contains no such exception. A simple support rate is three out of four, or seventy-five percent.

That percentage should not automatically imply acceptable quality. The unsupported claim changes the user's permitted action. Mark it as a failure of a mandatory policy criterion. Separately report that all four citation URLs resolve, three citations support their claims and one does not. This explains why link availability is a weak substitute for evidence quality.

Consider another answer that makes only one supported claim and omits the required regional exception. Its support rate is one hundred percent, but it fails completeness. Pair groundedness with required-fact coverage so the agent cannot improve its score simply by saying almost nothing.

## Practice

Write three answers to one fictional policy question: fully supported, partly unsupported and incomplete but supported. Create a claim table with evidence spans and support labels. Add an outdated source and verify that your grader distinguishes evidence support from current-policy correctness. Review every claim that affects a user's action.

## Completion checklist

- Correctness, groundedness and citation support are separate checks.
- Material claims retain scope, dates and exceptions.
- Citations are checked for both resolution and actual support.
- High-consequence unsupported claims cannot hide in an average.
- Completeness prevents minimal answers from gaming support metrics.

## Continue learning

Continue with [the next lesson](/articles/evals-abstention-missing-evidence). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Ragas: Faithfulness](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/)
- [Ragas: Context precision](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_precision/)
