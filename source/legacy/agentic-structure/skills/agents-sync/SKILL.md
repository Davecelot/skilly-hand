---
name: agents-sync
description: >
  Syncs AGENTS.md content to AI convention files (CLAUDE.md, GEMINI.md, copilot-instructions.md, cursor-instructions.md).
  Trigger: When AGENTS.md is updated, edited, or modified.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Updating AGENTS.md"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

# Agents Sync Guide

## When to Use

**Use this skill when:**

- `AGENTS.md` was edited (content added, removed, or modified).
- `skill-sync` just finished updating the skills tables in `AGENTS.md`.
- You notice convention files (`CLAUDE.md`, `GEMINI.md`, etc.) are out of date.

**Don't use this skill for:**

- Creating new convention files from scratch (use `setup.sh` instead).
- Editing skill content or frontmatter (use `skill-sync`).
- One-off changes to tool-specific files that shouldn't be in `AGENTS.md`.

---

## Critical Patterns

### Pattern 1: Convention File Mapping

`AGENTS.md` is the single source of truth. These tool-specific files are **content copies**:

| Source | Target | Condition |
|--------|--------|-----------|
| `AGENTS.md` | `CLAUDE.md` (same dir) | File already exists |
| `AGENTS.md` | `GEMINI.md` (same dir) | File already exists |
| `AGENTS.md` | `.github/copilot-instructions.md` | File already exists (repo root only) || `AGENTS.md` | `cursor-instructions.md` | File already exists (repo root only) |
> **Key Rule**: Only sync to files that already exist. Never create new convention files — that's `setup.sh`'s job.

### Pattern 2: AI-Driven Sync

When you finish editing `AGENTS.md`, immediately copy its content to all detected convention files:

```bash
# Run the sync script
./skills/agents-sync/scripts/sync-conventions.sh
```

Or do it inline if the script isn't available:

```bash
# For each convention file that exists, copy AGENTS.md content
for target in CLAUDE.md GEMINI.md; do
  [ -f "$target" ] && cp AGENTS.md "$target"
done
[ -f .github/copilot-instructions.md ] && cp AGENTS.md .github/copilot-instructions.md
[ -f cursor-instructions.md ] && cp AGENTS.md cursor-instructions.md
```

### Pattern 3: Chaining with skill-sync

When `skill-sync` runs and updates `AGENTS.md`, `agents-sync` should run immediately after:

```
skill-sync updates AGENTS.md → agents-sync copies to convention files
```

---

## Decision Tree

```
Was AGENTS.md just edited?              → Run sync
Did skill-sync just update AGENTS.md?   → Run sync
Does the convention file exist?         → Copy AGENTS.md content to it
Does the convention file NOT exist?     → Skip (don't create it)
```

---

## Sync Procedure

1. **Detect** which convention files exist at repo root (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `cursor-instructions.md`).
2. **Copy** `AGENTS.md` content into each detected file.
3. **Report** which files were synced.

---

## Commands

```bash
# Sync all convention files
./skills/agents-sync/scripts/sync-conventions.sh

# Quick sync via setup.sh
./skills/setup.sh --sync

# Check which convention files exist
ls -la CLAUDE.md GEMINI.md .github/copilot-instructions.md cursor-instructions.md 2>/dev/null

# Diff to check if files are out of sync
diff AGENTS.md CLAUDE.md
diff AGENTS.md GEMINI.md
diff AGENTS.md cursor-instructions.md
```

---

## Git Pre-commit Hook

To auto-sync convention files on every commit that touches `AGENTS.md`, install the pre-commit hook:

```bash
# Install the hook (from repo root)
cp skills/agents-sync/scripts/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Or append to an existing pre-commit hook:

```bash
cat skills/agents-sync/scripts/pre-commit-hook.sh >> .git/hooks/pre-commit
```

---

## Resources

- **Sync script**: [scripts/sync-conventions.sh](scripts/sync-conventions.sh)
- **Pre-commit hook**: [scripts/pre-commit-hook.sh](scripts/pre-commit-hook.sh)
- **Setup script**: [../setup.sh](../setup.sh) (use `--sync` flag)
