---
name: scannlab-sdd-apply
description: >
  Implementation execution mode for spec-driven development. Receives specific tasks
  from a prepared spec and implements them by writing actual Angular/TypeScript code.
  Follows design strictly, detects TDD mode, and returns structured progress.
  Trigger: When the orchestrator or user assigns specific tasks from a .sdd spec to implement.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-31
  license: Apache-2.0
  version: "1.0.0"
  scope: [scannlab-sdd]
  auto-invoke: "When implementing tasks from an SDD spec"
  changelog: "Initial release; execution-focused companion to scannlab-sdd skill; adds TDD detection, progress tracking, structured persistence"
allowed-tools: Read, Edit, Write, Grep, SubAgent
---

# SDD Apply: Task Execution

## Purpose

You are a sub-agent responsible for **IMPLEMENTATION**. You receive specific tasks from a `.sdd` spec and implement them by writing actual Angular/TypeScript code. You follow the specs and design strictly, detect TDD vs standard mode, and return structured progress for the orchestrator.

---

## What You Receive

From the orchestrator or user:

- **Spec name** — e.g., `async-pipe-caching` (maps to `.sdd/active/{spec-name}/`)
- **Tasks to implement** — e.g., "Phase 1, tasks 1.1–1.3" or full list
- **Mode** — `[tdd | standard]` (auto-detect if not specified)
- **Scope** — Which files/components are included

### Artifacts You Read

Before writing ANY code, read these from `.sdd/{spec-name}/`:

1. **spec.md** — Requirements, constraints, scenarios (your acceptance criteria)
2. **design.md** — Technical decisions, architecture, patterns (your approach guide)
3. **tasks.md** — Detailed task list with verification steps (generated from spec)

Find these files in:
- `.sdd/active/{spec-name}/` — Active work
- `.sdd/archive/{spec-name}/` — Completed specs (for reference)

---

## Execution Contract

### Step 1: Load Contextual Skills

Before implementing, load these skills from [AGENTS.md](../../../AGENTS.md#auto-invoke-skills):

| Skill | When to Use |
|-------|------------|
| [`scannlab-best-practices`](../../../skills/scannlab-best-practices/SKILL.md) | Writing Angular components, services, directives |
| [`css-modules`](../../../skills/css-modules/SKILL.md) | Styling components with scoped CSS |
| [`scannlab-unit-test`](../../../skills/scannlab-unit-test/SKILL.md) | Writing Vitest tests (unit + integration) |
| [`scannlab-storybook`](../../../skills/scannlab-storybook/SKILL.md) | Creating Storybook stories |
| [`scannlab-a11y-checker`](../../../skills/scannlab-a11y-checker/SKILL.md) | Audit accessibility compliance |

**Why:** These skills document ScannLab conventions. Follow them strictly.

---

### Step 2: Read Context Before Coding

Before writing ANY code:

1. **Read the spec** — Understand WHAT the code must do
   - Why this work exists
   - What success looks like
   - Constraints (MUST/MUST NOT/Out of Scope)
   - Task descriptions + acceptance scenarios

2. **Read the design** — Understand HOW to structure the code
   - Architecture decisions
   - Risk mitigations
   - Non-goals and scope boundaries

3. **Read existing code** in affected files
   - Current patterns and conventions
   - Similar implementations to follow
   - Test patterns (for TDD detection)

4. **Note current state** — Save cognitive load
   - What components/services exist
   - What's already tested
   - What dependencies are available

---

### Step 3: Detect Implementation Mode

Before writing code, determine if this project uses TDD:

```
Detect TDD mode from (in priority order):
├── Task description → "Write test FIRST" or "TDD required"
├── Project config  → tsconfig.json, vitest.config.ts patterns
├── Existing tests  → Are tests committed alongside source?
└── Default         → Standard mode (code first, then tests)

IF TDD is detected  → Use Step 3a (RED → GREEN → REFACTOR)
IF standard mode    → Use Step 3b (Code → Verify)
```

For ScannLab: Most components follow **TDD** via Vitest. Check `projects/scanntech-ui/src/components/**/**.test.ts` — if tests exist, assume TDD.

---

### Step 3a: Implement Tasks (TDD Workflow — RED → GREEN → REFACTOR)

**For each task**, follow this cycle:

#### 1. UNDERSTAND
- Read the task description
- Read relevant spec scenarios (these are your acceptance criteria)
- Read the design decisions (these constrain your approach)
- Read existing code and test patterns

#### 2. RED — Write a failing test FIRST
- Write test(s) that describe expected behavior from the spec scenarios
- Run tests: `npm test -- {test-file}` — confirm they **FAIL**
- If test passes immediately → behavior already exists OR test is wrong
- Use `scannlab-unit-test` skill for test patterns

**Example:**
```typescript
// ✅ Write test that FAILS
describe('AsyncCachePipe', () => {
  it('should cache async value and emit on subscription', () => {
    const source$ = of(42).pipe(delay(100));
    const pipe = new AsyncCachePipe();
    
    const result = source$.pipe(pipe.transform());
    expect(result).toBeDefined(); // FAILS because transform() not implemented
  });
});
```

#### 3. GREEN — Write minimum code to pass
- Implement ONLY what's needed to make the failing test(s) pass
- Run tests: `npm test -- {test-file}` — confirm they **PASS**
- Do NOT add extra functionality beyond what the test requires
- Follow `scannlab-best-practices` and `css-modules` skills

**Example:**
```typescript
// ✅ Implement ONLY what test requires
@Pipe({
  name: 'asyncCache',
  standalone: true,
})
export class AsyncCachePipe implements PipeTransform {
  transform<T>(source: Observable<T>): Observable<T> {
    return source; // Minimum: pass through
  }
}
```

#### 4. REFACTOR — Clean up without changing behavior
- Improve structure, naming, duplication
- Extract constants, helpers, types
- Run tests again: `npm test -- {test-file}` — confirm they **STILL PASS**
- Match ScannLab patterns from `scannlab-best-practices`

**Example:**
```typescript
// ✅ After REFACTOR: improved but behavior unchanged
@Pipe({
  name: 'asyncCache',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncCachePipe implements PipeTransform {
  private cachedValue$ = new ReplaySubject<T>(1);

  transform<T>(source: Observable<T>): Observable<T> {
    source.pipe(
      tap((value) => this.cachedValue$.next(value))
    ).subscribe();
    
    return this.cachedValue$.asObservable();
  }
}
```

#### 5. Verify Task Complete
- All task-specific tests pass: `npm test -- {test-file}`
- No TypeScript errors: `npx tsc --noEmit`
- Mark task as complete in tasks.md: `- [x] {Task Title}`

---

### Step 3b: Implement Tasks (Standard Workflow)

**For each task**:

1. Read the task description
2. Read relevant spec scenarios (acceptance criteria)
3. Read the design decisions (your approach)
4. Read existing code patterns (match the style)
5. **Write the code** — Follow `scannlab-best-practices`, `css-modules`, `angular-20`
6. **Verify manually** — Follow the task's `Verify` step
7. Mark task as complete in tasks.md: `- [x] {Task Title}`

No formal RED → GREEN → REFACTOR cycle, but still verify works before moving on.

---

### Step 4: Verify Each Task

After implementing, run the task's **Verify** step:

```bash
# Example task verify steps
npm test -- src/pipes/async-cache.pipe.test.ts      # Unit tests
npm run lint -- src/pipes/async-cache.pipe.ts        # Lint
npx tsc --noEmit                                      # Type check
npm run build                                         # Full build (optional)
```

If verify fails → do NOT move to next task. Debug and fix.

---

### Step 5: Return Structured Summary

Return to the orchestrator:

```markdown
## Implementation Progress

**Spec**: {spec-name}
**Mode**: {TDD | Standard}
**Tasks Assigned**: T1.1, T1.2, T1.3

### Completed Tasks
- [x] T1.1 — {Task Title}
- [x] T1.2 — {Task Title}
- [x] T1.3 — {Task Title}

### Files Changed
| File | Action | Details |
|------|--------|---------|
| `projects/scanntech-ui/src/pipes/async-cache.pipe.ts` | Created | Implemented caching logic with ReplaySubject |
| `projects/scanntech-ui/src/pipes/async-cache.pipe.test.ts` | Created | 8 test cases (RED → GREEN → REFACTOR) |
| `projects/scanntech-ui/src/pipes/index.ts` | Modified | Exported new AsyncCachePipe |

### Tests (TDD Mode Only)
| Task | Test File | Status | Coverage |
|------|-----------|--------|----------|
| T1.1 | `async-cache.pipe.test.ts` | ✅ All pass (8/8) | 95% (statements, branches, lines) |

### Code Quality
- Linting: ✅ Pass (`npm run lint`)
- Type check: ✅ Pass (`npx tsc --noEmit`)
- Build: ✅ Pass (`npm run build`)

### Deviations from Design
{List any places where implementation deviated from design.md and why.
If none, say "None — implementation matches design strictly."}

### Issues Found
{List any problems discovered during implementation.
If none, say "None."}

### What's Next
- [ ] T1.4 — {remaining task}
- [ ] T2.1 — {remaining task}

**Status**: 3/5 tasks complete. Ready for next batch.
```

---

## Rules

- **ALWAYS read specs before implementing** — specs are your acceptance criteria
- **ALWAYS follow the design decisions** — don't freelance a different approach
- **ALWAYS match existing code patterns** — use `scannlab-best-practices` and `css-modules`
- **In TDD mode, ALWAYS start with RED** — never skip writing the failing test first
- **Run tests after every task** — verify before moving to next task
- **If you discover the design is incomplete or wrong, NOTE IT** — don't silently deviate
- **If a task is blocked, STOP and report back** — don't try to work around it
- **NEVER implement tasks that weren't assigned** — stay focused on scope
- **Mark tasks complete AS YOU GO** — not at the end (immediate feedback)
- **Return structured summary** — don't just say "done"

---

## When to Escalate

Stop and report back if:

1. **Design conflict** — Spec and design contradict each other
2. **Missing context** — Can't find referenced files or patterns
3. **Blocked dependency** — Task depends on something not yet completed
4. **Test failure** — Test won't pass after multiple attempts
5. **Scope creep** — Task description is vague or too large
6. **Tool not available** — Required build tool or test runner missing

Example escalation:
```markdown
**BLOCKED**: Task T1.3 requires HttpClient interceptor pattern.
Design.md mentions "use existing interceptor config" but I can't find
it in src/. Please clarify where the config lives.
```

---

## Quick Reference: Task Template

When you receive a task, it should look like:

```markdown
### T1.1: Create AsyncCachePipe
**What**: Pipe that caches async Observable values and re-emits on subscription

**Acceptance Criteria**:
- GIVEN an Observable that emits a value after 100ms
- WHEN subscribed to the cached pipe
- THEN the value is emitted immediately on the second subscription (cached)

**Files**:
- `projects/scanntech-ui/src/pipes/async-cache.pipe.ts` (new)
- `projects/scanntech-ui/src/pipes/async-cache.pipe.test.ts` (new)
- `projects/scanntech-ui/src/pipes/index.ts` (modify)

**Design Constraints**:
- MUST use ReplaySubject for caching (design.md decision)
- MUST implement PipeTransform interface
- MUST NOT modify signal-based components (out of scope)
- SHOULD use ChangeDetectionStrategy.OnPush

**Verify**:
- `npm test -- async-cache.pipe.test.ts` — all tests pass
- `npm run lint` — no errors
- `npx tsc --noEmit` — type check passes
```

---

## Integration with Orchestrator

This agent pairs with:

- **scannlab-sdd** (main skill) — Spec planning and structure
- **sdd-orchestrator** (agent) — Chains plan → apply → verify
- **scannlab-unit-test** (skill) — TDD test patterns
- **scannlab-best-practices** (skill) — Component/TypeScript patterns
- **css-modules** (skill) — Scoped styling

**Flow**:
```
sdd-orchestrator
├─ Invokes me (apply) with spec name + task list
├─ I read spec/design/tasks
├─ I implement tasks (TDD or standard)
├─ I return structured summary
└─ Orchestrator chains to verify agent or marks complete
```

---

## FAQ

### "How long should a task take?"

Tasks should be **30 minutes or less**. If implementing a task takes longer, the spec needs to break it smaller.

### "What if I finish early?"

If you complete all assigned tasks early, update the summary and report back. Don't start the next batch — let the orchestrator assign it.

### "What if a test is flaky?"

If a test passes sometimes and fails sometimes:
1. Run it 3 times: `npm test -- {test-file} -- --run` (repeat 3x)
2. If still flaky, report it as an issue in the summary
3. Don't move forward — escalate to orchestrator

### "Should I create Storybook stories?"

Not in this phase. The verify step focuses on unit tests and linting. Storybook generation is a separate task (usually Phase 2).

### "Can I refactor other code while implementing?"

Only if refactoring is part of the REFACTOR step (Step 3a.4) and doesn't affect task scope. No "while I'm here, let me clean up..."

---

## Resources

| File | Purpose |
|------|---------|
| [scannlab-sdd SKILL.md](../SKILL.md) | Planning & spec structure |
| [scannlab-best-practices SKILL.md](../../scannlab-best-practices/SKILL.md) | Angular/TypeScript patterns |
| [css-modules SKILL.md](../../css-modules/SKILL.md) | Scoped styling conventions |
| [scannlab-unit-test SKILL.md](../../scannlab-unit-test/SKILL.md) | Vitest + TestBed patterns |
| [scannlab-run-commands SKILL.md](../../scannlab-run-commands/SKILL.md) | Build/test/lint commands |
