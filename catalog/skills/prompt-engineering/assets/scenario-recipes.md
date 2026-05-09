# Scenario Recipes

Use these recipes as starting points. Tune prompts and parameters against real examples rather than treating the defaults as universal.

| Scenario | Technique | Prompt controls | Parameter defaults | Validation |
| --- | --- | --- | --- | --- |
| Factual Q&A | Zero-shot or contextual | role, direct task, source/evidence rule | `temperature=0.0-0.3`, lower `top_p` | source check, unsupported-claim scan |
| Executive summary | Zero-shot with structure | audience, word cap, exact sections | `temperature=0.3-0.6`, `top_p=0.8-0.95` | length, section presence, factuality |
| Creative ideation | High-diversity sampling | goal, audience, exclusions, variety guardrail | `temperature=0.8-1.0`, `top_p=0.9-1.0`, higher `top_k` | curate batch, dedupe, score originality |
| Marketing copy | Few-shot plus style constraints | brand voice, examples, forbidden claims | `temperature=0.6-0.8`, mild penalties | claim review, tone review |
| JSON extraction | Structured output | JSON-only, schema, null-if-missing | `temperature=0.0-0.3`, no penalties, adequate `max_tokens` | parse and schema validation |
| Classification | Zero/few-shot | labels, decision rules, tie/unknown policy | `temperature=0.0-0.2` | accuracy/F1 on labeled set |
| RAG answer | Contextual prompting | trusted docs delimiters, injection guardrail | `temperature=0.0-0.3` | citation match, groundedness check |
| Coding help | Role plus constraints | language, existing patterns, tests, no hallucinated APIs | `temperature=0.0-0.3`, no penalties | compile/tests/static checks |
| Reasoning/math | Bounded reasoning | numbered steps, final answer marker | `temperature=0.0-0.3` | independent verification |
| Ambiguous planning | Step-back or Tree of Thoughts | criteria first, breadth/depth limits, scoring rubric | `temperature=0.4-0.7` | rubric score, constraint check |
| Tool/agent workflow | ReAct | allowed tools, action format, final boundary | low temperature for tool selection | tool-call allowlist, stop condition |
| Safety-sensitive answer | Guardrailed prompt | refusal/fallback, evidence rule, low variance | `temperature=0.0-0.2` | red-team cases, policy gate |
| Bias-sensitive decision | Debiasing prompt | non-inference rule, evidence fields, uncertainty | `temperature=0.0-0.3` | counterfactual tests |
| Production prompt optimization | APE plus evaluation | candidate generation, dev set, metrics | vary intentionally, keep judge low temp | hold-out metrics, latency/cost |

## Parameter Notes

- For precision, reduce randomness before adding more instructions.
- For creativity, generate multiple candidates and select; do not rely on one high-temperature output.
- For JSON, code, schemas, and strict terminology, keep presence and frequency penalties at `0.0`.
- For long prose or brainstorming, add mild repetition penalties only after prompt-level variety rules are insufficient.
- Use `max_tokens` for cost and truncation control; use explicit length instructions for concision.
- Use stop sequences such as `<<END>>` or `###END###` when the endpoint must be unambiguous.

## Technique Selection

```text
Need speed and task is common? -> Zero-shot
Need exact examples copied in spirit? -> One-shot/few-shot
Need answers grounded in provided docs? -> Contextual/RAG prompting
Need principles before details? -> Step-back prompting
Need hard reasoning reliability? -> Self-consistency or verifier
Need exploration with alternatives? -> Tree of Thoughts
Need tools? -> ReAct boundaries
Need production reliability? -> Structured output + validation + tests
```
