---
name: angular-20
description: >
  Base guidelines for writing Angular 20.3+ code, including signals, deferrable views, standalone components, and referencing official Angular sources for all implementation and review. Trigger: When writing or reviewing Angular component code.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.1.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Writing or reviewing Angular component code"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch
---

# Angular 20 Guide

## When to Use

**Use this skill when:**
- Creating a new Angular component, directive, or pipe.
- Refactoring older components to modern Angular (Signals, Standalone).
- Reviewing PRs touching `projects/scanntech-ui/src/components`.
- Implementing, reviewing, or refactoring Angular code using official Angular best practices.
- Mapping Figma/UX patterns to Angular primitives (Material/CDK/custom).

**Don't use this skill for:**
- Testing logic (use `vitest` skill instead).
- Styling conventions (use `css-modules` skill).
- Creating Storybook files (use `scannlab-storybook`).
- Pure design/UX theory (use `ds-researcher`).
- Non-Angular frontend code.

---

## Critical Patterns

- Standalone components by default (no NgModules for new code)
- Signals for state and input/output (use input(), output(), signal, computed)
- Zoneless change detection (avoid zone.js, use signals/effect)
- Prefer inject() over constructor DI
- Use new control flow syntax (@if, @for, @switch)
- Typed Reactive Forms (FormControl, FormGroup, FormArray)
- Prefer Angular Material/CDK for UI patterns
- Use @defer for lazy loading

---

## Decision Tree

| Scenario | Pattern |
|----------|--------|
| New Input needed? | Use `input()` or `input.required()` |
| Dynamic class? | Use `[attr.data-something]="signal()"` in `host: {}` |
| Iterating items? | Use `@for (item of items(); track item.id)` |
| Conditional render? | Use `@if (condition) {}` |
| Need side effects? | Use `effect(() => ...)` |

---

## Code Examples

### Standalone Component
```typescript
import { Component, input } from '@angular/core';
@Component({
  selector: 's-my-component',
  standalone: true,
  template: `<ng-content />`,
  styleUrls: ['./my-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 's-base-class',
  },
})
export class MyComponent {}
```

### Signal Inputs
```typescript
import { Component, input, effect } from '@angular/core';
export class MyComponent {
  public readonly size = input<'sm' | 'md' | 'lg'>('md');
  public readonly label = input.required<string>();
  constructor() {
    effect(() => {
      console.log('Size changed:', this.size());
    });
  }
}
```

### Host Binding
```typescript
@Component({
  selector: 'button[sButton]',
  template: `<ng-content />`,
  host: {
    class: 's-text-md',
    '[attr.data-size]': 'size()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '(click)': 'onClick($event)'
  }
})
export class Button {
  public size = input<'sm' | 'md'>('md');
  public disabled = input(false);
  onClick(event: Event) {
    if (this.disabled()) event.preventDefault();
  }
}
```

### Control Flow
```typescript
import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-names';
@Component({
  selector: 's-item-list',
  template: `
    @if (title(); as t) {
      <h2>{{ t }}</h2>
    }
    <ul>
      @for (item of items(); track item.id) {
        <li>
          <s-icon size="sm" [name]="item.icon"></s-icon>
          {{ item.name }}
        </li>
      } @empty {
        <li>No items found</li>
      }
    </ul>
  `,
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemList {
  public title = input<string>();
  public items = input.required<{id: string, name: string, icon: IconName}[]>();
}
```

---

## Review Checklist

- Standalone components (not NgModules) for new code?
- Signal-based inputs/outputs (input(), output()) instead of @Input/@Output?
- New control flow (@if, @for) instead of structural directives?
- Reactive state managed with signals + computed()?
- Uses inject() for DI instead of constructor injection?
- Typed FormControls?
- @defer used for lazy loading?
- No zone.js-dependent patterns?
- trackBy equivalent present in @for loops?
- Lifecycle hooks appropriate?
- No console.log left in production?
- HttpClient calls managed for memory leaks?

---

## Commands

- Use `ng generate component` for new standalone components.
- Use `ng add @angular/material` for Material/CDK setup.
- Use `ng test` for running tests (see vitest skill).

---

## Official Source Database

| Source | Focus Area | URL |
|--------|-----------|-----|
| angular.dev | Primary docs, guides, API reference, tutorials | https://angular.dev |
| angular.dev/api | Full API reference | https://angular.dev/api |
| angular.dev/guide | Guides (components, DI, forms, routing…) | https://angular.dev/guide |
| angular.dev/reference/migrations | Migration guides | https://angular.dev/reference/migrations |
| Angular Blog (blog.angular.dev) | Official release notes and RFCs | https://blog.angular.dev |
| Angular GitHub (github.com/angular/angular) | Source code, changelogs, issues | https://github.com/angular/angular |
| Angular Material (material.angular.io) | Component library and CDK | https://material.angular.io |

---

## API Stability Flags

| Status | Meaning | Flag |
|--------|---------|------|
| Stable | Production-ready, semver-protected | ✅ Stable |
| Developer Preview | Usable but API may change | 🔬 Developer Preview |
| Experimental | Early-stage, likely to change | ⚗️ Experimental |
| Deprecated | Will be removed in a future major | ⚠️ Deprecated |

---

## Quick Reference: Official Entry Points

Angular main docs:         https://angular.dev
Component guide:           https://angular.dev/guide/components
Signals guide:             https://angular.dev/guide/signals
Control flow guide:        https://angular.dev/guide/templates/control-flow
Defer guide:               https://angular.dev/guide/defer
DI guide:                  https://angular.dev/guide/di
Routing guide:             https://angular.dev/guide/routing
Forms guide:               https://angular.dev/guide/forms
HTTP guide:                https://angular.dev/guide/http
Zoneless guide:            https://angular.dev/guide/zoneless
Testing guide:             https://angular.dev/guide/testing
Migrations reference:      https://angular.dev/reference/migrations
Full API reference:        https://angular.dev/api
Angular Material:          https://material.angular.io/components
Angular CDK:               https://material.angular.io/cdk
Angular Blog:              https://blog.angular.dev
Angular GitHub releases:   https://github.com/angular/angular/releases

---

## References
- **scannlab-best-practices**: See broader repo guidelines.
- **vitest**: See testing guidelines for components.
- **css-modules**: See styling guidelines for components.
