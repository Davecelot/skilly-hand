# Spec Validation Checklist

## Portability

- [ ] The workflow is executable without a named external skill, agent, vendor, service, framework, VCS, package manager, or test runner.
- [ ] Required capabilities are semantic and can use a local fallback.
- [ ] Commands were discovered from the target project or are clearly marked as placeholders.
- [ ] Protocol states use portable ASCII tokens.

## Spec Quality

- [ ] `Why` and `What` are concrete.
- [ ] Constraints and out-of-scope boundaries are enforceable.
- [ ] Current-state claims reference verified context.
- [ ] Approval and reapproval policies are explicit.
- [ ] Architecture decisions are captured only when their rationale matters.

## Task Quality

- [ ] Each task has one observable outcome.
- [ ] Each task declares capabilities, files, verify step, and definition of done.
- [ ] Behavioral tasks include an acceptance scenario.
- [ ] Dependencies and blockers are visible.
- [ ] Tasks exist only in `spec.md`.

## Execution Evidence

- [ ] Every `DONE` task has reproducible evidence.
- [ ] Failed or unavailable checks are recorded honestly.
- [ ] Scope changes updated the spec before implementation continued.
- [ ] Superseded evidence is identified.

## Pre-Archive

- [ ] All tasks are `DONE` and no blocker remains.
- [ ] Feature validation and constraint checks pass.
- [ ] The portable final review gate passes.
- [ ] Manual checks are complete or explicitly approved.
- [ ] Delta reconciliation is complete when applicable.
- [ ] Archive name uses `<YYYY-MM-DD>-<work-name>`.
