---
name: "test-driven-development"
description: "Guide implementation through evidence-based RED, GREEN, and REFACTOR cycles without assuming a language, framework, or test runner. Trigger: implementing testable behavior or reproducing a regression with tests first."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-06-20"
  license: "Apache-2.0"
  version: "1.1.0"
  changelog: "Rebuilt TDD guidance around portable cycle evidence, expected RED failures, behavior-preserving refactors, and project-discovered test conventions; prevents framework assumptions and untested behavior during refactor; affects core workflow, examples, and verification guidance"
  auto-invoke: "Implementing testable behavior or reproducing a regression with tests first"
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

Use TDD when desired behavior can be expressed before implementation, when fixing a reproducible regression, or when changing logic that benefits from a tight feedback loop.

Do not force TDD onto exploratory spikes, generated artifacts, environment-only setup, or behavior that cannot be observed reliably. Time-box exploration, discard or isolate spike code, then begin TDD once an interface is understood.

## Portable Contract

- Discover the project's language, test runner, commands, naming, and file placement before writing tests.
- Prefer existing project conventions over examples in this skill.
- Do not require a framework, package manager, assertion library, coverage tool, or external service.
- If no runnable test harness exists, record the blocker or establish the smallest project-appropriate harness as separately approved work.

## The Cycle

### 1. Understand

Define one observable behavior and choose the lowest test level that can prove it without hiding important integration risk.

### 2. RED

Write a test before production behavior changes, then run it.

A valid RED requires:

- The new or changed test fails.
- The failure is caused by the missing or incorrect target behavior.
- The failure message or observation is understood.
- Unrelated failures are separated from the cycle.

If the test already passes, do not weaken it or write implementation blindly. Determine whether the behavior already exists, the assertion observes the wrong thing, or the test setup bypasses the relevant path.

### 3. GREEN

Implement the smallest behavior that makes the RED test pass. Run the focused test, then the smallest relevant regression set.

Do not add speculative validation, configuration, interfaces, or error cases that the current behavior does not require.

### 4. REFACTOR

Improve structure while preserving observable behavior. Keep tests green after each meaningful change.

Allowed examples include renaming, removing duplication, simplifying control flow, or extracting an internal helper. Adding a new output, error case, persistence rule, side effect, or public option is not refactoring; start another RED cycle for it.

### 5. Record Evidence

Capture enough evidence to reproduce the cycle:

```text
Behavior: <one observable outcome>
RED: <command/check> -> FAIL because <expected reason>
GREEN: <command/check> -> PASS
REFACTOR: <command/check> -> PASS | NOT_NEEDED
Regression: <relevant suite/check> -> PASS | NOT_RUN with reason
```

## Test Scope Selection

| Need | Prefer |
| --- | --- |
| Pure logic or narrow rule | Unit test |
| Collaboration between local modules | Integration test |
| Boundary with a stable external contract | Contract test or boundary integration test |
| User-visible workflow across the system | End-to-end test |
| Existing behavior with unclear intent | Characterization test before change |

Use the lowest level that proves the behavior, but do not mock away the boundary where the defect or risk lives. A task may need more than one level when risks differ.

## Test Design Rules

- One behavioral reason to fail per test. Multiple assertions are acceptable when they describe one outcome.
- Use the project's preferred structure, such as Given/When/Then or Arrange/Act/Assert.
- Assert observable results rather than private implementation details.
- Keep setup focused and make test data reveal intent.
- Test meaningful boundaries and error behavior, not every syntactic branch.
- A regression test must fail on the faulty baseline and pass after the fix.

## Test Doubles

Use fakes, stubs, spies, or mocks only when they make the test faster, deterministic, or able to isolate an owned boundary.

- Prefer simple state-based assertions over interaction assertions.
- Verify interactions when the interaction itself is the contract.
- Do not mock the unit under test.
- Avoid reproducing complex third-party behavior in hand-written mocks.
- Keep at least one integration check when a mocked boundary carries material compatibility risk.

## Async and Determinism

- Prefer controllable clocks, schedulers, events, and in-memory boundaries over real delays or network calls.
- Await observable completion; do not let assertions run after the test finishes.
- Remove order dependence and shared mutable state.
- Treat flaky tests as defects. Diagnose timing, isolation, and lifecycle issues instead of adding blind retries.

## Coverage

Coverage shows what executed, not whether behavior was specified well.

- Respect thresholds already configured by the project.
- Use uncovered critical behavior to guide new scenarios.
- Do not invent a universal percentage.
- Never add low-value assertions solely to increase a metric.

## Bug-Fix Cycle

1. Reproduce the defect at the lowest useful level.
2. Confirm the test fails for the reported reason.
3. Apply the smallest correction.
4. Confirm the regression test and relevant existing tests pass.
5. Refactor only after the correction is protected.

## Decision Tree

```text
Can the behavior be observed reliably?
  NO  -> clarify the interface or isolate exploration first
  YES -> choose the lowest useful test level

Does the new test fail for the expected reason?
  NO, it passes          -> inspect baseline, assertion, and setup
  NO, unrelated failure  -> fix or isolate the test environment
  YES                    -> implement minimum GREEN behavior

Did implementation add behavior not demanded by the test?
  YES -> remove it or start a new RED cycle
  NO  -> run relevant regression checks, then refactor if useful
```

## Resources

- Portable cycle examples and evidence template: [assets/tdd-cycle.md](assets/tdd-cycle.md)
- Multi-step delivery workflow: [../spec-driven-development/SKILL.md](../spec-driven-development/SKILL.md)
