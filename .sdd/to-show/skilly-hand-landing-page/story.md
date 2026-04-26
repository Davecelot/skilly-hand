# User Story: skilly-hand Landing Page

## Context Snapshot

- **Persona:** Developer or technical team lead evaluating whether skilly-hand is worth installing.
- **Problem:** The README explains the CLI, but there is no focused visual landing page that quickly communicates the product, workflow, catalog, and install path.
- **Desired outcome:** A visitor understands skilly-hand in under one minute and can install it or inspect available skills without opening multiple docs.
- **Constraints:** One-page landing, minimal sections, strong visual identity, informative rather than sales-heavy, built using the skilly-hand planning and frontend-design workflow.

## Final Story Set

### Story 1: Understand and Install skilly-hand

As a developer evaluating AI agent tooling, I want a one-page skilly-hand landing page that explains what it is, how it works, what skills are available, and how to install it, so that I can decide quickly whether to use it in my project.

### Story 2: Explore Skills Without Leaving the Page

As a developer comparing skill coverage, I want to scan the catalog by skill name, purpose, and tags, so that I can identify relevant workflows and choose where to deep dive next.

## Acceptance Criteria

### Story 1

```gherkin
Given I open the landing page
When the first viewport loads
Then I see the skilly-hand name, a short value proposition, and the primary install command
```

```gherkin
Given I am reading the page
When I reach the workflow explanation
Then I can understand the sequence: detect stack, select skills, install for assistants, verify with doctor
```

```gherkin
Given I want to install skilly-hand
When I view the install area
Then I see `npx skilly-hand`, `npx skilly-hand install`, and supporting commands for detect, list, and doctor
```

### Story 2

```gherkin
Given I want to inspect the catalog
When I view the skills area
Then I see every current catalog skill with a short plain-language purpose and tags
```

```gherkin
Given I need more detail about a skill
When I select or follow a deep-dive affordance
Then I can reach the relevant local catalog path or generated docs target for that skill
```

## Quality Review

- **Independent:** Pass. The landing page can ship without backend or CLI changes.
- **Negotiable:** Pass. Layout and interaction details can adapt after stack detection.
- **Valuable:** Pass. Directly improves evaluation and installation clarity.
- **Estimable:** Pass. Scope is bounded to one page plus design/planning docs.
- **Small:** Pass if implemented as one page with no docs migration or multi-page site.
- **Testable:** Pass. Acceptance criteria are observable through browser and accessibility checks.

## Split + Map Notes

Release slice:

1. Planning baseline: `DESIGN.md`, user story, SDD spec, task breakdown.
2. Landing MVP: one static page with hero, workflow, skills, install.
3. Polish gate: responsive visual refinement, accessibility audit, final review-rangers pass.
