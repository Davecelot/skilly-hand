---
name: "angular-guidelines"
description: "Guide Angular code generation, review, and performance tuning using latest stable Angular verification, official Angular skill guidance, and modern framework best practices. Trigger: generating, reviewing, refactoring, or optimizing Angular code artifacts in Angular projects."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-05-01"
  license: "Apache-2.0"
  version: "1.2.0"
  changelog: "Added curated official Angular skill and performance guidance with a dedicated performance-reviewer mode; improves SSR, hydration, reactivity, testing, and runtime optimization coverage; affects angular-guidelines routing, review checklists, and catalog discovery"
  auto-invoke: "Generating, reviewing, refactoring, or optimizing Angular code artifacts in Angular projects"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "WebFetch"
    - "WebSearch"
    - "Task"
    - "SubAgent"
---
# Angular Guidelines

## When to Use

Use this skill when:

- You are generating Angular components, directives, pipes, services, or supporting files.
- You are refactoring existing Angular code to current framework patterns.
- You are reviewing Angular code quality and framework-alignment in an Angular workspace.
- You are optimizing Angular performance, SSR/hydration, reactivity/data flow, forms, routing, accessibility, or CLI-aligned generation.

Do not use this skill for:

- Non-Angular frontend stacks (React, Vue, Svelte, or framework-agnostic UI tasks).
- Deep architecture decisions outside code artifact generation/review scope.
- Pure test-strategy design unrelated to Angular implementation details.

---

## Routing Map

Choose sub-agents by intent:

| Intent | Sub-agent |
| --- | --- |
| Create, refactor, or review Angular components | [agents/component-creator.md](agents/component-creator.md) |
| Write or review Angular tests | [agents/angular-tester.md](agents/angular-tester.md) |
| Optimize or review Angular performance, SSR, or hydration | [agents/performance-reviewer.md](agents/performance-reviewer.md) |

---

## Standard Execution Sequence

1. Run latest stable Angular preflight checks.
2. Route to the smallest matching sub-agent by task intent.
3. If the request mentions performance, SSR, hydration, routing, data fetching, bundle size, change detection, or zoneless behavior, include the performance priority checklist.
4. Apply the sub-agent checklist before finalizing generated code or review output.

---

## Critical Patterns

### Pattern 1: Latest Stable Angular Preflight (Mandatory)

Before generating or changing Angular code:

1. Check the latest stable Angular core release:
   `npm view @angular/core version`
2. Check the project's installed or declared Angular version:
   `npm ls @angular/core` or inspect `package.json`.
3. If versions diverge, generate content for the latest stable APIs and call out upgrade steps.
4. If npm metadata is unavailable, verify against official Angular release sources before proceeding.

Never hardcode a specific Angular major as the default baseline.

### Pattern 2: Modern Angular Defaults for New Code

Use these defaults unless project constraints explicitly prevent them:

| Area | Default |
| --- | --- |
| Component model | Standalone-first (`standalone: true`) |
| State + bindings | Signals (`signal`, `computed`, `input`, `output`) |
| Template flow | `@if`, `@for`, `@switch` control flow blocks |
| Dependency injection | `inject()` over constructor injection for new code |
| Forms | Typed reactive forms |
| Rendering strategy | OnPush-friendly patterns and deferred/lazy rendering where appropriate |

### Pattern 3: Modern Reactivity Guardrails

- Use `computed` for derived state rather than duplicating or propagating state manually.
- Avoid `effect` for state propagation; reserve it for logging, browser storage sync, non-template DOM work, canvas/chart integrations, or other non-reactive APIs.
- Use `resource` for async signal-based data when the project Angular version supports it and it fits existing data patterns.
- Use `linkedSignal` for dependent writable state when the project Angular version supports it.
- Read signals before `await` inside reactive contexts so dependencies are tracked synchronously.

### Pattern 4: Performance Review Priority

Use this official-Angular-aligned priority order for performance review. Measure first when possible, then choose the smallest applicable optimization.

| Priority | Review Focus | Default Action |
| --- | --- | --- |
| 1 | Measurement | Use Angular DevTools or Chrome DevTools Angular profiling to identify specific load, change detection, or rendering bottlenecks. |
| 2 | Loading performance | Prefer lazy routes, `@defer` for non-critical/heavy UI, image optimization, and SSR/hydration where they improve Core Web Vitals. |
| 3 | Runtime performance | Check zoneless change detection support, slow template/lifecycle computations, OnPush-friendly state, and zone pollution from timers or third-party code. |
| 4 | SSR/hydration correctness | Avoid server/client template divergence, prefer platform-specific providers, keep per-request state out of shared providers, and use factory providers for request-specific values. |
| 5 | Advanced loading | Use incremental hydration and advanced deferrable-view strategies only when the project version and UX constraints justify them. |

### Pattern 5: Generation and Review Guardrails

- Keep generated files focused and minimal for the requested artifact.
- Prefer framework-native patterns over custom abstractions unless required by repo conventions.
- Call out deprecated patterns in reviewed code and suggest modern Angular replacements.
- For component-specific work, apply [agents/component-creator.md](agents/component-creator.md).
- For testing-specific work, apply [agents/angular-tester.md](agents/angular-tester.md).
- For performance-specific work, apply [agents/performance-reviewer.md](agents/performance-reviewer.md).

---

## Decision Tree

```text
Is this an Angular project (angular.json or @angular/core present)?
  NO  -> Do not apply this skill
  YES -> Continue

Is this a create/generate task?
  YES -> Run latest stable preflight, then generate with modern defaults
  NO  -> Continue

Is this a refactor task?
  YES -> Preserve behavior, migrate incrementally to modern Angular patterns
  NO  -> Continue

Is this a review task?
  YES -> Validate latest-stable alignment + best-practice/performance checklist
  NO  -> Apply the minimal Angular guidance needed for the request

Does the task mention performance, SSR, hydration, routing, data fetching, bundles, change detection, or zoneless behavior?
  YES -> Route through performance-reviewer before finalizing
  NO  -> Keep the existing component/test route
```

---

## Code Examples

### Example 1: Standalone + Signals Component

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";

@Component({
  selector: "app-badge",
  standalone: true,
  template: `
    <span [attr.data-tone]="tone()">{{ label() }}</span>
    @if (showCount()) {
      <small>{{ count() }}</small>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly count = input(0);
  readonly increment = output<void>();
  readonly showCount = computed(() => this.count() > 0);
}
```

### Example 2: Service with `inject()`

```typescript
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class ProfileService {
  private readonly http = inject(HttpClient);

  getProfile() {
    return this.http.get("/api/profile");
  }
}
```

---

## Review Checklist

- Latest stable Angular preflight was completed before code generation/refactor.
- New artifacts use standalone-first + signal-first patterns where applicable.
- Template control flow uses modern block syntax.
- DI and forms follow modern typed Angular practices.
- Output avoids deprecated Angular APIs unless needed for compatibility.
- Performance work follows measurement-first guidance and avoids speculative optimization.

---

## Commands

```bash
# Latest stable Angular version
npm view @angular/core version

# Workspace Angular version
npm ls @angular/core

# Create a standalone component
ng generate component <name> --standalone

# Apply Angular framework updates in a workspace
ng update @angular/core @angular/cli
```

---

## Resources

- Angular docs: https://angular.dev
- Angular API reference: https://angular.dev/api
- Angular update guide: https://angular.dev/update-guide
- Angular blog (official releases): https://blog.angular.dev
- Angular GitHub releases: https://github.com/angular/angular/releases
- Angular Agent Skills: https://angular.dev/ai/agent-skills
- Official Angular skills repo: https://github.com/angular/skills
- Angular style guide: https://angular.dev/style-guide
- Angular performance guide: https://angular.dev/best-practices/performance
- Angular signals guide: https://angular.dev/guide/signals
- Angular testing guide: https://angular.dev/guide/testing
- Angular HTTP testing guide: https://angular.dev/guide/http/testing
