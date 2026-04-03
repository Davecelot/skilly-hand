# Tool and Function Catalog

## Goal

Pick the smallest correct Figma MCP function for the task, with predictable inputs and output shape.

## Start Here

1. Read [../references/official-tools-matrix.md](../references/official-tools-matrix.md).
2. Identify whether task is read, write, design-system search, code-connect, or diagram.
3. Prefer read-first calls before write calls on unknown files.

## Selection Rules

- Need full style/layout context for implementation: `get_design_context`.
- Output too large or structure-first pass: `get_metadata` first, then targeted `get_design_context`.
- Need variables/tokens only: `get_variable_defs`.
- Need visual reference: `get_screenshot`.
- Need FigJam extraction: `get_figjam`.
- Need design-system discovery before creating: `search_design_system`.
- Need to write/create/update content: `use_figma` (remote write workflows).
- Need new blank file: `create_new_file`.
- Need Mermaid-to-FigJam: `generate_diagram`.
- Need code-connect lookup/update: `get_code_connect_map`, `add_code_connect_map`, suggestion/confirm functions.

## Prompting Pattern

Use direct tool-trigger language when selection is ambiguous:

- "Use Figma MCP `get_metadata` first, then `get_design_context` only for the selected child nodes."
- "Use Figma MCP `search_design_system` before creating any new component."
- "Use Figma MCP `create_new_file`, then `use_figma` to add a first frame and typography style."

## Remote/Desktop Caveats

- Remote-only flags are tracked in the matrix; confirm availability before relying on those functions.
- Write-to-canvas flows are remote-first in current official guidance.
- Desktop mode is valid for local selection-based extraction, but with narrower workflow coverage.
