<div align="center">

```text
 ██████╗██╗  ██╗██╗██╗     ██╗     ██╗   ██╗    ██╗  ██╗ █████╗ ███╗   ██╗██████╗
██╔════╝██║ ██╔╝██║██║     ██║     ╚██╗ ██╔╝    ██║  ██║██╔══██╗████╗  ██║██╔══██╗
╚█████╗ █████╔╝ ██║██║     ██║      ╚████╔╝     ███████║███████║██╔██╗ ██║██║  ██║
 ╚══██╗ ██╔═██╗ ██║██║     ██║       ╚██╔╝      ██╔══██║██╔══██║██║╚██╗██║██║  ██║
██████╔╝██║  ██╗██║███████╗███████╗   ██║        ██║  ██║██║  ██║██║ ╚████║██████╔╝
╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝   ╚═╝        ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝
```

**Portable AI agent skills. One CLI. Every coding assistant.**

[![npm](https://img.shields.io/npm/v/skilly-hand?style=flat-square&color=black&label=npm)](https://www.npmjs.com/package/skilly-hand)
[![license](https://img.shields.io/badge/license-CC--BY--NC--4.0-black?style=flat-square)](./LICENSE)
[![node](https://img.shields.io/badge/node-%E2%89%A520-black?style=flat-square)](https://nodejs.org)
[![ESM](https://img.shields.io/badge/ESM-native-black?style=flat-square)](https://nodejs.org/api/esm.html)

</div>

---

## What it does

- **Installs portable AI agent skills** into your project from a curated catalog
- **Auto-detects your stack** and recommends relevant skills automatically
- **Supports every major coding assistant** — Claude Code, OpenCode, Cursor, Copilot, Gemini, and Codex — from a single command
- **Preserves original agentic structures** in `source/legacy/` as a migration reference

---

## Quick Start

```bash
npm install
npx skilly-hand
```

---

## Commands

| Command | Description |
| ------- | ----------- |
| `npx skilly-hand install` | Install skills into the current project |
| `npx skilly-hand detect` | Auto-detect project stack and suggest skills |
| `npx skilly-hand list` | List all available skills in the catalog |
| `npx skilly-hand doctor` | Diagnose installation and configuration issues |
| `npx skilly-hand uninstall` | Remove installed skills |

---

## Release Workflow (npm)

1. Confirm session: `npm whoami` (or `npm login`).
2. Keep `CHANGELOG.md` up to date under `## [Unreleased]` as work lands.
3. Regenerate derived catalog files when needed: `npm run build && npm run catalog:sync`.
4. Run publish gate: `npm run verify:publish`.
5. Inspect package payload: `npm pack --dry-run --json`.
6. Bump version intentionally: `npm version patch|minor|major` (this auto-rotates `CHANGELOG.md`, creates a dated release section, and inserts a version-specific npm link).
7. Publish the root package: `npm publish` (or `npm publish --tag next` for prereleases).
8. Smoke test after publish: `npx skilly-hand@<version> --help`.
9. Verify npm metadata (README render, changelog, license, executable bin).

---

## Stack Detection

Automatic detection covers the most common Node.js stacks:

Node.js · TypeScript · React · Next.js · Angular · Vite · Playwright · Vitest · Tailwind CSS · Storybook

---

## Supported Assistants

Skills are installed into `.skilly-hand/` with the correct format for each tool:

| Tool | Install Target |
| ---- | -------------- |
| Claude Code / OpenCode | `.claude/skills/` |
| Cursor | `.cursor/skills/` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `.gemini/skills/` |
| Codex (OpenAI) | `.codex/skills/` |

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
source/legacy/
  agentic-structure/    # original material preserved as reference
tests/
  fixtures/             # simulated repos for integration testing
```

---

Licensed under [CC BY-NC 4.0](./LICENSE).
