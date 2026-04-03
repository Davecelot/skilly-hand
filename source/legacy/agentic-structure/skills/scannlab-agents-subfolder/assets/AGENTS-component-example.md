# Components - AI Agent Ruleset

> **IMPORTANT:** This file only adds local rules for `projects/scanntech-ui/src/components/`. All library-wide and repository-wide patterns are inherited from parent AGENTS.md files. Do **not** repeat skill tables or global conventions here — reference parent files for full skill lists and cross-project rules.
>
> **Inheritance:** [Library AGENTS.md](../../AGENTS.md)
>
> **Scope**: `projects/scanntech-ui/src/components/` — Individual UI component creation and iteration
> **Tech Stack**: Angular 20.3.0+, TypeScript 5.9.2+, CSS Modules, Vitest 3.2.4+, Storybook 9.1.13+
> **Primary Skills**: `scannlab-best-practices`, `scannlab-storybook`, `scannlab-unit-test`
> **When to escalate to library AGENTS.md**: Library-wide patterns, cross-component services, public API structure
> **Author**: ScannLab Design System Team
> **Last updated**: 24.03.2026

## Inherits From

- [Library AGENTS.md](../../AGENTS.md) — Library-level orchestrator for `projects/scanntech-ui/`
- [Root AGENTS.md](../../../AGENTS.md) — Repository-wide patterns, full skill registry

---

## Mandatory Reading

**BEFORE creating or modifying ANY component in this folder**, read these skills in order:

| Skill | Purpose |
| ----- | ------- |
| [`token-optimizer`](../../../../skills/token-optimizer/SKILL.md) | **Required for all AI/model interactions.** Classifies task complexity and optimizes token usage. |
| [`scannlab-best-practices`](../../../../skills/scannlab-best-practices/SKILL.md) | **Required for ANY component code.** Angular 20+ patterns, TypeScript conventions, CSS Modules, signals, accessibility baseline. |
| [`scannlab-storybook`](../../../../skills/scannlab-storybook/SKILL.md) | **Required for ALL `.stories.ts` files.** Storybook story generation patterns with variants and controls. |
| [`scannlab-unit-test`](../../../../skills/scannlab-unit-test/SKILL.md) | **Required for ALL `.spec.ts` files.** Vitest patterns for components, fixtures, mocks, integration tests. |

---

## Orchestrator Role

This AGENTS.md is the **component director** for all work inside `src/components/`. When receiving a task in this folder:

1. **Classify** the task using `token-optimizer`
2. **Route** to the correct skill chain using the table below
3. **Invoke skills in order** — earlier skills are prerequisites for later ones
4. **Never skip steps** — each gate ensures quality before the next phase

### Task → Skill Routing Table

| Task | Skill Chain (in order) |
| ---- | ---------------------- |
| Create a new component from Figma | `scannlab-figma-extractor` → `scannlab-token-validation/figma-matcher` → `scannlab-best-practices` → `css-modules` → `scannlab-unit-test` → `scannlab-storybook` → `scannlab-a11y-checker` → `scannlab-token-validation/css-auditor` |
| Create a new component (no Figma) | `scannlab-best-practices` → `css-modules` → `scannlab-unit-test` → `scannlab-storybook` → `scannlab-a11y-checker` → `scannlab-token-validation/css-auditor` |
| Iterate on an existing component | `scannlab-best-practices` → `scannlab-unit-test` → `scannlab-storybook` |
| Audit component CSS for hard-coded values | `scannlab-token-validation/css-auditor` |
| Review component accessibility | `scannlab-a11y-checker` |
| Map component to Figma Code Connect | `scannlab-code-connect` |
| Write or update `.stories.ts` | `scannlab-storybook` |
| Write or update `.spec.ts` | `scannlab-unit-test` |

---

## Available Skills (Components Scope)

### Core Component Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `scannlab-best-practices` | Angular 20+ component patterns, TypeScript, CSS Modules, signals, reactive forms, accessibility. | [SKILL.md](../../../../skills/scannlab-best-practices/SKILL.md) |
| `scannlab-storybook` | Generates Storybook stories (.stories.ts) with variants, controls, and design system integration. | [SKILL.md](../../../../skills/scannlab-storybook/SKILL.md) |
| `scannlab-unit-test` | Vitest patterns for components, directives, mocks, and integration tests. | [SKILL.md](../../../../skills/scannlab-unit-test/SKILL.md) |

### Supporting Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `scannlab-token-validation` | Finds hard-coded values in component CSS and guides replacements with ScannLab design tokens. Also matches Figma values to tokens. | [SKILL.md](../../../../skills/scannlab-token-validation/SKILL.md) |
| `scannlab-a11y-checker` | Checks components against W3C WCAG 2.2 accessibility standards and provides remediation guidance. | [SKILL.md](../../../../skills/scannlab-a11y-checker/SKILL.md) |
| `scannlab-figma-extractor` | Extracts layer/node specs from Figma links. **Prerequisite** for all Figma tasks. | [SKILL.md](../../../../skills/scannlab-figma-extractor/SKILL.md) |
| `scannlab-code-connect` | Maps component exports to Figma Code Connect and Dev Mode integration. | [SKILL.md](../../../../skills/scannlab-code-connect/SKILL.md) |

---

## Auto-invoke Skills

When performing these actions IN THIS FOLDER, **invoke the skill FIRST before proceeding**:

| Action | Skill | Notes |
| ------ | ----- | ----- |
| Writing or reviewing component `.ts` code | `scannlab-best-practices` | Component class, interfaces, signals, lifecycle |
| Creating or updating `.stories.ts` files | `scannlab-storybook` | All component stories require this skill |
| Creating or updating `.spec.ts` files | `scannlab-unit-test` | All component tests require this skill |
| Auditing component CSS for hard-coded values | `scannlab-token-validation` → agents/css-auditor | Before finalizing any component styles |
| Reviewing component accessibility | `scannlab-a11y-checker` | Before marking component as complete |
| Mapping component to Figma Code Connect | `scannlab-code-connect` | After component design is finalized |
| Extracting new component from Figma | `scannlab-figma-extractor` | Extract token values at source |

---

## Component Creation Workflow

Standard orchestration for component work in this folder. Each phase must complete before the next begins.

### Phase 1: Design → Extraction (One-time)

1. Review Figma component spec and extract design tokens using `scannlab-figma-extractor`
2. Match Figma values to `--s-*` tokens using `scannlab-token-validation/figma-matcher`
3. Identify component responsibilities and input/output shapes

### Phase 2: Implementation (Core Development)

1. Write component class using `scannlab-best-practices` — define `input()`, `output()` signals, host bindings, style encapsulation
2. Write scoped CSS using `css-modules` — `--s-*` tokens only, no hard-coded values
3. Run linter and type checker — `npm run lint && tsc --noEmit`
4. Write unit & integration tests using `scannlab-unit-test` — aim for ≥90% line coverage

### Phase 3: Documentation & Delivery (Finalization)

1. Generate Storybook stories using `scannlab-storybook` — all variants and interactive controls
2. Run accessibility audit using `scannlab-a11y-checker` — WCAG 2.2 AA minimum
3. Verify CSS token compliance using `scannlab-token-validation/css-auditor` — zero hard-coded values
4. Map to Figma using `scannlab-code-connect` — update Code Connect and Dev Mode snippets
5. Export in `public-api.ts` and verify in library build

---

## Critical Rules (Components Only)

For Angular/TypeScript patterns and CSS token conventions, see [library AGENTS.md](../../AGENTS.md). The rules below are unique to this folder.

### Quality Gates Before Any PR

| Gate | Requirement | Enforced By |
| ---- | ----------- | ----------- |
| CSS tokens | No hard-coded colors, spacing, or typography — only `--s-*` tokens | `scannlab-token-validation/css-auditor` |
| Test coverage | ≥90% line coverage per component class | `scannlab-unit-test` + `npm run test:coverage` |
| Accessibility | WCAG 2.2 AA — run before review | `scannlab-a11y-checker` |
| Stories | All primary variant combinations exported | `scannlab-storybook` |
| Public API | Component exported in barrel chain before PR | `src/components/public-api.ts` |

### Component Patterns

- **ALWAYS**: Use **`input()`/`output()` signals** — never use `@Input()` / `@Output()` decorators
- **NEVER** explicitly set `standalone: true` — it's the default in this project
- **ALWAYS**: Use **`OnPush` change detection** — maximize performance
- **ALWAYS**: Use **`host` object** for host bindings — never use `@HostBinding()` or `@HostListener()` decorators
- **ALWAYS**: Use **`viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()` signals** — never use deprecated decorators
- **CSS Modules only** — never global CSS in component folder
- **Semantic HTML** — always use proper elements (`<button>`, `<input>`, `<label>`, etc.)

---

## Troubleshooting & Escalation

| Scenario | Action |
| -------- | ------ |
| Component needs a service or utility | Create in `projects/scanntech-ui/src/services/` or `utils/`, not in component folder |
| Multiple components share internal logic | Extract to shared `_internal/` subfolder or create a directive |
| Component doesn't fit any existing pattern | Read library AGENTS.md → escalate design decision to team |
| Design token is missing | Run `scannlab-token-validation` → escalate missing token to design team via Figma |
| Accessibility rule conflicts with design intent | Document the conflict → escalate to a11y reviewer + design team |
| Pattern applies beyond this folder | Escalate to [library AGENTS.md](../../AGENTS.md) |

---

## Commands

```bash
# Lint all components
npm run lint

# Run component tests (filtered)
npm run test -- src/components/button

# Run tests in watch mode
npm run test -- --watch

# Check test coverage
npm run test:coverage

# Build library for production
npm run build

# Generate Storybook locally (from workspace root)
npm run storybook
```
