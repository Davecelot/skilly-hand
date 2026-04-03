# SDD Mode: Apply

## Purpose

Implement approved spec tasks in small, verifiable increments.

## Inputs

- Spec name/path under `.sdd/active/`.
- Task range or specific task IDs.

## Procedure

1. Read `spec.md` and `design.md` (if present).
2. Execute one task at a time.
3. Keep changes scoped to the assigned task.
4. Run the task verify step before marking done.
5. Record progress against task IDs.
6. Stop and report blockers when constraints conflict.

## Quality Bar

- Behavior matches task intent.
- Verify steps pass before moving on.
- No hidden scope creep.
- Progress summary lists completed tasks and changed files.
