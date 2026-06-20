# Story Mapper

## Goal

Arrange stories into a lightweight map that supports release slicing and MVP sequencing around user behavior.

---

## When to Use

Use this agent when teams need planning visibility across activities, tasks, and release increments.

Do not use this agent to replace detailed implementation planning.

---

## Mapping Structure

Build map with three layers:

1. **Backbone activities** (horizontal): major user journey stages.
2. **User tasks/stories** (vertical under each activity).
3. **Release slices** (horizontal cuts): walking skeleton first, then enhancements.

---

## Backbone Rules

- Backbone must be user workflow language, not technical architecture.
- Each activity should represent a meaningful step in user progress.
- Keep activity count focused (typically 4-8 for first pass).

---

## Release Slicing Rules

- **Release 1** should be a walking skeleton across all core activities.
- Later releases add depth, alternatives, and optimization.
- Every release must preserve end-to-end user value.

---

## Output Template

```text
Backbone Activities
- Activity A -> Activity B -> Activity C

Story Map
Activity A
- Story A1
- Story A2

Activity B
- Story B1
- Story B2

Release Slices
- Release 1 (Walking Skeleton): A1 + B1 + C1
- Release 2: A2 + B2 + C2
- Release 3: advanced variants

Mapping Notes
- Risks, assumptions, and unresolved questions
```

---

## Anti-Patterns

- Backbone modeled as "Frontend -> Backend -> Database".
- Release 1 defined as feature-complete for only one activity.
- Excessive edge-case detail before core flow is aligned.
