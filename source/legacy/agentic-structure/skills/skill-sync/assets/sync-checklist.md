# Skill Sync Checklist

Use this checklist every time you sync skills with `AGENTS.md` and `skills/README.md`.

## Pre-sync

- [ ] List all directories under `skills/`.
- [ ] Read frontmatter from each `skills/*/SKILL.md`.
- [ ] Read the current `AGENTS.md` file.
- [ ] Read the current `skills/README.md` file.

## Classification

- [ ] Classify each skill using the naming table:
  - `{technology}` → Generic Skills
  - `scannlab-{component}` or `scannlab-test-{component}` → ScannLab-Specific Skills
  - `{action}-{target}` → ScannLab-Meta Skills

## Sync AGENTS.md

- [ ] Add missing skills to their correct table (3-column: `Skill | Description | URL`).
- [ ] Update rows where `name` or `description` changed.
- [ ] Remove rows for deleted skills.
- [ ] Sync **Auto-invoke Skills** table (add/remove based on `auto-invoke` field).
- [ ] Keep placeholder rows (`{skill-name}`) only if no real skills exist in that table.

## Sync skills/README.md

- [ ] Add missing skills to their correct table (2-column: `Skill | Description`).
- [ ] Update rows where `name` or `description` changed.
- [ ] Remove rows for deleted skills.
- [ ] If a table category becomes empty, use placeholder: `| — | *No generic skills yet. Use skill-creator to add one.* |`
- [ ] **Do NOT** add an Auto-invoke table — `skills/README.md` does not have one.

## Post-sync

- [ ] Re-read `AGENTS.md` and confirm all skill directories have a matching row.
- [ ] Re-read `skills/README.md` and confirm all skill directories have a matching row.
- [ ] Confirm no stale rows reference deleted skills in either file.
- [ ] Confirm all `[SKILL.md](...)` links in `AGENTS.md` resolve correctly.
