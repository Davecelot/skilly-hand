---
name: "prompt-engineering"
description: "Guide users in writing, improving, evaluating, and tuning prompts for LLMs across factual, creative, structured, grounded, coding, safety-sensitive, and production scenarios. Trigger: writing, improving, evaluating, or tuning prompts for LLMs."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-05-09"
  license: "Apache-2.0"
  version: "1.0.0"
  changelog: "Added portable prompt-engineering guidance from NotebookLLM source material; improves reusable prompt design, tuning, and evaluation workflows; affects catalog skill routing and prompt quality support"
  auto-invoke: "Writing, improving, evaluating, or tuning prompts for LLMs"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "Task"
---
# Prompt Engineering Guide

## When to Use

Use this skill when:

- A user wants to write, improve, debug, or compare prompts for an LLM.
- The task needs a prompt strategy for a scenario such as Q&A, ideation, extraction, RAG, coding, safety review, or agent/tool use.
- The user needs decoding or output controls such as temperature, top-p, top-k, max tokens, stop sequences, or repetition penalties.
- Prompt quality needs evaluation through tests, rubrics, structured validation, self-evaluation, or red-team cases.

Do not use this skill for:

- General project implementation where prompt design is incidental.
- Provider-specific current model recommendations unless the user asks and current sources can be verified.
- Replacing safety, legal, medical, financial, or compliance review with prompt wording alone.

---

## Critical Patterns

### Pattern 1: Build the Prompt Contract First

Every strong prompt should make the contract explicit:

| Component | Purpose |
| --- | --- |
| Role | Sets useful expertise and voice without vague "expert" framing. |
| Task | Names the single primary outcome. |
| Context | Supplies only relevant facts, data, sources, or constraints. |
| Constraints | Defines length, tone, exclusions, evidence rules, and missing-data policy. |
| Examples | Shows desired input -> output behavior when style or format matters. |
| Output | Specifies schema, sections, table columns, or final answer boundary. |
| Evaluation | States how success will be judged or validated. |

Default missing-data rule:

```text
If required information is missing, say "insufficient data" or return null.
Do not infer or invent facts.
```

### Pattern 2: Choose the Lightest Strategy That Fits

| Scenario | Recommended strategy |
| --- | --- |
| Simple, standard task | Zero-shot with explicit format and length. |
| Style, label, or schema consistency matters | One-shot or few-shot examples. |
| Context-grounded answer or RAG | Contextual prompting with delimiters and "use only context." |
| Principle-heavy planning or critique | Step-back prompting, then apply the criteria. |
| Math, logic, or multi-step reasoning | Bounded reasoning with a clear final answer contract. |
| Hard reasoning where one path may fail | Self-consistency with multiple samples and vote/verify. |
| Exploration or planning with many possible paths | Tree of Thoughts with breadth, depth, and scoring limits. |
| Tool or external-data workflow | ReAct-style Thought/Action/Observation/Final boundaries. |
| Safety, bias, or policy risk | Debiasing instructions, red-team cases, fallback text, and low randomness. |

### Pattern 3: Tune Parameters by Risk and Goal

| Goal | Starting controls |
| --- | --- |
| Factual Q&A, classification, code, compliance | `temperature=0.0-0.3`, lower `top_p`, no repetition penalties. |
| General explanations, summaries, UX copy | `temperature=0.4-0.6`, `top_p=0.8-0.95`, mild penalties only if repetitive. |
| Creative ideation, slogans, fiction, brainstorming | `temperature=0.8-1.0`, `top_p=0.9-1.0`, higher `top_k`, generate multiple candidates. |
| Structured JSON, code, legal/medical terminology | Keep penalties at `0.0`; use schema/function calling or validation. |

Rules:

- `max_tokens` caps output; it does not make writing concise.
- Stop sequences define clean boundaries; keep a rare sentinel as a finish line.
- Tune one primary knob at a time, usually temperature or top-p.
- Model/provider choice should be based on durable traits: context length, cost, latency, modality, tool support, deployment constraints, safety posture, and instruction-following reliability.

### Pattern 4: Validate, Repair, and Version Prompts

Use this loop:

```text
Draft prompt -> run examples -> inspect failures -> refine prompt/params -> validate -> version
```

For production prompts:

- Add golden tests for schema, sections, length, and expected decisions.
- Validate structured outputs with JSON Schema, Zod, Pydantic, regex, or equivalent parsers.
- Use a rubric judge or self-evaluation pass when quality cannot be checked mechanically.
- Add red-team and debiasing cases when prompts touch safety, sensitive attributes, tools, PII, or policy.
- Track prompt version, model, parameters, metrics, known failures, and rationale.

---

## Decision Tree

```text
Is the task simple and low risk?
  YES -> Use zero-shot with role, task, format, and length.

Does the output need exact structure or style?
  YES -> Use few-shot examples plus schema/JSON/tool mode and validation.

Must the answer use only supplied facts?
  YES -> Delimit context, say "use only context", define missing-data behavior.

Does the task require reasoning or design tradeoffs?
  YES -> Use step-back first; add bounded reasoning or ToT only if needed.

Does the model need tools or current external data?
  YES -> Use ReAct boundaries, allowed tools, observations, and final-answer stop.

Could bias, unsafe content, prompt injection, PII, or tool abuse matter?
  YES -> Add safety/debiasing rules, red-team tests, low randomness, and fallback.

Otherwise
  -> Use the general prompt template and evaluate one or two outputs.
```

---

## Prompt Patterns

### General Prompt Skeleton

```text
System: You are a <ROLE> writing for <AUDIENCE>.

Task: <ONE-SENTENCE GOAL>.

Context:
<<<CONTEXT>>>
<relevant facts or data>
<<<END_CONTEXT>>>

Constraints:
- Format: <FORMAT>
- Length: <= <LIMIT>
- Tone: <TONE>
- Use only the supplied context when factual grounding is required.
- If unknown, output null or "insufficient data"; do not invent.

Output:
<schema, sections, table columns, or final answer boundary>
```

### Structured Output Contract

```text
Return ONLY valid JSON. No prose, no markdown, no code fences.
If a value is unknown, use null. Do not infer missing data.

Schema:
<TYPE OR JSON SCHEMA>

Input:
<<<DATA>>>
...
<<<END_DATA>>>
```

### Evaluation Prompt

```text
Evaluate the candidate against the rubric. Be strict and concise.
Return ONLY JSON:
{
  "valid": true,
  "scores": {"fidelity": 1, "grounding": 1, "format": 1},
  "violations": [],
  "repair_plan": ""
}

Rubric:
- Fidelity: follows the task exactly.
- Grounding: uses only supplied context.
- Format: matches the requested contract.

Candidate:
<<<ANSWER>>>
...
<<<END_ANSWER>>>
```

---

## Resources

- Prompt templates: [assets/prompt-templates.md](assets/prompt-templates.md)
- Scenario recipes: [assets/scenario-recipes.md](assets/scenario-recipes.md)
- Evaluation checklist: [assets/evaluation-checklist.md](assets/evaluation-checklist.md)
- NotebookLLM source map: [references/notebookllm-source-map.md](references/notebookllm-source-map.md)
