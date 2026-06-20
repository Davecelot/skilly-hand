export const skills = [
  {
    "id": "accessibility-audit",
    "title": "Accessibility Audit",
    "description": "Audit web accessibility against W3C WCAG 2.2 Level AA using framework-agnostic checks, remediation patterns, and portable command-line scanning.",
    "tags": [
      "frontend",
      "accessibility",
      "workflow",
      "quality"
    ],
    "sourcePath": "catalog/skills/accessibility-audit/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-04-04",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Added portable WCAG 2.2 Level AA accessibility auditing skill with W3C-only references and scanner script; enables consistent web accessibility review across frameworks; affects catalog skill coverage and install plans for stacks recommending accessibility-audit",
      "auto-invoke": "Auditing, reviewing, or implementing web accessibility against WCAG 2.2 Level AA",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "WebFetch",
        "WebSearch",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "references",
        "type": "dir",
        "children": [
          {
            "name": "w3c-wcag22-checklist.md",
            "type": "file"
          }
        ]
      },
      {
        "name": "scripts",
        "type": "dir",
        "children": [
          {
            "name": "audit-a11y.sh",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"accessibility-audit\"\ndescription: \"Audit web accessibility against W3C WCAG 2.2 Level AA using framework-agnostic checks, remediation patterns, and portable command-line scanning.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-04-04\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Added portable WCAG 2.2 Level AA accessibility auditing skill with W3C-only references and scanner script; enables consistent web accessibility review across frameworks; affects catalog skill coverage and install plans for stacks recommending accessibility-audit\"\n  auto-invoke: \"Auditing, reviewing, or implementing web accessibility against WCAG 2.2 Level AA\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"WebFetch\"\n    - \"WebSearch\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# Accessibility Audit Guide\n\n## When to Use\n\nUse this skill when:\n\n- Auditing components or pages for WCAG conformance.\n- Reviewing pull requests that change templates, interactive UI, forms, or styles.\n- Defining accessibility acceptance criteria for frontend delivery.\n- Converting automated scanner findings into prioritized remediations.\n\nDo not use this skill for:\n\n- Product-specific visual token compliance.\n- Framework-only code style reviews unrelated to accessibility behavior.\n- Non-web formats that need a dedicated standard beyond WCAG web content checks.\n\n---\n\n## Baseline and Sources\n\nDefault baseline:\n\n- **WCAG 2.2 Level AA**.\n\nW3C status notes (verified from W3C WCAG overview):\n\n- WCAG 2.2 was published on **5 October 2023** and updated on **12 December 2024**.\n- W3C encourages using the latest WCAG version.\n\nUse only W3C sources for decisions and remediation rationale.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Audit in POUR Order\n\nAudit checks in this order to reduce misses:\n\n1. **Perceivable**: text alternatives, structure, contrast.\n2. **Operable**: keyboard, focus, target size, predictable interaction.\n3. **Understandable**: labels, errors, language, clear behavior.\n4. **Robust**: semantic roles/states and assistive-technology compatibility.\n\n### Pattern 2: Prefer Native Semantics First\n\n- Use native controls (`button`, `a`, `input`, `select`, `textarea`) before ARIA-heavy custom widgets.\n- If custom widgets are necessary, define role, keyboard behavior, name, state, and relationship.\n- Never remove focus indicators without a visible replacement.\n\n### Pattern 3: Prioritize by User Impact\n\nFix in this order:\n\n1. Keyboard and focus blockers.\n2. Missing names/labels for controls and media.\n3. Form errors and status announcements.\n4. Contrast and non-text contrast issues.\n\n### Pattern 4: Validate with W3C Tooling\n\nUse W3C validators as baseline technical checks, then complete manual WCAG behavior review:\n\n- Nu HTML Checker\n- CSS Validator\n\n---\n\n## Decision Tree\n\n```text\nIs this an interactive control?                       -> Verify keyboard access + visible focus + accessible name\nIs this non-text content (image/icon/media)?         -> Verify text alternative strategy\nIs this a form input or validation message?          -> Verify labels, instructions, errors, and status messaging\nIs this a custom widget pattern?                     -> Verify role/state/property model and keyboard model\nDoes styling reduce legibility or discernibility?    -> Verify text + non-text contrast and target size\nOtherwise                                            -> Run checklist sweep and document residual risk\n```\n\n---\n\n## Code Examples\n\n### Example 1: Icon Button with Accessible Name and Focus Indicator\n\n```html\n<button type=\"button\" aria-label=\"Close dialog\" class=\"icon-button\">\n  <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 24 24\">\n    <path d=\"M6 6l12 12M18 6L6 18\" />\n  </svg>\n</button>\n```\n\n```css\n.icon-button:focus-visible {\n  outline: 2px solid #005a9c;\n  outline-offset: 2px;\n}\n```\n\n### Example 2: Labeled Input with Error Association\n\n```html\n<label for=\"email\">Email address</label>\n<input\n  id=\"email\"\n  type=\"email\"\n  aria-invalid=\"true\"\n  aria-describedby=\"email-error\"\n/>\n<p id=\"email-error\" role=\"alert\">Enter a valid email address.</p>\n```\n\n### Example 3: Semantic Click Target Instead of Generic Container\n\n```html\n<button type=\"button\" class=\"card-action\">Open details</button>\n```\n\n```html\n<div role=\"button\" tabindex=\"0\" aria-label=\"Open details\"></div>\n```\n\n---\n\n## Commands\n\n```bash\n# Run default scan on current directory\nbash catalog/skills/accessibility-audit/scripts/audit-a11y.sh\n\n# Scan a specific path\nbash catalog/skills/accessibility-audit/scripts/audit-a11y.sh src\n\n# Generate markdown report\nbash catalog/skills/accessibility-audit/scripts/audit-a11y.sh --report src\n\n# Generate JSON output for CI pipelines\nbash catalog/skills/accessibility-audit/scripts/audit-a11y.sh --json src\n```\n\n---\n\n## Resources\n\n- Full checklist: [references/w3c-wcag22-checklist.md](references/w3c-wcag22-checklist.md)\n- WCAG overview (WAI): https://www.w3.org/WAI/standards-guidelines/wcag/\n- WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/\n- How to Meet WCAG 2 (Quick Reference): https://www.w3.org/WAI/WCAG22/quickref/\n- Understanding WCAG 2: https://www.w3.org/WAI/WCAG22/Understanding/\n- W3C standards context: https://www.w3.org/standards/\n- W3C validators and tools: https://www.w3.org/developers/tools/\n- W3C homepage: https://www.w3.org/\n"
  },
  {
    "id": "agents-root-orchestrator",
    "title": "AGENTS Root Orchestrator",
    "description": "Author root AGENTS.md as a Where/What/When orchestrator that routes tasks and skill invocation clearly.",
    "tags": [
      "core",
      "workflow",
      "orchestration"
    ],
    "sourcePath": "catalog/skills/agents-root-orchestrator/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-04-03",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Added root AGENTS orchestration guidance around Where/What/When structure; improves AI task routing clarity and trigger recognition; affects root AGENTS authoring workflow",
      "auto-invoke": "Creating or updating root AGENTS.md orchestration guidance",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "AGENTS-ROOT-TEMPLATE.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"agents-root-orchestrator\"\ndescription: \"Author root AGENTS.md as a Where/What/When orchestrator that routes tasks and skill invocation clearly.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-04-03\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Added root AGENTS orchestration guidance around Where/What/When structure; improves AI task routing clarity and trigger recognition; affects root AGENTS authoring workflow\"\n  auto-invoke: \"Creating or updating root AGENTS.md orchestration guidance\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# AGENTS Root Orchestrator Guide\n\n## When to Use\n\nUse this skill when:\n\n- Creating a new root `AGENTS.md` for a repository.\n- Refactoring root AI instructions that have grown inconsistent.\n- Converting scattered guidance into a single routing guide.\n- Defining explicit trigger-based skill invocation behavior.\n\nDo not use this skill for:\n\n- Subfolder-only guides that inherit from parent AGENTS files.\n- One-off prompt notes with no reusable routing value.\n- Agent-specific mirror files (`CLAUDE.md`, `GEMINI.md`) as primary source.\n\n---\n\n## Core Structure: Where / What / When\n\n### Where (Context and Boundaries)\n\nDefine where the guide applies and where to escalate:\n\n- Repository scope and ownership boundaries.\n- Folder map and key domains.\n- Escalation path when a task exceeds local scope.\n\n### What (Capabilities and Routing)\n\nDefine what AI should use:\n\n- Installed skill registry with concise purpose.\n- Role-oriented routing tables (task -> skill chain).\n- Non-negotiable rules and default conventions.\n\n### When (Triggers and Sequencing)\n\nDefine when skills must be invoked:\n\n- Auto-invoke trigger table by action.\n- Ordered workflow chains for recurring tasks.\n- Prerequisite rules so downstream skills are never invoked first.\n\n### Chaining Notations (Workflow Composition)\n\nDefine integrated multi-skill chains using explicit notation:\n\n- Use `->` to document prerequisite order.\n- Keep each chain named and scoped to one repeated workflow.\n- Add a one-line \"when to use\" note after each chain.\n- Treat earlier steps as mandatory unless explicitly marked optional.\n\n---\n\n## Decision Tree\n\n```text\nIs this the repository-wide instruction entry point?\n  YES -> Create/update root AGENTS.md with Where/What/When\n  NO  -> Use subfolder AGENTS conventions and inherit parent rules\n\nDoes the task require routing across multiple skill types?\n  YES -> Add Task -> Skill chain table in What\n  NO  -> Keep concise capability list and direct triggers\n\nAre trigger conditions currently implicit or ambiguous?\n  YES -> Add explicit action-based trigger rows in When\n  NO  -> Keep existing triggers but normalize wording\n```\n\n---\n\n## Example Outline\n\n### Example 1: Where Section\n\n```markdown\n## Where\n\n- Scope: repository root and all descendant folders unless overridden.\n- Primary map: app code in `src/`, automation in `scripts/`, tests in `tests/`.\n- Escalate to maintainers when task changes CI, security, or release flows.\n```\n\n### Example 2: When Section\n\n```markdown\n## When\n\n| Action | Skill |\n| ------ | ----- |\n| Planning multi-step feature work | `spec-driven-development` |\n| Creating new reusable skill instructions | `forge-me-a-skill` |\n| Updating root AGENTS orchestration map | `agents-root-orchestrator` |\n```\n\n### Example 3: Chaining Notations Section\n\n````markdown\n## Chaining Notations\n\nChaining notations document integrated workflows where multiple skills are sequentially invoked for complex tasks. Always invoke skills in documented order.\n\n### Skill Creation Workflow\n\n```text\nAsking for a new skill\n  -> forge-me-a-skill\n  -> spec-driven-development\n  -> agents-root-orchestrator\n```\n\nWhen to use: creating and registering a new reusable skill workflow.\n````\n\n---\n\n## Commands\n\n```bash\nmkdir -p .skilly-hand/catalog/agents-root-orchestrator/assets\ncp .skilly-hand/catalog/agents-root-orchestrator/assets/AGENTS-ROOT-TEMPLATE.md AGENTS.md\nnpx skilly-hand install --dry-run\n```\n\n---\n\n## Resources\n\n- Template: [assets/AGENTS-ROOT-TEMPLATE.md](assets/AGENTS-ROOT-TEMPLATE.md)\n- Companion skills:\n  - [../forge-me-a-skill/SKILL.md](../forge-me-a-skill/SKILL.md)\n  - [../spec-driven-development/SKILL.md](../spec-driven-development/SKILL.md)\n"
  },
  {
    "id": "angular-guidelines",
    "title": "Angular Guidelines",
    "description": "Guide Angular code generation, review, and performance tuning using latest stable Angular verification, official Angular skill guidance, and modern framework best practices. Trigger: generating, reviewing, refactoring, or optimizing Angular code artifacts in Angular projects.",
    "tags": [
      "angular",
      "frontend",
      "workflow",
      "best-practices"
    ],
    "sourcePath": "catalog/skills/angular-guidelines/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-05-01",
      "license": "Apache-2.0",
      "version": "1.2.0",
      "changelog": "Added curated official Angular skill and performance guidance with a dedicated performance-reviewer mode; improves SSR, hydration, reactivity, testing, and runtime optimization coverage; affects angular-guidelines routing, review checklists, and catalog discovery",
      "auto-invoke": "Generating, reviewing, refactoring, or optimizing Angular code artifacts in Angular projects",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "WebFetch",
        "WebSearch",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "agents",
        "type": "dir",
        "children": [
          {
            "name": "angular-tester.md",
            "type": "file"
          },
          {
            "name": "component-creator.md",
            "type": "file"
          },
          {
            "name": "performance-reviewer.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"angular-guidelines\"\ndescription: \"Guide Angular code generation, review, and performance tuning using latest stable Angular verification, official Angular skill guidance, and modern framework best practices. Trigger: generating, reviewing, refactoring, or optimizing Angular code artifacts in Angular projects.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-05-01\"\n  license: \"Apache-2.0\"\n  version: \"1.2.0\"\n  changelog: \"Added curated official Angular skill and performance guidance with a dedicated performance-reviewer mode; improves SSR, hydration, reactivity, testing, and runtime optimization coverage; affects angular-guidelines routing, review checklists, and catalog discovery\"\n  auto-invoke: \"Generating, reviewing, refactoring, or optimizing Angular code artifacts in Angular projects\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"WebFetch\"\n    - \"WebSearch\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# Angular Guidelines\n\n## When to Use\n\nUse this skill when:\n\n- You are generating Angular components, directives, pipes, services, or supporting files.\n- You are refactoring existing Angular code to current framework patterns.\n- You are reviewing Angular code quality and framework-alignment in an Angular workspace.\n- You are optimizing Angular performance, SSR/hydration, reactivity/data flow, forms, routing, accessibility, or CLI-aligned generation.\n\nDo not use this skill for:\n\n- Non-Angular frontend stacks (React, Vue, Svelte, or framework-agnostic UI tasks).\n- Deep architecture decisions outside code artifact generation/review scope.\n- Pure test-strategy design unrelated to Angular implementation details.\n\n---\n\n## Routing Map\n\nChoose sub-agents by intent:\n\n| Intent | Sub-agent |\n| --- | --- |\n| Create, refactor, or review Angular components | [agents/component-creator.md](agents/component-creator.md) |\n| Write or review Angular tests | [agents/angular-tester.md](agents/angular-tester.md) |\n| Optimize or review Angular performance, SSR, or hydration | [agents/performance-reviewer.md](agents/performance-reviewer.md) |\n\n---\n\n## Standard Execution Sequence\n\n1. Run latest stable Angular preflight checks.\n2. Route to the smallest matching sub-agent by task intent.\n3. If the request mentions performance, SSR, hydration, routing, data fetching, bundle size, change detection, or zoneless behavior, include the performance priority checklist.\n4. Apply the sub-agent checklist before finalizing generated code or review output.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Latest Stable Angular Preflight (Mandatory)\n\nBefore generating or changing Angular code:\n\n1. Check the latest stable Angular core release:\n   `npm view @angular/core version`\n2. Check the project's installed or declared Angular version:\n   `npm ls @angular/core` or inspect `package.json`.\n3. If versions diverge, generate content for the latest stable APIs and call out upgrade steps.\n4. If npm metadata is unavailable, verify against official Angular release sources before proceeding.\n\nNever hardcode a specific Angular major as the default baseline.\n\n### Pattern 2: Modern Angular Defaults for New Code\n\nUse these defaults unless project constraints explicitly prevent them:\n\n| Area | Default |\n| --- | --- |\n| Component model | Standalone-first (`standalone: true`) |\n| State + bindings | Signals (`signal`, `computed`, `input`, `output`) |\n| Template flow | `@if`, `@for`, `@switch` control flow blocks |\n| Dependency injection | `inject()` over constructor injection for new code |\n| Forms | Typed reactive forms |\n| Rendering strategy | OnPush-friendly patterns and deferred/lazy rendering where appropriate |\n\n### Pattern 3: Modern Reactivity Guardrails\n\n- Use `computed` for derived state rather than duplicating or propagating state manually.\n- Avoid `effect` for state propagation; reserve it for logging, browser storage sync, non-template DOM work, canvas/chart integrations, or other non-reactive APIs.\n- Use `resource` for async signal-based data when the project Angular version supports it and it fits existing data patterns.\n- Use `linkedSignal` for dependent writable state when the project Angular version supports it.\n- Read signals before `await` inside reactive contexts so dependencies are tracked synchronously.\n\n### Pattern 4: Performance Review Priority\n\nUse this official-Angular-aligned priority order for performance review. Measure first when possible, then choose the smallest applicable optimization.\n\n| Priority | Review Focus | Default Action |\n| --- | --- | --- |\n| 1 | Measurement | Use Angular DevTools or Chrome DevTools Angular profiling to identify specific load, change detection, or rendering bottlenecks. |\n| 2 | Loading performance | Prefer lazy routes, `@defer` for non-critical/heavy UI, image optimization, and SSR/hydration where they improve Core Web Vitals. |\n| 3 | Runtime performance | Check zoneless change detection support, slow template/lifecycle computations, OnPush-friendly state, and zone pollution from timers or third-party code. |\n| 4 | SSR/hydration correctness | Avoid server/client template divergence, prefer platform-specific providers, keep per-request state out of shared providers, and use factory providers for request-specific values. |\n| 5 | Advanced loading | Use incremental hydration and advanced deferrable-view strategies only when the project version and UX constraints justify them. |\n\n### Pattern 5: Generation and Review Guardrails\n\n- Keep generated files focused and minimal for the requested artifact.\n- Prefer framework-native patterns over custom abstractions unless required by repo conventions.\n- Call out deprecated patterns in reviewed code and suggest modern Angular replacements.\n- For component-specific work, apply [agents/component-creator.md](agents/component-creator.md).\n- For testing-specific work, apply [agents/angular-tester.md](agents/angular-tester.md).\n- For performance-specific work, apply [agents/performance-reviewer.md](agents/performance-reviewer.md).\n\n---\n\n## Decision Tree\n\n```text\nIs this an Angular project (angular.json or @angular/core present)?\n  NO  -> Do not apply this skill\n  YES -> Continue\n\nIs this a create/generate task?\n  YES -> Run latest stable preflight, then generate with modern defaults\n  NO  -> Continue\n\nIs this a refactor task?\n  YES -> Preserve behavior, migrate incrementally to modern Angular patterns\n  NO  -> Continue\n\nIs this a review task?\n  YES -> Validate latest-stable alignment + best-practice/performance checklist\n  NO  -> Apply the minimal Angular guidance needed for the request\n\nDoes the task mention performance, SSR, hydration, routing, data fetching, bundles, change detection, or zoneless behavior?\n  YES -> Route through performance-reviewer before finalizing\n  NO  -> Keep the existing component/test route\n```\n\n---\n\n## Code Examples\n\n### Example 1: Standalone + Signals Component\n\n```typescript\nimport { ChangeDetectionStrategy, Component, computed, input, output } from \"@angular/core\";\n\n@Component({\n  selector: \"app-badge\",\n  standalone: true,\n  template: `\n    <span [attr.data-tone]=\"tone()\">{{ label() }}</span>\n    @if (showCount()) {\n      <small>{{ count() }}</small>\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush\n})\nexport class BadgeComponent {\n  readonly label = input.required<string>();\n  readonly count = input(0);\n  readonly increment = output<void>();\n  readonly showCount = computed(() => this.count() > 0);\n}\n```\n\n### Example 2: Service with `inject()`\n\n```typescript\nimport { Injectable, inject } from \"@angular/core\";\nimport { HttpClient } from \"@angular/common/http\";\n\n@Injectable({ providedIn: \"root\" })\nexport class ProfileService {\n  private readonly http = inject(HttpClient);\n\n  getProfile() {\n    return this.http.get(\"/api/profile\");\n  }\n}\n```\n\n---\n\n## Review Checklist\n\n- Latest stable Angular preflight was completed before code generation/refactor.\n- New artifacts use standalone-first + signal-first patterns where applicable.\n- Template control flow uses modern block syntax.\n- DI and forms follow modern typed Angular practices.\n- Output avoids deprecated Angular APIs unless needed for compatibility.\n- Performance work follows measurement-first guidance and avoids speculative optimization.\n\n---\n\n## Commands\n\n```bash\n# Latest stable Angular version\nnpm view @angular/core version\n\n# Workspace Angular version\nnpm ls @angular/core\n\n# Create a standalone component\nng generate component <name> --standalone\n\n# Apply Angular framework updates in a workspace\nng update @angular/core @angular/cli\n```\n\n---\n\n## Resources\n\n- Angular docs: https://angular.dev\n- Angular API reference: https://angular.dev/api\n- Angular update guide: https://angular.dev/update-guide\n- Angular blog (official releases): https://blog.angular.dev\n- Angular GitHub releases: https://github.com/angular/angular/releases\n- Angular Agent Skills: https://angular.dev/ai/agent-skills\n- Official Angular skills repo: https://github.com/angular/skills\n- Angular style guide: https://angular.dev/style-guide\n- Angular performance guide: https://angular.dev/best-practices/performance\n- Angular signals guide: https://angular.dev/guide/signals\n- Angular testing guide: https://angular.dev/guide/testing\n- Angular HTTP testing guide: https://angular.dev/guide/http/testing\n"
  },
  {
    "id": "context-handoff",
    "title": "Context Handoff",
    "description": "Capture compact, neutral, AI-ready Markdown handoffs that preserve session context across chats without becoming a full transcript or personal memory store. Trigger: summarizing, compacting, preserving, or handing off session context across chats.",
    "tags": [
      "core",
      "workflow",
      "memory",
      "communication"
    ],
    "sourcePath": "catalog/skills/context-handoff/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-05-23",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Added context-handoff skill for project-local session continuity; preserves compact verified context across chats without transcript bloat; affects catalog skill routing and handoff-writing workflows",
      "auto-invoke": "Summarizing, compacting, preserving, or handing off session context across chats",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "Task"
      ]
    },
    "files": [
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "handoff-template.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"context-handoff\"\ndescription: \"Capture compact, neutral, AI-ready Markdown handoffs that preserve session context across chats without becoming a full transcript or personal memory store. Trigger: summarizing, compacting, preserving, or handing off session context across chats.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-05-23\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Added context-handoff skill for project-local session continuity; preserves compact verified context across chats without transcript bloat; affects catalog skill routing and handoff-writing workflows\"\n  auto-invoke: \"Summarizing, compacting, preserving, or handing off session context across chats\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"Task\"\n---\n# Context Handoff Guide\n\n## When to Use\n\nUse this skill when:\n\n- A user asks to summarize, compact, preserve, or hand off session context.\n- Work may continue in a later chat, agent session, branch, or review.\n- Important decisions, current state, artifacts, unresolved questions, or next actions would otherwise be lost.\n- A project needs a concise `.context/` Markdown handoff that is readable by humans and useful to future AI agents.\n\nDo not use this skill for:\n\n- Full transcript archiving by default.\n- Personal journaling, private memory claims, or speculative profile building.\n- Critiquing the session, evaluating the user, or adding opinions not requested.\n- Replacing formal specs, issue trackers, changelogs, ADRs, or release notes when those are the better source of truth.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Store Project-Local Context\n\nWrite handoff files under `.context/` in the active project root.\n\nUse this filename format:\n\n```text\n.context/YYYY-MM-DDTHHMMSSZ-context-handoff-<slug>.md\n```\n\nThe folder is for project-local context handoffs. It is not personal memory, hidden long-term recall, or a place to dump raw chat history.\n\n### Pattern 2: Capture Verified Context Only\n\nWrite as a professional transcriber and technical handoff writer:\n\n- Preserve facts from the session, repository, commands, files, decisions, and user-provided constraints.\n- Mark uncertainty explicitly as `Unknown`, `Unresolved`, or `Assumption`.\n- Do not invent motivations, conclusions, files, tests, or status.\n- Do not critique the user, the plan, or the implementation unless the user explicitly requested critique and it belongs in the handoff.\n\n### Pattern 3: Prefer Compact Handoff Over Transcript\n\nDefault to a concise, structured handoff that a future agent can scan quickly.\n\nInclude:\n\n- Purpose and current state.\n- Key context and constraints.\n- Decisions made.\n- Artifacts touched or produced.\n- Open questions and blockers.\n- Next actions.\n- Verification status.\n- A resume prompt.\n\nExclude:\n\n- Routine back-and-forth.\n- Long command logs unless the exact output is essential.\n- Sensitive data, secrets, credentials, tokens, or private personal details.\n- Repeated explanations already captured in a durable project artifact.\n\n### Pattern 4: Screen Before Writing\n\nBefore creating or updating a `.context/` file:\n\n1. Check whether the handoff may include secrets, credentials, tokens, private personal data, or proprietary data the user did not ask to persist.\n2. Redact sensitive values and describe them generically.\n3. If the user explicitly asks to persist sensitive content, confirm before writing it.\n4. Keep the handoff scoped to what future work needs.\n\n---\n\n## Decision Tree\n\n```text\nUser asks to preserve or resume session context?       -> Create `.context/` handoff\nUser asks for exact transcript or quotes?              -> Ask whether full transcript is required\nFormal requirement/spec/change log is needed?          -> Route to the appropriate durable artifact\nSensitive content would be persisted?                  -> Redact or confirm before writing\nContext is uncertain or inferred?                      -> Label as Unknown, Unresolved, or Assumption\nOtherwise                                             -> Write compact neutral handoff\n```\n\n---\n\n## Examples\n\n### Example 1: Handoff Request\n\n```text\nRequest: \"Summarize this session so we can continue tomorrow.\"\nAction: Create `.context/2026-05-23T184512Z-context-handoff-auth-refactor.md` with current state, decisions, artifacts, open questions, next actions, verification, and resume prompt.\n```\n\n### Example 2: Privacy-Safe Capture\n\n```text\nRequest: \"Save the deployment notes, including the token I pasted.\"\nAction: Redact the token, record that a deployment token was provided in-session, and confirm before persisting any exact secret value.\n```\n\n### Example 3: Not a Critique\n\n```text\nRequest: \"Make a handoff from this planning session.\"\nAction: Record agreed scope, assumptions, unresolved decisions, and next steps. Do not rate the plan or add unsolicited objections.\n```\n\n---\n\n## Commands\n\n```bash\nmkdir -p .context\ndate -u +\"%Y-%m-%dT%H%M%SZ\"\nrg -n \"TODO|FIXME|Assumption|Unresolved\" .context\n```\n\n---\n\n## Resources\n\n- Handoff template: [assets/handoff-template.md](assets/handoff-template.md)\n- Related compact output skill: [../output-optimizer/SKILL.md](../output-optimizer/SKILL.md)\n- Related planning workflow: [../spec-driven-development/SKILL.md](../spec-driven-development/SKILL.md)\n"
  },
  {
    "id": "figma-mcp-0to1",
    "title": "Figma MCP 0-to-1 Guide",
    "description": "Guide users from Figma MCP installation and authentication through first canvas creation, with function-level tool coverage and operational recovery patterns.",
    "tags": [
      "figma",
      "mcp",
      "workflow",
      "design"
    ],
    "sourcePath": "catalog/skills/figma-mcp-0to1/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-06-20",
      "license": "Apache-2.0",
      "version": "1.1.0",
      "changelog": "Synced the official Figma MCP surface for asset transfer, Code Connect context, library discovery, Figma Slides, current Figma-provided skills, and per-minute limits; affects tool routing, canvas workflows, prompts, troubleshooting, and the official matrix",
      "auto-invoke": "Installing, configuring, or using Figma MCP from setup through first canvas creation",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "WebFetch",
        "WebSearch",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "agents",
        "type": "dir",
        "children": [
          {
            "name": "canvas-creation-playbook.md",
            "type": "file"
          },
          {
            "name": "install-auth.md",
            "type": "file"
          },
          {
            "name": "tool-function-catalog.md",
            "type": "file"
          },
          {
            "name": "troubleshooting-ops.md",
            "type": "file"
          }
        ]
      },
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "client-config-snippets.md",
            "type": "file"
          },
          {
            "name": "prompt-recipes.md",
            "type": "file"
          }
        ]
      },
      {
        "name": "references",
        "type": "dir",
        "children": [
          {
            "name": "official-tools-matrix.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"figma-mcp-0to1\"\ndescription: \"Guide users from Figma MCP installation and authentication through first canvas creation, with function-level tool coverage and operational recovery patterns.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-06-20\"\n  license: \"Apache-2.0\"\n  version: \"1.1.0\"\n  changelog: \"Synced the official Figma MCP surface for asset transfer, Code Connect context, library discovery, Figma Slides, current Figma-provided skills, and per-minute limits; affects tool routing, canvas workflows, prompts, troubleshooting, and the official matrix\"\n  auto-invoke: \"Installing, configuring, or using Figma MCP from setup through first canvas creation\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"WebFetch\"\n    - \"WebSearch\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# Figma MCP 0-to-1 Guide\n\n## When to Use\n\nUse this skill when:\n\n- You need to set up Figma MCP from scratch.\n- You need a reliable path from connection to first successful canvas output.\n- You need to choose the right Figma MCP function for a task.\n- You need operational recovery for permission, auth, tool-loading, or rate-limit failures.\n- You need to understand which skilly-hand agents overlap with Figma-supported MCP clients.\n\nDo not use this skill for:\n\n- Generic frontend implementation that does not require Figma MCP.\n- One-off code-only tasks with no design context.\n- Legacy repository-specific Figma pipelines that already define their own strict workflow.\n\n---\n\n## Routing Map\n\nChoose subskills by intent:\n\n| Intent | Subskill |\n| --- | --- |\n| Install and authenticate MCP connection | [agents/install-auth.md](agents/install-auth.md) |\n| Select exact function/tool and expected inputs | [agents/tool-function-catalog.md](agents/tool-function-catalog.md) |\n| Create first canvas output safely | [agents/canvas-creation-playbook.md](agents/canvas-creation-playbook.md) |\n| Recover from errors, limits, or drift | [agents/troubleshooting-ops.md](agents/troubleshooting-ops.md) |\n\n---\n\n## Standard Execution Sequence\n\n1. Set up server transport and authentication.\n2. Verify connectivity with a low-risk call (`whoami` on remote, or a read tool).\n3. Select the smallest tool that solves the immediate task.\n4. For writes, inspect existing file/design-system context before creating new content.\n5. Run creation in short, validated steps (avoid large one-shot requests).\n6. If anything fails, use troubleshooting flow before retrying.\n\n---\n\n## Core Rules\n\n- Prefer remote server for broadest feature coverage, write workflows, code-to-canvas, and FigJam agent workflows.\n- Treat official Figma MCP docs as the source of truth for official tools, supported clients, permissions, and limits.\n- Keep client-specific helpers separate from official Figma MCP tools.\n- Treat write actions as staged operations, not a single large operation.\n- Use link-based node targeting for reliable design-context extraction.\n- Keep a clear distinction between read context tools and write/canvas tools.\n- For repeated team workflows, reuse prompts and config snippets from `assets/`, and prefer Figma-provided skills when they exist.\n- Pair `use_figma` with the editor-specific skill: `figma-use` for Design, `figma-use-figjam` for FigJam, or `figma-use-slides` for Slides.\n- Use `download_assets` and `upload_assets` when the task requires asset delivery, non-PNG exports, original images, or cross-file image transfer.\n\n---\n\n## Agent Coverage\n\nFigma MCP support and skilly-hand installation support are related but not identical:\n\n| Coverage | Agents or Clients | Guidance |\n| --- | --- | --- |\n| Figma-documented and skilly-hand-supported | `codex`, `claude`, `cursor`, `copilot` | Use concrete setup paths where published; Copilot support is currently documented for Copilot CLI write-to-canvas. |\n| Figma-documented but not skilly-hand-native | VS Code, Xcode, Claude Desktop, Warp, Augment, Factory, Firebender | Mention only for the workflows where Figma lists them; do not add skilly-hand install assumptions. |\n| skilly-hand-supported but not source-backed in current Figma docs | `gemini`, `antigravity`, `windsurf`, `trae` | Keep broad `agentSupport`; require verification in the Figma MCP Catalog or client documentation before setup. |\n\n## Figma-Provided Skills\n\nPrefer Figma-provided skills for workflows they cover:\n\n| Skill | Use |\n| --- | --- |\n| `figma-use` | Foundational Figma Design write-to-canvas workflow for frames, components, variables, styles, and auto layout. |\n| `figma-use-figjam` | Foundational FigJam write workflow for boards, stickies, sections, connectors, shapes, tables, and code blocks. |\n| `figma-use-slides` | Foundational Slides write workflow for decks, sections, themes, and speaker notes. |\n| `figma-swiftui` | Translate between Figma designs and SwiftUI in both directions. |\n| `figma-code-connect` | Map published Figma components to code implementations. |\n| `figma-create-new-file` | Create blank Design, FigJam, or Slides files before writing. |\n| `figma-generate-diagram` | Create editable FigJam diagrams from descriptions or source material. |\n| `figma-generate-library` | Example workflow for creating or syncing a Figma design-system library from code. |\n| `figma-generate-design` | Example workflow for building screens/views in Figma from code or a design-system-aware brief. |\n\n---\n\n## Key References\n\n- Full function matrix: [references/official-tools-matrix.md](references/official-tools-matrix.md)\n- Client setup snippets: [assets/client-config-snippets.md](assets/client-config-snippets.md)\n- Prompt starters: [assets/prompt-recipes.md](assets/prompt-recipes.md)\n\n---\n\n## Commands\n\n```bash\n# Codex CLI (manual remote setup)\ncodex mcp add figma --url https://mcp.figma.com/mcp\n\n# Claude Code plugin setup\nclaude plugin install figma@claude-plugins-official\n\n# Claude Code manual remote setup\nclaude mcp add --transport http figma https://mcp.figma.com/mcp\n\n# Claude Code manual remote setup, user scope\nclaude mcp add --scope user --transport http figma https://mcp.figma.com/mcp\n\n# Claude Code manual desktop setup\nclaude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp\n\n# Cursor plugin setup\n/add-plugin figma\n\n# Verify catalog integrity in this repository\nnpm run catalog:check\n```\n"
  },
  {
    "id": "forge-me-a-skill",
    "title": "Forge Me A Skill",
    "description": "Create and standardize AI skills with reusable structure, metadata rules, and templates.",
    "tags": [
      "core",
      "workflow",
      "authoring"
    ],
    "sourcePath": "catalog/skills/forge-me-a-skill/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-03-27",
      "license": "Apache-2.0",
      "version": "1.2.3",
      "changelog": "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section",
      "auto-invoke": "Creating a new skill",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "WebFetch",
        "WebSearch",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "SKILL-TEMPLATE.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"forge-me-a-skill\"\ndescription: \"Create and standardize AI skills with reusable structure, metadata rules, and templates.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-03-27\"\n  license: \"Apache-2.0\"\n  version: \"1.2.3\"\n  changelog: \"Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section\"\n  auto-invoke: \"Creating a new skill\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"WebFetch\"\n    - \"WebSearch\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# Forge Me A Skill Guide\n\n## When to Create a Skill\n\nCreate a skill when:\n\n- A pattern is used repeatedly and AI needs guidance.\n- Project-specific conventions differ from generic best practices.\n- Complex workflows need step-by-step instructions.\n- Decision trees help AI choose the right approach.\n\nDo not create a skill when:\n\n- Documentation already exists and a reference is enough.\n- The pattern is trivial or self-explanatory.\n- It is a one-off task.\n\n---\n\n## Skill Structure\n\n```text\nskills/{skill-name}/\n├── SKILL.md              # Required - main skill file\n├── assets/               # Optional - templates, schemas, examples\n│   ├── template.py\n│   └── schema.json\n├── agents/               # Optional - sub-agents for complex skills\n│   ├── agent1/\n│   │   └── SKILL.md\n│   └── agent2/\n│       └── SKILL.md\n├── scripts/              # Optional - executable helpers for repeatable tasks\n│   └── helper.sh\n└── references/           # Optional - links to local docs\n    └── docs.md\n```\n\n---\n\n## Naming Conventions\n\n| Type | Pattern | Examples |\n|------|---------|----------|\n| Generic skill | `{technology}` | `pytest`, `playwright`, `typescript` |\n| `{product-name}`-specific | `{product-name}-{purpose}` | `{product-name}-best-practices`, `{product-name}-code-connect`, `{product-name}-a11y-checker` |\n| `{product-name}` testing | `{product-name}-{function}-{target}` | `{product-name}-unit-test`, `{product-name}-token-audit` |\n| Workflow skill | `{action}-{target}` | `forge-me-a-skill`, `commit-writer`, `pr-writer` |\n\n---\n\n## Decision: assets/ vs scripts/ vs references/ vs agents/\n\n```text\nNeed code templates?        -> assets/\nNeed JSON schemas?          -> assets/\nNeed example configs?       -> assets/\nNeed executable helpers?    -> scripts/\nLink to existing docs?      -> references/\nLink to external guides?    -> references/ (with local path)\nSkill needs sub-agents?     -> agents/\n```\n\nKey Rule: `references/` should point to local files, not web URLs.\n\n---\n\n## Decision: `{product-name}`-Specific vs Generic\n\n```text\nPatterns apply to any project?             -> Generic skill (e.g., pytest, typescript)\nPatterns are {product-name}-specific?      -> {product-name}-{name} skill\nGeneric skill needs {product-name} info?   -> Add references/ pointing to {product-name} docs\n```\n\n---\n\n## Manifest Metadata Fields\n\n| Field | Required | Format | Description |\n|-------|----------|--------|-------------|\n| `id` | Yes | `lowercase-hyphens` | Skill identifier |\n| `description` | Yes | String | What skill does plus explicit `Trigger: ...` clause for AI recognition |\n| `skillMetadata.author` | Yes | String | Always `skilly-hand` |\n| `skillMetadata.last-edit` | Yes | ISO 8601 date | Format: `YYYY-MM-DD` (e.g., `2026-03-21`) |\n| `skillMetadata.license` | Yes | String | Always `Apache-2.0` for `skilly-hand` |\n| `skillMetadata.version` | Yes | Semantic version | Format: `\"X.Y.Z\"` as string |\n| `skillMetadata.changelog` | Yes | Structured text | Format: `\"<what changed>; <why it matters>; <where it affects>\"` |\n| `skillMetadata.auto-invoke` | Yes | String | Explicit trigger condition (e.g., `\"When auditing, reviewing, or validating an existing skill\"`) |\n| `skillMetadata.allowed-tools` | Yes | String list | All tools this skill can invoke (e.g., `Read`, `Edit`, `Write`, `SubAgent`) |\n| `skillMetadata.allowed-modes` | Optional | String list | Use only when skill has an `agents/` folder |\n\n### SKILL.md Frontmatter Mirroring\n\nTop-level `SKILL.md` files now include managed YAML frontmatter mirrored from `manifest.json`.\n\nRules:\n\n- `manifest.json` is the single source of truth.\n- Mirror only `name` (from `manifest.id`), `description`, and `skillMetadata.{author,last-edit,license,version,changelog,auto-invoke,allowed-tools}`.\n- Do not manually edit mirrored frontmatter in `SKILL.md`; run sync automation instead.\n- Keep instruction body content in `SKILL.md` focused on workflow guidance.\n\n---\n\n## Metadata Standards\n\n### Changelog Format Structure\n\nUse this structure:\n\n```text\n\"<what changed>; <why it matters>; <where it affects>\"\n```\n\nExample:\n\n```text\n\"Added integrated metadata validation guidance; improves consistency and reviewability; affects skill quality checks and maintenance workflows\"\n```\n\nGuidelines:\n\n- What changed: Be specific about the modification.\n- Why it matters: Explain business or technical value.\n- Where it affects: Document impact area.\n\n### last-edit Format\n\nAlways use ISO 8601 date format: `YYYY-MM-DD` (e.g., `2026-03-21`).\n\n### allowed-modes Field Rule\n\nInclude `allowed-modes` only when your skill has an `agents/` subfolder with sub-agents.\n\nInclude it when:\n\n- The skill orchestrates multiple specialized sub-agents.\n- Each sub-agent has its own `SKILL.md` under `skills/{skill-name}/agents/{subagent-name}/`.\n- Different modes delegate to different sub-agents.\n\nOmit it when:\n\n- The skill has no `agents/` folder.\n- The skill behaves the same regardless of mode.\n\n---\n\n## Content Guidelines\n\nDo:\n\n- Start with the most critical patterns.\n- Use tables for decision trees.\n- Keep code examples minimal and focused.\n- Include a Commands section with copy-paste commands.\n- Use ISO 8601 format for all dates (`YYYY-MM-DD`).\n- Include explicit `Trigger:` clause in description for AI recognition.\n- Add `allowed-modes` only if the skill has `agents/` with sub-agents.\n\nDo not:\n\n- Add a Keywords section (agent searches manifest metadata, not body).\n- Duplicate content from existing docs (reference instead).\n- Include lengthy explanations when a concise rule is enough.\n- Add troubleshooting sections when they are not essential.\n- Use web URLs in references.\n- Leave `changelog` empty or informal.\n- Use non-ISO date formats.\n- Manually drift `SKILL.md` frontmatter away from `manifest.json`.\n\n---\n\n## Checklist Before Creating\n\n- [ ] Skill does not already exist.\n- [ ] Pattern is reusable (not one-off).\n- [ ] Name follows conventions.\n- [ ] `manifest.json` includes all required metadata fields.\n- [ ] `description` includes explicit `Trigger: ...` clause.\n- [ ] `last-edit` uses ISO format (`YYYY-MM-DD`).\n- [ ] `changelog` uses structured format: `what; why; where`.\n- [ ] `allowed-modes` is present only when `agents/` exists.\n- [ ] `allowed-tools` matches actual tool usage.\n- [ ] `SKILL.md` frontmatter is synced from `manifest.json`.\n- [ ] Critical patterns are clear and concise.\n- [ ] Code examples are minimal and focused.\n- [ ] Commands section exists with copy-paste commands.\n\n## Resources\n\n- Template: [assets/SKILL-TEMPLATE.md](assets/SKILL-TEMPLATE.md)\n"
  },
  {
    "id": "frontend-design",
    "title": "Frontend Design",
    "description": "Project-aware frontend design skill that detects the existing tech stack, UI libraries, CSS variables, and design tokens before proposing any UI work. Supports greenfield projects via DESIGN.md context setup, taste-reference extraction, post-generation critique, visual refinement, and Motion/GSAP-aware motion polish.",
    "tags": [
      "frontend",
      "design",
      "workflow",
      "ui",
      "motion",
      "greenfield"
    ],
    "sourcePath": "catalog/skills/frontend-design/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-05-09",
      "license": "Apache-2.0",
      "version": "1.5.0",
      "changelog": "Added taste-reference extraction guidance sourced from Refero Styles and Impeccable; improves how agents translate visual references, anti-references, and register into DESIGN.md-ready language; affects greenfield design setup, critique, refinement, and resource routing",
      "auto-invoke": "Designing or generating UI components, pages, or layouts in a web or mobile project; setting up visual direction for a greenfield project; critiquing generated UI for AI slop; adding motion or micro-interactions to existing UI; refining or polishing generated UI output",
      "allowed-tools": [
        "Read",
        "Grep",
        "Glob",
        "Bash",
        "Edit",
        "Write",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "agents",
        "type": "dir",
        "children": [
          {
            "name": "component-designer.md",
            "type": "file"
          },
          {
            "name": "critique.md",
            "type": "file"
          },
          {
            "name": "design-context-setter.md",
            "type": "file"
          },
          {
            "name": "motion-designer.md",
            "type": "file"
          },
          {
            "name": "stack-detector.md",
            "type": "file"
          },
          {
            "name": "visual-refiner.md",
            "type": "file"
          }
        ]
      },
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "aesthetic-archetypes.md",
            "type": "file"
          },
          {
            "name": "stack-scan-checklist.md",
            "type": "file"
          },
          {
            "name": "taste-reference-extraction.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"frontend-design\"\ndescription: \"Project-aware frontend design skill that detects the existing tech stack, UI libraries, CSS variables, and design tokens before proposing any UI work. Supports greenfield projects via DESIGN.md context setup, taste-reference extraction, post-generation critique, visual refinement, and Motion/GSAP-aware motion polish.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-05-09\"\n  license: \"Apache-2.0\"\n  version: \"1.5.0\"\n  changelog: \"Added taste-reference extraction guidance sourced from Refero Styles and Impeccable; improves how agents translate visual references, anti-references, and register into DESIGN.md-ready language; affects greenfield design setup, critique, refinement, and resource routing\"\n  auto-invoke: \"Designing or generating UI components, pages, or layouts in a web or mobile project; setting up visual direction for a greenfield project; critiquing generated UI for AI slop; adding motion or micro-interactions to existing UI; refining or polishing generated UI output\"\n  allowed-tools:\n    - \"Read\"\n    - \"Grep\"\n    - \"Glob\"\n    - \"Bash\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# Frontend Design Guide\n\n## When to Use\n\nUse this skill when:\n\n- You are designing, building, or restyling a UI component, page, or layout in an existing project.\n- You are adding new visual elements that must match the project's existing design language.\n- You are refactoring styling or structure of frontend code to align with established patterns.\n- You need to choose between UI components, tokens, or styles already available in the project.\n- You are starting a greenfield project and need to establish a design direction before building.\n\nDo not use this skill for:\n\n- Backend, API, or data-layer tasks with no UI surface.\n- Design tool work (Figma, Sketch) unrelated to code implementation.\n- Projects where the user has explicitly opted out of stack detection.\n\n---\n\n## Routing Map\n\nAlways run stack detection first. Never skip to design.\n\n| Step | Intent | Sub-agent |\n| --- | --- | --- |\n| 0 (always first) | Detect framework, UI library, CSS approach, tokens, and existing patterns | [agents/stack-detector.md](agents/stack-detector.md) |\n| 0b (if no DESIGN.md and no existing components) | Gather design intent and create DESIGN.md | [agents/design-context-setter.md](agents/design-context-setter.md) |\n| 1 (only after confirmation) | Design and implement components using confirmed stack | [agents/component-designer.md](agents/component-designer.md) |\n| 2 (mandatory after generation) | Challenge the output for AI slop, weak hierarchy, heuristic failures, and unclear product fit | [agents/critique.md](agents/critique.md) |\n| 3 (after critique) | Apply visual quality refinements routed by critique | [agents/visual-refiner.md](agents/visual-refiner.md) |\n| 4 (optional) | Add motion and micro-interactions, routing Motion-native and GSAP-native work to the matching official-source skill | [agents/motion-designer.md](agents/motion-designer.md) |\n\n---\n\n## Standard Execution Sequence\n\n1. **Run stack detection** — always start with `stack-detector`, no exceptions.\n2. **Check for DESIGN.md** — if it exists, read it before any design work. If it does not exist and the project has no existing components to sample, run `design-context-setter` to create it.\n3. **Present findings to the user** — surface the detected stack and any DESIGN.md context clearly, then ask for explicit confirmation.\n4. **If anything is unclear or ambiguous, ask** — do not proceed with partial or uncertain information.\n5. **Extract taste from references** — when the user provides visual references or asks for stronger taste, use [assets/taste-reference-extraction.md](assets/taste-reference-extraction.md) to translate examples into concrete design language, anti-references, and register.\n6. **Scan existing tokens and components** — read what already exists before proposing anything.\n7. **Design with confirmed context only** — hand off to `component-designer` only after steps 2–5 are complete.\n8. **Critique after generation** — invoke `critique` for a frontend-only challenge pass before polish.\n9. **Refine from critique** — invoke `visual-refiner` for visual fixes routed by critique.\n10. **Optionally add motion** — invoke `motion-designer` if critique, refinement, or the user identifies a motion need. Route Motion-native JavaScript/React animation through `motion-animation`; route GSAP timelines, ScrollTrigger, and plugin decisions through `gsap-animation`.\n\n---\n\n## DESIGN.md — Persistent Design Brief\n\n`DESIGN.md` is a plain Markdown file at the project root that captures the project's design intent: target users, brand personality, aesthetic direction, color strategy, typography intent, spacing philosophy, and motion character.\n\nIt is created by `design-context-setter` on greenfield projects and can be updated at any time by the user.\n\n**Every agent in this skill reads `DESIGN.md` if it exists before making aesthetic decisions.** This prevents design drift between sessions.\n\n```bash\n# Check if DESIGN.md exists before starting work\ncat DESIGN.md 2>/dev/null\n```\n\nIf `DESIGN.md` exists, surface its contents in the stack confirmation step. If it conflicts with what the stack detector found (e.g., DESIGN.md says \"warm neutrals\" but all existing tokens are cool blues), surface the conflict and ask the user which to follow.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Tech Stack Detection is Non-Negotiable\n\nBefore writing a single line of UI code or proposing any design, run [agents/stack-detector.md](agents/stack-detector.md).\n\nThis means:\n\n- Reading `package.json` to identify the framework and installed libraries.\n- Detecting CSS approach (Tailwind, CSS Modules, styled-components, Sass, vanilla).\n- Finding existing design tokens (CSS custom properties, theme files, `tokens.json`).\n- Sampling real components from the project to understand naming, structure, and styling conventions.\n\nIf `package.json` is missing or the project root is unclear, stop and ask the user where to look.\n\nNever assume a library is present based on file extensions alone — verify it in dependencies.\n\n### Pattern 2: Never Invent Tokens — Read First\n\nBefore using any color, spacing, font size, border radius, shadow, or z-index value:\n\n1. Search for CSS custom properties: `grep -r \"var(--\" src/`\n2. Check for a theme file: `tailwind.config.ts`, `theme.ts`, `tokens.json`, `_variables.scss`\n3. Check for a design system config: `@mui/material`, `chakra-ui/theme`, `shadcn/ui` config\n\nIf the token does not exist in the project, do not invent it. Ask the user: \"This project doesn't define a token for X. Should I add one, or is there an existing value I missed?\"\n\n### Pattern 3: Confirm Before Every Design Decision\n\nAt every fork — layout choice, component variant, color, interaction pattern — if the right answer is not derivable from the existing code or from `DESIGN.md`, ask the user.\n\nExamples of things that require confirmation:\n\n- Which existing component to base a new one on.\n- Whether to use Tailwind utility classes or a CSS module.\n- Whether to match a specific existing page's spacing rhythm or start fresh.\n- Which breakpoints the project already targets.\n\nShort, specific questions are better than long ambiguous ones. One question at a time if possible.\n\n### Pattern 4: Follow the Project's Visual Language\n\nAfter stack detection, read 3–5 existing components before proposing any design. Identify:\n\n- The naming convention (PascalCase components, BEM CSS, camelCase tokens, etc.)\n- The composition pattern (atomic components, compound components, render props, slots)\n- The styling approach (co-located styles, global theme, utility-first classes)\n\nEvery new component or style must feel like it was written by the same team that wrote the existing code — not imported from a different design system.\n\nIf no existing components are found, use `DESIGN.md` as the visual language reference. If neither exists, run `design-context-setter` before proceeding.\n\n### Pattern 5: Explain Taste as Observable Decisions\n\nWhen the user provides references, do not summarize them as vibes. Convert each reference into visible, buildable decisions:\n\n- **Register:** brand surface where design is the product, or product surface where design serves repeated use.\n- **Visual ingredients:** type contrast, color role, spacing rhythm, density, radius, elevation, imagery, component shape, and motion character.\n- **Taste rules:** what to repeat, what to avoid, and what would make the design feel off-brand.\n- **Anti-references:** common AI reflexes the project should reject.\n\nUse [assets/taste-reference-extraction.md](assets/taste-reference-extraction.md) for the extraction workflow. Its source model combines Refero Styles' reference-search framing with Impeccable's design vocabulary, register split, and anti-slop detection.\n\n---\n\n## What Not To Do\n\nThese are the most critical rules. Violating any of them produces AI slop.\n\n- **Never assume a UI library is present** without verifying it in `package.json`. Shadcn and Radix look similar in JSX — check the deps.\n- **Never pick colors, fonts, or spacing values not already in the project**. If the project has no purple, do not introduce purple.\n- **Never use Inter as a default font** unless it is explicitly declared in the project. Inter is a sign of uncontextualized AI output.\n- **Never generate a component without reading at least one existing component first** (or DESIGN.md if no components exist). The project's conventions must be the template.\n- **Never apply a generic layout** (hero + cards + CTA, standard nav + footer) without verifying the project already uses or wants that structure.\n- **Never chain design decisions silently**. If one decision implies a downstream choice (e.g., using a grid library implies a layout system), surface it.\n- **Never proceed after ambiguity**. If the detected stack is inconsistent (e.g., Tailwind and styled-components both present), stop and ask which one is canonical.\n- **Never treat a partial stack detection as complete**. If `package.json` was readable but no component files were found, say so and ask for the component directory.\n- **Never ship a \"placeholder\" or \"you can customize this later\" design**. Every value must be intentional and project-derived.\n- **Never skip the confirmation step** even if the stack looks obvious. One confirmation prevents ten corrections.\n- **Never ignore DESIGN.md when it exists**. It represents deliberate decisions the user has already made.\n\n---\n\n## Decision Tree\n\n```text\nUser asks for UI work\n  -> Has stack-detector been run and confirmed by user?\n       NO  -> Run stack-detector, present findings, ask for confirmation\n       YES -> Continue\n\n  -> Does DESIGN.md exist?\n       YES -> Read it; surface any conflicts with detected stack\n       NO  -> Are there existing components to sample?\n                YES -> Sample them (Pattern 4)\n                NO  -> Run design-context-setter to create DESIGN.md\n\nIs the requested component similar to an existing one in the project?\n  YES -> Read the existing component, use it as the structural and styling template\n  NO  -> Ask the user which existing component is closest, or if this is a net-new pattern\n\nDoes the design require a token/value (color, spacing, font) not yet found in the project or DESIGN.md?\n  YES -> Ask the user: add a new token, use an existing one, or clarify?\n  NO  -> Use the existing token\n\nIs the CSS approach Tailwind?\n  YES -> Use only classes declared in tailwind.config; no arbitrary values unless project already uses them\n  NO  -> Continue\n\nIs the CSS approach CSS Modules or Sass?\n  YES -> Follow the naming convention of existing .module.css or .scss files exactly\n  NO  -> Continue\n\nIs the CSS approach styled-components or CSS-in-JS?\n  YES -> Match the theme structure; use theme.colors/spacing/typography from the existing theme provider\n  NO  -> Use whatever CSS approach was detected; if none detected, ask the user\n\nReady to implement?\n  YES -> Hand off to component-designer with full confirmed context\n\nAfter generation:\n  -> Invoke critique to challenge design quality and route fixes\n  -> Invoke visual-refiner for critique-routed visual fixes\n  -> Does the component need motion? -> Invoke motion-designer\n       -> Does motion match existing Motion/Framer Motion, React motion props, layout, exit, gestures, or lightweight JS animation?\n            YES -> Use motion-animation for official-source Motion guidance\n       -> Does motion need GSAP timelines, ScrollTrigger, pin/scrub behavior, or GSAP plugins?\n            YES -> Use gsap-animation for official-source GSAP guidance\n            NO  -> Use confirmed stack primitives\n```\n\n---\n\n## Code Examples\n\n### Example 1: Detecting CSS custom properties in a project\n\n```bash\n# Find all CSS variables defined at :root\ngrep -rn \":root\" src/ --include=\"*.css\" --include=\"*.scss\"\n\n# Find all usages of CSS custom properties\ngrep -rn \"var(--\" src/ --include=\"*.css\" --include=\"*.scss\" --include=\"*.tsx\" --include=\"*.vue\"\n```\n\n### Example 2: Identifying a Tailwind project and reading its token config\n\n```bash\n# Check if Tailwind is installed\ncat package.json | grep tailwind\n\n# Read the full color/spacing/font token config\ncat tailwind.config.ts\n```\n\n### Example 3: Sampling existing components to learn the pattern\n\n```bash\n# Find all component files in a React project\nfind src/components -name \"*.tsx\" | head -5\n\n# Read one to understand structure and styling approach\ncat src/components/Button/Button.tsx\n```\n\n### Example 4: Detecting shadcn/ui vs MUI vs Chakra\n\n```bash\n# shadcn/ui (no package — installed as local files)\nls src/components/ui/\n\n# MUI\ngrep '\"@mui/material\"' package.json\n\n# Chakra UI\ngrep '\"@chakra-ui/react\"' package.json\n\n# Radix Primitives (often underlies shadcn)\ngrep '\"@radix-ui' package.json\n```\n\n---\n\n## Commands\n\n```bash\n# Check for DESIGN.md at project root\ncat DESIGN.md 2>/dev/null\n\n# Read project dependencies\ncat package.json | grep -A 50 '\"dependencies\"'\n\n# Detect CSS approach from file extensions\nfind src -name \"*.module.css\" | head -3       # CSS Modules\nfind src -name \"*.module.scss\" | head -3      # Sass Modules\ngrep -rl \"styled-components\\|emotion\" src/    # CSS-in-JS\ngrep -rl \"cn(\\|clsx\\|classnames\" src/         # Tailwind class merging\n\n# Find design token files\nfind . -name \"tokens.json\" -o -name \"theme.ts\" -o -name \"_variables.scss\" 2>/dev/null\n\n# List existing components\nfind src/components -maxdepth 2 -name \"*.tsx\" -o -name \"*.vue\" | head -10\n```\n\n---\n\n## Resources\n\n- Stack detection procedure: [agents/stack-detector.md](agents/stack-detector.md)\n- Design context setup (greenfield): [agents/design-context-setter.md](agents/design-context-setter.md)\n- Component design rules: [agents/component-designer.md](agents/component-designer.md)\n- Frontend design critique: [agents/critique.md](agents/critique.md)\n- Visual quality refinement: [agents/visual-refiner.md](agents/visual-refiner.md)\n- Motion and micro-interactions: [agents/motion-designer.md](agents/motion-designer.md)\n- Full scan checklist: [assets/stack-scan-checklist.md](assets/stack-scan-checklist.md)\n- Aesthetic archetypes reference: [assets/aesthetic-archetypes.md](assets/aesthetic-archetypes.md)\n- Taste reference extraction: [assets/taste-reference-extraction.md](assets/taste-reference-extraction.md)\n"
  },
  {
    "id": "gsap-animation",
    "title": "GSAP Animation",
    "description": "Guide GSAP animation implementation using only official GSAP documentation and the official greensock/gsap-skills source material. Trigger: implementing, reviewing, or choosing GSAP for frontend motion, timelines, ScrollTrigger, React useGSAP, gsap.utils, Vue/Svelte/Nuxt animation, GSAP plugins, JavaScript animation libraries, or advanced UI animation.",
    "tags": [
      "frontend",
      "animation",
      "motion",
      "gsap",
      "workflow"
    ],
    "sourcePath": "catalog/skills/gsap-animation/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-05-23",
      "license": "Apache-2.0",
      "version": "1.1.0",
      "changelog": "Expanded GSAP catalog guidance with utilities, non-React framework patterns, official plugin availability, and upstream skill routing; improves official-source coverage and trigger precision; affects GSAP animation skill routing, catalog discovery, and implementation references",
      "auto-invoke": "Implementing, reviewing, or choosing GSAP for frontend motion, timelines, ScrollTrigger, React useGSAP, gsap.utils, Vue/Svelte/Nuxt animation, GSAP plugins, JavaScript animation libraries, or advanced UI animation",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "WebFetch",
        "WebSearch",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "references",
        "type": "dir",
        "children": [
          {
            "name": "core-patterns.md",
            "type": "file"
          },
          {
            "name": "framework-patterns.md",
            "type": "file"
          },
          {
            "name": "official-source-map.md",
            "type": "file"
          },
          {
            "name": "performance-accessibility.md",
            "type": "file"
          },
          {
            "name": "plugin-selection.md",
            "type": "file"
          },
          {
            "name": "react-patterns.md",
            "type": "file"
          },
          {
            "name": "scrolltrigger-patterns.md",
            "type": "file"
          },
          {
            "name": "utils-patterns.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"gsap-animation\"\ndescription: \"Guide GSAP animation implementation using only official GSAP documentation and the official greensock/gsap-skills source material. Trigger: implementing, reviewing, or choosing GSAP for frontend motion, timelines, ScrollTrigger, React useGSAP, gsap.utils, Vue/Svelte/Nuxt animation, GSAP plugins, JavaScript animation libraries, or advanced UI animation.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-05-23\"\n  license: \"Apache-2.0\"\n  version: \"1.1.0\"\n  changelog: \"Expanded GSAP catalog guidance with utilities, non-React framework patterns, official plugin availability, and upstream skill routing; improves official-source coverage and trigger precision; affects GSAP animation skill routing, catalog discovery, and implementation references\"\n  auto-invoke: \"Implementing, reviewing, or choosing GSAP for frontend motion, timelines, ScrollTrigger, React useGSAP, gsap.utils, Vue/Svelte/Nuxt animation, GSAP plugins, JavaScript animation libraries, or advanced UI animation\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"WebFetch\"\n    - \"WebSearch\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# GSAP Animation Guide\n\n## When to Use\n\nUse this skill when:\n\n- The user asks for GSAP, GreenSock, JavaScript animation, advanced frontend motion, timelines, scroll-driven animation, pinning, parallax, ScrollTrigger, React `useGSAP()`, `gsap.utils`, Vue, Svelte, Nuxt, or GSAP plugins.\n- Another skill needs a verified GSAP handoff for richer UI motion than CSS transitions can comfortably express.\n- A project needs animation that is sequenced, reversible, controllable at runtime, scroll-linked, SVG-heavy, or framework-agnostic.\n\nDo not use this skill when:\n\n- The project already uses another animation library and the user has not asked to add or migrate to GSAP.\n- A simple CSS transition is sufficient and no richer timeline, scroll, plugin, or runtime control is needed.\n- The work is backend-only or has no user-facing motion surface.\n\n---\n\n## Official-Only Source Rule\n\nBefore generating GSAP-specific guidance, verify the pattern against official sources in [references/official-source-map.md](references/official-source-map.md).\n\nUse only:\n\n- GSAP docs at `https://gsap.com/docs/v3/`.\n- GSAP learning/resources pages linked from the official docs.\n- The official `greensock/gsap-skills` repository linked from the GSAP docs, including its focused AI skill files.\n\nDo not use blog posts, snippets, Stack Overflow answers, social posts, or memory-only claims as source material for GSAP API behavior. If a detail is not covered by the reference files, check official docs before using it.\n\n---\n\n## Routing\n\n| Need | Use |\n| --- | --- |\n| One-off or simple animation | [references/core-patterns.md](references/core-patterns.md) |\n| Multi-step sequencing or runtime control | GSAP timeline guidance in [references/core-patterns.md](references/core-patterns.md) |\n| Scroll reveals, scrub, pin, snap, parallax | [references/scrolltrigger-patterns.md](references/scrolltrigger-patterns.md) |\n| React or Next.js animation | [references/react-patterns.md](references/react-patterns.md) |\n| Vue, Nuxt, Svelte, SvelteKit, or framework lifecycle cleanup | [references/framework-patterns.md](references/framework-patterns.md) |\n| Value mapping, randomization, snapping, scoped selectors, helper utilities | [references/utils-patterns.md](references/utils-patterns.md) |\n| Flip, Draggable, SplitText, SVG, ScrollSmoother, and other GSAP plugins | [references/plugin-selection.md](references/plugin-selection.md) |\n| Reduced motion, cleanup, transform performance | [references/performance-accessibility.md](references/performance-accessibility.md) |\n\nWhen the user asks for an animation library without naming one, prefer GSAP for timelines, scroll-driven animation, framework-agnostic animation, runtime control, or coordinated multi-element motion. If the project or user has already chosen another library, respect that choice unless they ask to compare or migrate.\n\n---\n\n## Project Preflight\n\nAlways inspect the target project before proposing implementation:\n\n```bash\ngrep -E '\"gsap\"|\"@gsap/react\"|\"vue\"|\"svelte\"|\"nuxt\"|\"framer-motion\"|\"@motionone/dom\"|\"animejs\"|\"motion\"' package.json\ngrep -rn \"gsap\\\\.|ScrollTrigger|useGSAP|registerPlugin|gsap.utils\" src --include=\"*.js\" --include=\"*.jsx\" --include=\"*.ts\" --include=\"*.tsx\" --include=\"*.vue\" --include=\"*.svelte\" 2>/dev/null\ngrep -rn \"prefers-reduced-motion|transition|@keyframes\" src --include=\"*.css\" --include=\"*.scss\" --include=\"*.tsx\" --include=\"*.jsx\" --include=\"*.vue\" --include=\"*.svelte\" 2>/dev/null\n```\n\nIf `gsap` is not installed, ask before adding it. If React `useGSAP()` is needed and `@gsap/react` is not installed, ask before adding it. This skill teaches target projects how to use GSAP; it does not add GSAP to skilly-hand itself.\n\n---\n\n## Implementation Rules\n\n- Import GSAP from the official package and register every plugin used with `gsap.registerPlugin(...)`.\n- Prefer timelines for choreography, overlap, labels, pause/play/reverse/seek control, and any sequence that would otherwise rely on chained delays.\n- Prefer GSAP transform aliases like `x`, `y`, `scale`, `rotation`, `xPercent`, `yPercent`, and `transformOrigin` over raw `transform` strings.\n- Prefer `autoAlpha` when fading elements that should become hidden and non-interactive at zero visibility.\n- Scope selectors to a component or container when working inside frameworks.\n- Clean up every component-owned animation with `useGSAP()`, `gsap.context().revert()`, or `gsap.matchMedia().revert()`.\n- Use `gsap.matchMedia()` for breakpoints and `prefers-reduced-motion`; reduce, shorten, or skip animation when users request reduced motion.\n- Avoid animating layout-heavy properties like `width`, `height`, `top`, `left`, `margin`, or `padding` when transforms can achieve the effect.\n\n---\n\n## Framework Guidance\n\nReact and Next.js:\n\n- Prefer `useGSAP()` from `@gsap/react` when available.\n- Register `useGSAP` with `gsap.registerPlugin(useGSAP)`.\n- Pass a `scope` ref so selector text stays inside the component.\n- Use `contextSafe()` for event handlers, timers, or callbacks that create GSAP objects after the hook executes.\n- Keep GSAP execution in client-only lifecycle. In React Server Components, the component using GSAP must be client-side.\n\nOther frameworks:\n\n- Run GSAP setup after DOM nodes exist, such as Vue `onMounted()` or Svelte `onMount()`.\n- Scope selectors to the component root with `gsap.context(callback, scope)` where possible.\n- Revert GSAP contexts, matchMedia instances, ScrollTriggers, split text, and event listeners during component teardown.\n- Register plugins once at app/module level instead of inside render paths.\n\n---\n\n## Output Contract\n\nWhen using this skill, include:\n\n- The official pattern source you used.\n- Whether GSAP is already installed or requires approval.\n- Which GSAP primitive is appropriate: tween, timeline, ScrollTrigger, plugin, `useGSAP()`, `context()`, or `matchMedia()`.\n- Cleanup and reduced-motion behavior.\n- A verification step appropriate to the project, such as unit tests, interaction tests, browser smoke checks, or visual inspection.\n\n---\n\n## Commands\n\n```bash\n# Install GSAP in a target project only after user approval\nnpm install gsap\n\n# Install React helper only after user approval and only for React projects\nnpm install @gsap/react\n\n# Check for existing GSAP usage\ngrep -rn \"gsap\\\\.|ScrollTrigger|useGSAP|registerPlugin\" src --include=\"*.js\" --include=\"*.jsx\" --include=\"*.ts\" --include=\"*.tsx\"\n```\n\n---\n\n## Resources\n\n- Source map: [references/official-source-map.md](references/official-source-map.md)\n- Official GSAP AI skills repository: https://github.com/greensock/gsap-skills\n- Core patterns: [references/core-patterns.md](references/core-patterns.md)\n- React patterns: [references/react-patterns.md](references/react-patterns.md)\n- Framework patterns: [references/framework-patterns.md](references/framework-patterns.md)\n- ScrollTrigger patterns: [references/scrolltrigger-patterns.md](references/scrolltrigger-patterns.md)\n- Utility patterns: [references/utils-patterns.md](references/utils-patterns.md)\n- Plugin selection: [references/plugin-selection.md](references/plugin-selection.md)\n- Performance and accessibility: [references/performance-accessibility.md](references/performance-accessibility.md)\n"
  },
  {
    "id": "motion-animation",
    "title": "Motion Animation",
    "description": "Guide Motion, formerly Framer Motion, animation implementation using only official Motion documentation. Trigger: implementing, reviewing, or choosing Motion for JavaScript animation, React motion components, gestures, scroll animation, layout animation, exit animation, or framework-agnostic UI motion.",
    "tags": [
      "frontend",
      "animation",
      "motion",
      "framer-motion",
      "workflow"
    ],
    "sourcePath": "catalog/skills/motion-animation/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-05-03",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Added official-source Motion animation guidance for JavaScript and React; improves framework-agnostic and React-native motion implementation with verified Motion APIs; affects frontend animation routing and catalog discovery",
      "auto-invoke": "Implementing, reviewing, or choosing Motion for JavaScript animation, React motion components, gestures, scroll animation, layout animation, exit animation, or framework-agnostic UI motion",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "WebFetch",
        "WebSearch",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "references",
        "type": "dir",
        "children": [
          {
            "name": "js-patterns.md",
            "type": "file"
          },
          {
            "name": "official-source-map.md",
            "type": "file"
          },
          {
            "name": "performance-accessibility.md",
            "type": "file"
          },
          {
            "name": "react-patterns.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"motion-animation\"\ndescription: \"Guide Motion, formerly Framer Motion, animation implementation using only official Motion documentation. Trigger: implementing, reviewing, or choosing Motion for JavaScript animation, React motion components, gestures, scroll animation, layout animation, exit animation, or framework-agnostic UI motion.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-05-03\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Added official-source Motion animation guidance for JavaScript and React; improves framework-agnostic and React-native motion implementation with verified Motion APIs; affects frontend animation routing and catalog discovery\"\n  auto-invoke: \"Implementing, reviewing, or choosing Motion for JavaScript animation, React motion components, gestures, scroll animation, layout animation, exit animation, or framework-agnostic UI motion\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"WebFetch\"\n    - \"WebSearch\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# Motion Animation Guide\n\n## When to Use\n\nUse this skill when:\n\n- The user asks for Motion, Framer Motion, Motion One, JavaScript animation with `motion`, React `motion` components, gestures, scroll-triggered animation, scroll-linked animation, layout animation, or exit animation.\n- Another skill needs a verified Motion handoff for lightweight UI motion, React-native animation props, or framework-agnostic JavaScript animation.\n- A project already uses `motion`, `framer-motion`, or `@motionone/dom` and the user has not asked to migrate away.\n\nDo not use this skill when:\n\n- The project already uses another animation library and the user has not asked to add or migrate to Motion.\n- A simple CSS transition is sufficient and no JavaScript, React prop, layout, gesture, scroll, or exit animation behavior is needed.\n- The work needs GSAP-specific timelines, ScrollTrigger pin/scrub behavior, GSAP plugins, or existing GSAP patterns. Use `gsap-animation` for that.\n- The work is backend-only or has no user-facing motion surface.\n\n---\n\n## Official-Only Source Rule\n\nBefore generating Motion-specific guidance, verify the pattern against official sources in [references/official-source-map.md](references/official-source-map.md).\n\nUse only:\n\n- Motion docs at `https://motion.dev/docs/quick-start`.\n- Motion for React docs at `https://motion.dev/docs/react`.\n- Official `motion.dev/docs/*` pages linked from those pages when a referenced API needs more detail.\n\nDo not use blog posts, snippets, Stack Overflow answers, social posts, or memory-only claims as source material for Motion API behavior. If a detail is not covered by the reference files, check official Motion docs before using it.\n\n---\n\n## Routing\n\n| Need | Use |\n| --- | --- |\n| Framework-agnostic DOM/SVG/object animation | [references/js-patterns.md](references/js-patterns.md) |\n| Plain HTML, Webflow, no-code, or script tag usage | Script-tag guidance in [references/js-patterns.md](references/js-patterns.md) |\n| React or Next.js prop-based UI animation | [references/react-patterns.md](references/react-patterns.md) |\n| React exit, layout, gesture, scroll, and SVG animation | [references/react-patterns.md](references/react-patterns.md) |\n| Reduced motion, cleanup, and performance guidance | [references/performance-accessibility.md](references/performance-accessibility.md) |\n\nWhen the user asks for an animation library without naming one, prefer Motion when the need is lightweight JavaScript animation, React prop-based animation, gestures, layout animation, exit animation, or a project already uses Motion/Framer Motion. Prefer GSAP for GSAP timelines, ScrollTrigger pin/scrub choreography, GSAP plugins, or an existing GSAP stack.\n\n---\n\n## Project Preflight\n\nAlways inspect the target project before proposing implementation:\n\n```bash\ngrep -E '\"motion\"|\"framer-motion\"|\"@motionone/dom\"|\"gsap\"|\"@gsap/react\"|\"animejs\"' package.json\ngrep -rn \"from \\\"motion\\\"|from 'motion'|from \\\"motion/react\\\"|from 'motion/react'|framer-motion|motion\\\\.|AnimatePresence|useScroll|useReducedMotion\" src --include=\"*.js\" --include=\"*.jsx\" --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null\ngrep -rn \"prefers-reduced-motion|transition|@keyframes\" src --include=\"*.css\" --include=\"*.scss\" --include=\"*.tsx\" --include=\"*.jsx\" 2>/dev/null\n```\n\nIf `motion` is not installed, ask before adding it. This skill teaches target projects how to use Motion; it does not add Motion to skilly-hand itself.\n\n---\n\n## Implementation Rules\n\n- Use the official package name `motion`.\n- Prefer JavaScript imports from `\"motion\"` for framework-agnostic work.\n- Prefer React imports from `\"motion/react\"` for React components and hooks.\n- Use `animate()` for DOM, SVG, object, value, and sequence animation where JavaScript control is needed.\n- Use `motion` components for React UI state animation through `initial`, `animate`, `whileHover`, `whileTap`, `whileInView`, `layout`, `layoutId`, and `exit`.\n- Use `AnimatePresence` when React elements need exit animations before DOM removal.\n- Use `scroll()` or `useScroll()` for scroll-linked animation; use `inView()` or `whileInView` for scroll-triggered animation.\n- Use `stagger()` for sibling offsets instead of manually stacking delay values.\n- Respect reduced-motion preferences. Skip, simplify, or replace non-essential motion when users request reduced motion.\n- Clean up JavaScript animations, gestures, scroll listeners, and observers during component or page teardown.\n- Avoid introducing Motion Studio, Motion+ premium APIs, or MCP tooling unless the user explicitly asks for those products.\n\n---\n\n## Framework Guidance\n\nJavaScript and other frameworks:\n\n- Run Motion setup after DOM nodes exist.\n- Pass elements directly when possible, or scope selector text to the component/page root.\n- Store returned animation controls or cleanup functions when teardown or runtime control is needed.\n- For script tag usage, prefer a pinned CDN version instead of `latest`.\n\nReact and Next.js:\n\n- Import `motion`, `AnimatePresence`, and hooks from `\"motion/react\"`.\n- Components using Motion in React Server Component projects must run on the client.\n- Use stable unique keys for `AnimatePresence` children.\n- Use `layout` for size/position/reorder animation and `layoutId` for shared layout transitions.\n- Use `useReducedMotion()` to branch React animation values when needed.\n\n---\n\n## Output Contract\n\nWhen using this skill, include:\n\n- The official Motion source you used.\n- Whether Motion or legacy Framer Motion usage is already installed or requires approval.\n- Which Motion primitive is appropriate: `animate()`, `scroll()`, `inView()`, gesture function, `motion` component, `AnimatePresence`, `useScroll()`, `layout`, `layoutId`, or `useReducedMotion()`.\n- Cleanup and reduced-motion behavior.\n- A verification step appropriate to the project, such as unit tests, interaction tests, browser smoke checks, or visual inspection.\n\n---\n\n## Commands\n\n```bash\n# Install Motion in a target project only after user approval\nnpm install motion\n\n# Check for existing Motion usage\ngrep -rn \"from \\\"motion\\\"|from \\\"motion/react\\\"|framer-motion|AnimatePresence|useScroll|useReducedMotion\" src --include=\"*.js\" --include=\"*.jsx\" --include=\"*.ts\" --include=\"*.tsx\"\n```\n\n---\n\n## Resources\n\n- Source map: [references/official-source-map.md](references/official-source-map.md)\n- JavaScript patterns: [references/js-patterns.md](references/js-patterns.md)\n- React patterns: [references/react-patterns.md](references/react-patterns.md)\n- Performance and accessibility: [references/performance-accessibility.md](references/performance-accessibility.md)\n"
  },
  {
    "id": "output-optimizer",
    "title": "Output Optimizer",
    "description": "Optimize output token consumption through compact interpreter modes with controlled expansion when complexity, ambiguity, or risk requires more detail. Trigger: minimizing response verbosity while preserving clarity and correctness.",
    "tags": [
      "core",
      "workflow",
      "efficiency",
      "communication"
    ],
    "sourcePath": "catalog/skills/output-optimizer/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-04-07",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Added a new portable output compression skill with deterministic interpreter modes and guarded detail expansion; reduces response token costs while preserving safety and clarity; affects response shaping workflows and catalog routing",
      "auto-invoke": "When minimizing output verbosity or selecting compact communication modes",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "Task"
      ]
    },
    "files": [
      {
        "name": "references",
        "type": "dir",
        "children": [
          {
            "name": "mode-protocols.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"output-optimizer\"\ndescription: \"Optimize output token consumption through compact interpreter modes with controlled expansion when complexity, ambiguity, or risk requires more detail. Trigger: minimizing response verbosity while preserving clarity and correctness.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-04-07\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Added a new portable output compression skill with deterministic interpreter modes and guarded detail expansion; reduces response token costs while preserving safety and clarity; affects response shaping workflows and catalog routing\"\n  auto-invoke: \"When minimizing output verbosity or selecting compact communication modes\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"Task\"\n---\n# Output Optimizer Guide\n\n## When to Use\n\nUse this skill when:\n\n- You want compact responses to reduce output token usage.\n- You need deterministic output formats for repeated workflows.\n- You need concise communication without losing core clarity.\n- You want controlled detail expansion only when risk or ambiguity requires it.\n\nDo not use this skill for:\n\n- Cases where the user explicitly asks for long-form teaching or narrative detail.\n- Tasks that require extensive legal, medical, or compliance explanation by default.\n- Situations where a fixed external output schema already overrides style choices.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Activation and Precedence\n\nApply modes in this order:\n\n1. If user writes `mode: <name>`, use that mode.\n2. If no explicit mode, infer from phrasing:\n- \"keywords only\" -> `machine`\n- \"yes or no\" / \"binary\" -> `binary-decision`\n- \"json\" / \"structured output\" -> `json-compact`\n- \"step by step, concise\" -> `step-brief`\n- \"command style\" / \"minimal commands\" -> `neandertal`\n- \"toon format\" -> `toon`\n3. If no strong signal, default to `step-brief` for human-readable compact output.\n\nExplicit mode always wins over inferred mode.\n\n### Pattern 2: Mode Contracts\n\n| Mode | Contract | Token Profile |\n| --- | --- | --- |\n| `neandertal` | Imperative command-like short phrases, no filler, minimal connectors. | Lowest human-readable |\n| `machine` | Keywords only, grouped by labels, no prose sentences. | Ultra-low |\n| `step-brief` | Numbered steps, each step max 3-4 short phrases. | Low with clarity |\n| `toon` | Exactly 4 blocks: `Title`, `Objective`, `Output`, `Next`. | Low and stable |\n| `json-compact` | Minimal stable JSON keys and short scalar values. | Low + parseable |\n| `binary-decision` | `yes` or `no` plus one short reason. | Ultra-low for triage |\n\n### Pattern 3: Complexity + Confidence Guard\n\nDefault to compact output. Expand only when:\n\n1. Task complexity is moderate/high and concise output may cause mistakes.\n2. Requirements are ambiguous and short output cannot preserve correctness.\n3. Risk is elevated (security, production impact, irreversible operations).\n4. User explicitly asks for more detail.\n\nWhen expanding, keep structure compact and scoped to the needed clarification.\n\n### Pattern 4: Compression Rules\n\nAlways prefer:\n\n- Specific nouns over long explanations.\n- One-pass direct answer over repeated restatement.\n- Bounded lists over paragraphs.\n- Deterministic templates where possible.\n\nAvoid:\n\n- Polite filler and redundant transitions.\n- Repeating the prompt unless needed for disambiguation.\n- Verbose caveats when risk is low.\n\n---\n\n## Decision Tree\n\n```text\nUser provided `mode: <name>`?                 -> Use explicit mode\nNo explicit mode, strong phrasing signal?     -> Infer mode from signal\nNo explicit mode and no signal?               -> step-brief\nTask complexity/ambiguity/risk is high?       -> Expand within selected mode\nUser asks for detail/clarification?           -> Expand within selected mode\nOtherwise                                     -> Keep compact output\n```\n\n---\n\n## Output Examples\n\n### Example 1: `neandertal`\n\n```text\nCheck logs. Find error. Patch file. Run tests. Report result.\n```\n\n### Example 2: `machine`\n\n```text\nstatus:blocked\ncause:missing-env\naction:set-token,retry\n```\n\n### Example 3: `step-brief`\n\n```text\n1. Open config file. Find auth block. Confirm token key.\n2. Add missing key. Save file. Re-run command.\n3. Verify success output. Capture result. Share summary.\n```\n\n### Example 4: `toon`\n\n```text\nTitle: Auth Fix\nObjective: Restore CLI login flow\nOutput: Config key added, login passes\nNext: Run smoke check\n```\n\n### Example 5: `json-compact`\n\n```json\n{\"status\":\"ok\",\"mode\":\"json-compact\",\"next\":\"deploy\"}\n```\n\n### Example 6: `binary-decision`\n\n```text\nyes: tests pass on required suite\n```\n\n---\n\n## Prompt Patterns\n\nThese are prompt fragments, not terminal commands.\n\n```text\nmode: neandertal\nmode: machine\nmode: step-brief\nmode: toon\nmode: json-compact\nmode: binary-decision\n```\n\n```text\nexplain in detail\n```\n\n---\n\n## Resources\n\n- Mode protocol reference: [references/mode-protocols.md](references/mode-protocols.md)\n- Related complexity control: [../token-optimizer/SKILL.md](../token-optimizer/SKILL.md)\n"
  },
  {
    "id": "project-security",
    "title": "Project Security",
    "description": "Scan project configuration and release surfaces for leak and security risks, and enforce security gates on commit, push, and publish workflows across GitHub, GitLab, npm, pnpm, yarn, and generic CI. Trigger: validating repository security posture, preventing secret leaks, or hardening delivery pipelines.",
    "tags": [
      "security",
      "workflow",
      "quality",
      "core"
    ],
    "sourcePath": "catalog/skills/project-security/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-04-07",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Added portable project-security skill with commit/push/publish gating assets and CI templates; reduces secret leak and misconfiguration risk before delivery; affects catalog security workflow coverage and auto-invoke routing",
      "auto-invoke": "Scanning project configuration and delivery workflows for leaks or security issues before commit, push, or publish",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "generic-ci-security-gate.sh",
            "type": "file"
          },
          {
            "name": "github-actions-security-gate.yml",
            "type": "file"
          },
          {
            "name": "gitlab-ci-security-gate.yml",
            "type": "file"
          },
          {
            "name": "high-risk-files-checklist.md",
            "type": "file"
          },
          {
            "name": "pre-commit.sample.sh",
            "type": "file"
          },
          {
            "name": "pre-publish.sample.sh",
            "type": "file"
          },
          {
            "name": "pre-push.sample.sh",
            "type": "file"
          },
          {
            "name": "run-security-check.shared.sh",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"project-security\"\ndescription: \"Scan project configuration and release surfaces for leak and security risks, and enforce security gates on commit, push, and publish workflows across GitHub, GitLab, npm, pnpm, yarn, and generic CI. Trigger: validating repository security posture, preventing secret leaks, or hardening delivery pipelines.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-04-07\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Added portable project-security skill with commit/push/publish gating assets and CI templates; reduces secret leak and misconfiguration risk before delivery; affects catalog security workflow coverage and auto-invoke routing\"\n  auto-invoke: \"Scanning project configuration and delivery workflows for leaks or security issues before commit, push, or publish\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# Project Security Guide\n\n## When to Use\n\nUse this skill when:\n\n- You need to prevent secret leaks or insecure config from entering source control.\n- You are preparing to commit, push, or publish and want enforced security gates.\n- You need portable security checks across npm, pnpm, yarn, GitHub, GitLab, or generic CI.\n- You are reviewing repository settings, package metadata, lockfiles, and workflow files for risk.\n\nDo not use this skill for:\n\n- Runtime penetration testing of deployed environments.\n- Cloud infrastructure hardening outside the repository scope.\n- Compliance audits that require organization-specific legal controls beyond repository security.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Scan High-Risk Repository Surfaces First\n\nPrioritize files that most often leak credentials or unsafe release behavior:\n\n1. Local config and env surfaces (`.env*`, settings files, tool config, secrets material).\n2. Package and release metadata (`package.json`, lockfiles, publish config, scripts).\n3. Ignore and policy boundaries (`.gitignore`, `.npmignore`, allow/deny lists).\n4. CI/CD workflows (`.github/workflows`, `.gitlab-ci.yml`, release jobs).\n\nUse the baseline checklist in [assets/high-risk-files-checklist.md](assets/high-risk-files-checklist.md).\n\n### Pattern 2: Enforce Gates by Delivery Stage\n\nUse increasing guardrails by stage:\n\n- **Commit gate**: fast checks for hardcoded secrets, committed env files, and critical ignore hygiene.\n- **Push gate**: commit gate plus supply-chain and workflow safety checks.\n- **Publish gate**: push gate plus release-surface validation (publish scripts/config and package contents).\n\n### Pattern 3: Block on High-Risk by Default\n\n- **Blocker (fail immediately)** examples: confirmed secrets, private keys, tracked `.env` files, unsafe publish exposure.\n- **Warning (non-blocking)** examples: low-confidence token patterns, optional hardening gaps, advisory-only dependency alerts.\n\nDefault policy:\n\n1. Exit non-zero for blockers.\n2. Treat dependency-audit failures as blocking by default in push and CI gates.\n3. Do not provide warning-mode bypasses for dependency audit failures in enforced gates.\n\n### Pattern 4: Keep Gate Execution Deterministic\n\n- Do not use dynamic command override execution for core gate logic.\n- Resolve commands in a fixed order only: `pnpm` -> `yarn` -> `npm` -> `node scripts/security-check.mjs`.\n- Fail closed when no valid runner or lockfile path is available.\n- Do not include bypass environment flags for enforced gates.\n\n### Pattern 5: Stay Package-Manager and CI Agnostic\n\nAlways provide equivalent paths for npm, pnpm, yarn, and generic shell runners.\n\n- Do not assume one package manager.\n- Detect lockfiles and use the matching command path when possible.\n- Keep templates portable and adapter-based.\n\n---\n\n## Decision Tree\n\n```text\nNeed checks before local commits?                    -> Install pre-commit gate template\nNeed checks before remote integration?               -> Install pre-push gate template\nNeed checks before package release/publication?      -> Install pre-publish gate and CI release gate\nSingle-platform pipeline only?                       -> Use platform adapter (GitHub or GitLab)\nMultiple platforms or uncertain tooling?             -> Use generic gate script + adapter wrappers\nOtherwise                                            -> Apply all three gates (commit, push, publish)\n```\n\n---\n\n## Code Examples\n\n### Example 1: Security Check Script in `package.json`\n\n```json\n{\n  \"scripts\": {\n    \"security:check\": \"node scripts/security-check.mjs\"\n  }\n}\n```\n\n### Example 2: Commit Gate Wiring (Git Hook)\n\n```sh\ncp catalog/skills/project-security/assets/pre-commit.sample.sh .git/hooks/pre-commit\nchmod +x .git/hooks/pre-commit\n```\n\n### Example 3: Publish Gate Wiring (Package Script)\n\n```json\n{\n  \"scripts\": {\n    \"prepublishOnly\": \"sh catalog/skills/project-security/assets/pre-publish.sample.sh\"\n  }\n}\n```\n\n---\n\n## Commands\n\n```bash\n# Core check command (generic)\nnode scripts/security-check.mjs\n\n# npm\nnpm run --silent security:check\n\n# pnpm\npnpm run -s security:check\n\n# yarn\nyarn -s security:check\n\n# Install git hook gates\ncp catalog/skills/project-security/assets/pre-commit.sample.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit\ncp catalog/skills/project-security/assets/pre-push.sample.sh .git/hooks/pre-push && chmod +x .git/hooks/pre-push\n\n# Run a generic CI gate script\nsh catalog/skills/project-security/assets/generic-ci-security-gate.sh\n\n```\n\n---\n\n## Workflow Adapters\n\n- GitHub Actions snippet: [assets/github-actions-security-gate.yml](assets/github-actions-security-gate.yml)\n- GitLab CI snippet: [assets/gitlab-ci-security-gate.yml](assets/gitlab-ci-security-gate.yml)\n- Generic CI entrypoint: [assets/generic-ci-security-gate.sh](assets/generic-ci-security-gate.sh)\n\n---\n\n## Resources\n\n- High-risk file checklist: [assets/high-risk-files-checklist.md](assets/high-risk-files-checklist.md)\n- Shared deterministic resolver: [assets/run-security-check.shared.sh](assets/run-security-check.shared.sh)\n- Commit gate template: [assets/pre-commit.sample.sh](assets/pre-commit.sample.sh)\n- Push gate template: [assets/pre-push.sample.sh](assets/pre-push.sample.sh)\n- Publish gate template: [assets/pre-publish.sample.sh](assets/pre-publish.sample.sh)\n\n---\n\n## Breaking Behavior Note\n\n- Audit failures now block by default in push and CI gates.\n- GitHub CI template fails when `package.json` exists without a lockfile.\n- Publish gate now requires the bundled generic gate script and fails closed when it is missing.\n- `SECURITY_CHECK_CMD` override is removed for deterministic gate execution.\n- `SKIP_SECURITY_GATES` and `ENABLE_SUPPLY_CHAIN_WARNINGS` bypass flags are removed from templates.\n"
  },
  {
    "id": "project-teacher",
    "title": "Project Teacher",
    "description": "Scan the active project and teach any concept, code path, or decision using verified information, interactive questions, and simple explanations. Trigger: user asks to explain, understand, clarify, or learn about anything in the project or codebase.",
    "tags": [
      "core",
      "workflow",
      "education"
    ],
    "sourcePath": "catalog/skills/project-teacher/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-04-04",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Initial release of project-teacher skill; provides interactive, project-grounded teaching for any concept or code path; affects education and clarification workflows across all projects",
      "auto-invoke": "User needs to understand, explain, or learn about any aspect of the project or codebase",
      "allowed-tools": [
        "Read",
        "Glob",
        "Grep",
        "Bash",
        "WebFetch",
        "WebSearch"
      ]
    },
    "files": [],
    "content": "---\nname: \"project-teacher\"\ndescription: \"Scan the active project and teach any concept, code path, or decision using verified information, interactive questions, and simple explanations. Trigger: user asks to explain, understand, clarify, or learn about anything in the project or codebase.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-04-04\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Initial release of project-teacher skill; provides interactive, project-grounded teaching for any concept or code path; affects education and clarification workflows across all projects\"\n  auto-invoke: \"User needs to understand, explain, or learn about any aspect of the project or codebase\"\n  allowed-tools:\n    - \"Read\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"WebFetch\"\n    - \"WebSearch\"\n---\n# Project Teacher Guide\n\n## When to Use\n\nUse this skill when:\n\n- The user asks to explain, understand, or clarify anything — code, architecture, decisions, or concepts.\n- The user asks \"what is\", \"why does\", \"how does\", \"what happens when\", or similar questions.\n- Clarification is needed during an SDD planning session before writing a spec.\n- A concept needs to be broken down into simpler terms before implementation begins.\n- The user wants to understand the reasoning or history behind a decision in the codebase.\n\nDo not use this skill for:\n\n- Writing, generating, or modifying code.\n- Creating specs, plans, or implementation tasks.\n- Running tests or build commands.\n\n---\n\n## Core Teaching Loop\n\nEvery explanation follows this 4-step loop:\n\n1. **Scan** — Read the relevant parts of the project before answering.\n2. **Clarify** — Ask 1–2 targeted questions to understand what the user already knows and what depth they need.\n3. **Explain** — Deliver the explanation using verified facts, citing file paths where relevant.\n4. **Check Understanding** — Ask if the explanation landed or if any part needs to go deeper.\n\nNever skip the Scan step. Never state something as fact without verifying it in the code first.\n\n---\n\n## Scan Protocol\n\nBefore answering any question, scan the project:\n\n```text\n1. Identify the entry points (e.g., index.ts, main.ts, App.tsx, package.json).\n2. Find the files most relevant to the question (use Glob + Grep).\n3. Read the relevant sections — functions, imports, config, comments.\n4. Note the actual behavior, not assumed behavior.\n5. Only then compose the explanation.\n```\n\nScan rules:\n\n- Never explain from memory alone; always verify against the current code.\n- If the answer requires understanding a dependency, read it or look it up.\n- If the codebase contradicts a general best practice, explain what the code actually does.\n\n---\n\n## Interaction Patterns\n\nBefore explaining, ask 1–2 focused questions to calibrate:\n\n| Situation | Question to Ask |\n| --- | --- |\n| Unclear what level of detail is needed | \"Would you like a quick overview or a deeper walkthrough?\" |\n| Unclear what the user already knows | \"Are you familiar with [concept X], or should I start from scratch?\" |\n| Multiple possible angles | \"Are you more interested in how it works internally or why it was designed this way?\" |\n| SDD context | \"Is this to clarify requirements before writing a spec, or to understand existing behavior?\" |\n\nRules:\n\n- Ask at most 2 questions before explaining — do not interrogate.\n- If the question is already crystal clear, skip directly to explanation.\n- After explaining, always close with: \"Does this make sense, or would you like me to go deeper on any part?\"\n\n---\n\n## Explanation Modes\n\nChoose the mode that fits the question and the user's answer to your calibration questions:\n\n| Mode | When to Use | Format |\n| --- | --- | --- |\n| **Quick Overview** | User wants orientation, not depth | 3–5 bullet points + 1 example |\n| **Deep Dive** | User wants to fully understand | Step-by-step prose + code references + file:line citations |\n| **Analogy** | Abstract or unfamiliar concept | Real-world comparison + 1 short code example |\n| **Trace-Through** | User wants to follow execution | Numbered steps tracing the code path from trigger to outcome |\n\nMix modes when helpful — for example, start with an Analogy then transition to a Trace-Through for complex topics.\n\n---\n\n## Decision Tree\n\n```text\nWhat kind of question is this?\n\n  \"What is X?\" or \"What does X do?\"\n    -> Quick Overview or Deep Dive based on user preference\n\n  \"Why does X work this way?\" or \"Why was X chosen?\"\n    -> Deep Dive + cite relevant code comments, config, or git context if available\n\n  \"How does X flow / execute / work internally?\"\n    -> Trace-Through mode\n\n  \"I don't understand X at all\"\n    -> Analogy first, then offer a follow-up Trace-Through\n\n  Clarifying requirements before writing a spec?\n    -> Deep Dive focused on constraints and behavior; hand off to spec-driven-development when done\n```\n\n---\n\n## SDD Companion Rules\n\nWhen `project-teacher` is invoked during a `spec-driven-development` session:\n\n1. Pause the SDD workflow to answer the clarifying question.\n2. Use Deep Dive or Trace-Through — shallow answers during planning create bad specs.\n3. After explaining, summarize what was clarified in one sentence the user can paste directly into the spec's `Why` or `Constraints` section.\n4. Return control to the SDD workflow explicitly: \"Ready to continue with the spec?\"\n\n---\n\n## Quality Rules\n\n- **Only state verified facts.** If you haven't read the file, don't claim to know what it does.\n- **Cite sources.** Reference `file.ts:42` or `config/settings.json` when making specific claims.\n- **Separate fact from inference.** If you're reasoning about intent rather than reading it directly, say so: \"Based on the code, it looks like...\" vs. \"The code does...\".\n- **No hallucinated APIs.** If an external API or library behavior is in question, use WebFetch or WebSearch to verify before explaining.\n- **Keep it simple by default.** Use plain language first. Introduce jargon only when it adds precision, and always define it when you do.\n\n---\n\n## Commands\n\n```bash\n# Find entry points to scan\nls package.json tsconfig.json src/index.* src/main.* src/App.*\n\n# Search for a concept across the project\ngrep -r \"conceptName\" src/ --include=\"*.ts\" -l\n\n# Read a specific file section\ncat -n src/path/to/file.ts | head -60\n```\n"
  },
  {
    "id": "prompt-engineering",
    "title": "Prompt Engineering",
    "description": "Guide users in writing, improving, evaluating, and tuning prompts for LLMs across factual, creative, structured, grounded, coding, safety-sensitive, and production scenarios. Trigger: writing, improving, evaluating, or tuning prompts for LLMs.",
    "tags": [
      "prompting",
      "llm",
      "workflow",
      "quality"
    ],
    "sourcePath": "catalog/skills/prompt-engineering/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-05-09",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Added portable prompt-engineering guidance from NotebookLLM source material; improves reusable prompt design, tuning, and evaluation workflows; affects catalog skill routing and prompt quality support",
      "auto-invoke": "Writing, improving, evaluating, or tuning prompts for LLMs",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "Task"
      ]
    },
    "files": [
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "evaluation-checklist.md",
            "type": "file"
          },
          {
            "name": "prompt-templates.md",
            "type": "file"
          },
          {
            "name": "scenario-recipes.md",
            "type": "file"
          }
        ]
      },
      {
        "name": "references",
        "type": "dir",
        "children": [
          {
            "name": "notebookllm",
            "type": "dir"
          },
          {
            "name": "notebookllm-source-map.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"prompt-engineering\"\ndescription: \"Guide users in writing, improving, evaluating, and tuning prompts for LLMs across factual, creative, structured, grounded, coding, safety-sensitive, and production scenarios. Trigger: writing, improving, evaluating, or tuning prompts for LLMs.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-05-09\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Added portable prompt-engineering guidance from NotebookLLM source material; improves reusable prompt design, tuning, and evaluation workflows; affects catalog skill routing and prompt quality support\"\n  auto-invoke: \"Writing, improving, evaluating, or tuning prompts for LLMs\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"Task\"\n---\n# Prompt Engineering Guide\n\n## When to Use\n\nUse this skill when:\n\n- A user wants to write, improve, debug, or compare prompts for an LLM.\n- The task needs a prompt strategy for a scenario such as Q&A, ideation, extraction, RAG, coding, safety review, or agent/tool use.\n- The user needs decoding or output controls such as temperature, top-p, top-k, max tokens, stop sequences, or repetition penalties.\n- Prompt quality needs evaluation through tests, rubrics, structured validation, self-evaluation, or red-team cases.\n\nDo not use this skill for:\n\n- General project implementation where prompt design is incidental.\n- Provider-specific current model recommendations unless the user asks and current sources can be verified.\n- Replacing safety, legal, medical, financial, or compliance review with prompt wording alone.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Build the Prompt Contract First\n\nEvery strong prompt should make the contract explicit:\n\n| Component | Purpose |\n| --- | --- |\n| Role | Sets useful expertise and voice without vague \"expert\" framing. |\n| Task | Names the single primary outcome. |\n| Context | Supplies only relevant facts, data, sources, or constraints. |\n| Constraints | Defines length, tone, exclusions, evidence rules, and missing-data policy. |\n| Examples | Shows desired input -> output behavior when style or format matters. |\n| Output | Specifies schema, sections, table columns, or final answer boundary. |\n| Evaluation | States how success will be judged or validated. |\n\nDefault missing-data rule:\n\n```text\nIf required information is missing, say \"insufficient data\" or return null.\nDo not infer or invent facts.\n```\n\n### Pattern 2: Choose the Lightest Strategy That Fits\n\n| Scenario | Recommended strategy |\n| --- | --- |\n| Simple, standard task | Zero-shot with explicit format and length. |\n| Style, label, or schema consistency matters | One-shot or few-shot examples. |\n| Context-grounded answer or RAG | Contextual prompting with delimiters and \"use only context.\" |\n| Principle-heavy planning or critique | Step-back prompting, then apply the criteria. |\n| Math, logic, or multi-step reasoning | Bounded reasoning with a clear final answer contract. |\n| Hard reasoning where one path may fail | Self-consistency with multiple samples and vote/verify. |\n| Exploration or planning with many possible paths | Tree of Thoughts with breadth, depth, and scoring limits. |\n| Tool or external-data workflow | ReAct-style Thought/Action/Observation/Final boundaries. |\n| Safety, bias, or policy risk | Debiasing instructions, red-team cases, fallback text, and low randomness. |\n\n### Pattern 3: Tune Parameters by Risk and Goal\n\n| Goal | Starting controls |\n| --- | --- |\n| Factual Q&A, classification, code, compliance | `temperature=0.0-0.3`, lower `top_p`, no repetition penalties. |\n| General explanations, summaries, UX copy | `temperature=0.4-0.6`, `top_p=0.8-0.95`, mild penalties only if repetitive. |\n| Creative ideation, slogans, fiction, brainstorming | `temperature=0.8-1.0`, `top_p=0.9-1.0`, higher `top_k`, generate multiple candidates. |\n| Structured JSON, code, legal/medical terminology | Keep penalties at `0.0`; use schema/function calling or validation. |\n\nRules:\n\n- `max_tokens` caps output; it does not make writing concise.\n- Stop sequences define clean boundaries; keep a rare sentinel as a finish line.\n- Tune one primary knob at a time, usually temperature or top-p.\n- Model/provider choice should be based on durable traits: context length, cost, latency, modality, tool support, deployment constraints, safety posture, and instruction-following reliability.\n\n### Pattern 4: Validate, Repair, and Version Prompts\n\nUse this loop:\n\n```text\nDraft prompt -> run examples -> inspect failures -> refine prompt/params -> validate -> version\n```\n\nFor production prompts:\n\n- Add golden tests for schema, sections, length, and expected decisions.\n- Validate structured outputs with JSON Schema, Zod, Pydantic, regex, or equivalent parsers.\n- Use a rubric judge or self-evaluation pass when quality cannot be checked mechanically.\n- Add red-team and debiasing cases when prompts touch safety, sensitive attributes, tools, PII, or policy.\n- Track prompt version, model, parameters, metrics, known failures, and rationale.\n\n---\n\n## Decision Tree\n\n```text\nIs the task simple and low risk?\n  YES -> Use zero-shot with role, task, format, and length.\n\nDoes the output need exact structure or style?\n  YES -> Use few-shot examples plus schema/JSON/tool mode and validation.\n\nMust the answer use only supplied facts?\n  YES -> Delimit context, say \"use only context\", define missing-data behavior.\n\nDoes the task require reasoning or design tradeoffs?\n  YES -> Use step-back first; add bounded reasoning or ToT only if needed.\n\nDoes the model need tools or current external data?\n  YES -> Use ReAct boundaries, allowed tools, observations, and final-answer stop.\n\nCould bias, unsafe content, prompt injection, PII, or tool abuse matter?\n  YES -> Add safety/debiasing rules, red-team tests, low randomness, and fallback.\n\nOtherwise\n  -> Use the general prompt template and evaluate one or two outputs.\n```\n\n---\n\n## Prompt Patterns\n\n### General Prompt Skeleton\n\n```text\nSystem: You are a <ROLE> writing for <AUDIENCE>.\n\nTask: <ONE-SENTENCE GOAL>.\n\nContext:\n<<<CONTEXT>>>\n<relevant facts or data>\n<<<END_CONTEXT>>>\n\nConstraints:\n- Format: <FORMAT>\n- Length: <= <LIMIT>\n- Tone: <TONE>\n- Use only the supplied context when factual grounding is required.\n- If unknown, output null or \"insufficient data\"; do not invent.\n\nOutput:\n<schema, sections, table columns, or final answer boundary>\n```\n\n### Structured Output Contract\n\n```text\nReturn ONLY valid JSON. No prose, no markdown, no code fences.\nIf a value is unknown, use null. Do not infer missing data.\n\nSchema:\n<TYPE OR JSON SCHEMA>\n\nInput:\n<<<DATA>>>\n...\n<<<END_DATA>>>\n```\n\n### Evaluation Prompt\n\n```text\nEvaluate the candidate against the rubric. Be strict and concise.\nReturn ONLY JSON:\n{\n  \"valid\": true,\n  \"scores\": {\"fidelity\": 1, \"grounding\": 1, \"format\": 1},\n  \"violations\": [],\n  \"repair_plan\": \"\"\n}\n\nRubric:\n- Fidelity: follows the task exactly.\n- Grounding: uses only supplied context.\n- Format: matches the requested contract.\n\nCandidate:\n<<<ANSWER>>>\n...\n<<<END_ANSWER>>>\n```\n\n---\n\n## Resources\n\n- Prompt templates: [assets/prompt-templates.md](assets/prompt-templates.md)\n- Scenario recipes: [assets/scenario-recipes.md](assets/scenario-recipes.md)\n- Evaluation checklist: [assets/evaluation-checklist.md](assets/evaluation-checklist.md)\n- NotebookLLM source map: [references/notebookllm-source-map.md](references/notebookllm-source-map.md)\n"
  },
  {
    "id": "react-guidelines",
    "title": "React Guidelines",
    "description": "Guide React and Next.js code generation, review, and performance tuning using latest stable React verification and modern framework best practices. Trigger: generating, reviewing, refactoring, or optimizing React code artifacts in React projects.",
    "tags": [
      "react",
      "frontend",
      "workflow",
      "best-practices"
    ],
    "sourcePath": "catalog/skills/react-guidelines/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-05-01",
      "license": "Apache-2.0",
      "version": "1.1.0",
      "changelog": "Added curated Vercel-style React and Next.js performance review guidance with a dedicated performance-reviewer mode; improves async, bundle, server, client data, and rendering optimization coverage; affects react-guidelines routing, review checklists, and catalog discovery",
      "auto-invoke": "Generating, reviewing, refactoring, or optimizing React code artifacts in React projects",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "WebFetch",
        "WebSearch",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "agents",
        "type": "dir",
        "children": [
          {
            "name": "component-creator.md",
            "type": "file"
          },
          {
            "name": "performance-reviewer.md",
            "type": "file"
          },
          {
            "name": "react-tester.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"react-guidelines\"\ndescription: \"Guide React and Next.js code generation, review, and performance tuning using latest stable React verification and modern framework best practices. Trigger: generating, reviewing, refactoring, or optimizing React code artifacts in React projects.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-05-01\"\n  license: \"Apache-2.0\"\n  version: \"1.1.0\"\n  changelog: \"Added curated Vercel-style React and Next.js performance review guidance with a dedicated performance-reviewer mode; improves async, bundle, server, client data, and rendering optimization coverage; affects react-guidelines routing, review checklists, and catalog discovery\"\n  auto-invoke: \"Generating, reviewing, refactoring, or optimizing React code artifacts in React projects\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"WebFetch\"\n    - \"WebSearch\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# React Guidelines\n\n## When to Use\n\nUse this skill when:\n\n- You are generating React components, hooks, or supporting modules.\n- You are refactoring existing React code to current framework patterns.\n- You are reviewing React code quality and framework-alignment in a React workspace.\n- You are optimizing React or Next.js behavior around async work, bundle size, data fetching, server/client boundaries, or rendering cost.\n\nDo not use this skill for:\n\n- Non-React frontend stacks (Angular, Vue, Svelte, or framework-agnostic UI tasks).\n- Deep architecture decisions outside code artifact generation/review scope.\n- Pure test-strategy design unrelated to React implementation details.\n\n---\n\n## Routing Map\n\nChoose sub-agents by intent:\n\n| Intent | Sub-agent |\n| --- | --- |\n| Create, refactor, or review React components | [agents/component-creator.md](agents/component-creator.md) |\n| Write or review React tests | [agents/react-tester.md](agents/react-tester.md) |\n| Optimize or review React/Next.js performance | [agents/performance-reviewer.md](agents/performance-reviewer.md) |\n\n---\n\n## Standard Execution Sequence\n\n1. Run latest stable React preflight checks.\n2. Route to the smallest matching sub-agent by task intent.\n3. If the request mentions performance, Next.js, data fetching, server/client boundaries, bundles, or re-renders, include the performance priority checklist.\n4. Apply the sub-agent checklist before finalizing generated code or review output.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Latest Stable React Preflight (Mandatory)\n\nBefore generating or changing React code:\n\n1. Check the latest stable React release:\n   `npm view react version`\n2. Check the project's installed or declared React version:\n   `npm ls react` or inspect `package.json`.\n3. Verify release alignment using official version documentation:\n   `https://react.dev/versions`\n4. If versions diverge, generate content for latest stable APIs and call out upgrade steps.\n\nNever hardcode a specific React major/minor as the default baseline.\n\n### Pattern 2: Modern React Defaults for New Code\n\nUse these defaults unless project constraints explicitly prevent them:\n\n| Area | Default |\n| --- | --- |\n| Component model | Function components with pure render logic |\n| State + derivation | `useState`/`useReducer` + derived values without redundant state |\n| Reuse | Composition and custom hooks over inheritance |\n| Boundaries | Apply `'use client'` or `'use server'` only where required |\n| Rendering patterns | Suspense-ready async boundaries where applicable |\n| Debug/profiling | StrictMode-safe behavior and optional Profiler instrumentation |\n\n### Pattern 3: Hook and Purity Guardrails\n\n- Follow Rules of Hooks consistently.\n- Keep Components and Hooks pure.\n- Avoid unnecessary Effects; prefer deriving values in render when possible.\n- Keep state minimal and colocated near usage.\n- For component-specific work, apply [agents/component-creator.md](agents/component-creator.md).\n- For testing-specific work, apply [agents/react-tester.md](agents/react-tester.md).\n- For performance-specific work, apply [agents/performance-reviewer.md](agents/performance-reviewer.md).\n\n### Pattern 4: Performance Review Priority\n\nUse this Vercel-style priority order for React and Next.js performance review. Start with the highest-impact item that applies to the request; do not add complexity for hypothetical bottlenecks.\n\n| Priority | Review Focus | Default Action |\n| --- | --- | --- |\n| 1 | Eliminating waterfalls | Start independent promises early, defer awaits until values are needed, and use `Promise.all` for independent async work. |\n| 2 | Bundle size optimization | Avoid problematic barrel imports unless tooling optimizes them, dynamically import heavy or client-only modules, and defer third-party libraries. |\n| 3 | Server-side performance | Authenticate server actions, avoid shared request state, minimize client-component serialization, and use per-request dedupe where applicable. |\n| 4 | Client-side data fetching | Dedupe repeated requests, keep global listeners passive and cleaned up, and keep browser storage minimal and versioned. |\n| 5 | Re-render optimization | Derive state during render, avoid redundant state, keep non-primitive defaults stable, and memoize only when it removes measured churn. |\n| 6 | Rendering performance | Split expensive work, place Suspense boundaries around meaningful async UI, and use transitions/deferred values for user-visible responsiveness. |\n| 7 | JavaScript performance | Keep hot-path work small, avoid repeated parsing or allocation in render paths, and prefer platform APIs over bulky helpers where practical. |\n| 8 | Advanced patterns | Use virtualization, streaming, caching, or compiler-aware patterns only when the project stack and bottleneck justify them. |\n\n---\n\n## Decision Tree\n\n```text\nIs this a React project (react dependency present)?\n  NO  -> Do not apply this skill\n  YES -> Continue\n\nIs this a create/generate task?\n  YES -> Run latest stable preflight, then generate with modern defaults\n  NO  -> Continue\n\nIs this a refactor task?\n  YES -> Preserve behavior, migrate incrementally to modern React patterns\n  NO  -> Continue\n\nIs this a review task?\n  YES -> Validate latest-stable alignment + hook/purity/performance checklist\n  NO  -> Apply the minimal React guidance needed for the request\n\nDoes the task mention performance, Next.js, data fetching, bundles, RSC, or re-renders?\n  YES -> Route through performance-reviewer before finalizing\n  NO  -> Keep the existing component/test route\n```\n\n---\n\n## Code Examples\n\n### Example 1: Pure Function Component with Derived State\n\n```tsx\nimport { useMemo, useState } from \"react\";\n\ntype CounterBadgeProps = {\n  label: string;\n};\n\nexport function CounterBadge({ label }: CounterBadgeProps) {\n  const [count, setCount] = useState(0);\n  const isNonZero = useMemo(() => count > 0, [count]);\n\n  return (\n    <button type=\"button\" onClick={() => setCount((value) => value + 1)}>\n      {label}: {count} {isNonZero ? \"active\" : \"idle\"}\n    </button>\n  );\n}\n```\n\n### Example 2: Server/Client Boundary Split\n\n```tsx\n// app/user-panel.tsx\nimport { UserPanelClient } from \"./user-panel-client\";\n\nexport default async function UserPanel() {\n  const user = await fetch(\"/api/user\").then((r) => r.json());\n  return <UserPanelClient name={user.name} />;\n}\n\n// app/user-panel-client.tsx\n\"use client\";\n\nexport function UserPanelClient({ name }: { name: string }) {\n  return <p>Hello, {name}</p>;\n}\n```\n\n---\n\n## Review Checklist\n\n- Latest stable React preflight was completed before code generation/refactor.\n- New artifacts use function-first, composition-first patterns.\n- Hooks follow call-order rules and purity constraints.\n- `'use client'`/`'use server'` directives are only used where boundary semantics require them.\n- Suspense/StrictMode/Profiler guidance is considered when relevant to behavior.\n- Performance work follows the priority order from waterfalls through advanced patterns and avoids speculative optimization.\n\n---\n\n## Commands\n\n```bash\n# Latest stable React version\nnpm view react version\n\n# Workspace React version\nnpm ls react\n\n# Build catalog index\nnpm run build\n\n# Sync catalog README table\nnpm run catalog:sync\n\n# Validate catalog manifests and files\nnpm run catalog:check\n```\n\n---\n\n## Resources\n\n- React reference: https://react.dev/reference/react\n- React Hooks reference: https://react.dev/reference/react/hooks\n- React Components reference: https://react.dev/reference/react/components\n- React APIs reference: https://react.dev/reference/react/apis\n- React Server Components directives: https://react.dev/reference/rsc/directives\n- React versions: https://react.dev/versions\n- Rules of Hooks: https://react.dev/reference/rules/rules-of-hooks\n- Components and Hooks must be pure: https://react.dev/reference/rules/components-and-hooks-must-be-pure\n- Suspense: https://react.dev/reference/react/Suspense\n- StrictMode: https://react.dev/reference/react/StrictMode\n- Fragment: https://react.dev/reference/react/Fragment\n- Profiler: https://react.dev/reference/react/Profiler\n- Vercel Labs React best practices skill: https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices\n"
  },
  {
    "id": "review-rangers",
    "title": "Review Rangers",
    "description": "Review code, decisions, and artifacts through a multi-perspective committee and a domain expert safety guard, then synthesize a structured verdict.",
    "tags": [
      "core",
      "workflow",
      "review",
      "quality"
    ],
    "sourcePath": "catalog/skills/review-rangers/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-04-26",
      "license": "Apache-2.0",
      "version": "1.1.0",
      "changelog": "Added DECISIONS.md registry ownership guidance; preserves durable review insights and anti-slop decisions across sessions; affects review-rangers workflow, install scaffolding, and project memory usage",
      "auto-invoke": "Reviewing code, decisions, or artifacts where adversarial multi-perspective evaluation adds value",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Grep",
        "Glob",
        "Bash",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "committee-member-template.md",
            "type": "file"
          },
          {
            "name": "safety-guard-template.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"review-rangers\"\ndescription: \"Review code, decisions, and artifacts through a multi-perspective committee and a domain expert safety guard, then synthesize a structured verdict.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-04-26\"\n  license: \"Apache-2.0\"\n  version: \"1.1.0\"\n  changelog: \"Added DECISIONS.md registry ownership guidance; preserves durable review insights and anti-slop decisions across sessions; affects review-rangers workflow, install scaffolding, and project memory usage\"\n  auto-invoke: \"Reviewing code, decisions, or artifacts where adversarial multi-perspective evaluation adds value\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Grep\"\n    - \"Glob\"\n    - \"Bash\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# Review Rangers Guide\n\n## When to Use\n\nUse this skill when:\n\n- A code change, architecture decision, or artifact carries meaningful risk.\n- A single reviewer perspective is likely to miss domain-specific edge cases.\n- You need a structured verdict, not an opinion.\n- Pull requests, API designs, security decisions, or data models require adversarial scrutiny.\n\nDo not use this skill for:\n\n- Trivial single-file edits with no systemic impact.\n- Tasks already covered by a domain-specific automated linter or test suite.\n- Reviews where committee overhead exceeds the risk of getting it wrong.\n\n---\n\n## Core Workflow\n\n1. Identify the target (code, decision, artifact) and its domain.\n2. Read `.ai/DECISIONS.md` if it exists. Treat it as project memory for avoiding repeated mistakes and reusing documented decisions.\n3. Determine committee size: 3 members for routine reviews, 5 for high-risk or cross-domain targets.\n4. Spawn N committee members using `assets/committee-member-template.md`. Assign each a distinct evaluation lens. Run them independently — no member sees another's output.\n5. Determine the expert domain for the safety guard.\n6. Spawn 1 safety guard using `assets/safety-guard-template.md`. It evaluates the target from an authoritative expert position.\n7. Run the committee and safety guard in parallel.\n8. Collect all outputs.\n9. Synthesize a structured verdict following the Synthesis Rules.\n10. Emit the final verdict with confidence tier, top findings, and recommended action.\n11. Decide whether any insight qualifies for `.ai/DECISIONS.md`; if yes, update the registry and its changelog in the same edit.\n\n---\n\n## Committee Protocol\n\n### Size\n\n| Target Risk | Committee Size |\n| ----------- | -------------- |\n| Routine (single concern) | 3 members |\n| High-risk or cross-domain | 5 members |\n\n### Lens Assignment\n\nAssign lenses based on what is being reviewed. Examples:\n\n| Domain | Possible Lenses |\n| ------ | --------------- |\n| Code change | Security, Performance, Maintainability, Testability, UX impact |\n| Architecture decision | Scalability, Operational risk, Developer experience, Cost, Data integrity |\n| API design | Consumer ergonomics, Contract stability, Security, Versioning, Documentation |\n| Data model | Normalization, Query performance, Migration safety, Privacy, Extensibility |\n\nNever assign the same lens to two committee members. Each member evaluates independently — no member sees another's prompt or output during evaluation.\n\n### Independence Rules\n\n- Spawn committee members in parallel.\n- Pass only the target artifact and the member's assigned lens as context.\n- Do not share intermediate findings between members before synthesis.\n\n---\n\n## Safety Guard Protocol\n\n### Domain Resolution\n\nDetermine the expert domain from the target:\n\n```text\nTarget is code?               -> Domain is the language + ecosystem (e.g., \"TypeScript + Node.js security\")\nTarget is architecture?       -> Domain is the system archetype (e.g., \"distributed systems reliability\")\nTarget is a decision?         -> Domain is the function it affects (e.g., \"data privacy compliance\")\nTarget is an API?             -> Domain is the protocol + consumer context (e.g., \"REST API design for web clients\")\nTarget is unclear?            -> Ask before spawning\n```\n\n### Specialization\n\nThe safety guard:\n\n- Operates as an authoritative expert, not a peer reviewer.\n- Evaluates the target for correctness, safety, and conformance to domain standards.\n- Raises blockers, not suggestions. If the safety guard finds a structural flaw, it is a hard finding.\n- Runs in parallel with the committee, not after it.\n\n---\n\n## Synthesis Rules\n\n### Confidence Tiers\n\n| Tier | Condition | Recommended Action |\n| ---- | --------- | ------------------ |\n| HIGH | Safety guard passes + committee majority agrees | Approve with noted caveats |\n| MEDIUM | Safety guard passes + committee is split | Approve after addressing split findings |\n| LOW | Safety guard raises a blocker OR committee majority flags risk | Block — require remediation before approval |\n| VETO | Safety guard raises a structural flaw | Hard block — do not proceed |\n\n### Contradiction Handling\n\n- Safety guard findings override committee findings on correctness and safety.\n- When committee members contradict each other, count lenses: majority rules unless a minority finding is a security or data-integrity concern.\n- A single security or data-integrity finding from any voice is sufficient for LOW or VETO tier.\n\n### Verdict Structure\n\nEmit exactly this structure:\n\n```text\nCONFIDENCE: {HIGH | MEDIUM | LOW | VETO}\n\nSUMMARY:\n{1–2 sentences on the overall state of the target}\n\nTOP FINDINGS:\n1. [{Voice}] {Finding} — {Severity: Info | Warning | Blocker}\n2. [{Voice}] {Finding} — {Severity: Info | Warning | Blocker}\n...\n\nRECOMMENDED ACTION:\n{Approve | Approve with caveats | Block — remediate before resubmit | Hard block}\n```\n\n---\n\n## Decisions Registry Protocol\n\n`review-rangers` owns `.ai/DECISIONS.md` maintenance when the registry exists. Use it as both:\n\n- A documentary source before solving or reviewing relevant problems.\n- A durable memory target after review when a finding has future value.\n\n### Read Rules\n\n- Read `.ai/DECISIONS.md` near the start of relevant review or problem-solving work.\n- Apply documented decisions and \"avoid repeating\" notes as project constraints.\n- If the file does not exist, continue the review without creating it unless the current task is installation or explicit registry setup.\n\n### Write Criteria\n\nWrite to `.ai/DECISIONS.md` only for:\n\n- Breaking changes.\n- Mid-interest or high-interest solutions.\n- Architectural decisions.\n- Repeated issue patterns.\n- Project-specific conventions likely to matter in future sessions.\n\nDo not write entries for minimal cleanup, obvious one-off bugs, insignificant changes, local-only implementation details, or full review transcripts.\n\n### Write Format\n\nInsert new entries above the final `## Changelog` section so the changelog remains the last section.\n\n```md\n## YYYY-MM-DD - Short Decision Title\n\n- Interest level: Mid | High | Breaking\n- Context:\n- Decision / Insight:\n- Rationale:\n- Avoid repeating:\n- Source:\n```\n\nEvery change to `.ai/DECISIONS.md` must update `## Changelog` in the same edit.\n\n```md\n- YYYY-MM-DD: Created/updated entry \"<title>\" because <why>.\n```\n\nIf the changelog section is missing, add it as the final section before making any other registry change.\n\n---\n\n## Decision Tree\n\n```text\nIs there a safety guard blocker?\n  YES -> VETO — hard block regardless of committee output\n\nDoes the safety guard pass?\n  YES -> evaluate committee output\n\nDo 3+ of 5 committee members (or 2+ of 3) flag a risk?\n  YES -> LOW — block and require remediation\n  NO  -> continue\n\nDoes any committee member flag a security or data-integrity risk?\n  YES -> LOW at minimum — escalate to safety guard if not already covered\n\nDoes committee majority agree the target is sound?\n  YES and safety guard passes -> HIGH or MEDIUM depending on split\n  NO                          -> LOW\n```\n\n---\n\n## Commands\n\n```bash\n# Reference committee member template when constructing agent prompts\ncat .skilly-hand/catalog/review-rangers/assets/committee-member-template.md\n\n# Reference safety guard template when constructing agent prompts\ncat .skilly-hand/catalog/review-rangers/assets/safety-guard-template.md\n```\n\n---\n\n## Resources\n\n- Committee member prompt template: [assets/committee-member-template.md](assets/committee-member-template.md)\n- Safety guard prompt template: [assets/safety-guard-template.md](assets/safety-guard-template.md)\n"
  },
  {
    "id": "roaster",
    "title": "Roaster",
    "description": "Challenge plans with constructive roast-style critique that exposes weak assumptions, missing angles, shallow sequencing, and unclear success criteria. Trigger: when the user proposes, requests, or evaluates a plan of any kind.",
    "tags": [
      "core",
      "workflow",
      "planning",
      "quality"
    ],
    "sourcePath": "catalog/skills/roaster/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-04-27",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Added roaster planning challenge skill; improves plan quality by forcing constructive skepticism before agreement; affects planning critique workflows and auto-invoke routing",
      "auto-invoke": "When the user proposes, requests, or evaluates a plan of any kind",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "Task"
      ]
    },
    "files": [],
    "content": "---\nname: \"roaster\"\ndescription: \"Challenge plans with constructive roast-style critique that exposes weak assumptions, missing angles, shallow sequencing, and unclear success criteria. Trigger: when the user proposes, requests, or evaluates a plan of any kind.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-04-27\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Added roaster planning challenge skill; improves plan quality by forcing constructive skepticism before agreement; affects planning critique workflows and auto-invoke routing\"\n  auto-invoke: \"When the user proposes, requests, or evaluates a plan of any kind\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"Task\"\n---\n# Roaster Guide\n\n## When to Use\n\nUse this skill when:\n\n- The user proposes, requests, or evaluates a plan.\n- A plan sounds under-specified, too agreeable, or too easy.\n- The user needs stronger assumptions, sharper scope, or better sequencing.\n- The work would benefit from a skeptical partner before execution.\n\nDo not use this skill for:\n\n- Emergencies where speed matters more than critique.\n- Trivial one-step tasks with no meaningful planning surface.\n- Sensitive emotional, medical, legal, or crisis conversations where roast tone would be inappropriate.\n- Personal attacks, identity jokes, humiliation, slurs, or cruelty.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Challenge First, Agree Second\n\nDefault posture:\n\n```text\nDo not start with \"yes, you are right.\"\nFirst identify the weakest part of the plan.\nThen acknowledge what works, if anything works.\nEnd with a stronger version of the plan or the questions needed to make one.\n```\n\nThe target is the plan, not the person. Roast the gap between ambition and current rigor.\n\n### Pattern 2: Constructive Roast Boundaries\n\nAllowed:\n\n- Witty, direct critique of vague goals, missing constraints, shallow sequencing, or lazy acceptance criteria.\n- High standards, pointed questions, and clear pushback.\n- Humor that helps the user think harder.\n\nNot allowed:\n\n- Insults about intelligence, identity, background, appearance, worth, or mental health.\n- Discriminatory, sexual, threatening, or demeaning language.\n- Sarcasm that leaves the user with no actionable next step.\n\n### Pattern 3: Full-Angle Critique\n\nCheck every real plan against these angles:\n\n| Angle | Challenge |\n| --- | --- |\n| Goal | Is the outcome specific enough to judge success? |\n| Assumptions | What is being treated as true without evidence? |\n| Stakeholders | Who is affected, blocked, or missing from the plan? |\n| Scope | What is included, excluded, and dangerously implied? |\n| Risks | What can fail technically, socially, financially, or operationally? |\n| Sequencing | Are steps ordered by dependency, learning value, and risk reduction? |\n| Alternatives | Is there a simpler, more complete, or more durable path? |\n| Verification | How will the user prove the result is good enough? |\n\n### Pattern 4: Escalate With Stakes\n\nUse light critique for small plans. Escalate to deeper challenge when the plan affects:\n\n- Architecture or long-term maintainability.\n- Security, privacy, or safety.\n- Delivery timelines, money, reputation, or users.\n- Irreversible decisions or broad organizational impact.\n\n---\n\n## Response Format\n\nUse this structure by default:\n\n```text\nVerdict: {short judgment}\n\nRoast: {constructive jab at the weakest part}\n\nBlind Spots:\n- {missing angle}\n- {missing angle}\n\nUpgrade:\n- {specific improvement}\n- {specific improvement}\n\nQuestions:\n- {question that materially improves the plan}\n```\n\nKeep it compact unless the plan is high-risk or the user asks for a deeper review.\n\n---\n\n## Decision Tree\n\n```text\nIs this a plan or planning request?              -> Use roaster\nIs it trivial and one-step?                      -> Skip or give one-line challenge\nDoes it affect high-stakes outcomes?             -> Deep critique across all angles\nIs the user asking for validation only?          -> Challenge before validating\nIs roast tone unsafe for the situation?          -> Switch to firm, compassionate critique\nOtherwise                                       -> Constructive roast with actionable upgrade\n```\n\n---\n\n## Examples\n\n### Example 1: Vague Product Plan\n\n```text\nVerdict: Promising, but currently held together with vibes and hope.\n\nRoast: \"Launch the feature\" is not a plan; it is a calendar event wearing a fake mustache.\n\nBlind Spots:\n- No target user or success metric.\n- No rollback or support path.\n\nUpgrade:\n- Define the primary user, the measurable outcome, and the smallest launch slice.\n- Add one validation step before build and one verification step after release.\n\nQuestions:\n- What evidence would prove this is worth building before you spend the full effort?\n```\n\n### Example 2: Technical Refactor Plan\n\n```text\nVerdict: The direction is reasonable, but the blast radius is undercooked.\n\nRoast: \"Refactor the service\" is how regressions enter the room wearing a nice jacket.\n\nBlind Spots:\n- No compatibility strategy for existing callers.\n- No test boundary around current behavior.\n\nUpgrade:\n- Capture current behavior with focused tests before changing internals.\n- Refactor behind the existing public interface first, then evaluate API changes separately.\n\nQuestions:\n- Which behavior must remain identical after the refactor?\n```\n\n---\n\n## Commands\n\n```bash\nrg -n \"plan|proposal|roadmap|strategy|approach\" .\nrg -n \"success criteria|acceptance criteria|risks|assumptions\" .\n```\n"
  },
  {
    "id": "spec-driven-development",
    "title": "Spec-Driven Development",
    "description": "Plan, execute, and verify multi-step work through versioned specs with small, testable tasks. Trigger: planning or executing feature work, bug fixes, and multi-phase implementation.",
    "tags": [
      "core",
      "workflow",
      "planning"
    ],
    "sourcePath": "catalog/skills/spec-driven-development/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-06-20",
      "license": "Apache-2.0",
      "version": "1.1.0",
      "changelog": "Added a portable SDD lifecycle with capability-based routing, task evidence, change control, and archive invariants; prevents fixed tool dependencies and duplicated task state; affects planning, apply, verify, orchestrate, and spec templates",
      "auto-invoke": "Planning or executing feature work, bug fixes, and multi-phase implementation",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "agents",
        "type": "dir",
        "children": [
          {
            "name": "apply.md",
            "type": "file"
          },
          {
            "name": "orchestrate.md",
            "type": "file"
          },
          {
            "name": "plan.md",
            "type": "file"
          },
          {
            "name": "verify.md",
            "type": "file"
          }
        ]
      },
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "delta-spec-template.md",
            "type": "file"
          },
          {
            "name": "design-template.md",
            "type": "file"
          },
          {
            "name": "spec-template.md",
            "type": "file"
          },
          {
            "name": "validation-checklist.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"spec-driven-development\"\ndescription: \"Plan, execute, and verify multi-step work through versioned specs with small, testable tasks. Trigger: planning or executing feature work, bug fixes, and multi-phase implementation.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-06-20\"\n  license: \"Apache-2.0\"\n  version: \"1.1.0\"\n  changelog: \"Added a portable SDD lifecycle with capability-based routing, task evidence, change control, and archive invariants; prevents fixed tool dependencies and duplicated task state; affects planning, apply, verify, orchestrate, and spec templates\"\n  auto-invoke: \"Planning or executing feature work, bug fixes, and multi-phase implementation\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# Spec-Driven Development Guide\n\n## When to Use\n\nUse this skill when work spans multiple steps, requirements need written boundaries, or progress must survive across contributors or sessions.\n\nSkip it for trivial edits, urgent recovery work, and tasks with no meaningful verification path.\n\n## Portable Contract\n\nThe workflow MUST remain executable with this skill alone.\n\n- Treat integrations as optional capabilities, never required product names.\n- Discover available tools, commands, and repository conventions before selecting them.\n- When a capability is unavailable, use a local structured fallback or record a blocker.\n- Keep requirements, tasks, progress, evidence, and changes in `spec.md` as the single source of truth.\n- Do not create a second task list that can drift from the spec.\n\n## Lifecycle\n\n```text\nDRAFT -> APPROVED -> IN_PROGRESS -> VERIFYING -> COMPLETE -> ARCHIVED\n             |             |            |\n             +----------> BLOCKED <------+\n```\n\nRules:\n\n1. Planning creates or updates `.sdd/active/<work-name>/spec.md`.\n2. Implementation begins after the approval policy is satisfied.\n3. Only one task should normally be `IN_PROGRESS` at a time.\n4. A task becomes `DONE` only after its verify step passes and evidence is recorded.\n5. Changed requirements return affected tasks to planning before implementation continues.\n6. Archive only after feature validation passes and no task remains open or blocked.\n\nValid task states: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.\n\n## Approval Policy\n\nUse an explicit human checkpoint when the user requests one, requirements remain ambiguous, risk is material, or the next action is difficult to reverse. Otherwise, a documented self-review may satisfy approval.\n\nRecord the chosen approval policy in the spec. Do not assume every environment supports interactive checkpoints.\n\n## Spec Structure\n\nA practical spec contains:\n\n- `Why`: problem and value.\n- `What`: concrete, testable deliverable.\n- `Constraints`: enforceable `MUST`, `SHOULD`, `MAY`, and `MUST NOT` statements.\n- `Out of Scope`: explicit boundaries.\n- `Current State`: verified context and integration points.\n- `Approval Policy`: checkpoint or self-review rule.\n- `Tasks`: small units with scenarios, capabilities, files, verify steps, and done definitions.\n- `Progress`: task state and evidence.\n- `Validation`: end-to-end checks.\n- `Change Log`: requirement or scope changes that affect execution.\n\n### Task Contract\n\nEach task MUST define:\n\n```markdown\n### T1: Title\n\n**What:** Observable outcome.\n**Required Capabilities:** Semantic needs, or `none`.\n**Files:** Expected scope, or `discover` when not yet known.\n**Scenario:** GIVEN / WHEN / THEN, when behavior is involved.\n**Verify:** Project-discovered command or concrete manual check.\n**Done:** One sentence describing completion.\n```\n\nCapabilities describe needs such as test design, accessibility review, or security analysis. They MUST NOT require a particular skill, agent, vendor, or service. Resolve them against what is actually available at execution time.\n\n## Full vs Delta Spec\n\nUse a full spec for new work without an existing requirement baseline. Use a delta spec for changes to established behavior.\n\n- `ADDED`: new requirement and scenarios.\n- `MODIFIED`: complete replacement requirement plus previous behavior reference.\n- `REMOVED`: removed requirement plus reason.\n\nBefore archiving a delta, reconcile it with the maintained requirement baseline when one exists. If no baseline exists, archive the delta as the historical record.\n\n## Task Sizing\n\nPrefer tasks that:\n\n- Have one observable outcome.\n- Touch a small, related file set.\n- Can be completed without hidden dependencies.\n- Have a fast, deterministic verify step.\n- Have a one-sentence definition of done.\n\nSplit a task when its concerns, dependencies, or verification cannot be explained independently. File counts and time estimates are heuristics, not universal gates.\n\n## Change Control\n\nWhen requirements change during execution:\n\n1. Stop the affected task at a stable point.\n2. Record the change and reason in `Change Log`.\n3. Update affected constraints, scenarios, tasks, and validation.\n4. Mark invalidated evidence as superseded.\n5. Reapply the approval policy before continuing.\n\nDo not silently stretch a task to absorb new behavior.\n\n## Verification and Review\n\nVerification checks behavior against the spec, not against implementation intent.\n\n- Run every task verify step using project-discovered commands.\n- Check every `MUST` and `MUST NOT` constraint explicitly.\n- Separate automated evidence, manual evidence, warnings, and blockers.\n- Perform a final structured review using an available review capability or the fallback checklist in `agents/verify.md`.\n- A missing optional integration is not a failure when the local fallback was completed.\n\n## Archive Invariants\n\nArchive to `.sdd/archive/<YYYY-MM-DD>-<work-name>/` only when:\n\n- All tasks are `DONE`.\n- Validation passes or approved manual checks are recorded.\n- No blocker is unresolved.\n- Constraint and final-review evidence is present.\n- Delta reconciliation is complete when applicable.\n\nGenerate the ISO date from the current environment; do not assume a particular shell command or VCS.\n\n## Modes\n\n- Planning: [agents/plan.md](agents/plan.md)\n- Implementation: [agents/apply.md](agents/apply.md)\n- Verification: [agents/verify.md](agents/verify.md)\n- Orchestration: [agents/orchestrate.md](agents/orchestrate.md)\n\n## Templates\n\n- Full spec: [assets/spec-template.md](assets/spec-template.md)\n- Delta spec: [assets/delta-spec-template.md](assets/delta-spec-template.md)\n- Design decisions: [assets/design-template.md](assets/design-template.md)\n- Validation checklist: [assets/validation-checklist.md](assets/validation-checklist.md)\n"
  },
  {
    "id": "test-driven-development",
    "title": "Test-Driven Development",
    "description": "Guide implementation through evidence-based RED, GREEN, and REFACTOR cycles without assuming a language, framework, or test runner. Trigger: implementing testable behavior or reproducing a regression with tests first.",
    "tags": [
      "testing",
      "workflow",
      "quality",
      "core"
    ],
    "sourcePath": "catalog/skills/test-driven-development/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-06-20",
      "license": "Apache-2.0",
      "version": "1.1.0",
      "changelog": "Rebuilt TDD guidance around portable cycle evidence, expected RED failures, behavior-preserving refactors, and project-discovered test conventions; prevents framework assumptions and untested behavior during refactor; affects core workflow, examples, and verification guidance",
      "auto-invoke": "Implementing testable behavior or reproducing a regression with tests first",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash"
      ]
    },
    "files": [
      {
        "name": "assets",
        "type": "dir",
        "children": [
          {
            "name": "tdd-cycle.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"test-driven-development\"\ndescription: \"Guide implementation through evidence-based RED, GREEN, and REFACTOR cycles without assuming a language, framework, or test runner. Trigger: implementing testable behavior or reproducing a regression with tests first.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-06-20\"\n  license: \"Apache-2.0\"\n  version: \"1.1.0\"\n  changelog: \"Rebuilt TDD guidance around portable cycle evidence, expected RED failures, behavior-preserving refactors, and project-discovered test conventions; prevents framework assumptions and untested behavior during refactor; affects core workflow, examples, and verification guidance\"\n  auto-invoke: \"Implementing testable behavior or reproducing a regression with tests first\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n---\n# Test-Driven Development Guide\n\n## When to Use\n\nUse TDD when desired behavior can be expressed before implementation, when fixing a reproducible regression, or when changing logic that benefits from a tight feedback loop.\n\nDo not force TDD onto exploratory spikes, generated artifacts, environment-only setup, or behavior that cannot be observed reliably. Time-box exploration, discard or isolate spike code, then begin TDD once an interface is understood.\n\n## Portable Contract\n\n- Discover the project's language, test runner, commands, naming, and file placement before writing tests.\n- Prefer existing project conventions over examples in this skill.\n- Do not require a framework, package manager, assertion library, coverage tool, or external service.\n- If no runnable test harness exists, record the blocker or establish the smallest project-appropriate harness as separately approved work.\n\n## The Cycle\n\n### 1. Understand\n\nDefine one observable behavior and choose the lowest test level that can prove it without hiding important integration risk.\n\n### 2. RED\n\nWrite a test before production behavior changes, then run it.\n\nA valid RED requires:\n\n- The new or changed test fails.\n- The failure is caused by the missing or incorrect target behavior.\n- The failure message or observation is understood.\n- Unrelated failures are separated from the cycle.\n\nIf the test already passes, do not weaken it or write implementation blindly. Determine whether the behavior already exists, the assertion observes the wrong thing, or the test setup bypasses the relevant path.\n\n### 3. GREEN\n\nImplement the smallest behavior that makes the RED test pass. Run the focused test, then the smallest relevant regression set.\n\nDo not add speculative validation, configuration, interfaces, or error cases that the current behavior does not require.\n\n### 4. REFACTOR\n\nImprove structure while preserving observable behavior. Keep tests green after each meaningful change.\n\nAllowed examples include renaming, removing duplication, simplifying control flow, or extracting an internal helper. Adding a new output, error case, persistence rule, side effect, or public option is not refactoring; start another RED cycle for it.\n\n### 5. Record Evidence\n\nCapture enough evidence to reproduce the cycle:\n\n```text\nBehavior: <one observable outcome>\nRED: <command/check> -> FAIL because <expected reason>\nGREEN: <command/check> -> PASS\nREFACTOR: <command/check> -> PASS | NOT_NEEDED\nRegression: <relevant suite/check> -> PASS | NOT_RUN with reason\n```\n\n## Test Scope Selection\n\n| Need | Prefer |\n| --- | --- |\n| Pure logic or narrow rule | Unit test |\n| Collaboration between local modules | Integration test |\n| Boundary with a stable external contract | Contract test or boundary integration test |\n| User-visible workflow across the system | End-to-end test |\n| Existing behavior with unclear intent | Characterization test before change |\n\nUse the lowest level that proves the behavior, but do not mock away the boundary where the defect or risk lives. A task may need more than one level when risks differ.\n\n## Test Design Rules\n\n- One behavioral reason to fail per test. Multiple assertions are acceptable when they describe one outcome.\n- Use the project's preferred structure, such as Given/When/Then or Arrange/Act/Assert.\n- Assert observable results rather than private implementation details.\n- Keep setup focused and make test data reveal intent.\n- Test meaningful boundaries and error behavior, not every syntactic branch.\n- A regression test must fail on the faulty baseline and pass after the fix.\n\n## Test Doubles\n\nUse fakes, stubs, spies, or mocks only when they make the test faster, deterministic, or able to isolate an owned boundary.\n\n- Prefer simple state-based assertions over interaction assertions.\n- Verify interactions when the interaction itself is the contract.\n- Do not mock the unit under test.\n- Avoid reproducing complex third-party behavior in hand-written mocks.\n- Keep at least one integration check when a mocked boundary carries material compatibility risk.\n\n## Async and Determinism\n\n- Prefer controllable clocks, schedulers, events, and in-memory boundaries over real delays or network calls.\n- Await observable completion; do not let assertions run after the test finishes.\n- Remove order dependence and shared mutable state.\n- Treat flaky tests as defects. Diagnose timing, isolation, and lifecycle issues instead of adding blind retries.\n\n## Coverage\n\nCoverage shows what executed, not whether behavior was specified well.\n\n- Respect thresholds already configured by the project.\n- Use uncovered critical behavior to guide new scenarios.\n- Do not invent a universal percentage.\n- Never add low-value assertions solely to increase a metric.\n\n## Bug-Fix Cycle\n\n1. Reproduce the defect at the lowest useful level.\n2. Confirm the test fails for the reported reason.\n3. Apply the smallest correction.\n4. Confirm the regression test and relevant existing tests pass.\n5. Refactor only after the correction is protected.\n\n## Decision Tree\n\n```text\nCan the behavior be observed reliably?\n  NO  -> clarify the interface or isolate exploration first\n  YES -> choose the lowest useful test level\n\nDoes the new test fail for the expected reason?\n  NO, it passes          -> inspect baseline, assertion, and setup\n  NO, unrelated failure  -> fix or isolate the test environment\n  YES                    -> implement minimum GREEN behavior\n\nDid implementation add behavior not demanded by the test?\n  YES -> remove it or start a new RED cycle\n  NO  -> run relevant regression checks, then refactor if useful\n```\n\n## Resources\n\n- Portable cycle examples and evidence template: [assets/tdd-cycle.md](assets/tdd-cycle.md)\n- Multi-step delivery workflow: [../spec-driven-development/SKILL.md](../spec-driven-development/SKILL.md)\n"
  },
  {
    "id": "token-optimizer",
    "title": "Token Optimizer",
    "description": "Classify task complexity and right-size reasoning depth, context gathering, and response detail to reduce wasted tokens.",
    "tags": [
      "core",
      "workflow",
      "efficiency"
    ],
    "sourcePath": "catalog/skills/token-optimizer/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-04-03",
      "license": "Apache-2.0",
      "version": "1.0.3",
      "changelog": "Migrated token-optimizer into portable catalog format with curated model-agnostic guidance; improves default reasoning and token-efficiency behavior across installs; affects skill discovery, auto-invoke routing, and install baseline",
      "auto-invoke": "Classifying task complexity and choosing reasoning depth/token budget",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "Task"
      ]
    },
    "files": [
      {
        "name": "references",
        "type": "dir",
        "children": [
          {
            "name": "complexity-indicators.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"token-optimizer\"\ndescription: \"Classify task complexity and right-size reasoning depth, context gathering, and response detail to reduce wasted tokens.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-04-03\"\n  license: \"Apache-2.0\"\n  version: \"1.0.3\"\n  changelog: \"Migrated token-optimizer into portable catalog format with curated model-agnostic guidance; improves default reasoning and token-efficiency behavior across installs; affects skill discovery, auto-invoke routing, and install baseline\"\n  auto-invoke: \"Classifying task complexity and choosing reasoning depth/token budget\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"Task\"\n---\n# Token Optimizer Guide\n\n## When to Use\n\nUse this skill when:\n\n- Starting a task and deciding the right reasoning depth.\n- Balancing response quality against speed and token budget.\n- Choosing how much context gathering is actually needed.\n- Reassessing scope when a task becomes more complex than expected.\n\nDo not use this skill for:\n\n- Cases where the user explicitly requests a fixed reasoning level.\n- Mid-task rewrites that would reset already-correct progress.\n- Emergency actions where immediate execution is the only priority.\n\n---\n\n## Critical Patterns\n\n### Pattern 1: Classify Complexity First\n\nPick a complexity tier before doing substantial work:\n\n| Tier | Typical Shape |\n| --- | --- |\n| Trivial | Single lookup, deterministic answer, no ambiguity |\n| Simple | 2-3 clear steps, minimal context, low risk |\n| Moderate | Multiple files or decisions, some trade-offs |\n| Complex | Broad impact, cross-cutting behavior, non-trivial edge cases |\n| Expert | Security/performance critical, architecture-level consequences |\n\n### Pattern 2: Match Effort to Complexity\n\nUse the lightest viable approach, then escalate only if needed:\n\n| Tier | Reasoning Style | Context Gathering | Response Depth |\n| --- | --- | --- | --- |\n| Trivial | None or minimal | Direct targeted read/search | 1-2 sentences |\n| Simple | Light | 1-2 focused operations | Brief factual answer |\n| Moderate | Selective | 3-5 targeted operations | Concise rationale |\n| Complex | Regular | Systematic exploration | Detailed explanation |\n| Expert | Deep | Broad investigation + explicit trade-offs | Thorough analysis |\n\n### Pattern 3: Progressive Escalation\n\nEscalate one tier when you discover:\n\n1. Hidden dependencies or wider blast radius.\n2. Conflicting constraints or unclear acceptance criteria.\n3. Additional non-functional requirements (security, performance, compatibility).\n\nDo not jump to the highest-effort tier by default.\n\n### Pattern 4: Token-Saving Defaults\n\nAlways prefer:\n\n- Batched independent reads/searches.\n- Targeted pattern matching (`rg`) before broad scans.\n- Reuse of already-collected context over repeated calls.\n- Brief outputs unless rationale materially improves decisions.\n\nAvoid:\n\n- Reading full files when a narrow section is enough.\n- Re-running identical commands without new signal.\n- Long-form explanations for straightforward checks.\n\n---\n\n## Decision Tree\n\n```text\nSingle lookup with known target?                  -> Trivial\nNeeds 2-3 clear actions and limited context?      -> Simple\nTouches multiple files or design choices?         -> Moderate\nNeeds architectural/refactor trade-offs?          -> Complex\nImpacts security/performance/core reliability?    -> Expert\n```\n\nUpgrade one tier if:\n\n- User asks to optimize, harden, or redesign.\n- Public API or user-facing behavior changes.\n- Scope expands beyond expected files/components.\n\nDowngrade one tier if:\n\n- User provides exact file paths and acceptance criteria.\n- Existing patterns make implementation mostly mechanical.\n\n---\n\n## Examples\n\n### Example 1: Trivial\n\n```text\nRequest: \"What version is in package.json?\"\nApproach: single file read, no extra reasoning, direct answer.\n```\n\n### Example 2: Simple\n\n```text\nRequest: \"Check whether alert component has tests.\"\nApproach: targeted file search, return yes/no + location.\n```\n\n### Example 3: Moderate\n\n```text\nRequest: \"Add disabled state to button component.\"\nApproach: inspect component + styles + tests, apply existing patterns, summarize key decisions.\n```\n\n### Example 4: Complex\n\n```text\nRequest: \"Refactor validation flow to support async checks.\"\nApproach: analyze architecture and compatibility constraints, propose phased changes, verify behavior end-to-end.\n```\n\n---\n\n## Commands\n\n```bash\nrg --files\nrg -n \"<pattern>\" <path>\nrg -n \"TODO|FIXME\" src\n```\n\n---\n\n## Resources\n\n- Complexity heuristics: [references/complexity-indicators.md](references/complexity-indicators.md)\n- Related planning workflow: [../spec-driven-development/SKILL.md](../spec-driven-development/SKILL.md)\n"
  },
  {
    "id": "user-story-crafting",
    "title": "User Story Crafting",
    "description": "Create and refine user stories with structured quality gates, splitting heuristics, and lightweight story mapping for release slicing. Trigger: writing, restructuring, splitting, or sequencing user stories for delivery-ready backlog work.",
    "tags": [
      "product",
      "workflow",
      "planning",
      "quality"
    ],
    "sourcePath": "catalog/skills/user-story-crafting/SKILL.md",
    "metadata": {
      "author": "skilly-hand",
      "last-edit": "2026-04-11",
      "license": "Apache-2.0",
      "version": "1.0.0",
      "changelog": "Added new user-story-crafting skill with integrated writing, structuring, splitting, and mapping agents; improves backlog quality and delivery sequencing through a unified user-story workflow; affects catalog skills, agent routing metadata, and managed AGENTS outputs",
      "auto-invoke": "Writing, restructuring, splitting, or sequencing user stories into delivery-ready backlog items",
      "allowed-tools": [
        "Read",
        "Edit",
        "Write",
        "Glob",
        "Grep",
        "Bash",
        "Task",
        "SubAgent"
      ]
    },
    "files": [
      {
        "name": "agents",
        "type": "dir",
        "children": [
          {
            "name": "story-mapper.md",
            "type": "file"
          },
          {
            "name": "story-splitter.md",
            "type": "file"
          },
          {
            "name": "story-structurer.md",
            "type": "file"
          },
          {
            "name": "story-writer.md",
            "type": "file"
          }
        ]
      }
    ],
    "content": "---\nname: \"user-story-crafting\"\ndescription: \"Create and refine user stories with structured quality gates, splitting heuristics, and lightweight story mapping for release slicing. Trigger: writing, restructuring, splitting, or sequencing user stories for delivery-ready backlog work.\"\nskillMetadata:\n  author: \"skilly-hand\"\n  last-edit: \"2026-04-11\"\n  license: \"Apache-2.0\"\n  version: \"1.0.0\"\n  changelog: \"Added new user-story-crafting skill with integrated writing, structuring, splitting, and mapping agents; improves backlog quality and delivery sequencing through a unified user-story workflow; affects catalog skills, agent routing metadata, and managed AGENTS outputs\"\n  auto-invoke: \"Writing, restructuring, splitting, or sequencing user stories into delivery-ready backlog items\"\n  allowed-tools:\n    - \"Read\"\n    - \"Edit\"\n    - \"Write\"\n    - \"Glob\"\n    - \"Grep\"\n    - \"Bash\"\n    - \"Task\"\n    - \"SubAgent\"\n---\n# User Story Crafting Guide\n\n## When to Use\n\nUse this skill when:\n\n- A backlog item needs to be written as a user-centered story.\n- A story is unclear, too technical, or missing measurable outcomes.\n- A story is too large to estimate or deliver safely in one iteration.\n- A team needs lightweight story mapping to sequence releases around user value.\n\nDo not use this skill for:\n\n- Pure engineering chores with no user outcome.\n- Architectural RFCs or deep technical design documents.\n- Sprint capacity planning unrelated to user behavior.\n\n---\n\n## Routing Map\n\n| Step | Intent | Sub-agent |\n| --- | --- | --- |\n| 1 | Draft the baseline user story and acceptance criteria | [agents/story-writer.md](agents/story-writer.md) |\n| 2 | Validate structure and quality with INVEST + anti-pattern checks | [agents/story-structurer.md](agents/story-structurer.md) |\n| 3 (if story is too large) | Split into independent, value-first increments | [agents/story-splitter.md](agents/story-splitter.md) |\n| 4 (optional) | Map activities, tasks, and release slices | [agents/story-mapper.md](agents/story-mapper.md) |\n\nAlways run step 1 and step 2. Run step 3 when any size/risk signal appears. Run step 4 when roadmap sequencing or MVP slicing is requested.\n\n---\n\n## Standard Execution Sequence\n\n1. Capture context intake: persona, goal, problem, constraints, and assumptions.\n2. Draft one baseline story in Cohn format:\n   - `As a [persona]`\n   - `I want [capability]`\n   - `So that [outcome/value]`\n3. Add testable acceptance criteria in Given/When/Then structure.\n4. Run quality checks using INVEST plus ambiguity/measurability filters.\n5. If oversized or coupled, split into smaller stories using vertical slice patterns.\n6. Optionally organize split stories into a lightweight map with release slices.\n7. Return a final artifact bundle with:\n   - Polished stories\n   - Acceptance criteria\n   - INVEST review notes\n   - Split rationale (if applied)\n   - Map-ready release structure (if applied)\n\n---\n\n## Critical Patterns\n\n### Pattern 1: User Outcome First\n\nA story is valid only when it states user value, not implementation tasks.\n\n```text\nGood: As a returning customer, I want to reuse my saved card, so that checkout is faster.\nBad: As a developer, I want to refactor payment services, so that code is cleaner.\n```\n\n### Pattern 2: Acceptance Criteria Must Be Testable\n\nEvery criterion should be observable and verifiable by behavior.\n\n```gherkin\nGiven a logged-in customer with a saved card\nWhen they choose \"Pay with saved card\"\nThen the order is submitted without re-entering card details\n```\n\n### Pattern 3: INVEST Is a Gate, Not a Suggestion\n\nBefore finalizing any story, verify:\n\n- Independent\n- Negotiable\n- Valuable\n- Estimable\n- Small\n- Testable\n\nIf two or more INVEST checks fail, do not finalize; split or rewrite first.\n\n### Pattern 4: Split by User Value, Not by System Layer\n\nPrefer vertical slices that preserve end-to-end user outcomes.\n\n```text\nGood split: Browse -> Add -> Pay (thin end-to-end slice first)\nBad split: Frontend -> Backend -> Database\n```\n\n### Pattern 5: Mapping Is Lightweight and Release-Oriented\n\nStory mapping is used to sequence value, not to model exhaustive edge-case detail up front.\n\n---\n\n## Decision Tree\n\n```text\nNeed a new story from a request?\n  -> Draft with story-writer\n\nStory written but quality unclear?\n  -> Run story-structurer\n\nStory fails Small/Estimable/Independent?\n  -> Run story-splitter\n\nNeed MVP/release sequencing?\n  -> Run story-mapper\n\nNo user value is present?\n  -> Reframe as user outcome or classify as non-story technical work item\n```\n\n---\n\n## Output Contract\n\nReturn results in this order:\n\n1. **Context Snapshot**: persona, problem, desired outcome, constraints.\n2. **Final Story Set**: one or more refined user stories.\n3. **Acceptance Criteria**: Given/When/Then per story.\n4. **Quality Review**: INVEST pass/fail + fixes applied.\n5. **Split + Map Notes**: split rationale and release slice proposal (when used).\n\n---\n\n## Example\n\n### Input\n\n```text\n\"Users abandon onboarding because setup is confusing.\"\n```\n\n### Condensed Output\n\n```text\nContext Snapshot\n- Persona: New team admin\n- Problem: Setup confusion during first session\n- Outcome: Reach first successful project setup quickly\n\nFinal Story Set\n- As a new team admin, I want a guided setup checklist, so that I can complete onboarding without guessing next steps.\n\nAcceptance Criteria\n- Given I created a new workspace\n  When I open the onboarding page\n  Then I see a checklist of setup steps in recommended order\n- Given I complete one setup step\n  When I return to onboarding\n  Then progress shows the completed step and next recommended action\n\nQuality Review\n- INVEST: Pass (all six checks)\n\nSplit + Map Notes\n- Not required for this scope\n```\n\n---\n\n## Commands\n\n```bash\n# Validate catalog metadata/frontmatter drift\nnpm run catalog:check\n\n# Apply frontmatter + README sync changes\nnpm run catalog:sync\n\n# Regenerate managed AGENTS files after catalog updates\nnpm run agentic:self:sync\n```\n"
  }
];
