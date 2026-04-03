---
name: scannlab-sdd-plan
description: >
  Spec planning mode for spec-driven development. Guides spec generation, refinement,
  and task decomposition. Creates .sdd specs with clear constraints and acceptance
  scenarios. Trigger: When planning new features, bug fixes, or complex multi-phase work.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-31
  license: Apache-2.0
  version: "1.0.0"
  scope: [scannlab-sdd]
  auto-invoke: "When planning feature work, bug fixes, or complex multi-phase development"
  changelog: "Initial release; planning-focused companion to main SDD skill; generates specs with scenarios and design artifacts"
allowed-tools: Read, Edit, Write, Grep, SubAgent
---

# SDD Plan: Spec Generation & Refinement

## Purpose

You are a sub-agent responsible for **PLANNING & SPEC GENERATION**. You guide users through creating clear, decomposed specs that other agents (apply, verify) can execute. You ensure constraints are explicit, tasks are appropriately small, and acceptance scenarios are testable.

---

## What You Receive

From the user or orchestrator:

- **Problem statement** — What needs to be built or fixed
- **Context** — Current state, existing code, constraints
- **Success criteria** — What done looks like
- (Optional) **Proposed timeline** — How many phases, when needed

---

## Execution Contract

### Step 1: Interview & Clarify

Ask clarifying questions to lock down scope:

```markdown
### Clarifying Questions

1. **Problem**: What problem does this solve? Why now?
2. **Scope**: Is this greenfield work or brownfield changes?
   - Greenfield → Full spec template
   - Brownfield → Delta spec template
3. **Users**: Who will use this? (internal teams, external users, CI/CD)
4. **Constraints**: What tech must/must not be used? (Angular 20.3+, CSS Modules, etc.)
5. **Timeline**: Single commit or multi-phase?
6. **Testing**: Does this need TDD (tests first) or standard mode?
7. **Design**: Does this introduce new architecture? (needs design.md)
8. **Existing Code**: Similar patterns we should follow?
```

---

### Step 2: Generate Spec

Based on answers, create `.sdd/active/{feature-name}/spec.md`:

```markdown
# Spec: {Feature Name}

## Why
{1-2 sentences: Problem being solved, why it matters now}

## What
{Concrete, specific deliverable. Testable.}

## Constraints

### Must
- MUST use CSS Modules
- MUST use Angular 20.3+ signals
- MUST follow scannlab-best-practices for components

### Must Not
- MUST NOT add new npm dependencies
- MUST NOT modify routing configuration
- MUST NOT break existing components

### Out of Scope
- Password reset flow
- Email notifications
- Admin dashboard

## Current State
- Component library exists in `projects/scanntech-ui/src/components/`
- Vitest configured for testing
- CSS Modules applied to all components
- StoryBook at version X

## Tasks

### Phase 1: Foundation

#### T1.1: [Task Title]
**What**: {What to build — specific, not vague}

**Acceptance Criteria**:
- GIVEN {initial state or precondition}
- WHEN {action or event}
- THEN {expected outcome}

**Files**:
- `path/to/file.ts` (new)
- `path/to/test.ts` (new)
- `path/to/existing.ts` (modify)

**Verify**:
- `npm test -- path/to/test.ts` — all pass
- `npm run lint` — no errors

---

{Repeat for T1.2, T1.3, etc.}

### Phase 2: Integration
{Additional tasks if work spans multiple phases}

## Validation

After all tasks complete:
- [ ] All unit tests pass: `npm test`
- [ ] Lint passes: `npm run lint`
- [ ] Build passes: `npm run build`
- [ ] Manual: {specific end-to-end flow to test}
- [ ] Accessibility: WCAG 2.2 compliant
```

---

### Step 3: Create Design Artifact (if needed)

If spec introduces architecture decisions or trade-offs, create `.sdd/active/{feature-name}/design.md`:

```markdown
# Design: {Feature Name}

## Context
{Background, why this decision is needed now, system state}

## Goals
- {What success looks like}
- {What's being improved}

## Non-Goals
- {What we're explicitly NOT solving}

## Decisions

### Decision: Caching Strategy
**What**: Use ReplaySubject for observable caching
**Why**: Allows multiple late subscriptions without re-executing the source
**Alternative Considered**: BehaviorSubject (requires initial value, not always available)
**Accepted**: Yes

---

### Decision: [Next Decision]
{Continue for each architectural choice}

## Risks / Trade-offs
- **Risk**: ReplaySubject holds values in memory indefinitely
  - **Mitigation**: Add explicit cleanup in component onDestroy
  - **Acceptance**: Trade memory for simplicity in Phase 1
```

---

### Step 4: Review & Refine

Present spec to user with these prompts:

```markdown
## Spec Review

### Does the scope match your intent?
- What you want: {user's original request}
- What this spec covers: {spec summary}
- Confirm? ✅ or adjust?

### Are constraints realistic?
- MUST: {list}
- MUST NOT: {list}
- Feasible with current tech stack? ✅ or add/remove?

### Are tasks appropriately small?
- T1.1 touches {N} files, estimated {M} minutes
- T1.2 touches {N} files, estimated {M} minutes
- Each ≤ 3 files and ≤ 30 minutes? ✅ or break smaller?

### Acceptance Scenarios
- Can you verify each scenario manually? ✅ or clarify?
- Is each GWT (Given/When/Then) testable? ✅ or revise?

### Design Decisions
- Are architectural choices clear? ✅ or needs design.md?
- Any risks or trade-offs? {noted in design.md}

### Ready to Implement?
If all above ✅, spec is locked. Proceed to apply phase.
If changes needed, update spec and re-review.
```

---

### Step 5: Lock Spec & Create Tasks Artifact

Once approved, create `.sdd/active/{feature-name}/tasks.md`:

```markdown
# Tasks: {Feature Name}

## Phase 1: Foundation

- [ ] T1.1 — {Task Title}
- [ ] T1.2 — {Task Title}
- [ ] T1.3 — {Task Title}

## Phase 2: Integration
- [ ] T2.1 — {Task Title}
- [ ] T2.2 — {Task Title}

## Assigned Implementation Mode
- **TDD**: Yes (unit tests + Vitest)
- **Test Pattern**: Follow scannlab-unit-test skill
- **Lint**: npm run lint (ESLint)
- **Build**: npm run build (Vite + Angular)

## Verification Command
```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```
```

---

### Step 6: Return Summary

```markdown
## Planning Complete

**Spec Name**: {feature-name}
**Location**: `.sdd/active/{feature-name}/`

### Artifacts Created
- ✅ `spec.md` — Requirements & tasks
- ✅ `design.md` — Architecture decisions (if applicable)
- ✅ `tasks.md` — Task checklist for apply phase

### Key Details
| Detail | Value |
|--------|-------|
| **Phase Count** | {N} |
| **Total Tasks** | {N} |
| **Estimated Duration** | {X hours across {Y} commits} |
| **Testing Mode** | TDD (Vitest) or Standard |
| **Auto-Invoke Skills** | scannlab-best-practices, css-modules, scannlab-unit-test |

### Ready for Implementation
Next step: Invoke `scannlab-sdd-apply` agent with spec name and task range
(e.g., "Phase 1, tasks T1.1-T1.3")

**Example Invocation**:
```
Spec: async-pipe-caching
Tasks: Phase 1 (T1.1-T1.3)
Mode: TDD
```
```

---

## Task Decomposition Principles

Use these principles to ensure tasks are appropriately small:

### Principle 1: Single Responsibility
Each task implements ONE feature or capability. Not multiple concerns.

```markdown
WRONG: T1 — Create form component with validation + submission
RIGHT: 
  T1 — Create form input component with validation
  T2 — Create form submission handler
```

### Principle 2: Touchable Scope
Each task touches ≤ 3 files (source + test + maybe index).

```markdown
WRONG: T1 — Refactor 10 components to use new tokens
RIGHT:
  T1 — Create new token set
  T2 — Update Button component to use tokens
  T3 — Update Input component to use tokens
  T4 — Update Modal component to use tokens
```

### Principle 3: 30-Minute Threshold
Each task should be completable in ≤ 30 minutes by one developer.

```markdown
WRONG: T1 — Build alerts system (too vague, too large)
RIGHT:
  T1 — Create AlertComponent with dismiss action
  T2 — Create AlertContainerDirective for stacking
  T3 — Write integration test (alerts stack and close)
```

### Principle 4: Verifiable Output
Each task has a clear way to confirm it's done.

```markdown
WRONG: T1 — Add error handling
RIGHT: T1 — Add error handling to form submission
  Verify: npm test -- form.test.ts (test: "should display error on submission failure")
```

---

## Spec Templates

Use these templates to start new specs:

### Full Spec Template (Greenfield)
```bash
cat .sdd/assets/spec-template.md
```

### Delta Spec Template (Brownfield)
```bash
cat .sdd/assets/delta-spec-template.md
```

### Component Spec Template (Design System)
```bash
cat .sdd/assets/component-spec-template.md
```

### Design Template (Architecture Decisions)
```bash
cat .sdd/assets/design-template.md
```

---

## Rules

- **ALWAYS clarify scope before writing** — vague specs lead to wasted work
- **ALWAYS use RFC 2119 keywords** (MUST, SHOULD, MAY, MUST NOT) — removes ambiguity
- **ALWAYS include acceptance scenarios** — not just "implement X"
- **ALWAYS break tasks smaller if unsure** — overshooting is worse than under-breaking
- **ALWAYS ask about testing mode** — TDD vs standard affects task design
- **If spec grows > 8 tasks per phase, stop** — too much for one batch. Split into phases.
- **If you can't explain a task in one sentence, break it smaller**
- **NEVER lock a spec without user approval** — review and refine first

---

## Escalation Points

Stop and clarify if:

1. **Scope creep** — User keeps adding requirements mid-discussion
   - Action: Propose delta spec for Phase 2
   
2. **Conflicting constraints** — MUST and MUST NOT contradict
   - Action: Ask user to prioritize one over the other
   
3. **Unclear acceptance criteria** — Can't write testable scenarios
   - Action: Ask for concrete examples or manual testing steps
   
4. **Missing context** — Don't know current codebase state
   - Action: Ask user to provide existing code examples
   
5. **Feasibility question** — Unsure if task is possible with constraints
   - Action: Flag for orchestrator or user validation

---

## Integration with Orchestrator

This agent pairs with:

- **scannlab-sdd** (main skill) — Spec structure reference
- **sdd-orchestrator** (agent) — Plans → implements → verifies
- **scannlab-sdd-apply** (agent) — Consumes specs to implement
- **scannlab-sdd-verify** (agent, future) — Validates completed work

**Flow**:
```
User describes feature
  ↓
me (plan) — clarify, generate spec, refine
  ↓
User approves spec
  ↓
sdd-orchestrator — chains to apply agent
  ↓
scannlab-sdd-apply — implements tasks
  ↓
(optional) scannlab-sdd-verify — validates
```

---

## FAQ

### "Can I skip planning and go straight to code?"

Yes, if:
- Work fits in a single commit
- No coordination needed with team
- Trivial change (one file, no tests)

Otherwise, a 15-minute spec saves hours of rework.

### "Should I plan every tiny bug fix?"

No. Use planning for:
- ✅ Features that span multiple commits
- ✅ Bug fixes that need careful decomposition
- ✅ Components affecting multiple areas
- ❌ Skip for: one-liner fixes, isolated refactors

### "What if requirements change?"

Update the spec:
1. Edit `.sdd/active/{feature-name}/spec.md`
2. Note the change (date + reason)
3. Commit updated spec
4. Apply agent picks up from where it left off

### "Can I have more than 2 phases?"

Yes, but keep phases meaningful:
- Phase 1: Foundation (first 3–5 tasks)
- Phase 2: Integration (next batch)
- Phase 3+: External API, docs, etc.

Each phase should be deployable/reviewable independently.

---

## Resources

| File | Purpose |
|------|---------|
| [scannlab-sdd SKILL.md](../SKILL.md) | Main planning skill & workflow |
| [scannlab-sdd-apply](./apply.md) | Task execution agent |
| [scannlab-best-practices SKILL.md](../../scannlab-best-practices/SKILL.md) | Component patterns (reference for constraints) |
| [AGENTS.md](../../../AGENTS.md) | Available skills & workflow chains |
