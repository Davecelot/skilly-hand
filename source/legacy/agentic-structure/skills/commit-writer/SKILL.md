---
name: commit-writer
description: >
  Analyzes local changes and drafts detailed, specific commit messages that explain what changed, why it changed, and where it changed, then recommends a SemVer impact without taking any versioning action.
  Trigger: When the user asks to write, review, improve, or summarize a commit message from workspace changes, staged files, or diffs.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Writing or reviewing commit messages"
allowed-tools: Read, Edit, Write, Grep, Bash, Task
---

# Commit Writer Guide

## When to Use

**Use this skill when:**

- The user wants help writing a commit message from local code changes.
- The user wants a commit reviewed for clarity, specificity, or completeness.
- The user provides a diff, patch, or changed-file set and wants it turned into a strong commit draft.

**Don't use this skill for:**

- Deciding the release version automatically.
- Making commits or tagging releases unless the user explicitly asks for that separately.
- Summarizing changes you have not inspected.

---

## Critical Patterns

### Pattern 1: Inspect Before Writing

Start from evidence, not assumptions.

1. Detect whether a Git repository is available from the current workspace.
2. Inspect changed files, staged vs unstaged status, and diffs.
3. If Git is unavailable, use the files changed in the current task or ask for a diff if the evidence is incomplete.

Never write a rationale that is not supported by the diff, surrounding code, or explicit user context.

### Pattern 2: Explain What, Why, and Where

Every commit draft should make these three points clear:

- **What changed**: concrete behavior, files, or modules touched.
- **Why it changed**: bug, missing capability, cleanup, consistency, accessibility, tooling, etc.
- **Where it changed**: name the most relevant package, component, folder, or surface area.

If the diff does not reveal the reason, say that the reason is inferred or missing.

### Pattern 3: Prefer a Strong Commit Structure

Draft commits in this structure unless the user requests another format:

```text
<imperative summary line>

- Detail the primary change
- Call out important files, components, or modules
- Mention behavior, API, or UX impact
- Mention tests or validation when known
```

Rules:

- Use imperative voice.
- Keep the summary specific; avoid vague subjects like `update files` or `fix stuff`.
- Mention the subsystem when it improves clarity.
- If the changes look unrelated, say they should likely be split into separate commits.

### Pattern 4: Recommend SemVer Impact, Do Not Apply It

After drafting the commit, recommend the likely SemVer impact and explain why:

- **major**: breaking API, removed behavior, incompatible markup/contracts, required migration.
- **minor**: backward-compatible feature or new capability.
- **patch**: backward-compatible fix, refactor, docs, tests, or small behavior correction without a breaking contract.
- **no release impact**: changes that may not justify a published version bump, depending on project release policy.

Always state that the recommendation is advisory and the final versioning decision belongs to the user.

---

## Decision Tree

```text
Breaking public behavior or API?          → Recommend major
New backward-compatible capability?       → Recommend minor
Bug fix or compatible improvement?        → Recommend patch
Docs/test/tooling-only change?            → Recommend patch or no release impact
Insufficient evidence from diff alone?    → State uncertainty and explain the assumption
```

---

## Output Contract

When using this skill, return:

1. **Change analysis**: short explanation of what changed, why, and where.
2. **Commit draft**: a detailed, specific commit message the user can refine.
3. **SemVer recommendation**: `major`, `minor`, `patch`, or `no release impact`, with one short rationale.

If confidence is low, say so explicitly instead of inventing certainty.

---

## Commands

```bash
git rev-parse --show-toplevel
git status --short
git diff --stat
git diff --cached --stat
git diff -- path/to/file
git diff --cached -- path/to/file
```
