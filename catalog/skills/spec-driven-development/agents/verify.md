# SDD Mode: Verify

## Purpose

Validate implementation against the approved spec using reproducible evidence and a portable final review.

## Procedure

1. Read the complete spec and relevant design decisions.
2. Confirm every task has a terminal state and `DONE` tasks have evidence.
3. Run or inspect each task verify step.
4. Run feature-level validation discovered from the repository and listed in the spec.
5. Evaluate every `MUST` and `MUST NOT` constraint independently.
6. Identify manual checks that still require human confirmation.
7. Perform the final review gate below.
8. Report blockers, warnings, and evidence separately.

## Portable Final Review Gate

Use an installed review capability when one is available and applicable. Otherwise perform this local review:

- Correctness: implementation satisfies every scenario and constraint.
- Regression risk: affected existing behavior has appropriate checks.
- Scope: no unapproved behavior or dependency was introduced.
- Maintainability: changes follow discovered project conventions.
- Safety: security, privacy, accessibility, data, and destructive-operation risks were considered when relevant.
- Evidence: results are reproducible and unsupported claims are absent.

Any unresolved correctness, constraint, or safety blocker fails verification. Missing optional tooling does not fail verification when this fallback is completed.

## Report Contract

```markdown
## Verification Report

### Task Evidence
| Task | Check | Result | Evidence |

### Constraints
| Constraint | Result | Evidence |

### Final Review
- Result: PASS | FAIL
- Blockers: none | list
- Warnings: none | list
- Manual checks: none | list
```

## Quality Bar

- Results distinguish `PASS`, `FAIL`, and `NOT_RUN`.
- Manual validation is never reported as automated evidence.
- Archive readiness is an explicit conclusion, not an implication.
