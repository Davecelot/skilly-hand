# Official Figma MCP Tools Matrix (As of 2026-04-03)

This matrix tracks the official Figma MCP tool/function set in current Figma documentation.

## Coverage Matrix

| Tool | Primary Purpose | Typical Input | Supported File Types | Availability Notes |
| --- | --- | --- | --- | --- |
| `generate_figma_design` | Generate design layers from live web UI (code to canvas path) | URL/local app capture context | No file context required | Remote-only in official docs. |
| `get_design_context` | Fetch rich design context for implementation | Figma URL or `fileKey` + `nodeId` | Figma Design | Read tool; use link-based node targeting. |
| `get_variable_defs` | Retrieve variable/token definitions | `fileKey` + `nodeId` | Figma Design | Best for token-only extraction. |
| `get_code_connect_map` | Read existing Code Connect mappings | `fileKey` + `nodeId` | Figma Design | Use to inspect mapping before updates. |
| `add_code_connect_map` | Add mapping from node to code component | `fileKey`, `nodeId`, source details | Figma Design | Write-style utility; exempt from read rate limits in docs. |
| `get_screenshot` | Render node screenshot for visual verification | `fileKey` + `nodeId` | Figma Design | Useful verification after write steps. |
| `create_design_system_rules` | Generate design-system rules prompt/scaffold | Framework/language context | No file context required | Use to enforce repeatable design-system workflows. |
| `get_metadata` | Sparse XML structure (ids, names, hierarchy, bounds) | Selection or `fileKey` + `nodeId` | Figma Design | Preferred preflight for large contexts. |
| `get_figjam` | Fetch FigJam metadata (and node visuals) | `fileKey` + `nodeId` | FigJam | FigJam-specific extraction. |
| `generate_diagram` | Create FigJam diagram from Mermaid or natural language intent | Diagram description or Mermaid syntax | No file context required | Supports flowchart, gantt, state, sequence. |
| `whoami` | Show authenticated Figma identity, plans, and seat types | None | No file context required | Remote-only in official docs; exempt from read rate limits. |
| `get_code_connect_suggestions` | Suggest candidate node-to-code mappings | File context + repo context | Figma Design | Usually part of Code Connect workflows. |
| `send_code_connect_mappings` | Confirm/persist mapping suggestions | Suggestions payload | Figma Design | Follow-up action after suggestion generation. |
| `use_figma` | General-purpose write/edit/delete/inspect in Figma via Plugin API workflow | Task instructions and file context | Figma Design, FigJam | Write-to-canvas workflow path; remote-first guidance. |
| `search_design_system` | Search libraries for components, variables, styles | Query text and optional type narrowing | Figma Design | Use before creating new artifacts. |
| `create_new_file` | Create new blank Design or FigJam file | Name/type intent | No file context required | Good first step for 0-to-1 creation workflows. |

## Rate-Limit Notes (Official)

- Read tools are subject to seat/plan limits.
- Officially documented exempt tools include:
- `add_code_connect_map`
- `generate_figma_design`
- `whoami`

## Practical Selection Heuristics

1. Start with `whoami` when authentication or permissions are uncertain.
2. Use `get_metadata` before `get_design_context` for large files.
3. Use `search_design_system` before creating new components.
4. Keep `use_figma` calls small and validate after each step.
5. Use `get_screenshot` as final visual verification after edits.

## Sources

- https://developers.figma.com/docs/figma-mcp-server/
- https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- https://developers.figma.com/docs/figma-mcp-server/local-server-installation/
- https://developers.figma.com/docs/figma-mcp-server/plans-access-and-permissions/
- https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server
