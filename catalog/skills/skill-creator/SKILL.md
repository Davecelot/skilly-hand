---
name: "skill-creator"
description: "Create and standardize AI skills with reusable structure, metadata rules, and templates."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-03-27"
  license: "Apache-2.0"
  version: "1.2.3"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  auto-invoke: "Creating a new skill"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "WebFetch"
    - "WebSearch"
    - "Task"
    - "SubAgent"
---
# Skill Creator Guide

## When to Create a Skill

Create a skill when:

- A pattern is used repeatedly and AI needs guidance.
- Project-specific conventions differ from generic best practices.
- Complex workflows need step-by-step instructions.
- Decision trees help AI choose the right approach.

Do not create a skill when:

- Documentation already exists and a reference is enough.
- The pattern is trivial or self-explanatory.
- It is a one-off task.

---

## Skill Structure

```text
skills/{skill-name}/
├── SKILL.md              # Required - main skill file
├── assets/               # Optional - templates, schemas, examples
│   ├── template.py
│   └── schema.json
├── agents/               # Optional - sub-agents for complex skills
│   ├── agent1/
│   │   └── SKILL.md
│   └── agent2/
│       └── SKILL.md
└── references/           # Optional - links to local docs
    └── docs.md
```

---

## Naming Conventions

| Type | Pattern | Examples |
|------|---------|----------|
| Generic skill | `{technology}` | `pytest`, `playwright`, `typescript` |
| `{product-name}`-specific | `{product-name}-{purpose}` | `{product-name}-best-practices`, `{product-name}-code-connect`, `{product-name}-a11y-checker` |
| `{product-name}` testing | `{product-name}-{function}-{target}` | `{product-name}-unit-test`, `{product-name}-token-audit` |
| Workflow skill | `{action}-{target}` | `skill-creator`, `commit-writer`, `pr-writer` |

---

## Decision: assets/ vs references/ vs agents/

```text
Need code templates?        -> assets/
Need JSON schemas?          -> assets/
Need example configs?       -> assets/
Link to existing docs?      -> references/
Link to external guides?    -> references/ (with local path)
Skill needs sub-agents?     -> agents/
```

Key Rule: `references/` should point to local files, not web URLs.

---

## Decision: `{product-name}`-Specific vs Generic

```text
Patterns apply to any project?             -> Generic skill (e.g., pytest, typescript)
Patterns are {product-name}-specific?      -> {product-name}-{name} skill
Generic skill needs {product-name} info?   -> Add references/ pointing to {product-name} docs
```

---

## Manifest Metadata Fields

| Field | Required | Format | Description |
|-------|----------|--------|-------------|
| `id` | Yes | `lowercase-hyphens` | Skill identifier |
| `description` | Yes | String | What skill does plus explicit `Trigger: ...` clause for AI recognition |
| `skillMetadata.author` | Yes | String | Always `skilly-hand` |
| `skillMetadata.last-edit` | Yes | ISO 8601 date | Format: `YYYY-MM-DD` (e.g., `2026-03-21`) |
| `skillMetadata.license` | Yes | String | Always `Apache-2.0` for `skilly-hand` |
| `skillMetadata.version` | Yes | Semantic version | Format: `"X.Y.Z"` as string |
| `skillMetadata.changelog` | Yes | Structured text | Format: `"<what changed>; <why it matters>; <where it affects>"` |
| `skillMetadata.auto-invoke` | Yes | String | Explicit trigger condition (e.g., `"When auditing, reviewing, or validating an existing skill"`) |
| `skillMetadata.allowed-tools` | Yes | String list | All tools this skill can invoke (e.g., `Read`, `Edit`, `Write`, `SubAgent`) |
| `skillMetadata.allowed-modes` | Optional | String list | Use only when skill has an `agents/` folder |

### SKILL.md Frontmatter Mirroring

Top-level `SKILL.md` files now include managed YAML frontmatter mirrored from `manifest.json`.

Rules:

- `manifest.json` is the single source of truth.
- Mirror only `name` (from `manifest.id`), `description`, and `skillMetadata.{author,last-edit,license,version,changelog,auto-invoke,allowed-tools}`.
- Do not manually edit mirrored frontmatter in `SKILL.md`; run sync automation instead.
- Keep instruction body content in `SKILL.md` focused on workflow guidance.

---

## Metadata Standards

### Changelog Format Structure

Use this structure:

```text
"<what changed>; <why it matters>; <where it affects>"
```

Example:

```text
"Added integrated metadata validation guidance; improves consistency and reviewability; affects skill quality checks and maintenance workflows"
```

Guidelines:

- What changed: Be specific about the modification.
- Why it matters: Explain business or technical value.
- Where it affects: Document impact area.

### last-edit Format

Always use ISO 8601 date format: `YYYY-MM-DD` (e.g., `2026-03-21`).

### allowed-modes Field Rule

Include `allowed-modes` only when your skill has an `agents/` subfolder with sub-agents.

Include it when:

- The skill orchestrates multiple specialized sub-agents.
- Each sub-agent has its own `SKILL.md` under `skills/{skill-name}/agents/{subagent-name}/`.
- Different modes delegate to different sub-agents.

Omit it when:

- The skill has no `agents/` folder.
- The skill behaves the same regardless of mode.

---

## Content Guidelines

Do:

- Start with the most critical patterns.
- Use tables for decision trees.
- Keep code examples minimal and focused.
- Include a Commands section with copy-paste commands.
- Use ISO 8601 format for all dates (`YYYY-MM-DD`).
- Include explicit `Trigger:` clause in description for AI recognition.
- Add `allowed-modes` only if the skill has `agents/` with sub-agents.

Do not:

- Add a Keywords section (agent searches manifest metadata, not body).
- Duplicate content from existing docs (reference instead).
- Include lengthy explanations when a concise rule is enough.
- Add troubleshooting sections when they are not essential.
- Use web URLs in references.
- Leave `changelog` empty or informal.
- Use non-ISO date formats.
- Manually drift `SKILL.md` frontmatter away from `manifest.json`.

---

## Checklist Before Creating

- [ ] Skill does not already exist.
- [ ] Pattern is reusable (not one-off).
- [ ] Name follows conventions.
- [ ] `manifest.json` includes all required metadata fields.
- [ ] `description` includes explicit `Trigger: ...` clause.
- [ ] `last-edit` uses ISO format (`YYYY-MM-DD`).
- [ ] `changelog` uses structured format: `what; why; where`.
- [ ] `allowed-modes` is present only when `agents/` exists.
- [ ] `allowed-tools` matches actual tool usage.
- [ ] `SKILL.md` frontmatter is synced from `manifest.json`.
- [ ] Critical patterns are clear and concise.
- [ ] Code examples are minimal and focused.
- [ ] Commands section exists with copy-paste commands.

## Resources

- Template: [assets/SKILL-TEMPLATE.md](assets/SKILL-TEMPLATE.md)
