# Vitest Configuration Reference

This file links to and documents the test infrastructure configuration for ScannLab.

---

## Vitest Config

**Location:** [vitest.config.ts](../../../vitest.config.ts)

This file contains:
- Test environment (jsdom, node, etc.)
- Global test utilities (globals: true)
- Coverage thresholds and reporters
- TypeScript configuration
- Test file patterns

**Key Settings:**

```typescript
// From vitest.config.ts
export default defineConfig({
  test: {
    globals: true,           // Makes describe, it, expect available globally
    environment: 'jsdom',    // Simulates browser DOM for component tests
    include: ['**/*.spec.ts'], // Test file pattern
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      statements: 90,        // 90% minimum coverage required
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
});
```

---

## Vitest Setup

**Location:** [vitest-setup.ts](../../../vitest-setup.ts)

This file runs before all tests and contains:
- Global test utilities import
- Angular-specific setup
- Vitest startup configuration
- Zone polyfill setup (if needed)

**Common Setup:**

```typescript
// From vitest-setup.ts
import '@angular/core/testing';
// Additional setup for Angular testing
```

---

## Environment Variables

Tests can access environment variables through `process.env`:

```typescript
it('should use correct API endpoint', () => {
  const apiUrl = process.env['API_URL'] || 'http://localhost:3000';
  expect(apiUrl).toBeTruthy();
});
```

---

## Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Check coverage meets thresholds
npm run check:coverage

# Run a specific test file
npx vitest run tests/my.spec.ts
```

---

## Coverage Report

After running `npm run test:coverage`, view the HTML report:

```bash
open coverage/index.html
```

The report shows:
- **Statements:** Individual lines of code executed
- **Branches:** Conditional paths taken (if/else, switches)
- **Functions:** Function calls made
- **Lines:** Total lines covered

All must be ≥ 90% for ThresholdError.

---

## TypeScript Configuration for Tests

Tests inherit from main `tsconfig.json` but can have test-specific settings here if needed.

**Reference:** [tsconfig.json](../../../tsconfig.json)

Key test settings:
- `lib: ["ES2020", "DOM"]` — Supports modern JS + browser APIs
- `target: "ES2020"` — Targets modern JavaScript
- `moduleResolution: "node"` — Node module resolution

---

## Angular Testing Utilities

All Angular testing utilities are available globally in tests:

```typescript
import {
  TestBed,                        // Configure test modules
  ComponentFixture,               // Type for component test fixtures
  provideZonelessChangeDetection, // Inject zoneless mode
} from '@angular/core/testing';

import {
  input,          // Define component inputs
  signal,         // Create reactive signals
  inputBinding,   // Bind signals in tests
} from '@angular/core';

import { vi, describe, it, expect, beforeEach } from 'vitest';
```

---

## Vitest Documentation

- **Official Docs:** https://vitest.dev/
- **Testing Library:** https://testing-library.com/ (often used with Vitest)
- **Vitest CLI:** `npx vitest --help`

---

## Common Configuration Issues

### Tests won't run
- Check `globals: true` is set in vitest.config.ts
- Verify test files match `include` pattern (`**/*.spec.ts`)

### Coverage not correctly reported
- Ensure `coverage.provider: 'v8'` is set
- Check threshold values are numeric (not percentages like "90%")

### Module resolution errors
- Verify `moduleResolution: "node"` in tsconfig.json
- Check import paths match file locations

### Zone.js errors
- Ensure `provideZonelessChangeDetection()` is in test configuration
- Don't mix `fakeAsync`, `async`, `waitForAsync` with zoneless tests

---

## Related Files

- [setup.md](../assets/setup.md) — TestBed setup patterns
- [patterns.md](../assets/patterns.md) — Test structure and assertions
- [troubleshooting.md](../assets/troubleshooting.md) — Common errors and fixes
- [SKILL.md](../SKILL.md) — Main testing guide
