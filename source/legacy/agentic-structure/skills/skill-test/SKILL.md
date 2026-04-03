---
name: skill-test
description: >
  Validates other skills for structural integrity and semantic correctness.
  Three modes: (1) Structural validation via CLI script for pre-commit checks,
  (2) Metadata auto-update for version/last-edit/changelog tracking,
  (3) Semantic review via AI agent for consistency and quality assurance.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.2.3"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "When auditing, reviewing, or validating an existing skill"
allowed-tools: Read, Grep, Bash, Node.js, SubAgent
allowed-modes:
  - structural      # Via scripts/skill-lint.js — fast, deterministic
  - metadata-update # Via scripts/skill-metadata-updater.js — interactive updater
  - semantic        # Via agents/ — AI-driven correctness review
---

# Skill Test — Validation & Metadata Management

## When to Use

**Use this skill when:**

- Creating a new skill (validate structure before skill-sync)
- Editing an existing skill (update metadata fields and validate)
- Auditing a skill for consistency and correctness
- Running pre-commit checks on skill files
- Validating that skills match AGENTS.md and skills/README.md
- Reviewing skill quality (triggers, examples, allowed-tools consistency)

**Don't use this skill for:**

- General skill writing (use `skill-creator`)
- Syncing skill metadata to AGENTS.md (use `skill-sync`)
- Updating convention files (use `agents-sync`)

---

## Three Core Workflows

### Workflow 1: Structural Validation (CLI)

**Purpose**: Fast, deterministic checks on skill files. Validates format, references, and consistency.

**What it validates:**

- Frontmatter YAML syntax and required fields
- Semver format on version field (`X.Y.Z`)
- No merge conflict markers
- File paths in `assets/` and `references/` actually exist
- `last-edit` field is in ISO 8601 format (YYYY-MM-DD)
- `changelog` field is not empty
- **Metadata freshness**: Detects if SKILL.md was modified but metadata wasn't updated
- Skill count matches between disk, `AGENTS.md`, and `skills/README.md`
- `auto-invoke` field appears in AGENTS.md auto-invoke table

**How to invoke:**

```bash
# Validate a single skill
node skills/skill-test/scripts/skill-lint.js skills/scannlab-best-practices

# Validate all skills
node skills/skill-test/scripts/skill-lint.js

# Via npm (if configured)
npm run skill-test:lint
```

**Output format:**

```
✓ PASS  skills/scannlab-best-practices/SKILL.md
✓ PASS  skills/token-optimizer/SKILL.md
✗ FAIL  skills/skill-sync/SKILL.md
  → SKILL.md was modified but metadata not updated.
    Run: node skills/skill-test/scripts/skill-metadata-updater.js skills/skill-sync
...
Summary: 17 passed, 1 failed
```

**Use case**: Local pre-commit, PR validation, automated skill integrity checks, CI/CD pipelines.

---

### Workflow 2: Metadata Auto-Update (Interactive)

**Purpose**: Automatically update three metadata fields when a skill is modified:
- `version` — Auto-increments patch version (e.g., `1.0.0` → `1.0.1`)
- `last-edit` — Set to current date in ISO 8601 format (YYYY-MM-DD)
- `changelog` — Prompted from user with structured format (what/why/where)

**When to use:**

- Every time you edit a SKILL.md file
- Before committing changes
- When running bulk updates across multiple skills

**How to invoke:**

```bash
# Update a single skill (interactive)
node skills/skill-test/scripts/skill-metadata-updater.js skills/scannlab-best-practices

# Update all modified skills
node skills/skill-test/scripts/skill-metadata-updater.js --all

# Check which skills need updates (dry-run)
node skills/skill-test/scripts/skill-metadata-updater.js --check

# List all skills
node skills/skill-test/scripts/skill-metadata-updater.js --list

# Show help
node skills/skill-test/scripts/skill-metadata-updater.js --help
```

**Interactive Workflow:**

```
$ node skills/skill-test/scripts/skill-metadata-updater.js skills/scannlab-best-practices

📝 Updating metadata for: scannlab-best-practices

Current metadata:
  version: 1.0.0
  last-edit: 2024-02-15
  changelog: "Previous entry"

What changed in this skill?
Format: "what changed, why it matters, where it affects"
📋 Changelog entry: Enhanced signal pattern decision tree; helps developers understand lifecycle; affects Pattern section

Applying updates:
  version: 1.0.0 → 1.0.1
  last-edit: 2024-02-15 → 2024-03-21
  changelog: "Enhanced signal pattern..."

✅ Metadata updated successfully!
```

**Changelog Format Guidelines:**

Structure: **"<what changed>, <why it matters>; <where it affects>"**

✅ Good examples:
- `"Added changelog field to frontmatter structure for version history tracking"`
- `"Enhanced decision tree examples with Angular 20 signals; clarifies signal initialization; affects Pattern section"`
- `"Fixed ARIA role documentation to match WCAG 2.2 Level AA; improves accessibility section accuracy"`

❌ Bad examples:
- `"Updated"` (too vague)
- `"Fixed stuff"` (no details)
- `"Various improvements"` (unclear)

**Use case**: Mandatory workflow after editing any skill. Ensures consistent versioning and change tracking.

---

### Workflow 3: Semantic Review (AI Agent)

**Purpose**: AI-driven review of skill content for correctness and consistency beyond just format.

**Three-phase review protocol:**

| Phase | Type | What It Catches |
|---|---|---|
| **Phase 1 — Schema** | Structural | Missing fields, invalid formats, broken paths (same as structural mode) |
| **Phase 2 — Consistency** | Semantic | Does `auto-invoke` match actual triggers? Do examples match declared language? Do `allowed-tools` match usage in body? |
| **Phase 3 — Behavioral** | Scenario-based | Would following the skill produce expected output? Are code examples correct? Is guidance actionable? |

**How to invoke:**

```
User: "Review the scannlab-best-practices skill for semantic correctness"

→ SKILL.md routes to skill-review-agent.md
→ Agent performs 3-phase review
→ Returns detailed report
```

**Output format:**

```markdown
## Skill Review Report: scannlab-best-practices

### Phase 1 — Schema ✓
All required fields present. Frontmatter valid YAML.

### Phase 2 — Consistency ✓
- auto-invoke matches triggers ✓
- allowed-tools all used in body ✓
- code examples are TypeScript ✓

### Phase 3 — Behavioral ⚠
- Pattern example unclear on reactive state lifecycle
- Recommendation: Add timing diagram for signal initialization

## Overall Grade: A (Minor clarification recommended)
```

**Use case**: Code review, skill audits, ensuring production-readiness, catching drift from standards.

---

## Setup & Installation

### Step 1: Permissions

Make scripts executable:

```bash
chmod +x skills/skill-test/scripts/skill-lint.js
chmod +x skills/skill-test/scripts/skill-metadata-updater.js
chmod +x skills/skill-test/scripts/pre-commit-hook.sh
```

### Step 2: Install the Combined Pre-commit Hook

The repo uses a **combined dispatcher** at `.git/hooks/pre-commit` that calls both
`agents-sync` and `skill-test` hooks in sequence. This is already installed — see
[.git/hooks/pre-commit](../../.git/hooks/pre-commit).

**Dispatcher structure:**

```
.git/hooks/pre-commit  (dispatcher)
    → skills/agents-sync/scripts/pre-commit-hook.sh   (runs when AGENTS.md is staged)
    → skills/skill-test/scripts/pre-commit-hook.sh    (runs when skills/*/SKILL.md is staged)
```

Each hook checks its own trigger condition and exits `0` immediately if not applicable,
so they do not interfere with each other.

**To reinstall from scratch:**

```bash
cp skills/skill-test/scripts/pre-commit-hook.sh .git/hooks/pre-commit-skill-test
chmod +x .git/hooks/pre-commit-skill-test
# Then add a call to it inside .git/hooks/pre-commit
```

Or recreate the full dispatcher:

```bash
# The dispatcher source lives at skills/skill-test/scripts/ — recreate .git/hooks/pre-commit
# to call both agents-sync and skill-test hooks as shown in the Dispatcher structure above.
```

### Step 3: Test It

```bash
# Edit a skill
vim skills/token-optimizer/SKILL.md

# Run the updater
node skills/skill-test/scripts/skill-metadata-updater.js skills/token-optimizer

# Validate (should pass now)
node skills/skill-test/scripts/skill-lint.js skills/token-optimizer

# Try to commit (pre-commit hook validates)
git add skills/token-optimizer/SKILL.md
git commit -m "test"
# ✅ Should pass if hook is installed
```

---

## Usage Guide

### Complete Workflow: Edit → Update → Validate → Commit

```bash
# 1. Edit a skill
vim skills/scannlab-best-practices/SKILL.md

# 2. Update metadata (interactive — prompts for changelog)
node skills/skill-test/scripts/skill-metadata-updater.js skills/scannlab-best-practices

# 3. Validate structure
node skills/skill-test/scripts/skill-lint.js skills/scannlab-best-practices

# 4. If description/name/auto-invoke changed, sync to AGENTS.md
node scripts/skill-sync.js skills/scannlab-best-practices

# 5. Commit (pre-commit hook validates metadata freshness)
git add skills/scannlab-best-practices/SKILL.md
git commit -m "docs(skill): improve pattern examples"
```

### Bulk Update Multiple Skills

```bash
# Check which skills are modified
node skills/skill-test/scripts/skill-metadata-updater.js --check

# Update all of them
node skills/skill-test/scripts/skill-metadata-updater.js --all
```

### Validation Commands

```bash
# Validate single skill
node skills/skill-test/scripts/skill-lint.js skills/scannlab-best-practices

# Validate all skills
node skills/skill-test/scripts/skill-lint.js

# Both return exit code 0 (pass) or 1 (fail) for CI/CD
```

---

## Troubleshooting

### "SKILL.md not found"

```
Error: SKILL.md not found at: /path/skills/unknown/SKILL.md
```

**Solution:** List all skills and use correct name:

```bash
node skills/skill-test/scripts/skill-metadata-updater.js --list
node skills/skill-test/scripts/skill-metadata-updater.js skills/scannlab-best-practices
```

### "SKILL.md was modified but metadata not updated"

The validator detected changes but `last-edit` wasn't updated.

**Solution:** Run the metadata updater:

```bash
node skills/skill-test/scripts/skill-metadata-updater.js skills/{name}
```

### Pre-commit Hook Blocks Commit

```
❌ FAILED: Metadata not updated!
Run: node skills/skill-test/scripts/skill-metadata-updater.js skills/...
```

**Solution:** Run the updater, then retry:

```bash
node skills/skill-test/scripts/skill-metadata-updater.js skills/{name}
git add skills/{name}/SKILL.md
git commit -m "..."
```

To remove the hook temporarily:

```bash
mv .git/hooks/pre-commit .git/hooks/pre-commit.bak
git commit  # Commit without hook
mv .git/hooks/pre-commit.bak .git/hooks/pre-commit  # Re-enable
```

### "Metadata not updated in CI/CD"

If CI validation fails, you need to:

1. Pull the branch locally
2. Run the metadata updater
3. Push the updated files

```bash
git pull origin {branch}
node skills/skill-test/scripts/skill-metadata-updater.js skills/{name}
git add skills/{name}/SKILL.md
git commit --amend --no-edit  # Amend last commit
git push origin {branch}
```

---

---

## Related Skills & Integration

| Skill | Interaction |
|---|---|
| `skill-creator` | Creates new skills; skill-test validates their output |
| `skill-sync` | Syncs to AGENTS.md; skill-test ensures data is valid first |
| `agents-sync` | Shares the same `.git/hooks/pre-commit` dispatcher; both hooks run on every commit |
| `token-optimizer` | Determines if skill-test review needs reasoning depth |

### Combined Workflows

**Creating a new skill:**
```
skill-creator → skill-test (structural) → skill-sync → skill-test (structural) → agents-sync
```

**Editing an existing skill:**
```
Edit SKILL.md → skill-test (metadata-update) → skill-test (structural) → git commit
```

**Auditing a skill:**
```
skill-test (semantic review) → reports findings → fix issues → skill-test (structural)
```

### Synchronized Pre-commit Workflow (agents-sync + skill-test)

Both skills contribute a hook script that is registered in the shared `.git/hooks/pre-commit`
dispatcher. On every commit, the dispatcher runs both in order:

```
git commit
    → .git/hooks/pre-commit (dispatcher)
        → agents-sync/scripts/pre-commit-hook.sh
            triggers: AGENTS.md is staged
            action:   syncs AGENTS.md → CLAUDE.md, GEMINI.md, copilot-instructions.md
        → skill-test/scripts/pre-commit-hook.sh
            triggers: skills/*/SKILL.md is staged
            action:   runs skill-lint.js on each staged skill; blocks on failure
```

Each hook exits `0` immediately when its trigger condition is not met, so committing
non-skill files is never blocked by skill validation, and vice versa.

---

## Implementation Notes

- **Standalone scripts**: No npm dependencies added to root `package.json`
- **Git-aware**: Metadata updater detects actual changes via git status and logs
- **Interactive**: Prompts guide users through changelog creation
- **CI/CD ready**: Validation scripts return proper exit codes
- **Extensible**: New phases/checks can be added to validation logic

---

## References

- **Skill structure spec**: See [skill-creator SKILL.md](../skill-creator/SKILL.md) for schema
- **Metadata rules**: Lint rules defined in `assets/structural-checks.json`
- **Review rubric**: See `assets/review-checklist.md` for Phase 1–3 criteria
- **Pre-commit hook**: Install guide in [scripts/pre-commit-skill-metadata.sh](./scripts/pre-commit-skill-metadata.sh)


---

## Two Validation Modes

### Mode 1: Structural Validation (CLI)

**What it does**: Fast, deterministic checks that can run locally or in CI/CD.

**What it validates:**

- Frontmatter YAML syntax and required fields (`name`, `description`, `version`, `scope`, etc.)
- Semver format on version field (`X.Y.Z`)
- No merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
- File paths in `assets/` and `references/` actually exist
- Skill count matches between disk, `AGENTS.md`, and `skills/README.md`
- `auto-invoke` field in frontmatter appears in AGENTS.md auto-invoke table
- No orphaned skill rows in AGENTS.md or skills/README.md

**How to invoke:**

```bash
# Validate a single skill
node skills/skill-test/scripts/skill-lint.js skills/scannlab-best-practices

# Validate all skills in the repo
node skills/skill-test/scripts/skill-lint.js

# From any directory (if installed as npm script in future)
npm run skill-test:lint
```

**Output format:**

```
✓ PASS  skills/scannlab-best-practices/SKILL.md
✓ PASS  skills/token-optimizer/SKILL.md
✗ FAIL  skills/skill-sync/SKILL.md
  → merge conflict marker detected at line 218
  → version field '1.0' does not match semver (expected X.Y.Z)  
...
Summary: 17 passed, 1 failed
Exit code: 1 (fails if any skill is invalid)
```

**Use case**: Local pre-commit, PR validation, automated skill integrity checks.

---

### Mode 2: Semantic Review (AI Agent)

**What it does**: AI-driven review of skill content for correctness and consistency.

**Three-phase review protocol:**

| Phase | Type | What It Catches |
|---|---|---|
| **Phase 1 — Schema** | Structural | Missing fields, invalid formats, broken path references (same as Mode 1) |
| **Phase 2 — Consistency** | Semantic | Does `auto-invoke` description match actual triggers? Do code examples match the language declared? Do `allowed-tools` list match patterns used in the skill body? |
| **Phase 3 — Behavioral** | Scenario-based | Given a realistic input, would following this skill's instructions produce the expected output? Are code examples correct and runnable? |

**How to invoke:**

```
User: "Review the scannlab-best-practices skill for semantic correctness"

→ SKILL.md routes to skill-review-agent.md
→ Agent reads scannlab-best-practices/SKILL.md 
→ Performs 3-phase validation
→ Returns detailed report with findings and recommendations
```

**Output format:**

```markdown
## Skill Review Report: scannlab-best-practices

### Phase 1 — Schema ✓
All required fields present. Frontmatter valid YAML.

### Phase 2 — Consistency ✓
- auto-invoke: "When writing Angular component code" ✓ matches patterns
- allowed-tools: [Read, Edit, Write, Grep] ✓ all used in body
- code examples: TypeScript ✓ matches declared language

### Phase 3 — Behavioral ⚠ 
- Example: "Use `const` over `let`" — but no guidance on when `let` is necessary
- Recommendation: Add exception case for loop counters and reactive state

## Overall Grade: A- (Minor clarification needed)
```

**Use case**: Code review, skill audits, ensuring new skills are production-ready, catching drift from Angular or repo standards.

---

---

## Implementation Notes

- **No npm integration**: Scripts are standalone. No dependencies added to root `package.json`.
- **Zero CI/CD burden**: Scripts run on-demand only. Not blocking any pipeline.
- **AI-native**: Agents are designed for human + AI collaboration, not automation.
- **Extensible**: New phases can be added to review protocol without changing structure.

---

## Related Skills

| Skill | Interaction |
|---|---|
| `skill-creator` | Creates new skills; skill-test validates their output |
| `skill-sync` | Syncs skill metadata; skill-test ensures it's valid first |
| `agents-sync` | Syncs convention files; skill-test verifies references are correct |
| `token-optimizer` | Determines if skill-test should use thinking or be quick |

---

## Skill Test Workflow

```
User creates/edits a skill
    → skill-test (structural mode) validates format
        ✓ passes → proceed to skill-sync
        ✗ fails → fix and retry

Later, during code review or audit:
    → skill-test (semantic mode) reviews quality
        → Reports findings to developer
        → Skill is updated if needed
        → Re-validated with structural mode
```

---

## References

- **Skill structure spec**: See `skill-creator` for required fields and format
- **Frontmatter rules**: Defined in `structural-checks.json` (data-driven configuration)
- **Review rubric**: See `assets/review-checklist.md` for Phase 1–3 criteria
