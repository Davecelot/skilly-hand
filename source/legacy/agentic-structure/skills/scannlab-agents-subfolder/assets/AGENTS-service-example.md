# Services - AI Agent Ruleset

> **IMPORTANT:** This file only adds local rules for `projects/scanntech-ui/src/services/`. All library-wide and repository-wide patterns are inherited from parent AGENTS.md files. Do **not** repeat skill tables or global conventions here — reference parent files for full skill lists and cross-project rules.
>
> **Inheritance:** [Library AGENTS.md](../../AGENTS.md)
>
> **Scope**: `projects/scanntech-ui/src/services/` — Angular services, data access, and business logic shared across components
> **Tech Stack**: Angular 20.3.0+, TypeScript 5.9.2+, RxJS 7.8+, Vitest 3.2.4+
> **Primary Skills**: `scannlab-best-practices`, `scannlab-unit-test`
> **When to escalate to library AGENTS.md**: Service consumed by multiple domains, cross-library state, public API structure
> **Author**: ScannLab Design System Team
> **Last updated**: 24.03.2026

## Inherits From

- [Library AGENTS.md](../../AGENTS.md) — Library-level orchestrator for `projects/scanntech-ui/`
- [Root AGENTS.md](../../../AGENTS.md) — Repository-wide patterns, full skill registry

---

## Mandatory Reading

**BEFORE creating or modifying ANY service in this folder**, read these skills in order:

| Skill | Purpose |
| ----- | ------- |
| [`token-optimizer`](../../../../skills/token-optimizer/SKILL.md) | **Required for all AI/model interactions.** Classifies task complexity and optimizes token usage. |
| [`scannlab-best-practices`](../../../../skills/scannlab-best-practices/SKILL.md) | **Required for ALL service code.** Angular 20+ DI patterns, TypeScript conventions, signal-based state. |
| [`scannlab-unit-test`](../../../../skills/scannlab-unit-test/SKILL.md) | **Required for ALL `.spec.ts` files.** Vitest patterns for services, mocking, and Observable testing. |

---

## Available Skills (Services Scope)

### Core Service Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `scannlab-best-practices` | Angular 20+ DI patterns, TypeScript conventions, signals, and RxJS usage for services. | [SKILL.md](../../../../skills/scannlab-best-practices/SKILL.md) |
| `scannlab-unit-test` | Vitest patterns for Angular services, mocking dependencies, and testing Observable streams. | [SKILL.md](../../../../skills/scannlab-unit-test/SKILL.md) |

### Supporting Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `scannlab-a11y-checker` | Checks service output (dynamic content, alerts) for accessibility compliance. | [SKILL.md](../../../../skills/scannlab-a11y-checker/SKILL.md) |

---

## Auto-invoke Skills

When performing these actions IN THIS FOLDER, **invoke the skill FIRST before proceeding**:

| Action | Skill | Notes |
| ------ | ----- | ----- |
| Writing or reviewing service `.ts` code | `scannlab-best-practices` | DI patterns, signals, RxJS, `inject()` function |
| Creating or updating `.spec.ts` files | `scannlab-unit-test` | All service tests require this skill |

---

## Critical Rules (Services Only)

For Angular/TypeScript patterns shared across the library, see [library AGENTS.md](../../AGENTS.md). The rules below are unique to this folder.

### Dependency Injection

- **ALWAYS**: Use `inject()` function — never constructor injection
- **ALWAYS**: Declare `providedIn: 'root'` for singleton services
- **NEVER**: Register a service in `NgModule` providers — use `providedIn`
- **NEVER**: Store mutable state in a service unless it's a signal or BehaviorSubject

### RxJS & Observable Patterns

- **ALWAYS**: Return `Observable<T>`, not `Promise<T>` — keep the library consistent
- **ALWAYS**: Use strong typing for all Observable streams: `Observable<DataType[]>`
- **ALWAYS**: Handle errors with `catchError` — never let streams error silently
- **NEVER**: Use `subscribe()` inside a service — let consumers handle subscriptions
- **NEVER**: Expose subjects directly — expose only their `asObservable()` form

### Testing

- **ALWAYS**: Write tests for error scenarios and edge cases
- **ALWAYS**: Mock all external dependencies (HttpClient, other services)
- **NEVER**: Test implementation details — test observable emissions and side effects
- **NEVER**: Use real HTTP calls in unit tests — use `HttpClientTestingModule`

---

## Troubleshooting & Escalation

| Scenario | Action |
| -------- | ------ |
| Service is shared across multiple components | Confirm it belongs in `services/` — not in a component subfolder |
| Service needs component-level state | Use a signal-based approach, not a shared service |
| Service depends on a component | Invert the dependency — components should depend on services, not the reverse |
| Pattern applies beyond this folder | Escalate to [library AGENTS.md](../../AGENTS.md) |

---

## Commands

```bash
# Run service tests (filtered by folder)
npm run test -- src/services

# Run tests in watch mode
npm run test -- --watch

# Check test coverage
npm run test:coverage

# Lint services folder
npm run lint -- projects/scanntech-ui/src/services

# Type check
npm run type-check
```
