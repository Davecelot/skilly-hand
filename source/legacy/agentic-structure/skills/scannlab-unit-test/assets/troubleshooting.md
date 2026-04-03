# Testing Troubleshooting Guide

Common errors, their causes, and solutions for Vitest setup in ScannLab.

---

## TestBed & Component Errors

### Error: "Component has not been compiled"

**Cause:** Attempting to test a directive directly with `createComponent()`.

**Fix:** Create a test host component instead:

```typescript
// ❌ WRONG
it('should work', () => {
  const fixture = TestBed.createComponent(MyDirective);
});

// ✅ CORRECT
@Component({
  template: '<div [myDirective]="true">Test</div>',
  imports: [MyDirective],
})
class TestHost {}

it('should work', () => {
  const fixture = TestBed.createComponent(TestHost);
});
```

**Reference:** See Pattern 3 in [SKILL.md](../SKILL.md).

---

### Error: "Cannot configure test module after it has been instantiated"

**Cause:** Reusing `TestBed` from a previous test without resetting. Common in loops.

**Fix:** Call `TestBed.resetTestingModule()` before reconfiguring:

```typescript
// ❌ WRONG
SIZES.forEach(size => {
  const fixture = TestBed.configureTestingModule({...}).createComponent(MyComponent);
  // Error on second iteration
});

// ✅ CORRECT
SIZES.forEach(size => {
  TestBed.resetTestingModule();
  const fixture = TestBed.configureTestingModule({...}).createComponent(MyComponent);
});
```

**Reference:** See Pattern 7 in [SKILL.md](../SKILL.md).

---

### Error: "Angular requires Zone.js"

**Cause:** Missing `provideZonelessChangeDetection()` in providers.

**Fix:** Add the provider to every test configuration:

```typescript
// ❌ WRONG
TestBed.configureTestingModule({
  // ... rest of config
});

// ✅ CORRECT
TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()],
});
```

**Reference:** See Pattern 1 in [SKILL.md](../SKILL.md).

---

### Error: "fixture is undefined"

**Cause:** Component creation failed silently, usually due to a syntax error in `configureTestingModule()`.

**Fix:** Check for typos in declarations, imports, or providers:

```typescript
// ❌ WRONG (typo: 'declarations' is not valid)
TestBed.configureTestingModule({
  declarations: [MyComponent], // ← Wrong property
});

// ✅ CORRECT (use 'imports' for standalone or regular Angular 14+ components)
TestBed.configureTestingModule({
  imports: [MyComponent],
});
```

---

## Change Detection Errors

### Error: "Signal is not updating" or "Component not reflecting changes"

**Cause:** Forgot to call `fixture.detectChanges()` after signal update.

**Fix:** Always call `fixture.detectChanges()` after signal changes:

```typescript
// ❌ WRONG
const variant = signal('primary');
variant.set('secondary');
expect(fixture.nativeElement.getAttribute('data-variant')).toBe('secondary');
// ← Fails because detectChanges hasn't been called

// ✅ CORRECT
const variant = signal('primary');
const fixture = TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()],
}).createComponent(MyComponent, {
  bindings: [inputBinding('variant', variant)],
});
fixture.detectChanges();

variant.set('secondary');
fixture.detectChanges(); // ← Called after update
expect(fixture.nativeElement.getAttribute('data-variant')).toBe('secondary');
```

**Reference:** See Pattern 5 in [SKILL.md](../SKILL.md).

---

### Error: "fakeAsync or async is not defined"

**Cause:** These utilities don't work reliably with zoneless change detection. They're from the old Zone.js era.

**Fix:** Use native signal reactivity instead:

```typescript
// ❌ OUTDATED (don't use in zoneless tests)
it('should update', fakeAsync(() => {
  // ...
  tick();
}));

// ✅ CORRECT (use fixtures and signals)
it('should update', () => {
  const value = signal('initial');
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(MyComponent, {
    bindings: [inputBinding('value', value)],
  });
  
  value.set('updated');
  fixture.detectChanges();
  // assertions here
});
```

---

## Input Binding Errors

### Error: "inputBinding is not exported from '@angular/core'"

**Cause:** Wrong import path or using an older Angular version.

**Fix:** Import from `@angular/core`:

```typescript
// ❌ WRONG
import { inputBinding } from '@angular/testing'; // ← Wrong module

// ✅ CORRECT
import { inputBinding } from '@angular/core';
```

---

### Error: "Property 'bindings' does not exist" (in CreateComponentOptions)

**Cause:** Using an older TestBed or Angular version. This is a modern Angular 18+ feature.

**Fix:** Verify Angular version is 18+. If using an older version, use property assignment instead:

```typescript
// For Angular 18+
const fixture = TestBed.createComponent(MyComponent, {
  bindings: [inputBinding('value', signal('test'))],
});

// For older Angular (not recommended, use modern patterns)
const fixture = TestBed.createComponent(MyComponent);
fixture.componentInstance.value = 'test';
```

---

## Globals & Vitest Configuration

### Error: "describe is not defined" or "it is not defined"

**Cause:** Vitest globals not enabled in `vitest.config.ts`.

**Fix:** Enable globals in `vitest.config.ts`:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // ← Add this
    environment: 'jsdom',
    // ... rest of config
  },
});
```

If you prefer explicit imports (safer), use:

```typescript
// In every test file
import { describe, it, expect, beforeEach } from 'vitest';
```

---

### Error: "Cannot find module '@angular/core'"

**Cause:** Missing or broken `node_modules` or dependencies.

**Fix:** Reinstall dependencies:

```bash
npm install
# or if that doesn't work
rm -rf node_modules package-lock.json
npm install
```

---

## Assertion Errors

### Error: "Expected 'class1 class2' to contain 'class1 class3'" (or similar)

**Cause:** Brittle CSS class test using exact string matching.

**Fix:** Use `toContain()` instead of `toBe()` for class assertions:

```typescript
// ❌ WRONG (fails if class order changes)
expect(element.className).toBe('btn btn-primary');

// ✅ CORRECT (order-independent)
expect(element.className).toContain('btn');
expect(element.className).toContain('btn-primary');
```

**Reference:** See Pattern 6 in [SKILL.md](../SKILL.md).

---

### Error: "Expected undefined to be X"

**Cause:** Querying for an element that doesn't exist. Often because component hasn't rendered.

**Fix:** Debug by checking if element exists:

```typescript
fixture.detectChanges();

const element = fixture.nativeElement.querySelector('[data-testid="button"]');
console.log('Element:', element);

if (element) {
  expect(element.textContent).toBe('Expected');
} else {
  expect(fixture.nativeElement.innerHTML).toContain('Expected text');
}
```

Or add `data-testid` attributes to your components for easier testing:

```typescript
// In component template
<button data-testid="main-button">Click</button>

// In test
const btn = fixture.nativeElement.querySelector('[data-testid="main-button"]');
expect(btn).toBeTruthy();
```

---

## Mock & Spy Errors

### Error: "vi.fn is not a function" or "vitest is not defined"

**Cause:** Missing Vitest import or running without Vitest.

**Fix:** Ensure Vitest is imported and configured:

```typescript
// Import at top of file
import { describe, it, expect, vi } from 'vitest';

// Use in tests
const mockFn = vi.fn().mockReturnValue('result');
expect(mockFn()).toBe('result');
```

---

### Error: "Cannot read property 'toHaveBeenCalled' of undefined"

**Cause:** Object is not a Vitest mock, or using Jest syntax with Vitest.

**Fix:** Mock the function properly:

```typescript
// ❌ WRONG (not a mock)
const service = { getData: () => ({ id: 1 }) };
expect(service.getData).toHaveBeenCalled(); // ← Error

// ✅ CORRECT (properly mocked)
const service = { getData: vi.fn().mockReturnValue({ id: 1 }) };
expect(service.getData).toHaveBeenCalled();
```

---

## Coverage Errors

### Error: "Coverage threshold not met" or "Expected 90% coverage, got 85%"

**Cause:** Not enough test cases covering code branches.

**Fix:** Add more test cases for uncovered branches:

```bash
# Run coverage to see what's not covered
npm run test:coverage

# Open the HTML report
open coverage/index.html
```

Then add tests for missing branches:

```typescript
// Check coverage report to see which lines are not covered
// Add specific tests for those lines

it('should handle null value', () => {
  // Given
  const value = signal(null);
  // ... rest of test
});

it('should handle empty string', () => {
  // Given
  const value = signal('');
  // ... rest of test
});
```

---

## Guide to Debugging

### Step 1: Check Test Output

Run the test with clear output:

```bash
npm run test -- path/to/file.spec.ts --reporter=verbose
```

### Step 2: Add Console Logs

```typescript
it('should work', () => {
  const fixture = TestBed.createComponent(MyComponent);
  fixture.detectChanges();

  console.log('HTML:', fixture.nativeElement.innerHTML);
  console.log('Classes:', fixture.nativeElement.className);
  console.log('Component:', fixture.componentInstance);

  expect(fixture.nativeElement).toBeTruthy();
});
```

### Step 3: Use Debugging Tools

Run tests in debug mode:

```bash
node --inspect-brk ./node_modules/.bin/vitest run path/to/file.spec.ts
```

Then open `chrome://inspect` in Chrome.

### Step 4: Simplify the Test

Create a minimal reproduction:

```typescript
it('minimal test', () => {
  const fixture = TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }).createComponent(MyComponent);

  fixture.detectChanges();

  expect(fixture.nativeElement).toBeTruthy();
});
```

If this passes, gradually add complexity back.

---

## Performance Issues

### Tests Running Slowly

**Cause:** Too many `TestBed.resetTestingModule()` calls or large test files.

**Fix:**

1. **Use `beforeEach` for shared setup:**
   ```typescript
   describe('Component', () => {
     let fixture;

     beforeEach(() => {
       fixture = TestBed.configureTestingModule({...}).createComponent(MyComponent);
     });

     it('test 1', () => { fixture.detectChanges(); expect(...); });
     it('test 2', () => { fixture.detectChanges(); expect(...); });
   });
   ```

2. **Avoid unnecessary resets:**
   ```typescript
   // Only reset if you actually need to reconfigure
   TestBed.resetTestingModule();
   ```

3. **Run tests in parallel:**
   ```bash
   npm run test -- --threads
   ```

---

## Help! Still Stuck?

- **Check [SKILL.md](../SKILL.md)** for the main patterns
- **Check [setup.md](./setup.md)** for TestBed fundamentals
- **Check [patterns.md](./patterns.md)** for behavioral testing patterns
- **Review [vitest.config.ts](../../vitest.config.ts)** for configuration
- **See [vitest-setup.ts](../../vitest-setup.ts)** for test environment setup
