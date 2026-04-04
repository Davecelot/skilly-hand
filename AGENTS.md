<!-- Managed by skilly-hand. Re-run `npx skilly-hand install` or `npm run agentic:self:sync` to regenerate. -->
# skilly-hand AI Agent Orchestrator

> Root guidance for repository-wide AI routing. Use this file to understand where work belongs, what skills to invoke, and when triggers apply.

## Where

- Scope: repository root and all descendant folders unless a deeper AGENTS guide overrides locally.
- Generated at: self-sync
- Detected technologies: nodejs, typescript
- Escalation boundary: when work changes global architecture, CI/CD, release, or security policy, escalate before implementation.

## What

### Installed Skill Registry

| Skill | Description | Tags |
| ----- | ----------- | ---- |
| `accessibility-audit` | Audit web accessibility against W3C WCAG 2.2 Level AA using framework-agnostic checks, remediation patterns, and portable command-line scanning. | frontend, accessibility, workflow, quality |
| `agents-root-orchestrator` | Author root AGENTS.md as a Where/What/When orchestrator that routes tasks and skill invocation clearly. | core, workflow, orchestration |
| `angular-guidelines` | Guide Angular code generation and review using latest stable Angular verification and modern framework best practices. | angular, frontend, workflow, best-practices |
| `figma-mcp-0to1` | Guide users from Figma MCP installation and authentication through first canvas creation, with function-level tool coverage and operational recovery patterns. | figma, mcp, workflow, design |
| `skill-creator` | Create and standardize AI skills with reusable structure, metadata rules, and templates. | core, workflow, authoring |
| `spec-driven-development` | Plan, execute, and verify multi-step work through versioned specs with small, testable tasks. | core, workflow, planning |
| `token-optimizer` | Classify task complexity and right-size reasoning depth, context gathering, and response detail to reduce wasted tokens. | core, workflow, efficiency |

### Task Routing

**SDD-first policy:** for feature delivery, bug fixes, or any multi-step implementation, start with `spec-driven-development` unless the task is clearly trivial and one-step.

| Task Type | Recommended Skill Chain |
| --------- | ----------------------- |
| Planning feature work, bug fixes, and multi-phase implementation | `spec-driven-development` |
| Executing approved implementation plans | `spec-driven-development` -> task-specific skills |
| Creating or updating reusable skills | `skill-creator` |
| Creating or updating root AGENTS orchestration guidance | `agents-root-orchestrator` |

## When

### Auto-invoke Triggers

| Action | Skill |
| ------ | ----- |
| Auditing, reviewing, or implementing web accessibility against WCAG 2.2 Level AA | `accessibility-audit` |
| Creating or updating root AGENTS.md orchestration guidance | `agents-root-orchestrator` |
| Generating, reviewing, or refactoring Angular code artifacts in Angular projects | `angular-guidelines` |
| Installing, configuring, or using Figma MCP from setup through first canvas creation | `figma-mcp-0to1` |
| Creating a new skill | `skill-creator` |
| Planning or executing feature work, bug fixes, and multi-phase implementation | `spec-driven-development` |
| Classifying task complexity and choosing reasoning depth/token budget | `token-optimizer` |

### Sequencing Rules

1. Classify task intent and scope first.
2. If work is non-trivial, invoke `spec-driven-development` before implementation.
3. Invoke prerequisite skills before implementation skills.
4. Verify outcomes and update this routing map when workflows change.

## Chaining Notations

Chaining notations document integrated workflows where multiple skills are sequentially invoked for complex tasks. Always invoke skills in documented order.

### Root AGENTS Maintenance Workflow

```text
Updating root AGENTS.md guidance
  -> agents-root-orchestrator
  -> skill-creator (if reusable workflow docs changed)
```

### Skill Introduction Workflow

```text
Asking for a new reusable skill
  -> skill-creator
  -> spec-driven-development
  -> agents-root-orchestrator
```

### SDD-First Delivery Workflow

```text
Feature, bug, or multi-step execution request
  -> spec-driven-development
  -> task-specific implementation skill(s)
  -> agents-root-orchestrator (if routing guidance changed)
```

## Usage

- Read the relevant `SKILL.md` file before starting a specialized task.
- Prefer installed skills under `.skilly-hand/catalog/` or repository `catalog/skills` as the source of truth.
- Use project-specific docs only as a supplement to these portable rules.
