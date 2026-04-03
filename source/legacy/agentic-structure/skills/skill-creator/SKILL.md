---
name: skill-creator
description: >
  Creates new AI agent skills following the Agent Skills spec.
  Trigger: When user asks to create a new skill, add agent instructions, or document patterns for AI.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.2.3"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Creating a new skill"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task, SubAgent
---

# Skill Creator Guide

## When to Create a Skill

**Create a skill when:**

- A pattern is used repeatedly and AI needs guidance.
- Project-specific conventions differ from generic best practices.
- Complex workflows need step-by-step instructions.
- Decision trees help AI choose the right approach.

**Don't create a skill when:**

- Documentation already exists (create a reference instead).
- Pattern is trivial or self-explanatory.
- It's a one-off task.

---

## Skill Structure

```
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
    └── docs.md           # Points to docs/developer-guide/*.mdx
```

**Note**: Use `agents/` subfolder when a skill requires integrated sub-agents to perform distinct tasks. Document each sub-agent with its own SKILL.md file.

---

## Naming Conventions

| Type | Pattern | Examples |
|------|---------|----------|
| Generic skill | `{technology}` | `pytest`, `playwright`, `typescript` |
| ScannLab-specific | `scannlab-{purpose}` | `scannlab-best-practices`, `scannlab-code-connect`, `scannlab-a11y-checker`, `scannlab-figma-token-matcher` |
| ScannLab testing | `scannlab-{function}-{target}` | `scannlab-unit-test`, `scannlab-token-audit` |
| Workflow skill | `{action}-{target}` | `skill-creator`, `commit-writer`, `pr-writer` |

---

## Decision: assets/ vs references/ vs agents/

```
Need code templates?        → assets/
Need JSON schemas?          → assets/
Need example configs?       → assets/
Link to existing docs?      → references/
Link to external guides?    → references/ (with local path)
Skill needs sub-agents?     → agents/
```

**Key Rule**: `references/` should point to LOCAL files (`docs/developer-guide/*.mdx`), not web URLs.

**agents/ Folder Rule**: Use `agents/` only when the skill orchestrates multiple specialized sub-agents. Each sub-agent should be independent and have its own SKILL.md.

---

## Decision: Scannlab-Specific vs Generic

```
Patterns apply to ANY project?      → Generic skill (e.g., pytest, typescript)
Patterns are Scannlab-specific?     → scannlab-{name} skill
Generic skill needs Scannlab info?  → Add references/ pointing to Scannlab docs
```

---

## Scope Guidelines

The `scope` field defines which project folder(s) this skill applies to. This is **mandatory** for AI model clarity and skill discovery.

### Project Structure Reference

ScannLab Design System monorepo structure (from AGENTS.md):

| Component | Location | Purpose | Scope Tag |
|-----------|----------|---------|-----------|
| **UI Library** | `projects/scanntech-ui/` | Core component library with 30+ production-ready components | `ui` |
| **Components** | `projects/scanntech-ui/src/components/` | Individual UI components (alert, button, modal, datagrid, etc.) | `ui` |
| **Component Docs** | `projects/scanntech-ui/src/docs/` | Component API documentation and guidelines | `ui` |
| **Storybook** | `.storybook/` + root config | Interactive component development environment | `storybook` |
| **Documentation** | `docs/` | Project-level docs (best practices, testing, Storybook guidance) | `docs` |
| **Scripts** | `scripts/` | Automation and utility scripts | `scripts` |
| **Skills** | `skills/` | AI agent skills and workflow documentation (20+ skills) | `root` |
| **AI Config** | `.claude/`, `.gemini/`, `.github/copilot-instructions.md` + root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | Agent configuration and instructions for different AI models | `root` |
| **Build Config** | Root level (angular.json, tsconfig.json, vitest.config.ts, etc.) | Monorepo build and test configuration | `root` |
| **Docker** | `Dockerfile`, `nginx.conf` | Container configuration for deployment | `root` |

### Scope Values Explained

| Scope | Usage | When to Use | Examples |
|-------|-------|-----------|----------|
| `root` | Repository-level concerns affecting multiple components or the entire build | Skills for project-wide workflows, setup, CI/CD, conventions that apply everywhere | `commit-writer`, `pr-writer`, `skill-creator`, `agents-sync`, `skill-sync` |
| `ui` | UI component library (primarily `projects/scanntech-ui/`) | Skills for Angular component development, testing, styling, accessibility of UI components | `scannlab-best-practices`, `scannlab-unit-test`, `scannlab-a11y-checker`, `scannlab-code-connect`, `scannlab-figma-token-matcher`, `scannlab-token-audit` |
| `storybook` | Storybook documentation and story creation | Skills for writing/updating `.stories.ts` files and Storybook configuration | `scannlab-storybook` |
| `docs` | Documentation directory (`docs/`) | Skills for writing documentation, guides, MDX content | *(reserved for future documentation skills)* |
| `scripts` | Build scripts, automation, Node.js tooling | Skills for writing/updating scripts in `scripts/` folder | *(reserved for future scripting skills)* |

### Scope Decision Tree

```
Does the skill apply to MULTIPLE project areas (root config, CI/CD, monorepo setup)?
  YES → scope: [root]
  NO  → Continue

Does the skill target UI components in projects/scanntech-ui/?
  YES → scope: [ui]
  NO  → Continue

Does the skill target Storybook stories (.stories.ts files)?
  YES → scope: [storybook]
  NO  → Continue

Does the skill target documentation (docs/ folder)?
  YES → scope: [docs]
  NO  → Continue

Does the skill target scripts or build tooling (scripts/ folder)?
  YES → scope: [scripts]
  NO  → This skill may be too generic or unfocused. Reconsider.
```

### Scope Examples

**✅ Correct Usage:**

- `scannlab-best-practices`: `scope: [ui]` — applies to Angular component code in projects/scanntech-ui/
- `commit-writer`: `scope: [root]` — applies across entire repo for commit conventions
- `scannlab-storybook`: `scope: [storybook]` — applies to .stories.ts file creation
- `angular-20`: `scope: [root]` — generic Angular patterns applicable anywhere

**❌ Incorrect Usage:**

- `scannlab-best-practices` as `scope: [root]` ❌ (too broad; it's UI-specific)
- `scannlab-storybook` as `scope: [ui]` ❌ (applies to stories, not general UI components)

### Multi-Scope Skills

Some rare skills may apply to multiple scopes:

```yaml
scope: [root, ui]  # Example: A skill for both repo-wide and UI-specific concerns
```

Use multi-scope **only** if your skill genuinely applies to multiple distinct areas. Otherwise, keep single scope for clarity.

---

## Frontmatter Fields

| Field | Required | Format | Description |
|-------|----------|--------|-------------|
| `name` | Yes | `lowercase-hyphens` | Skill identifier |
| `description` | Yes | Block with trigger | What skill does + explicit "Trigger: ..." clause for AI recognition |
| `metadata.author` | Yes | String | Always `scannlab-design-system` |
| `metadata.last-edit` | Yes | ISO 8601 date | Format: `YYYY-MM-DD` (e.g., `2026-03-21`). Auto-updated via metadata-updater script |
| `metadata.license` | Yes | String | Always `Apache-2.0` for ScannLab |
| `metadata.version` | Yes | Semantic version | Format: `"X.Y.Z"` as string. Auto-increments patch when skill is modified |
| `metadata.changelog` | Yes | Structured text | Format: `"<what changed>; <why it matters>; <where it affects>"` Example: `"Added integrated metadata auto-update system; helps enforce metadata freshness; affects skill validation and pre-commit workflows"` |
| `metadata.scope` | Yes | Array | Project scope(s): `[root]`, `[ui]`, `[storybook]`, `[docs]`, `[scripts]`, or combinations like `[root, ui]`. **Required**: See **Scope Guidelines** section above for decision tree and examples. |
| `metadata.auto-invoke` | Yes | String | Explicit trigger condition (e.g., `"When auditing, reviewing, or validating an existing skill"`) |
| `allowed-tools` | Yes | Comma-separated | All tools this skill can invoke (e.g., `Read, Edit, Write, SubAgent`) |
| `allowed-modes` | Optional | YAML list | Skill-specific invocation modes with descriptions. **Only use if your skill has an `agents/` folder.** Omit otherwise. Use list format with comments: `- mode-name  # Description` |
---

## Metadata Standards

### Changelog Format Structure

Follow this structured format for changelog entries:

```
"<what changed>; <why it matters>; <where it affects>"
```

**Example:**
```
"Added integrated metadata auto-update system; helps enforce metadata freshness and prevents outdated docs; affects skill validation workflows, pre-commit hooks, and CI/CD skill synchronization"
```

**Guidelines:**
- **What changed**: Be specific about the modification (e.g., "Added field X", "Refactored section Y", "Enhanced pattern Z")
- **Why it matters**: Explain business or technical value (e.g., "improves clarity", "reduces errors", "enables automation")
- **Where it affects**: Document impact scope (e.g., "affects validation", "impacts workflow X", "changes agent behavior")

### last-edit Format

Always use ISO 8601 date format: `YYYY-MM-DD` (e.g., `2026-03-21`)

**Auto-update Process:**
When you modify a SKILL.md file, run the metadata updater before committing:

```bash
node skills/skill-test/scripts/skill-metadata-updater.js skills/{your-skill-name}
```

This automatically:
1. **Increments version patch** (e.g., `1.0.0` → `1.0.1`)
2. **Updates last-edit** to current date
3. **Prompts for new changelog entry** (interactive)

### Metadata Freshness Validation

Skills are validated to ensure metadata matches file state:
- Structural checks via `skill-lint.js` catch metadata drift
- Pre-commit hooks can enforce metadata updates
- `skill-test:semantic` mode reviews changelog quality

### allowed-modes Field Rule

**CRITICAL**: The `allowed-modes` field should **ONLY** be included when your skill has an `agents/` subfolder containing inner subagents.

**When to include `allowed-modes`:**
- Your skill orchestrates multiple specialized sub-agents
- Each sub-agent has its own `SKILL.md` file in `skills/{skill-name}/agents/{subagent-name}/`
- Different modes delegate to different subagents (e.g., `structural`, `metadata-update`, `semantic` in skill-test)

**When to omit `allowed-modes`:**
- Your skill has no `agents/` folder
- Your skill works the same way regardless of invocation mode
- Only `SKILL.md`, `assets/`, and `references/` folders exist

**Example**: `skill-test` has `agents/` with sub-agents, so it includes `allowed-modes`. `skill-creator` has no `agents/`, so it should NOT have `allowed-modes`.

---

## Content Guidelines

### DO
- Start with the most critical patterns.
- Use tables for decision trees.
- Keep code examples minimal and focused.
- Include Commands section with copy-paste commands.
- Use ISO 8601 format for all dates (`YYYY-MM-DD`).
- Include explicit "Trigger:" clause in description for AI recognition.
- Update metadata after every meaningful edit (use `skill-metadata-updater.js`).
- Add `allowed-modes` field if skill is mode-specific.

### DON'T
- Add Keywords section (agent searches frontmatter, not body).
- Duplicate content from existing docs (reference instead).
- Include lengthy explanations (link to docs).
- Add troubleshooting sections (keep focused).
- Use web URLs in references (use local paths).
- Leave `changelog` field empty or use informal descriptions.
- Use date format other than ISO 8601 (`YYYY-MM-DD`).

---

## Registering the Skill

After creating the skill:

1. **Validate structure** using skill-test:
   ```bash
   node skills/skill-test/scripts/skill-lint.js skills/{your-skill-name}
   ```

2. **Add to AGENTS.md**:
   ```markdown
   | `{skill-name}` | {description} | [SKILL.md](skills/{skill-name}/SKILL.md) |
   ```

3. **Sync metadata to convention files**:
   ```bash
   npm run skill-sync
   npm run agents-sync
   ```

---

## Checklist Before Creating

- [ ] Skill doesn't already exist (check `skills/`).
- [ ] Pattern is reusable (not one-off).
- [ ] Name follows conventions.
- [ ] Frontmatter is complete with all required fields.
- [ ] `description` includes explicit "Trigger: ..." clause.
- [ ] `last-edit` is in ISO 8601 format (`YYYY-MM-DD`).
- [ ] `changelog` follows structured format: "what; why; where".
- [ ] `allowed-modes` added **only if** skill has `agents/` folder with sub-agents.
- [ ] `allowed-tools` field matches actual tool usage.
- [ ] `agents/` subfolder created with sub-agent SKILL.md files (if needed).
- [ ] Critical patterns are clear and concise.
- [ ] Code examples are minimal and focused.
- [ ] Commands section exists with copy-paste commands.
- [ ] Passes skill-test validation:
  ```bash
  node skills/skill-test/scripts/skill-lint.js skills/{your-skill-name}
  ```
- [ ] Added to AGENTS.md with correct link format.
- [ ] Metadata synced to convention files (CLAUDE.md, GEMINI.md, copilot-instructions.md).

## Resources

- **Skill Test**: [skill-test/SKILL.md](../skill-test/SKILL.md) — Structural validation, metadata management, semantic review
- **Agents Sync**: [agents-sync/SKILL.md](../agents-sync/SKILL.md) — Syncing AGENTS.md to convention files
- **Skill Sync**: [skill-sync/SKILL.md](../skill-sync/SKILL.md) — Syncing skill metadata to AGENTS.md and skills/README.md
- **Templates**: See [assets/](assets/) for SKILL.md template.