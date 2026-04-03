---
name: scannlab-a11y-checker
description: >
  Checks Angular component accessibility against W3C WCAG 2.2 official standards.
  Trigger: When reviewing, creating, or auditing components for accessibility compliance.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [ui]
  auto-invoke: "Reviewing or auditing component accessibility"
allowed-tools: Read, Edit, Write, Grep, Bash, Task
---

# ScannLab Accessibility Checker (WCAG 2.2)

## When to Use

**Use this skill when:**

- Reviewing component HTML templates for accessibility compliance.
- Creating new interactive components (buttons, modals, dropdowns, forms).
- Auditing a component or page against WCAG 2.2 Level A + AA.
- Resolving accessibility issues flagged by automated tools or QA.

**Don't use this skill for:**

- Token compliance (use `scannlab-token-audit`).
- Writing Storybook stories (use `scannlab-storybook`).
- General Angular best practices (use `scannlab-best-practices`).

---

## Source of Truth

All patterns reference the **WCAG 2.2** standard (W3C Recommendation, October 2023):

| Resource | URL |
|---|---|
| WCAG 2.2 Standard | https://www.w3.org/TR/WCAG22/ |
| Quick Reference | https://www.w3.org/WAI/WCAG22/quickref/ |
| Understanding WCAG 2.2 | https://www.w3.org/WAI/WCAG22/Understanding/ |
| WCAG at a Glance | https://www.w3.org/WAI/standards-guidelines/wcag/glance/ |

**Target conformance: Level AA** (covers all Level A + AA success criteria).

---

## WCAG 2.2 — The 4 Principles

### Principle 1: Perceivable

Information and UI components must be presentable in ways users can perceive.

#### 1.1 — Text Alternatives (SC 1.1.1 · Level A)

```html
<!-- ❌ DON'T — image without alt -->
<img src="chart.png">
<img [src]="logoUrl">

<!-- ✅ DO — meaningful alt text -->
<img src="chart.png" alt="Monthly sales comparison bar chart">
<img [src]="logoUrl" alt="Company logo">

<!-- ✅ DO — decorative image with empty alt -->
<img src="divider.svg" alt="" role="presentation">
```

**Angular icon components:**

```html
<!-- ❌ DON'T — icon without accessible name -->
<s-icon name="close"></s-icon>

<!-- ✅ DO — icon with aria-label or sr-only text -->
<s-icon name="close" aria-label="Close dialog"></s-icon>
<button aria-label="Close"><s-icon name="close"></s-icon></button>
```

#### 1.3 — Info and Relationships (SC 1.3.1 · Level A)

```html
<!-- ❌ DON'T — visual-only headings -->
<div class="title">Section Title</div>

<!-- ✅ DO — semantic headings -->
<h2>Section Title</h2>

<!-- ❌ DON'T — skipped heading levels -->
<h1>Page Title</h1>
<h3>Subsection</h3>

<!-- ✅ DO — sequential heading levels -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

**Form relationships:**

```html
<!-- ❌ DON'T — input without label -->
<input type="text" placeholder="Name">

<!-- ✅ DO — explicit label association -->
<label for="name-input">Full name</label>
<input id="name-input" type="text">

<!-- ✅ DO — aria-labelledby for complex layouts -->
<span id="email-label">Email address</span>
<input type="email" aria-labelledby="email-label">
```

#### 1.4 — Distinguishable (SC 1.4.3, 1.4.11 · Level AA)

```css
/* ❌ DON'T — insufficient contrast */
color: #999999; /* on white background → ratio ~2.8:1 */

/* ✅ DO — meet minimum contrast ratios */
/* Normal text (< 18pt / < 14pt bold): ≥ 4.5:1 */
/* Large text (≥ 18pt / ≥ 14pt bold):  ≥ 3:1   */
/* UI components and graphical objects: ≥ 3:1   */
color: #595959; /* on white → ratio ~7:1 */
```

**Minimum contrast ratios (WCAG 2.2 Level AA):**

| Element | Ratio |
|---|---|
| Normal text (< 18pt or < 14pt bold) | ≥ 4.5:1 |
| Large text (≥ 18pt or ≥ 14pt bold) | ≥ 3:1 |
| UI components & graphical objects (SC 1.4.11) | ≥ 3:1 |

---

### Principle 2: Operable

UI components and navigation must be operable.

#### 2.1 — Keyboard Accessible (SC 2.1.1, 2.1.2 · Level A)

```html
<!-- ❌ DON'T — non-focusable interactive element -->
<div class="card" (click)="select()">Click me</div>

<!-- ✅ DO — use native button or add keyboard support -->
<button class="card" (click)="select()">Click me</button>

<!-- ✅ DO — if div is required, add role + tabindex + keydown -->
<div class="card"
     role="button"
     tabindex="0"
     (click)="select()"
     (keydown.enter)="select()"
     (keydown.space)="select()">
  Click me
</div>
```

**Keyboard trap prevention (SC 2.1.2):**

```typescript
// ✅ DO — trap focus inside modals, release on close
@HostListener('keydown', ['$event'])
handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    this.close();
    this.triggerElement.focus(); // return focus to trigger
  }
  if (event.key === 'Tab') {
    this.trapFocus(event); // cycle within modal
  }
}
```

#### 2.4 — Focus Visible (SC 2.4.7 · Level AA)

```css
/* ❌ DON'T — remove focus outline */
*:focus { outline: none; }
button:focus { outline: 0; }

/* ✅ DO — custom visible focus indicator */
button:focus-visible {
  outline: 2px solid var(--s-color-brand-primary);
  outline-offset: 2px;
}

/* ✅ DO — if overriding outline, provide alternative */
a:focus-visible {
  box-shadow: 0 0 0 3px var(--s-color-brand-primary);
  outline: none; /* OK because box-shadow is visible */
}
```

#### 2.5 — Target Size (SC 2.5.8 · Level AA)

```css
/* ❌ DON'T — tiny click targets */
.icon-btn { width: 16px; height: 16px; }

/* ✅ DO — minimum 24×24 CSS pixels */
.icon-btn {
  min-width: 24px;
  min-height: 24px;
  /* recommended: ≥ 44×44px for comfortable touch */
}
```

---

### Principle 3: Understandable

Information and operation of the UI must be understandable.

#### 3.1 — Language (SC 3.1.1 · Level A)

```html
<!-- ❌ DON'T — missing lang attribute -->
<html>

<!-- ✅ DO — declare page language -->
<html lang="es">
```

#### 3.2 — Predictable (SC 3.2.1, 3.2.2 · Level A)

```html
<!-- ❌ DON'T — auto-submit on focus -->
<select (focus)="submit()">

<!-- ❌ DON'T — navigate on change without warning -->
<select (change)="navigateTo($event)">

<!-- ✅ DO — user-initiated action -->
<select [(ngModel)]="selected">
  <option *ngFor="let opt of options" [value]="opt.value">{{opt.label}}</option>
</select>
<button (click)="applySelection()">Apply</button>
```

#### 3.3 — Input Assistance (SC 3.3.1, 3.3.2 · Level AA)

```html
<!-- ❌ DON'T — no error identification -->
<input type="email" class="error">

<!-- ✅ DO — identify errors with text + aria -->
<label for="email">Email</label>
<input id="email"
       type="email"
       [attr.aria-invalid]="emailInvalid"
       [attr.aria-describedby]="emailInvalid ? 'email-error' : null">
<div id="email-error" role="alert" *ngIf="emailInvalid">
  Please enter a valid email address.
</div>
```

---

### Principle 4: Robust

Content must be robust enough for assistive technologies.

#### 4.1 — Compatible (SC 4.1.2 · Level A)

```html
<!-- ❌ DON'T — custom widget without role/state -->
<div class="dropdown" (click)="toggle()">
  <span>Select option</span>
  <ul *ngIf="open">...</ul>
</div>

<!-- ✅ DO — ARIA roles, states, and properties -->
<div role="combobox"
     [attr.aria-expanded]="open"
     [attr.aria-haspopup]="'listbox'"
     [attr.aria-owns]="'dropdown-list'"
     (click)="toggle()"
     (keydown)="handleKey($event)">
  <span>{{ selectedLabel }}</span>
</div>
<ul id="dropdown-list"
    role="listbox"
    [attr.aria-label]="'Options'"
    *ngIf="open">
  <li *ngFor="let opt of options"
      role="option"
      [attr.aria-selected]="opt === selected"
      (click)="selectOption(opt)">
    {{ opt.label }}
  </li>
</ul>
```

**Common ARIA widget patterns:**

| Widget | Role | Key Attributes |
|---|---|---|
| Dropdown/Select | `combobox` + `listbox` | `aria-expanded`, `aria-haspopup`, `aria-selected` |
| Modal/Dialog | `dialog` | `aria-modal`, `aria-labelledby` |
| Tabs | `tablist` + `tab` + `tabpanel` | `aria-selected`, `aria-controls` |
| Accordion | `button` (header) | `aria-expanded`, `aria-controls` |
| Tooltip | `tooltip` | `aria-describedby` on trigger |
| Alert/Toast | `alert` or `status` | `aria-live="assertive"` or `"polite"` |
| Progress | `progressbar` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

---

## Decision Tree

```
Is it an <img>?                                → Needs alt attribute (1.1.1)
Is it a decorative image?                      → alt="" + role="presentation"
Is it an icon-only button?                     → Needs aria-label (1.1.1)

Is it an <input/select/textarea>?              → Needs <label> or aria-label (1.3.1)
Is it a form with validation?                  → Needs aria-invalid + error message (3.3.1)

Is it an interactive custom element?           → Needs role + tabindex="0" + keyboard events (2.1.1, 4.1.2)
Is it a clickable <div> or <span>?             → Use <button> or add role="button" (2.1.1)
Does it open a popup/modal?                    → Add aria-expanded + aria-haspopup (4.1.2)

Does the CSS remove :focus outline?            → Must have visible :focus-visible style (2.4.7)
Is the click target < 24×24 CSS px?            → Increase to ≥ 24px minimum (2.5.8)

Does <html> have a lang attribute?             → Required (3.1.1)
Are headings sequential (h1 → h2 → h3)?        → Required (1.3.1)

Does contrast meet minimum ratios?             → Normal text ≥ 4.5:1, large ≥ 3:1 (1.4.3)
Do UI components have ≥ 3:1 contrast?          → Borders, icons, focus indicators (1.4.11)
```

---

## Commands

```bash
# Run full accessibility audit — console output
bash skills/scannlab-a11y-checker/scripts/audit-a11y.sh

# Generate detailed Markdown report (a11y-audit-report.md)
bash skills/scannlab-a11y-checker/scripts/audit-a11y.sh --report

# JSON output for CI integration
bash skills/scannlab-a11y-checker/scripts/audit-a11y.sh --json

# Audit a single component directory
bash skills/scannlab-a11y-checker/scripts/audit-a11y.sh projects/scanntech-ui/src/components/button/

# Single component with report
bash skills/scannlab-a11y-checker/scripts/audit-a11y.sh --report projects/scanntech-ui/src/components/button/
```

---

## Resources

- **Audit script**: See [scripts/audit-a11y.sh](scripts/audit-a11y.sh) for the automated scanner.
- **WCAG checklist**: See [references/wcag-checklist.md](references/wcag-checklist.md) for the full Level A + AA checklist.
- **W3C WCAG 2.2**: https://www.w3.org/TR/WCAG22/
- **Quick Reference**: https://www.w3.org/WAI/WCAG22/quickref/
- **WAI-ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
