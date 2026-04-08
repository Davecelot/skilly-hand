# Spec-Driven Development Guide

## When to Use

Use this skill when:

- Work spans multiple commits or phases.
- Requirements are easy to misinterpret without written constraints.
- You need a repeatable plan that can be reviewed before coding.
- Several contributors or sessions may touch the same feature.

Do not use this skill for:

- Trivial one-file edits.
- Emergency fixes where immediate response matters more than process.
- Tasks with no meaningful verification path.

---

## Core Workflow

1. Define the spec in `.sdd/active/<feature-name>/spec.md`.
2. Review and refine scope, constraints, and tasks.
3. Execute one small task at a time.
4. Verify each task and the end-to-end outcome, ending with a required `review-rangers` final gate.
5. Archive to `.sdd/archive/` when complete.

Recommended task size:

- Up to 3 files per task.
- Around 30 minutes of implementation effort.
- Clear, concrete verify step.

---

## OpenSpec Complementary Support

Default execution SHOULD remain the local `.sdd` workflow.

Recur to OpenSpec support when the task needs complementary structure for:

- Multi-session continuity where planning context must persist across chats.
- Shareable planning artifacts for review before implementation.
- Requirement-delta clarity that benefits from explicit change proposals.

Routing rules:

- Keep the local `.sdd/active/<feature-name>/spec.md` as the execution source of truth unless the team explicitly standardizes on OpenSpec paths.
- If OpenSpec is unavailable, continue in `.sdd` and document assumptions directly in the active spec.

| Use local SDD only | Use OpenSpec support |
| --- | --- |
| Single-session or straightforward work with clear requirements | Work spans multiple sessions and needs persistent planning context |
| Existing `.sdd` artifacts already provide enough review clarity | Team needs proposal/design/tasks artifacts for async review |
| Requirement changes are small and easy to track in-place | Requirement deltas are complex and need explicit change framing |

Reference (informational): [https://openspec.dev/](https://openspec.dev/)

---

## Spec Structure

A practical spec includes:

- `Why`: problem and urgency.
- `What`: concrete deliverable.
- `Constraints`: `MUST`, `MUST NOT`, out-of-scope boundaries.
- `Current State`: relevant code context.
- `Tasks`: small implementation units with verify steps.
- `Validation`: full feature checks after all tasks.

For existing features with behavior changes, use a delta format (`ADDED`, `MODIFIED`, `REMOVED`) instead of rewriting everything.

---

## When to Use Delta vs Full Spec

| Use Full Spec | Use Delta Spec |
| --- | --- |
| New feature with no previous spec | Behavior change to an existing feature |
| Greenfield implementation | Bug fix or requirement adjustment |
| No requirement baseline exists | Existing requirements already exist |

## Archive Behavior

When archiving a delta spec, apply changes to the base specification:

- `ADDED`: append new requirements.
- `MODIFIED`: replace the previous requirement text.
- `REMOVED`: delete the requirement and keep a short reason in commit history.

Then move work from `.sdd/active/<feature-name>/` to `.sdd/archive/<feature-name>/`.

## Task Design Principles

- Keep task scope small: if a task touches more than 3 files or needs more than about 30 minutes, split it.
- Keep verification fast: each task should be verifiable in 2 minutes or less.
- Keep completion explicit: each task must have a one-sentence definition of done.

## Decision Tree: When to Break Tasks Smaller

```text
Does the task touch > 3 files?
  YES -> split it

Will the task take > 30 minutes?
  YES -> split it

Can the task be verified in <= 2 minutes?
  NO -> add a tighter verify step

Can "done" be described in one sentence?
  NO -> task is too vague; split it
```

## Common Mistakes to Avoid

### 1) Vague Constraints

```text
WRONG:
Must use best practices.

RIGHT:
MUST use existing auth middleware.
MUST NOT add new runtime dependencies.
```

### 2) Oversized Tasks

```text
WRONG:
T1: Build the whole authentication feature.

RIGHT:
T1: Add token verification middleware.
T2: Add login endpoint behavior.
T3: Add integration test for login flow.
```

### 3) Missing Verification

```text
WRONG:
Verify: It works.

RIGHT:
Verify: npm test -- src/auth/login.test.ts
```

### 4) Mixed Concerns in One Task

```text
WRONG:
T1: Create component and migrate all pages to it.

RIGHT:
T1: Create component.
T2: Migrate page A.
T3: Migrate page B.
```

Use the full preflight and pre-archive checks in [assets/validation-checklist.md](assets/validation-checklist.md).

---

## Modes

Use these mode guides for role-focused execution:

- Planning mode: [agents/plan.md](agents/plan.md)
- Implementation mode: [agents/apply.md](agents/apply.md)
- Verification mode: [agents/verify.md](agents/verify.md)
- Orchestrator mode: [agents/orchestrate.md](agents/orchestrate.md)

---

## Templates

- Feature spec: [assets/spec-template.md](assets/spec-template.md)
- Delta spec: [assets/delta-spec-template.md](assets/delta-spec-template.md)
- Design decisions: [assets/design-template.md](assets/design-template.md)
- Validation checklist: [assets/validation-checklist.md](assets/validation-checklist.md)

---

## Commands

```bash
mkdir -p .sdd/active/<feature-name>
cp .skilly-hand/catalog/spec-driven-development/assets/spec-template.md .sdd/active/<feature-name>/spec.md
cp .skilly-hand/catalog/spec-driven-development/assets/design-template.md .sdd/active/<feature-name>/design.md
```
