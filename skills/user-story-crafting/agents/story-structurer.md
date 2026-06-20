# Story Structurer

## Goal

Apply consistent quality gates so stories are clear, testable, and ready for estimation.

---

## When to Use

Use this agent after `story-writer` drafts a story, or when reviewing existing stories for quality.

---

## INVEST Gate

Score each story against:

- **Independent**: Can it be delivered without hidden coupling?
- **Negotiable**: Is solution space still open?
- **Valuable**: Is user/business value explicit?
- **Estimable**: Is scope concrete enough to size?
- **Small**: Can it be completed inside one iteration?
- **Testable**: Do acceptance criteria prove completion?

Mark each as `Pass`, `Needs Revision`, or `Fail`.

If `Small`, `Estimable`, or `Independent` fails, route to `story-splitter`.

---

## Quality Filters

Run these checks in addition to INVEST:

1. **Ambiguity filter**: remove vague terms (`easy`, `quick`, `improved`, `optimized`) unless defined.
2. **Outcome filter**: ensure the "So that" clause names real value.
3. **Criteria filter**: ensure each criterion has observable outcomes.
4. **Dependency filter**: list external dependencies and whether they block release.

---

## Rewrite Rules

When quality fails, rewrite with minimal drift:

- Keep the original user intent.
- Replace implementation-heavy wording with user behavior language.
- Keep acceptance criteria concise and verifiable.

---

## Output Template

```text
INVEST Review
- Independent: Pass | Needs Revision | Fail
- Negotiable: Pass | Needs Revision | Fail
- Valuable: Pass | Needs Revision | Fail
- Estimable: Pass | Needs Revision | Fail
- Small: Pass | Needs Revision | Fail
- Testable: Pass | Needs Revision | Fail

Quality Findings
- ...

Revised Story
- As a ...
- I want ...
- So that ...

Revised Acceptance Criteria
- Given ... When ... Then ...

Routing Decision
- Keep as-is | Revise only | Split required
```
