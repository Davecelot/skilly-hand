---
name: scannlab-best-practices
description: >
  Angular and TypeScript coding best practices for ScannLab Design System components.
  Trigger: When writing, reviewing, or refactoring Angular component code.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [ui]
  auto-invoke: "Writing or reviewing Angular component code"
allowed-tools: Read, Edit, Write, Grep, Task
---

# ScannLab Best Practices Guide

## When to Use

**Use this skill when:**

- Writing new Angular components, directives, or services for ScannLab.
- Reviewing or refactoring existing ScannLab component code.
- You need a quick reference for Angular/TypeScript conventions used across the project.

**Don't use this skill for:**

- Writing Storybook stories (use `scannlab-storybook` instead).
- Writing unit tests (use `scannlab-unit-test` instead).
- Non-Angular code (scripts, configs, CI/CD).

---

## Critical Patterns

### Pattern 1: TypeScript Strictness

```typescript
// ✅ DO — strict types, inference where obvious
const count = 0;                         // inferred as number
function getUser(id: string): User { … } // explicit return type

// ❌ DON'T — avoid `any`
function parse(data: any) { … }          // use `unknown` instead
```

### Pattern 2: Component Architecture

> **Note**: For all component-level modern Angular APIs (like `standalone`, `input()`, `host {}`), ALWAYS follow the [`angular-20`](../angular-20/SKILL.md) skill. It is the single source of truth for component structure.

```typescript
// ✅ DO — use modern control flow and signals inside your code
export class SlButtonComponent {
  label = input.required<string>(); // Use signals instead of @Input
}
```

### Pattern 3: Service Injection with inject()

Always use the `inject()` function for dependency injection, never constructor injection. This keeps components and services lightweight and maximizes tree-shaking.

```typescript
// ✅ DO — inject() function for all dependencies
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  getUser(id: string) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

// Router example
export class ProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
}

// ❌ DON'T — constructor injection
export class UserService {
  constructor(
    private http: HttpClient,    // Verbose, harder to tree-shake
    private config: AppConfig
  ) { }
}
```

### Pattern 4: Derived State with computed()

```typescript
// ✅ DO
readonly isActive = computed(() => this.status() === 'active');

// ❌ DON'T — never use mutate on signals
this.items.mutate(arr => arr.push(item)); // use update() or set()
```



## Decision Tree

```
Need local state?              → signal()
Need derived/computed value?   → computed()
Need to react to signal?       → effect() (sparingly)
Complex form?                  → Reactive forms (never template-driven)
Static image?                  → NgOptimizedImage (except inline base64)
Singleton service?             → providedIn: 'root'
Injecting a dependency?        → inject() function (never constructor injection)
```

---

## Code Examples

### Example 1: Minimal Component

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'sl-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="sl-tag" [class.sl-tag--removable]="removable()">
      {{ label() }}
      @if (removable()) {
        <button (click)="removed.emit()">×</button>
      }
    </span>
  `,
})
export class SlTagComponent {
  label = input.required<string>();
  removable = input(false);
  removed = output<void>();
}
```

### Example 2: Service with inject()

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly http = inject(HttpClient);

  loadTheme(name: string) {
    return this.http.get<Theme>(`/api/themes/${name}`);
  }
}
```

---

## Resources

- **Source prompt**: See [best-practices.prompt.md](../../docs/best-practices.prompt.md) for the original prompt this skill was derived from.
