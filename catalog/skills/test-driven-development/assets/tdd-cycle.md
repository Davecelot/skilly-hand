# TDD Templates: RED → GREEN → REFACTOR Cycles

Real examples of the RED → GREEN → REFACTOR TDD cycle for implementing components, services, and pipes.

**Pattern**: Write failing test → Write minimum code to pass → Refactor while tests stay green

---

## Example 1: Simple Pipe Component

### Scenario: AsyncCachePipe
Cache hot observables to prevent resubscription overhead.

#### Step 1: RED — Write Failing Test

```typescript
// async-cache.pipe.test.ts
import { TestBed } from '@angular/core/testing';
import { Subject, take } from 'rxjs';
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

    setTimeout(() => {
      source$.next(42);
    }, 100);

    // WHEN: Second subscription arrives after value is cached
    setTimeout(() => {
      const sub2 = result$.pipe(take(1)).subscribe(() => {
        // THEN: Second subscriber gets cached value immediately
        expect(emitCount).toBe(1);
        expect(values[0]).toBe(42);

        sub1.unsubscribe();
        sub2.unsubscribe();
        source$.complete();
        done();
      });
    }, 200);
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
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { tap } from 'rxjs/operators';

@Pipe({
  name: 'asyncCache',
  standalone: true,
})
export class AsyncCachePipe implements PipeTransform {
  private destroy$ = new Subject<void>();

  // ✅ REFACTORED: Cleaner, adds cleanup
  transform<T>(source: Observable<T>): Observable<T> {
    const cacheSize = 1;
    const cached$ = new ReplaySubject<T>(cacheSize);

    source
      .pipe(
        tap((val) => cached$.next(val)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    return cached$.asObservable();
  }

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
```

✅ Test still passes

**What improved**:
- Constants extracted (`cacheSize`)
- Cleanup logic added (`takeUntil`, `ngOnDestroy`)

---

## Example 2: Component with Input/Output

### Scenario: AlertComponent
Display a dismissible alert with a message.

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

  it('should display the alert message', () => {
    // GIVEN: Component with message input
    component.message = 'Error: Invalid input';
    fixture.detectChanges();

    // WHEN: Component renders
    const messageEl = fixture.debugElement.nativeElement.querySelector('[data-testid="alert-message"]');

    // THEN: Message is visible
    expect(messageEl?.textContent).toBe('Error: Invalid input');
  });

  // ❌ FAILS - Component doesn't exist yet
});
```

**Run**: `npm test -- alert.component.test.ts`
```
FAIL  alert.component.test.ts
  Cannot find component 'AlertComponent'
```

---

#### Step 2: GREEN — Write Minimum Implementation

```typescript
// alert.component.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  template: `<div data-testid="alert-message">{{ message() }}</div>`,
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
```

---

#### Step 3: REFACTOR — Add Accessibility and Dismiss

```typescript
// alert.component.ts (refactored)
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  template: `
    <div
      class="alert"
      role="alert"
      aria-live="polite"
      [attr.data-testid]="'alert-message'"
      [class]="'alert--' + severity()">
      <p class="alert__message">{{ message() }}</p>
      <button class="alert__close" aria-label="Dismiss alert" (click)="onDismiss()">✕</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  message = input<string>('');
  severity = input<'success' | 'error' | 'warning' | 'info'>('info');
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
```

✅ Test still passes

**What improved**:
- Accessibility attributes (`role="alert"`, `aria-live`, `aria-label`)
- Dismiss output and handler
- Severity levels
- `ChangeDetectionStrategy.OnPush`

---

## Example 3: Service with State Management

### Scenario: TodoService
Manage a todo list with add and complete operations.

#### Step 1: RED — Multiple Scenarios

```typescript
// todo.service.test.ts
import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TodoService] });
    service = TestBed.inject(TodoService);
  });

  it('should add a todo and update the list', () => {
    // GIVEN: Empty list
    // WHEN: Add todo
    service.addTodo('Buy milk');

    // THEN: Todo appears
    expect(service.todos()).toContainEqual(
      jasmine.objectContaining({ text: 'Buy milk', done: false })
    );
  });

  it('should mark a todo as complete', () => {
    // GIVEN: A todo in the list
    service.addTodo('Buy milk');
    const firstTodo = service.todos()[0];

    // WHEN: Mark as complete
    service.completeTodo(firstTodo.id);

    // THEN: Todo is done
    expect(service.todos()[0].done).toBe(true);
  });

  // ❌ FAILS - Service methods don't exist
});
```

**Run**: `npm test -- todo.service.test.ts`
```
FAIL  todo.service.test.ts
  service.addTodo is not a function
```

---

#### Step 2: GREEN — Write Minimum Implementation

```typescript
// todo.service.ts
import { Injectable, signal } from '@angular/core';

interface Todo { id: number; text: string; done: boolean; }

@Injectable({ providedIn: 'root' })
export class TodoService {
  todos = signal<Todo[]>([]);
  private nextId = 1;

  addTodo(text: string): void {
    this.todos.update((current) => [...current, { id: this.nextId++, text, done: false }]);
  }

  completeTodo(id: number): void {
    this.todos.update((current) =>
      current.map((todo) => todo.id === id ? { ...todo, done: true } : todo)
    );
  }
}
```

**Run**: `npm test -- todo.service.test.ts`
```
PASS  todo.service.test.ts
  should add a todo and update the list ✓
  should mark a todo as complete ✓
```

---

#### Step 3: REFACTOR — Add Validation and Persistence

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

@Injectable({ providedIn: 'root' })
export class TodoService {
  todos = signal<Todo[]>([]);
  private nextId = 1;
  private readonly MAX_TODOS = 100;

  constructor() {
    this.loadFromStorage();
  }

  addTodo(text: string): void {
    if (!text?.trim()) throw new Error('Todo text cannot be empty');
    if (this.todos().length >= this.MAX_TODOS) throw new Error(`Cannot exceed ${this.MAX_TODOS} todos`);

    this.todos.update((current) => [
      ...current,
      { id: this.nextId++, text: text.trim(), done: false, createdAt: new Date() },
    ]);
    this.saveToStorage();
  }

  completeTodo(id: number): void {
    if (!this.todos().find((t) => t.id === id)) throw new Error(`Todo with id ${id} not found`);

    this.todos.update((current) =>
      current.map((t) => t.id === id ? { ...t, done: true, completedAt: new Date() } : t)
    );
    this.saveToStorage();
  }

  deleteTodo(id: number): void {
    this.todos.update((current) => current.filter((t) => t.id !== id));
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('todos');
      if (stored) this.todos.set(JSON.parse(stored));
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
  should mark a todo as complete ✓
```

✅ Tests still pass

**What improved**:
- Input validation (empty check, max limit)
- Timestamps (`createdAt`, `completedAt`)
- Persistence via `localStorage`
- `deleteTodo` added for completeness

---

## Quick Checklist: RED → GREEN → REFACTOR

```markdown
### For Each Task Using TDD

#### RED Phase
- [ ] Write test that describes the feature
- [ ] Test has explicit GIVEN / WHEN / THEN
- [ ] Run tests — FAILS as expected
- [ ] Failure proves test is meaningful

#### GREEN Phase
- [ ] Write minimum code to pass
- [ ] No extra features beyond test requirement
- [ ] Run tests — PASSES

#### REFACTOR Phase
- [ ] Improve code structure / naming
- [ ] Extract constants, simplify logic
- [ ] Run tests — STILL PASSES
- [ ] No behavior changes, only improvements

#### Verify
- [ ] All tests pass: `npm test`
- [ ] Lint passes: `npm run lint`
- [ ] Type check: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
```
