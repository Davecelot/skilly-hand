# Angular Component Creator

## When to Use

Use this sub-agent when:

- Creating a new Angular component.
- Refactoring an existing Angular component to modern patterns.
- Reviewing component implementation details and template patterns.

Do not use this sub-agent for:

- Directive, pipe, or service implementation.
- Repository-wide architecture decisions.
- Test-only tasks (use `angular-tester`).

---

## Core Rules

- Keep explicit `standalone: true` in generated component metadata.
- Use signal APIs for component IO and state (`input`, `output`, `signal`, `computed`).
- Use native template control flow blocks (`@if`, `@for`, `@switch`).
- Prefer `host` object bindings/events over decorator-based host metadata.
- Use OnPush-friendly reactive patterns and avoid zone-dependent assumptions.
- For interactive components, include keyboard and ARIA semantics in host bindings.

---

## Template Snippets

### Minimal Standalone Component

```typescript
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-example",
  standalone: true,
  template: `<p>Example works</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {}
```

### Signal Inputs and Outputs

```typescript
import { Component, input, output, computed } from "@angular/core";

@Component({
  selector: "app-counter",
  standalone: true,
  template: `<button (click)="increment.emit()">{{ label() }} {{ count() }}</button>`
})
export class CounterComponent {
  readonly label = input.required<string>();
  readonly count = input(0);
  readonly increment = output<void>();
  readonly isNonZero = computed(() => this.count() > 0);
}
```

### Host Bindings and Events

```typescript
@Component({
  selector: "button[appActionButton]",
  standalone: true,
  template: `<ng-content />`,
  host: {
    "role": "button",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "[class.is-disabled]": "disabled()",
    "(click)": "onClick($event)",
    "(keydown.enter)": "onClick($event)"
  }
})
export class ActionButtonComponent {
  readonly disabled = input(false);
  readonly pressed = output<void>();

  onClick(event: Event) {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.pressed.emit();
  }
}
```

### Content Projection and Render-Safe Hooks

```typescript
import { Component, afterNextRender } from "@angular/core";

@Component({
  selector: "app-card",
  standalone: true,
  template: `
    <header><ng-content select="[card-header]" /></header>
    <section><ng-content /></section>
    <footer><ng-content select="[card-footer]" /></footer>
  `
})
export class CardComponent {
  constructor() {
    afterNextRender(() => {
      // Run post-render DOM logic only when needed.
    });
  }
}
```

---

## Review Checklist

- Component metadata includes explicit `standalone: true`.
- Inputs/outputs use modern signal-based APIs where applicable.
- Templates use native control flow blocks, not legacy structural directives.
- Host interaction includes required ARIA and keyboard semantics for interactive UI.
- Change detection and state flow are OnPush-friendly and predictable.
