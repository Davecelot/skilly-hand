---
name: "figma-mcp-0to1"
description: "Guide users from Figma MCP installation and authentication through first canvas creation, with function-level tool coverage and operational recovery patterns."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-05-09"
  license: "Apache-2.0"
  version: "1.0.3"
  changelog: "Updated Figma MCP guidance for current remote-first docs, supported-client coverage, Figma-provided skills, FigJam write workflows, code-to-canvas support, and access/rate-limit language; affects setup routing, tool selection, prompt assets, and official matrix"
  auto-invoke: "Installing, configuring, or using Figma MCP from setup through first canvas creation"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "WebFetch"
    - "WebSearch"
    - "Task"
    - "SubAgent"
---
# Figma MCP 0-to-1 Guide

## When to Use

Use this skill when:

- You need to set up Figma MCP from scratch.
- You need a reliable path from connection to first successful canvas output.
- You need to choose the right Figma MCP function for a task.
- You need operational recovery for permission, auth, tool-loading, or rate-limit failures.
- You need to understand which skilly-hand agents overlap with Figma-supported MCP clients.

Do not use this skill for:

- Generic frontend implementation that does not require Figma MCP.
- One-off code-only tasks with no design context.
- Legacy repository-specific Figma pipelines that already define their own strict workflow.

---

## Routing Map

Choose subskills by intent:

| Intent | Subskill |
| --- | --- |
| Install and authenticate MCP connection | [agents/install-auth.md](agents/install-auth.md) |
| Select exact function/tool and expected inputs | [agents/tool-function-catalog.md](agents/tool-function-catalog.md) |
| Create first canvas output safely | [agents/canvas-creation-playbook.md](agents/canvas-creation-playbook.md) |
| Recover from errors, limits, or drift | [agents/troubleshooting-ops.md](agents/troubleshooting-ops.md) |

---

## Standard Execution Sequence

1. Set up server transport and authentication.
2. Verify connectivity with a low-risk call (`whoami` on remote, or a read tool).
3. Select the smallest tool that solves the immediate task.
4. For writes, inspect existing file/design-system context before creating new content.
5. Run creation in short, validated steps (avoid large one-shot requests).
6. If anything fails, use troubleshooting flow before retrying.

---

## Core Rules

- Prefer remote server for broadest feature coverage, write workflows, code-to-canvas, and FigJam agent workflows.
- Treat official Figma MCP docs as the source of truth for official tools, supported clients, permissions, and limits.
- Keep client-specific helpers separate from official Figma MCP tools.
- Treat write actions as staged operations, not a single large operation.
- Use link-based node targeting for reliable design-context extraction.
- Keep a clear distinction between read context tools and write/canvas tools.
- For repeated team workflows, reuse prompts and config snippets from `assets/`, and prefer Figma-provided skills when they exist.
- Use `figma-use` with `use_figma` for Figma Design writes and `figma-use-figjam` for FigJam writes when those skills are available.

---

## Agent Coverage

Figma MCP support and skilly-hand installation support are related but not identical:

| Coverage | Agents or Clients | Guidance |
| --- | --- | --- |
| Figma-supported and skilly-hand-supported | `codex`, `claude`, `cursor`, `copilot`, `gemini` | Include concrete setup paths when Figma publishes them; otherwise point to client docs/catalog. |
| Figma-supported but not skilly-hand-native | Amazon Q, Android Studio, VS Code, Warp, Augment, Factory, Firebender, Kiro, OpenHands, Replit | Mention as Figma-supported clients, but do not add skilly-hand install assumptions. |
| skilly-hand-supported but not source-backed in current Figma docs | `antigravity`, `windsurf`, `trae` | Keep broad `agentSupport`; document that Figma-specific setup may require client documentation or manual MCP config. |

## Figma-Provided Skills

Prefer Figma-provided skills for workflows they cover:

| Skill | Use |
| --- | --- |
| `figma-use` | Foundational Figma Design write-to-canvas workflow for frames, components, variables, styles, and auto layout. |
| `figma-use-figjam` | Foundational FigJam write workflow for boards, stickies, sections, connectors, shapes, tables, and code blocks. |
| `figma-create-new-file` | Create blank Figma Design or FigJam files before writing. |
| `figma-implement-design` | Generate production code from a Figma design URL. |
| `figma-code-connect-components` | Map published Figma components to code implementations. |
| `figma-create-design-system-rules` | Generate reusable code-generation rules for a project. |
| `figma-generate-library` | Example workflow for creating or syncing a Figma design-system library from code. |
| `figma-generate-design` | Example workflow for building screens/views in Figma from code or a design-system-aware brief. |

---

## Key References

- Full function matrix: [references/official-tools-matrix.md](references/official-tools-matrix.md)
- Client setup snippets: [assets/client-config-snippets.md](assets/client-config-snippets.md)
- Prompt starters: [assets/prompt-recipes.md](assets/prompt-recipes.md)

---

## Commands

```bash
# Codex CLI (manual remote setup)
codex mcp add figma --url https://mcp.figma.com/mcp

# Claude Code plugin setup
claude plugin install figma@claude-plugins-official

# Claude Code manual remote setup
claude mcp add --transport http figma https://mcp.figma.com/mcp

# Claude Code manual remote setup, user scope
claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp

# Claude Code manual desktop setup
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp

# Cursor plugin setup
/add-plugin figma

# Gemini CLI
# Follow the Figma MCP catalog/client instructions for the Gemini CLI extension.

# Verify catalog integrity in this repository
npm run catalog:check
```
