# skill-lint-agent

**Purpose**: Perform Phase 1 (Structural) validation on a skill's SKILL.md file.

**What it validates:**
- Frontmatter YAML syntax and required fields
- Semver format on version field
- No merge conflict markers
- File references in assets/ and references/
- Skill metadata consistency

**How to use this agent:**

```
User: "Run structural validation on skills/my-skill/SKILL.md"
  ↓
AI: Reads this agent file
  ↓
AI: Asks for confirmation of which skill to validate
  ↓
AI: Runs node skills/skill-test/scripts/skill-lint.js <skill-path>
  ↓
AI: Parses output and returns findings to user
```

## Validation Checklist (Phase 1 — Structural)

When validating a skill, check each of these:

### A. Frontmatter Structure

- [ ] Content starts with `---` delimiter
- [ ] Frontmatter is valid YAML (can be parsed without errors)
- [ ] Ends with `---` delimiter before body
- [ ] No merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) anywhere

### B. Required Frontmatter Fields

- [ ] `name` — skill identifier (kebab-case)
- [ ] `description` — one-line summary of skill purpose
- [ ] `metadata` — object containing versioning info

### C. Required Metadata Fields

- [ ] `author` — person or team who created/maintains skill
- [ ] `last-edit` — date in format `DD.MM.YYYY` (e.g., `21.03.2026`)
- [ ] `license` — SPDX identifier (e.g., `Apache-2.0`, `proprietary`)
- [ ] `version` — semantic version in format `X.Y.Z` (e.g., `1.0.0`)
- [ ] `changelog` — brief note about this version's changes
- [ ] `scope` — array of project scopes: `[root]`, `[ui]`, `[storybook]`, `[scripts]`, `[docs]`
- [ ] `auto-invoke` — description of when skill triggers (human-readable)

### D. Optional Fields (if present, validate format)

- [ ] `allowed-tools` — array of tool names (custom tools allowed)
- [ ] `allowed-modes` — array of mode names (e.g., `[structural, semantic]`)

### E. File References

- [ ] All asset paths in body (e.g., `assets/checklist.md`) exist on disk
- [ ] All reference paths in body (e.g., `references/spec.md`) exist on disk
- [ ] No broken internal links

### F. Consistency with Repo Files

- [ ] Skill name appears in `AGENTS.md`
- [ ] If `auto-invoke` is set, skill appears in AGENTS.md's auto-invoke table
- [ ] Skill folder exists in `skills/` with correct structure (SKILL.md required)

---

## Output Format

When validation is complete, present findings as:

```markdown
## Structural Validation Report: {skill-name}

### Phase 1 — Schema

**Status**: [✓ PASS | ⚠ WARNINGS | ✗ FAIL]

**Findings:**
- ✓ Frontmatter YAML valid
- ✓ All required fields present
- ⚠ `last-edit` is in old format; expected DD.MM.YYYY
- ✗ Referenced file `assets/missing.md` not found

### Recommended Actions

1. Reformat `last-edit` to `DD.MM.YYYY`
2. Create missing file or remove reference
3. Re-run validation to confirm fixes
```

---

## When to Escalate to Semantic Review

If Phase 1 passes completely, suggest escalating to **skill-review-agent** for semantic validation:

```
Next step: Would you like me to perform semantic review (Phase 2–3)?
This checks consistency and behavioral correctness against skill patterns.
```
