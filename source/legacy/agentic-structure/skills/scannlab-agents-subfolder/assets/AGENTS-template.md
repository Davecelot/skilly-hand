# {Folder Name} - AI Agent Ruleset

> **IMPORTANT:** This file only adds local rules for `{folder/path/}`. All {library/repository}-wide patterns are inherited from parent AGENTS.md files. Do **not** repeat skill tables or global conventions here — reference parent files for full skill lists and cross-project rules.
>
> **Inheritance:** [{Parent} AGENTS.md]({relative path to parent AGENTS.md})
>
> **Scope**: `{folder/path/}` — {one-line description of what this folder owns}
> **Tech Stack**: {technologies used in this folder}
> **Primary Skills**: {2-3 key skills}
> **When to escalate to {parent} AGENTS.md**: {scenario}
> **Author**: ScannLab Design System Team
> **Last updated**: {DD.MM.YYYY}

## Inherits From

- [{Parent} AGENTS.md]({relative path}) — {one-line description of what the parent owns}
- [{Root} AGENTS.md]({relative path}) — {repository-wide patterns, full skill registry}

---

## Mandatory Reading

**BEFORE starting ANY task in {folder name}**, read these skills in order:

| Skill | Purpose |
| ----- | ------- |
| [`token-optimizer`]({relative path}/skills/token-optimizer/SKILL.md) | **Required for all AI/model interactions.** Classifies task complexity and optimizes token usage. |
| [`{skill-1}`]({relative path}/skills/{skill-1}/SKILL.md) | {Purpose specific to this folder} |

---

<!--
  ORCHESTRATOR ROLE — Include this section if this AGENTS.md is a Library Lead or Component Director.
  Omit for simple leaf-node folders with no routing responsibility.

  Library Lead: add a Domain Map + Task → Skill Routing Table.
  Component Director: add only a Task → Skill Routing Table.
-->

## Orchestrator Role

This AGENTS.md is the **{entry point / library-level dispatcher / component director}** for all work inside `{folder}/`. When receiving a task in this folder:

1. **Classify** the task using `token-optimizer`
2. **Route** to the correct skill chain using the table below
3. **Invoke skills in order** — earlier skills are prerequisites for later ones
4. **Never skip steps** — each gate ensures quality before the next phase

<!-- Library Lead only: add a Domain Map above the routing table -->
<!--
### Domain Map

| Domain | Folder | Child Director |
| ------ | ------ | -------------- |
| {domain} | `{folder/}` | [{folder}/AGENTS.md]({relative path}) |
| {domain} | `{folder/}` | — (route to `{skill}`) |
-->

### Task → Skill Routing Table

| Task | Skill Chain (in order) |
| ---- | ---------------------- |
| {task description} | `{skill-1}` → `{skill-2}` → `{skill-3}` |
| {task description} | `{skill-1}` → `{skill-2}` |

---

## Available Skills ({Folder} Scope)

### Core Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `{skill-name}` | {description} | [SKILL.md]({relative path}/skills/{skill-name}/SKILL.md) |

### Supporting Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `{skill-name}` | {description} | [SKILL.md]({relative path}/skills/{skill-name}/SKILL.md) |

---

## Auto-invoke Skills

When performing these actions IN THIS FOLDER, **invoke the skill FIRST before proceeding**:

| Action | Skill | Notes |
| ------ | ----- | ----- |
| {action in this folder's context} | `{skill-name}` | {notes} |

---

## Critical Rules ({Folder Name} Only)

For {shared patterns}, see [{Parent} AGENTS.md]({relative path}). The rules below are unique to this folder.

### {Category 1}

- **ALWAYS**: {rule}
- **NEVER**: {rule}

### {Category 2}

- **ALWAYS**: {rule}
- **NEVER**: {rule}

---

## {Folder-Specific Workflow}

Standard orchestration for {task type} in this folder. Each phase must complete before the next begins.

### Phase 1: {Phase Name}

1. {step}
2. {step}

### Phase 2: {Phase Name}

1. {step}
2. {step}

---

## Troubleshooting & Escalation

| Scenario | Action |
| -------- | ------ |
| {scenario} | {action} |
| Pattern applies beyond this folder | Escalate to [{Parent} AGENTS.md]({relative path}) |

---

## Commands

```bash
# {Command description}
{command}

# {Command description}
{command}
```
