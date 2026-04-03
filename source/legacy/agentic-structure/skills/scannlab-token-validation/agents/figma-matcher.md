# Figma Matcher — Phase 1: Figma Specs → ScannLab Tokens

**Parent skill:** [`scannlab-token-validation`](../SKILL.md)
**Prerequisite:** [`scannlab-figma-extractor`](../../scannlab-figma-extractor/SKILL.md) must have run first.

---

## When to Use

- You have extracted raw design specs (fills, strokes, spacing, typography, effects) from Figma.
- You need to translate Figma specs into ScannLab CSS tokens before writing any code.
- You are comparing a Figma component against an already-implemented Angular component to verify token consistency.

**Don't use this agent for:**
- Extracting data directly from Figma — run `scannlab-figma-extractor` first.
- Auditing existing CSS files for hard-coded values only — use [`css-auditor.md`](css-auditor.md).

---

## Workflow

Follow these steps **in order**:

### Step 0 — Verify Pre-Extracted Specs

Before starting token matching, confirm you have:

- Layer hierarchy and component structure from the extractor
- Raw design properties (colors, spacing, typography, shadows, etc.)
- Variant information (if component has multiple states)
- Design token references (if any already mapped in Figma)

If missing any of these, **go back and run `scannlab-figma-extractor`** on the Figma link first.

### Step 1 — Collect the Raw Specs

Gather all design properties from the Figma extraction:

| Category | Figma Properties to Collect |
|---|---|
| Colors | `fills`, `strokes`, background colors, text colors |
| Spacing | `paddingTop/Right/Bottom/Left`, `itemSpacing` (gap) |
| Border | `strokeWeight`, `cornerRadius` (per-corner or uniform) |
| Typography | `fontSize`, `fontWeight`, `lineHeight`, `fontFamily` |
| Effects | `dropShadow` values (offset, blur, spread, color) |

### Step 2 — Match Each Value Against Tokens

Walk each value through the **Shared Decision Tree** in [`../SKILL.md`](../SKILL.md). Use [`../references/token-map.md`](../references/token-map.md) for the exact lookup tables.

### Step 3 — Produce the Token Mapping Table

Output a Markdown table using the format in **Output Format** below.

### Step 4 — Flag Unmatched Values

Any value that doesn't map to a known token gets `UNMATCHED`. Call these out explicitly so the team can decide whether a new token is needed or the Figma spec is incorrect.

### Step 5 — Cross-Check Against Implementation (If Component Exists)

**This step is MANDATORY when comparing Figma specs against an already-implemented code component.**

- Read the component's CSS file to identify which tokens are currently in use.
- Create a detailed comparison table with 3 columns: Figma Token, Code Token, Match Status.
- Flag any mismatches immediately, even if both use tokens (e.g., Figma says `--s-spacing-2xs` but code uses `--s-spacing-3xs`).
- Document the comparison clearly so discrepancies are unambiguous.

**Why this matters:** Even if code uses tokens (not hard-coded values), those tokens could be wrong. A mismatch between code and Figma specs is a consistency error that must be fixed.

---

## Output Format

### Token Mapping Table

```markdown
## Figma → ScannLab Token Mapping: [Component Name]

| Property | Figma Value | ScannLab Token | Status |
|---|---|---|---|
| background | `#1D1D1B` | `var(--s-color-brand-secondary)` | Matched |
| color | `#FFFFFF` | `var(--s-color-body-primary-inverse)` | Matched |
| font-size | `14px` | `var(--s-font-size-md)` | Matched |
| font-weight | `600` | `var(--s-font-weight-semibold)` | Matched |
| line-height | `1.71` | `var(--s-line-height-md)` | Matched |
| padding | `8px 12px` | `var(--s-spacing-3xs) var(--s-spacing-2xs)` | Matched |
| border-radius | `8px` | `var(--s-radius-md)` | Matched |
| border-width | `1px` | `var(--s-border-width-sm)` | Matched |
| box-shadow | `0 1px 8px rgba(...)` | `var(--s-elevation-1)` | Matched |
| width | `120px` | — | Exempt |
| height | `40px` | — | Exempt |
| margin-top | `10px` | No exact token | Unmatched |

### Summary
- 9 matched tokens
- 2 exempt (width/height)
- 1 unmatched — needs review
```

### Cross-Check Table (Step 5, if applicable)

```markdown
## Cross-Check: Figma vs Code Implementation

### Mismatches Found

| Property | Figma Token | Code Token | Issue |
|---|---|---|---|
| padding-top | `--s-spacing-2xs` (12px) | `--s-spacing-3xs` (8px) | Code uses wrong token |

### Verified Matches

| Property | Token | Value |
|---|---|---|
| padding-right | `--s-spacing-xs` | 16px |
| padding-bottom | `--s-spacing-2xs` | 12px |

### Recommendation
Update code to match Figma specs:
- [ ] `padding-top`: Change from `--s-spacing-3xs` to `--s-spacing-2xs`
```

---

## Resources

- **Token lookup**: [`../references/token-map.md`](../references/token-map.md)
- **Shared decision tree + exemptions**: [`../SKILL.md`](../SKILL.md)
- **Token docs**: [`projects/scanntech-ui/src/docs/tokens/`](../../../projects/scanntech-ui/src/docs/tokens/)
