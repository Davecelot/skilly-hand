# [Feature Name]

## Why

[1-2 sentences: What problem this solves. Why it matters now.]

Example:
> Scanntech dashboard needs individual user accounts for billing. Currently, users share a demo account.

## What

[Concrete deliverable. Specific enough to verify when done.]

Example:
> Register, login, and refresh token endpoints with JWT authentication.

## Constraints

### Must

- [Required patterns, libraries, conventions]
- [Existing code you're building on]
- [Architectural decisions that are locked]

Example:
- Use existing Express structure
- Use jsonwebtoken library
- Store tokens in httpOnly cookies
- Use existing user model in `src/models/user.ts`

### Must Not

- [Explicit anti-patterns you're avoiding]
- [Libraries you're NOT adding]
- [Scope you're excluding]

Example:
- Don't add new npm dependencies
- Don't modify existing routes
- Don't add OAuth

### Out of Scope

- [Adjacent features explicitly NOT building now]

Example:
- Password reset
- Email verification
- Social login

## Current State

[What exists now. Saves agent from exploring.]

Example:
- Express app in `src/server/`
- User model exists in `src/models/user.ts`
- Using middleware pattern in `src/middleware/`
- Database: PostgreSQL with existing connection pool

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

---

[Continue for T3, T4, ...]

## Validation

- [Command or test to verify entire feature]
- Manual: [Steps to verify in UI/API]
- [Any deployment verification needed]

Example:
- All tests pass: `npm test`
- Manual: Register → Login → Access protected route → Refresh token
- No console errors in development

---

> **Modifying existing behavior?** Use `assets/delta-spec-template.md` instead.
