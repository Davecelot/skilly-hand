# Spec Validation Checklist

Use this checklist **before** you start implementing. It helps ensure your spec is clear, complete, and ready for the AI agent or team.

---

## Basic Structure

- [ ] **Title** is clear and specific (not vague like "Fix bugs" or "Improve performance")
- [ ] **Why** section answers: "Why do we need this? Why now?"
- [ ] **What** section describes a concrete deliverable (not a problem statement)
- [ ] **What** is specific enough to verify when done

**Example:**
- ❌ "Improve the dashboard" (vague)
- ✅ "Add dark mode toggle in header that persists to localStorage" (specific)

---

## Constraints

- [ ] **Must** section lists 3-5 required patterns/libraries/conventions
- [ ] **Must Not** section lists 3-5 anti-patterns you're avoiding
- [ ] **Out of Scope** section lists adjacent features explicitly NOT building

**Example:**
- ❌ "Must: Use best practices" (too vague)
- ✅ "Must: Use CSS Modules only, no Tailwind" (specific, enforceable)

---

## Current State

- [ ] At least 3 relevant files/patterns listed
- [ ] Existing code that you're building on is referenced
- [ ] No exploring needed by the AI (it has context)

**Example:**
- ❌ (empty)
- ✅ "User model at `src/models/user.ts`, middleware pattern in `src/middleware/cors.ts`, JWT library already installed"

---

## Tasks

- [ ] At least 1 task, typically 3-7 tasks total
- [ ] Each task has a **What** (1-2 sentences describing what to build)
- [ ] Each task has **Files** (list of files to modify/create)
- [ ] Each task has **Verify** (command to run or manual check)
- [ ] Each task is small (≤3 files, ≤30 minutes)

**Example:**
- ❌ 
  ```
  T1: Build the auth system
  **Verify:** It works
  ```
- ✅ 
  ```
  T1: Create register endpoint
  **What:** POST /api/auth/register - validate email, hash password, return JWT
  **Files:** `src/routes/auth.ts`, `src/routes/auth.test.ts`
  **Verify:** `npm test -- auth.test.ts`
  ```

---

## Verification

- [ ] **Validation** section lists how to verify the entire feature works (not individual tasks)
- [ ] At least one automated check (test command, build command)
- [ ] At least one manual check (steps to verify in UI/API)

**Example:**
- ❌ (empty or "manually test")
- ✅ 
  ```
  - All tests pass: `npm test`
  - Manual: Register → Login → Access protected route
  - Manual: Expired tokens rejected
  ```

---

## Red Flags

If you see any of these, the spec needs more work:

- [ ] "And also..." — Multiple unrelated features in one spec (split them)
- [ ] Empty sections — Every section should be filled in
- [ ] Tasks without file lists — What files do you touch?
- [ ] Tasks without verification — How do you know it's done?
- [ ] Tasks touching > 5 files — Break them smaller
- [ ] No Current State section — AI will explore and guess (waste of tokens)
- [ ] Vague Constraints (e.g., "must be good", "must be performant") — Be specific

---

## Self-Check Questions

1. **Can someone unfamiliar with the codebase understand this spec?** (YES = good. NO = add context)
2. **Can I verify each task is done in < 2 minutes?** (YES = good. NO = add verification step)
3. **Will each task fit in ≤3 files?** (YES = good. NO = break tasks smaller)
4. **Did I lock down all the key decisions?** (YES = good. NO = add to Constraints)
5. **Can I explain the spec in 2 minutes to a teammate?** (YES = good. NO = simplify it)

---

## Pre-Review Checklist

Before sending to an agent or teammate:

- [ ] Spec title is specific
- [ ] All 6 sections are filled in (Why, What, Constraints, Current State, Tasks, Validation)
- [ ] Tasks are small (≤3 files each)
- [ ] Each task has a verification step
- [ ] No tasks are "do everything related to X"
- [ ] Constraints explicitly say what's NOT allowed
- [ ] Current State has at least 3 file references
- [ ] No empty sections

---

## After Review

Once approved:

- [ ] Save spec to `.sdd/active/[feature-name]/spec.md`
- [ ] Commit spec to version control
- [ ] Share link with team if coordinating
- [ ] Start with T1 in a fresh context

---

## Pre-Archive Verification (3 Dimensions)

Run this check after all tasks complete, before archiving. This is **non-blocking** — it
surfaces warnings and surfaces gaps, but it does NOT prevent archiving if you accept the findings.

### Completeness

Check that nothing was left undone:

- [ ] All task checkboxes (T1, T2, ...) are completed
- [ ] Every requirement in the spec has a corresponding code change
- [ ] Every Given/When/Then scenario (if present) has test coverage
- [ ] Validation section commands all pass

### Correctness

Check that the implementation matches spec intent:

- [ ] Implementation behavior matches the spec's What section
- [ ] Edge cases mentioned in scenarios are handled in code
- [ ] Error states and rejection paths match spec definitions
- [ ] Constraints (Must / Must Not) were respected throughout

### Coherence

Check that the code is internally consistent with itself and the spec:

- [ ] Naming in code matches naming in spec and `design.md` (if present)
- [ ] Architectural decisions in `design.md` are reflected in code structure (if present)
- [ ] No orphaned code was added that is unrelated to the spec
- [ ] No accidental scope creep — only what the spec described was built

### After Verification

- [ ] Archive spec: move `.sdd/active/[feature-name]/` → `.sdd/archive/YYYY-MM-DD-[feature-name]/`
- [ ] If delta spec: apply ADDED/MODIFIED/REMOVED sections to the corresponding main spec file
- [ ] Commit archived spec with message referencing the feature
