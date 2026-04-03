# Behavioral Testing Patterns & GWT Structure

This document covers test structure, assertions, and behavioral patterns specific to ScannLab components.

---

## Given-When-Then (GWT) Structure

All tests must follow the GWT pattern with explicit comments:

```typescript
it('should apply active class when status is active', () => {
  // Given — Set up initial state, mocks, and component
  const statusSignal = signal('active');
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(MyComponent, {
    bindings: [inputBinding('status', statusSignal)],
  });

  // When — Perform action or trigger change
  fixture.detectChanges();

  // Then — Assert expected outcome
  expect(fixture.nativeElement.className).toContain('is-active');
});
```

### Why GWT?

- **Self-documenting** — Clearly explains what each section does
- **Reviewable** — Makes it easy to spot missing assertions or setup
- **Maintainable** — New developers understand test intent quickly
- **Debuggable** — Pinpoint where failure occurs (setup, action, or assertion)

---

## CSS Class Assertions

Always use `toContain()` for CSS classes, never `toBe()`:

```typescript
// ✅ CORRECT — Order-independent, maintainable
expect(element.className).toContain('btn');
expect(element.className).toContain('btn-primary');

// ❌ WRONG — Fails if class order changes or if extra classes are added
expect(element.className).toBe('btn btn-primary');
```

### Why?

- CSS class order is implementation detail
- Extra spacing or additional classes break brittle tests
- `toContain()` tests the class is present, not the exact string

---

## Reactivity Testing with Signals

Test that components respond to input signal changes:

```typescript
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
  const btn = fixture.nativeElement;
  expect(btn.getAttribute('data-variant')).toBe('secondary');
});
```

### Key Points

1. Create a signal with initial value: `signal('primary')`
2. Bind it using `inputBinding('variant', variant)`
3. Update with `.set()`: `variant.set('secondary')`
4. **Always call `fixture.detectChanges()` after signal updates**

---

## Testing Directives with Host Components

Directives can't be tested with `createComponent()`. Create a host component instead:

```typescript
@Component({
  template: '<div [appHighlight]="isActive()">Content</div>',
  imports: [AppHighlightDirective],
})
class TestHostComponent {
  public readonly isActive = signal(false);
}

describe('AppHighlightDirective', () => {
  it('should add highlight class when active', () => {
    // Given
    const fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(TestHostComponent);

    // When
    fixture.detectChanges();

    // Then
    const div = fixture.nativeElement.querySelector('div');
    expect(div.className).not.toContain('highlighted');

    // Update and re-test
    // When
    fixture.componentInstance.isActive.set(true);
    fixture.detectChanges();

    // Then
    expect(div.className).toContain('highlighted');
  });
});
```

---

## Looping Over Test Values (With Reset)

When testing multiple variants/values, reset TestBed between iterations:

```typescript
const VALID_SIZES = ['sm', 'md', 'lg'];

it('should accept all valid sizes', () => {
  VALID_SIZES.forEach(size => {
    // MANDATORY: Reset TestBed before each iteration
    TestBed.resetTestingModule();

    const sizeSignal = signal(size);
    const fixture = TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).createComponent(SlButtonComponent, {
      bindings: [inputBinding('size', sizeSignal)],
    });
    fixture.detectChanges();

    const btn = fixture.nativeElement;
    expect(btn.className).toContain(`btn-${size}`);
  });
});
```

### Why Reset?

- Prevents state leakage between iterations
- Each iteration gets a clean TestBed
- Avoids "Cannot configure test module" errors

### Alternative: Separate Tests per Value

For better debugging, consider separate tests:

```typescript
describe('SlButtonComponent — sizes', () => {
  it('should render small button', () => { /* ... */ });
  it('should render medium button', () => { /* ... */ });
  it('should render large button', () => { /* ... */ });
});
```

This provides:
- Individual pass/fail per size
- Clearer test names
- Better error messages

---

## Testing Component Outputs and Events

### With Output Emitters

```typescript
it('should emit clicked when button is clicked', () => {
  // Given
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(SlButtonComponent);
  fixture.detectChanges();

  let emitted = false;
  fixture.componentInstance.clicked.subscribe(() => {
    emitted = true;
  });

  // When
  const button = fixture.nativeElement.querySelector('button');
  button.click();
  fixture.detectChanges();

  // Then
  expect(emitted).toBe(true);
});
```

### With Native Events

```typescript
it('should handle input change', () => {
  // Given
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(SlInputComponent);
  fixture.detectChanges();

  const input = fixture.nativeElement.querySelector('input');

  // When
  input.value = 'new value';
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();

  // Then
  expect(fixture.componentInstance.value()).toBe('new value');
});
```

---

## Testing Conditional Logic

Test both branches of conditional rendering:

```typescript
it('should show error message when required and empty', () => {
  // Given
  const value = signal('');
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(SlInputComponent, {
    bindings: [
      inputBinding('value', value),
      inputBinding('required', signal(true)),
    ],
  });

  // When
  fixture.detectChanges();

  // Then
  const error = fixture.nativeElement.querySelector('[data-error]');
  expect(error).toBeTruthy();
  expect(error.textContent).toContain('This field is required');
});

it('should not show error when not required', () => {
  // Given
  const value = signal('');
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(SlInputComponent, {
    bindings: [
      inputBinding('value', value),
      inputBinding('required', signal(false)),
    ],
  });

  // When
  fixture.detectChanges();

  // Then
  const error = fixture.nativeElement.querySelector('[data-error]');
  expect(error).toBeFalsy();
});
```

---

## Testing CSS Modules and Scoped Styles

When testing components with CSS Modules:

```typescript
it('should apply CSS module class', () => {
  // Given
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(SlButtonComponent);

  // When
  fixture.detectChanges();

  // Then
  const btn = fixture.nativeElement.querySelector('button');
  // Note: CSS Module classes may have hashes like "Button_primary__a3x2k"
  // Use className contains checks or query by data-testid
  expect(btn.getAttribute('data-testid')).toBe('button-primary');
});
```

---

## Testing Accessibility Attributes

Always test ARIA and accessibility features:

```typescript
it('should have accessible button role and label', () => {
  // Given
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(SlButtonComponent);

  // When
  fixture.detectChanges();

  // Then
  const btn = fixture.nativeElement.querySelector('button');
  expect(btn.getAttribute('role')).toBe('button');
  // Or, if using aria-label:
  expect(btn.getAttribute('aria-label')).toBe('Expected label');
  // Or, for keyboard nav:
  expect(btn.getAttribute('tabindex')).toBe('0');
});
```

---

## Testing Services with Dependencies

```typescript
@Injectable()
class DataService {
  constructor(private http: HttpClient) {}

  public getData(id: string) {
    return this.http.get(`/api/data/${id}`);
  }
}

describe('DataService', () => {
  it('should fetch data from API', () => {
    // Given
    const mockHttp = {
      get: vi.fn().mockReturnValue(of({ id: '1', name: 'Test' })),
    };

    const service = TestBed.configureTestingModule({
      providers: [
        DataService,
        { provide: HttpClient, useValue: mockHttp },
      ],
    }).inject(DataService);

    // When
    service.getData('1').subscribe(data => {
      // Then
      expect(data.name).toBe('Test');
    });

    expect(mockHttp.get).toHaveBeenCalledWith('/api/data/1');
  });
});
```

---

## Test Organization by Feature

Organize describe blocks logically:

```typescript
describe('SlButtonComponent', () => {
  describe('rendering', () => {
    it('should render label text', () => { /* ... */ });
    it('should apply variant class', () => { /* ... */ });
    it('should set disabled state', () => { /* ... */ });
  });

  describe('interactions', () => {
    it('should emit click event', () => { /* ... */ });
    it('should not emit when disabled', () => { /* ... */ });
  });

  describe('accessibility', () => {
    it('should have button role', () => { /* ... */ });
    it('should be keyboard focusable', () => { /* ... */ });
  });

  describe('edge cases', () => {
    it('should handle empty label', () => { /* ... */ });
    it('should handle very long label', () => { /* ... */ });
  });
});
```

---

## Coverage Checklist

For each component, ensure tests cover:

- [ ] **Happy Path** — Normal, expected behavior
- [ ] **Input Variations** — All variant types, sizes, states
- [ ] **Reactivity** — Signal changes propagate correctly
- [ ] **Edge Cases** — `null`, `undefined`, empty strings, empty arrays
- [ ] **Error States** — Error messages, disabled states, validation failures
- [ ] **Interactions** — Click, focus, keyboard navigation
- [ ] **Accessibility** — ARIA attributes, roles, keyboard support
- [ ] **CSS Application** — Correct classes applied in each state
