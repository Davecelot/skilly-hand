---
name: pr-writer
description: >
  Analyzes code changes and drafts compelling PR titles, descriptions, and metadata in Spanish that explain what changed, why it changed, and where it changed. Provides a clear, structured PR for the user to review and refine.
  Trigger: When the user asks to write, review, improve, or draft a pull request from code changes.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "2.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Writing or reviewing pull request descriptions"
allowed-tools: Read, Edit, Write, Grep, Bash, Task
---

# PR Writer Guide

## When to Use

**Use this skill when:**

- The user wants help drafting a PR title and description from code changes.
- The user wants a PR reviewed for clarity, completeness, or impact.
- The user provides a diff, changed-file set, or branch context and wants it turned into a structured PR draft.
- The user wants to document PR metadata (labels, reviewers, linked issues).

**Don't use this skill for:**

- Creating the PR automatically on the user's behalf.
- Deciding which branch to target or repository policies.
- Making versioning or release decisions.
- Summarizing changes you have not inspected.

---

## Critical Patterns

### Pattern 1: Spanish Language Requirement

**All PR output must be in Spanish.**

- PR titles must be in Spanish.
- PR descriptions, sections, and all explanatory text must be in Spanish.
- Code comments and code snippets themselves remain unchanged, but all surrounding documentation in Spanish.
- Metadata labels and linked issue descriptions should follow the user's existing conventions.

This ensures consistency with the company's native Spanish documentation and team communication standards.

### Pattern 2: Inspect Before Writing

Start from evidence, not assumptions.

1. Detect whether a Git repository is available from the current workspace.
2. Inspect changed files, diffs, and commit context.
3. If Git is unavailable, use the files changed in the current task or ask for a diff if the evidence is incomplete.

Never write a rationale that is not supported by the diff, surrounding code, or explicit user context.

### Pattern 3: Explain What, Why, and Where

Every PR draft should make these three points clear:

- **What changed**: concrete behavior, files, or modules touched.
- **Why it changed**: bug fix, feature, refactor, accessibility, documentation, testing, tooling, etc.
- **Where it changed**: name the most relevant package, component, folder, or surface area.

If the diff does not reveal the reason, say that the reason is inferred or missing.

### Pattern 4: Prefer a Strong PR Structure

Draft PRs with this structure in Spanish unless the user requests another format:

```markdown
## Resumen
[Descripción de una línea del cambio y su impacto]

## ¿Qué está cambiando?
- Detalla el cambio principal
- Lista los archivos o componentes afectados
- Menciona el impacto en comportamiento, API o UX cuando sea relevante

## ¿Por qué?
[Explica la motivación: corrección de bug, nueva capacidad, refactor, consistencia, etc.]

## Pruebas
- [Comando y resultado, o "No se ejecutaron" con motivo]
- [Casos límite conocidos o áreas que necesitan revisión]

## Riesgos
- [Cambios potencialmente disruptivos o efectos secundarios]
- [Pasos de mitigación si aplica]
```

Rules:

- Keep the summary concise and specific.
- Mention the subsystem when it improves clarity.
- Be concrete: avoid generic phrases like "various fixes" or "minor updates" (or their Spanish equivalents).
- If changes look unrelated, suggest they should be split into separate PRs.

### Pattern 5: Provide Metadata Guidance

After drafting the PR content, provide optional metadata the user may want to include:

- **Labels**: relevant tags for filtering and organization.
- **Assignees**: suggested reviewers from the codebase.
- **Linked issues**: issues that this PR addresses (#123, fixes #456, relates to #789).

State what the user can customize based on their repository workflows.

---

## Decision Tree

```
Fixing a bug or addressing an issue?        → Clearly state which issue(s)
Adding a new feature or capability?         → Explain the new behavior
Breaking changes or API modifications?      → Highlight migration requirements
Refactoring or code quality improvement?    → Explain the benefit
Documentation or test-only changes?         → State the scope
Multiple unrelated changes?                 → Suggest splitting into separate PRs
Insufficient evidence from diff alone?      → State uncertainty and explain the assumption
```

---

## Output Contract

When using this skill, return **all content in Spanish**:

1. **Change analysis**: short explanation in Spanish of what changed, why, and where.
2. **PR draft**: a structured, specific title and description in Spanish that the user can refine.
3. **Metadata guidance**: suggested labels, assignees, and linked issues (optional, can follow existing conventions).
4. **Review instructions**: clear guidance in Spanish on how to submit the PR to your target branch.

If confidence is low, say so explicitly instead of inventing certainty.

---

## Commands

```bash
# Verify repository and current state
git rev-parse --show-toplevel
git status --short
git branch --show-current

# Inspect changes
git diff --stat
git diff --cached --stat
git diff -- path/to/file
git log --oneline -n 5

# Get file context
git diff HEAD..origin/main --stat
```

---

## User Roles: AI vs User (Critical Distinction)

| Phase | Role | Action |
|-------|------|--------|
| **Verification** | AI | Checks current branch, inspects changes, collects context |
| **Draft** | AI | Generates PR title, description, and metadata guidance |
| **Review** | **User** | **Reads the draft** and confirms accuracy / completeness |
| **Edit** | **User** | **Refines title, description, metadata as needed** |
| **Creation** | **User** | **Creates the PR manually** in the platform (GitHub, GitLab, etc.) |

### ❌ What the AI does NOT do

- **Never click "Create pull request"** on behalf of the user
- **Never use `gh pr create` automatically** without explicit user confirmation
- **Never create a PR without showing the draft first**
- **Never decide which branch to target** (that's the user's policy decision)

### ✅ What the user does

- **Reviews the generated draft** for accuracy and alignment with project norms
- **Edits the draft** if needed (title, description, scope, metadata)
- **Creates the PR manually** when satisfied with the content
- **Remains in full control** of PR submission and target branch selection
