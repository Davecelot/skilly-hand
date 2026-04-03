---
name: scannlab-token-validation
description: >
  Unified token validation skill for ScannLab Design System. Covers two phases: (1) Figma-to-token
  matching — maps raw Figma design values to ScannLab CSS tokens after extraction; (2) CSS auditing —
  finds hard-coded values in component CSS and guides replacements with design tokens. Invoke the
  appropriate sub-agent based on the task phase. Prerequisite for Figma phase: scannlab-figma-extractor.
  Trigger: When matching Figma values to design tokens OR auditing/reviewing component CSS for token compliance.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.1"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [ui]
  auto-invoke: "Matching Figma values to design tokens, Auditing components for hard-coded values"
allowed-tools: Read, Edit, Write, Grep, Bash, Task
allowed-modes:
  - figma-matcher   # Map raw Figma design values to ScannLab tokens after scannlab-figma-extractor runs
  - css-auditor     # Audit existing component CSS files for hard-coded values
---

# ScannLab Token Validation

This skill consolidates all token validation work into two focused phases, each handled by a dedicated sub-agent. Both phases share the same decision tree, exemptions, and token reference.

## Sub-Agents

| Phase | Sub-Agent | When to use |
|---|---|---|
| Figma → Token matching | [`agents/figma-matcher.md`](agents/figma-matcher.md) | You have Figma specs from `scannlab-figma-extractor` and need to map values to tokens |
| CSS auditing | [`agents/css-auditor.md`](agents/css-auditor.md) | Auditing existing component CSS for hard-coded values |

**Always read the relevant sub-agent before starting work.** The sub-agents contain phase-specific workflows and output formats.

---

## Shared: Decision Tree

Both sub-agents use this decision tree to classify each value:

```
Is the value inside var(...)?             → SKIP (already tokenized)
Is it a CSS keyword (none, auto, etc.)?   → SKIP (exempt)
Is it 0 or 0px?                           → SKIP (exempt)
Is it a % value?                          → SKIP (exempt)
Is it for width or height?                → SKIP (fixed dimensions are expected)

Is it a color (#hex, rgb, rgba, hsl)?     → Match against --s-color-* tokens
Is it on padding/margin/gap/itemSpacing?  → Match against --s-spacing-* or --s-layout-*
Is it a strokeWeight / border-width?      → Match against --s-border-width-*
Is it a cornerRadius / border-radius?     → Match against --s-radius-*
Is it a fontSize?                         → Match against --s-font-size-*
Is it a fontWeight?                       → Match against --s-font-weight-*
Is it a lineHeight?                       → Match against --s-line-height-*
Is it a dropShadow / box-shadow?          → Match against --s-elevation-*
Is it a fontFamily?                       → Match against --s-font-primary
```

---

## Shared: Exemptions

These values are always exempt and must never be flagged or replaced:

| Value | Reason |
|---|---|
| `0`, `0px` | Zero is universal |
| `none`, `transparent`, `currentColor` | CSS keywords |
| `inherit`, `initial`, `unset`, `revert` | CSS cascade keywords |
| `100%`, `50%`, other `%` values | Relative sizing |
| `auto` | Browser-computed |
| `1` (as in `flex: 1`) | Flex shorthand |
| Values already using `var(...)` | Already tokenized |
| Values inside `calc(...)` using `var()` | Computed from tokens |
| `display`, `position`, `cursor`, `pointer-events` | Not design-token properties |
| `flex-shrink`, `flex-grow`, `aspect-ratio`, `z-index` | Structural, not visual tokens |
| **`width`, `height`** | **Fixed dimensions are expected hard-coded specs** |

> **Important:** Spacing tokens (`--s-spacing-*`, `--s-layout-*`) are **only** for `padding`, `margin`, and `gap` — **never** for `width` or `height`.

---

## Resources

- **Token reference**: [`references/token-map.md`](references/token-map.md) — complete raw-value → token lookup
- **Token docs**: [`projects/scanntech-ui/src/docs/tokens/`](../../projects/scanntech-ui/src/docs/tokens/)
- **Figma extractor prerequisite**: [`scannlab-figma-extractor`](../scannlab-figma-extractor/SKILL.md)
