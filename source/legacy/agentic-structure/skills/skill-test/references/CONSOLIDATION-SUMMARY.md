# Skill Metadata Auto-Update System — Consolidated into skill-test

## Summary

The metadata auto-update system has been fully integrated into the `skill-test` skill. Instead of separate files scattered across the repo, everything is now cohesive and part of the validation framework.

---

## What Changed

### Before (Separated)
```
repo/
├── SKILL-METADATA-SYSTEM.md          (root documentation)
├── skills/METADATA-WORKFLOW.md       (detailed workflow guide)
├── scripts/
│   ├── skill-metadata-updater.js     (separate updater)
│   └── pre-commit-skill-metadata.sh  (separate hook)
└── skills/skill-test/
    └── scripts/skill-lint.js         (validation)
```

### After (Consolidated)
```
skills/skill-test/
├── SKILL.md                           (single source — includes all docs)
├── scripts/
│   ├── skill-lint.js                  (structural validation)
│   ├── skill-metadata-updater.js      (metadata updater) ✨ NEW LOCATION
│   └── pre-commit-skill-metadata.sh   (pre-commit hook) ✨ NEW LOCATION
├── agents/                            (AI-driven reviews)
│   ├── skill-lint-agent/SKILL.md
│   └── skill-review-agent/SKILL.md
├── assets/                            (supporting files)
├── references/
└── README.md (if needed)
```

**Benefits:**
- ✅ Everything related to skill validation is in one place
- ✅ No scattered documentation — single source of truth in `SKILL.md`
- ✅ Easier to maintain and discover
- ✅ Cleaner repository structure
- ✅ Logical organization within the skill framework

---

## New Commands

All commands now use the `skills/skill-test/scripts/` path:

```bash
# Update a single skill's metadata
node skills/skill-test/scripts/skill-metadata-updater.js skills/{name}

# Update all modified skills
node skills/skill-test/scripts/skill-metadata-updater.js --all

# Check which need updating
node skills/skill-test/scripts/skill-metadata-updater.js --check

# Validate a skill
node skills/skill-test/scripts/skill-lint.js skills/{name}

# Install pre-commit hook
cp skills/skill-test/scripts/pre-commit-skill-metadata.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## Documentation

All documentation is now in one place: **[skills/skill-test/SKILL.md](./SKILL.md)**

That file contains:
- ✅ When to use skill-test
- ✅ Three core workflows (structural validation, metadata update, semantic review)
- ✅ Setup & installation instructions
- ✅ Complete usage guide with examples
- ✅ Troubleshooting tips
- ✅ Integration with other skills
- ✅ Folder structure & references

**No need to read multiple files anymore.**

---

## Quick Start

1. **Edit a skill:**
   ```bash
   vim skills/scannlab-best-practices/SKILL.md
   ```

2. **Update metadata:**
   ```bash
   node skills/skill-test/scripts/skill-metadata-updater.js skills/scannlab-best-practices
   ```

3. **Validate:**
   ```bash
   node skills/skill-test/scripts/skill-lint.js skills/scannlab-best-practices
   ```

4. **Commit:**
   ```bash
   git add skills/scannlab-best-practices/SKILL.md
   git commit -m "docs(skill): improve pattern documentation"
   ```

---

## File Locations

| What | Where | Command |
|------|-------|---------|
| **Main documentation** | `skills/skill-test/SKILL.md` | Read for all info |
| **Structural validator** | `skills/skill-test/scripts/skill-lint.js` | `node skills/skill-test/scripts/skill-lint.js` |
| **Metadata updater** | `skills/skill-test/scripts/skill-metadata-updater.js` | `node skills/skill-test/scripts/skill-metadata-updater.js` |
| **Pre-commit hook** | `skills/skill-test/scripts/pre-commit-skill-metadata.sh` | Copy to `.git/hooks/pre-commit` |
| **AI validators** | `skills/skill-test/agents/` | Agents handle these |
| **Supporting files** | `skills/skill-test/assets/` | Reference data |

---

## For Team Members

Share this with your team:

1. **For editing skills:**
   > "After editing any skill SKILL.md file, run: `node skills/skill-test/scripts/skill-metadata-updater.js <skill-path>`"

2. **For validation:**
   > "All skill validation and metadata management is documented in `skills/skill-test/SKILL.md`"

3. **For pre-commit setup:**
   > "To enable automatic metadata validation on commits, install the pre-commit hook: `cp skills/skill-test/scripts/pre-commit-skill-metadata.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit`"

---

## Why This Is Better

**Before:** Scattered files made it hard to find information and understand the system.

**After:** Everything is in `skill-test` where it logically belongs:
- The validator (`skill-lint.js`) + auto-updater (`skill-metadata-updater.js`) are related tools
- All documentation is in the skill's SKILL.md
- All scripts are in the skill's `scripts/` folder
- The pre-commit hook is right there with the tools it uses
- No confusion about where to find things

---

## Next Steps

1. **Read the documentation:** [skills/skill-test/SKILL.md](./SKILL.md)
2. **Install the pre-commit hook** (optional but recommended):
   ```bash
   cp skills/skill-test/scripts/pre-commit-skill-metadata.sh .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```
3. **Test it:** Edit any skill and run the updater
4. **Share with your team:** Show them the new commands

---

## Backward Compatibility

If you had any references to the old file paths:
- ❌ `scripts/skill-metadata-updater.js` → ✅ `skills/skill-test/scripts/skill-metadata-updater.js`
- ❌ `scripts/pre-commit-skill-metadata.sh` → ✅ `skills/skill-test/scripts/pre-commit-skill-metadata.sh`
- ❌ `SKILL-METADATA-SYSTEM.md` → ✅ `skills/skill-test/SKILL.md`
- ❌ `skills/METADATA-WORKFLOW.md` → ✅ `skills/skill-test/SKILL.md`

Update any scripts or documentation that reference the old paths.

---

## Questions?

All answers are in **[skills/skill-test/SKILL.md](./SKILL.md)**. It covers:
- Setup & installation
- Usage examples
- Troubleshooting
- Integration with other skills
- Best practices
