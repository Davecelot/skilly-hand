# Portable TDD Cycle Examples

These examples use pseudocode so the cycle can be translated to the project's language, test runner, and conventions.

## Example 1: New Behavior

Behavior: normalize surrounding whitespace from a user-provided label.

### RED

```text
test "normalizes surrounding whitespace":
  result = normalize_label("  Ready  ")
  expect result equals "Ready"
```

Run the project's focused test command. Confirm it fails because normalization is missing, not because the test cannot load or compile.

### GREEN

```text
function normalize_label(value):
  return trim(value)
```

Run the focused test and relevant nearby tests. They pass.

### REFACTOR

No structural improvement is needed. Record `NOT_NEEDED`; REFACTOR is an opportunity, not a quota.

### Next Behavior Is a New Cycle

Rejecting an empty normalized label would be new observable behavior. Do not add it during REFACTOR. Write a failing empty-label test first.

## Example 2: Regression

Defect: a retry policy performs one extra attempt.

### RED

```text
test "stops after configured attempts":
  dependency = failing_fake()
  retry(dependency, attempts = 3)
  expect dependency call_count equals 3
```

Confirm the faulty baseline reports four calls. A load error or unrelated exception is not valid RED evidence.

### GREEN

Change only the attempt boundary. Confirm the regression test now reports three calls and nearby retry tests still pass.

### REFACTOR

Rename the internal loop counter if that improves clarity. Do not add backoff, logging, or a new error type without separate RED tests.

## Example 3: Test Already Passes

When a proposed RED test passes:

1. Run it against the unchanged baseline again.
2. Check whether the behavior already exists.
3. Check whether the assertion observes the intended public outcome.
4. Check whether setup bypasses the relevant code path.
5. Revise the scenario only when the requirement was misunderstood.

Do not intentionally break production code merely to manufacture a RED result.

## Evidence Template

```markdown
### TDD Evidence: [Behavior]

- Test level: [unit | integration | contract | end-to-end | characterization]
- Focused check: [project-discovered command or procedure]
- RED: `FAIL` - [expected failure reason]
- GREEN: `PASS` - [minimum behavior implemented]
- REFACTOR: `PASS` or `NOT_NEEDED` - [structural change only]
- Regression: `PASS`, `FAIL`, or `NOT_RUN` - [scope and reason]
- Notes: [test doubles, manual checks, or limitations]
```

## Cycle Checklist

### RED

- [ ] One observable behavior is defined.
- [ ] The test was added before production behavior changed.
- [ ] The test fails for the expected reason.

### GREEN

- [ ] The smallest required behavior was implemented.
- [ ] The focused test passes.
- [ ] Relevant regression checks pass or are honestly marked `NOT_RUN`.

### REFACTOR

- [ ] Structural changes preserve observable behavior.
- [ ] No untested feature or edge case was added.
- [ ] Tests remain green, or refactoring is recorded as `NOT_NEEDED`.
