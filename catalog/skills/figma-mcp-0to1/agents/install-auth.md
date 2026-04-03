# Install and Auth

## Goal

Get Figma MCP connected and authenticated, with a verified first tool call.

## Server Modes

| Mode | Endpoint | Recommended | Notes |
| --- | --- | --- | --- |
| Remote | `https://mcp.figma.com/mcp` | Yes | Broadest features, including write-to-canvas workflows. |
| Desktop | `http://127.0.0.1:3845/mcp` | Only for special org/enterprise needs | Requires Figma desktop app + Dev Mode desktop MCP toggle. |

## Codex Setup

### Preferred path (Figma app/plugin workflow)

- Use the Figma app path if available in your Codex client.
- Complete auth prompt flow and grant access.

### Manual Codex CLI path

```bash
codex mcp add figma --url https://mcp.figma.com/mcp
```

When prompted, authenticate the server.

## Other Common Clients (manual patterns)

- VS Code: add HTTP MCP server in `mcp.json` using the remote endpoint.
- Cursor: add MCP server in MCP settings or use its Figma plugin flow.
- Claude Code: `claude mcp add --transport http figma https://mcp.figma.com/mcp`.
- Gemini CLI: install Figma extension from `figma/mcp-server-guide`, then run auth command in CLI.

See exact snippets in [../assets/client-config-snippets.md](../assets/client-config-snippets.md).

## Verification Checklist

1. Confirm server appears in client MCP list.
2. Run a low-risk probe:
- Remote: `whoami` (recommended)
- Desktop-only contexts: `get_metadata` or `get_design_context` on a known node
3. Confirm the authenticated user has access to the target Figma file.

## First Prompt After Setup

- "Use Figma MCP `whoami` and show which account is authenticated."
- "Use Figma MCP `get_design_context` for this node URL and summarize dimensions, layout, and variables."

## Notes

- If tools do not appear, restart MCP client session and retry authentication.
- If permissions fail, verify file sharing and plan seat alignment before retry.
