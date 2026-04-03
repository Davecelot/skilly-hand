---
name: {skill-name}
description: >
  {Brief description of what this skill enables}.
  Trigger: {When the AI should load this skill - explicit trigger condition}.
metadata:
  author: scannlab-design-system
  last-edit: {YYYY-MM-DD}
  license: Apache-2.0
  version: "1.0.0"
  changelog: "{<what changed>; <why it matters>; <where it affects>}"
  scope: [{scope}]  # Use Scope Guidelines in skill-creator/SKILL.md to choose: root, ui, storybook, docs, scripts, or combinations
  auto-invoke: "{Complete with a brief and specific phrase if the skill needs auto-invoke}"
allowed-tools: {tool1, tool2, tool3}  # Examples: Read, Edit, Write, Bash, Grep, SubAgent, Task, WebFetch (list only tools this skill uses)
# IMPORTANT: Only include 'allowed-modes' if your skill has an agents/ folder with sub-agents.
# If you don't have agents/, delete the lines below.
allowed-modes:
  - {mode-name}     # {Description of when this mode is used}
---

# {Name of the Skill} Guide

## When to Use

**Use this skill when:**

- {Condition 1}.
- {Condition 2}.
- {Condition 3}.

**Don't use this skill for:**

- {Condition 1}.
- {Condition 2}.
- {Condition 3}.

---

## Critical Patterns

{The MOST important rules - what AI MUST follow}

### Pattern 1: {Name}

```{language}
{code example}
```

### Pattern 2: {Name}

```{language}
{code example}
```

---

## Decision Tree

```markdown
{Question 1}? → {Action A}
{Question 2}? → {Action B}
Otherwise     → {Default action}
```

---

## Code Examples

### Example 1: {Description}

```{language}
{minimal, focused example}
```

### Example 2: {Description}

```{language}
{minimal, focused example}
```

---

## Commands

```bash
{command 1} # {description}
{command 2} # {description}
{command 3} # {description}
```

---

## Resources

- **Templates**: See [assets/](assets/) for {description of templates}.
- **Documentation**: See [references/](references/) for local developer guide links.
