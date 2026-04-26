# Task Plan: skilly-hand Landing Page

## Skill Chain

1. `token-optimizer`: classify scope as moderate because this is planning plus future UI implementation across new files.
2. `output-optimizer`: use `step-brief` style unless implementation complexity requires detail.
3. `user-story-crafting`: define user value, acceptance criteria, and release slice.
4. `spec-driven-development`: keep `spec.md` as the execution source of truth.
5. `frontend-design`: use `DESIGN.md`, run stack detection, then component/page design.
6. `react-guidelines`: use if the confirmed site stack is React.
7. `accessibility-audit`: validate WCAG 2.2 AA before completion.
8. `project-security`: use before commit/push/publish if delivery surfaces change.
9. `review-rangers`: final gate before archiving the SDD work.

## Implementation Sequence

### Phase 0: Planning Baseline

- [x] Create user story and acceptance criteria.
- [x] Create `DESIGN.md` from stated references and constraints.
- [x] Create SDD spec and tasks.

### Phase 1: Stack Confirmation

- [x] Run frontend-design stack detector.
- [x] Choose site location and framework.
- [x] Confirm whether catalog data is imported from manifests, generated JSON, or hardcoded from current catalog metadata.

### Phase 2: Build MVP

- [x] Scaffold the one-page site.
- [x] Add hero with skilly-hand name, tagline, and install command.
- [x] Add how-it-works flow.
- [x] Add compact skills catalog.
- [x] Add install/download command band.

### Phase 3: Deep Dive and Interaction

- [x] Add skill filtering, grouping, or compact expand/collapse if it improves scanability.
- [x] Add deep-dive links or details for every skill.
- [x] Add command copy interaction if the chosen stack supports it without excess complexity.

### Phase 4: Polish and Verification

- [x] Responsive visual pass.
- [x] Reduced-motion and keyboard interaction pass.
- [x] WCAG 2.2 AA audit.
- [x] Build/test verification.
- [x] `review-rangers` final review.
- [x] Archive `.sdd/active/skilly-hand-landing-page` after implementation completes.

## Open Decisions

- Site stack: confirmed as Vite + React static site in `site/`.
- Hosting path: undecided; likely out of scope for initial landing-page build.
- Skill deep dive format: inline expandable detail with source catalog path.
- Catalog data is generated from `catalog/skills/*/manifest.json` before dev/build.
