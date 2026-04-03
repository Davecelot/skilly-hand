# AGENTS Root Orchestrator Guide

## When to Use

Use this skill when:

- Creating a new root `AGENTS.md` for a repository.
- Refactoring root AI instructions that have grown inconsistent.
- Converting scattered guidance into a single routing guide.
- Defining explicit trigger-based skill invocation behavior.

Do not use this skill for:

- Subfolder-only guides that inherit from parent AGENTS files.
- One-off prompt notes with no reusable routing value.
- Agent-specific mirror files (`CLAUDE.md`, `GEMINI.md`) as primary source.

---

## Core Structure: Where / What / When

### Where (Context and Boundaries)

Define where the guide applies and where to escalate:

- Repository scope and ownership boundaries.
- Folder map and key domains.
- Escalation path when a task exceeds local scope.

### What (Capabilities and Routing)

Define what AI should use:

- Installed skill registry with concise purpose.
- Role-oriented routing tables (task -> skill chain).
- Non-negotiable rules and default conventions.

### When (Triggers and Sequencing)

Define when skills must be invoked:

- Auto-invoke trigger table by action.
- Ordered workflow chains for recurring tasks.
- Prerequisite rules so downstream skills are never invoked first.

### Chaining Notations (Workflow Composition)

Define integrated multi-skill chains using explicit notation:

- Use `->` to document prerequisite order.
- Keep each chain named and scoped to one repeated workflow.
- Add a one-line "when to use" note after each chain.
- Treat earlier steps as mandatory unless explicitly marked optional.

---

## Decision Tree

```text
Is this the repository-wide instruction entry point?
  YES -> Create/update root AGENTS.md with Where/What/When
  NO  -> Use subfolder AGENTS conventions and inherit parent rules

Does the task require routing across multiple skill types?
  YES -> Add Task -> Skill chain table in What
  NO  -> Keep concise capability list and direct triggers

Are trigger conditions currently implicit or ambiguous?
  YES -> Add explicit action-based trigger rows in When
  NO  -> Keep existing triggers but normalize wording
```

---

## Example Outline

### Example 1: Where Section

```markdown
## Where

- Scope: repository root and all descendant folders unless overridden.
- Primary map: app code in `src/`, automation in `scripts/`, tests in `tests/`.
- Escalate to maintainers when task changes CI, security, or release flows.
```

### Example 2: When Section

```markdown
## When

| Action | Skill |
| ------ | ----- |
| Planning multi-step feature work | `spec-driven-development` |
| Creating new reusable skill instructions | `skill-creator` |
| Updating root AGENTS orchestration map | `agents-root-orchestrator` |
```

### Example 3: Chaining Notations Section

````markdown
## Chaining Notations

Chaining notations document integrated workflows where multiple skills are sequentially invoked for complex tasks. Always invoke skills in documented order.

### Skill Creation Workflow

```text
Asking for a new skill
  -> skill-creator
  -> spec-driven-development
  -> agents-root-orchestrator
```

When to use: creating and registering a new reusable skill workflow.
````

---

## Commands

```bash
mkdir -p .skilly-hand/catalog/agents-root-orchestrator/assets
cp .skilly-hand/catalog/agents-root-orchestrator/assets/AGENTS-ROOT-TEMPLATE.md AGENTS.md
npx skilly-hand install --dry-run
```

---

## Resources

- Template: [assets/AGENTS-ROOT-TEMPLATE.md](assets/AGENTS-ROOT-TEMPLATE.md)
- Companion skills:
  - [../skill-creator/SKILL.md](../skill-creator/SKILL.md)
  - [../spec-driven-development/SKILL.md](../spec-driven-development/SKILL.md)
