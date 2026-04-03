# Design: [Feature Name]

> Use this template alongside `spec.md` when your feature introduces architectural decisions,
> trade-offs, or patterns that future maintainers need to understand.
>
> File location: `.sdd/active/[feature-name]/design.md`
>
> **Required when:**
> - Feature introduces new patterns or architectural decisions
> - Trade-offs between approaches need to be documented
> - Non-obvious decisions that future maintainers need to understand

## Context

[Background: what does the current system look like? What prompted this decision now?
Reference existing files or patterns where relevant.]

Example:
> The current alert component uses `@Input()` bindings and `ChangeDetectorRef.markForCheck()`.
> Angular 20.3 signals are now the team standard, but migrating requires coordinating with
> all consumer components.

## Goals

- [What success looks like for this feature]
- [What constraints the solution must satisfy]

Example:
- Migrate AlertComponent to use Angular signals without breaking existing consumers
- Reduce template complexity by eliminating manual change detection calls

## Non-Goals

- [What we are explicitly NOT solving here]
- [Adjacent improvements that are out of scope for this change]

Example:
- Redesigning the alert's visual appearance
- Migrating other components to signals (only AlertComponent in scope)

## Decisions

### Decision: [Name]

[What was decided, and the rationale behind the choice. Include alternatives considered
if the decision was non-obvious.]

Example:
> **Use `input()` signal function instead of `@Input()` decorator.**
> Rationale: `input()` integrates with the signals graph and avoids `ngOnChanges`.
> Alternative considered: keep `@Input()` with `toSignal()` adapter — rejected because
> it adds an unnecessary conversion layer.

### Decision: [Name]

[Additional decision if needed]

## Risks / Trade-offs

- **[Risk or trade-off]:** [Description + mitigation or acceptance rationale]

Example:
- **Breaking change risk:** Consumers using `alertComponent.someProperty` directly will break.
  Mitigation: audit all usages with `grep` before merging; add migration note to PR description.
- **Signals learning curve:** Some team members are new to signals.
  Acceptance: the PR description will link to the Angular signals docs.
