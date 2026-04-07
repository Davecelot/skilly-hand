# PLAN: Output Token Minimization Skill (`output-optimizer`)

## Scope
Create and publish a new portable catalog skill focused on reducing output token usage through compact interpreter modes while preserving clarity and safety.

## Decisions
- Skill ID: `output-optimizer`
- Activation style: hybrid
  - Explicit: `mode: <name>`
  - Fallback: infer from user wording when explicit mode is absent
- Canonical modes:
  - `neandertal`
  - `machine`
  - `step-brief`
  - `toon`
  - `json-compact`
  - `binary-decision`
- Expansion policy:
  - Keep output compact by default
  - Expand only when confidence drops due to complexity/ambiguity/risk, or when user explicitly asks for detail
- TOON format is strict and non-comic:
  - `Title`
  - `Objective`
  - `Output`
  - `Next`
- Relationship to existing skills:
  - `token-optimizer` stays focused on reasoning-depth and context budget
  - `output-optimizer` focuses on response-shape and output compression

## Deliverables
1. Root planning artifact:
- `PLAN.md`

2. New skill directory:
- `catalog/skills/output-optimizer/SKILL.md`
- `catalog/skills/output-optimizer/manifest.json`
- `catalog/skills/output-optimizer/references/mode-protocols.md`

3. Catalog integration outputs:
- Updated `catalog/catalog-index.json`
- Updated `catalog/README.md`

## Implementation Steps
1. Author `PLAN.md` with scope, decisions, deliverables, checks, and completion criteria.
2. Create `output-optimizer` skill content:
- Activation precedence rules (explicit mode over inferred mode)
- Per-mode constraints and compact output contracts
- Complexity + confidence guard for controlled expansion
- Examples that show expected shape for each mode
3. Add a compliant `manifest.json` using catalog metadata standards.
4. Sync generated catalog artifacts.
5. Validate catalog integrity.

## Validation Commands
```bash
npm run build
npm run catalog:sync
npm run catalog:check
```

## Acceptance Criteria
- New `output-optimizer` skill exists in catalog with required files and valid metadata.
- Mode behavior is explicitly specified for all six modes.
- TOON output is defined as strict 4-block format.
- Expansion policy is documented with complexity/confidence guard.
- `catalog/catalog-index.json` includes `output-optimizer`.
- `catalog/README.md` includes `output-optimizer` row.
- `npm run catalog:check` passes.

## Completion Checklist
- [x] Plan artifact created
- [x] Skill files authored
- [x] Catalog index regenerated
- [x] Catalog README synced
- [x] Catalog validation passed
