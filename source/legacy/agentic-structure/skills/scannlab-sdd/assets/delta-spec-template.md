# [Feature Name] — Delta Spec

> Use this template when modifying **existing behavior** rather than building something new.
> On archive, merge ADDED/MODIFIED/REMOVED sections into the corresponding spec file.
>
> File location: `.sdd/active/[feature-name]/spec.md`

## Why

[Why this change is being made to an existing feature. Why now.]

## What

[Concrete description of what behavior is changing. Specific enough to verify when done.]

## ADDED Requirements

### Requirement: [Name]

[MUST/SHOULD/MAY statement of new requirement]

#### Scenario: [Name]

- GIVEN [initial state or precondition]
- WHEN [action or event occurs]
- THEN [expected outcome]

## MODIFIED Requirements

### Requirement: [Name]

[New requirement text — what it should say now]

(Previously: [what it said before])

## REMOVED Requirements

### Requirement: [Name]

(Reason: [why this requirement is being dropped])

## Tasks

### T1: [Title]

**What:** [What to build]

**Files:** `path/to/file`, `path/to/test`

**Verify:** [Command to run or manual check]

---

### T2: [Title]

**What:** [What to build]

**Files:** `path/to/file`

**Verify:** [Command to run or manual check]

## Validation

- [How to confirm the delta was applied correctly end-to-end]
- All tests pass: `npm test`
- Manual: [Steps to verify the changed behavior]
