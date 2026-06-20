# SDD Mode: Apply

## Purpose

Implement approved tasks one at a time and keep the spec synchronized with execution evidence.

## Procedure

1. Read `spec.md`, relevant design decisions, and repository instructions.
2. Confirm the approval policy is satisfied and dependencies are `DONE`.
3. Resolve required capabilities from available local skills, tools, or structured self-review.
4. Mark the selected task `IN_PROGRESS`.
5. Implement only the assigned outcome.
6. When the task declares test-driven work, follow the available TDD guidance or the portable RED/GREEN/REFACTOR contract described in the task.
7. Run the task verify step using commands discovered from the project.
8. Record concise evidence: command or check, result, and relevant output summary.
9. Mark the task `DONE` only after verification passes; otherwise mark it `BLOCKED` with the cause.
10. Append a change-log entry only for requirement, scope, or design changes, not routine progress.

## Scope Change Rule

If implementation reveals new behavior, conflicting constraints, or a wider blast radius, stop the affected task and return it to planning. Do not silently add work or rewrite acceptance criteria to match the implementation.

## Evidence Contract

Evidence must be reproducible and proportionate:

```text
Check: <command or manual procedure>
Result: PASS | FAIL | NOT_RUN
Summary: <short factual result>
```

Do not claim a command ran when it did not. Record unavailable or human-only checks explicitly.

## Quality Bar

- Changes remain inside task scope.
- Verification evidence supports the `DONE` state.
- Optional integrations have a documented local fallback.
- No automatic commit, issue update, or remote action is assumed.
