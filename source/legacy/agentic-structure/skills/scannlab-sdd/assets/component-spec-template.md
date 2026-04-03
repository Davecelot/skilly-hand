# [Component Name] Component

## Why

[1-2 sentences: Why we need this component now. What problem does it solve for the Design System?]

Example:
> Scanntech dashboard needs a consistent, accessible button component for all actions across 30+ pages. Currently mixing Bootstrap + custom styles leads to inconsistency and accessibility issues.

## What

[Concrete deliverable. Specific enough to verify when done.]

Example:
> Reusable Angular standalone button component with variants (primary, secondary, tertiary, danger), sizes (sm, md, lg), and states (default, hover, active, disabled, loading). Must be fully keyboard accessible and use design tokens only.

## Constraints

### Must

- Use Angular 20.3+ with signals and standalone components
- Follow `scannlab-best-practices` conventions
- Follow `css-modules` conventions
- All colors/sizes/spacing use design tokens (no hard-coded values)
- WCAG 2.2 AA accessibility compliance
- CSS Modules only (no Tailwind, no other global styles)
- 90%+ unit test coverage

### Must Not

- Bootstrap or other CSS framework dependencies
- Custom CSS outside CSS Modules
- Hard-coded colors, sizes, or spacing values
- HTML or Figma as source code (Angular component only)

### Out of Scope

- Dropdown menu behavior
- Tooltip integration
- Form validation (buttons don't validate, forms do)
- Custom icon rendering (buttons accept icon slots only)

## Current State

### Figma Source

- Link: [Figma file/component URL]
- Component name in Figma: [e.g., "Button/Default"]
- Variants defined: [e.g., "size: sm/md/lg, state: default/hover/active/disabled"]

### Existing ScannLab Patterns

- Design tokens location: `projects/scanntech-ui/src/tokens/`
- Component structure examples: `projects/scanntech-ui/src/components/`
- CSS Module pattern: See `projects/scanntech-ui/src/components/*/[name].module.css`
- Test setup: `projects/scanntech-ui/src/components/*/[name].component.test.ts`

### Related Components

- [List any related components that might depend on this one]

## Design System Requirements

### Tokens to Use

- Link to token spec or reference: [e.g., "Button colors use color-tokens defined in figma.config.json"]
- Sizes: [e.g., "sm (12px), md (14px), lg (16px) from spacing tokens"]
- Spacing: [e.g., "Padding uses 8px grid system"]

### Variants

[List all component variants from Figma]

| Variant | Values | Usage |
|---------|--------|-------|
| Type | primary, secondary, tertiary, danger | Determines color and visual hierarchy |
| Size | sm, md, lg | Controls padding and font-size |
| State | default, hover, active, disabled, loading | Visual feedback |

### Accessibility Requirements

- [ ] Keyboard navigation: Tab to focus, Enter/Space to activate
- [ ] Focus indicators clearly visible
- [ ] ARIA labels describe button purpose
- [ ] Disabled state announced to screen readers
- [ ] Loading state uses aria-busy
- [ ] High contrast ratio (WCAG AA)

## Tasks

### T1: Create component shell

**What:** Generate component structure, @Input signals, basic template

**Files:** `src/components/button/button.component.ts`

**Verify:** `npm test -- button.component.test.ts`

---

### T2: Implement CSS Module styles

**What:** Create all variants, sizes, states using design tokens

**Files:** `src/components/button/button.module.css`

**Verify:** `npm run build` (no errors)

---

### T3: Add accessibility

**What:** Keyboard nav, focus management, ARIA attributes

**Files:** `src/components/button/button.component.ts`

**Verify:** `npm test -- button.component.test.ts`

---

### T4: Create Storybook stories

**What:** Document all variants, sizes, states in interactive stories

**Files:** `src/components/button/button.stories.ts`

**Verify:** Storybook loads without errors: `npm run storybook`

---

### T5: Unit tests

**What:** Comprehensive Vitest coverage for @Inputs, @Outputs, events

**Files:** `src/components/button/button.component.test.ts`

**Verify:** `npm test -- button.component.test.ts` (90%+ coverage, all pass)

---

### T6: Token validation

**What:** Verify all color/size/spacing values use design tokens

**Files:** `src/components/button/button.module.css`

**Verify:** `scannlab-token-validation` (phase 2: css-auditor) reports full compliance

---

### T7: Accessibility audit

**What:** Validate keyboard navigation, focus, ARIA, screen reader support

**Files:** (No new files; audit existing component)

**Verify:** `scannlab-a11y-checker` reports no issues

---

### T8: Code Connect mapping

**What:** Create Figma → Code mapping for Dev Mode and component browser

**Files:** `src/components/button/button.figma.ts`

**Verify:** Manual review in Figma Dev Mode, component renders correctly

---

## Validation

### Automated

- All tests pass: `npm test`
- Storybook loads all variants: `npm run storybook`
- Build succeeds: `npm run build`
- No TypeScript errors: `npm run type-check`
- No ESLint errors: `npm run lint`
- `scannlab-a11y-checker` passes
- `scannlab-token-validation` phase 2 passes

### Manual

- [ ] Visual comparison: All Storybook stories match Figma
- [ ] Keyboard navigation: Tab focus visible on all states
- [ ] Screen reader: Button purpose reads correctly (aria-label or text content)
- [ ] Hover state: Changes style appropriately
- [ ] Disabled state: Visually and functionally disabled (not keyboard-focusable)
- [ ] Loading state: Shows spinner/loading indicator
- [ ] No hard-coded colors in CSS (all use tokens)

---

## Figma-to-Code Checklist

Use this checklist to ensure design-code alignment:

- [ ] Component extracted using `scannlab-figma-extractor`
- [ ] Design tokens mapped using `scannlab-token-validation` (phase 1: figma-matcher)
- [ ] All font sizes match Figma → design tokens
- [ ] All colors match Figma → design tokens
- [ ] All spacing/padding match Figma → design tokens
- [ ] All corner radius matches Figma
- [ ] Hover state visuals documented in Figma
- [ ] Disabled state visuals documented in Figma
- [ ] Focus indicator style documented (design + code)
- [ ] Code Connect mapping created via `scannlab-code-connect`
