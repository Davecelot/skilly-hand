---
name: {agent-name}
description: >
  {What this agent does and when Claude should delegate to it}.
  Use proactively when {specific trigger condition}.
model: inherit
tools: {Tool1, Tool2, Tool3}
# Optional fields — add only what you need:
# disallowedTools: {ToolToBlock}
# skills:
#   - {skill-name}
# permissionMode: default
# maxTurns: 20
# background: false
# effort: medium
# isolation: worktree
# initialPrompt: "{Auto-submitted first turn text}"
metadata:
  author: scannlab-design-system
  last-edit: {YYYY-MM-DD}
  version: "1.0.0"
  changelog: "Initial release; {why it matters}; {where it affects}"
---

# {Agent Name} Agent

You are a {role description — one sentence stating what this agent specializes in}.

## When to Use

**Use this agent when:**

- {Condition 1}.
- {Condition 2}.
- {Condition 3}.

**Do NOT use this agent for:**

- {Exclusion 1}.
- {Exclusion 2}.

---

## Workflow

### Step 1 — {First action}

{Description of what to do and why.}

```bash
{copy-paste command}
```

### Step 2 — {Second action}

{Description of what to do and why.}

```bash
{copy-paste command}
```

### Step 3 — {Verify / Report}

{What to verify and how to report results.}

```bash
{copy-paste command}
```

---

## Rules

| Rule | Details |
|------|---------|
| **{Rule 1}** | {Constraint detail} |
| **{Rule 2}** | {Constraint detail} |
| **{Rule 3}** | {Constraint detail} |

---

## Context

| {Column A} | {Column B} | {Column C} |
|------------|------------|------------|
| {value}    | {value}    | {value}    |

---

## Related Skills

| Skill | Role in this workflow |
|-------|-----------------------|
| `{skill-name}` | {How this skill is used by the agent} |
