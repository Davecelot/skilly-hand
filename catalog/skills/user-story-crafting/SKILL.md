---
name: "user-story-crafting"
description: "Create and refine user stories with structured quality gates, splitting heuristics, and lightweight story mapping for release slicing. Trigger: writing, restructuring, splitting, or sequencing user stories for delivery-ready backlog work."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-04-11"
  license: "Apache-2.0"
  version: "1.0.0"
  changelog: "Added new user-story-crafting skill with integrated writing, structuring, splitting, and mapping agents; improves backlog quality and delivery sequencing through a unified user-story workflow; affects catalog skills, agent routing metadata, and managed AGENTS outputs"
  auto-invoke: "Writing, restructuring, splitting, or sequencing user stories into delivery-ready backlog items"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "Task"
    - "SubAgent"
---
# User Story Crafting Guide

## When to Use

Use this skill when:

- A backlog item needs to be written as a user-centered story.
- A story is unclear, too technical, or missing measurable outcomes.
- A story is too large to estimate or deliver safely in one iteration.
- A team needs lightweight story mapping to sequence releases around user value.

Do not use this skill for:

- Pure engineering chores with no user outcome.
- Architectural RFCs or deep technical design documents.
- Sprint capacity planning unrelated to user behavior.

---

## Routing Map

| Step | Intent | Sub-agent |
| --- | --- | --- |
| 1 | Draft the baseline user story and acceptance criteria | [agents/story-writer.md](agents/story-writer.md) |
| 2 | Validate structure and quality with INVEST + anti-pattern checks | [agents/story-structurer.md](agents/story-structurer.md) |
| 3 (if story is too large) | Split into independent, value-first increments | [agents/story-splitter.md](agents/story-splitter.md) |
| 4 (optional) | Map activities, tasks, and release slices | [agents/story-mapper.md](agents/story-mapper.md) |

Always run step 1 and step 2. Run step 3 when any size/risk signal appears. Run step 4 when roadmap sequencing or MVP slicing is requested.

---

## Standard Execution Sequence

1. Capture context intake: persona, goal, problem, constraints, and assumptions.
2. Draft one baseline story in Cohn format:
   - `As a [persona]`
   - `I want [capability]`
   - `So that [outcome/value]`
3. Add testable acceptance criteria in Given/When/Then structure.
4. Run quality checks using INVEST plus ambiguity/measurability filters.
5. If oversized or coupled, split into smaller stories using vertical slice patterns.
6. Optionally organize split stories into a lightweight map with release slices.
7. Return a final artifact bundle with:
   - Polished stories
   - Acceptance criteria
   - INVEST review notes
   - Split rationale (if applied)
   - Map-ready release structure (if applied)

---

## Critical Patterns

### Pattern 1: User Outcome First

A story is valid only when it states user value, not implementation tasks.

```text
Good: As a returning customer, I want to reuse my saved card, so that checkout is faster.
Bad: As a developer, I want to refactor payment services, so that code is cleaner.
```

### Pattern 2: Acceptance Criteria Must Be Testable

Every criterion should be observable and verifiable by behavior.

```gherkin
Given a logged-in customer with a saved card
When they choose "Pay with saved card"
Then the order is submitted without re-entering card details
```

### Pattern 3: INVEST Is a Gate, Not a Suggestion

Before finalizing any story, verify:

- Independent
- Negotiable
- Valuable
- Estimable
- Small
- Testable

If two or more INVEST checks fail, do not finalize; split or rewrite first.

### Pattern 4: Split by User Value, Not by System Layer

Prefer vertical slices that preserve end-to-end user outcomes.

```text
Good split: Browse -> Add -> Pay (thin end-to-end slice first)
Bad split: Frontend -> Backend -> Database
```

### Pattern 5: Mapping Is Lightweight and Release-Oriented

Story mapping is used to sequence value, not to model exhaustive edge-case detail up front.

---

## Decision Tree

```text
Need a new story from a request?
  -> Draft with story-writer

Story written but quality unclear?
  -> Run story-structurer

Story fails Small/Estimable/Independent?
  -> Run story-splitter

Need MVP/release sequencing?
  -> Run story-mapper

No user value is present?
  -> Reframe as user outcome or classify as non-story technical work item
```

---

## Output Contract

Return results in this order:

1. **Context Snapshot**: persona, problem, desired outcome, constraints.
2. **Final Story Set**: one or more refined user stories.
3. **Acceptance Criteria**: Given/When/Then per story.
4. **Quality Review**: INVEST pass/fail + fixes applied.
5. **Split + Map Notes**: split rationale and release slice proposal (when used).

---

## Example

### Input

```text
"Users abandon onboarding because setup is confusing."
```

### Condensed Output

```text
Context Snapshot
- Persona: New team admin
- Problem: Setup confusion during first session
- Outcome: Reach first successful project setup quickly

Final Story Set
- As a new team admin, I want a guided setup checklist, so that I can complete onboarding without guessing next steps.

Acceptance Criteria
- Given I created a new workspace
  When I open the onboarding page
  Then I see a checklist of setup steps in recommended order
- Given I complete one setup step
  When I return to onboarding
  Then progress shows the completed step and next recommended action

Quality Review
- INVEST: Pass (all six checks)

Split + Map Notes
- Not required for this scope
```

---

## Commands

```bash
# Validate catalog metadata/frontmatter drift
npm run catalog:check

# Apply frontmatter + README sync changes
npm run catalog:sync

# Regenerate managed AGENTS files after catalog updates
npm run agentic:self:sync
```
