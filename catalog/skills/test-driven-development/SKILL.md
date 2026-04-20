---
name: "test-driven-development"
description: "Guide implementation using the RED → GREEN → REFACTOR TDD cycle: write a failing test first, write the minimum code to pass, then refactor while tests stay green."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-04-04"
  license: "Apache-2.0"
  version: "1.0.0"
  changelog: "Initial TDD skill ported from legacy scannlab-sdd tdd-templates; enables RED→GREEN→REFACTOR workflow across any stack; affects catalog skill coverage for test-first development"
  auto-invoke: "Implementing features, services, or components using test-driven development (TDD) or RED→GREEN→REFACTOR cycles"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
---
# Test-Driven Development Guide

## When to Use

Use this skill when:

- Implementing a new feature, service, component, or function from scratch.
- Adding behavior to existing code where the expected outcome can be defined upfront.
- Debugging a regression by writing a failing test that reproduces the bug first.
- Reviewing or pair-programming on code where test-first discipline is required.

Do not use this skill for:

- Exploratory prototyping where requirements are entirely undefined.
- Snapshot or visual regression tests driven by existing UI.
- Infrastructure or environment setup with no testable behavior.

---

## Critical Patterns

### Pattern 1: RED First, Always

Write a failing test before writing any implementation code. This proves:

- The test is meaningful (not passing by accident).
- The feature is actually needed.
- You understand the requirements before touching implementation.

Never write implementation code without a failing test that demands it.

### Pattern 2: Minimum Code to GREEN

Write the **smallest possible code** to make the test pass:

- No extra features beyond what the test requires.
- No premature optimization or defensive handling.
- No "while I'm here, let me add…" additions.

The goal is to satisfy the test, nothing more.

### Pattern 3: REFACTOR With Tests GREEN

Only improve code structure **after** all tests pass:

- Extract constants, improve naming, simplify logic.
- Tests must stay green throughout every refactoring step.
- If a refactor breaks a test, revert — the refactor was wrong.

### Pattern 4: One Scenario Per Test

Each test must validate exactly one behavior:

- Use explicit GIVEN / WHEN / THEN structure in test bodies.
- A test name should complete the sentence: *"it should ___"*.
- If a test asserts two behaviors, split it into two tests.

---

## Decision Tree

```text
Starting a new feature or function?          -> Write failing test first (RED)
Test is failing as expected?                 -> Write minimum code to pass (GREEN)
Test is passing?                             -> Improve code structure without changing behavior (REFACTOR)
Refactor broke a test?                       -> Revert — refactor introduced a behavior change
Test is already passing before writing code? -> Test is not meaningful; redesign it
Fixing a bug?                                -> Write failing test that reproduces the bug first
```

---

## Code Examples

### Example 1: GIVEN / WHEN / THEN Structure

```typescript
it('should return the sum of two numbers', () => {
  // GIVEN: Two positive integers
  const a = 3;
  const b = 4;

  // WHEN: Sum is computed
  const result = add(a, b);

  // THEN: Result equals their sum
  expect(result).toBe(7);
});
```

### Example 2: RED — Write Failing Test First

```typescript
// calculator.test.ts
import { divide } from './calculator';

it('should throw when dividing by zero', () => {
  // GIVEN / WHEN / THEN
  expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
});
```

Run the test — it **must** fail before writing any implementation.

### Example 3: GREEN — Write Minimum Implementation

```typescript
// calculator.ts
export function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Cannot divide by zero');
  return a / b;
}
```

Run the test — it should now pass. No additional logic yet.

### Example 4: REFACTOR — Improve Without Changing Behavior

```typescript
// calculator.ts (refactored)
const DIVIDE_BY_ZERO_MESSAGE = 'Cannot divide by zero';

export function divide(numerator: number, denominator: number): number {
  if (denominator === 0) throw new Error(DIVIDE_BY_ZERO_MESSAGE);
  return numerator / denominator;
}
```

Run the test — it must still pass after renaming and extracting the constant.

---

## Commands

```bash
# Run a single test file
npm test -- {test-file}

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Type check without emitting
npx tsc --noEmit

# Lint check
npm run lint

# Full verify (tests + lint + type check + build)
npm test && npm run lint && npx tsc --noEmit && npm run build
```

---

## Resources

- Full cycle examples with Angular: [assets/tdd-cycle.md](assets/tdd-cycle.md)
