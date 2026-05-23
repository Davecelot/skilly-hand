<!-- Managed by skilly-hand. Re-run `npx skilly-hand install` or `npm run agentic:self:sync` to regenerate. -->
# skilly-hand AI Agent Orchestrator

> Root guidance for repository-wide AI routing. Use this file to understand where work belongs, what skills to invoke, and when triggers apply.

## Where

- Scope: repository root and all descendant folders unless a deeper AGENTS guide overrides locally.
- Generated at: self-sync
- Detected technologies: nodejs
- Escalation boundary: when work changes global architecture, CI/CD, release, or security policy, escalate before implementation.

## What

### Installed Skill Registry

| Skill | Description | Tags |
| ----- | ----------- | ---- |
| `accessibility-audit` | Audit web accessibility against W3C WCAG 2.2 Level AA using framework-agnostic checks, remediation patterns, and portable command-line scanning. | frontend, accessibility, workflow, quality |
| `agents-root-orchestrator` | Author root AGENTS.md as a Where/What/When orchestrator that routes tasks and skill invocation clearly. | core, workflow, orchestration |
| `angular-guidelines` | Guide Angular code generation, review, and performance tuning using latest stable Angular verification, official Angular skill guidance, and modern framework best practices. Trigger: generating, reviewing, refactoring, or optimizing Angular code artifacts in Angular projects. | angular, frontend, workflow, best-practices |
| `context-handoff` | Capture compact, neutral, AI-ready Markdown handoffs that preserve session context across chats without becoming a full transcript or personal memory store. Trigger: summarizing, compacting, preserving, or handing off session context across chats. | core, workflow, memory, communication |
| `figma-mcp-0to1` | Guide users from Figma MCP installation and authentication through first canvas creation, with function-level tool coverage and operational recovery patterns. | figma, mcp, workflow, design |
| `forge-me-a-skill` | Create and standardize AI skills with reusable structure, metadata rules, and templates. | core, workflow, authoring |
| `frontend-design` | Project-aware frontend design skill that detects the existing tech stack, UI libraries, CSS variables, and design tokens before proposing any UI work. Supports greenfield projects via DESIGN.md context setup, taste-reference extraction, post-generation critique, visual refinement, and Motion/GSAP-aware motion polish. | frontend, design, workflow, ui, motion, greenfield |
| `gsap-animation` | Guide GSAP animation implementation using only official GSAP documentation and the official greensock/gsap-skills source material. Trigger: implementing, reviewing, or choosing GSAP for frontend motion, timelines, ScrollTrigger, React useGSAP, gsap.utils, Vue/Svelte/Nuxt animation, GSAP plugins, JavaScript animation libraries, or advanced UI animation. | frontend, animation, motion, gsap, workflow |
| `motion-animation` | Guide Motion, formerly Framer Motion, animation implementation using only official Motion documentation. Trigger: implementing, reviewing, or choosing Motion for JavaScript animation, React motion components, gestures, scroll animation, layout animation, exit animation, or framework-agnostic UI motion. | frontend, animation, motion, framer-motion, workflow |
| `output-optimizer` | Optimize output token consumption through compact interpreter modes with controlled expansion when complexity, ambiguity, or risk requires more detail. Trigger: minimizing response verbosity while preserving clarity and correctness. | core, workflow, efficiency, communication |
| `project-security` | Scan project configuration and release surfaces for leak and security risks, and enforce security gates on commit, push, and publish workflows across GitHub, GitLab, npm, pnpm, yarn, and generic CI. Trigger: validating repository security posture, preventing secret leaks, or hardening delivery pipelines. | security, workflow, quality, core |
| `project-teacher` | Scan the active project and teach any concept, code path, or decision using verified information, interactive questions, and simple explanations. Trigger: user asks to explain, understand, clarify, or learn about anything in the project or codebase. | core, workflow, education |
| `prompt-engineering` | Guide users in writing, improving, evaluating, and tuning prompts for LLMs across factual, creative, structured, grounded, coding, safety-sensitive, and production scenarios. Trigger: writing, improving, evaluating, or tuning prompts for LLMs. | prompting, llm, workflow, quality |
| `react-guidelines` | Guide React and Next.js code generation, review, and performance tuning using latest stable React verification and modern framework best practices. Trigger: generating, reviewing, refactoring, or optimizing React code artifacts in React projects. | react, frontend, workflow, best-practices |
| `review-rangers` | Review code, decisions, and artifacts through a multi-perspective committee and a domain expert safety guard, then synthesize a structured verdict. | core, workflow, review, quality |
| `roaster` | Challenge plans with constructive roast-style critique that exposes weak assumptions, missing angles, shallow sequencing, and unclear success criteria. Trigger: when the user proposes, requests, or evaluates a plan of any kind. | core, workflow, planning, quality |
| `spec-driven-development` | Plan, execute, and verify multi-step work through versioned specs with small, testable tasks. | core, workflow, planning |
| `test-driven-development` | Guide implementation using the RED → GREEN → REFACTOR TDD cycle: write a failing test first, write the minimum code to pass, then refactor while tests stay green. | testing, workflow, quality, core |
| `token-optimizer` | Classify task complexity and right-size reasoning depth, context gathering, and response detail to reduce wasted tokens. | core, workflow, efficiency |
| `user-story-crafting` | Create and refine user stories with structured quality gates, splitting heuristics, and lightweight story mapping for release slicing. Trigger: writing, restructuring, splitting, or sequencing user stories for delivery-ready backlog work. | product, workflow, planning, quality |

### Mandatory Skill Gate (Must Use / Must Read)

This gate has global precedence and applies to every user interaction across all supported agent conventions/files.

1. Always run `token-optimizer` first to classify complexity and set the minimum viable reasoning depth.
2. Always run `output-optimizer` immediately after `token-optimizer` for response-shape control.
3. `output-optimizer` mode policy:
   - Default: use `step-brief` when there is no explicit mode or strong phrasing signal.
   - Override: if user explicitly requests a mode (for example `mode: step-brief`), that explicit mode wins.
   - Persistence: keep the explicitly requested mode active until the user asks for a different mode.

### Mandatory Planning Challenge Gate (Must Use / Must Read)

This gate is mandatory whenever the user proposes, requests, or evaluates a plan of any kind.

1. Always run `roaster` before agreeing with or executing a plan.
2. Use `roaster` to critique assumptions, scope, sequencing, risks, and verification.
3. Keep the critique constructive and actionable; target the plan, not the person.
4. Skip only for emergencies, trivial one-step tasks, or sensitive contexts where roast tone would be inappropriate.

### Task Routing

**Mandatory-gate precedence:** apply the mandatory optimizer gate first, then apply the mandatory planning challenge gate when the task includes planning.

**SDD-first policy:** for feature delivery, bug fixes, or any multi-step implementation, start with `spec-driven-development` unless the task is clearly trivial and one-step.

| Task Type | Recommended Skill Chain |
| --------- | ----------------------- |
| Planning feature work, bug fixes, and multi-phase implementation | `spec-driven-development` |
| Executing approved implementation plans | `spec-driven-development` -> task-specific skills |
| Creating or updating reusable skills | `forge-me-a-skill` |
| Creating or updating root AGENTS orchestration guidance | `agents-root-orchestrator` |

## When

### Auto-invoke Triggers

| Action | Skill |
| ------ | ----- |
| Auditing, reviewing, or implementing web accessibility against WCAG 2.2 Level AA | `accessibility-audit` |
| Creating or updating root AGENTS.md orchestration guidance | `agents-root-orchestrator` |
| Generating, reviewing, refactoring, or optimizing Angular code artifacts in Angular projects | `angular-guidelines` |
| Summarizing, compacting, preserving, or handing off session context across chats | `context-handoff` |
| Installing, configuring, or using Figma MCP from setup through first canvas creation | `figma-mcp-0to1` |
| Creating a new skill | `forge-me-a-skill` |
| Designing or generating UI components, pages, or layouts in a web or mobile project; setting up visual direction for a greenfield project; critiquing generated UI for AI slop; adding motion or micro-interactions to existing UI; refining or polishing generated UI output | `frontend-design` |
| Implementing, reviewing, or choosing GSAP for frontend motion, timelines, ScrollTrigger, React useGSAP, gsap.utils, Vue/Svelte/Nuxt animation, GSAP plugins, JavaScript animation libraries, or advanced UI animation | `gsap-animation` |
| Implementing, reviewing, or choosing Motion for JavaScript animation, React motion components, gestures, scroll animation, layout animation, exit animation, or framework-agnostic UI motion | `motion-animation` |
| When minimizing output verbosity or selecting compact communication modes | `output-optimizer` |
| Scanning project configuration and delivery workflows for leaks or security issues before commit, push, or publish | `project-security` |
| User needs to understand, explain, or learn about any aspect of the project or codebase | `project-teacher` |
| Writing, improving, evaluating, or tuning prompts for LLMs | `prompt-engineering` |
| Generating, reviewing, refactoring, or optimizing React code artifacts in React projects | `react-guidelines` |
| Reviewing code, decisions, or artifacts where adversarial multi-perspective evaluation adds value | `review-rangers` |
| When the user proposes, requests, or evaluates a plan of any kind | `roaster` |
| Planning or executing feature work, bug fixes, and multi-phase implementation | `spec-driven-development` |
| Implementing features, services, or components using test-driven development (TDD) or RED→GREEN→REFACTOR cycles | `test-driven-development` |
| Classifying task complexity and choosing reasoning depth/token budget | `token-optimizer` |
| Writing, restructuring, splitting, or sequencing user stories into delivery-ready backlog items | `user-story-crafting` |

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
  -> forge-me-a-skill (if reusable workflow docs changed)
```

### Skill Introduction Workflow

```text
Asking for a new reusable skill
  -> forge-me-a-skill
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
