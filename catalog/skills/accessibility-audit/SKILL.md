---
name: "accessibility-audit"
description: "Audit web accessibility against W3C WCAG 2.2 Level AA using framework-agnostic checks, remediation patterns, and portable command-line scanning."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-04-04"
  license: "Apache-2.0"
  version: "1.0.0"
  changelog: "Added portable WCAG 2.2 Level AA accessibility auditing skill with W3C-only references and scanner script; enables consistent web accessibility review across frameworks; affects catalog skill coverage and install plans for stacks recommending accessibility-audit"
  auto-invoke: "Auditing, reviewing, or implementing web accessibility against WCAG 2.2 Level AA"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "WebFetch"
    - "WebSearch"
    - "Task"
    - "SubAgent"
---
# Accessibility Audit Guide

## When to Use

Use this skill when:

- Auditing components or pages for WCAG conformance.
- Reviewing pull requests that change templates, interactive UI, forms, or styles.
- Defining accessibility acceptance criteria for frontend delivery.
- Converting automated scanner findings into prioritized remediations.

Do not use this skill for:

- Product-specific visual token compliance.
- Framework-only code style reviews unrelated to accessibility behavior.
- Non-web formats that need a dedicated standard beyond WCAG web content checks.

---

## Baseline and Sources

Default baseline:

- **WCAG 2.2 Level AA**.

W3C status notes (verified from W3C WCAG overview):

- WCAG 2.2 was published on **5 October 2023** and updated on **12 December 2024**.
- W3C encourages using the latest WCAG version.

Use only W3C sources for decisions and remediation rationale.

---

## Critical Patterns

### Pattern 1: Audit in POUR Order

Audit checks in this order to reduce misses:

1. **Perceivable**: text alternatives, structure, contrast.
2. **Operable**: keyboard, focus, target size, predictable interaction.
3. **Understandable**: labels, errors, language, clear behavior.
4. **Robust**: semantic roles/states and assistive-technology compatibility.

### Pattern 2: Prefer Native Semantics First

- Use native controls (`button`, `a`, `input`, `select`, `textarea`) before ARIA-heavy custom widgets.
- If custom widgets are necessary, define role, keyboard behavior, name, state, and relationship.
- Never remove focus indicators without a visible replacement.

### Pattern 3: Prioritize by User Impact

Fix in this order:

1. Keyboard and focus blockers.
2. Missing names/labels for controls and media.
3. Form errors and status announcements.
4. Contrast and non-text contrast issues.

### Pattern 4: Validate with W3C Tooling

Use W3C validators as baseline technical checks, then complete manual WCAG behavior review:

- Nu HTML Checker
- CSS Validator

---

## Decision Tree

```text
Is this an interactive control?                       -> Verify keyboard access + visible focus + accessible name
Is this non-text content (image/icon/media)?         -> Verify text alternative strategy
Is this a form input or validation message?          -> Verify labels, instructions, errors, and status messaging
Is this a custom widget pattern?                     -> Verify role/state/property model and keyboard model
Does styling reduce legibility or discernibility?    -> Verify text + non-text contrast and target size
Otherwise                                            -> Run checklist sweep and document residual risk
```

---

## Code Examples

### Example 1: Icon Button with Accessible Name and Focus Indicator

```html
<button type="button" aria-label="Close dialog" class="icon-button">
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
</button>
```

```css
.icon-button:focus-visible {
  outline: 2px solid #005a9c;
  outline-offset: 2px;
}
```

### Example 2: Labeled Input with Error Association

```html
<label for="email">Email address</label>
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" role="alert">Enter a valid email address.</p>
```

### Example 3: Semantic Click Target Instead of Generic Container

```html
<button type="button" class="card-action">Open details</button>
```

```html
<div role="button" tabindex="0" aria-label="Open details"></div>
```

---

## Commands

```bash
# Run default scan on current directory
bash catalog/skills/accessibility-audit/scripts/audit-a11y.sh

# Scan a specific path
bash catalog/skills/accessibility-audit/scripts/audit-a11y.sh src

# Generate markdown report
bash catalog/skills/accessibility-audit/scripts/audit-a11y.sh --report src

# Generate JSON output for CI pipelines
bash catalog/skills/accessibility-audit/scripts/audit-a11y.sh --json src
```

---

## Resources

- Full checklist: [references/w3c-wcag22-checklist.md](references/w3c-wcag22-checklist.md)
- WCAG overview (WAI): https://www.w3.org/WAI/standards-guidelines/wcag/
- WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/
- How to Meet WCAG 2 (Quick Reference): https://www.w3.org/WAI/WCAG22/quickref/
- Understanding WCAG 2: https://www.w3.org/WAI/WCAG22/Understanding/
- W3C standards context: https://www.w3.org/standards/
- W3C validators and tools: https://www.w3.org/developers/tools/
- W3C homepage: https://www.w3.org/
