<div align="center">

# AI Agent Skills

Patrones específicos del dominio para asistentes de IA · Domain-specific patterns for AI coding assistants

</div>

---

<!-- AI_SECTION_START: The following English section is maintained for AI agent consumption. Do not remove. -->

> [!NOTE]
> **For AI agents**: This directory contains **Agent Skills** following the [Agent Skills open standard](https://agentskills.io). Skills provide domain-specific patterns, conventions, and guardrails that help AI coding assistants understand project-specific requirements.

<!-- AI_SECTION_END -->

---

## ¿Qué son los Skills? / What Are Skills?

[Agent Skills](https://agentskills.io) es un formato de estándar abierto para extender las capacidades de agentes de IA con conocimiento especializado, originalmente desarrollado por Anthropic.

An open standard format for extending AI agents with specialized knowledge. When an AI loads a skill, it gains:

- **Critical rules** — what to always / never do
- **Code patterns** — project-specific conventions
- **Workflows** — step-by-step task guidance
- **References** — pointers to detailed documentation

---

## Setup / Configuración

```bash
./skills/setup.sh            # Modo interactivo / Interactive mode
./skills/setup.sh --all      # Configurar todos los asistentes / All assistants
./skills/setup.sh --claude   # Solo Claude Code / Claude Code only
```

> [!TIP]
> Después de ejecutar el setup, reiniciá tu asistente de IA para cargar los skills.
> After running setup, restart your AI assistant to load the skills.

| Herramienta / Tool | Symlink creado | Config copiada |
| ------------------ | -------------- | -------------- |
| Claude Code / OpenCode | `.claude/skills/` | `AGENTS.md` → `CLAUDE.md` |
| Codex (OpenAI) | `.codex/skills/` | Usa `AGENTS.md` nativamente |
| GitHub Copilot | — | `AGENTS.md` → `.github/copilot-instructions.md` |
| Gemini CLI | `.gemini/skills/` | `AGENTS.md` → `GEMINI.md` |

---

## Unsetup / Limpieza

```bash
./skills/unsetup.sh          # Modo interactivo / Interactive mode
./skills/unsetup.sh --all    # Revertir todos / All assistants
./skills/unsetup.sh --claude # Solo Claude Code / Claude Code only
```

Este script elimina symlinks, archivos de configuración copiados y restaura backups si existen.
This script removes symlinks, copied config files, and restores backups where available.

---

## Cómo usar los Skills / How to Use Skills

Los skills son descubiertos automáticamente por el agente de IA. Para cargar uno manualmente:
Skills are auto-discovered by the AI agent. To load one manually during a session:

```text
Read skills/{skill-name}/SKILL.md
```

---

## Skills Disponibles / Available Skills

### Genéricos / Generic Skills

Patrones reutilizables para tecnologías comunes · Reusable patterns for common technologies:

| Skill | Descripción / Description |
| ----- | ------------------------- |
| `agentic-benchmark` | Audits any repository's agentic structure and generates a standardized benchmark report across 10 dimensions. Reusable across any project type or stack. |
| `angular-20` | Base guidelines for Angular 20.3+ code: signals, deferrable views, standalone components, referencing official Angular sources. |
| `css-modules` | Conventions for scoped CSS using CSS Modules, including pure CSS principles and attribute selectors. |
| `ds-researcher` | Design System researcher: searches trusted DS sources, flags unverified content, synthesizes sourced answers about components, tokens, accessibility, and governance. |
| `token-optimizer` | Guides AI models to match reasoning depth and token usage to task complexity, recommending appropriate model tiers and thinking strategies. |

---

### Específicos de ScannLab / ScannLab-Specific Skills

Patrones adaptados para el ScannLab Design System · Adapted patterns for the ScannLab Design System:

| Skill | Descripción / Description |
| ----- | ------------------------- |
| `scannlab-a11y-checker` | Checks Angular component accessibility against W3C WCAG 2.2 official standards. |
| `scannlab-best-practices` | Angular and TypeScript coding best practices for ScannLab Design System components. |
| `scannlab-code-connect` | Maps Figma components and variants to ScannLab Angular Code Connect files and Dev Mode snippets. |
| `scannlab-figma-extractor` | Extracts comprehensive layer and node information from Figma links using the Figma MCP Server. Foundational skill for token matching and Code Connect mapping. |
| `scannlab-run-commands` | Guide on running each stage of the ScannLab Design System project: dev, storybook, tests, lint, build. |
| `scannlab-storybook` | Generates Storybook stories (`.stories.ts`) for Angular components in the ScannLab Design System. |
| `scannlab-token-validation` | Unified token validation skill. Phase 1 (`agents/figma-matcher.md`): maps raw Figma values to tokens. Phase 2 (`agents/css-auditor.md`): finds hard-coded values in CSS and guides replacements. |
| `scannlab-unit-test` | Unit and integration testing for Angular components, directives, and services using Vitest. Covers TestBed setup, zoneless change detection, signal bindings, and behavioral testing patterns. |
| `scannlab-playwright` | End-to-end visual regression and behavior testing for ScannLab Angular components using Playwright against Storybook. Covers screenshot baselines, keyboard navigation, hover/focus/disabled state testing, and agentic QA via Playwright MCP. |

---

### Meta Skills

| Skill | Descripción / Description |
| ----- | ------------------------- |
| `agents-sync` | Syncs `AGENTS.md` content to AI convention files (`CLAUDE.md`, `GEMINI.md`, `copilot-instructions.md`). |
| `claude-agent-creator` | Creates Claude sub-agent files (`.md`) inside `.claude/agents/` following the official Claude sub-agent spec. |
| `commit-guardian` | Runs scoped advisory quality gates (lint, tests, coverage, build, Storybook) and produces structured go/no-go reports with AI failure analysis. |
| `commit-writer` | Analyzes local changes and drafts detailed commit messages explaining what changed, why, and where. Recommends SemVer impact without taking any versioning action. |
| `memory-curator` | Guides Claude on writing versioned, durable memory entries using the extended frontmatter spec. Enforces `MEMORY.md` index compaction below 150 lines. |
| `po-design-system` | Acts as Product Owner with deep expertise in Design Systems. Writes and structures Jira issue descriptions for the ScannLab / Scanntech team. |
| `pr-writer` | Analyzes code changes and drafts compelling PR titles, descriptions, and metadata explaining what changed, why, and where. |
| `scannlab-agents-subfolder` | Creates `AGENTS.md` files for specific project subfolders to optimize AI task recognition at component level. |
| `skill-creator` | Creates new AI agent skills following the Agent Skills spec. |
| `skill-sync` | Syncs skill metadata from `skills/*/SKILL.md` into `AGENTS.md` and `skills/README.md` tables. |
| `skill-test` | Validates other skills for structural integrity and semantic correctness. Three modes: structural validation, metadata auto-update, and AI semantic review. |
| `scannlab-sdd` | Spec-driven development framework for ScannLab Design System. Guides structured spec creation, task decomposition, and atomic execution. |

---

## Estructura del Directorio / Directory Structure

```text
skills/
├── {skill-name}/
│   ├── SKILL.md              # Required — main instructions and metadata
│   ├── scripts/              # Optional — executable code
│   ├── assets/               # Optional — templates, schemas, resources
│   └── references/           # Optional — links to local documentation
├── setup.sh                  # Setup script for AI tool compatibility
└── README.md                 # This file
```

---

## Auto-invoke

**Problema / Problem**: AI assistants don't reliably auto-invoke skills even when the `Trigger:` matches the user's request — they treat skill suggestions as background noise.

**Solución / Solution**: `AGENTS.md` files contain an **Auto-invoke Skills** section that forces the AI to load specific skills when performing certain actions. This is a [known workaround](https://scottspence.com/posts/claude-code-skills-dont-auto-activate).

To regenerate Auto-invoke tables after creating or modifying a skill:

```bash
./skills/skill-sync/assets/sync.sh
```

---

## Crear Nuevos Skills / Creating New Skills

```
Read skills/skill-creator/SKILL.md
```

### Checklist rápido / Quick Checklist

1. Create directory: `skills/{skill-name}/`
2. Add `SKILL.md` with required frontmatter
3. Add `metadata.scope` and `metadata.auto_invoke` fields
4. Keep content concise — under 500 lines
5. Reference existing documentation instead of duplicating
6. Run `./skills/skill-sync/assets/sync.sh` to update `AGENTS.md`

---

## Principios de Diseño / Design Principles

> **Concise** — Only include what the AI doesn't already know.
> **Progressive disclosure** — Point to detailed docs, don't duplicate them.
> **Critical rules first** — Lead with ALWAYS/NEVER patterns.
> **Minimal examples** — Show patterns, not tutorials.

---

## Recursos / Resources

- [Agent Skills Standard](https://agentskills.io) — Open standard specification
- [Agent Skills GitHub](https://github.com/anthropics/skills) — Example skills
- [Claude Code Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) — Skill authoring guide
- [ScannLab AGENTS.md](../AGENTS.md) — General AI agent rules
