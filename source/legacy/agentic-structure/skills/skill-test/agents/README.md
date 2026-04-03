# skills/skill-test/agents/

This folder contains AI agent instruction files that coordinate skill-test's semantic validation modes.

## Files in This Folder

| Agent | Purpose |
|---|---|
| `skill-lint-agent.md` | Handles Phase 1 (Structural) — validates frontmatter, file refs, YAML syntax |
| `skill-review-agent.md` | Handles Phases 2–3 (Semantic) — validates consistency and behavioral correctness |

## How Agents Work

**Invocation flow:**

```
User: "Review the scannlab-best-practices skill"
  ↓
SKILL.md routes to appropriate agent
  ↓
Agent reads target skill's SKILL.md
  ↓
Agent performs 3-phase review (or just structural phase)
  ↓
Agent returns structured report
  ↓
User updates skill based on findings
  ↓
Re-validate with skill-lint.js (Phase 1)
```

## Agent Design

Each agent operates on a **single skill at a time**. Agents are stateless — they can be invoked multiple times on different skills without interference.

**Agent files are NOT sub-agents in the `runSubagent` sense.** They are AI instruction files that guide the current session's AI through a specific validation task. If you need a true sub-agent (new context window), you would invoke a `runSubagent` call with these agents as guidance — but that's a future enhancement.
