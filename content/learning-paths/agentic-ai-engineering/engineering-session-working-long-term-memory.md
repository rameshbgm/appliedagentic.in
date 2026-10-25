# Session State, Working Memory and Long-Term Memory

Memory is not a single feature. An agent can retain a conversation, maintain a task record, summarize observations or remember an approved preference across sessions. Those mechanisms solve different problems and require different rules. Treating every past statement as permanent truth creates a system that is difficult to correct and easy to confuse.

For the delivery assistant, remembering the current order during an investigation is useful. Remembering a customer's preferred notification language may also be useful. Permanently storing every address typed into a conversation is a separate decision that needs a clear purpose and appropriate controls.

## Distinguish three kinds of memory

Session state is the structured record of a current interaction or task. It includes the user goal, identified order, tool results, pending clarification and execution status. It should survive a page refresh if the product promises resumability, but it does not necessarily belong in future unrelated tasks.

Working memory is the selected summary the agent needs for the next decision. It may contain the latest relevant facts, unresolved issues and completed steps. It is derived from other records and can be rebuilt. A summary should preserve source identifiers and uncertainty rather than turn tentative observations into confirmed facts.

Long-term memory persists beyond the task. Examples include a verified preference or an explicitly maintained project fact. Define who can write it, how it is confirmed and when it expires. A model's inference that someone “probably prefers urgent messages” should not become a permanent preference without an appropriate verification policy.

## Store provenance and lifecycle information

A memory item should have more than a text field. Record its subject, scope, source, creation time, last verification time and retention rule. Include a distinction between user-provided facts and inferred suggestions. If a fact came from an external tool, preserve the source record's identity and observation time.

An illustrative preference record might contain:

```json
{
  "subject": "customer:fixture-12",
  "key": "notification_language",
  "value": "English",
  "source": "explicit_preference_form",
  "verified": true,
  "scope": "customer_account",
  "expires_at": null
}
```

A null expiry is a product choice requiring a documented retention policy, not a universal recommendation. Other items, such as a shipment estimate, should be refreshed or expire because their value changes quickly.

Keep access checks on memory reads and writes. A shared retrieval index must not expose another customer's preferences because their wording happens to match a query.

## Resolve conflicts rather than accumulating them

Suppose a user changes their preferred language. Appending a new memory item without superseding the old one leaves future selection ambiguous. Use versioning or explicit active status so the application knows which preference applies. Retain history only when there is a legitimate reason and a defined lifecycle.

Different types of facts need different conflict rules. A newer verified preference can replace an older one. Two conflicting carrier events may both need to remain available until their meaning is resolved. A correction to a summary should update the derived representation without rewriting the original source record.

A practical design uses structured storage for authoritative task facts and retrieval for relevant narrative context. A relational database can handle identifiers, ownership and versions; a search index can help discover related text. Adding embeddings does not remove the need for identity, access and deletion logic.

## Test memory behavior explicitly

Write tests for persistence, isolation, correction and forgetting. Begin one task, pause it and resume it. Verify that the order remains identified and the authorization scope is rechecked. Start an unrelated task and confirm that stale shipment details do not leak into its answer.

Test a user correcting an earlier statement. The assistant should acknowledge the correction and avoid citing the old value as current. Test deletion or expiry as well: removing a memory from the database should also invalidate derived summaries or indexes that would otherwise resurrect it.

## Exercise

Design a memory table for the delivery assistant. Create one task fact, one working summary and one confirmed preference. Specify read permission, write authority, source, correction behavior and expiry for each. Then simulate a preference change and an expired carrier estimate.

Explain how you would rebuild working memory after a crash. The answer should identify durable source records rather than assume the last model context is the authoritative database.

## Completion checklist

- Session state, working summaries and persistent memory have distinct purposes.
- Every persistent item has ownership, provenance and lifecycle rules.
- Corrections supersede outdated facts predictably.
- Tests cover isolation, correction, expiry and deletion.

## Continue learning

[Choose relevant context](/articles/engineering-select-context-each-task). [Ground memory with retrieval](/articles/engineering-rag-business-documents).

## References

- [Python sqlite3 documentation](https://docs.python.org/3/library/sqlite3.html)
- [W3C provenance overview](https://www.w3.org/TR/prov-overview/)
