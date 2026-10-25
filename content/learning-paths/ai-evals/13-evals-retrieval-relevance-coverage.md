# Measure Retrieval Relevance and Coverage

A retrieval system can return plausible documents while missing the passage that determines the answer. It can also find every needed fact but bury those facts beneath irrelevant text. Relevance and coverage describe different aspects of this problem. Evaluating them separately helps you decide whether to change indexing, search, ranking or context assembly.

Beacon answers a question about export retention for contractors working in a particular region. The corpus contains a general policy, a regional exception and an expired version. The correct answer depends on more than finding a document with “retention” in its title. Retrieval must supply the applicable rule and the exception that changes it.

## Define the evidence need

For each case, identify the facts required for a defensible answer. Map those facts to passages or source identifiers in the frozen corpus. A reference set can include alternative passages that express the same fact. Avoid defining relevance solely by the output of the current retriever, because that makes the evaluation inherit its blind spots.

Decide the evaluation unit. A document-level label is different from a passage-level label. Returning the right twenty-page document may still fail if context assembly selects a passage that omits the exception. When the application feeds chunks to the model, evaluate the actual chunks and their source relationships.

Some tasks have several valid evidence combinations. A policy summary and a separate exception table may jointly suffice, while one complete policy passage may suffice alone. Represent required facts and supporting alternatives instead of pretending there is always one unique document list.

## Choose interpretable metrics

At a simple set level, precision at k is the number of relevant retrieved items in the first k divided by k. Recall at k is the number of relevant items retrieved divided by the known relevant-item count. These definitions depend on your labeling unit and reference set. Ragas also documents context metrics with framework-specific calculations, including rank-sensitive approaches; do not assume every tool's similarly named score has the same formula.

Rank matters because context budgets are finite. An applicable passage ranked first is more likely to survive truncation than one ranked twentieth. Report where required evidence appears and whether it reaches the final model context. A search metric can improve while the answer degrades if context assembly drops the decisive passage.

Unknown relevance needs explicit treatment. If reviewers have not assessed the entire corpus, a reference set may be incomplete. A newly retrieved passage can be useful even when absent from the labels. Review such cases before declaring them false positives, and version any label changes.

## Worked example: more results do not guarantee coverage

Suppose the known relevant evidence contains four passages. Beacon retrieves five passages, of which three are relevant. Simple precision at five is three divided by five, or 0.6. Simple recall is three divided by four, or 0.75.

The missing fourth passage contains the regional exception. Although the numerical results look moderate, the answer may be unusable because that fact changes the deadline. Add a required-fact coverage check: general rule found, regional scope found, exception found and effective date found. This diagnostic view explains why the missing passage matters.

Now increase retrieval to ten passages. All four relevant passages appear, so simple recall becomes one, but precision drops to 0.4. Whether this helps depends on ranking and context limits. Test the final assembled context and answer rather than optimizing a single retrieval number in isolation.

## Practice

Create a corpus of eight short fictional policy passages. Write three questions requiring different combinations of evidence. Label required facts and acceptable supporting passages. Calculate simple precision and recall for two retrieval rankings, then inspect whether each ranking supplies enough evidence within a fixed context budget.

## Completion checklist

- Relevance labels are grounded in the task's information need.
- Documents and passages are not confused as evaluation units.
- Metric formulas and reference-set limitations are documented.
- Required facts receive explicit coverage checks.
- The final model context is inspected after ranking and truncation.

## Continue learning

Continue with [the next lesson](/articles/evals-groundedness-citation-accuracy). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [Ragas: Context precision](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_precision/)
- [Ragas: Context recall](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_recall/)
