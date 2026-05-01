# Official Figma MCP Tools Matrix (As of 2026-05-01)

This matrix tracks the official Figma MCP tool/function set in current Figma documentation. Treat it as the source of truth for official tool names, supported file types, and remote-only status. Client-specific helpers are listed separately.

## Coverage Matrix

| Tool | Primary Purpose | Typical Input | Supported File Types | Availability Notes |
| --- | --- | --- | --- | --- |
| `generate_figma_design` | Generate editable design layers from live web UI | URL/local app capture context | Figma Design output | Remote-only; select clients only; can output to new file, existing file, or clipboard; exempt from standard read limits. |
| `get_design_context` | Fetch rich design context for implementation | Figma URL or `fileKey` + `nodeId` | Figma Design, Figma Make | Read tool; remote server requires link-based node targeting; desktop can use selection-based prompts. |
| `get_variable_defs` | Retrieve variable/token definitions | `fileKey` + `nodeId` | Figma Design | Best for token-only extraction. |
| `get_code_connect_map` | Read existing Code Connect mappings | `fileKey` + `nodeId` | Figma Design | Use to inspect mapping before updates. |
| `add_code_connect_map` | Add mapping from node to code component | `fileKey`, `nodeId`, source details | Figma Design | Write-style utility; exempt from read rate limits in docs. |
| `get_screenshot` | Render node screenshot for visual verification | `fileKey` + `nodeId` | Figma Design, FigJam | Useful verification after write steps and for preserving visual fidelity. |
| `create_design_system_rules` | Generate design-system rules prompt/scaffold | Framework/language context | No file context required | Use to enforce repeatable design-system workflows. |
| `get_metadata` | Sparse XML structure (ids, names, hierarchy, bounds) | Selection or `fileKey` + `nodeId` | Figma Design | Preferred preflight for large contexts. |
| `get_figjam` | Fetch FigJam metadata (and node visuals) | `fileKey` + `nodeId` | FigJam | FigJam-specific extraction. |
| `generate_diagram` | Create FigJam diagram from Mermaid or natural language intent | Diagram description or Mermaid syntax | No file context required | Remote-only; supports flowchart, gantt, state, sequence, architecture, and ERD workflows. |
| `whoami` | Show authenticated Figma identity, plans, and seat types | None | No file context required | Remote-only in official docs; exempt from read rate limits. |
| `get_code_connect_suggestions` | Suggest candidate node-to-code mappings | File context + repo context | Figma Design | Usually part of Code Connect workflows. |
| `send_code_connect_mappings` | Confirm/persist mapping suggestions | Suggestions payload | Figma Design | Follow-up action after suggestion generation. |
| `use_figma` | General-purpose write/edit/delete/inspect via Plugin API workflow | Task instructions and file context | Figma Design, FigJam | Remote-only; default direct write/update path; best used with the `figma-use` skill when available. |
| `search_design_system` | Search libraries for components, variables, styles | Query text and optional type narrowing | Figma Design | Remote-only; use before creating new artifacts when design-system reuse is relevant. |
| `create_new_file` | Create new blank Design or FigJam file | File name, file type, plan context | No file context required | Remote-only; creates files in drafts or a project; requires plan/team context in some clients. |

## Figma Make Resources

Figma Make project context is exposed through MCP resources on clients that support MCP resources. Use a valid Figma Make link, let the client list available project files, and fetch only the files needed for the implementation task.

## Codex Plugin Helpers

The Codex Figma plugin may expose helper tools beyond the current official tools page. Keep these documented as client-specific helpers:

| Helper | Purpose | Notes |
| --- | --- | --- |
| `get_libraries` | List libraries associated with a Figma file | Use before scoped `search_design_system`; not listed on the official Figma tools page as of this matrix date. |

Some official Figma MCP tools may not be exposed by every client plugin surface. Prefer the active client's tool list over assumptions when executing.

## Client and Agent Coverage

| Coverage | Agents or Clients | Guidance |
| --- | --- | --- |
| Figma-supported and skilly-hand-supported | `codex`, `claude`, `cursor`, `copilot` | Include concrete setup paths and prompts in this skill. |
| Figma-supported but not skilly-hand-native | VS Code, Warp, Augment, Factory, Firebender | Mention as Figma-supported clients; do not add skilly-hand install assumptions. |
| skilly-hand-supported but not source-backed in current Figma docs | `gemini`, `antigravity`, `windsurf`, `trae` | Keep broad install support; advise manual MCP/client docs for Figma-specific setup. |

## Rate-Limit Notes (Official)

- Read tools are subject to seat/plan limits and per-minute limits.
- Starter plan or View/Collab seats: up to 6 tool calls per month.
- Professional or Organization with Dev/Full seat: up to 200 tool calls per day.
- Enterprise with Dev/Full seat: up to 600 tool calls per day.
- Officially documented exempt tools include:
- `add_code_connect_map`
- `generate_figma_design`
- `whoami`

## Practical Selection Heuristics

1. Start with `whoami` when authentication or permissions are uncertain.
2. Use `get_metadata` before `get_design_context` for large files.
3. Use `get_libraries` where available, then `search_design_system` for scoped design-system reuse.
4. Use `generate_figma_design` for first-time live web UI capture.
5. Use `use_figma` for direct Figma Design or FigJam writes and updates.
6. Keep `use_figma` calls small and validate after each step.
7. Use `get_screenshot` as final visual verification after edits when available.

## Sources

- https://developers.figma.com/docs/figma-mcp-server/
- https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- https://developers.figma.com/docs/figma-mcp-server/local-server-installation/
- https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/
- https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/
- https://developers.figma.com/docs/figma-mcp-server/bringing-make-context-to-your-agent/
- https://developers.figma.com/docs/figma-mcp-server/plans-access-and-permissions/
- https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server
