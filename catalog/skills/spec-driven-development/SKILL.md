---
name: "spec-driven-development"
description: "Plan, execute, and verify multi-step work through versioned specs with small, testable tasks. Trigger: planning or executing feature work, bug fixes, and multi-phase implementation."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-06-20"
  license: "Apache-2.0"
  version: "1.1.0"
  changelog: "Added a portable SDD lifecycle with capability-based routing, task evidence, change control, and archive invariants; prevents fixed tool dependencies and duplicated task state; affects planning, apply, verify, orchestrate, and spec templates"
  auto-invoke: "Planning or executing feature work, bug fixes, and multi-phase implementation"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "Task"
    - "SubAgent"
---
# Spec-Driven Development Guide

## When to Use

Use this skill when work spans multiple steps, requirements need written boundaries, or progress must survive across contributors or sessions.

Skip it for trivial edits, urgent recovery work, and tasks with no meaningful verification path.

## Portable Contract

The workflow MUST remain executable with this skill alone.

- Treat integrations as optional capabilities, never required product names.
- Discover available tools, commands, and repository conventions before selecting them.
- When a capability is unavailable, use a local structured fallback or record a blocker.
- Keep requirements, tasks, progress, evidence, and changes in `spec.md` as the single source of truth.
- Do not create a second task list that can drift from the spec.

## Lifecycle

```text
DRAFT -> APPROVED -> IN_PROGRESS -> VERIFYING -> COMPLETE -> ARCHIVED
             |             |            |
             +----------> BLOCKED <------+
```

Rules:

1. Planning creates or updates `.sdd/active/<work-name>/spec.md`.
2. Implementation begins after the approval policy is satisfied.
3. Only one task should normally be `IN_PROGRESS` at a time.
4. A task becomes `DONE` only after its verify step passes and evidence is recorded.
5. Changed requirements return affected tasks to planning before implementation continues.
6. Archive only after feature validation passes and no task remains open or blocked.

Valid task states: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Approval Policy

Use an explicit human checkpoint when the user requests one, requirements remain ambiguous, risk is material, or the next action is difficult to reverse. Otherwise, a documented self-review may satisfy approval.

Record the chosen approval policy in the spec. Do not assume every environment supports interactive checkpoints.

## Spec Structure

A practical spec contains:

- `Why`: problem and value.
- `What`: concrete, testable deliverable.
- `Constraints`: enforceable `MUST`, `SHOULD`, `MAY`, and `MUST NOT` statements.
- `Out of Scope`: explicit boundaries.
- `Current State`: verified context and integration points.
- `Approval Policy`: checkpoint or self-review rule.
- `Tasks`: small units with scenarios, capabilities, files, verify steps, and done definitions.
- `Progress`: task state and evidence.
- `Validation`: end-to-end checks.
- `Change Log`: requirement or scope changes that affect execution.

### Task Contract

Each task MUST define:

```markdown
### T1: Title

**What:** Observable outcome.
**Required Capabilities:** Semantic needs, or `none`.
**Files:** Expected scope, or `discover` when not yet known.
**Scenario:** GIVEN / WHEN / THEN, when behavior is involved.
**Verify:** Project-discovered command or concrete manual check.
**Done:** One sentence describing completion.
```

Capabilities describe needs such as test design, accessibility review, or security analysis. They MUST NOT require a particular skill, agent, vendor, or service. Resolve them against what is actually available at execution time.

## Full vs Delta Spec

Use a full spec for new work without an existing requirement baseline. Use a delta spec for changes to established behavior.

- `ADDED`: new requirement and scenarios.
- `MODIFIED`: complete replacement requirement plus previous behavior reference.
- `REMOVED`: removed requirement plus reason.

Before archiving a delta, reconcile it with the maintained requirement baseline when one exists. If no baseline exists, archive the delta as the historical record.

## Task Sizing

Prefer tasks that:

- Have one observable outcome.
- Touch a small, related file set.
- Can be completed without hidden dependencies.
- Have a fast, deterministic verify step.
- Have a one-sentence definition of done.

Split a task when its concerns, dependencies, or verification cannot be explained independently. File counts and time estimates are heuristics, not universal gates.

## Change Control

When requirements change during execution:

1. Stop the affected task at a stable point.
2. Record the change and reason in `Change Log`.
3. Update affected constraints, scenarios, tasks, and validation.
4. Mark invalidated evidence as superseded.
5. Reapply the approval policy before continuing.

Do not silently stretch a task to absorb new behavior.

## Verification and Review

Verification checks behavior against the spec, not against implementation intent.

- Run every task verify step using project-discovered commands.
- Check every `MUST` and `MUST NOT` constraint explicitly.
- Separate automated evidence, manual evidence, warnings, and blockers.
- Perform a final structured review using an available review capability or the fallback checklist in `agents/verify.md`.
- A missing optional integration is not a failure when the local fallback was completed.

## Archive Invariants

Archive to `.sdd/archive/<YYYY-MM-DD>-<work-name>/` only when:

- All tasks are `DONE`.
- Validation passes or approved manual checks are recorded.
- No blocker is unresolved.
- Constraint and final-review evidence is present.
- Delta reconciliation is complete when applicable.

Generate the ISO date from the current environment; do not assume a particular shell command or VCS.

## Modes

- Planning: [agents/plan.md](agents/plan.md)
- Implementation: [agents/apply.md](agents/apply.md)
- Verification: [agents/verify.md](agents/verify.md)
- Orchestration: [agents/orchestrate.md](agents/orchestrate.md)

## Templates

- Full spec: [assets/spec-template.md](assets/spec-template.md)
- Delta spec: [assets/delta-spec-template.md](assets/delta-spec-template.md)
- Design decisions: [assets/design-template.md](assets/design-template.md)
- Validation checklist: [assets/validation-checklist.md](assets/validation-checklist.md)
