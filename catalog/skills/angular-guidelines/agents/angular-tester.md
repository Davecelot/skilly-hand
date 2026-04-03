# Angular Tester

## When to Use

Use this sub-agent when:

- Adding or updating Angular component/service tests.
- Reviewing Angular tests for correctness and modern framework usage.
- Choosing test patterns for async, signal-based, or HTTP-driven behaviors.

Do not use this sub-agent for:

- Component implementation guidance without tests (use `component-creator`).
- Framework-agnostic testing standards not tied to Angular behavior.

---

## Runner Policy

- Default: Vitest-first in Angular workspaces.
- Fallback: Use Jasmine/Karma patterns only when the workspace is already configured for Jasmine.
- Do not force runner migration inside unrelated feature tasks.

---

## Core Testing Patterns

- Configure `TestBed` with standalone imports for component tests.
- Test signal and computed behavior directly when possible.
- Test signal inputs/outputs using component instance APIs and DOM-triggered events.
- Cover async behavior with `fakeAsync`/`tick`/`flush` or `waitForAsync`/`whenStable`.
- For HTTP paths, use `HttpClientTestingModule`/`HttpTestingController` and verify requests.
- For services, prefer explicit DI setup and clear mocking boundaries.

---

## Command Matrix

| Scenario | Preferred Command | Fallback |
| --- | --- | --- |
| Run all unit tests | `ng test` | Existing workspace test command |
| Watch mode | `ng test --watch` | Workspace equivalent |
| Coverage | `ng test --code-coverage` | Workspace equivalent |
| CI-style single run | `ng test --watch=false` | Workspace equivalent |

If the workspace uses Jasmine/Karma, keep command behavior aligned with existing runner configuration.

---

## Decision Tree

```text
Is the target under test a standalone component?
  YES -> Use TestBed with imports: [ComponentUnderTest]
  NO  -> Continue

Is this primarily service logic?
  YES -> Configure TestBed providers/injection and mock dependencies
  NO  -> Continue

Is behavior async (timers, promises, stabilization)?
  YES -> Use fakeAsync/tick or waitForAsync/whenStable
  NO  -> Continue

Does behavior involve HTTP or resource loading?
  YES -> Use HttpTestingController and assert request + response flow
  NO  -> Use direct synchronous assertions
```

---

## Test Snippets

### Standalone Component Test

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { describe, expect, it, beforeEach } from "vitest";
import { CounterComponent } from "./counter.component";

describe("CounterComponent", () => {
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(CounterComponent);
    fixture.detectChanges();
  });

  it("renders default count", () => {
    expect(fixture.componentInstance.count()).toBe(0);
  });
});
```

### HTTP Service Test

```typescript
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

describe("ProfileService", () => {
  it("requests profile", () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    const service = TestBed.inject(ProfileService);
    const httpMock = TestBed.inject(HttpTestingController);

    service.getProfile().subscribe();

    const req = httpMock.expectOne("/api/profile");
    expect(req.request.method).toBe("GET");
    req.flush({ id: "1" });
    httpMock.verify();
  });
});
```

---

## Review Checklist

- Tests follow the workspace runner policy (Vitest-first, Jasmine fallback only when preconfigured).
- Standalone Angular artifacts are tested with appropriate TestBed setup.
- Signal/input/output behavior is asserted explicitly.
- Async and HTTP behavior use deterministic Angular testing utilities.
- Assertions verify user-visible behavior or contract-level outcomes, not incidental internals.
