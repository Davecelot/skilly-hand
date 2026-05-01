# Tool and Function Catalog

## Goal

Pick the smallest correct Figma MCP function for the task, with predictable inputs and output shape.

## Start Here

1. Read [../references/official-tools-matrix.md](../references/official-tools-matrix.md).
2. Identify whether task is read, write, design-system search, code-connect, diagram, live UI capture, or Make resource context.
3. Prefer read-first calls before write calls on unknown files.

## Selection Rules

- Need full style/layout context for implementation: `get_design_context`.
- Need Figma Make project/file context: use MCP resources if the client supports resources.
- Output too large or structure-first pass: `get_metadata` first, then targeted `get_design_context`.
- Need variables/tokens only: `get_variable_defs`.
- Need visual reference: `get_screenshot`.
- Need FigJam extraction: `get_figjam`.
- Need library discovery in Codex before a scoped search: `get_libraries` if the Codex Figma plugin exposes it.
- Need design-system discovery before creating: `search_design_system`.
- Need to write/create/update Figma Design or FigJam content: `use_figma` (remote write workflow; use `figma-use` skill when available).
- Need first-time live web UI capture: `generate_figma_design`.
- Need new blank file: `create_new_file` (requires plan/team context such as `planKey` in some clients).
- Need Mermaid-to-FigJam: `generate_diagram` (creates its own FigJam file unless an existing FigJam file key is provided).
- Need code-connect lookup/update: `get_code_connect_map`, `add_code_connect_map`, suggestion/confirm functions.

## Prompting Pattern

Use direct tool-trigger language when selection is ambiguous:

- "Use Figma MCP `get_metadata` first, then `get_design_context` only for the selected child nodes."
- "Use `get_libraries` if available, then use Figma MCP `search_design_system` for the selected library."
- "Use Figma MCP `search_design_system` before creating any new component."
- "Use Figma MCP `generate_figma_design` to capture this live web UI to a new Figma file."
- "Use Figma MCP `create_new_file`, then `use_figma` to add a first frame and typography style."
- "Use MCP resources from this Figma Make link and fetch only the files needed for implementation."

## Remote/Desktop Caveats

- Remote-only flags are tracked in the matrix; confirm availability before relying on those functions.
- Write-to-canvas flows are remote-only in current official guidance.
- Desktop mode is valid for local selection-based extraction, but with narrower workflow coverage.
- Selection-based prompting works with the desktop server; remote workflows should use Figma file or node links.
