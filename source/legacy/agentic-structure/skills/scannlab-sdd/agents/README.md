# SDD Agents

Specialized sub-agents for spec-driven development workflows in ScannLab Design System.

## Agents

### 1. **orchestrate.md** — End-to-End Workflow
Chains planning → implementation → verification. Use when you want a complete SDD workflow with HITL checkpoints.

**When to invoke**: "Plan and implement a new feature"
**Returns**: Complete workflow summary with status

---

### 2. **plan.md** — Spec Generation & Refinement
Generates clear, decomposed specs with explicit constraints and testable scenarios.

**When to invoke**: "Create a spec for async pipe caching"
**Returns**: spec.md, design.md (if needed), tasks.md

---

### 3. **apply.md** — Task Execution
Implements specific tasks from a prepared spec. Detects TDD vs standard mode, runs tests, and returns structured progress.

**When to invoke**: "Implement Phase 1 tasks from async-pipe-caching spec"
**Returns**: Implemented code + structured progress envelope

---

## Quick Reference: Which Agent to Use?

| Goal | Agent |
|------|-------|
| Plan feature work | **orchestrate** or **plan** |
| Implement tasks from a spec | **apply** |
| Coordinating multi-phase work | **orchestrate** |
| Just planning (no implementation) | **plan** |
| Just implementing (spec exists) | **apply** |

---

## File Locations

Specs live in `.sdd/` at the workspace root:

```
.sdd/
├── active/
│   ├── async-pipe-caching/
│   │   ├── spec.md
│   │   ├── design.md
│   │   └── tasks.md
│   └── another-feature/
│       └── ...
└── archive/
    ├── completed-feature/
    │   ├── spec.md
    │   ├── design.md
    │   └── COMPLETE.md
    └── ...
```

---

## Example Workflow

### Scenario: Build a caching pipe for observables

**Step 1: Plan**
```
Invoke: scannlab-sdd-orchestrate or scannlab-sdd-plan
Request: "Create a caching pipe for async observables in form components"
Output: .sdd/active/async-pipe-caching/ with spec + design + tasks
```

**Step 2: Review Plan (HITL Checkpoint)**
```
User reviews spec, approves or requests changes
Approval: ✅ Proceed to implementation
```

**Step 3: Implement Phase 1**
```
Invoke: scannlab-sdd-apply
Spec: async-pipe-caching
Tasks: Phase 1 (T1.1 - T1.3)
Output: Implemented code + test results + progress summary
```

**Step 4: Review Implementation**
```
User reviews code, runs tests locally
Decision: ✅ Ready for Phase 2 OR ❌ Pause for review
```

**Step 5: Archive**
```
After all phases pass, move .sdd/active/async-pipe-caching/ 
to .sdd/archive/async-pipe-caching/ with COMPLETE.md
```

---

## Integration with Main Skill

The main [SKILL.md](../SKILL.md) documents the overall framework. These agents implement specific roles within that framework:

- **SKILL.md**: "Here's how spec-driven development works"
- **plan.md**: "Here's how I guide planning"
- **apply.md**: "Here's how I execute tasks"
- **orchestrate.md**: "Here's how I tie planning + execution together"

---

## How Agents Talk to Each Other

```
User: "Build a caching pipe"
  ↓
orchestrate → invoke plan
  ← plan returns spec + approval
    ↓
orchestrate → get user approval (HITL)
  ← user says "yes"
    ↓
orchestrate → invoke apply (Phase 1)
  ← apply returns implemented code
    ↓
orchestrate → report status + ask for Phase 2
```

---

## Quick Start

1. **See orchestrate.md** for end-to-end workflow
2. **See plan.md** to generate a spec from scratch
3. **See apply.md** to implement tasks from an existing spec

All agents cross-reference each other and the main [SKILL.md](../SKILL.md).
