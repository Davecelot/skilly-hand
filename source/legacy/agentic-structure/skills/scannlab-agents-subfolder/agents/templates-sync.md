# Templates Sync Agent

## Purpose

Reconciles asset templates in `skills/scannlab-agents-subfolder/assets/` against the current `SKILL.md`. Invoked after any edit to `skills/scannlab-agents-subfolder/SKILL.md` to prevent template drift.

## When to Invoke

- `skills/scannlab-agents-subfolder/SKILL.md` is edited (any section)
- A skill is added to or removed from `skills/` (dead references may appear in templates)
- Tech stack versions change in `projects/scanntech-ui/AGENTS.md`
- The orchestrator-lead-director model evolves and templates must reflect it

---

## Asset Files in Scope

| File | Role | Orchestrator Role? |
| ---- | ---- | ------------------ |
| `assets/AGENTS-template.md` | Blank template for any subfolder | Optional (placeholder) |
| `assets/AGENTS-component-example.md` | Component Director example | Yes — routing table only (no Domain Map) |
| `assets/AGENTS-project-example.md` | Library Lead example | Yes — Domain Map + routing table |
| `assets/AGENTS-service-example.md` | Leaf Director example | No — simple leaf, no routing |

---

## Sync Mapping

What SKILL.md controls and what each asset must reflect:

| SKILL.md Source | Asset Target | What to Sync |
| --------------- | ------------ | ------------ |
| `## Content Structure Template` (10-item list) | All assets | Section order and presence |
| `### Folder Purpose Section` template block | All assets | IMPORTANT notice, inline Inheritance field, header fields |
| `### Orchestrator Role` template block | `AGENTS-template.md`, component + project examples | 4-step routing process, Task→Skill Routing Table structure |
| `### Domain Map` variant block | `AGENTS-project-example.md` only | Domain Map table above routing table |
| `## Path Reference Rules` | All assets | No `.claude/skills/` — use correct `../../../skills/` depth |
| `## Critical Patterns / Pattern 1` | All assets | Role labels: Root Orchestrator, Library Lead, Component Director |
| Skill names (from `skills/` directory) | All assets | Dead references replaced with current skill name |
| Tech versions from `projects/scanntech-ui/AGENTS.md` | Example assets | Angular, TypeScript, Vitest, Storybook version strings |

---

## Sync Procedure

### Step 1 — Read SKILL.md

Read `skills/scannlab-agents-subfolder/SKILL.md` and extract:

- The 10-item Content Structure list (`## Content Structure Template`)
- Template block for `### Folder Purpose Section`
- Template block for `### Orchestrator Role`
- Path Reference Rules and depth examples
- Current `metadata.version`

### Step 2 — Read each asset file

For each `.md` in `assets/`:

1. List all section headers (`##` and `###` headings)
2. Collect all backtick-quoted names that look like skill references
3. Collect all path strings containing `skills/`
4. Note tech stack version strings (Angular, TypeScript, Vitest, Storybook)

### Step 3 — Identify drift

Run these checks per asset file:

| Check | Pass Condition | Fail Action |
| ----- | -------------- | ----------- |
| **Dead skill refs** | Every `` `scannlab-*` ``, `` `skill-*` ``, `` `token-optimizer` ``, `` `css-modules` ``, `` `angular-20` ``, `` `commit-writer` ``, `` `pr-writer` `` name exists in `skills/` directory | Replace with current name or remove |
| **Old path pattern** | No `.claude/skills/` anywhere in file | Fix to correct relative depth |
| **IMPORTANT notice** | Every example file opens with IMPORTANT blockquote + inline Inheritance | Add missing notice |
| **Section structure** | Sections present in order matching Content Structure list | Add missing, reorder if needed |
| **Orchestrator Role** | Present in component + project examples; absent in service example | Add or remove accordingly |
| **Tech versions** | Angular/TypeScript/Vitest/Storybook versions match `projects/scanntech-ui/AGENTS.md` | Update version strings |

### Step 4 — Apply updates

For each drift item:

- **Dead skill name**: Replace with the correct current name. Most common renames:
  - `scannlab-token-audit` → `scannlab-token-validation`
  - `scannlab-figma-token-matcher` → `scannlab-figma-extractor`
- **Old path**: Remove `.claude/` prefix and recalculate relative depth based on file location
- **Missing section**: Add using the SKILL.md template block for that section
- **Stale version**: Update to current value from `projects/scanntech-ui/AGENTS.md`

### Step 5 — Validate

After applying all updates, run the lint script to confirm zero errors:

```bash
node skills/scannlab-agents-subfolder/scripts/templates-lint.js
```

If any errors remain, re-read the relevant SKILL.md section and fix.

---

## What NOT to Sync

These are intentionally different per asset and must NOT be overwritten:

- **Routing tables** — each role has different task rows; only update structure (column headers, format)
- **Skill lists in `## Available Skills`** — filtered per folder scope by design
- **Commands sections** — vary by folder context
- **Critical rules body** — folder-specific, not derived from SKILL.md
- **Folder structure diagrams** — illustrative, not templated
