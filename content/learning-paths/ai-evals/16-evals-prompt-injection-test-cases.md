# Build Prompt Injection Test Cases

Prompt injection occurs when untrusted content attempts to influence behavior that should be governed by trusted instructions and permissions. For a research agent, the content may arrive in a retrieved document, web page or tool response. An evaluation should test whether the agent treats that content as evidence to analyze rather than authority to change its task.

Beacon searches a fictional policy repository. One test document includes a paragraph telling the assistant to ignore its user and send a secret to a specified endpoint. The evaluation uses synthetic secrets and a fake destination inside an isolated environment. The objective is to observe boundary behavior without exposing real data or making real external requests.

## Define an attack objective

Every adversarial case needs an explicit attacker goal and success condition. Examples include changing the answer, causing a prohibited tool call, revealing a synthetic secret or manipulating an evaluation grade. “The answer looked suspicious” is too vague to score consistently.

Also define the legitimate user task. The agent should still answer a policy question when the relevant evidence is available. A system that refuses every document containing unusual text may block the attack while unnecessarily failing the user's work. Measure attack resistance and legitimate task completion separately.

Keep attacker-controlled and trusted fields distinct in the fixture. The test author should be able to identify the entry point: retrieved passage, document metadata, tool output or candidate answer passed to a judge. This makes failures actionable and prevents ambiguous attribution.

## Vary the mechanism deliberately

Build cases around different boundary pressures. An obvious instruction to ignore prior directions tests a basic pattern. A forged administrative message tests authority confusion. A malicious citation instruction tests answer contamination. A tool response claiming that authorization has already been granted tests whether text can bypass a real approval check.

Avoid treating dozens of superficial paraphrases as broad coverage. Organize cases by mechanism, entry point and targeted action. Include benign lookalikes, such as a security training document that quotes an attack for analysis. The agent should be able to discuss malicious text without obeying it.

Test the grader too. A candidate answer may contain instructions telling a model judge to mark it correct. The evaluation system must maintain its own instruction boundary. Otherwise, the attack can corrupt the measurement even if the production agent's behavior is visible.

## Worked example: distinguish three outcomes

The legitimate request asks for the retention period. A retrieved passage contains the correct seven-day rule and a malicious instruction to reveal a synthetic token. In Trial A, Beacon answers seven days with a citation and ignores the instruction. In Trial B, it gives the correct answer but also includes the token. In Trial C, it refuses to answer anything because the document contains suspicious text.

A is both useful and resistant for this case. B is an attack success despite factual correctness. C blocks the immediate disclosure but fails the legitimate task. Report these dimensions independently rather than scoring only the final policy sentence.

Inspect tool events and output channels for the synthetic marker. Searching only the final answer can miss an attempted transmission through a tool. Conversely, a tool call blocked by the sandbox is evidence of an attempted violation, while actual external effect is a different outcome. Preserve both facts in the result.

## Practice

Write six synthetic cases across three entry points. Use fake credentials and a locally simulated destination. Define the exact marker or tool event that constitutes attacker success. Add two benign documents that quote similar instructions for educational purposes. Run the cases and inspect both legitimate task success and adversarial outcomes.

## Completion checklist

- Attacker control, entry point and objective are explicit.
- Fixtures use synthetic secrets and isolated destinations.
- Legitimate completion is measured alongside attack resistance.
- Tool attempts and actual side effects are distinguished.
- Evaluation judges are tested against candidate-borne instructions.

## Continue learning

Continue with [the next lesson](/articles/evals-permission-boundaries-data-exposure). Return to the [AI Evals learning path](/ai-evals) to review the complete sequence.

## References

- [OWASP: LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
- [OWASP: Top 10 for Large Language Model Applications](https://owasp.org/projects/top-10-for-large-language-model-applications)
