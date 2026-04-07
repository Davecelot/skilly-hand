# Output Optimizer Guide

## When to Use

Use this skill when:

- You want compact responses to reduce output token usage.
- You need deterministic output formats for repeated workflows.
- You need concise communication without losing core clarity.
- You want controlled detail expansion only when risk or ambiguity requires it.

Do not use this skill for:

- Cases where the user explicitly asks for long-form teaching or narrative detail.
- Tasks that require extensive legal, medical, or compliance explanation by default.
- Situations where a fixed external output schema already overrides style choices.

---

## Critical Patterns

### Pattern 1: Activation and Precedence

Apply modes in this order:

1. If user writes `mode: <name>`, use that mode.
2. If no explicit mode, infer from phrasing:
- "keywords only" -> `machine`
- "yes or no" / "binary" -> `binary-decision`
- "json" / "structured output" -> `json-compact`
- "step by step, concise" -> `step-brief`
- "command style" / "minimal commands" -> `neandertal`
- "toon format" -> `toon`
3. If no strong signal, default to `step-brief` for human-readable compact output.

Explicit mode always wins over inferred mode.

### Pattern 2: Mode Contracts

| Mode | Contract | Token Profile |
| --- | --- | --- |
| `neandertal` | Imperative command-like short phrases, no filler, minimal connectors. | Lowest human-readable |
| `machine` | Keywords only, grouped by labels, no prose sentences. | Ultra-low |
| `step-brief` | Numbered steps, each step max 3-4 short phrases. | Low with clarity |
| `toon` | Exactly 4 blocks: `Title`, `Objective`, `Output`, `Next`. | Low and stable |
| `json-compact` | Minimal stable JSON keys and short scalar values. | Low + parseable |
| `binary-decision` | `yes` or `no` plus one short reason. | Ultra-low for triage |

### Pattern 3: Complexity + Confidence Guard

Default to compact output. Expand only when:

1. Task complexity is moderate/high and concise output may cause mistakes.
2. Requirements are ambiguous and short output cannot preserve correctness.
3. Risk is elevated (security, production impact, irreversible operations).
4. User explicitly asks for more detail.

When expanding, keep structure compact and scoped to the needed clarification.

### Pattern 4: Compression Rules

Always prefer:

- Specific nouns over long explanations.
- One-pass direct answer over repeated restatement.
- Bounded lists over paragraphs.
- Deterministic templates where possible.

Avoid:

- Polite filler and redundant transitions.
- Repeating the prompt unless needed for disambiguation.
- Verbose caveats when risk is low.

---

## Decision Tree

```text
User provided `mode: <name>`?                 -> Use explicit mode
No explicit mode, strong phrasing signal?     -> Infer mode from signal
No explicit mode and no signal?               -> step-brief
Task complexity/ambiguity/risk is high?       -> Expand within selected mode
User asks for detail/clarification?           -> Expand within selected mode
Otherwise                                     -> Keep compact output
```

---

## Output Examples

### Example 1: `neandertal`

```text
Check logs. Find error. Patch file. Run tests. Report result.
```

### Example 2: `machine`

```text
status:blocked
cause:missing-env
action:set-token,retry
```

### Example 3: `step-brief`

```text
1. Open config file. Find auth block. Confirm token key.
2. Add missing key. Save file. Re-run command.
3. Verify success output. Capture result. Share summary.
```

### Example 4: `toon`

```text
Title: Auth Fix
Objective: Restore CLI login flow
Output: Config key added, login passes
Next: Run smoke check
```

### Example 5: `json-compact`

```json
{"status":"ok","mode":"json-compact","next":"deploy"}
```

### Example 6: `binary-decision`

```text
yes: tests pass on required suite
```

---

## Prompt Patterns

These are prompt fragments, not terminal commands.

```text
mode: neandertal
mode: machine
mode: step-brief
mode: toon
mode: json-compact
mode: binary-decision
```

```text
explain in detail
```

---

## Resources

- Mode protocol reference: [references/mode-protocols.md](references/mode-protocols.md)
- Related complexity control: [../token-optimizer/SKILL.md](../token-optimizer/SKILL.md)
