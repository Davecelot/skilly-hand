# Output Optimizer Mode Protocols

## Activation Protocol

- Explicit selector format: `mode: <name>`
- Canonical names:
  - `neandertal`
  - `machine`
  - `step-brief`
  - `toon`
  - `json-compact`
  - `binary-decision`
- Resolution precedence:
1. explicit mode
2. inferred mode from wording
3. default `step-brief`

## TOON Protocol (Strict)

Always output these four blocks in this exact order:

1. `Title`
2. `Objective`
3. `Output`
4. `Next`

Constraints:

- One short line per block.
- No extra blocks.
- No decorative or comic phrasing requirement.

## `json-compact` Protocol

Use compact JSON with minimal stable keys:

```json
{"status":"<value>","mode":"json-compact","next":"<value>"}
```

Rules:

- Keep keys short and predictable.
- Keep values concise.
- No explanatory prose outside JSON.

## `binary-decision` Protocol

Output contract:

```text
yes: <short reason>
```

or

```text
no: <short reason>
```

Rules:

- Exactly one decision token: `yes` or `no`.
- Exactly one brief reason.
- No extra paragraphs.

## Expansion Guard

Expand output only if one or more apply:

- Complexity threatens correctness.
- Ambiguity prevents safe execution.
- Risk is material.
- User explicitly asks for detail.

When expanded, preserve the selected mode shape as much as possible.
