---
name: scannlab-agents-subfolder
description: >
  Creates AGENTS.md files for specific project subfolders to optimize AI task recognition and step-by-step guidance at component level.
  Trigger: When organizing AI instructions for subfolders, creating folder-specific guidelines, or setting up multi-tier agent rulesets.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.2.1"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [ui]
  auto-invoke: >
    Creating or updating subfolder AGENTS.md.
    After editing this SKILL.md, invoke agents/templates-sync.md to reconcile asset templates.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
allowed-modes:
  - templates-sync  # Via agents/templates-sync.md — reconciles asset templates when SKILL.md changes
---

# Subfolder AGENTS.md Creation Guide

## When to Create a Subfolder AGENTS.md

**Create when:**

- A folder contains 3+ components or modules requiring specialized patterns.
- Subfolder has its own tech stack or framework different from root.
- Folder-specific workflows need explicit AI guidance (e.g., component generation, testing, docs).
- Multi-team collaboration benefits from localized AI instructions.
- Folder scales to >10 files requiring consistent conventions.

**Don't create when:**

- Folder has <3 components (keep guidance at root level).
- Patterns are identical to root AGENTS.md (inherit instead).
- Temporary or throwaway code.
- Single-file utilities or helpers.

---

## Folder Hierarchy Structure

Each AGENTS.md in the hierarchy plays a distinct role in the orchestrator-lead-director model:

| Role | Position | Responsibility |
| ---- | -------- | -------------- |
| **Root Orchestrator** | Repository root `AGENTS.md` | Org-wide patterns, full skill registry, chaining workflows |
| **Library Lead** | Project-level `AGENTS.md` | Domain map, task routing, library-scope rules, delegates to child directors |
| **Component Director** | Subfolder `AGENTS.md` | Folder-specific skill chains, quality gates, creation workflows |

```
repository/
├── AGENTS.md                           # Root Orchestrator — org-wide patterns, all skills
├── projects/scanntech-ui/
│   ├── AGENTS.md                       # Library Lead — domain map, routing, delegates to child directors
│   ├── src/
│   │   ├── components/
│   │   │   ├── AGENTS.md               # Component Director — skill chains, quality gates, creation workflow
│   │   │   ├── button/
│   │   │   │   └── AGENTS.md           # Component-specific director (only if warranted)
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── AGENTS.md               # Services Director — service-specific rules
│   │   └── ...
│   └── ...
└── ...
```

**Key Rule**: Each AGENTS.md applies to its folder AND all descendants, except where children override (more specific = more local). A Library Lead must have a Task → Skill Routing Table that explicitly delegates to its child directors.

---


## Content Structure Template

Each subfolder AGENTS.md should contain:

1. **Header** - Folder purpose and scope (includes `IMPORTANT` inheritance notice inline)
2. **Inherits From** - List parent AGENTS.md files (relative paths) with one-line purpose each
3. **Mandatory Reading** - What skill to read first (always `token-optimizer`)
4. **Orchestrator Role** - How this AGENTS.md classifies tasks and routes them; includes Task → Skill Routing Table. **Required for Library Lead and Component Director roles.** Omit for simple leaf-node folders.
5. **Available Skills** - Filtered to folder scope only (no global skills — those inherit)
6. **Auto-invoke Skills** - Which skills trigger in this folder (include a `Notes` column)
7. **Critical Rules** - Folder-specific, non-negotiable patterns (reference parent for shared rules)
8. **Folder-Specific Workflows** - Phased creation or iteration workflows with ordered steps
9. **Troubleshooting & Escalation** - When and where to escalate blocked scenarios
10. **Commands** - Copy-paste commands for this folder

---

## Content Scoping Rules

```
Root AGENTS.md                          Subfolder AGENTS.md
├─ Organization-wide patterns           ├─ Folder-specific patterns
├─ All available skills                 ├─ Only relevant skills
├─ Cross-project conventions            ├─ Skills scoped to this folder
├─ Generic decision trees               ├─ Folder-context trees
└─ All tech stacks                      └─ Tech used in THIS folder
```

**Examples:**

| Root | Component Folder |  services Folder |
|------|------------------|------------------|
| All skills listed | Only `scannlab-best-practices` + `scannlab-storybook` | Only service-related skills |
| Angular + general patterns | Angular component-specific | TypeScript injection + services patterns |
| All commands (dev, test, build) | Component generation, testing, stories | Service unit testing, mocks |

---

## Template Structure

### Folder Purpose Section

```markdown
# {Folder Name} - AI Agent Ruleset

> **IMPORTANT:** This file only adds local rules for `{folder path}/`. All {library/repository}-wide patterns are inherited from parent AGENTS.md files. Do **not** repeat skill tables or global conventions here — reference parent files for full skill lists and cross-project rules.
>
> **Inheritance:** [{Parent} AGENTS.md]({relative path to parent AGENTS.md})
>
> **Scope**: `{folder path}/` — {one-line description of what this folder owns}
> **Tech Stack**: {technologies used in this folder}
> **Primary Skills**: {2-3 key skills}
> **When to escalate to {parent} AGENTS.md**: {scenario}
> **Author**: ScannLab Design System Team
> **Last updated**: {DD.MM.YYYY}
```

### Mandatory Reading

```markdown
## Mandatory Reading

**BEFORE starting ANY task in {folder}**, read this skill:

| Skill | Purpose |
| ----- | ------- |
| [`token-optimizer`](../../skills/token-optimizer/SKILL.md) | Required for all AI/model interactions |
| [`{skill-1}`](../../skills/{skill-1}/SKILL.md) | {purpose for THIS folder} |
```

### Orchestrator Role (Library Lead and Component Director)

Use this section when the AGENTS.md is a **Library Lead** (has child directors) or a **Component Director** (routes to skill chains). Omit for simple leaf-node folders with no routing responsibility.

```markdown
## Orchestrator Role

This AGENTS.md is the **{role: entry point / library-level dispatcher / component director}** for all work inside `{folder}/`. When receiving a task in this folder:

1. **Classify** the task using `token-optimizer`
2. **Route** to the correct skill chain using the table below
3. **Invoke skills in order** — earlier skills are prerequisites for later ones
4. **Never skip steps** — each gate ensures quality before the next phase

### Task → Skill Routing Table

| Task | Skill Chain (in order) |
| ---- | ---------------------- |
| {task description} | `{skill-1}` → `{skill-2}` → `{skill-3}` |
| {task description} | `{skill-1}` → `{skill-2}` |
```

**Library Lead variant** — also include a Domain Map before the routing table:

```markdown
### Domain Map

| Domain | Folder | Child Director |
| ------ | ------ | -------------- |
| {domain} | `{folder/}` | [{folder}/AGENTS.md]({relative path}) |
| {domain} | `{folder/}` | — (route to `{skill}`) |
```

---

### Available Skills (Filtered)

Only list skills that apply to this folder's scope:

```markdown
## Available Skills

### {Category} Skills

| Skill | Description | URL |
| ----- | ----------- | --- |
| `{skill-name}` | {description} | [SKILL.md](../../skills/{skill-name}/SKILL.md) |
```

### Auto-invoke Skills (Filtered)

```markdown
## Auto-invoke Skills

When performing these actions IN THIS FOLDER, invoke the skill FIRST:

| Action | Skill | Notes |
| ------ | ----- | ----- |
| {action in this folder's context} | `{skill}` | {notes} |
```

---

## Decision: Inherit vs Override

```
Should subfolder AGENTS.md include this content?

Pattern same as root?               → Link to root, don't repeat
Pattern same but with folder twist? → Include with [See also](link to root)
Pattern unique to folder?           → Include fully
Tech stack same as root?            → Just mention version in subfolder
Tech stack different?               → Include full stack details
```

**Example:**

```markdown
### Components

For general component patterns, [see root AGENTS.md](../../AGENTS.md#critical-rules).

**In this folder additionally**, enforce:
- All components must export a `.stories.ts`
- CSS Modules required for styling
```

---

## Path Reference Rules

### For links WITHIN the same folder structure:

```markdown
# From: projects/scanntech-ui/src/components/AGENTS.md
# Link to: /root/AGENTS.md
[root AGENTS.md](../../../AGENTS.md)

# Link to: /root/skills/scannlab-best-practices/
[scannlab-best-practices](../../../../skills/scannlab-best-practices/SKILL.md)

# Link to: /root/.github/copilot-instructions.md
[copilot-instructions](../../../.github/copilot-instructions.md)
```

### For links WITHIN subfolder hierarchy:

```markdown
# From: projects/scanntech-ui/src/components/button/AGENTS.md
# Link to: /projects/scanntech-ui/src/components/AGENTS.md
[parent components AGENTS.md](../AGENTS.md)

# Link to: /root/skills/
[skill](../../../../skills/{skill}/SKILL.md)
```

---

## Decision Tree: When to Create

```
Working in folder?
├─ <3 components/files
│  └─ Use root AGENTS.md only
├─ 3-10 components
│  ├─ Same tech as root?
│  │  └─ Maybe create, link to root patterns
│  └─ Different tech?
│     └─ CREATE subfolder AGENTS.md
├─ 10-50 components
│  ├─ Shared patterns within folder?
│  │  └─ CREATE subfolder AGENTS.md
│  └─ No shared patterns?
│     └─ Link to root only
└─ 50+ components
   ├─ Organize into sub-subfolders?
   │  └─ CREATE AGENTS.md at each level
   └─ Keep flat?
      └─ CREATE folder AGENTS.md + sub-specific sections
```

---

## Decision Tree: What Content to Include

```
Feature/Pattern?
├─ Identical to root
│  └─ Link: [See root AGENTS.md](link)
├─ Minor differences
│  └─ Include with [differences] + [See also root](link)
├─ Completely new
│  └─ Include fully
└─ Contradicts root?
   └─ STOP: Escalate, don't override
```

---

## Critical Patterns

### Pattern 1: Orchestrator-Lead-Director Hierarchy

Each AGENTS.md layer plays a distinct role. Subfolders inherit ALL parent patterns unless explicitly overridden.

```
AGENTS.md  [Root Orchestrator]
    — org-wide patterns, full skill registry, chaining workflows
    ↓ (inherits all)
    └─ projects/scanntech-ui/AGENTS.md  [Library Lead]
          — domain map, task routing table, delegates to child directors
          ↓ (inherits from Root Orchestrator)
          └─ projects/scanntech-ui/src/components/AGENTS.md  [Component Director]
                — skill chains per task, quality gates, creation workflow
                ↓ (inherits from Library Lead + Root Orchestrator)
                └─ projects/scanntech-ui/src/components/button/AGENTS.md  [Leaf Director]
                      — component-specific overrides only (only if warranted)
```

**Library Lead must include:**
- `## Orchestrator Role` with a **Domain Map** and **Task → Skill Routing Table**
- Explicit delegation references: `→ [child/AGENTS.md]` for folders with their own director

**Component Director must include:**
- `## Orchestrator Role` with a **Task → Skill Routing Table** only (no Domain Map)
- Ordered skill chains — earlier skills are prerequisites, no step skipping

**Anti-pattern**: Repeating rules that exist in parent AGENTS.md. Reference instead.

### Pattern 2: Scope Declaration

Always declare scope in the header:

```markdown
# Button Component - AI Agent Ruleset

> **Scope**: `projects/scanntech-ui/src/components/button/`
> **Inherits from**: [Parent AGENTS.md](../AGENTS.md)
> **Overrides**: {if any — list what differs}
> **Author**: {Team or author name}
> **Last updated**: {DD.MM.YYYY}
```

### Pattern 3: Folder-Specific Sections

Add sections unique to THIS folder:

```markdown
## Button Component Specifics

### File Conventions
- {naming rules for this component folder}

### Testing Pattern
- {how tests are structure in this folder}

### Storybook Stories
- {story generation for buttons}
```

### Pattern 4: Tech Stack Filtering

Only list tech/versions relevant to THIS folder:

```markdown
## Tech Stack (This Folder)

Angular 16.2 | TypeScript 5.2 | CSS Modules | Vitest 1.0 | Storybook 7.6

> **Note**: See [root AGENTS.md](link) for all project tech stack.
```

---

## Examples

### Example 1: Component Folder AGENTS.md (Component Director)

**Location**: `projects/scanntech-ui/src/components/AGENTS.md`

```markdown
# Components - AI Agent Ruleset

> **IMPORTANT:** This file only adds local rules for `projects/scanntech-ui/src/components/`. All library-wide and repository-wide patterns are inherited from parent AGENTS.md files. Do **not** repeat skill tables or global conventions here — reference parent files for full skill lists and cross-project rules.
>
> **Inheritance:**
> - [Library AGENTS.md](../../AGENTS.md)
> - [Root AGENTS.md](../../../../AGENTS.md)
>
> **Scope**: `projects/scanntech-ui/src/components/` — Individual UI component creation, iteration, and delivery
> **Tech Stack**: Angular 20.3.0+, TypeScript 5.9.2+, CSS Modules, Vitest 3.2.4+, Storybook 9.1.13+
> **Primary Skills**: `scannlab-best-practices`, `scannlab-storybook`, `scannlab-unit-test`
> **When to escalate to library AGENTS.md**: Library-wide patterns, cross-component services, public API structure
> **Author**: ScannLab Design System Team
> **Last updated**: 24.03.2026

## Inherits From

- [Library AGENTS.md](../../AGENTS.md) — Library-wide component rules, naming conventions, file structure, Angular patterns
- [Root AGENTS.md](../../../../AGENTS.md) — Repository-wide patterns, full skill registry, chaining workflows

---

## Mandatory Reading

**BEFORE starting ANY task in this folder**, read these skills in order:

| Skill | Purpose |
| ----- | ------- |
| [`token-optimizer`](../../../../skills/token-optimizer/SKILL.md) | **Required for all AI/model interactions.** Classifies task complexity and optimizes token usage. |
| [`scannlab-best-practices`](../../../../skills/scannlab-best-practices/SKILL.md) | **Required for ANY component code.** Angular 20+ patterns, signals, CSS Modules, accessibility baseline. |

---

## Orchestrator Role

This AGENTS.md is the **entry point and dispatcher** for all work inside `components/`. When receiving a task in this folder:

1. **Classify** the task using `token-optimizer`
2. **Route** to the correct skill chain using the table below
3. **Invoke skills in order** — earlier skills are prerequisites for later ones
4. **Never skip steps** — each gate ensures quality before the next phase

### Task → Skill Routing Table

| Task | Skill Chain (in order) |
| ---- | ---------------------- |
| Create component from Figma | `scannlab-figma-extractor` → `scannlab-token-validation/figma-matcher` → `scannlab-best-practices` → `css-modules` → `scannlab-unit-test` → `scannlab-storybook` → `scannlab-a11y-checker` → `scannlab-token-validation/css-auditor` |
| Implement component (no Figma) | `scannlab-best-practices` → `css-modules` → `scannlab-unit-test` → `scannlab-storybook` → `scannlab-a11y-checker` → `scannlab-token-validation/css-auditor` |
| Modify existing component | `scannlab-best-practices` → `scannlab-unit-test` → `scannlab-token-validation/css-auditor` |
| Write or update Storybook stories | `scannlab-storybook` |
| Write or update unit tests | `scannlab-unit-test` |
| Audit component CSS for hard-coded values | `scannlab-token-validation` → `agents/css-auditor.md` |
| Review component accessibility | `scannlab-a11y-checker` |
| Map component to Figma Code Connect | `scannlab-code-connect` |

---

## Auto-invoke Skills

When performing these actions IN THIS FOLDER, **invoke the skill FIRST before proceeding**:

| Action | Skill | Notes |
| ------ | ----- | ----- |
| Writing or reviewing component `.ts` code | `scannlab-best-practices` | Signals, host bindings, lifecycle, `OnPush` |
| Writing or updating component `.css` | `css-modules` | Scoped CSS, `--s-*` token usage only |
| Creating or updating `.stories.ts` files | `scannlab-storybook` | All variant combinations required |
| Creating or updating `.spec.ts` files | `scannlab-unit-test` | ≥90% line coverage target |
| Auditing component CSS for hard-coded values | `scannlab-token-validation` → `agents/css-auditor.md` | Before finalizing any styles |
| Extracting Figma component specs | `scannlab-figma-extractor` | Always the first step |
| Matching Figma values to design tokens | `scannlab-token-validation` → `agents/figma-matcher.md` | After `scannlab-figma-extractor` |
| Reviewing component accessibility | `scannlab-a11y-checker` | Before marking a component complete |
| Mapping component to Figma Code Connect | `scannlab-code-connect` | After component implementation is finalized |

---

## Critical Rules (Components Only)

For Angular/TypeScript patterns, naming conventions, and CSS specifics, see [Library AGENTS.md](../../AGENTS.md). The rules below are unique to this folder.

### Mandatory File Triad

Every component folder must contain exactly these files before delivery:

```text
component-name/
├── component-name.ts               # Component class
├── component-name.css              # Scoped CSS Modules (no hard-coded values)
├── component-name.spec.ts          # Vitest unit tests (≥90% coverage)
├── component-name.mdx              # Storybook documentation
└── stories/
    └── component-name.stories.ts   # Storybook stories (all variants)
```

Figma-mapped components also include:

```text
└── figma/
    └── component-name.figma.ts     # Code Connect mapping
```

### Quality Gates (Non-Negotiable)

| Gate | Requirement | Skill |
| ---- | ----------- | ----- |
| CSS tokens | No hard-coded colors, spacing, or typography — only `--s-*` tokens | `scannlab-token-validation/css-auditor` |
| Test coverage | ≥90% line coverage per component class | `scannlab-unit-test` |
| Accessibility | WCAG 2.2 AA passing — run before review | `scannlab-a11y-checker` |
| Stories | All primary variant combinations exported | `scannlab-storybook` |
| Public API | Exported in `public-api.ts` before any PR | — |

---

## Commands

```bash
# Generate new component scaffold (from repo root)
npx ng generate component projects/scanntech-ui/src/components/{component-name}

# Run tests for a specific component
npm run test -- src/components/{component-name}

# Check test coverage
npm run test:coverage

# Lint all components
npm run lint

# Run Storybook locally
npm run storybook
```
```

### Example 2: Service Folder AGENTS.md

**Location**: `projects/scanntech-ui/src/services/AGENTS.md`

```markdown
# Services - AI Agent Ruleset

> **Scope**: `projects/scanntech-ui/src/services/`
> **Tech**: TypeScript services, dependency injection, RxJS
> **Primary Skills**: None specific (refer to root)
> **Author**: ScannLab Design System Team
> **Last updated**: 04.03.2026

## Inherits From
- [root AGENTS.md](../../../AGENTS.md)
- [root AGENTS.md](../../../AGENTS.md)

## Critical Rules - Services

- ALWAYS: Use `providedIn: 'root'` (no need for NgModule registration)
- ALWAYS: Return Observable (not Promise)
- NEVER: Store mutable state in service
- MOST: Include unit tests for error scenarios

## Service Pattern

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data');
  }
}
```
```

---

## Checklist

- [ ] Folder has 3+ components/modules.
- [ ] Clear folder purpose identified.
- [ ] Scope section added to header.
- [ ] Inheritance path documented (parent AGENTS.md link).
- [ ] Only relevant skills listed.
- [ ] Tech stack filtered to this folder.
- [ ] Auto-invoke skills listed for folder actions.
- [ ] Critical rules unique to folder included.
- [ ] All root patterns inherited unless explicitly overridden.
- [ ] Path references use correct `../` count.
- [ ] File created at `{folder}/AGENTS.md`.

---

## Commands

```bash
# Create subfolder AGENTS.md at specified path
mkdir -p {folder-path}
touch {folder-path}/AGENTS.md
# Then edit with template from assets/ folder

# View folder hierarchy of AGENTS.md files
find . -name "AGENTS.md" -type f | sort

# Count how many AGENTS.md exist in repo
find . -name "AGENTS.md" -type f | wc -l
```

---

## Template Sync

When this SKILL.md is edited, invoke `agents/templates-sync.md` to reconcile the asset templates. The agent checks:

- Dead skill references (backtick-quoted names whose `skills/` directory no longer exists)
- Old path pattern (`.claude/skills/` → `skills/` with correct relative depth)
- IMPORTANT inheritance notice presence in all example files
- Section structure against the 10-item Content Structure list
- Tech stack versions against `projects/scanntech-ui/AGENTS.md`

Run the structural lint manually at any time:

```bash
node skills/scannlab-agents-subfolder/scripts/templates-lint.js
```

The pre-commit hook (`scripts/pre-commit-hook.sh`) runs this automatically whenever `SKILL.md` is staged.

---

## Files in This Skill

- `assets/AGENTS-template.md` — Blank template for copy-paste
- `assets/AGENTS-component-example.md` — Component Director example
- `assets/AGENTS-service-example.md` — Leaf Director example (no Orchestrator Role)
- `assets/AGENTS-project-example.md` — Library Lead example (Domain Map + routing table)
- `agents/templates-sync.md` — Sub-agent: reconciles asset templates when SKILL.md changes
- `scripts/templates-lint.js` — Structural validator for asset templates
- `scripts/pre-commit-hook.sh` — Pre-commit hook: triggers lint when SKILL.md is staged
