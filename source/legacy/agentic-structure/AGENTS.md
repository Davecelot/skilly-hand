# Repository Guidelines

## How to Use This Guide

- Start here for cross-project norms. ScannLab Design System is a monorepo with several components.
- Component docs override this file when guidance conflicts.

---

## Mandatory Reading

**BEFORE starting ANY task**, use these resources:

### Skills

| Skill | Purpose |
| ----- | ------- |
| [`token-optimizer`](skills/token-optimizer/SKILL.md) | **Required for all AI/model interactions.** Classifies task complexity, matches reasoning depth, and optimizes token usage. Guides whether to use thinking blocks, model tier selection, and response depth. |
| [`memory-curator`](skills/memory-curator/SKILL.md) | **Required when writing or updating memory entries.** Guides Claude on versioned, durable memory using the extended frontmatter spec. Defines creation, update, archive, and deletion rules; enforces MEMORY.md index compaction below 150 lines. |
| [`commit-guardian`](skills/commit-guardian/SKILL.md) | **Required before committing or pushing changes.** Runs scoped lint, unit tests, and coverage checks, then produces a go/no-go report with AI failure analysis. Use before any `git commit` or `git push` to confirm quality gates pass. |

### Agents

| Agent | Purpose |
| ----- | ------- |
| [`sdd-orchestrator`](.claude/agents/sdd-orchestrator.md) | **Required for planning complex feature work.** Orchestrates spec-driven development workflows with structured planning, atomic task execution, and automated verification. Use to organize any multi-phase development, bug fix coordination, or feature planning. |
| [`memory-compact`](.claude/agents/memory-compact.md) | **Required when compacting or auditing project memory.** Audits all memory files against the current codebase, detects stale/redundant/conflicting entries, merges and archives as needed, and rewrites MEMORY.md under 150 lines. |
| [`commit-guardian`](.claude/agents/commit-guardian.md) | **Required before committing or pushing changes.** Runs scoped lint, unit tests, and coverage checks, then produces a go/no-go report with AI failure analysis. Use before any `git commit` or `git push` to confirm quality gates pass. |

---

## Available Skills

Use these skills for detailed patterns on-demand:

### Generic Skills (Any Project)

| Skill | Description | URL |
| ----- | ----------- | --- |
| `agentic-benchmark` | Audits any repository's agentic structure and generates a standardized benchmark comparison report against public GitHub projects. Produces a reproducible, scored report across 10 standard dimensions. Reusable across any project type or tech stack. | [SKILL.md](skills/agentic-benchmark/SKILL.md) |
| `angular-20` | Base guidelines for writing Angular 20.3+ code, including signals, deferrable views, standalone components, and referencing official Angular sources for all implementation and review. | [SKILL.md](skills/angular-20/SKILL.md) |
| `css-modules` | Conventions for writing scoped CSS using CSS Modules, including pure CSS principles and attribute selectors. | [SKILL.md](skills/css-modules/SKILL.md) |
| `ds-researcher` | Design System researcher: searches trusted DS sources, flags unverified content, and synthesizes sourced answers about components, tokens, accessibility, and governance. | [SKILL.md](skills/ds-researcher/SKILL.md) |
| `token-optimizer` | Guides AI models to match reasoning depth and token usage to task complexity, optimizing for efficiency by recommending appropriate model tiers and thinking strategies. | [SKILL.md](skills/token-optimizer/SKILL.md) |

### ScannLab-Specific Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `scannlab-a11y-checker` | Checks Angular component accessibility against W3C WCAG 2.2 official standards. | [SKILL.md](skills/scannlab-a11y-checker/SKILL.md) |
| `scannlab-best-practices` | Angular and TypeScript coding best practices for ScannLab Design System components. | [SKILL.md](skills/scannlab-best-practices/SKILL.md) |
| `scannlab-code-connect` | Maps Figma components and variants to ScannLab Angular Code Connect files and Dev Mode snippets. | [SKILL.md](skills/scannlab-code-connect/SKILL.md) |
| `scannlab-figma-extractor` | Extracts comprehensive layer and node information from Figma links using the Figma MCP Server. Provides spec-driven data for all subsequent Figma tasks. Foundational skill for token matching and Code Connect mapping. | [SKILL.md](skills/scannlab-figma-extractor/SKILL.md) |
| `scannlab-run-commands` | Guide on running each stage of the ScannLab Design System project (dev, storybook, tests, lint, build). | [SKILL.md](skills/scannlab-run-commands/SKILL.md) |
| `scannlab-storybook` | Generates Storybook stories (.stories.ts) for Angular components in the ScannLab Design System. | [SKILL.md](skills/scannlab-storybook/SKILL.md) |
| `scannlab-token-validation` | Unified token validation skill. Phase 1 (figma-matcher): maps raw Figma values to ScannLab design tokens. Phase 2 (css-auditor): finds hard-coded values in component CSS and guides replacements. Prerequisite for Phase 1: `scannlab-figma-extractor`. | [SKILL.md](skills/scannlab-token-validation/SKILL.md) |
| `scannlab-unit-test` | Unit and integration testing for Angular components, directives, and services using Vitest. Covers TestBed setup, zoneless change detection, signal bindings, and behavioral testing patterns. Single source of truth for modern Angular testing with modern change detection and signals. | [SKILL.md](skills/scannlab-unit-test/SKILL.md) |
| `scannlab-playwright` | End-to-end visual regression and behavior testing for ScannLab Angular components using Playwright against Storybook. Covers screenshot baseline creation, keyboard navigation, hover/focus/disabled state testing, and interactive agentic QA via Playwright MCP. Complements Vitest unit tests with real-browser validation. | [SKILL.md](skills/scannlab-playwright/SKILL.md) |

### ScannLab-Meta Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `agents-sync` | Syncs AGENTS.md content to AI convention files (CLAUDE.md, GEMINI.md, copilot-instructions.md). | [SKILL.md](skills/agents-sync/SKILL.md) |
| `claude-agent-creator` | Creates Claude sub-agent files (.md) inside .claude/agents/ following the official Claude sub-agent spec, including all supported frontmatter fields, metadata tracking, and structured body conventions for this repo. | [SKILL.md](skills/claude-agent-creator/SKILL.md) |
| `commit-guardian` | Runs scoped advisory quality gates (lint, tests, coverage, build, Storybook) and produces structured go/no-go reports with AI failure analysis. | [SKILL.md](skills/commit-guardian/SKILL.md) |
| `commit-writer` | Analyzes local changes and drafts detailed, specific commit messages that explain what changed, why it changed, and where it changed, then recommends a SemVer impact without taking any versioning action. | [SKILL.md](skills/commit-writer/SKILL.md) |
| `memory-curator` | Guides Claude on writing versioned, durable memory entries using the extended memory frontmatter spec (version + last-verified fields). Defines creation, update, archive, and deletion rules; enforces MEMORY.md index compaction below 150 lines. | [SKILL.md](skills/memory-curator/SKILL.md) |
| `po-design-system` | Acts as a Product Owner for the ScannLab Design System. Writes, drafts, and structures Jira issue descriptions following a fixed 9-type taxonomy with templates, Complex Issue Package pattern, and PO judgment. | [SKILL.md](skills/po-design-system/SKILL.md) |
| `pr-writer` | Analyzes code changes and drafts compelling PR titles, descriptions, and metadata in Spanish that explain what changed, why it changed, and where it changed. Provides a clear, structured PR for the user to review and refine. | [SKILL.md](skills/pr-writer/SKILL.md) |
| `scannlab-agents-subfolder` | Creates AGENTS.md files for specific project subfolders to optimize AI task recognition and step-by-step guidance at component level. | [SKILL.md](skills/scannlab-agents-subfolder/SKILL.md) |
| `skill-creator` | Creates new AI agent skills following the Agent Skills spec. | [SKILL.md](skills/skill-creator/SKILL.md) |
| `skill-sync` | Syncs skill metadata from skills/*/SKILL.md into AGENTS.md and skills/README.md tables. | [SKILL.md](skills/skill-sync/SKILL.md) |
| `skill-test` | Validates other skills for structural integrity and semantic correctness. Three modes: (1) Structural validation via CLI script for pre-commit checks, (2) Metadata auto-update for version/last-edit/changelog tracking, (3) Semantic review via AI agent for consistency and quality assurance. | [SKILL.md](skills/skill-test/SKILL.md) |
| `scannlab-sdd` | Spec-driven development framework for ScannLab Design System. Guides users through structured spec creation, task decomposition, and atomic task execution. Enables team coordination via clear, versionable specifications stored in the repository. Includes specialized modes: plan (spec generation), apply (task execution with TDD), verify (7-gate validation), and orchestrate (full workflow chaining with HITL checkpoints). See `skills/scannlab-sdd/agents/` for details. | [SKILL.md](skills/scannlab-sdd/SKILL.md) |

### ScannLab Claude Agents

> **⚠️ Claude-only:** This section applies to Claude environments only. These agents are Claude-specific and will not work in other AI model environments (GPT, Gemini, etc.).

| Agent | Description | Location |
| ----- | ----------- | -------- |
| `convention-sync` | Syncs all AGENTS.md files across every folder level to their sibling convention files (CLAUDE.md, GEMINI.md, .github/copilot-instructions.md). Use proactively when any AGENTS.md is modified, when skill-sync finishes updating AGENTS.md, or when convention files may be out of date. | [.claude/agents/convention-sync.md](.claude/agents/convention-sync.md) |
| `po-design-system` | Product Owner agent for the ScannLab Design System. Drafts Jira issue descriptions using the po-design-system skill, then publishes them to Jira via MCP. Use proactively when the user wants to create, publish, or manage a Jira issue for the Design System. | [.claude/agents/po-design-system.md](.claude/agents/po-design-system.md) |
| `qa-expert` | QA Expert agent that validates ScannLab Angular components against their Figma design specs. Orchestrates the full Figma Component QA Workflow: Figma extraction → token matching → CSS audit → Playwright visual regression and behavior tests. Use proactively when asked to evaluate, validate, or QA a component against its Figma design. | [.claude/agents/qa-expert.md](.claude/agents/qa-expert.md) |
| `sdd-orchestrator` | Orchestrator agent for spec-driven development workflows. Guides users through structured spec creation, task decomposition, and atomic task execution with built-in verification and commit management. Enables team coordination via clear, versionable specifications. Use proactively when users want to plan feature work, coordinate bug fixes, or execute complex multi-phase development. | [.claude/agents/sdd-orchestrator.md](.claude/agents/sdd-orchestrator.md) |
| `memory-compact` | Autonomous agent that audits all memory files against the current codebase, detects stale/redundant/conflicting entries, merges and archives as needed, and rewrites MEMORY.md under 150 lines. Use proactively when MEMORY.md approaches 130 lines or after significant codebase changes. | [.claude/agents/memory-compact.md](.claude/agents/memory-compact.md) |
| `scaffold-builder` | Autonomous component creation agent that drives the full workflow from Figma extraction to Storybook visualization. Delegates spec planning to sdd-orchestrator, QA validation to qa-expert, and memory cleanup to memory-compact. Includes two HITL checkpoints. Use proactively when a user provides a Figma link and wants to build a new Design System component end-to-end. | [.claude/agents/scaffold-builder.md](.claude/agents/scaffold-builder.md) |
| `skill-manager` | Autonomous orchestrator for all skill-related tasks. Chains skill-creator → skill-test → skill-sync → agents-sync → convention-sync in the correct order. Use proactively when creating a new skill, validating an existing skill, registering a skill in AGENTS.md, or creating a new Claude sub-agent file. | [.claude/agents/skill-manager.md](.claude/agents/skill-manager.md) |
| `commit-guardian` | Advisory quality gate agent that runs scoped lint, unit tests, coverage, and optional build/Storybook checks before commit/push. Produces a structured go/no-go report with AI failure analysis and fix suggestions. Does not replace husky hooks. | [.claude/agents/commit-guardian.md](.claude/agents/commit-guardian.md) |

### Auto-invoke Claude Agents

> **⚠️ Claude-only:** This section applies to Claude environments only. These agents are Claude-specific and will not work in other AI model environments (GPT, Gemini, etc.).

When performing these actions, ALWAYS invoke the corresponding agent FIRST:

| Action | Agent |
| ------ | ----- |
| Updating AGENTS.md | `convention-sync` |
| Syncing AGENTS.md to convention files | `convention-sync` |
| Evaluating, validating, or QA-ing a component against a Figma design | `qa-expert` |
| Creating or publishing a Jira issue for the Design System | `po-design-system` |
| Planning and executing spec-driven development workflows | `sdd-orchestrator` |
| Compacting, auditing, or cleaning project memory entries | `memory-compact` |
| Building a new component end-to-end from a Figma link | `scaffold-builder` |
| Creating, validating, syncing, or auditing AI skills or Claude agents | `skill-manager` |
| Running a pre-commit or pre-push quality dry-run | `commit-guardian` |
| Analyzing a quality gate failure (lint, tests, coverage) | `commit-guardian` |
| Requesting a go/no-go summary before pushing | `commit-guardian` |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill | Prerequisite? |
| ------ | ----- | ------------- |
| Writing or reviewing Angular component code | `angular-20` | — |
| Writing or updating component styles | `css-modules` | — |
| Writing or reviewing Angular component code | `scannlab-best-practices` | — |
| Planning feature work, bug fixes, or complex multi-phase development | `scannlab-sdd` | — |
| Creating or updating Storybook stories | `scannlab-storybook` | — |
| Creating or updating unit tests | `scannlab-unit-test` | — |
| Creating or updating subfolder AGENTS.md | `scannlab-agents-subfolder` | — || Planning feature work, bug fixes, or complex multi-phase development | `scannlab-sdd` | — || Creating a new skill | `skill-creator` | — |
| Creating an agent for Claude | `claude-agent-creator` | — |
| Syncing skills with AGENTS.md | `skill-sync` | — |
| Auditing, reviewing, or validating an existing skill | `skill-test` | — |
| Auditing components for hard-coded values | `scannlab-token-validation` (phase 2: css-auditor) | — |
| Extracting or inspecting Figma component specs | `scannlab-figma-extractor` | — |
| Matching Figma values to design tokens | `scannlab-token-validation` (phase 1: figma-matcher) | `scannlab-figma-extractor` |
| Updating AGENTS.md | `agents-sync` | — |
| Reviewing or auditing component accessibility | `scannlab-a11y-checker` | — |
| Connecting Figma components to Code Connect mappings | `scannlab-code-connect` | `scannlab-token-validation` |
| Writing or reviewing commit messages | `commit-writer` | — |
| Writing or reviewing pull request descriptions | `pr-writer` | — |
| Writing or drafting a Jira issue for the Design System | `po-design-system` | — |
| Running project-level commands | `scannlab-run-commands` | — |
| Optimizing token usage and reasoning depth | `token-optimizer` | — |
| Auditing agentic structure or benchmarking AI integration quality | `agentic-benchmark` | — |
| Creating or updating Playwright tests | `scannlab-playwright` | — |
| Running visual regression or behavior tests | `scannlab-playwright` | — |
| Researching Design System best practices, WCAG, component patterns, or DS comparisons | `ds-researcher` | — |
| Writing, updating, or reviewing a memory entry | `memory-curator` | — |
| Running a pre-commit or pre-push quality dry-run | `commit-guardian` | — |

---

## Chaining Notations

Chaining notations document integrated workflows where multiple skills are sequentially invoked for complex tasks. Use these patterns to guide multi-step processes with consistent skill ordering. **Always invoke skills in the documented order; earlier skills are prerequisites.**

### Figma to Code Workflow

Complete workflow for converting Figma design components into production Angular components with full test coverage and accessibility compliance.

```text
Figma extraction
    → scannlab-figma-extractor                               (Extract comprehensive layer/node specs) [FOUNDATION]
    → scannlab-token-validation (phase 1: figma-matcher)     (Map Figma values to design tokens)
    → scannlab-best-practices                                (Implement component with best practices)
    → css-modules                                            (Style component with CSS Modules)
    → scannlab-storybook                                     (Create Storybook stories)
    → scannlab-unit-test                                     (Write unit and integration tests)
    → scannlab-a11y-checker                                  (Audit accessibility compliance)
    → scannlab-token-validation (phase 2: css-auditor)       (Verify token usage in CSS)
    → scannlab-code-connect                                  (Map Figma nodes to code components)
```

**When to use:** Converting Figma designs to production-ready Angular components.

**Auto-invoke guidance:** `scannlab-figma-extractor` is the mandatory first step whenever extracting or analyzing Figma components. All downstream skills depend on data from this foundational skill.

### Skill Creation Workflow

Workflow for creating, documenting, and integrating new AI skills into the repository.

```text
Asking for a new skill
    → skill-creator                       (Create new skill with proper structure)
    → skill-test                          (Validate structure and semantic correctness)
    → skill-sync                          (Sync skill metadata to AGENTS.md)
    → agents-sync                         (Sync updates to AI convention files)
```

**When to use:** Creating a new skill, adding agent instructions, or documenting patterns for AI.

### Pre-commit Enforcement Workflow

Workflow that runs automatically at `git commit` time via a combined dispatcher at `.git/hooks/pre-commit`. Two hooks fire in sequence — each exits `0` immediately when its own trigger is not met, so they never interfere with unrelated commits.

```text
Committing skill or AGENTS.md changes
    → skill-test (metadata-update)     (Update version, last-edit, changelog before staging)
    → skill-test (structural)          (Run skill-lint.js; blocks commit on lint failure)
    → agents-sync                      (Auto-syncs AGENTS.md → CLAUDE.md, GEMINI.md, copilot-instructions.md; auto-stages convention files)
    → git commit                       (Dispatcher calls both hooks in order)
```

**Dispatcher structure:**

```text
.git/hooks/pre-commit  (dispatcher)
    → skills/agents-sync/scripts/pre-commit-hook.sh    (trigger: AGENTS.md staged)
    → skills/skill-test/scripts/pre-commit-hook.sh     (trigger: skills/*/SKILL.md staged)
```

**When to use:** Any time you edit a `SKILL.md` file or `AGENTS.md` before committing. Run `skill-test (metadata-update)` manually first — the hook will block the commit if metadata is stale.

### Pre-push Quality Gate Workflow

Advisory dry-run before committing or pushing work. Enhances existing hooks with AI failure analysis.

```text
Running a pre-commit/pre-push dry-run
    → commit-guardian
        → Step 0: scope detection (git diff staged or branch diff)
        → Step 1: lint (npm run lint)
        → Step 2: unit tests (npx vitest run, scoped to changed components)
        → Step 3: coverage gate (npm run check:coverage, source changes only)
        → Step 4a (opt): build (npm run build)
        → Step 4b (opt): Storybook build (npm run build-storybook)
        → Step 5: AI failure analysis per failed gate
        → Step 6: go/no-go report
```

**When to use:** Before any commit or push when you want a confident go/no-go with AI root-cause analysis on failures. Advisory only — does not replace `.husky/pre-push` blocking gate.

---

### Figma Component QA Workflow

Workflow for evaluating and validating a Figma component specification against its Angular implementation to ensure design-code alignment.

```text
Asking for Figma component QA/evaluation
    → scannlab-figma-extractor                              (Extract comprehensive Figma specs and design tokens)
    → scannlab-token-validation (phase 1: figma-matcher)    (Match Figma design values to ScannLab tokens)
    → scannlab-token-validation (phase 2: css-auditor)      (Verify token usage in component CSS)
    → scannlab-playwright                                   (Visual regression + behavior validation in browser)
```

**When to use:** Evaluating component specs, comparing Figma designs with code implementations, validating design-code consistency, or conducting QA on existing components.

---

### Memory Health Workflow

Workflow for keeping the Claude project memory directory accurate, compact, and under the 150-line MEMORY.md index limit.

```text
Memory entry operation or MEMORY.md growing
    → memory-curator         (guide on extended spec: create, update, archive, delete entries)
    → memory-compact agent   (audit + compact when index grows or after codebase changes)
```

**When to use:** When writing or updating memory entries, when MEMORY.md approaches 130 lines, or after significant codebase changes (skill additions/deletions, component restructuring).

---

## Project Overview

ScannLab Design System is the Design System and UI library for Scanntech, developed as a desktop-first library for dashboards and Angular projects. This is a monorepo with shared infrastructure for development, testing, storytelling, and AI-driven skills.

### Directory Structure

| Component | Location | Purpose | Tech Stack |
| --------- | -------- | ------- | ---------- |
| **UI Library** | `projects/scanntech-ui/` | Core component library with 30+ production-ready components | Angular 20.3+, TypeScript 5.9+, CSS Modules |
| **Components** | `projects/scanntech-ui/src/components/` | Individual UI components (alert, button, modal, datagrid, etc.) | Angular standalone components, signals, control flow |
| **Component Docs** | `projects/scanntech-ui/src/docs/` | Component API documentation and guidelines | Markdown |
| **Storybook** | `.storybook/` + root config | Interactive component development environment | Storybook, Vite, Vitest |
| **Documentation** | `docs/` | Project-level docs (best practices, testing, Storybook guidance) | Markdown, MDX |
| **Scripts** | `scripts/` | Automation and utility scripts | Node.js |
| **Skills** | `skills/` | AI agent skills and workflow documentation (20+ skills) | Markdown (SKILL.md), shell (setup scripts) |
| **AI Config** | `.claude/`, `.gemini/`, `.github/copilot-instructions.md` + root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | Agent configuration and instructions for different AI models | YAML, Markdown |
| **Build Config** | Root level (angular.json, tsconfig.json, vitest.config.ts, etc.) | Monorepo build and test configuration | JSON, TypeScript |
| **Docker** | `Dockerfile`, `nginx.conf` | Container configuration for deployment | Docker, nginx |

### Key Technologies

- **Frontend Framework**: Angular 20.3+ with signals and standalone components
- **Language**: TypeScript 5.9+
- **Styling**: CSS Modules (scoped component styles)
- **Build & Dev**: Vite with Storybook
- **Testing**: Vitest with TestBed for Angular
- **Design Integration**: Figma with Code Connect mappings
- **Package Management**: npm (monorepo with workspaces)
