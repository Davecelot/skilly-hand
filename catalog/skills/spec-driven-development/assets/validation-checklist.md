# Spec Validation Checklist

Use this checklist before implementation and again before archive.

## Spec Quality

- [ ] Title is specific and unambiguous.
- [ ] `Why` explains urgency and value.
- [ ] `What` is concrete and testable.
- [ ] Constraints are enforceable (`Must`, `Must Not`, `Out of Scope`).
- [ ] `Current State` references real files or systems.

## Task Quality

- [ ] Tasks are small and scoped.
- [ ] Each task has `What`, `Files`, and `Verify`.
- [ ] Task verification can be completed quickly.
- [ ] No task mixes unrelated concerns.

## Implementation Readiness

- [ ] Success criteria are explicit.
- [ ] No critical ambiguity remains.
- [ ] Architecture decisions are captured in `design.md` if needed.

## Pre-Archive Verification

- [ ] All planned tasks are complete.
- [ ] Feature-level validation passes.
- [ ] Constraints were respected.
- [ ] Final `review-rangers` gate completed with no unresolved blockers.
- [ ] No unintended scope creep.
- [ ] Work is moved from `.sdd/active/` to `.sdd/archive/`.
