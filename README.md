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
[![node](https://img.shields.io/badge/node-%E2%89%A520-black?style=flat-square)](https://nodejs.org)
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

`npx skilly-hand` opens a full-screen skilly-hand terminal UI when running in a TTY.

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
| `--classic` | Force plain text command mode and skip full-screen TUI |
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
- `frontend-design`
- `output-optimizer`
- `project-security`
- `project-teacher`
- `react-guidelines`
- `review-rangers`
- `skill-creator`
- `spec-driven-development`
- `test-driven-development`
- `token-optimizer`
- `user-story-crafting`

See [catalog/README.md](./catalog/README.md) for generated skill metadata.

---

## Release Workflow (npm)

1. Confirm session: `npm whoami` (or `npm login`).
2. Keep `CHANGELOG.md` up to date under `## [Unreleased]` as work lands.
3. Regenerate derived files when needed: `npm run build && npm run catalog:sync && npm run agentic:self:sync`.
4. Run publish gate: `npm run verify:publish`.
5. Inspect package payload: `npm pack --dry-run --json`.
6. Bump version intentionally: `npm version patch|minor|major` (this auto-rotates `CHANGELOG.md`, creates a dated release section, and inserts a version-specific npm link).
7. Publish with assisted 2FA flow: `npm run publish:otp` (or `npm run publish:next` for prereleases).
   - The script runs the publish gate, asks for OTP with hidden input, and if left blank lets npm trigger your default security method.
8. Smoke test after publish: `npx @skilly-hand/skilly-hand@<version> --help`.
9. Verify npm metadata (README render, changelog, license, executable bin).

### Security Automation

- `npm run security:check` runs repository secret/config checks plus strict dependency security checks.
- `npm run security:deps` runs strict dependency audit + outdated reporting only.
- `npm run deps:policy:check` enforces exact runtime dependency pins and lockfile sync (`package-lock.json` + `npm-shrinkwrap.json`).
- `npm run deps:update:safe -- <pkg[@version]>` is the required dependency update path; it pins exact versions, syncs shrinkwrap, and blocks completion unless all validation gates pass.
- Do not use raw `npm install` for dependency upgrades in this repo; use `deps:update:safe` so tests and security gates run before accepting version changes.
- Run `npm run setup:hooks` once per clone to install `pre-commit` (fast checks) and `pre-push` (full gate) hooks.

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
