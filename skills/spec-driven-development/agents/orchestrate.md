# SDD Mode: Orchestrate

## Purpose

Coordinate planning, implementation, verification, and archive while remaining usable without delegation or external integrations.

## Workflow

1. PLAN: create or update the active spec.
2. APPROVE: apply the spec's checkpoint or self-review policy.
3. APPLY: execute one ready task at a time.
4. VERIFY TASK: require evidence before selecting the next task.
5. REPLAN: return changed requirements or blocked dependencies to planning.
6. VERIFY FEATURE: run validation and the portable final review gate.
7. ARCHIVE: enforce archive invariants and move the completed work once.

## Capability Resolution

- Delegate a phase only when a suitable capability is available and delegation improves the outcome.
- Otherwise execute the corresponding local mode directly.
- Never invent resource names, identifiers, issue keys, commands, or service availability.
- Remote writes, commits, and comments require their own discovered workflow and user authorization.

## Checkpoint Policy

Pause for explicit user approval when required by the spec, risk, ambiguity, or an irreversible action. For low-risk autonomous work, record a self-review decision and continue.

## Coordination Rules

- Keep `spec.md` authoritative.
- Keep at most one task `IN_PROGRESS` unless independence is explicit.
- Do not advance past failed verification.
- Surface blockers with evidence and the smallest decision needed.
- Do not declare completion while open tasks or unresolved blockers remain.
