# Token Optimizer Guide

## When to Use

Use this skill when:

- Starting a task and deciding the right reasoning depth.
- Balancing response quality against speed and token budget.
- Choosing how much context gathering is actually needed.
- Reassessing scope when a task becomes more complex than expected.

Do not use this skill for:

- Cases where the user explicitly requests a fixed reasoning level.
- Mid-task rewrites that would reset already-correct progress.
- Emergency actions where immediate execution is the only priority.

---

## Critical Patterns

### Pattern 1: Classify Complexity First

Pick a complexity tier before doing substantial work:

| Tier | Typical Shape |
| --- | --- |
| Trivial | Single lookup, deterministic answer, no ambiguity |
| Simple | 2-3 clear steps, minimal context, low risk |
| Moderate | Multiple files or decisions, some trade-offs |
| Complex | Broad impact, cross-cutting behavior, non-trivial edge cases |
| Expert | Security/performance critical, architecture-level consequences |

### Pattern 2: Match Effort to Complexity

Use the lightest viable approach, then escalate only if needed:

| Tier | Reasoning Style | Context Gathering | Response Depth |
| --- | --- | --- | --- |
| Trivial | None or minimal | Direct targeted read/search | 1-2 sentences |
| Simple | Light | 1-2 focused operations | Brief factual answer |
| Moderate | Selective | 3-5 targeted operations | Concise rationale |
| Complex | Regular | Systematic exploration | Detailed explanation |
| Expert | Deep | Broad investigation + explicit trade-offs | Thorough analysis |

### Pattern 3: Progressive Escalation

Escalate one tier when you discover:

1. Hidden dependencies or wider blast radius.
2. Conflicting constraints or unclear acceptance criteria.
3. Additional non-functional requirements (security, performance, compatibility).

Do not jump to the highest-effort tier by default.

### Pattern 4: Token-Saving Defaults

Always prefer:

- Batched independent reads/searches.
- Targeted pattern matching (`rg`) before broad scans.
- Reuse of already-collected context over repeated calls.
- Brief outputs unless rationale materially improves decisions.

Avoid:

- Reading full files when a narrow section is enough.
- Re-running identical commands without new signal.
- Long-form explanations for straightforward checks.

---

## Decision Tree

```text
Single lookup with known target?                  -> Trivial
Needs 2-3 clear actions and limited context?      -> Simple
Touches multiple files or design choices?         -> Moderate
Needs architectural/refactor trade-offs?          -> Complex
Impacts security/performance/core reliability?    -> Expert
```

Upgrade one tier if:

- User asks to optimize, harden, or redesign.
- Public API or user-facing behavior changes.
- Scope expands beyond expected files/components.

Downgrade one tier if:

- User provides exact file paths and acceptance criteria.
- Existing patterns make implementation mostly mechanical.

---

## Examples

### Example 1: Trivial

```text
Request: "What version is in package.json?"
Approach: single file read, no extra reasoning, direct answer.
```

### Example 2: Simple

```text
Request: "Check whether alert component has tests."
Approach: targeted file search, return yes/no + location.
```

### Example 3: Moderate

```text
Request: "Add disabled state to button component."
Approach: inspect component + styles + tests, apply existing patterns, summarize key decisions.
```

### Example 4: Complex

```text
Request: "Refactor validation flow to support async checks."
Approach: analyze architecture and compatibility constraints, propose phased changes, verify behavior end-to-end.
```

---

## Commands

```bash
rg --files
rg -n "<pattern>" <path>
rg -n "TODO|FIXME" src
```

---

## Resources

- Complexity heuristics: [references/complexity-indicators.md](references/complexity-indicators.md)
- Related planning workflow: [../spec-driven-development/SKILL.md](../spec-driven-development/SKILL.md)
