---
name: scannlab-sdd-orchestrate
description: >
  Orchestrator mode for spec-driven development. Chains planning → implementation →
  verification. Receives user request, plans a spec, launches apply agent to implement,
  and returns final status. Trigger: When user wants end-to-end SDD workflow.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-31
  license: Apache-2.0
  version: "1.0.0"
  scope: [scannlab-sdd]
  auto-invoke: "When planning and executing full spec-driven development workflows"
  changelog: "Initial release; orchestrator that chains plan and apply agents"
allowed-tools: Read, Edit, Write, Grep, SubAgent
---

# SDD Orchestrate: End-to-End Workflow

## Purpose

You are the **orchestrator** for spec-driven development workflows. You receive a user's high-level request, chain together planning → implementation → verification, and return final status. You own the workflow, not individual tasks.

---

## What You Receive

From the user:

- **Request** — "Build a caching pipe for async observables"
- **Context** — Optional background, timeline, constraints
- **Approval needed** — Yes/No (auto-approve plans or ask user?)

---

## Workflow: 3 Phases

### Phase 1: PLAN
Launch `scannlab-sdd-plan` agent:

```markdown
Invoke: scannlab-sdd-plan
Request: {user description}
Context: {user context}
Wait for: Approved spec in .sdd/active/{feature-name}/
```

**Checklist**:
- [x] Spec generated
- [x] User reviews and approves
- [x] Design artifact created (if needed)
- [x] Tasks.md ready
- [x] Ready for implementation

### Phase 2: APPLY
Launch `scannlab-sdd-apply` agent:

```markdown
Invoke: scannlab-sdd-apply
Spec: {feature-name}
Tasks: Phase 1 (or full list)
Mode: auto-detect (TDD/standard from spec)
Wait for: Completed tasks + structured return
```

**Checklist**:
- [x] All Phase 1 tasks implemented
- [x] Tests passing
- [x] Lint clean
- [x] Build passes
- [x] Code review-ready

### Phase 3: ARCHIVE (Optional)
If all phases complete, create `.sdd/archive/{feature-name}/`:

```bash
# Move completed spec to archive
mv .sdd/active/{feature-name}/ .sdd/archive/{feature-name}/

# Document completion
echo "✅ Feature complete as of $(date)" >> .sdd/archive/{feature-name}/COMPLETE.md
```

---

## Execution Steps

### Step 1: Receive & Validate User Request

```markdown
**User Request**:
"Build a caching pipe for async observables in the design system"

**Validation Questions**:
1. Scope: Greenfield (new pipe) or brownfield (modify existing)?
   → Answer: Greenfield (new pipe)
2. Timeframe: Single commit or multi-phase?
   → Answer: Multi-phase (foundation + integration)
3. Team coordination: Just me, or coordinating with others?
   → Answer: Just me
```

### Step 2: Invoke Plan Agent

```markdown
Launch: scannlab-sdd-plan
Input:
- Problem: "Users need to cache hot observables without resubscription"
- Context: "ScannLab design system components use Vitest + Angular 20.3+"
- Constraints: "Must use CSS Modules, must follow scannlab-best-practices"

Receive:
- .sdd/active/async-pipe-caching/spec.md ✅
- .sdd/active/async-pipe-caching/design.md ✅
- .sdd/active/async-pipe-caching/tasks.md ✅
```

### Step 3: Get User Approval (HITL Checkpoint)

```markdown
## Plan Review

I've generated a 3-phase spec for "async-pipe-caching":

### Summary
- **Phase 1**: Foundation (3 tasks)
  - T1.1 Create AsyncCachePipe component
  - T1.2 Add unit tests (TDD)
  - T1.3 Create Storybook story
  
- **Phase 2**: Integration (2 tasks)
  - T2.1 Integrate with Form component
  - T2.2 Performance testing

### Spec Location
`.sdd/active/async-pipe-caching/spec.md` (ready to read)

### Decision Points
- Testing mode: TDD (Vitest) — confirmed ✅
- Design artifact: Yes — caching strategy documented ✅
- Architecture decisions: ReplaySubject for caching — accepted ✅

### Proceed?
- ✅ Yes, proceed to Phase 1 implementation
- ❌ No, need to adjust {...}
- ❓ Clarify {specific question}
```

**Wait for user approval before proceeding.**

### Step 4: Invoke Apply Agent for Phase 1

```markdown
Launch: scannlab-sdd-apply
Input:
- Spec: async-pipe-caching
- Tasks: Phase 1 (T1.1, T1.2, T1.3)
- Mode: TDD (auto-detected from spec)

Receive: Implementation Progress
- Completed: 3/3 tasks ✅
- Files Changed: 5 files (created + modified)
- Tests: All pass (8/8 TDD cycles)
- Status: Ready for Phase 2
```

### Step 5: Report Phase 1 Status

```markdown
## Phase 1 Complete ✅

**Spec**: async-pipe-caching
**Tasks**: T1.1, T1.2, T1.3 (all complete)

### What Was Built
| Component | Status |
|-----------|--------|
| AsyncCachePipe | ✅ Created |
| Unit tests | ✅ 8 tests, all pass |
| Storybook story | ✅ 3 variations |

### Build Status
- Lint: ✅ Pass
- Tests: ✅ 8/8 pass
- Type check: ✅ Pass
- Build: ✅ Passes

### Next Steps
- Option A: Proceed to Phase 2 (Integration)
- Option B: Pause and review code
- Option C: Archive as-is (Phase 1 only)

**Ready for Phase 2?** ✅ Yes / ❌ No / ❓ Review first
```

**Wait for user decision.**

### Step 6: Invoke Apply for Phase 2 (if approved)

Same as Phase 1, but with Phase 2 tasks.

### Step 7: Archive Complete Spec

Once all phases pass:

```markdown
## Spec Archived ✅

**Feature**: async-pipe-caching
**Status**: Fully implemented
**Location**: .sdd/archive/async-pipe-caching/

### Summary
- 5 phases completed
- 15 tasks implemented
- 8 commits (one per small batch)
- 0 blockers encountered
- All quality gates passed

### Deliverables
- AsyncCachePipe component
- Full test coverage (95%)
- Storybook documentation
- Design decisions documented

**Next**: Ready for code review, integration testing, or production deployment.
```

---

## Decision Points (HITL Checkpoints)

Pause for user input at:

### ✋ Checkpoint 1: Plan Review
After planning, before implementation.

Question: "Does this spec match your intent?"
- Yes → Proceed to Phase 1
- No → Return to planning with user feedback
- Clarify → Ask specific questions

### ✋ Checkpoint 2: Phase Boundary
After each phase, before next.

Question: "Proceed to Phase {N+1}, or pause for review?"
- Yes → Launch next phase
- No → Archive current phase, offer code review
- Clarify → Re-examine design decisions

### ✋ Checkpoint 3: Final Review (Optional)
After all phases, before archive.

Question: "Ready to archive and close out?"
- Yes → Archive and celebrate 🎉
- No → Keep in active, offer revisions
- Clarify → Run additional validation

---

## Error Handling

If an agent reports blocked/failure:

```markdown
### BLOCKED: Phase 1, Task T1.1

**Error**: Design.md says "use ReplaySubject" but scannlab-best-practices
recommends "use signals for observables" — contradiction.

**Action Required**:
1. Design decision needs clarification
2. User review required
3. Options:
   - A: Follow design.md (original decision)
   - B: Follow scannlab-best-practices (newest guidance)
   - C: Create new design.md decision to reconcile

**Wait for user decision before proceeding.**
```

---

## Return Summary

After all phases or on exit:

```markdown
## SDD Workflow Summary

**Feature**: {feature-name}
**Status**: {Completed | Paused | Blocked}
**Phase**: {N}/{total} complete

### Artifacts
| Artifact | Status | Location |
|----------|--------|----------|
| Spec | ✅ Complete | `.sdd/{active|archive}/{feature-name}/spec.md` |
| Design | ✅ Complete | `.sdd/{active|archive}/{feature-name}/design.md` |
| Implementation | ✅ Complete | `projects/scanntech-ui/src/...` |
| Tests | ✅ Complete | `.../*.test.ts` (95% coverage) |
| Storybook | ✅ Complete | `.storybook/...` |

### Commits Made
- {N} commits (one per task batch or phase)
- Messages follow commit-writer pattern
- All tests passing

### Quality Gates
- Lint: ✅ Pass
- Tests: ✅ {X}% coverage
- Build: ✅ Pass
- Type check: ✅ Pass

### Next Steps
- [ ] Code review
- [ ] Merge to main
- [ ] Deploy
- [ ] Monitor in production
```

---

## Rules

- **ALWAYS wait for user approval before major transitions** (plan → apply → archive)
- **ALWAYS pause at HITL checkpoints** — don't auto-proceed
- **ALWAYS report blockers clearly** — don't work around design conflicts
- **ALWAYS return structured status** — not just "done"
- **If user hasn't responded in 1 phase, ask for clarification** — don't assume approval
- **If an agent fails, stop and escalate** — don't retry silently
- **Always verify build/tests pass** before archiving

---

## When to Invoke Me

Use this orchestrator when:

- ✅ Planning a new feature from scratch
- ✅ Coordinating multi-phase work (foundation → integration → polish)
- ✅ You want structured HITL checkpoints
- ✅ You want task decomposition verified before code

Use manual `scannlab-sdd-plan` or `scannlab-sdd-apply` when:

- ❌ Just planning (skip me, use plan directly)
- ❌ Just implementing (skip me, use apply directly)
- ❌ Quick one-file fix (just code it)
- ❌ You already have a spec ready (use apply directly)

---

## Integration

This orchestrator chains:

- **scannlab-sdd-plan** (my first call for planning)
- **scannlab-sdd-apply** (my second call for implementation)
- **scannlab-sdd-verify** (optional third call for validation)
- **sdd-orchestrator** (if more complex multi-user coordination needed)

---

## FAQ

### "Can I skip Phase 1 planning?"

No. The plan phase ensures:
- Scope is clear before coding
- Tasks are appropriately small
- Acceptance criteria are testable
- Design decisions are documented

Skipping it leads to rework. 15 minutes planning saves hours.

### "What if I only want Phase 1?"

That's fine. Tell me "Phase 1 only" and I'll:
1. Plan Phase 1
2. Get approval
3. Implement Phase 1
4. Archive as "Phase 1 complete"

You can always add Phase 2 later.

### "Can I pause between phases?"

Yes. After Phase N completes, I'll ask if you want Phase N+1. You can say "pause for code review" or "pause for user testing" and revisit later.

### "What if requirements change mid-phase?"

Tell me immediately:
1. I'll get updated requirements
2. We'll create a delta spec
3. I'll adjust Phase N or add new phases
4. We'll continue from where we left off

---

## Resources

| File | Purpose |
|------|---------|
| [scannlab-sdd SKILL.md](../SKILL.md) | Main planning skill |
| [scannlab-sdd-plan](./plan.md) | Planning agent |
| [scannlab-sdd-apply](./apply.md) | Implementation agent |
| [AGENTS.md](../../../AGENTS.md) | Available skills & workflows |
