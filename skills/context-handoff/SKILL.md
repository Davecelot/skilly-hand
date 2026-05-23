---
name: "context-handoff"
description: "Capture compact, neutral, AI-ready Markdown handoffs that preserve session context across chats without becoming a full transcript or personal memory store. Trigger: summarizing, compacting, preserving, or handing off session context across chats."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-05-23"
  license: "Apache-2.0"
  version: "1.0.0"
  changelog: "Added context-handoff skill for project-local session continuity; preserves compact verified context across chats without transcript bloat; affects catalog skill routing and handoff-writing workflows"
  auto-invoke: "Summarizing, compacting, preserving, or handing off session context across chats"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "Task"
---
# Context Handoff Guide

## When to Use

Use this skill when:

- A user asks to summarize, compact, preserve, or hand off session context.
- Work may continue in a later chat, agent session, branch, or review.
- Important decisions, current state, artifacts, unresolved questions, or next actions would otherwise be lost.
- A project needs a concise `.context/` Markdown handoff that is readable by humans and useful to future AI agents.

Do not use this skill for:

- Full transcript archiving by default.
- Personal journaling, private memory claims, or speculative profile building.
- Critiquing the session, evaluating the user, or adding opinions not requested.
- Replacing formal specs, issue trackers, changelogs, ADRs, or release notes when those are the better source of truth.

---

## Critical Patterns

### Pattern 1: Store Project-Local Context

Write handoff files under `.context/` in the active project root.

Use this filename format:

```text
.context/YYYY-MM-DDTHHMMSSZ-context-handoff-<slug>.md
```

The folder is for project-local context handoffs. It is not personal memory, hidden long-term recall, or a place to dump raw chat history.

### Pattern 2: Capture Verified Context Only

Write as a professional transcriber and technical handoff writer:

- Preserve facts from the session, repository, commands, files, decisions, and user-provided constraints.
- Mark uncertainty explicitly as `Unknown`, `Unresolved`, or `Assumption`.
- Do not invent motivations, conclusions, files, tests, or status.
- Do not critique the user, the plan, or the implementation unless the user explicitly requested critique and it belongs in the handoff.

### Pattern 3: Prefer Compact Handoff Over Transcript

Default to a concise, structured handoff that a future agent can scan quickly.

Include:

- Purpose and current state.
- Key context and constraints.
- Decisions made.
- Artifacts touched or produced.
- Open questions and blockers.
- Next actions.
- Verification status.
- A resume prompt.

Exclude:

- Routine back-and-forth.
- Long command logs unless the exact output is essential.
- Sensitive data, secrets, credentials, tokens, or private personal details.
- Repeated explanations already captured in a durable project artifact.

### Pattern 4: Screen Before Writing

Before creating or updating a `.context/` file:

1. Check whether the handoff may include secrets, credentials, tokens, private personal data, or proprietary data the user did not ask to persist.
2. Redact sensitive values and describe them generically.
3. If the user explicitly asks to persist sensitive content, confirm before writing it.
4. Keep the handoff scoped to what future work needs.

---

## Decision Tree

```text
User asks to preserve or resume session context?       -> Create `.context/` handoff
User asks for exact transcript or quotes?              -> Ask whether full transcript is required
Formal requirement/spec/change log is needed?          -> Route to the appropriate durable artifact
Sensitive content would be persisted?                  -> Redact or confirm before writing
Context is uncertain or inferred?                      -> Label as Unknown, Unresolved, or Assumption
Otherwise                                             -> Write compact neutral handoff
```

---

## Examples

### Example 1: Handoff Request

```text
Request: "Summarize this session so we can continue tomorrow."
Action: Create `.context/2026-05-23T184512Z-context-handoff-auth-refactor.md` with current state, decisions, artifacts, open questions, next actions, verification, and resume prompt.
```

### Example 2: Privacy-Safe Capture

```text
Request: "Save the deployment notes, including the token I pasted."
Action: Redact the token, record that a deployment token was provided in-session, and confirm before persisting any exact secret value.
```

### Example 3: Not a Critique

```text
Request: "Make a handoff from this planning session."
Action: Record agreed scope, assumptions, unresolved decisions, and next steps. Do not rate the plan or add unsolicited objections.
```

---

## Commands

```bash
mkdir -p .context
date -u +"%Y-%m-%dT%H%M%SZ"
rg -n "TODO|FIXME|Assumption|Unresolved" .context
```

---

## Resources

- Handoff template: [assets/handoff-template.md](assets/handoff-template.md)
- Related compact output skill: [../output-optimizer/SKILL.md](../output-optimizer/SKILL.md)
- Related planning workflow: [../spec-driven-development/SKILL.md](../spec-driven-development/SKILL.md)
