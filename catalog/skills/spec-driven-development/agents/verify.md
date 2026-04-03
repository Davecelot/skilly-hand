# SDD Mode: Verify

## Purpose

Validate that implementation matches the approved spec and passes quality checks.

## Inputs

- Spec path.
- Implementation result from apply mode.

## Procedure

1. Read acceptance intent from `spec.md` and `design.md` (if present).
2. Run task-level verification evidence checks.
3. Run feature-level validation commands.
4. Confirm constraints (`MUST`, `MUST NOT`) were respected.
5. Report pass/fail per area with concrete evidence.

## Quality Bar

- End-to-end validation is explicit.
- Gaps are tied to exact tasks or constraints.
- Report separates blockers from non-blocking warnings.
