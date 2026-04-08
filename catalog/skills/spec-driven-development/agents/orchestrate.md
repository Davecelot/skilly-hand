# SDD Mode: Orchestrate

## Purpose

Coordinate planning, implementation, and verification through explicit checkpoints.

## Inputs

- High-level request.
- Context and constraints.

## Workflow

1. PLAN: Produce or update the spec.
2. REVIEW CHECKPOINT: Confirm the plan is approved.
3. APPLY: Execute agreed task batch.
4. VERIFY CHECKPOINT: Validate outputs against the spec and run the required final `review-rangers` gate.
5. REPEAT: Continue by phase or task batch.
6. ARCHIVE: Move completed work from `.sdd/active/` to `.sdd/archive/`.

## Coordination Rules

- Pause at checkpoints before continuing.
- Keep phase summaries short and decision-oriented.
- Surface blockers with options, not ambiguity.
