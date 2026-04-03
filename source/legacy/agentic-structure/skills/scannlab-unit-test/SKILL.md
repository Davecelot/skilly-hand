---
name: scannlab-unit-test
description: >
  Unit and integration testing for Angular components, directives, and services using Vitest.
  Covers TestBed setup, zoneless change detection, signal bindings, and behavioral testing patterns.
  Single source of truth for modern Angular testing with modern change detection and signals.
  Trigger: When creating, updating, or reviewing unit tests for Angular code.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "2.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [ui]
  auto-invoke: "Creating or updating unit tests"
allowed-tools: Read, Edit, Write, Grep, Bash, Task
---

# ScannLab Unit Testing Guide

## When to Use

**Use this skill when:**

- Writing or updating `.spec.ts` files for Angular components, directives, services, or pure TypeScript functions.
- Setting up `TestBed` for standalone components with zoneless change detection.
- Testing components with signal inputs and outputs (modern Angular patterns).
- Increasing test coverage (target ≥ 90% line coverage).
- Reviewing tests for completeness (happy path, edge cases, error handling).

**Don't use this skill for:**

- End-to-End or UI testing via external browsers (Playwright/Cypress).
- Modifying production code (tests only — never touch `.component.ts`, `.directive.ts`, etc.).
- Authoring Storybook files (use `scannlab-storybook` instead).
- General Angular best practices (use `scannlab-best-practices` instead).

---

## Critical Patterns

ScannLab uses Vitest as a drop-in replacement for Karma/Jasmine with Angular's modern **zoneless change detection**. Standard Angular testing utilities (`TestBed`) work the same way, but assumptions about change detection have shifted.

### Pattern 1: Zoneless Change Detection (Always Required)

Import and use `provideZonelessChangeDetection` in every `TestBed.configureTestingModule()`. Never rely on `fakeAsync` or generic `fixture.whenStable()` without ensuring zoneless compatibility.

```typescript
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

const fixture = TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()],
}).createComponent(MyComponent);
```

### Pattern 2: Component Input Bindings with Signals

When testing components that use `input()` signals, pass dynamic data using `bindings` and `inputBinding`. This enables reactive testing without manual property assignment.

```typescript
import { inputBinding, signal } from '@angular/core';

it('should update inputs dynamically', () => {
    // Given
    const level = signal('filled');
    const size = signal('md');

    // When
    const fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(Button, {
      bindings: [
        inputBinding('level', level),
        inputBinding('size', size),
      ],
    });

    fixture.detectChanges();

    // Then
    const btn = fixture.nativeElement as Element;
    expect(btn.getAttribute('data-level')).toBe('filled');
    
    // When updating signals and detecting changes again
    level.set('link');
    fixture.detectChanges();
    expect(btn.getAttribute('data-level')).toBe('link');
});
```

### Pattern 3: Directives — Always Use a Host Component

Directives cannot use `createComponent` directly. Always create a test host component. The test host component is implicitly standalone when using `imports[]` — never explicitly set `standalone: true` since it's the default.

```typescript
@Component({
  template: '<div [myDirective]="value()">Test</div>',
  imports: [MyDirective],
  // ✅ Implicit standalone (imports[] makes it standalone)
  // ❌ DON'T add standalone: true — it's redundant
})
class TestHostComponent {
  public readonly value = signal<string>('test');
}

it('should apply directive styles', () => {
  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();
  
  const element = fixture.nativeElement.querySelector('div');
  expect(element.className).toContain('directive-applied');
});
```

### Pattern 4: Given-When-Then Structure (Mandatory)

Every `it()` block must have explicit `// Given`, `// When`, `// Then` comments. This makes tests self-documenting and easy to review.

```typescript
it('should apply active class when status is active', () => {
  // Given
  const status = signal('active');
  const fixture = TestBed.createComponent(MyComponent, {
    bindings: [inputBinding('status', status)],
  });

  // When
  fixture.detectChanges();

  // Then
  expect(fixture.nativeElement.className).toContain('is-active');
});
```

### Pattern 5: Reactivity Testing — Signal Changes

Test that signal changes propagate correctly through change detection:

```typescript
it('should update class when status changes', () => {
  // Given
  const status = signal('inactive');
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(MyComponent, {
    bindings: [inputBinding('status', status)],
  });
  fixture.detectChanges();

  // When
  status.set('active');
  fixture.detectChanges();

  // Then
  expect(fixture.nativeElement.className).toContain('is-active');
});
```

### Pattern 6: CSS Class Assertions — Use toContain()

Always use `toContain()` for class assertions to avoid brittle tests that break if class order changes:

```typescript
// ✅ DO — flexible, order-independent
expect(element.className).toContain('class1');
expect(element.className).toContain('class2');

// ❌ DON'T — brittle, breaks if class order changes
expect(element.className).toBe('class1 class2');
```

### Pattern 7: Loop Tests — Reset TestBed Each Iteration

When looping over test values, reset `TestBed` between iterations to avoid shared state:

```typescript
it('should accept all valid sizes', () => {
  VALID_SIZES.forEach(size => {
    TestBed.resetTestingModule(); // MANDATORY between iterations
    const sizeSignal = signal(size);
    const fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(MyComponent, {
      bindings: [inputBinding('size', sizeSignal)],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.className).toContain(`size-${size}`);
  });
});
```

### Pattern 8: Service Testing with Mocking

Use `TestBed.inject()` for services and `vi.fn()` for mocking dependencies:

```typescript
it('should call API service when loaded', () => {
  // Given
  const mockService = {
    fetchData: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
  };
  const fixture = TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      { provide: DataService, useValue: mockService },
    ],
  }).createComponent(MyComponent);

  // When
  fixture.detectChanges();

  // Then
  expect(mockService.fetchData).toHaveBeenCalled();
});
```

### Pattern 9: Standard Assertions

Continue to use native Vitest/Jest style matchers:

```typescript
// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Equality
expect(value).toEqual(expected);       // deep equality
expect(value).toBe(expected);          // strict equality (===)

// Errors
expect(() => actionThatThrows()).toThrow();
expect(() => actionThatThrows()).toThrow(CustomError);

// Collections
expect(array).toContain('item');
expect(object).toHaveProperty('key');
expect(string).toContain('substring');

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(3);
```

---

## Decision Tree

```
Testing pure functions?              → describe → it → simple assertions
Testing a component?                 → TestBed + provideZonelessChangeDetection
Testing a directive?                 → Create host component first (Pattern 3)
Testing a service?                   → TestBed.inject() + mock dependencies
Testing component with inputs?       → Use inputBinding + signal() (Pattern 2)
Testing signal reactivity?           → signal.set() + fixture.detectChanges() (Pattern 5)
Asserting CSS classes?               → toContain(), never toBe() (Pattern 6)
Looping over test values?            → TestBed.resetTestingModule() per iteration (Pattern 7)
Component hasn't been compiled?      → Create host component (Pattern 3, Directive)
Cannot configure test module?        → Call TestBed.resetTestingModule() (Pattern 7)
Inconsistent CSS class order?        → Use toContain() instead of toBe() (Pattern 6)
```

---

## Code Examples

### Example 1: Pure Function Tests

```typescript
import { getLevelsForVariant } from './button';

describe('getLevelsForVariant', () => {
  it('should return correct levels for tertiary variant', () => {
    // Given
    const variant = 'tertiary';
    
    // When
    const result = getLevelsForVariant(variant);
    
    // Then
    expect(result).toEqual(['filled', 'link']);
  });
});
```

### Example 2: Component with Input Signals

```typescript
import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'sl-button',
  template: '<button [attr.data-variant]="variant()">{{ label() }}</button>',
})
class SlButtonComponent {
  public readonly variant = input<'primary' | 'secondary'>('primary');
  public readonly label = input<string>('Click me');
}

describe('SlButtonComponent', () => {
  it('should render with primary variant by default', () => {
    // Given
    const fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(SlButtonComponent);

    // When
    fixture.detectChanges();

    // Then
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('data-variant')).toBe('primary');
  });

  it('should update variant when input signal changes', () => {
    // Given
    const variant = signal<'primary' | 'secondary'>('primary');
    const fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(SlButtonComponent, {
      bindings: [inputBinding('variant', variant)],
    });
    fixture.detectChanges();

    // When
    variant.set('secondary');
    fixture.detectChanges();

    // Then
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('data-variant')).toBe('secondary');
  });
});
```

### Example 3: Directive Testing with Host Component

```typescript
import { Directive, input } from '@angular/core';

@Directive({
  selector: '[slHighlight]',
  host: { '[class.highlighted]': 'isActive()' },
})
class SlHighlightDirective {
  public readonly isActive = input<boolean>(false);
}

@Component({
  template: '<div [slHighlight]="active()" class="content">Text</div>',
  imports: [SlHighlightDirective],
})
class TestHostComponent {
  public readonly active = signal(false);
}

describe('SlHighlightDirective', () => {
  it('should add highlighted class when active', () => {
    // Given
    const active = signal(false);
    const fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(TestHostComponent);
    fixture.detectChanges();

    // When
    active.set(true);
    fixture.detectChanges();

    // Then
    const content = fixture.nativeElement.querySelector('.content');
    expect(content.className).toContain('highlighted');
  });
});
```

### Example 4: Service Testing

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
class UserService {
  constructor(private http: HttpClient) {}
  
  public getUser(id: string) {
    return this.http.get(`/api/users/${id}`);
  }
}

describe('UserService', () => {
  it('should fetch user by id', () => {
    // Given
    const mockHttp = { get: vi.fn().mockReturnValue(of({ id: '1', name: 'John' })) };
    const service = TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: HttpClient, useValue: mockHttp },
      ],
    }).inject(UserService);

    // When
    service.getUser('1').subscribe(user => {
      // Then
      expect(user.name).toBe('John');
    });
  });
});
```

---

## Coverage Requirements

- **Target**: ≥ 90% line coverage per class.
- **Scope**: 
  - Happy path: normal, expected behavior.
  - Edge cases: `null`, `undefined`, empty arrays, blank strings.
  - Error handling: exceptions and failure scenarios.
  - Reactivity: input changes, output emissions.

- **Verification**: Run tests → check coverage → add missing cases → repeat until ≥ 90%.

---

## Naming & Organization

```typescript
describe('SlButtonComponent', () => {
  describe('rendering', () => {
    it('should render label when provided', () => { … });
    it('should apply disabled class when disabled is true', () => { … });
  });

  describe('interactions', () => {
    it('should emit clicked when button is pressed', () => { … });
    it('should not emit clicked when disabled', () => { … });
  });

  describe('accessibility', () => {
    it('should have role=button', () => { … });
    it('should be keyboard navigable', () => { … });
  });
});
```

**Rules**:
- All test names in **English**.
- `describe` → class/component name, then method/context.
- `it` → `'should [result] when [condition]'`.
- **No `any` types** — always typed, prefer inference.
- Organize logically: rendering → interactions → accessibility → edge cases.

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Component has not been compiled` | Using `createComponent` with a directive | Create a host component (Pattern 3) |
| `Cannot configure test module` | Reusing TestBed in a loop without reset | Call `TestBed.resetTestingModule()` (Pattern 7) |
| `Angular requires Zone.js` | Missing zoneless provider | Add `provideZonelessChangeDetection()` (Pattern 1) |
| `Inconsistent CSS class order` | Using `toBe()` for class assertions | Use `toContain()` instead (Pattern 6) |
| `describe is not defined` | Vitest globals not enabled | Set `globals: true` in `vitest.config.ts` |
| `Cannot find module '@angular/core'` | Missing Angular dependencies | Check `package.json` and run `npm install` |
| `Fixture is undefined` | `createComponent` failed silently | Check `configureTestingModule` for syntax errors |
| `Signal is not updating` | Missing `fixture.detectChanges()` | Always call after signal updates (Pattern 5) |

---

## Step-by-Step Process

For each test file, follow this workflow:

1. **Analyze** — Read the source class. Identify:
   - Public methods and their parameters
   - Dependencies (services, injected values)
   - Conditional logic and state changes
   - Failure points and error cases

2. **Design** — List test cases for each method:
   - Happy path (normal expected behavior)
   - Edge cases (null, undefined, empty values)
   - Error handling (exceptions, failed dependencies)
   - Reactivity (signal changes, output emissions)

3. **Generate** — Create/update the `.spec.ts` file:
   - Import all required testing utilities
   - Set up `beforeEach` if needed for shared TestBed config
   - Write each test following Given-When-Then structure (Pattern 4)
   - Use appropriate assertions from Pattern 9

4. **Verify** — Repeat until both pass:
   ```bash
   npm run test:coverage                # Run tests with coverage report
   npm run check:coverage               # Check coverage meets threshold
   ```
   - All tests pass (`npm run test`)
   - Line coverage ≥ 90%
   - No skipped tests (`xit`, `xdescribe`)

5. **Deliver** — Provide complete `.spec.ts` code and summary:
   - Class/component/directive tested
   - Coverage percentage reached
   - Methods tested and case types covered

---

## Commands

```bash
npm run test                         # Run all tests once
npm run test:watch                   # Run tests in watch mode
npm run test:coverage                # Run tests with coverage report
npm run check:coverage               # Run coverage + threshold check
npx vitest run path/to/file.spec.ts  # Run a single test file
```

---

## Resources

- **Project setup**: See [vitest-config reference](../scannlab-unit-test/references/vitest-config.md) for test infrastructure details.
- **Test infrastructure details**: See [vitest-setup.md](../../docs/vitest-setup.md).
- **Best practices**: See [scannlab-best-practices](../scannlab-best-practices/SKILL.md) for Angular coding conventions.
- **TestBed & zoneless patterns**: See [setup.md](../scannlab-unit-test/assets/setup.md).
- **Behavioral patterns & GWT**: See [patterns.md](../scannlab-unit-test/assets/patterns.md).
- **Common test errors**: See [troubleshooting.md](../scannlab-unit-test/assets/troubleshooting.md).
- **Original source**: See [unit-test.prompt.md](../../docs/unit-test.prompt.md) for the original prompt.
