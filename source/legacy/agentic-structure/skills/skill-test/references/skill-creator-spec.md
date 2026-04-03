# Skill Creator Specification

**Link**: See [skills/skill-creator/SKILL.md](../../../skill-creator/SKILL.md) for the authoritative skill structure specification.

This document serves as a reference anchor for `skill-test`. When validating a skill's structure (Phase 1), use `skill-creator` as the source of truth for:

- Required frontmatter fields
- Metadata field definitions
- File organization conventions
- Naming and scoping rules

## Quick Reference

When in doubt about whether a skill is correctly structured, refer to:

1. **skill-creator/SKILL.md** — The spec
2. **skills/skill-test/assets/structural-checks.json** — The linter rules (derived from skill-creator)
3. **skills/skill-test/agents/skill-lint-agent.md** — The validation protocol

If skill-creator changes, update structural-checks.json accordingly.
