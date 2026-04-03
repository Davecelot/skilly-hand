---
name: claude-agent-creator
description: >
  Creates Claude sub-agent files (.md) inside .claude/agents/ following the official Claude sub-agent spec,
  including all supported frontmatter fields, metadata tracking, and structured body conventions for this repo.
  Trigger: When creating a new Claude sub-agent or adding a specialized agent to .claude/agents/.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.1"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Creating an agent for Claude"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, Task
---

# Claude Agent Creator Guide

## When to Use

**Use this skill when:**

- Creating a new Claude sub-agent file in `.claude/agents/`.
- Adding a specialized automated agent to the Claude agent ecosystem.
- Reviewing or auditing an existing agent file for compliance.

**Don't use this skill for:**

- Creating AI guidance skills (use `skill-creator` instead).
- General Angular, testing, or styling tasks.
- One-off scripts or utilities not tied to Claude's agent system.

---

## Critical Patterns

### Pattern 1: File Location and Naming

All Claude sub-agents live in `.claude/agents/` as markdown files:

```
.claude/agents/
└── {agent-name}.md     # One file per agent, lowercase-hyphens
```

**Naming rule**: Use `{domain}-{action}` or `{action}-{target}` — mirror the skill naming convention.

| Pattern | Example |
|---------|---------|
| `{domain}-{action}` | `convention-sync`, `figma-extractor` |
| `{action}-{target}` | `code-reviewer`, `commit-writer` |

### Pattern 2: Frontmatter Fields

All supported Claude sub-agent frontmatter fields:

| Field | Required | Values / Format | Notes |
|-------|----------|-----------------|-------|
| `name` | **Yes** | `lowercase-hyphens` | Must be unique across `.claude/agents/` |
| `description` | **Yes** | Free text | Claude uses this to decide when to delegate; be explicit and specific |
| `tools` | No | Comma-separated tool names | Limit to what the agent actually needs; inherits all if omitted |
| `disallowedTools` | No | Comma-separated tool names | Denies tools from the inherited or specified set |
| `model` | No | `sonnet`, `opus`, `haiku`, full model ID, or `inherit` | Defaults to `inherit`; use `token-optimizer` to select tier |
| `skills` | No | YAML list of skill names | Preloads skills into the agent context at startup |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` | Controls tool approval behavior |
| `maxTurns` | No | Integer | Maximum agentic turns before stopping |
| `mcpServers` | No | YAML list | MCP servers available to this agent |
| `hooks` | No | YAML map | Lifecycle hooks scoped to this agent (`PreToolUse`, `PostToolUse`, `Stop`) |
| `memory` | No | `user`, `project`, `local` | Persistent memory scope |
| `background` | No | `true` / `false` | Run agent as a background task (default: `false`) |
| `effort` | No | `low`, `medium`, `high`, `max` | Overrides session effort level |
| `isolation` | No | `worktree` | Runs in a temporary git worktree with isolated repo copy |
| `initialPrompt` | No | Free text | Auto-submitted as the first user turn when agent starts |
| `metadata` | No | YAML block | Repo-local tracking: `author`, `last-edit`, `version`, `changelog` |

### Pattern 3: Metadata Tracking Block

Every agent in this repo **must** include a `metadata:` block for change tracking, mirroring the skill frontmatter standard:

```yaml
metadata:
  author: scannlab-design-system
  last-edit: YYYY-MM-DD       # ISO 8601 — update on every edit
  version: "X.Y.Z"            # Semantic version as string; start at 1.0.0
  changelog: "What changed; why it matters; where it affects"
```

**Changelog format:** `"<what changed>; <why it matters>; <where it affects>"`

### Pattern 4: Body Structure

The markdown body becomes the agent's system prompt. Always use this 6-section structure:

```
1. Role declaration     — one sentence: who/what this agent is
2. When to Use          — inclusion and exclusion criteria
3. Workflow             — numbered steps with copy-paste bash commands
4. Rules                — table of hard constraints (never/always)
5. Context table        — key reference data the agent needs at runtime
6. Related Skills       — which skills this agent depends on or chains with
```

---

## Decision Tree

```
Creating guidance for AI on a repeated pattern?   → skill-creator (not this skill)
Creating an automated Claude agent?               → Use this skill
Agent has distinct phases or delegated sub-tasks? → Add skills: field with relevant skills
Agent touches sensitive permissions?              → Set permissionMode explicitly
Agent needs isolated repo copy?                   → Set isolation: worktree
Agent runs fire-and-forget?                       → Set background: true
```

---

## Agent Template

Use the template at [assets/AGENT-TEMPLATE.md](assets/AGENT-TEMPLATE.md) as your starting point.

Minimal required frontmatter:

```yaml
---
name: {agent-name}
description: >
  {What this agent does and when Claude should delegate to it}.
model: inherit
tools: {Tool1, Tool2, Tool3}
metadata:
  author: scannlab-design-system
  last-edit: {YYYY-MM-DD}
  version: "1.0.0"
  changelog: "Initial release; {why it matters}; {where it affects}"
---
```

Full frontmatter (add only fields you need):

```yaml
---
name: {agent-name}
description: >
  {What this agent does}. Use proactively when {trigger condition}.
model: inherit
tools: {Tool1, Tool2, Tool3}
disallowedTools: {ToolToBlock}
skills:
  - {skill-name}
permissionMode: default
maxTurns: 20
background: false
effort: medium
metadata:
  author: scannlab-design-system
  last-edit: {YYYY-MM-DD}
  version: "1.0.0"
  changelog: "Initial release; {why it matters}; {where it affects}"
---
```

---

## Checklist Before Creating

- [ ] Agent doesn't already exist — check `.claude/agents/`.
- [ ] Name follows `{domain}-{action}` or `{action}-{target}` convention.
- [ ] `name` and `description` are present (only two required fields).
- [ ] `model: inherit` is set (or justified deviation via `token-optimizer`).
- [ ] `tools` list is minimal — only what the agent actually uses.
- [ ] `skills` list includes upstream skills the agent depends on.
- [ ] `metadata` block is complete: `author`, `last-edit` (ISO 8601), `version`, `changelog`.
- [ ] Body follows the 6-section structure (role → when to use → workflow → rules → context → related skills).
- [ ] Workflow section has numbered steps with copy-paste commands.
- [ ] Rules section uses a table format.
- [ ] No web URLs in the body — reference local files only.

---

## Commands

```bash
# List existing agents
ls .claude/agents/

# Verify agent frontmatter is valid YAML
python3 -c "import yaml, sys; yaml.safe_load(open('.claude/agents/{agent-name}.md').read().split('---')[1])"

# Open template
cat skills/claude-agent-creator/assets/AGENT-TEMPLATE.md
```

---

## Resources

- **Template**: [assets/AGENT-TEMPLATE.md](assets/AGENT-TEMPLATE.md) — starting point for new agents
- **Example**: [.claude/agents/convention-sync.md](../../.claude/agents/convention-sync.md) — reference implementation
- **Skill Creator**: [../skill-creator/SKILL.md](../skill-creator/SKILL.md) — parallel skill for guidance files
- **Token Optimizer**: [../token-optimizer/SKILL.md](../token-optimizer/SKILL.md) — for selecting the right `model` tier
- **Agents Sync**: [../agents-sync/SKILL.md](../agents-sync/SKILL.md) — for syncing AGENTS.md after registering
