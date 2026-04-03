---
name: css-modules
description: >
  Conventions for writing scoped CSS using CSS Modules, including pure CSS principles and attribute selectors.
  Trigger: When writing or updating styles or component CSS.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Writing or updating component styles"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# CSS Modules Guide

## When to Use

**Use this skill when:**

- Writing or updating `.css` files for Angular components in `projects/scanntech-ui`.
- Styling specific component variants or states.

**Don't use this skill for:**

- Global structural setup (e.g., `index.html` or baseline resets).
- SCSS/SASS/Less codebases (ScannLab does not use preprocessors).

---

## Critical Patterns

ScannLab uses native Pure CSS, leaning heavily into nested CSS capabilities (`&`) and strict reliance on design system custom properties (tokens) to ensure visual consistency.

### Pattern 1: Pure CSS with Native Nesting

Do not attempt to use SASS syntax like mixins or variable loops. Since modern browsers support CSS nesting, we use standard `&` selectors for encapsulation. Component styles should be fully scoped inside the `:host` block.

```css
:host {
  display: inline-flex;
  align-items: center;

  /* Use & to nest variants or states safely within the host */
  &:hover {
    cursor: pointer;
  }
}
```

### Pattern 2: Design Tokens (Strict Enforcement)

Never hardcode `HEX`, `RGB`, or explicit pixels (e.g., `16px`) unless strictly necessary for math or structural `1px` borders. ALWAYS use CSS custom properties prefixed with `--s-`.

```css
:host {
  /* GOOD: Using tokens */
  border-radius: var(--s-radius-md);
  color: var(--s-color-body-primary-inverse);
  padding: var(--s-spacing-3xs) var(--s-spacing-2xs);

  /* BAD: Hardcoded values */
  /* border-radius: 8px; */
  /* color: #FFFFFF; */
  /* padding: 4px 8px; */
}
```

### Pattern 3: Attribute Selectors for Variants and Levels

Do not use BEM syntax. We avoid chaining class variants like `.button--primary`. Instead, bind state dynamically to HTML attributes via Angular host bindings and target them with CSS attribute selectors for clean states.

```css
:host {
  /* Variant matching */
  &[data-variant='primary'] {
    color: var(--s-color-buttons-primary-default);
  }
  
  /* Complex Variant + Level matching */
  &[data-variant='primary'][data-level='filled'] {
    background-color: var(--s-color-buttons-primary-default);

    &:hover {
      background-color: var(--s-color-buttons-primary-hovered);
    }
    &:disabled,
    &[aria-disabled='true'] {
      background-color: var(--s-color-disabled);
    }
  }
  
  /* Sizing Matching */
  &[data-size='sm'] {
    height: 36px; /* Specific exception sizes */
  }
}
```

---

## Decision Tree

```markdown
Styling a state?           → Use standard pseudo-classes (`&:hover`, `&:active`, `&:focus`).
Styling a variant?         → Map to Angular host attributes and use `&[data-variant='x']`.
Setting a color/spacing?   → Use `var(--s-color-*)` or `var(--s-spacing-*)`.
Disabled state?            → Target both `&:disabled` AND `&[aria-disabled='true']` explicitly.
```

---

## Code Examples

### Example 1: Standard Component Structure
```css
:host {
  align-items: center;
  column-gap: var(--s-spacing-3xs);
  display: inline-flex;
  
  /* Base state */
  font-weight: var(--s-font-weight-semibold, 600);
  background-color: transparent;
  border: none;

  &[data-variant='danger'][data-level='filled'] {
    color: var(--s-color-body-primary-inverse);
    background-color: var(--s-color-buttons-danger-surface-default);

    &:hover {
      background-color: var(--s-color-buttons-danger-surface-hovered);
    }

    &:focus {
      outline: var(--s-border-width-lg) solid var(--s-color-focused);
    }
  }
}
```

---

## References

- **scannlab-token-audit**: Use this skill when actively refactoring old hardcoded values to modern tokens.
- **scannlab-best-practices**: General style standards for the repo.
