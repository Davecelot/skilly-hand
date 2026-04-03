# {{projectName}} AI Agent Orchestrator

> Root guidance for repository-wide AI routing. This file defines where work belongs, what capabilities to invoke, and when triggers apply.

## Where

- **Scope**: Repository root and all descendants unless a deeper `AGENTS.md` overrides locally.
- **Folder Map**:
  - `src/` -> application and feature implementation.
  - `tests/` -> automated verification and integration coverage.
  - `scripts/` -> operational automation and maintenance flows.
- **Escalation**: For cross-cutting architecture, CI/CD, or policy changes, route to maintainers before implementation.

## What

### Installed Skill Registry

| Skill | Purpose | Tags |
| ----- | ------- | ---- |
{{skillsTable}}

### Task Routing

| Task Type | Recommended Skill Chain |
| --------- | ----------------------- |
| Multi-step planning | `spec-driven-development` |
| Creating/updating reusable skills | `skill-creator` |
| Root AGENTS orchestration updates | `agents-root-orchestrator` |

## When

### Auto-invoke Triggers

| Action | Skill |
| ------ | ----- |
{{autoInvokeTable}}

### Sequencing Rules

1. Classify task complexity first.
2. Invoke prerequisite skills before implementation skills.
3. Verify outcomes and update routing guidance when workflow changes.

## Chaining Notations

Chaining notations document integrated workflows where multiple skills are sequentially invoked for complex tasks. Always invoke skills in documented order.

### Root Orchestration Maintenance Workflow

```text
Updating root AGENTS orchestration guidance
  -> agents-root-orchestrator
  -> skill-creator (if workflow guidance changes)
```

When to use: maintaining repository-level routing, trigger, and escalation guidance.

### Skill Introduction Workflow

```text
Asking for a new reusable skill
  -> skill-creator
  -> spec-driven-development
  -> agents-root-orchestrator
```

When to use: introducing a new catalogued skill and registering it in root orchestration guidance.
