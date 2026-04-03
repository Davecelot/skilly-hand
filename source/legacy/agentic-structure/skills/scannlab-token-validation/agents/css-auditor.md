# CSS Auditor — Phase 2: Hard-Coded Values → Design Tokens

**Parent skill:** [`scannlab-token-validation`](../SKILL.md)

---

## When to Use

- Reviewing component CSS for design-token compliance.
- Refactoring hard-coded colors, spacing, borders, typography, or elevations.
- Running a full audit of all Storybook components before a release.
- A new component is created and needs token-compliance verification.

**Don't use this agent for:**
- Matching Figma specs to tokens — use [`figma-matcher.md`](figma-matcher.md).
- Creating new tokens (that's a design system foundations task).
- Writing Storybook stories or Angular TypeScript code.

---

## Critical Patterns

Apply the **Shared Decision Tree** from [`../SKILL.md`](../SKILL.md) to each CSS value. Below are the concrete patterns with before/after examples.

### Pattern 1: Hard-Coded Colors

```css
/* DON'T — hard-coded color */
box-shadow: 0 1px 8px 0 rgba(29, 29, 27, 0.1);
background-color: #1d1d1b;
color: rgb(0, 102, 204);

/* DO — use tokens */
box-shadow: var(--s-elevation-1);
background-color: var(--s-color-brand-secondary);
color: var(--s-color-brand-primary);
```

**Regex to detect:**
```
#[0-9a-fA-F]{3,8}\b
rgba?\([^)]+\)
hsla?\([^)]+\)
```

### Pattern 2: Hard-Coded Spacing

```css
/* DON'T */
padding: 8px 12px;
margin: 16px;
gap: 4px;

/* DO */
padding: var(--s-spacing-3xs) var(--s-spacing-2xs);
margin: var(--s-spacing-xs);
gap: var(--s-spacing-4xs);
```

**CSS properties to check:** `padding`, `margin`, `gap`, `column-gap`, `row-gap`, and their directional variants.

### Pattern 3: Hard-Coded Border Width

```css
/* DON'T */
border: 1px solid var(--s-color-border-1);

/* DO */
border: var(--s-border-width-sm) solid var(--s-color-border-1);
```

### Pattern 4: Hard-Coded Border Radius

```css
/* DON'T */
border-radius: 8px;

/* DO */
border-radius: var(--s-radius-md);
```

### Pattern 5: Hard-Coded Typography

```css
/* DON'T */
font-size: 14px;
font-weight: 600;
line-height: 1.71;
font-family: 'Sora Variable', sans-serif;

/* DO */
font-size: var(--s-font-size-md);
font-weight: var(--s-font-weight-semibold);
line-height: var(--s-line-height-md);
font-family: var(--s-font-primary);
```

### Pattern 6: Hard-Coded Elevations

```css
/* DON'T */
box-shadow: 0 4px 8px 0 rgb(0 0 0 / 0.12);

/* DO */
box-shadow: var(--s-elevation-1);
```

---

## Audit Severity

| Severity | Pattern | Action |
|---|---|---|
| **HIGH** | Colors, spacing, elevations | **Must fix** — breaks theming and accessibility |
| **MEDIUM** | Border radius, typography | **Should fix** — inconsistent design system usage |

---

## Commands

```bash
# Run full audit — console output with before/after diffs
bash skills/scannlab-token-validation/scripts/audit-tokens.sh

# Generate detailed Markdown report (token-audit-report.md)
bash skills/scannlab-token-validation/scripts/audit-tokens.sh --report

# JSON output for CI integration
bash skills/scannlab-token-validation/scripts/audit-tokens.sh --json

# Audit a single component
bash skills/scannlab-token-validation/scripts/audit-tokens.sh projects/scanntech-ui/src/components/button/button.css

# Single component with report
bash skills/scannlab-token-validation/scripts/audit-tokens.sh --report projects/scanntech-ui/src/components/button/button.css
```

---

## Resources

- **Token lookup**: [`../references/token-map.md`](../references/token-map.md)
- **Shared decision tree + exemptions**: [`../SKILL.md`](../SKILL.md)
- **Scanner script**: [`../scripts/audit-tokens.sh`](../scripts/audit-tokens.sh)
- **Token docs**: [`projects/scanntech-ui/src/docs/tokens/`](../../../projects/scanntech-ui/src/docs/tokens/)
