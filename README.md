<div align="center">

```text
 ██████╗██╗  ██╗██╗██╗     ██╗     ██╗   ██╗    ██╗  ██╗ █████╗ ███╗   ██╗██████╗
██╔════╝██║ ██╔╝██║██║     ██║     ╚██╗ ██╔╝    ██║  ██║██╔══██╗████╗  ██║██╔══██╗
╚█████╗ █████╔╝ ██║██║     ██║      ╚████╔╝     ███████║███████║██╔██╗ ██║██║  ██║
 ╚══██╗ ██╔═██╗ ██║██║     ██║       ╚██╔╝      ██╔══██║██╔══██║██║╚██╗██║██║  ██║
██████╔╝██║  ██╗██║███████╗███████╗   ██║       ██║  ██║██║  ██║██║ ╚████║██████╔╝
╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝   ╚═╝       ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝
```

**Portable AI agent skills. One CLI. Every coding assistant.**

[![npm](https://img.shields.io/npm/v/%40skilly-hand%2Fskilly-hand?style=flat-square&color=black&label=npm)](https://www.npmjs.com/package/@skilly-hand/skilly-hand)
[![license](https://img.shields.io/badge/license-CC--BY--NC--4.0-black?style=flat-square)](./LICENSE)
[![node](https://img.shields.io/badge/node-%E2%89%A522-black?style=flat-square)](https://nodejs.org)
[![ESM](https://img.shields.io/badge/ESM-native-black?style=flat-square)](https://nodejs.org/api/esm.html)

</div>

---

## What it does

- **Installs portable AI agent skills** into your project from a curated catalog
- **Auto-detects your stack** and recommends relevant skills automatically
- **Supports every major coding assistant** — Claude Code, OpenCode, Cursor, Copilot, Gemini, Codex, Antigravity, Windsurf, and TRAE — from a single command
- **Ships a curated core skill set** including orchestration, SDD workflow, and Figma MCP onboarding
- **Preserves original agentic structures** in `source/legacy/` as a migration reference

---

## Quick Start

```bash
npx skilly-hand
```

`npx skilly-hand` opens an interactive prompt workflow when running in a TTY.
The guided home supports type-to-filter command discovery and includes a built-in Command Guide.

### Install on skills.sh

The full skill catalog is also discoverable through the [skills.sh](https://www.skills.sh/) ecosystem:

```bash
npx skills add Davecelot/skilly-hand --skill '*'
```

Use `npx skills add Davecelot/skilly-hand --list` to inspect the available skills before installing. The `skills/` directory is a GitHub-facing overlay made of symlinks to `catalog/skills/`; it helps skills.sh discover the catalog without changing the regular `npx skilly-hand` npm package contents or CLI flow.

Windows contributors who clone the repo locally should enable symlink support before checkout, for example with `git config --global core.symlinks true`, and may also need Developer Mode or elevated symlink privileges. If the repo was already checked out without symlinks, re-check out or reclone after enabling support.

---

## Commands

| Command | Description |
| ------- | ----------- |
| `npx skilly-hand install` | Install skills into the current project |
| `npx skilly-hand detect` | Auto-detect project stack and suggest skills |
| `npx skilly-hand list` | List all available skills in the catalog |
| `npx skilly-hand doctor` | Diagnose installation and configuration issues |
| `npx skilly-hand uninstall` | Remove installed skills |

### Common Flags

| Flag | Description |
| ---- | ----------- |
| `--json` | Emit machine-readable output and disable interactive prompts |
| `--classic` | Deprecated compatibility flag that keeps plain command mode (launcher disabled) |
| `--yes`, `-y` | Skip confirmation prompts for mutating commands (`install`, `uninstall`) |
| `--dry-run` | Preview install plan without writing files |
| `--agent`, `-a <name>` | Target a specific assistant (repeatable; e.g. `--agent claude --agent cursor`) |
| `--include <tag>` | Only include skills matching the given tag |
| `--exclude <tag>` | Exclude skills matching the given tag |
| `--cwd <path>` | Run as if in a different directory |

---

## Current Portable Catalog

The catalog currently includes:

- `accessibility-audit`
- `agents-root-orchestrator`
- `angular-guidelines`
- `figma-mcp-0to1`
- `forge-me-a-skill`
- `frontend-design`
- `gsap-animation`
- `motion-animation`
- `output-optimizer`
- `project-security`
- `project-teacher`
- `prompt-engineering`
- `react-guidelines`
- `review-rangers`
- `roaster`
- `spec-driven-development`
- `test-driven-development`
- `token-optimizer`
- `user-story-crafting`

See [catalog/README.md](./catalog/README.md) for generated skill metadata.

---

Maintainer release and security workflow: [docs/MAINTAINER.md](./docs/MAINTAINER.md).

---

## Stack Detection

Automatic detection covers the most common Node.js stacks:

Node.js · TypeScript · React · Next.js · Angular · Vite · Playwright · Vitest · Tailwind CSS · Storybook

---

## Supported Assistants

Skills are installed into `.skilly-hand/` with the correct format for each tool:

| Tool | Install Target |
| ---- | -------------- |
| Antigravity | `.agents/skills/`, `.agent/skills/` (compat), `.agents/rules/skilly-hand.md`, `AGENTS.md` |
| Claude Code / OpenCode | `.claude/skills/` |
| Cursor | `.cursor/skills/` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `.gemini/skills/` |
| Codex (OpenAI) | `.codex/skills/` |
| Windsurf | `.windsurf/skills/`, `AGENTS.md` |
| TRAE | `.trae/skills/`, `AGENTS.md` |

---

## Project Structure

```text
catalog/
  skills/               # portable skill catalog published by the CLI
packages/
  cli/                  # main binary
  core/                 # installation, rendering, and restore logic
  detectors/            # stack auto-detection
  catalog/              # catalog access and validation
```

---

Licensed under [CC BY-NC 4.0](./LICENSE).
