# Official Figma MCP Tools Matrix (As of 2026-06-20)

This matrix tracks the official Figma MCP tool/function set in current Figma documentation. Treat it as the source of truth for official tool names, supported file types, and remote-only status.

## Coverage Matrix

| Tool | Primary Purpose | Typical Input | Supported File Types | Availability Notes |
| --- | --- | --- | --- | --- |
| `download_assets` | Download rendered exports and original source images | Up to 20 node IDs and optional export settings | Figma Design, FigJam, Figma Slides | Remote-only; returns temporary URLs; use for delivery, non-PNG formats, full-resolution exports, or cross-file transfer. |
| `upload_assets` | Upload supported image assets to a file or node | PNG, JPG, GIF, or WebP URLs/files | Figma Design, FigJam, Figma Slides | Remote-only; maximum 10 MB per asset; uploads to a node fill or creates image-filled frames. |
| `generate_figma_design` | Generate editable design layers from live web UI | URL/local app capture context | Figma Design output | Remote-only; select clients only; can output to new file, existing file, or clipboard; exempt from standard read limits. |
| `get_design_context` | Fetch rich design context for implementation | Figma URL or `fileKey` + `nodeId` | Figma Design, Figma Make | Read tool; remote server requires link-based node targeting; desktop can use selection-based prompts. |
| `get_variable_defs` | Retrieve variable/token definitions | `fileKey` + `nodeId` | Figma Design | Best for token-only extraction. |
| `get_code_connect_map` | Read existing Code Connect mappings | `fileKey` + `nodeId` | Figma Design | Use to inspect mapping before updates. |
| `add_code_connect_map` | Add mapping from node to code component | `fileKey`, `nodeId`, source details | Figma Design | Write-style utility; exempt from read rate limits in docs. |
| `get_context_for_code_connect` | Fetch component metadata for Code Connect template generation | Figma component context | Figma Design | Remote-only; prompted by Figma and intended for the `figma-code-connect` skill, not direct user invocation. |
| `get_screenshot` | Render node screenshot for visual verification | `fileKey` + `nodeId` | Figma Design, FigJam, Figma Slides | Use for visual inspection; prefer `download_assets` for delivery, multiple nodes, other formats, or original images. |
| `get_metadata` | Sparse XML structure (ids, names, hierarchy, bounds) | Selection or `fileKey` + `nodeId` | Figma Design | Preferred preflight for large contexts. |
| `get_figjam` | Fetch FigJam metadata (and node visuals) | `fileKey` + `nodeId` | FigJam | FigJam-specific extraction. |
| `generate_diagram` | Create FigJam diagram from Mermaid or natural language intent | Diagram description or Mermaid syntax | No file context required | Remote-only; supports flowchart, gantt, state, sequence, architecture, and ERD workflows. |
| `whoami` | Show authenticated Figma identity, plans, and seat types | None | No file context required | Remote-only in official docs; exempt from read rate limits. |
| `get_code_connect_suggestions` | Suggest candidate node-to-code mappings | File context + repo context | Figma Design | Usually part of Code Connect workflows. |
| `send_code_connect_mappings` | Confirm/persist mapping suggestions | Suggestions payload | Figma Design | Follow-up action after suggestion generation. |
| `get_libraries` | List subscribed and available design libraries | Figma file context | Figma Design | Remote-only; use with `search_design_system` for scoped reuse. |
| `use_figma` | General-purpose write/edit/delete/inspect via Plugin API workflow | Task instructions and file context | Figma Design, FigJam, Figma Slides | Remote-only; pair with `figma-use`, `figma-use-figjam`, or `figma-use-slides` for the active editor. |
| `search_design_system` | Search libraries for components, variables, styles | Query text and optional type narrowing | Figma Design | Remote-only; use before creating new artifacts when design-system reuse is relevant. |
| `create_new_file` | Create new blank Design, FigJam, or Slides file | File name, file type, plan context | No file context required | Remote-only; creates files in drafts and may ask which team or organization to use. |

## Figma Make Resources

Figma Make project context is exposed through MCP resources on clients that support MCP resources. Use a valid Figma Make link, let the client list available project files, and fetch only the files needed for the implementation task.

## Figma-Provided Skills

Figma documents these skills as the preferred guidance layer for common MCP workflows:

| Skill | Purpose |
| --- | --- |
| `figma-use` | Foundational Figma Design write-to-canvas workflow. |
| `figma-use-figjam` | Foundational FigJam write workflow. |
| `figma-use-slides` | Foundational Figma Slides write workflow. |
| `figma-swiftui` | Translate between Figma designs and SwiftUI in both directions. |
| `figma-code-connect` | Connect published Figma components to code implementations. |
| `figma-create-new-file` | Create blank Design, FigJam, or Slides files. |
| `figma-generate-diagram` | Generate editable FigJam diagrams from descriptions or source material. |
| `figma-generate-library` | Example workflow for generating or syncing a design-system library. |
| `figma-generate-design` | Example workflow for building screens/views from a design system. |

Some official Figma MCP tools may not be exposed by every client plugin surface. Prefer the active client's tool list over assumptions when executing.

## Client and Agent Coverage

| Coverage | Agents or Clients | Guidance |
| --- | --- | --- |
| Figma-documented and skilly-hand-supported | `codex`, `claude`, `cursor`, `copilot` | Use published setup paths; Copilot is currently listed for Copilot CLI write-to-canvas. |
| Figma-documented but not skilly-hand-native | VS Code, Xcode, Claude Desktop, Warp, Augment, Factory, Firebender | Mention only for workflows where Figma lists them; do not add skilly-hand install assumptions. |
| skilly-hand-supported but not source-backed in current Figma docs | `gemini`, `antigravity`, `windsurf`, `trae` | Verify the Figma MCP Catalog or current client docs before recommending setup. |

## Rate-Limit Notes (Official)

- Read tools are subject to seat/plan limits and per-minute limits.
- Remote server access is documented for all seats/plans, but practical usage is governed by seat/plan limits.
- Desktop server access is documented for Dev or Full seats on paid plans.
- Starter plan or View/Collab seats: up to 6 tool calls per month.
- Professional with Dev/Full seat: up to 200 tool calls per day and 10 per minute.
- Organization with Dev/Full seat: up to 200 tool calls per day and 15 per minute.
- Enterprise with Dev/Full seat: up to 600 tool calls per day and 20 per minute.
- Current write-to-canvas docs require a Full seat for `use_figma`; Dev seats are described as read-only.
- Code-to-canvas can create or edit draft files with any seat; existing files outside drafts require a Full seat and edit permission.
- Officially documented exempt tools include:
- `add_code_connect_map`
- `generate_figma_design`
- `whoami`

## Practical Selection Heuristics

1. Start with `whoami` when authentication or permissions are uncertain.
2. Use `get_metadata` before `get_design_context` for large files.
3. Use `get_libraries`, then `search_design_system` for scoped design-system reuse.
4. Use `generate_figma_design` for first-time live web UI capture.
5. Use `use_figma` for direct Figma Design, FigJam, or Slides writes and updates.
6. Keep `use_figma` calls small and validate after each step.
7. Use `get_screenshot` as final visual verification after edits when available.
8. Use the editor-specific skill for writes: `figma-use`, `figma-use-figjam`, or `figma-use-slides`.
9. Use `download_assets` and `upload_assets` for asset delivery or cross-file image transfer; returned download URLs are temporary.

## Sources

- https://developers.figma.com/docs/figma-mcp-server/
- https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- https://developers.figma.com/docs/figma-mcp-server/local-server-installation/
- https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/
- https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/
- https://developers.figma.com/docs/figma-mcp-server/bringing-make-context-to-your-agent/
- https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/
- https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server
- https://help.figma.com/hc/en-us/articles/39166810751895-Figma-skills-for-MCP
