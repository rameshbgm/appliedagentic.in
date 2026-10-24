# Test Permission Boundaries and Data Exposure

An agent should not gain access merely because it can ask convincingly. Authorization is a property of the system's identity, permissions and enforcement points. Evaluation tests whether those controls remain effective across natural-language requests, tool calls, retrieved evidence and output channels. A refusal in the final answer does not prove that restricted data was never accessed earlier.

Beacon serves two fictional teams. Team Cedar can read its own policies; Team Harbor can read a separate repository. The test environment contains synthetic documents with distinctive markers. Those markers make unauthorized access detectable without using real confidential information.

## Build an identity and resource matrix

List user identities, resource scopes and permitted operations. Include read, create, update and administrative actions separately. A user allowed to read a policy may not be allowed to change it. A service account with broad technical access should still apply the requesting user's scope where the product contract requires it.

Construct positive and negative cases from the matrix. Positive cases verify that legitimate work succeeds. Negative cases verify denial for inaccessible documents, cross-team identifiers and unauthorized tool operations. Include boundary cases where a public summary is allowed but the underlying restricted document is not.

Do not use only natural-language statements such as “I am an administrator” to simulate identity. The fixture should supply the actual authenticated principal and permission claims that the application enforces. A user message claiming elevated status should not alter those trusted fields.

## Inspect every relevant channel

Check tool access logs, retrieved context, final answers, citations and generated files. A response might avoid quoting restricted content while revealing a sensitive document title in a citation. A debug log may store a secret that never appears in the user-facing answer. These are different exposure channels with different audiences.

Define which fields are sensitive in the fixture. Use synthetic markers in document bodies, titles and metadata so the evaluator can detect partial disclosures. A single generic secret string may miss exposure through identifiers or inferred relationships.

Authorization checks should happen at enforced boundaries, not only in model instructions. The evaluation can confirm this by sending a direct prohibited tool request through the runtime's test interface. If a tool accepts it despite the user scope, the system has a control defect even if the model usually avoids that call.

## Worked example: denial is not the whole result

A Cedar user asks for a Harbor policy by its exact identifier. Beacon calls the search tool, which returns the restricted document body. Beacon then says, “I cannot share that policy.” An answer-only refusal grader passes, but the access log reveals that the restricted content entered the model context.

Classify this as an authorization-boundary failure. The final refusal limits one output channel but does not undo the improper read. Repair the tool or retrieval scope and rerun both the prohibited request and legitimate Cedar requests. Otherwise, a fix that blocks all retrieval could appear secure while breaking the product.

Now test a write requiring approval. Supply an expired approval record and verify rejection. Reuse an approval for a different resource and verify rejection again. The approval should be bound to the intended action and scope according to the application's contract, not accepted because some approval-shaped text exists.

## Practice

Create a two-team fixture with three resources per team and one public resource. Write an access matrix and derive eight cases covering legitimate reads, cross-team reads, unauthorized writes and scoped approvals. Place different synthetic markers in titles and bodies. Inspect tool logs, context and answers for those markers.

## Completion checklist

- Identity and permissions come from trusted fixture state.
- Positive and negative authorization cases are both included.
- Access, context and output channels are inspected separately.
- Synthetic markers cover body text and metadata exposure.
- Approval scope, expiry and reuse behavior are tested.

## Continue learning

Continue with [the next lesson](/articles/evals-tool-environment-failure-recovery). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [OWASP: Top 10 for Large Language Model Applications](https://owasp.org/projects/top-10-for-large-language-model-applications)
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
