---
name: memory-curator
description: >
  Guides Claude on when and how to write versioned, durable memory entries using the
  extended memory frontmatter spec (version + last-verified fields). Defines creation,
  update, archive, and deletion decision rules; enforces MEMORY.md index compaction
  below 150 lines; and establishes history-logging and type-specific versioning standards
  for user, feedback, project, and reference memories.
  Trigger: When writing, updating, reviewing, archiving, or deleting a memory entry, or
  when MEMORY.md index approaches or exceeds 150 lines.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.0"
  changelog: "Initial release; establishes versioned memory entry standards and compaction rules for the project memory system; affects all memory operations in ~/.claude/projects/ memory directory"
  scope: [root]
  auto-invoke: "Writing, updating, or reviewing a memory entry"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Memory Curator

## When to Use

**Use this skill when:**

- Creating a new memory entry (any type: user, feedback, project, reference).
- Updating an existing entry after project understanding evolves.
- Deciding whether to create, update, archive, or delete an entry.
- MEMORY.md index line count is at or above 130 lines (compaction warning zone).
- An existing entry's `last-verified` date is over 30 days old for `project` type.
- The `memory-compact` agent requests guidance on entry standards.

**Don't use this skill for:**

- Reading memory entries for context (read the files directly).
- Purging stale entries in bulk (that is `memory-compact` agent's job).
- Modifying source code or skills.

---

## Extended Memory Frontmatter Spec

Every memory file (individual entries, NOT MEMORY.md) MUST use this exact frontmatter:

```yaml
---
name: {kebab-case-identifier}
description: >
  {One or two sentences summarizing what this memory records.}
type: {user|feedback|project|reference}
version: "{X.Y.Z}"
last-verified: {YYYY-MM-DD}
---
```

### Field Definitions

| Field | Required | Format | Notes |
|-------|----------|--------|-------|
| `name` | Yes | `lowercase-hyphens` | Unique; mirrors filename without `.md` |
| `description` | Yes | Block scalar, ≤ 2 sentences | Used verbatim as the pointer line in MEMORY.md |
| `type` | Yes | `user`, `feedback`, `project`, `reference` | Governs versioning discipline |
| `version` | Yes | `"X.Y.Z"` semver string | Start at `"1.0.0"` |
| `last-verified` | Yes | `YYYY-MM-DD` ISO 8601 | Date last confirmed accurate against codebase |

---

## Critical Pattern 1: Version Increment Rules

| Change magnitude | Increment | Example |
|-----------------|-----------|---------|
| Verified accurate, no change | none (update `last-verified` only) | — |
| Minor wording fix, same meaning | patch `Z` | `1.0.0` → `1.0.1` |
| Evolved understanding, same topic | minor `Y` | `1.0.0` → `1.1.0` |
| Fundamentally different truth | major `X` | `1.0.0` → `2.0.0` |
| Superseded — kept for history | append `-archived.YYYY-MM-DD` to filename, freeze version | `1.2.3` stays |

---

## Critical Pattern 2: Decision Tree

```
Is there an existing entry covering this topic?
  NO  → Create new file (see Creation Rules below)
  YES → Is it still accurate?
          YES, no meaningful change → Update last-verified only, patch bump
          YES, content must evolve  → Update content, minor bump, update last-verified
          NO, fundamentally wrong   → Create new entry, archive old one
          NO, concept no longer exists → Delete entry (log in change-log.md)

Does entry reference files/APIs/patterns that may have changed?
  → Run Verification Commands before setting last-verified

Is MEMORY.md over 130 lines?
  → Compact now (see Compaction Rules below)
```

---

## Creation Rules

1. Choose a name in `lowercase-hyphens` that describes the **topic**, not the date.
   - Good: `component-naming-convention`, `user-preferred-commit-style`
   - Bad: `memory-2026-03-27`, `note1`

2. Choose the correct `type`:

   | Type | When to use |
   |------|-------------|
   | `user` | Personal preferences, working style, communication preferences |
   | `feedback` | Corrections Claude received; lessons learned from mistakes |
   | `project` | Codebase facts, architecture, tools, team conventions |
   | `reference` | Stable external resources or links the project depends on |

3. Set `version: "1.0.0"` and `last-verified` to today's date.
4. Body: free-form markdown after the frontmatter, under 50 lines.
5. Add a pointer line to MEMORY.md immediately (see Index Format below).

---

## MEMORY.md Index Format

### Hard Limits

- MEMORY.md MUST stay under **150 lines** at all times.
- Each pointer line MUST be under **150 characters**.
- If adding a new entry would push the index over 150 lines, compact first.

### Index File Structure

```markdown
# Project Memory Index

> Auto-managed by memory-curator skill. Last compacted: YYYY-MM-DD.
> Line count: N / 150 max.

## User Memories
- [{name}]({name}.md) — {description-first-sentence} [v{version} | verified {last-verified}]

## Feedback Memories
- [{name}]({name}.md) — {description-first-sentence} [v{version} | verified {last-verified}]

## Project Memories
- [{name}]({name}.md) — {description-first-sentence} [v{version} | verified {last-verified}]

## Reference Memories
- [{name}]({name}.md) — {description-first-sentence} [v{version} | verified {last-verified}]
```

### Bootstrap Procedure (First Run)

If MEMORY.md does not exist yet:
1. Create MEMORY.md with the structure above (empty sections).
2. Set `Last compacted` and `Line count` header values.
3. Proceed to create individual memory entries as needed.

---

## Compaction Rules

Run compaction when MEMORY.md reaches 130 lines (warning) or 150 (hard limit).

### Compaction Algorithm

1. Read the current MEMORY.md fully.
2. For each pointer line, read the linked file's `description` frontmatter field.
3. Rewrite each pointer line using only the first sentence of `description`, trimmed to ≤ 150 characters.
4. If two or more entries convey the same fact, flag for merge review.
5. Remove pointer lines for files that no longer exist in the memory directory.
6. Sort entries within each section alphabetically by `name`.
7. Update the `Line count` header.
8. Write the compacted MEMORY.md.

When compaction alone is not enough (still over 150 lines):
- Archive the oldest `project` memories to `memory/archive/`.
- Remove their pointer lines from MEMORY.md.
- Document the archive action in `memory/change-log.md`.

---

## History Logging Pattern

When project understanding changes significantly (major version bump, archive, or delete action), append a record to `memory/change-log.md`. This file is **not listed in MEMORY.md** — it is a raw audit trail.

```markdown
## {YYYY-MM-DD} — {action}: {memory-name}

- **Action**: created | updated | archived | deleted
- **Version**: {old} → {new}  (or "deleted" / "archived at vX.Y.Z")
- **Reason**: {one sentence on what changed in understanding}
- **Codebase trigger**: {file or pattern that prompted the change, if applicable}
```

---

## Type-Specific Standards

| Type | Delete? | Archive? | Verification |
|------|---------|----------|-------------|
| `user` | Never (archive if superseded) | Yes | Not codebase-tied; verify only if user explicitly contradicts it |
| `feedback` | Never | Archive only | Tied to conversation events, not codebase files |
| `project` | When reference confirmed dead | Yes | Verify against codebase every 30 days; minor bump when behavior evolves |
| `reference` | If resource permanently gone | Only if superseded | Patch bump only; check if URLs/local paths still valid |

---

## Verification Commands

Before setting `last-verified` on a `project` memory, confirm the referenced artifacts still exist.

> **Path placeholders:** `<repo-root>` is the repository root (directory containing `CLAUDE.md`). `<claude-memory-dir>` is `~/.claude/projects/<encoded-repo-path>/memory/` — Claude resolves this automatically from the current machine and repo location.

```bash
# Verify a file path still exists
ls {path-referenced-in-memory}

# Verify a skill still exists
ls <repo-root>/skills/{skill-name}/SKILL.md

# Verify a component still exists
ls <repo-root>/projects/scanntech-ui/src/components/{name}/

# Verify a pattern is still in use
grep -r "{pattern}" <repo-root>/skills/ --include="*.md" -l

# Count MEMORY.md lines
wc -l <claude-memory-dir>/MEMORY.md

# List all memory files
ls <claude-memory-dir>/
```

---

## Output Contract

When using this skill, produce:

1. **Action**: create | update | archive | delete — with the exact file name.
2. **Version transition**: `old → new` (or `none` if `last-verified` only).
3. **MEMORY.md delta**: the exact pointer line added, updated, or removed.
4. **Change-log entry**: only when action is archive/delete or version bump is major.
5. **Line count check**: current MEMORY.md line count after the action.

---

## Commands

```bash
# Check memory directory
ls <claude-memory-dir>/

# Count MEMORY.md lines
wc -l <claude-memory-dir>/MEMORY.md

# Find stale project memories (check last-verified dates)
grep -r "last-verified:" <claude-memory-dir>/ 2>/dev/null

# Find entries missing extended spec fields
grep -rL "^version:" <claude-memory-dir>/ 2>/dev/null
```

---

## Resources

- **memory-compact agent**: [.claude/agents/memory-compact.md](../../.claude/agents/memory-compact.md) — Autonomous bulk audit and compaction
- **Skill Creator**: [skill-creator/SKILL.md](../skill-creator/SKILL.md) — Creating new skills
