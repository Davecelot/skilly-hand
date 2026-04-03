---
name: scannlab-playwright
description: >
  End-to-end visual regression and behavior testing for ScannLab Design System
  Angular components using Playwright against Storybook. Covers screenshot
  baseline creation, keyboard navigation, hover/focus/disabled state testing,
  and interactive agentic QA via Playwright MCP in Claude Code. Complements
  Vitest unit tests with real-browser validation.
  Trigger: When creating, updating, or running Playwright visual or behavior
  tests for ScannLab Angular components, or doing interactive QA via Playwright MCP.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "When creating, updating, or running Playwright visual or behavior tests for Angular components, or doing interactive component QA via Playwright MCP"
allowed-tools: Read, Edit, Write, Grep, Bash, Task
---

## When to Use

- Creating visual regression baselines for a component (`.visual.spec.ts`)
- Testing browser-level behavior Vitest cannot cover: hover states, keyboard navigation, focus rings, disabled states, modal focus traps, state transitions
- Running interactive agentic QA via Playwright MCP (Claude navigates Storybook, takes screenshots, asserts accessibility tree)
- Verifying no visual regressions after token value changes
- Validating component behavior across story variants

## When NOT to Use

- Logic/unit testing → use `scannlab-unit-test` (Vitest)
- A11y auditing as primary method → use `scannlab-a11y-checker` first; Playwright supplements it
- Testing Angular signal/reactive logic → use `scannlab-unit-test`

## Prerequisites

- Storybook must be running: `npm run storybook` (port 6006)
- `@playwright/test` already in `devDependencies`
- Playwright browsers installed: `npm run playwright:install` (first-time only)

---

## Critical Patterns

### 1. Story URL Construction

All tests navigate to Storybook iframe URLs. Use the `gotoStory()` helper — it navigates and waits for Angular rendering to settle before assertions:

```typescript
import { gotoStory } from '../../helpers/storybook';

// Basic navigation
await gotoStory(page, 'components-button--playground');

// With args overrides (test variants without separate stories)
await gotoStory(page, 'components-button--playground', { variant: 'danger', level: 'outlined' });
```

Story ID convention: title `Components/Button` + name `Playground` → `components-button--playground`

### 2. Test File Naming

```
playwright/tests/[component]/
├── [component].visual.spec.ts     # toHaveScreenshot() baselines
└── [component].behavior.spec.ts  # click, keyboard, attribute assertions
```

One folder per component. Story IDs as constants at the top of each file.

### 3. Visual Regression Workflow

```bash
# First run — generates PNG baselines in playwright/snapshots/ (commit these)
npm run test:e2e:update-snapshots

# Subsequent runs — compares against committed baselines
npm run test:e2e

# After intentional token/design change — regenerate baselines
npm run test:e2e:update-snapshots
```

Baselines live in `playwright/snapshots/` — always commit them to git. They are the source of truth.

### 4. Behavior Test Structure (mirrors Given-When-Then from Vitest)

```typescript
test.describe('Button — Behavior', () => {
  test('receives focus on Tab key', async ({ page }) => {
    // Given
    await gotoStory(page, STORY_ID);
    // When
    await page.keyboard.press('Tab');
    // Then
    await expect(page.locator('[sButton]')).toBeFocused();
  });
});
```

### 5. Playwright MCP — Interactive QA in Claude Code

When Storybook is running (`npm run storybook`), ask Claude directly:

- "Navigate to the Button Playground story and take a screenshot"
- "Check if the Modal correctly traps focus when opened"
- "Take an accessibility snapshot of the Tabs component"
- "Click the second tab and verify the panel content switches"

Claude uses MCP tools: `browser_navigate`, `browser_screenshot`, `browser_click`, `browser_keyboard`, `browser_snapshot`

MCP config is in `.claude/mcp.json` — the `playwright` server entry is already configured.

### 6. Attribute Assertions for Angular Host Bindings

ScannLab components expose variant/state via `data-*` attributes on the host element:

```typescript
await expect(page.locator('[sButton]')).toHaveAttribute('data-variant', 'danger');
await expect(page.locator('[sButton]')).toHaveAttribute('data-level', 'outlined');
await expect(page.locator('[sButton]')).toHaveAttribute('data-size', 'sm');
```

### 7. Focus Trap Testing (modals, dialogs)

Use the `expectFocusTrap()` helper from `playwright/helpers/a11y.ts`:

```typescript
import { expectFocusTrap } from '../../helpers/a11y';

await page.locator('button[sButton]').first().click();
const dialog = page.locator('[role="dialog"]');
await expect(dialog).toBeVisible();
await expectFocusTrap(page, dialog, 4); // Tab 4 times, focus must stay inside
```

---

## Decision Tree

```
Testing visual appearance?              → .visual.spec.ts + toHaveScreenshot()
Testing keyboard / Tab focus?           → .behavior.spec.ts + keyboard.press('Tab')
Testing state transitions (click)?      → .behavior.spec.ts + click + toHaveAttribute()
Testing modal/overlay behavior?         → .behavior.spec.ts + expectFocusTrap()
Doing ad-hoc QA in Claude Code IDE?     → Playwright MCP (Storybook must be running)
Token values changed, check visuals?    → npm run test:e2e:update-snapshots
```

---

## Commands

```bash
# Run all Playwright tests (Storybook auto-starts if not already running)
npm run test:e2e

# Interactive Playwright UI — step-through debugging
npm run test:e2e:ui

# Run with visible browser — good for initial debugging
npm run test:e2e:headed

# Regenerate all screenshot baselines
npm run test:e2e:update-snapshots

# Open HTML test report after a run
npm run test:e2e:report

# Run tests for a single component
npx playwright test playwright/tests/button/ --config=playwright/playwright.config.ts

# Update snapshots for a single component
npx playwright test playwright/tests/button/ --config=playwright/playwright.config.ts --update-snapshots

# Install Playwright browsers (first-time setup)
npm run playwright:install
```

---

## Resources

- Config: [playwright/playwright.config.ts](../../playwright/playwright.config.ts)
- Story helper: [playwright/helpers/storybook.ts](../../playwright/helpers/storybook.ts)
- A11y helper: [playwright/helpers/a11y.ts](../../playwright/helpers/a11y.ts)
- Snapshot baselines: `playwright/snapshots/` (git-committed)
- MCP config: [.claude/mcp.json](../../.claude/mcp.json) (`playwright` server entry)
- Storybook: `http://localhost:6006`
- Tests: `playwright/tests/[component]/`

---

## Relationship to Other Skills

| Skill | Relationship |
| ----- | ------------ |
| `scannlab-unit-test` | Complementary — unit tests cover Angular logic; Playwright covers real browser rendering + interaction |
| `scannlab-a11y-checker` | Supplementary — WCAG audit first, then Playwright for keyboard/focus/ARIA validation in browser |
| `scannlab-token-validation` | Sequential — run after CSS token audit to verify the visual result is correct |
| `scannlab-figma-extractor` | Upstream — Figma specs inform what visual states need baseline coverage |

Position in Figma Component QA chain: after `scannlab-token-validation (phase 2: css-auditor)` — final visual and behavior gate before marking a component complete.
