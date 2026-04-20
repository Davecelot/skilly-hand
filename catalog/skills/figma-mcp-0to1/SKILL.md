---
name: "figma-mcp-0to1"
description: "Guide users from Figma MCP installation and authentication through first canvas creation, with function-level tool coverage and operational recovery patterns."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-04-03"
  license: "Apache-2.0"
  version: "1.0.1"
  changelog: "Added allowed-modes metadata to declare figma-mcp-0to1 sub-agent routing targets; improves discoverability of install-auth, tool-function-catalog, canvas-creation-playbook, and troubleshooting-ops delegation modes; affects figma-mcp-0to1 manifest metadata"
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
4. Run creation in short, validated steps (avoid large one-shot requests).
5. If anything fails, use troubleshooting flow before retrying.

---

## Core Rules

- Prefer remote server for broadest feature coverage and write workflows.
- Treat write actions as staged operations, not a single large operation.
- Use link-based node targeting for reliable design-context extraction.
- Keep a clear distinction between read context tools and write/canvas tools.
- For repeated team workflows, reuse prompts and config snippets from `assets/`.

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

# Verify catalog integrity in this repository
npm run catalog:check
```
