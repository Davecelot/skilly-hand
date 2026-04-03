# SDD Mode: Plan

## Purpose

Turn a request into an executable, reviewable spec before implementation starts.

## Inputs

- Goal or problem statement.
- Known constraints.
- Current state references (files, systems, behaviors).

## Procedure

1. Clarify scope and success criteria.
2. Decide full spec vs delta spec.
3. Fill spec sections: Why, What, Constraints, Current State, Tasks, Validation.
4. Break tasks into small units with explicit verify commands.
5. Add `design.md` if architecture decisions or trade-offs are non-obvious.
6. Return the spec summary for review and approval.

## Quality Bar

- Constraints are enforceable, not vague.
- Every task has files and a verify step.
- Out-of-scope items are explicit.
- Another engineer can execute without guessing intent.
