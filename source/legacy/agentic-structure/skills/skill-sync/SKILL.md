---
name: skill-sync
description: >
  Syncs skill metadata from skills/*/SKILL.md into AGENTS.md and skills/README.md tables.
  Trigger: When a skill is created, edited, renamed, or deleted.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.1.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Syncing skills with AGENTS.md"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

# Skill Sync Guide

## When to Use

**Use this skill when:**

- A new skill was just created and needs registering in `AGENTS.md` and `skills/README.md`.
- An existing skill's frontmatter (`name`, `description`, `auto-invoke`) was edited.
- A skill folder was renamed or deleted.
- The `AGENTS.md` or `skills/README.md` tables look out of date or have placeholder rows.

**Don't use this skill for:**

- Creating new skills from scratch (use `skill-creator` instead).
- Editing the content body of a skill.
- Updating non-skill sections of `AGENTS.md` (Project Overview, etc.).

---

## Critical Patterns

### Pattern 1: Discover All Skills

Scan every `SKILL.md` frontmatter under `skills/`:

```bash
# List all skill directories
ls -d skills/*/

# Extract frontmatter from each skill
for f in skills/*/SKILL.md; do
  echo "=== $f ==="
  sed -n '/^---$/,/^---$/p' "$f"
done
```

### Pattern 2: Classify Into the Correct Table

Use the naming conventions from `skill-creator` to decide which `AGENTS.md` table a skill belongs to:

| Name Pattern | Target Table |
|---|---|
| `{technology}` (e.g. `pytest`, `typescript`) | **Generic Skills** |
| `scannlab-{component}` (e.g. `scannlab-api`) | **ScannLab-Specific Skills** |
| `scannlab-test-{component}` (e.g. `scannlab-test-sdk`) | **ScannLab-Specific Skills** |
| `{action}-{target}` (e.g. `skill-creator`, `skill-sync`) | **ScannLab-Meta Skills** |

### Pattern 3: Build the AGENTS.md Table Row

Each row in the `AGENTS.md` skills tables uses a **3-column** format:

```markdown
| `{name}` | {description} | [SKILL.md](skills/{name}/SKILL.md) |
```

- `{name}` — value of the `name` field in frontmatter.
- `{description}` — first sentence of the `description` field (without the `Trigger:` line).
- Path is always relative from repo root: `skills/{name}/SKILL.md`.

### Pattern 4: Build the README.md Table Row

Each row in the `skills/README.md` tables uses a **2-column** format (no URL column — you're already inside `skills/`).

> **Note:** `skills/README.md` is **bilingual** (Spanish primary + English) because it serves both human readers and AI agents. Descriptions must use the format `{descripción en español} / {English description}`.

```markdown
| `{name}` | {descripción en español} / {English description} |
```

- `{name}` — same as Pattern 3.
- `{descripción en español}` — Spanish translation of the first sentence from the `description` field.
- `{English description}` — first sentence of the `description` field (without the `Trigger:` line).

If a table category has **no skills**, keep a bilingual placeholder row:

```markdown
| — | *No hay skills genéricos todavía. Usá `skill-creator` para agregar uno.* |
```

### Pattern 5: Sync Auto-invoke Table

If a skill's frontmatter contains an `auto-invoke` field, add it to the **Auto-invoke Skills** table in `AGENTS.md`:

```markdown
| {auto-invoke phrase} | `{name}` |
```

If `auto-invoke` is absent or empty, ensure the skill is **not** in the Auto-invoke table.

> **Note:** `skills/README.md` does NOT have an Auto-invoke table — only `AGENTS.md` does.

### Pattern 6: Verification & Quality Checks

**After every sync**, verify completeness with these checks:

#### Check 1: Skill Count Match
All skills discovered in `skills/*/SKILL.md` must appear in **both** `AGENTS.md` and `skills/README.md`:

```bash
# Count skills on disk
DISK_COUNT=$(ls -d skills/*/ | grep -v README | wc -l)

# Count skills in AGENTS.md (count backtick skill rows)
AGENTS_COUNT=$(grep -c '^\| `[a-z-]*`' AGENTS.md)

# Count skills in skills/README.md
README_COUNT=$(grep -c '^\| `[a-z-]*`' skills/README.md)

echo "Disk: $DISK_COUNT, AGENTS.md: $AGENTS_COUNT, README.md: $README_COUNT"
[ "$DISK_COUNT" -eq "$AGENTS_COUNT" ] && [ "$AGENTS_COUNT" -eq "$README_COUNT" ] \
  && echo "✓ All counts match" || echo "✗ Count mismatch detected"
```

#### Check 2: No Orphaned Rows
Every skill in the tables must have a matching `SKILL.md` file:

```bash
# Extract skill names from AGENTS.md
grep '^\| `[a-z-]*`' AGENTS.md | sed 's/.*`\([a-z-]*\)`.*/\1/' | while read skill; do
  [ -d "skills/$skill" ] || echo "✗ ORPHAN in AGENTS.md: $skill (no directory found)"
done

# Same for skills/README.md
grep '^\| `[a-z-]*`' skills/README.md | sed 's/.*`\([a-z-]*\)`.*/\1/' | while read skill; do
  [ -d "skills/$skill" ] || echo "✗ ORPHAN in README.md: $skill (no directory found)"
done
```

#### Check 3: Description Consistency
The English description in `AGENTS.md` must match the English part (right side) of the bilingual description in `skills/README.md`:

```bash
# For each skill, verify English text matches
for skill in skills/*/SKILL.md; do
  name=$(grep '^name:' "$skill" | sed 's/name: //')
  
  # Get AGENTS.md description (after | and before |)
  agents_desc=$(grep "^\| \`$name\`" AGENTS.md | sed 's/.*| \([^|]*\) | .*/\1/')
  
  # Get README.md right side (after /)
  readme_desc=$(grep "^\| \`$name\`" skills/README.md | sed 's/.*\/ \(.*\) *$/\1/')
  
  if [ "$agents_desc" != "$readme_desc" ]; then
    echo "✗ MISMATCH for $name:"
    echo "  AGENTS.md:    $agents_desc"
    echo "  README.md:    $readme_desc"
  fi
done
```

#### Check 4: Auto-invoke Consistency
Every skill with `auto-invoke` in frontmatter must appear in the `AGENTS.md` Auto-invoke table:

```bash
# For each skill with auto-invoke
for skill in skills/*/SKILL.md; do
  if grep -q '^  auto-invoke:' "$skill"; then
    name=$(grep '^name:' "$skill" | sed 's/name: //')
    grep -q "| \`$name\` |" AGENTS.md || echo "✗ MISSING from Auto-invoke: $name"
  fi
done
```
---

## Decision Tree

```
Is the skill new (not in tables)?     → Add row to AGENTS.md AND skills/README.md
Was the skill deleted?                → Remove row from both files
Was name or description changed?      → Update the existing row in both files
Does it have auto-invoke?             → Add/update Auto-invoke table (AGENTS.md only)
Was auto-invoke removed?              → Remove from Auto-invoke table (AGENTS.md only)
```

---

## Sync Procedure

1. **Read** all `skills/*/SKILL.md` frontmatters.
2. **Read** current `AGENTS.md` tables **and** `skills/README.md` tables.
3. **Diff** — identify skills to add, update, or remove.
4. **Classify** each skill into the correct table using Pattern 2.
5. **Write** updated rows into `AGENTS.md` (3-column, Pattern 3) and `skills/README.md` (2-column, Pattern 4), preserving table headers and non-skill sections.
6. **Verify** — run all checks from Pattern 6 (Verification & Quality Checks):
   - ✓ Skill count match across disk, AGENTS.md, and skills/README.md
   - ✓ No orphaned rows (every table entry has a matching directory)
   - ✓ Description consistency (English text matches between files)
   - ✓ Auto-invoke consistency (all frontmatter `auto-invoke` fields appear in AGENTS.md table)
7. **Report** — document what was synced, what failed, and any manual fixes needed.

---

## Commands

```bash
# Discovery
ls -d skills/*/                              # List all skill directories
grep -l "^name:" skills/*/SKILL.md           # Skills with valid frontmatter
grep "auto-invoke" skills/*/SKILL.md         # Skills with auto-invoke
grep "skill-" AGENTS.md                      # AGENTS.md registrations
grep "skill-" skills/README.md               # README.md registrations

# Verification (post-sync)
ls -d skills/*/ | grep -v README | wc -l    # Count skills on disk
grep '^\| `[a-z-]*`' AGENTS.md | wc -l      # Count skills in AGENTS.md
grep '^\| `[a-z-]*`' skills/README.md | wc -l # Count skills in skills/README.md

# Find mismatches
diff <(ls -d skills/*/ | sed 's|skills/||g' | sed 's|/||g' | sort) \
     <(grep '^\| `[a-z-]*`' AGENTS.md | sed 's/.*`\([a-z-]*\)`.*/\1/' | sort)
```

---

## Resources

- **Checklist**: See [assets/sync-checklist.md](assets/sync-checklist.md) for a step-by-step sync checklist.
- **Naming rules**: See [skill-creator SKILL.md](../skill-creator/SKILL.md) for classification conventions.
