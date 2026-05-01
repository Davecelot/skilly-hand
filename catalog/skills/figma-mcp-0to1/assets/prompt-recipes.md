# Prompt Recipes

## Setup and Verification

- "Set up Figma MCP remote server and verify with `whoami`."
- "Use Figma MCP `whoami` and tell me which account and plans are active."
- "Check whether this client exposes the Figma MCP tools I need before starting."

## Read Context

- "Use `get_design_context` for this node URL and return layout, spacing, typography, and variables."
- "Use `get_metadata` first, then call `get_design_context` only for the button and header nodes."
- "Use `get_variable_defs` for this node and list token names with resolved values."
- "Use `get_screenshot` for this node and compare it against the generated implementation."
- "Use Figma MCP resources from this Figma Make link and fetch only the files needed for this component."

## Design-System and Code Connect

- "Use `get_libraries` if available, then search only the relevant design libraries."
- "Use `search_design_system` to find an existing card and button component before creating anything new."
- "Use `search_design_system` to find primary color, typography, and spacing variables."
- "Use `get_code_connect_map` for this node and show mapped source locations."
- "Use `add_code_connect_map` to map this Figma node to my component path."
- "Use `get_code_connect_suggestions`, then confirm mappings with `send_code_connect_mappings` if the suggestions are correct."

## First Canvas Creation

- "Use `whoami` to choose the right plan, then use `create_new_file` to create a new design file named 'MCP First Canvas'."
- "Use `create_new_file` to create a new design file named 'MCP First Canvas'."
- "Use `use_figma` to create one frame, add one title text layer, and apply auto layout spacing."
- "After the write, use `get_screenshot` to verify the result."
- "Before writing, inspect the file and use `search_design_system` for existing components or variables."

## Live UI Capture

- "Start my local app and use `generate_figma_design` to capture the current screen into a new Figma file."
- "Use `generate_figma_design` to capture this URL into the existing Figma file."
- "Use `generate_figma_design` to capture this page to my clipboard."

## FigJam Flows

- "Use `create_new_file` to create a new FigJam board for architecture planning."
- "Use `generate_diagram` to create a sequence diagram for login and checkout flow."
- "Use `generate_diagram` to add an ERD to this existing FigJam file."
- "Use `use_figma` to organize this FigJam board into sections with stickies and connectors."
- "Use `use_figma` to update this architecture diagram with a new service."

## Agent Coverage

- "For this agent, tell me whether Figma officially supports its MCP setup path and which command/config I should use."
- "Compare this client's active Figma tools against the official Figma MCP matrix before choosing a workflow."

## Troubleshooting

- "I got a permission error. Use `whoami` and tell me what to check next."
- "I am rate-limited. Switch to a staged workflow with fewer `get_design_context` calls."
- "This client does not expose `get_screenshot`. Choose the closest supported verification path."
- "My `create_new_file` call failed. Check whether a plan key or team context is missing."
