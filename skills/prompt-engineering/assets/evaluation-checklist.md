# Evaluation Checklist

## Prompt Quality Checklist

- Single primary objective is clear.
- Role is scoped to useful expertise and audience.
- Context is delimited and contains no unnecessary noise.
- Output format is explicit: schema, sections, table columns, or marker.
- Length, tone, exclusions, and missing-data behavior are specified.
- Few-shot examples are short, consistent, and cover important edge cases.
- Safety, injection, or debiasing rules exist when the scenario needs them.
- Decoding parameters match the task risk and creativity target.
- Evaluation method is defined before broad reuse.

## Failure Diagnosis

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Vague or generic answer | Task under-specified | Add audience, deliverable, constraints, and success criteria. |
| Hallucinated facts | Weak grounding or missing-data policy | Add context delimiters, "use only context", citations, and insufficient-data behavior. |
| Invalid JSON | Prompt-only structure is too weak or randomness too high | Use JSON/schema/tool mode, lower temperature, increase `max_tokens`, validate and repair. |
| Output too long | Length goal not explicit | Add word/token cap, exact sections, bullet limits, and stop sentinel. |
| Output truncated | `max_tokens` too low or context too large | Increase budget, chunk by section, reduce context, or use structured generation. |
| Repetitive prose | Prompt lacks variety rule or penalties are too low | Ask for varied openings; then add mild presence/frequency penalties. |
| Weird synonyms or term drift | Repetition penalties too high | Lower penalties; add exact terminology guardrails. |
| Biased or sensitive inference | Prompt allows unsupported attributes | Add non-inference rule, evidence requirement, counterfactual tests. |
| Prompt injection succeeds | Retrieved/user data treated as instructions | Mark docs as untrusted, forbid following embedded instructions, sanitize inputs. |
| Tool call is unsafe | Tool boundaries too broad | Define allowed tools, argument constraints, dry-run mode, and approval gates. |

## Production Metrics

- Schema validity rate.
- Constraint adherence rate: sections, length, required fields, forbidden content.
- Groundedness: unsupported claims per 100 outputs.
- Accuracy/F1/exact match for classification or extraction.
- Rubric pass rate for generative tasks.
- Safety flag rate and false positive/negative rate.
- Bias counterfactual consistency.
- Truncation rate and stop-sequence hit rate.
- Average output tokens, latency, and cost.
- Human escalation or abstention rate.

## Evaluation Loop

```text
1. Build a small dev set with normal, edge, and adversarial examples.
2. Run the prompt with fixed parameters.
3. Validate mechanically where possible.
4. Judge qualitative outputs with a concise rubric.
5. Add failing examples to tests or few-shot coverage.
6. Re-run and compare metrics, cost, and latency.
7. Version the prompt, parameters, rationale, and known failures.
```

## Calibration and Abstention

When confidence affects user trust or automation:

- Treat self-reported confidence as uncalibrated.
- Compare confidence or verifier scores against labeled outcomes.
- Pick thresholds for auto-answer, abstain, repair, or human review.
- Monitor by slice: domain, language, input length, and task type.
- Recalibrate when model, prompt, data, or retrieval changes.
