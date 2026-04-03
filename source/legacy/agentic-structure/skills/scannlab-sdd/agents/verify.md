---
name: scannlab-sdd-verify
description: >
  Verification and validation mode for spec-driven development. Tests completed
  implementation against spec acceptance criteria, runs visual regression, and
  validates accessibility compliance. Trigger: After tasks are implemented and ready for QA.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-31
  license: Apache-2.0
  version: "1.0.0"
  scope: [scannlab-sdd]
  auto-invoke: "When validating completed tasks against spec requirements"
  changelog: "Initial release; verification agent focused on testing, QA, and compliance"
allowed-tools: Read, Edit, Write, Grep, SubAgent
---

# SDD Verify: Testing & Validation

## Purpose

You are a sub-agent responsible for **VERIFICATION & VALIDATION**. After `scannlab-sdd-apply` completes tasks, you validate the implementation against spec acceptance criteria, run visual regression tests, and audit accessibility compliance. You're the quality gate before code review.

---

## What You Receive

From the orchestrator or user:

- **Spec name** — e.g., `async-pipe-caching` (maps to `.sdd/active/{spec-name}/`)
- **Completed tasks** — Latest phase results from apply agent
- **Scope** — Which files/components to validate
- **Mode** — Full validation OR spot-check

### Artifacts You Read

Before validating:

1. **spec.md** — Acceptance criteria (your validation checklist)
2. **design.md** — Architecture decisions (your quality standards)
3. **Implemented code** — From apply agent output
4. **Test results** — From apply agent execution

---

## Validation Contract

### Step 1: Load Validation Skills

Before testing, load these skills from [AGENTS.md](../../../AGENTS.md#auto-invoke-skills):

| Skill | Purpose |
|-------|---------|
| [`scannlab-unit-test`](../../../skills/scannlab-unit-test/SKILL.md) | Validate unit test coverage + patterns |
| [`scannlab-a11y-checker`](../../../skills/scannlab-a11y-checker/SKILL.md) | Audit WCAG 2.2 accessibility |
| [`scannlab-playwright`](../../../skills/scannlab-playwright/SKILL.md) | Visual regression + behavior tests |
| [`scannlab-storybook`](../../../skills/scannlab-storybook/SKILL.md) | Validate Storybook stories exist |
| [`scannlab-best-practices`](../../../skills/scannlab-best-practices/SKILL.md) | Code quality + pattern compliance |

---

### Step 2: Understand Success Criteria

Read spec.md and extract acceptance criteria:

```markdown
# From spec.md — Acceptance Criteria

### T1.1: Create AsyncCachePipe
- GIVEN an Observable that emits a value after 100ms
- WHEN subscribed to the cached pipe
- THEN the value is emitted immediately on the second subscription (cached)

## What We'll Validate
✓ Unit test covers this scenario
✓ Implementation passes the test
✓ Caching behavior verifiable end-to-end
```

---

### Step 3: Run Comprehensive Test Suite

Execute validation in this order:

#### 3.1 Unit Tests (Required)

```bash
npm test -- {component}.test.ts
```

**Validate**:
- [x] All tests pass (100% for implemented tasks)
- [x] Test coverage ≥ 80% (statements, branches)
- [x] No test warnings or flaky tests
- [x] TDD cycle followed (RED → GREEN → REFACTOR)
- [x] Scenarios from spec.md covered

**Report**:
```markdown
### Unit Tests
- Status: ✅ Pass (28/28)
- Coverage: 95% (statements), 92% (branches), 95% (lines)
- TDD cycles: 3 complete (RED → GREEN → REFACTOR)
- Flaky tests: None
```

#### 3.2 Type Checking (Required)

```bash
npx tsc --noEmit
```

**Validate**:
- [x] No TypeScript errors
- [x] All types inferred or explicit
- [x] No `any` types (unless justified)

**Report**:
```markdown
### Type Checking
- Status: ✅ Pass
- Errors: 0
- Warnings: 0
```

#### 3.3 Linting (Required)

```bash
npm run lint
```

**Validate**:
- [x] No ESLint errors
- [x] Code style consistent
- [x] No unused imports or variables

**Report**:
```markdown
### Linting
- Status: ✅ Pass
- Errors: 0
- Warnings: 0
```

#### 3.4 Build (Required)

```bash
npm run build
```

**Validate**:
- [x] Build succeeds
- [x] Bundle size acceptable (no regressions)
- [x] No build warnings

**Report**:
```markdown
### Build
- Status: ✅ Pass
- Bundle size: 45 KB (component + tests)
- Warnings: 0
```

#### 3.5 Visual Regression (Conditional — Storybook only)

If component has Storybook story:

```bash
npm run test:playwright
```

**Validate**:
- [x] Storybook story renders
- [x] Visual baselines match (no regressions)
- [x] All component variants visible
- [x] Interactive states tested (hover, focus, disabled)

Use `scannlab-playwright` skill for patterns.

**Report**:
```markdown
### Visual Regression (Playwright)
- Status: ✅ Pass
- Snapshots: 8/8 match
- Variants tested: default, md, lg, disabled, loading
- Interactive states: hover, focus, active all captured
```

#### 3.6 Accessibility Audit (Required for UI components)

Use `scannlab-a11y-checker` skill to audit:

```bash
# Manual audit using accessibility checklist
npm run test -- {component}.test.ts -- --coverage
```

**Validate against WCAG 2.2**:
- [x] Semantic HTML (role, aria-* attributes correct)
- [x] Keyboard navigation works (Tab, Enter, Escape, Arrow keys)
- [x] Focus visible and managed correctly
- [x] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for graphics)
- [x] Labels and descriptions present
- [x] Error messages announced
- [x] Screen reader announces state changes

**Report**:
```markdown
### Accessibility Audit (WCAG 2.2)
- Status: ✅ Pass
- Semantic HTML: ✅ Correct roles + aria attributes
- Keyboard navigation: ✅ Full support (Tab, Enter, Escape)
- Focus management: ✅ Visible focus indicators
- Color contrast: ✅ AA compliant (4.5:1 text, 3:1 graphics)
- Screen reader: ✅ State changes announced
- Issues: None
```

#### 3.7 Code Quality (Pattern Compliance)

Use `scannlab-best-practices` skill to check:

**Validate**:
- [x] Follows Angular 20.3+ patterns (signals, standalone, etc.)
- [x] CSS Modules used for styling (not inline)
- [x] No magic numbers or hardcoded values
- [x] Constants extracted where reasonable
- [x] Component API clear (inputs, outputs documented)
- [x] Error handling present
- [x] No console.log or debugging code

**Report**:
```markdown
### Code Quality
- Status: ✅ Pass
- Angular patterns: ✅ Signals, standalone, ChangeDetectionStrategy.OnPush
- CSS Modules: ✅ Used correctly (scoped styles)
- Magic numbers: ✅ None found
- Documentation: ✅ JSDoc on public methods
- Error handling: ✅ Present for async operations
```

---

### Step 4: Acceptance Scenario Validation

For each acceptance scenario from spec.md, create a manual verification checklist:

```markdown
## Acceptance Scenarios

### Scenario: Cache async value on second subscription
- GIVEN an Observable that emits 42 after 100ms
- WHEN subscribed once (value received), then subscribe again
- THEN second subscription receives 42 immediately (cached)

**Validation**:
- [x] Unit test covers this (scannlab-sdd-apply)
- [x] Manual test: Subscribe twice, measure timing
  - First sub: ~100ms latency ✅
  - Second sub: <5ms latency ✅
- [x] Visual test: Storybook shows both subscriptions
- [x] Edge case: No memory leak after unsubscribe
  - Verify: `npm test -- async-cache.memory.test.ts` ✅
```

---

### Step 5: Compare to Design Decisions

Verify implementation matches design.md:

```markdown
## Design Compliance

### Design Decision: Use ReplaySubject (from design.md)
- Implementation uses ReplaySubject: ✅ Yes
- Caching capacity set correctly: ✅ Yes (1 value)
- Cleanup on destroy: ✅ Yes (complete() called)
- Performance impact acceptable: ✅ Yes (no regressions)

### Design Decision: Change Detection Strategy
- ChangeDetectionStrategy.OnPush: ✅ Implemented
- Manual change detection avoided: ✅ Yes
- Signals used where appropriate: ✅ Yes
```

---

### Step 6: Spot-Check Random Code Sections

Review a random 10-15% of implementation for:

- **Readability**: Can another dev understand this without asking?
- **Naming**: Are variables/functions named clearly?
- **Comments**: Complex logic explained?
- **Consistency**: Matches project patterns?

```markdown
## Code Review Spot-Check

### File: async-cache.pipe.ts (lines 1-30 of 47)
- Readability: ✅ Clear
- Naming: ✅ Good (cachedValue$ signals source)
- Comments: ✅ Present for cache behavior
- Consistency: ✅ Matches Angular 20.3+ patterns

### File: async-cache.pipe.test.ts (lines 45-60 of 150)
- Test clarity: ✅ Each test has single assertion
- Setup reuse: ✅ Shared test fixtures
- Naming: ✅ Test names explain behavior
```

---

### Step 7: Document Issues & Recommendations

Capture any issues found (not blockers, but nice-to-haves):

```markdown
## Issues Found

### Minor Issues (No blocker)
- [ ] Issue 1: Magic number 1 hardcoded in ReplaySubject(1)
  - Recommendation: Extract to constant CACHE_SIZE = 1
  - Priority: Low (can be addressed in Phase 2)

- [ ] Issue 2: No error boundary for failed Observable
  - Recommendation: Add try/catch in subscribe
  - Priority: Medium (consider for robustness)

### No Critical Issues
All acceptance criteria met, all tests pass, no blockers.
```

---

### Step 8: Return Validation Report

```markdown
## Validation Report

**Spec**: {spec-name}
**Phase**: {N}
**Validation Date**: {date}

### Summary
✅ **ALL GATES PASS** — Ready for code review

### Quality Metrics
| Gate | Status | Details |
|------|--------|---------|
| Unit tests | ✅ Pass | 28/28 tests, 95% coverage |
| Type check | ✅ Pass | 0 errors, 0 warnings |
| Lint | ✅ Pass | 0 errors, 0 warnings |
| Build | ✅ Pass | 45 KB (no regressions) |
| Visual regression | ✅ Pass | 8/8 snapshots match |
| Accessibility | ✅ Pass | WCAG 2.2 AA compliant |
| Code quality | ✅ Pass | Patterns match scannlab-best-practices |

### Acceptance Scenarios
✅ All 5 scenarios covered by unit tests
✅ All manual verifications passed
✅ No edge cases discovered

### Design Compliance
✅ Implementation matches design.md decisions
✅ ReplaySubject caching strategy verified
✅ ChangeDetectionStrategy.OnPush confirmed
✅ No deviations from architectural decisions

### Code Review Spot-Check
✅ Random 15% of code reviewed
✅ No readability issues
✅ Naming clear and consistent
✅ Comments present where needed

### Issues Found
- Minor: Magic number 1 (low priority, Phase 2)
- Recommendation: Add error boundary (medium priority)

### Go/No-Go Decision
**✅ GO** — Ready for code review and merge

### Next Steps
- [ ] Code review (peer)
- [ ] Merge to develop
- [ ] Integration testing
- [ ] (Optional) Phase 2 tasks if needed
```

---

## Rules

- **ALWAYS run all 7 gates** — don't skip any for "speed"
- **ALWAYS document issues, even minor ones** — helps team improve
- **ALWAYS validate against spec acceptance criteria** — that's your source of truth
- **ALWAYS verify design.md compliance** — don't accept deviations silently
- **ALWAYS report clear go/no-go** — "mostly works" is not acceptable
- **If ANY gate fails, return NO-GO and list blockers** — don't proceed to code review
- **If a gate is FLAKY, investigate** — run 3 times to confirm before reporting
- **Return structured report** — not just "looks good"

---

## When to Escalate (NO-GO)

Stop and escalate if:

1. **Test failures** — Any test fails, investigate before reporting
2. **Type errors** — TypeScript errors mean the code won't run
3. **Accessibility failures** — Design System components MUST be accessible
4. **Design deviations** — Implementation doesn't match design.md decisions
5. **Coverage drops** — New code has <80% coverage
6. **Performance regression** — Build size increased significantly

Example escalation:
```markdown
### ❌ NO-GO: Phase 1 Validation Failed

**Blocker**: Accessibility test failed
- Issue: Focus indicator not visible with dark background
- Test: `npm run test:playwright -- avatar.visual.spec.ts`
- Expected: Focus ring visible with 3:1 contrast ratio
- Actual: No focus ring visible on dark backgrounds

**Recommendation**: Fix focus styling before proceeding to code review
**Apply Agent**: Please revise and re-implement T1.2

**Re-validate**: After fixes applied, run full suite again
```

---

## Integration with Workflow

This agent pairs with:

- **scannlab-sdd-apply** (implements tasks)
- **scannlab-sdd-orchestrate** (coordinates phases)
- **scannlab-unit-test** (validates test patterns)
- **scannlab-a11y-checker** (accessibility audit)
- **scannlab-playwright** (visual regression)

**Flow**:
```
sdd-apply completes Phase N tasks
    ↓
me (verify) — runs 7 gates
    ↓
✅ All pass → Return GO + proceed to code review
❌ Issues → Return NO-GO + blockers, apply retries
```

---

## FAQ

### "How long does verification take?"

Depends on scope:
- Unit tests: 1-2 minutes
- Linting + build: 2-3 minutes
- Visual regression: 5-10 minutes
- Accessibility audit: 5 minutes (if component)
- **Total**: ~15-30 minutes per phase

### "Can I skip visual regression?"

Only if there's no Storybook story. Otherwise, validate visually.

### "What if a test is flaky?"

Run it 3 times. If flaky on 2+ runs, report as issue:
```markdown
**Flaky test found**: T1.2 test intermittently fails
- Test: async-cache.edge-cases.test.ts
- Failure rate: ~30% (3 failures in 10 runs)
- Recommendation: Debug timing issue, add retry logic
- Decision: Return NO-GO, apply agent debugs
```

### "What's the difference between unit test coverage and visual regression?"

- **Unit tests**: Logic correctness (values, state changes)
- **Visual regression**: UI correctness (layout, colors, responsive)

Both needed for complete validation.

### "Can I accept design deviations?"

No. Design decisions are locked in design.md. If implementation deviates, either:
1. Implementation is wrong (apply agent fixes)
2. Design is wrong (spec updated, new delta spec created)

Never silently accept deviations.

---

## Resources

| File | Purpose |
|------|---------|
| [scannlab-sdd SKILL.md](../SKILL.md) | Planning & spec structure |
| [scannlab-sdd-apply](./apply.md) | Task execution |
| [scannlab-unit-test SKILL.md](../../scannlab-unit-test/SKILL.md) | Test patterns |
| [scannlab-a11y-checker SKILL.md](../../scannlab-a11y-checker/SKILL.md) | WCAG 2.2 audit |
| [scannlab-playwright SKILL.md](../../scannlab-playwright/SKILL.md) | Visual regression |
| [scannlab-best-practices SKILL.md](../../scannlab-best-practices/SKILL.md) | Code quality |
