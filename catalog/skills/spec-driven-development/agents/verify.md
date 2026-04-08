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
5. Run a final structured `review-rangers` pass over the full change set.
6. Report pass/fail per area with concrete evidence.

### Required Final Gate (`review-rangers`)

- Validate selected agent targets vs actual instruction files/symlinks written.
- Validate stale managed target cleanup after re-install/reselection.
- Validate backup and restore safety (including uninstall restore behavior).
- Any unresolved `review-rangers` blocker keeps verification in failed state.

## Quality Bar

- End-to-end validation is explicit.
- Gaps are tied to exact tasks or constraints.
- Report separates blockers from non-blocking warnings.
