---
name: commit-guardian
description: >
  Runs scoped advisory quality gates (lint, unit tests, coverage threshold,
  optional Angular build, optional Storybook build) for the ScannLab Design
  System monorepo. Interprets failures with AI root-cause analysis and produces
  a structured go/no-go report. Designed to enhance — not replace — existing
  husky/lint-staged hooks.
  Trigger: When running a pre-commit or pre-push quality dry-run, when a quality
  gate fails and root-cause analysis is needed, or when a comprehensive go/no-go
  summary is required before pushing.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-30
  license: Apache-2.0
  version: "1.0.0"
  changelog: "Initial release; defines the advisory quality gate methodology for the commit-guardian agent; affects commit and push workflows across the repo"
  scope: [root]
  auto-invoke: "Running a pre-commit or pre-push quality dry-run"
allowed-tools: Bash, Read, Glob, Grep
---

# commit-guardian Skill

## When to Use

Invoke this skill when:

- Running an advisory quality dry-run before `git commit`
- Running a comprehensive check before `git push`
- A quality gate (lint, tests, coverage) failed and you need root-cause analysis
- Validating local CI parity before opening a pull request
- `sdd-orchestrator` needs to verify quality gates before committing spec work

Do NOT use this skill for:
- Fixing code — report only
- Blocking commits autonomously — that is the husky/pre-push hooks' job
- E2E Playwright tests — use `scannlab-playwright` skill for that

---

## Critical Patterns

### 1. Advisory-Only Contract

This skill NEVER blocks a commit or push on its own. It exits 0 always. The hard blocking gates are:
- Pre-commit: `lint-staged` (ESLint + Prettier via `.husky/pre-commit`)
- Pre-push: `npm run check:coverage` (via `.husky/pre-push`)

This skill produces a human-readable advisory report so the developer can make an informed decision.

### 2. Scope Detection Algorithm

Always run scope detection first — before any quality gate. Use the appropriate git command based on context:

```bash
# Pre-commit (staged files only)
git diff --cached --name-only --diff-filter=ACMR

# Pre-push (full branch changes vs. develop)
git diff --name-only --diff-filter=AM origin/develop...HEAD
```

Classify each path:

| File pattern | Gate bucket |
|---|---|
| `projects/**/*.ts` (not spec/stories/figma/public-api) | source |
| `**/*.spec.ts` | spec |
| `**/*.stories.ts`, `.storybook/**` | stories |
| `*.json`, `*.config.ts`, `vitest.config.ts` | config |
| `**/*.css`, `**/*.html` | style |
| `skills/**`, `AGENTS.md` | skip (existing hooks cover these) |

If bucket `source` is empty: skip test and coverage gates entirely.

### 3. Gate Ordering

Always run in this order — never skip a gate just because a prior gate failed:

```
lint → tests (scoped) → coverage → build (opt) → storybook (opt)
```

Collecting all failures before reporting gives the developer the full picture in a single pass.

### 4. Coverage JSON Reading Pattern

When the coverage gate fails, read the JSON output directly for precise analysis:

```
File: coverage/coverage-summary.json
```

Key fields per file entry:
```json
{
  "lines": { "pct": 75.5 },
  "statements": { "pct": 74.2 },
  "functions": { "pct": 68.0 },
  "branches": { "pct": 71.1 }
}
```

Compare each metric against the 80% threshold. Identify which functions/branches are untested by cross-referencing the source file.

---

## Decision Tree

```
User invokes commit-guardian
    |
Step 0: Detect scope
    |-- Pre-commit? --> git diff --cached
    +-- Pre-push?   --> git diff origin/develop...HEAD

    |
Classify changed files
    |-- source files present?
    |       |-- YES --> run lint + tests + coverage
    |       +-- NO  --> run lint only (early exit message)
    |
    |-- stories files present or --storybook flag?
    |       +-- YES (opt) --> add Storybook build gate
    |
    +-- config files present or --build flag?
            +-- YES (opt) --> add Angular build gate

    |
Run each gate (collect all results, never abort early)

    |
AI failure analysis for each failed gate

    |
Produce go/no-go report
    |-- All required gates PASS --> GO
    +-- Any required gate FAILS --> NO-GO + failure details
```

---

## Content Guidelines

### Report Structure

The final report always includes:
1. **Header**: branch name, scope summary, mode (pre-commit/pre-push/dry-run)
2. **Gate summary table**: one row per gate, status + duration + notes
3. **Verdict**: single-line GO or NO-GO
4. **Failure details**: one AI analysis block per failed gate (only if failures exist)
5. **Recommended next steps**: ordered list of fixes

### Failure Analysis Block Format

```
## Failure Analysis: {Gate Name}

### Root Cause
[1–2 sentences — plain language, no jargon]

### Failing Location
[path/to/file.ts:lineNumber]

### Why This Happened
[Context behind the failure — new code, missing test, lint rule, etc.]

### Suggested Fix
[Exact command or code snippet]

### Estimated Fix Time
low (< 5 min) | medium (5–20 min) | high (> 20 min)
```

### GO/NO-GO Criteria

| Gate | Required for verdict? |
|---|---|
| Lint | YES |
| Unit Tests | YES |
| Coverage (80%) | YES (only when source files changed) |
| Angular Build | NO (advisory only unless --build flag used) |
| Storybook Build | NO (advisory only unless --storybook flag used) |

---

## Commands

```bash
# Scope detection
git diff --cached --name-only --diff-filter=ACMR   # staged
git diff --name-only --diff-filter=AM origin/develop...HEAD  # branch

# Gate 1: Lint
npm run lint

# Gate 2: Unit tests (scoped)
npx vitest run --reporter=verbose projects/scanntech-ui/src/components/{name}/

# Gate 2: Unit tests (full fallback)
npx vitest run --reporter=verbose

# Gate 3: Coverage
npm run check:coverage

# Gate 3: Read coverage data on failure
# File: coverage/coverage-summary.json

# Gate 4a: Angular build (optional)
npm run build

# Gate 4b: Storybook build (optional)
npm run build-storybook
```

---

## Resources

- [scripts/check-coverage.js](../../scripts/check-coverage.js) — coverage threshold validation logic
- [vitest.config.ts](../../vitest.config.ts) — test configuration and coverage settings
- [.git/hooks/pre-commit](../../.git/hooks/pre-commit) — existing hook dispatcher pattern to mirror
- [.husky/pre-push](../../.husky/pre-push) — existing hard blocking gate (`npm run check:coverage`)
- [skills/scannlab-run-commands/SKILL.md](../scannlab-run-commands/SKILL.md) — all project-level run commands
