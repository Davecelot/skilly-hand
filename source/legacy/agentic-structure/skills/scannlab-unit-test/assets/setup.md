# TestBed Setup & Zoneless Change Detection

This document covers the foundational setup patterns for all Vitest tests in ScannLab.

## Why Zoneless Change Detection?

Angular has shifted from Zone.js-based change detection to **zoneless change detection** in modern versions. This enables:

- More predictable change detection timing
- Reduced memory overhead (no Zone.js wrapping)
- Signal-based reactivity as first-class API
- Better performance in large applications

ScannLab requires `provideZonelessChangeDetection()` in every test setup.

---

## Basic TestBed Setup

Every `.spec.ts` file should start with this pattern:

```typescript
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';

import { MyComponent } from './my.component';

describe('MyComponent', () => {
  it('should render', () => {
    // Given
    const fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(MyComponent);

    // When
    fixture.detectChanges();

    // Then
    expect(fixture.nativeElement).toBeTruthy();
  });
});
```

### What This Does

1. **`TestBed.configureTestingModule()`** — Configures Angular's test module
2. **`providers: [provideZonelessChangeDetection()]`** — Enables zoneless change detection (required)
3. **`.createComponent(MyComponent)`** — Creates an instance of the component
4. **`fixture.detectChanges()`** — Triggers change detection manually

### Key Points

- **Always** call `provideZonelessChangeDetection()` in `providers`
- **Always** call `fixture.detectChanges()` after setting up or changing inputs
- **Never** use `fakeAsync`, `async`, or `waitForAsync` without explicitly handling zoneless compatibility
- **Never** rely on automatic change detection from Zone.js wrapping

---

## Input Bindings with Signals

Modern Angular components use `input()` signals. To pass values to these signals in tests, use `inputBinding`:

```typescript
import { inputBinding, signal } from '@angular/core';

@Component({
  selector: 'sl-button',
  template: '<button>{{ label() }}</button>',
})
class SlButtonComponent {
  public readonly label = input<string>('Default');
}

describe('SlButtonComponent', () => {
  it('should update label when input changes', () => {
    // Given
    const labelSignal = signal('Click me');
    const fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(SlButtonComponent, {
      bindings: [inputBinding('label', labelSignal)],
    });
    fixture.detectChanges();

    // When
    labelSignal.set('New Label');
    fixture.detectChanges();

    // Then
    const button = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toBe('New Label');
  });
});
```

### Syntax

```typescript
TestBed.createComponent(ComponentClass, {
  bindings: [
    inputBinding('inputName', signalRef),
    inputBinding('anotherInput', anotherSignalRef),
  ],
})
```

- **`inputBinding(name, signal)`** — Binds a component's input signal to a test signal
- Test can update the signal with `.set()` and trigger change detection
- Component will reactively update

---

## Output Bindings and Event Emissions

For components with output signals or event emitters:

```typescript
it('should emit when button is clicked', () => {
  // Given
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(SlButtonComponent);
  fixture.detectChanges();

  const button = fixture.nativeElement.querySelector('button');
  let clicked = false;
  fixture.componentInstance.clicked.subscribe(() => {
    clicked = true;
  });

  // When
  button.click();
  fixture.detectChanges();

  // Then
  expect(clicked).toBe(true);
});
```

---

## Imports and Declarations

Always include all required imports at the top of the component declaration in the test:

```typescript
it('should work with component imports', () => {
  // Given
  const fixture = TestBed.configureTestingModule({
    imports: [MyComponent, CommonModule, FormsModule],
    providers: [provideZonelessChangeDetection()],
  }).createComponent(MyComponent);

  // ... rest of test
});
```

---

## Service Injection

Inject services using `TestBed.inject()`:

```typescript
it('should inject service', () => {
  // Given
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), MyService],
  });

  // When
  const service = TestBed.inject(MyService);

  // Then
  expect(service).toBeTruthy();
});
```

---

## beforeEach vs Test-Level Setup

### 🟢 Use `beforeEach` when:

```typescript
describe('SlButtonComponent', () => {
  let fixture: ComponentFixture<SlButtonComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(SlButtonComponent);
  });

  it('should render', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should be clickable', () => {
    fixture.detectChanges();
    // ...
  });
});
```

- Tests share identical setup
- Cleaner, DRY code
- Each test gets a fresh fixture

### 🔴 Don't use `beforeEach` when:

- Tests need different component configurations
- Tests need different providers
- Setup is simple and test-specific

Then use test-level setup instead:

```typescript
it('should work with custom provider', () => {
  const fixture = TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      { provide: SomeService, useValue: customValue },
    ],
  }).createComponent(MyComponent);
  // ...
});
```

---

## Mocking Dependencies

Use `vi.fn()` to mock functions and `vi.mock()` to mock modules:

```typescript
it('should call service method', () => {
  // Given
  const mockService = {
    getData: vi.fn().mockResolvedValue({ id: 1 }),
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
  expect(mockService.getData).toHaveBeenCalled();
});
```

---

## Reset TestBed Between Tests (When Needed)

If you're reusing TestBed across many tests with different configurations, reset it:

```typescript
it('should work with first variant', () => {
  TestBed.resetTestingModule();
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(MyComponent);
  // ...
});

it('should work with second variant', () => {
  TestBed.resetTestingModule();
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(MyComponent);
  // ...
});
```

---

## Common Setup Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Angular requires Zone.js` | Missing `provideZonelessChangeDetection()` | Add to providers |
| `Cannot read property of undefined` | Component not initialized | Call `fixture.detectChanges()` first |
| `inputBinding is not exported` | Missing import | Add `import { inputBinding } from '@angular/core'` |
| `Cannot configure test module after it has been instantiated` | Reusing TestBed | Call `TestBed.resetTestingModule()` first |
