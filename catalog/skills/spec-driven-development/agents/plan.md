# SDD Mode: Plan

## Purpose

Turn a request into an executable spec without assuming a framework, toolchain, or external service.

## Procedure

1. Inspect the repository for applicable instructions, conventions, commands, and existing behavior.
2. Clarify only missing information that cannot be discovered safely.
3. Choose a full or delta spec.
4. Define scope, constraints, non-goals, approval policy, and validation.
5. Create tasks using the task contract from the parent skill.
6. Add behavioral scenarios where outcomes can be observed.
7. Describe required capabilities semantically and use `none` when no special capability is needed.
8. Initialize one progress row per task with `TODO`.
9. Self-review with the validation checklist and apply the approval policy.

## Quality Bar

- Another implementer can execute without guessing intent.
- No task requires a named agent, skill, vendor, framework, or command that has not been discovered locally.
- Tasks, progress rows, and validation are mutually consistent.
- Risks and meaningful alternatives live in `design.md`; routine choices stay in the spec.
- `spec.md` is the only task source of truth.

## Blockers

Mark planning `BLOCKED` only when a required decision or fact cannot be discovered and a reasonable assumption would create material risk. Record the missing input and its impact.
