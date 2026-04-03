---
name: scannlab-sdd
description: >
  Spec-driven development framework for ScannLab Design System. Guides users through
  structured spec creation, task decomposition, and atomic task execution. Enables
  team coordination via clear, versionable specifications stored in the repository.
  Trigger: When planning feature work, bug fixes, complex multi-phase development, or
  any task that will span multiple code changes and commits.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-31
  license: Apache-2.0
  version: "1.1.0"
  scope: [root]
  auto-invoke: "When planning feature work, bug fixes, or complex multi-phase development"
  changelog: "Added prominent sub-agent guidance; moved agent-based workflow to recommended usage section; clarified framework vs. agent-based approach; reduced duplication with sdd-orchestrator agent"
allowed-tools: Read, Edit, Write, Grep, SubAgent
---

# Spec-Driven Development Framework

## When to Use This Skill

**Use this skill when:**

- Planning a new feature that will take multiple commits to implement
- Breaking down a complex bug fix into manageable tasks
- Coordinating work across multiple components or team members
- Working on Design System components with specific deliverables
- Any work where you want to externalize decisions before coding starts

**Don't use this skill for:**

- Trivial tasks that fit in one file (just write code)
- Emergency hotfixes that need immediate deployment
- Simple refactoring with no new requirements
- Tasks with no verification path

---

## The Problem We Solve

**Vague Prompt:**
```
Add authentication to the app
```

**Result:** Wrong approach, wrong libraries, files in weird places, features you didn't ask for.

**With a Spec:**
```
Email and password auth using existing user table.
JWT tokens stored in httpOnly cookies.
Login and signup pages only.
No password reset for v1.
Don't add OAuth. Don't install new dependencies.
```

**Result:** The AI knows exactly what to build—and what NOT to build.

---

## The Workflow: 5 Steps

### Step 1: Generate Spec
Create an initial spec from a brief description. Use the templates in `assets/`.

### Step 2: Review & Refine
Review the spec. Make sure the decisions are yours. Update constraints, adjust scope.

### Step 3: Pick First Task
The spec breaks work into small tasks (T1, T2, T3...). Pick the first one.

### Step 4: Execute Task
Run that task in a fresh context. Build it. Verify it works.

### Step 5: Commit & Repeat
Commit the completed task. Move to T2. Repeat for each task until done.

```
┌─────────────────────────────────────────────────────┐
│                    SPEC FILE                        │
│                                                     │
│  • Why: Problem being solved                        │
│  • What: Concrete deliverable                       │
│  • Constraints: Must / Must Not / Out of Scope      │
│  • Current State: What exists now                   │
│  • Tasks: T1, T2, T3... (small, verifiable)         │
│  • Validation: End-to-end verification              │
└─────────────────────────────────────────────────────┘
         ↓
   ┌─────────────┐
   │  Review &   │
   │   Refine    │
   └─────────────┘
         ↓
   ┌─────────────┐
   │  Pick T1    │
   └─────────────┘
         ↓
   ┌─────────────┐      T1 ✓ →     ┌─────────────┐
   │  Execute    │ ──────────────→ │   Commit    │
   │  Task       │                 └─────────────┘
   └─────────────┘                       ↓
         ↑                         Pick T2...
         └───────────────────────────────┘
```

---

## Spec Structure

A spec has 6 core sections:

### 1. **Why** (1-2 sentences)
Problem being solved. Why it matters now.

```
Example:
Users currently share a demo account. We need individual accounts for
billing and usage tracking.
```

### 2. **What** (Concrete deliverable)
Specific enough to verify when done. Not vague.

```
Example:
Register, login, and refresh token endpoints with JWT authentication.
Not: "Add authentication"
```

### 3. **Constraints**

Use RFC 2119 keywords to signal obligation level:
- **MUST** — absolute requirement, no exceptions
- **SHOULD** — recommended; deviations require justification
- **MAY** — optional, left to implementer discretion

#### Must
- Required patterns, libraries, conventions (MUST-level)
- Existing code you're building on
- Architectural decisions that are locked

```
Example:
- MUST use CSS Modules (no Tailwind)
- MUST use Angular 20.3+ signals
- MUST build on existing Express structure
```

#### Must Not
- Explicit anti-patterns (MUST NOT-level)
- Libraries you're NOT adding
- Scope you're excluding

```
Example:
- MUST NOT add new npm dependencies
- MUST NOT modify existing routes
- MUST NOT add OAuth
```

#### Out of Scope
- Adjacent features explicitly NOT building now

```
Example:
- Password reset
- Email verification
- Social login
```

### 4. **Current State**
What exists now. Saves the AI from exploring.

```
Example:
- Express app in src/server/
- User model exists in src/models/user.ts
- Using middleware pattern in src/middleware/
- Database: PostgreSQL with existing connection pool
```

### 5. **Tasks** (The Implementation Breakdown)

Each task is small:
- Touches <= 3 files
- Takes ~30 minutes or less
- Has a verifiable output

For complex tasks with defined behavior, add a **Given/When/Then scenario** to make expected behavior explicit:

```
#### Scenario: [Name]
- GIVEN [initial state or precondition]
- WHEN [action or event occurs]
- THEN [expected outcome]
```

This is optional for simple file changes and REQUIRED when the task implements user-facing behavior or business logic.

#### Task Format

```
### T1: [Title]
**What:** [What to build]
**Files:** `path/to/file`, `path/to/test`
**Verify:** Command to run, or manual check
```

#### Example Tasks

```
### T1: Create auth middleware
**What:** JWT verification middleware that checks token validity
**Files:** `src/middleware/auth.ts`, `src/middleware/auth.test.ts`
**Verify:** `npm test -- src/middleware/auth.test.ts`

### T2: Create register endpoint
**What:** POST /api/auth/register - validate email, hash password, store user, return JWT
**Files:** `src/routes/auth.ts`, `src/routes/auth.test.ts`
**Verify:** `npm test -- src/routes/auth.test.ts`

### T3: Create login endpoint
**What:** POST /api/auth/login - verify credentials, return JWT
**Files:** `src/routes/auth.ts`
**Verify:** `npm test -- src/routes/auth.test.ts`

### T4: Integration test
**What:** Full flow: register → login → access protected route
**Files:** `src/tests/auth.integration.test.ts`
**Verify:** `npm test -- src/tests/auth.integration.test.ts`
```

### 6. **Validation** (End-to-End Check)

After all tasks complete, verify the full feature works:

```
- All tests pass: `npm test`
- Manual: Register → Login → Access protected route
- Manual: Token refresh works
- Manual: Expired tokens are rejected
```

---

## Delta Specs (Brownfield Changes)

When modifying **existing behavior** rather than building something new, use a delta spec instead of writing a full spec from scratch. Delta specs describe only what changes — they get merged into the main spec on archive.

### Delta Spec Format

```markdown
## ADDED Requirements

### Requirement: [Name]
[MUST/SHOULD/MAY description]

#### Scenario: [Name]
- GIVEN [initial state]
- WHEN [action]
- THEN [outcome]

## MODIFIED Requirements

### Requirement: [Name]
[New requirement text]
(Previously: [what it said before])

## REMOVED Requirements

### Requirement: [Name]
(Reason: [why this requirement is being dropped])
```

### When to Use Delta vs Full Spec

| Use **Full Spec** | Use **Delta Spec** |
|---|---|
| New feature with no prior spec | Changing behavior that already has a spec |
| Greenfield work | Bug fix that narrows or clarifies a requirement |
| No existing requirements to reference | Adding a new capability to an existing feature area |

### Archive Behavior

On archive, apply the delta manually to the corresponding spec:
- **ADDED** sections → append to the relevant spec
- **MODIFIED** sections → replace the old requirement
- **REMOVED** sections → delete from the spec

---

## Optional Artifacts

For complex features that involve significant architecture decisions, add a `design.md` alongside `spec.md`.

### `design.md` — Architecture Decisions

Use `design.md` when your feature requires choosing between approaches, introduces risk, or affects multiple systems. It captures the **how** and **why** behind implementation choices — separately from requirements.

**Required when:**
- Feature introduces new patterns or architectural decisions
- Trade-offs need to be documented for the team
- Non-obvious decisions that future maintainers need to understand

**Structure:**

```markdown
# Design: [Feature Name]

## Context
[Background, current system state, why this decision was made now]

## Goals
- [What success looks like for this feature]

## Non-Goals
- [What we are explicitly NOT solving here]

## Decisions
### Decision: [Name]
[What was decided and the rationale]

## Risks / Trade-offs
- [Risk or trade-off + mitigation or acceptance rationale]
```

**File location:** `.sdd/active/[feature-name]/design.md`

See `assets/design-template.md` for a copy-paste template.

---

## Task Design Principles

### Fresh Context Per Task
Each task runs in a new agent session. This avoids context rot.

### Small Tasks Stay on Track
If it touches more than 3 files or takes more than 30 minutes, break it down further.

### Verification is Mandatory
Every task needs a way to confirm it worked:
- A command to run
- A test to pass
- A manual step
- Something concrete

Without this, you get slop.

---

## Decision Tree: When to Break Tasks Smaller

```
Does this task touch > 3 files?
  YES → Break it smaller

Will this task take > 30 minutes?
  YES → Break it smaller

Can you verify it in 2 minutes or less?
  NO → Add a verification step

Can you explain what "done" means in one sentence?
  NO → Task is too vague; break it down
```

---

## Integration with ScannLab Workflows

When building Design System components or implementing features, reference the available skills and agents in [AGENTS.md](../../AGENTS.md#auto-invoke-skills) to see what tools are available for your workflow.

The **Figma to Code Workflow** in AGENTS.md shows the complete sequence of skills for converting Figma designs to production Angular components:

- Figma extraction
- Token validation  
- Code Connect mapping
- Component implementation
- Styling
- Storybook documentation
- Testing (unit + visual)
- Accessibility audit
- Token compliance verification

For general features and bug fixes, reference the **Auto-invoke Skills** table in AGENTS.md to find the right skill for your task (Angular patterns, testing, commits, PRs, etc.).

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Vague Constraints
```
WRONG:
### Must
- Use best practices
- Good performance

RIGHT:
### Must
- Use CSS Modules (no Tailwind)
- Use Angular 20.3+ signals
- Do not exceed 50KB bundle size (minified)
```

### ❌ Mistake 2: Tasks That Are Too Big
```
WRONG:
T1: Build entire authentication system

RIGHT:
T1: Create auth middleware
T2: Create register endpoint
T3: Create login endpoint
T4: Create refresh endpoint
T5: Integration test
```

### ❌ Mistake 3: No Verification
```
WRONG:
T1: Add form validation
**Verify:** (none)

RIGHT:
T1: Add form validation
**Verify:** `npm test -- src/form-validation.test.ts`
```

### ❌ Mistake 4: Mixing Concerns
```
WRONG:
T1: Create button component + add to all pages

RIGHT:
T1: Create button component (isolated)
T2: Update login page to use button
T3: Update dashboard page to use button
```

---

## FAQ

### "Isn't this just waterfall?"

No. Waterfall is months of planning before you write any code.

This is five minutes. Maybe fifteen lines. Just enough to give the AI direction.

Think of it as a sketch, not a blueprint.

### "Why not just tell the AI what to build?"

Because chat history gets long. Context rots. Specs live in your repo—they're:

- **Separate** — not tied to one conversation
- **Versionable** — tracked in Git
- **Shareable** — hand it to any team member or agent
- **Reviewable** — easier to review a spec than code

### "Do I have to use this for everything?"

No. Use it when:
- Work will span multiple commits
- You want to coordinate with teammates
- The feature is complex
- You want to review the plan before coding starts

Skip it for:
- One-file bug fixes
- Trivial changes
- Hotfixes

### "Can specs change?"

Yes. If requirements change mid-way through, update the spec. Add a changelog entry. Commit the updated spec.

### "How do I know tasks are small enough?"

Ask yourself:
- Can I explain what "done" means in one sentence?
- Can I verify it in 2 minutes?
- Does it touch ≤3 files?

If no to any of these, break it smaller.

---

## How to Use This Skill

### Recommended: Use Specialized Sub-Agents

Don't write specs manually—let agents do the heavy lifting. Specialized sub-agents in `skills/scannlab-sdd/agents/` are optimized for each phase:

| Agent | When to Use |
|-------|-------------|
| **`scannlab-sdd-plan`** | Planning only (spec generation + refinement, no implementation) |
| **`scannlab-sdd-apply`** | Implementation only (execute tasks from an existing spec) |
| **`scannlab-sdd-verify`** | Verification only (validate completed tasks against spec) |
| **`scannlab-sdd-orchestrate`** | Full workflow (plan → implement → verify with HITL checkpoints) |

**Quick Start:**
```
Invoke: scannlab-sdd-orchestrate
Request: "Plan and implement async pipe caching for form fields"
Result: Complete workflow with specs, code, tests, and commits
```

See `skills/scannlab-sdd/agents/README.md` for detailed guidance on each agent.

---

### Manual Workflow (No Agent)

1. Read the **Spec Template** below
2. Create a new file: `.sdd/active/feature-name/spec.md`
3. Fill in each section honestly
4. Review the spec. Refine constraints and tasks
5. Execute task T1 (read spec, build, verify, commit)
6. Repeat for T2, T3, etc.

#### Task Execution Reference

When executing a single task, keep these fields in mind beyond What/Files/Verify:

**What Success Looks Like** — Restate the Verify command as concrete checkboxes:
```
✓ Middleware verifies JWT signature
✓ Rejects invalid/expired tokens with 401
✓ All unit tests pass
✓ No TypeScript errors
```

**Notes** — Gotchas or reminders for the implementer:
```
- Use jsonwebtoken library (already installed)
- Don't modify user signup logic (that's T2)
- Middleware should only verify, not modify the token
```

**Don't Modify** — Explicit scope fence for the task:
```
- DO NOT change user model
- DO NOT add new npm dependencies
- DO NOT modify route handlers
```

These are optional in the spec file itself but useful to write down when a task is complex or has risky neighbors.

### With CLI (`sdd` commands)

```bash
# Create a new spec
sdd new my-feature

# See status
sdd list
sdd status my-feature

# Track progress
sdd next my-feature
sdd complete my-feature T1
```

---

## Resources

| File | Purpose |
|------|---------|
| `assets/spec-template.md` | Generic feature spec — copy-paste starting point |
| `assets/delta-spec-template.md` | Brownfield changes — ADDED / MODIFIED / REMOVED format |
| `assets/component-spec-template.md` | Design System component spec — includes Figma, tokens, a11y, Code Connect |
| `assets/design-template.md` | Architecture decisions artifact — Context / Goals / Decisions / Risks |
| `assets/validation-checklist.md` | Pre-implementation review + pre-archive 3-dimensional verify |

**Agent Orchestration:** Use `sdd-orchestrator` Claude agent for automated workflows
