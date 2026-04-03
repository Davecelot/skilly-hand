# TDD Templates: RED → GREEN → REFACTOR Cycles

This document provides real examples of the RED → GREEN → REFACTOR TDD cycle used by `scannlab-sdd-apply` agent when implementing ScannLab components.

**Pattern**: Write failing test → Write minimum code to pass → Refactor while tests stay green

---

## Example 1: Simple Pipe Component

### Scenario: AsyncCachePipe
Cache hot observables to prevent resubscription overhead.

#### Step 1: RED — Write Failing Test

```typescript
// async-cache.pipe.test.ts
import { TestBed } from '@angular/core/testing';
import { of, delay, Subject, take } from 'rxjs';
import { AsyncCachePipe } from './async-cache.pipe';

describe('AsyncCachePipe', () => {
  let pipe: AsyncCachePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new AsyncCachePipe());
  });

  it('should cache async values and replay on late subscriptions', (done) => {
    // GIVEN: An observable that emits after 100ms
    let emitCount = 0;
    const source$ = new Subject<number>();
    
    // WHEN: First subscription
    const result$ = pipe.transform(source$);
    const values: number[] = [];

    const sub1 = result$.subscribe((val) => {
      emitCount++;
      values.push(val);
    });

    // Emit after delay
    setTimeout(() => {
      source$.next(42);
    }, 100);

    // WHEN: Second subscription arrives after value is cached
    setTimeout(() => {
      const sub2 = result$.pipe(take(1)).subscribe((val) => {
        // THEN: Second subscriber gets cached value immediately
        expect(emitCount).toBe(1); // Source only emitted once
        expect(values[0]).toBe(42);
        
        sub1.unsubscribe();
        sub2.unsubscribe();
        source$.complete();
        done();
      });
    }, 200); // After source emits
  });

  // ❌ TEST FAILS HERE - transform() not implemented yet
});
```

**Run**: `npm test -- async-cache.pipe.test.ts`
```
FAIL  async-cache.pipe.test.ts
  should cache async values and replay on late subscriptions
    TypeError: pipe.transform is not a function
```

✅ Test fails as expected (proves test is meaningful)

---

#### Step 2: GREEN — Write Minimum Code

```typescript
// async-cache.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Pipe({
  name: 'asyncCache',
  standalone: true,
})
export class AsyncCachePipe implements PipeTransform {
  // ✅ MINIMUM: Just make the test pass
  transform<T>(source: Observable<T>): Observable<T> {
    const cached$ = new ReplaySubject<T>(1);
    source.pipe(tap((val) => cached$.next(val))).subscribe();
    return cached$.asObservable();
  }
}
```

**Run**: `npm test -- async-cache.pipe.test.ts`
```
PASS  async-cache.pipe.test.ts
  should cache async values and replay on late subscriptions ✓

Tests: 1 passed, 1 total
```

✅ Test passes (behavior is correct, but code needs cleanup)

---

#### Step 3: REFACTOR — Improve Without Changing Behavior

```typescript
// async-cache.pipe.ts (refactored)
import { Pipe, PipeTransform, ChangeDetectionStrategy } from '@angular/core';
import { Observable, ReplaySubject, takeUntil, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Pipe({
  name: 'asyncCache',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,  // ✅ Performance
})
export class AsyncCachePipe implements PipeTransform {
  private destroy$ = new Subject<void>();

  // ✅ REFACTORED: Cleaner, better organized
  transform<T>(source: Observable<T>): Observable<T> {
    const cacheSize = 1;
    const cached$ = new ReplaySubject<T>(cacheSize);

    // Subscribe and cache values
    source
      .pipe(
        tap((val) => cached$.next(val)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    return cached$.asObservable();
  }

  // ✅ Cleanup on destroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Run**: `npm test -- async-cache.pipe.test.ts`
```
PASS  async-cache.pipe.test.ts
  should cache async values and replay on late subscriptions ✓

Tests: 1 passed, 1 total
```

✅ Test still passes (refactoring didn't break behavior)

**What improved**:
- ✅ `ChangeDetectionStrategy.OnPush` for performance
- ✅ Constants extracted (`cacheSize`)
- ✅ Cleanup logic (`takeUntil`, `ngOnDestroy`)
- ✅ Code is now maintainable and scalable

---

## Example 2: Component with Input/Output

### Scenario: AlertComponent
Display dismissible alert with content and actions.

#### Step 1: RED — Write Failing Test

```typescript
// alert.component.test.ts
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
  });

  // Scenario: Component displays message
  it('should display the alert message', () => {
    // GIVEN: Component with message input
    component.message = 'Error: Invalid input';
    fixture.detectChanges();

    // WHEN: Component renders
    const messageEl = fixture.debugElement.nativeElement.querySelector('[data-testid="alert-message"]');

    // THEN: Message is visible
    expect(messageEl?.textContent).toBe('Error: Invalid input');
  });

  // ❌ FAILS - Component doesn't exist yet, no message input
});
```

**Run**: `npm test -- alert.component.test.ts`
```
FAIL  alert.component.test.ts
  should display the alert message
    Cannot find component 'AlertComponent'
```

❌ Test fails (component not implemented)

---

#### Step 2: GREEN — Write Minimum Implementation

```typescript
// alert.component.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  template: `<div data-testid="alert-message">{{ message() }}</div>`,
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  // ✅ MINIMUM: Just the message input
  message = input<string>('');
}
```

**Run**: `npm test -- alert.component.test.ts`
```
PASS  alert.component.test.ts
  should display the alert message ✓

Tests: 1 passed, 1 total
```

✅ Test passes (minimal implementation works)

---

#### Step 3: REFACTOR — Add Error Handling, Styling, Accessibility

```typescript
// alert.component.ts (refactored)
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="alert" 
      role="alert"
      aria-live="polite"
      [attr.data-testid]="'alert-message'"
      [class]="'alert--' + severity()">
      <p class="alert__message">{{ message() }}</p>
      
      <button 
        class="alert__close"
        aria-label="Dismiss alert"
        (click)="onDismiss()">
        ✕
      </button>
    </div>
  `,
  styleUrls: ['./alert.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  // ✅ REFACTORED: Better inputs, outputs, accessibility
  message = input<string>(''); 
  severity = input<'success' | 'error' | 'warning' | 'info'>('info');
  
  // ✅ Output for dismissal
  dismissed = output<void>();

  onDismiss(): void {
    this.dismissed.emit();
  }
}
```

**Run**: `npm test -- alert.component.test.ts`
```
PASS  alert.component.test.ts
  should display the alert message ✓

Tests: 1 passed, 1 total
```

✅ Test still passes (behavior preserved)

**What improved**:
- ✅ Accessibility attributes (`role="alert"`, `aria-live`, `aria-label`)
- ✅ Dismiss functionality with output
- ✅ Severity levels (visual/semantic distinction)
- ✅ CSS Modules styling
- ✅ `ChangeDetectionStrategy.OnPush` for performance

---

## Example 3: Service with StateManagement

### Scenario: TodoService
Manage todo list with add, complete, delete operations.

#### Step 1: RED — Multiple Scenarios

```typescript
// todo.service.test.ts
import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoService],
    });
    service = TestBed.inject(TodoService);
  });

  // Scenario 1: Add todo
  it('should add a todo and update the list', () => {
    // GIVEN: Empty todo list
    // WHEN: Add todo
    service.addTodo('Buy milk');

    // THEN: Todo appears in list
    expect(service.todos()).toContainEqual(
      jasmine.objectContaining({ text: 'Buy milk', done: false })
    );
  });

  // Scenario 2: Complete todo
  it('should mark todo as complete', () => {
    // GIVEN: A todo in the list
    service.addTodo('Buy milk');
    const firstTodo = service.todos()[0];

    // WHEN: Mark as complete
    service.completeTodo(firstTodo.id);

    // THEN: Todo is marked done
    expect(service.todos()[0].done).toBe(true);
  });

  // ❌ FAILS - Service methods don't exist
});
```

**Run**: `npm test -- todo.service.test.ts`
```
FAIL  todo.service.test.ts
  should add a todo and update the list
    service.addTodo is not a function
```

❌ Tests fail (service not implemented)

---

#### Step 2: GREEN — Write Minimum Implementation

```typescript
// todo.service.ts
import { Injectable, signal } from '@angular/core';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  // ✅ MINIMUM: Signal-based state
  todos = signal<Todo[]>([]);
  private nextId = 1;

  addTodo(text: string): void {
    const newTodo: Todo = {
      id: this.nextId++,
      text,
      done: false,
    };
    this.todos.update((current) => [...current, newTodo]);
  }

  completeTodo(id: number): void {
    this.todos.update((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, done: true } : todo
      )
    );
  }
}
```

**Run**: `npm test -- todo.service.test.ts`
```
PASS  todo.service.test.ts
  should add a todo and update the list ✓
  should mark todo as complete ✓

Tests: 2 passed, 2 total
```

✅ Tests pass (minimal implementation works)

---

#### Step 3: REFACTOR — Add Validation, Persistence, Error Handling

```typescript
// todo.service.ts (refactored)
import { Injectable, signal } from '@angular/core';

interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: Date;
  completedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  // ✅ REFACTORED: Better state management
  todos = signal<Todo[]>([]);
  private nextId = 1;
  private readonly MAX_TODOS = 100;

  constructor() {
    this.loadFromStorage();
  }

  addTodo(text: string): void {
    // ✅ Validation
    if (!text?.trim()) {
      throw new Error('Todo text cannot be empty');
    }

    if (this.todos().length >= this.MAX_TODOS) {
      throw new Error(`Cannot exceed ${this.MAX_TODOS} todos`);
    }

    const newTodo: Todo = {
      id: this.nextId++,
      text: text.trim(),
      done: false,
      createdAt: new Date(),
    };

    this.todos.update((current) => [...current, newTodo]);
    this.saveToStorage();
  }

  completeTodo(id: number): void {
    const todo = this.todos().find((t) => t.id === id);
    
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }

    this.todos.update((current) =>
      current.map((t) =>
        t.id === id
          ? { ...t, done: true, completedAt: new Date() }
          : t
      )
    );
    this.saveToStorage();
  }

  deleteTodo(id: number): void {
    this.todos.update((current) => current.filter((t) => t.id !== id));
    this.saveToStorage();
  }

  // ✅ Persistence
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('todos');
      if (stored) {
        this.todos.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load todos from storage', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('todos', JSON.stringify(this.todos()));
    } catch (e) {
      console.error('Failed to save todos to storage', e);
    }
  }
}
```

**Run**: `npm test -- todo.service.test.ts`
```
PASS  todo.service.test.ts
  should add a todo and update the list ✓
  should mark todo as complete ✓

Tests: 2 passed, 2 total
```

✅ Tests still pass (behavior preserved)

**What improved**:
- ✅ Input validation (empty check, max limit)
- ✅ Better error messages
- ✅ Metadata (createdAt, completedAt)
- ✅ Persistence (localStorage)
- ✅ Proper state cleanup
- ✅ Guardian clauses for safety

---

## TDD Workflow — Key Principles

### 1. RED First, Always
**Always write the failing test before code.** This proves:
- The test is meaningful (not just passing by accident)
- The feature is actually needed
- You understand the requirements

### 2. Minimum Code to GREEN
Write the **smallest possible code** to make the test pass:
- No extra features
- No premature optimization
- No "while I'm here, let me add..."

Example of WRONG:
```typescript
// ❌ WRONG: Added error handling not required by test
completeTodo(id: number): void {
  if (!id) throw new Error('ID required');
  if (!this.todos().find(t => t.id === id)) throw new Error('Not found');
  // ...
}
```

Example of RIGHT:
```typescript
// ✅ RIGHT: Only what the test requires
completeTodo(id: number): void {
  this.todos.update(current =>
    current.map(t => t.id === id ? { ...t, done: true } : t)
  );
}
```

### 3. REFACTOR With Tests GREEN
Only improve structure **after** tests pass:
- Extract constants
- Improve naming
- Simplify logic
- Add comments
- **Tests must stay green** throughout

### 4. One Scenario Per Test
Each test validates ONE behavior:

```typescript
// ❌ WRONG: Two scenarios in one test
it('should add and complete todos', () => {
  service.addTodo('Buy milk');
  service.completeTodo(1); // Assumes ID 1
  expect(service.todos()[0].done).toBe(true);
});

// ✅ RIGHT: One scenario per test
it('should add a todo', () => {
  service.addTodo('Buy milk');
  expect(service.todos()).toContainEqual(
    jasmine.objectContaining({ text: 'Buy milk' })
  );
});

it('should complete a todo', () => {
  service.addTodo('Buy milk');
  service.completeTodo(1);
  expect(service.todos()[0].done).toBe(true);
});
```

---

## Quick Checklist: RED → GREEN → REFACTOR

```markdown
### For Each Task Using TDD

#### RED Phase ✓
- [ ] Write test that describes the feature
- [ ] Test has explicit GIVEN/WHEN/THEN
- [ ] Run: `npm test -- {test-file}` — FAILS ✅
- [ ] Failure proves test is meaningful

#### GREEN Phase ✓
- [ ] Write minimum code to pass
- [ ] No extra features beyond test requirement
- [ ] Run: `npm test -- {test-file}` — PASSES ✅
- [ ] Behavior is correct

#### REFACTOR Phase ✓
- [ ] Improve code structure/naming
- [ ] Extract constants, simplify logic
- [ ] Run: `npm test -- {test-file}` — STILL PASSES ✅
- [ ] No behavior changes, only improvements

#### Verify ✓
- [ ] All tests pass: `npm test`
- [ ] Lint passes: `npm run lint`
- [ ] Type check: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
```

---

## Resources

- [scannlab-unit-test SKILL.md](../../scannlab-unit-test/SKILL.md) — Test patterns & TestBed setup
- [scannlab-sdd-apply agents/apply.md](../agents/apply.md) — How apply agent uses TDD
- [scannlab-best-practices SKILL.md](../../scannlab-best-practices/SKILL.md) — Code quality standards
