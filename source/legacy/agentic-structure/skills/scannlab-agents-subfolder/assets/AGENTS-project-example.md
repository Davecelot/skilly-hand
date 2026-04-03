# ScannLab UI Library - AI Agent Ruleset

> **IMPORTANT:** This file only adds local rules for `projects/scanntech-ui/`. All repository-wide patterns are inherited from the root AGENTS.md. Do **not** repeat skill tables or global conventions here — reference the root for full skill lists and cross-project rules.
>
> **Inheritance:** [Root AGENTS.md](../../AGENTS.md)
>
> **Scope**: `projects/scanntech-ui/` — ScannLab Design System Angular library: components, assets, Storybook, docs, and public API
> **Tech Stack**: Angular 20.3.0+, TypeScript 5.9.2+, CSS Modules, Vitest 3.2.4+, Storybook 9.1.13+
> **Primary Skills**: `scannlab-best-practices`, `scannlab-storybook`, `scannlab-unit-test`
> **When to escalate to root AGENTS.md**: Cross-project patterns, repository structure changes, CI/CD configuration, new skill creation
> **Author**: ScannLab Design System Team
> **Last updated**: 24.03.2026

## Inherits From

- [Root AGENTS.md](../../AGENTS.md) — Repository-wide patterns, full skill registry, chaining workflows, meta skills

---

## Mandatory Reading

**BEFORE starting ANY task in this library**, read these skills in order:

| Skill | Purpose |
| ----- | ------- |
| [`token-optimizer`](../../skills/token-optimizer/SKILL.md) | **Required for all AI/model interactions.** Classifies task complexity and optimizes token usage. |
| [`scannlab-best-practices`](../../skills/scannlab-best-practices/SKILL.md) | **Required for ANY component code.** Angular 20+ signals, `OnPush`, CSS Modules, accessibility baseline. |

---

## Orchestrator Role

This AGENTS.md is the **library-level entry point and dispatcher** for all work inside `projects/scanntech-ui/`. When receiving a task in this library:

1. **Classify** the task using `token-optimizer`
2. **Identify the domain** using the Domain Map below
3. **Delegate or route** using the Task → Skill Routing Table
4. **Invoke child orchestrators** when the task belongs to a subfolder with its own AGENTS.md

### Domain Map

| Domain | Folder | Child Orchestrator |
| ------ | ------ | ------------------ |
| UI components (creation, iteration, testing, stories) | `src/components/` | [components/AGENTS.md](src/components/AGENTS.md) |
| Global design tokens & CSS variables | `assets/styles/` | — (route to `scannlab-token-validation`) |
| Token documentation | `src/docs/tokens/` | — (route to `scannlab-token-validation`) |
| Storybook configuration | `.storybook/` | — (route to `scannlab-storybook`) |
| Public library API | `src/public-api.ts`, `src/components/public-api.ts` | — (library-level rule below) |
| Library build config | `ng-package.json`, `tsconfig.lib.json` | — (escalate to root AGENTS.md) |
| Component documentation | `src/docs/` | — (route to `scannlab-storybook`) |

### Task → Skill Routing Table

| Task | Delegate To / Skill Chain |
| ---- | ------------------------- |
| Create or modify any UI component | → [src/components/AGENTS.md](src/components/AGENTS.md) |
| Write or update `.stories.ts` for a component | → [src/components/AGENTS.md](src/components/AGENTS.md) → `scannlab-storybook` |
| Write or update `.spec.ts` for a component | → [src/components/AGENTS.md](src/components/AGENTS.md) → `scannlab-unit-test` |
| Audit component CSS for hard-coded values | → [src/components/AGENTS.md](src/components/AGENTS.md) → `scannlab-token-validation/css-auditor` |
| Extract or inspect Figma component specs | `scannlab-figma-extractor` → `scannlab-token-validation/figma-matcher` |
| QA Figma design vs. component implementation | `scannlab-figma-extractor` → `scannlab-token-validation/figma-matcher` → `scannlab-token-validation/css-auditor` |
| Map component to Figma Code Connect | `scannlab-code-connect` |
| Review component accessibility | `scannlab-a11y-checker` |
| Update global design tokens or CSS variables | `scannlab-token-validation/css-auditor` |
| Modify Storybook configuration | `scannlab-storybook` |
| Export a new component in public API | [Public API Management](#public-api-management) section below |
| Write a commit message | `commit-writer` |
| Write a pull request | `pr-writer` |
| Run dev, test, build, or Storybook commands | `scannlab-run-commands` |

---

## Available Skills (Library Scope)

### Component Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `scannlab-best-practices` | Angular 20+ component patterns: signals, host bindings, `OnPush`, CSS Modules, accessibility baseline. | [SKILL.md](../../skills/scannlab-best-practices/SKILL.md) |
| `scannlab-storybook` | Generates `.stories.ts` with all variants, interactive controls, and Storybook configuration. | [SKILL.md](../../skills/scannlab-storybook/SKILL.md) |
| `scannlab-unit-test` | Vitest patterns for components, directives, services, mocks, and integration tests. | [SKILL.md](../../skills/scannlab-unit-test/SKILL.md) |
| `scannlab-a11y-checker` | Checks Angular components against W3C WCAG 2.2 AA standards with remediation guidance. | [SKILL.md](../../skills/scannlab-a11y-checker/SKILL.md) |
| `css-modules` | Conventions for writing scoped CSS using CSS Modules and `--s-*` design tokens. | [SKILL.md](../../skills/css-modules/SKILL.md) |
| `angular-20` | Base Angular 20.3+ guidelines: signals, deferrable views, standalone components. | [SKILL.md](../../skills/angular-20/SKILL.md) |

### Figma & Token Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `scannlab-figma-extractor` | Extracts layer/node specs from Figma links. **Prerequisite** for all Figma tasks. | [SKILL.md](../../skills/scannlab-figma-extractor/SKILL.md) |
| `scannlab-token-validation` | Unified token skill. `figma-matcher`: Figma values → tokens. `css-auditor`: finds hard-coded values in CSS. | [SKILL.md](../../skills/scannlab-token-validation/SKILL.md) |
| `scannlab-code-connect` | Maps component variants to Figma Code Connect files and Dev Mode snippets. | [SKILL.md](../../skills/scannlab-code-connect/SKILL.md) |

### Meta Skills (Available at Library Level)

| Skill | Description | URL |
| ----- | ----------- | --- |
| `commit-writer` | Drafts detailed commit messages explaining what, why, and where. | [SKILL.md](../../skills/commit-writer/SKILL.md) |
| `pr-writer` | Drafts PR titles and descriptions in Spanish with full change context. | [SKILL.md](../../skills/pr-writer/SKILL.md) |
| `scannlab-run-commands` | Guide for running dev, Storybook, tests, lint, and build commands. | [SKILL.md](../../skills/scannlab-run-commands/SKILL.md) |

---

## Auto-invoke Skills

When performing these actions IN THIS LIBRARY, **invoke the skill FIRST before proceeding**:

| Action | Skill | Notes |
| ------ | ----- | ----- |
| Writing or reviewing component `.ts` code | `scannlab-best-practices` + `angular-20` | Signals, host bindings, `OnPush` |
| Writing or updating component `.css` | `css-modules` | Scoped CSS, `--s-*` token usage only |
| Creating or updating `.stories.ts` files | `scannlab-storybook` | All variant combinations required |
| Creating or updating `.spec.ts` files | `scannlab-unit-test` | ≥90% line coverage target |
| Auditing CSS for hard-coded values | `scannlab-token-validation` → agents/css-auditor | Before finalizing any styles |
| Extracting Figma specs | `scannlab-figma-extractor` | Always the first step |
| Matching Figma values to design tokens | `scannlab-token-validation` → `figma-matcher` | After `scannlab-figma-extractor` |
| Reviewing component accessibility | `scannlab-a11y-checker` | Before marking a component complete |
| Mapping component to Figma Code Connect | `scannlab-code-connect` | After component implementation is finalized |
| Writing commit messages | `commit-writer` | — |
| Writing pull request descriptions | `pr-writer` | — |
| Running any project command | `scannlab-run-commands` | — |

---

## Library-Level Workflows

### Figma to Code (Full Component)

Complete workflow for converting a Figma design into a production-ready Angular component. All steps are mandatory — invoke child orchestrator at Phase 2.

```text
scannlab-figma-extractor                          (Extract Figma specs — mandatory first step)
  → scannlab-token-validation/figma-matcher        (Map Figma values to --s-* tokens)
  → src/components/AGENTS.md                       (Delegate implementation to component orchestrator)
      → scannlab-best-practices + css-modules       (Component class + scoped CSS)
      → scannlab-unit-test                          (Tests ≥90% coverage)
      → scannlab-storybook                          (Stories — all variants)
      → scannlab-a11y-checker                       (WCAG 2.2 AA audit)
      → scannlab-token-validation/css-auditor       (Verify no hard-coded values)
  → scannlab-code-connect                           (Figma Code Connect mapping)
  → Public API export                               (src/components/public-api.ts + src/public-api.ts)
```

### Figma Component QA

Workflow for validating an existing component against its Figma spec.

```text
scannlab-figma-extractor                          (Extract current Figma specs)
  → scannlab-token-validation/figma-matcher        (Match design values to tokens)
  → scannlab-token-validation/css-auditor          (Verify token usage in component CSS)
```

### New Component (No Figma)

When no Figma spec exists — implementation-first workflow.

```text
scannlab-best-practices                            (Define component API, signals, host bindings)
  → css-modules                                    (Scoped CSS with --s-* tokens only)
  → scannlab-unit-test                             (Tests ≥90% coverage)
  → scannlab-storybook                             (Stories — all variants)
  → scannlab-a11y-checker                          (WCAG 2.2 AA audit)
  → scannlab-token-validation/css-auditor          (Verify no hard-coded values)
  → Public API export
```

---

## Public API Management

All components must be exported before any PR is merged. Export chain:

```text
src/components/{name}/public-api.ts       ← component-level barrel
  → src/components/public-api.ts          ← components barrel
    → src/public-api.ts                   ← library root barrel
```

**Rules:**

- Export only public-facing components, directives, services, and types
- Do NOT export internal utilities or `_internal/` folder contents
- Increment `version` in `ng-package.json` per SemVer on every public API change

---

## Critical Rules (Library Level)

For Angular/TypeScript patterns, naming conventions, and CSS specifics, see [`scannlab-best-practices`](../../skills/scannlab-best-practices/SKILL.md). The rules below are unique to this library scope.

### Quality Gates Before Any PR

| Gate | Requirement | Enforced By |
| ---- | ----------- | ----------- |
| CSS tokens | No hard-coded colors, spacing, or typography — only `--s-*` tokens | `scannlab-token-validation/css-auditor` |
| Test coverage | ≥90% line coverage per component class | `scannlab-unit-test` + `npm run test:coverage` |
| Accessibility | WCAG 2.2 AA — run before review | `scannlab-a11y-checker` |
| Stories | All primary variant combinations exported | `scannlab-storybook` |
| Public API | Component exported in barrel chain before PR | Public API Management above |
| Lint & types | Zero lint errors, zero TypeScript errors | `npm run lint && tsc --noEmit` |

### Global Asset Rules

- **`assets/styles/`** — Global CSS variables (`--s-*` tokens). Changes here affect all 25+ components. Always run `scannlab-token-validation/css-auditor` after modifying token values.
- **`assets/fontawesome/`** — Icon font files. Do not add new icon libraries without team approval.
- **`assets/images/`** — Library images. Use SVGs where possible; never embed base64 in CSS.

---

## Troubleshooting & Escalation

| Scenario | Action |
| -------- | ------ |
| New component needed | Delegate to [src/components/AGENTS.md](src/components/AGENTS.md) |
| Global token value needs changing | Modify `assets/styles/` → run `scannlab-token-validation/css-auditor` across all components |
| Storybook build fails | Check `.storybook/` config → run `npm run storybook` locally |
| Library build fails | Check `ng-package.json` and `src/public-api.ts` → escalate to root AGENTS.md |
| Component has no Figma mapping | Proceed with implementation-first workflow → create Code Connect after |
| Design token is missing | Run `scannlab-token-validation` → escalate missing token to design team via Figma |
| Accessibility conflicts with design intent | Document the conflict → escalate to a11y reviewer + design team |
| Cross-library breaking change | Escalate to root AGENTS.md → team review required |

---

## Commands

```bash
# Start Storybook (from repo root)
npm run storybook

# Run all library tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage

# Lint library code
npm run lint -- projects/scanntech-ui

# Type check
npm run type-check

# Build library for production
npm run build

# Generate new component scaffold
npx ng generate component projects/scanntech-ui/src/components/{component-name}
```
