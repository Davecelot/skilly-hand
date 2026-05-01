# Install and Auth

## Goal

Get Figma MCP connected and authenticated, with a verified first tool call.

## Server Modes

| Mode | Endpoint | Recommended | Notes |
| --- | --- | --- | --- |
| Remote | `https://mcp.figma.com/mcp` | Yes | Broadest feature coverage, including write-to-canvas, code-to-canvas, diagrams, and file creation. |
| Desktop | `http://127.0.0.1:3845/mcp` | Only for local selection-based or special org needs | Requires Figma desktop app + Dev Mode desktop MCP toggle; narrower workflow coverage. |

## Codex Setup

### Preferred path (Figma app/plugin workflow)

- Use the Figma app path if available in your Codex client.
- Complete auth prompt flow and grant access.

### Manual Codex CLI path

```bash
codex mcp add figma --url https://mcp.figma.com/mcp
```

When prompted, authenticate the server.

## Other Supported Client Paths

Use concrete setup paths for agents that are both Figma-supported and skilly-hand-supported:

- Claude Code plugin: `claude plugin install figma@claude-plugins-official`
- Claude Code manual remote: `claude mcp add --transport http figma https://mcp.figma.com/mcp`
- Claude Code user-scope remote: `claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp`
- Claude Code manual desktop: `claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp`
- Cursor plugin: `/add-plugin figma`
- Cursor manual: add the remote or desktop endpoint in MCP settings.
- Copilot: use the VS Code MCP route and enable GitHub Copilot in the client.
- VS Code: add HTTP MCP server in `mcp.json` using the remote endpoint.

See exact snippets in [../assets/client-config-snippets.md](../assets/client-config-snippets.md).

## Agent Coverage Notes

| Coverage | Agents or Clients | Guidance |
| --- | --- | --- |
| Figma-supported and skilly-hand-supported | `codex`, `claude`, `cursor`, `copilot` | Use the commands and setup paths above. |
| Figma-supported but not skilly-hand-native | VS Code, Warp, Augment, Factory, Firebender | Follow Figma/client setup docs; do not assume skilly-hand skill install paths. |
| skilly-hand-supported but not source-backed in current Figma docs | `gemini`, `antigravity`, `windsurf`, `trae` | Keep install support, but verify Figma MCP setup through that client's docs or manual MCP config. |

## Verification Checklist

1. Confirm server appears in client MCP list.
2. Run a low-risk probe:
- Remote: `whoami` (recommended)
- Desktop-only contexts: `get_metadata` or `get_design_context` on a known node
3. Confirm the authenticated user has access to the target Figma file.
4. For write workflows, confirm the authenticated seat can edit the target file.

## First Prompt After Setup

- "Use Figma MCP `whoami` and show which account is authenticated."
- "Use Figma MCP `get_design_context` for this node URL and summarize dimensions, layout, and variables."
- "Using this Figma file URL, inspect the current libraries before creating anything new."

## Notes

- If tools do not appear, restart MCP client session and retry authentication.
- If permissions fail, verify file sharing and plan seat alignment before retry.
- If a client does not expose an official tool, check the active tool list before changing the workflow.
