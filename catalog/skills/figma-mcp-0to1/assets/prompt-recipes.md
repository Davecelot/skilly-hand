# Prompt Recipes

## Setup and Verification

- "Set up Figma MCP remote server and verify with `whoami`."
- "Use Figma MCP `whoami` and tell me which account and plans are active."

## Read Context

- "Use `get_design_context` for this node URL and return layout, spacing, typography, and variables."
- "Use `get_metadata` first, then call `get_design_context` only for the button and header nodes."
- "Use `get_variable_defs` for this node and list token names with resolved values."

## Design-System and Code Connect

- "Use `search_design_system` to find an existing card and button component before creating anything new."
- "Use `get_code_connect_map` for this node and show mapped source locations."
- "Use `add_code_connect_map` to map this Figma node to my component path."

## First Canvas Creation

- "Use `create_new_file` to create a new design file named 'MCP First Canvas'."
- "Use `use_figma` to create one frame, add one title text layer, and apply auto layout spacing."
- "After the write, use `get_screenshot` to verify the result."

## FigJam Flows

- "Use `create_new_file` to create a new FigJam board for architecture planning."
- "Use `generate_diagram` to create a sequence diagram for login and checkout flow."

## Troubleshooting

- "I got a permission error. Use `whoami` and tell me what to check next."
- "I am rate-limited. Switch to a staged workflow with fewer `get_design_context` calls."
