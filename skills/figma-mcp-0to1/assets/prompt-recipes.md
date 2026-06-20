# Prompt Recipes

## Setup and Verification

- "Set up Figma MCP remote server and verify with `whoami`."
- "Use Figma MCP `whoami` and tell me which account and plans are active."
- "Check whether this client exposes the Figma MCP tools I need before starting."
- "Check whether my client has the Figma-provided skills installed before starting a write-to-canvas workflow."

## Read Context

- "Use `get_design_context` for this node URL and return layout, spacing, typography, and variables."
- "Use `get_metadata` first, then call `get_design_context` only for the button and header nodes."
- "Use `get_variable_defs` for this node and list token names with resolved values."
- "Use `get_screenshot` for this node and compare it against the generated implementation."
- "Use Figma MCP resources from this Figma Make link and fetch only the files needed for this component."

## Design-System and Code Connect

- "Use `get_libraries`, then search only the relevant design libraries."
- "Use `search_design_system` to find an existing card and button component before creating anything new."
- "Use `search_design_system` to find primary color, typography, and spacing variables."
- "Use `get_code_connect_map` for this node and show mapped source locations."
- "Use `add_code_connect_map` to map this Figma node to my component path."
- "Use `get_code_connect_suggestions`, then confirm mappings with `send_code_connect_mappings` if the suggestions are correct."
- "Use the `figma-code-connect` skill to inspect and connect these published components."

## Asset Transfer

- "Use `download_assets` to export these nodes as SVG and PDF deliverables."
- "Use `download_assets` raw mode to retrieve the original uploaded images."
- "Copy the images from this file into the target file using `download_assets` followed by `upload_assets`."

## First Canvas Creation

- "Use `whoami` to choose the right plan, then use `create_new_file` to create a new design file named 'MCP First Canvas'."
- "Use `create_new_file` to create a new design file named 'MCP First Canvas'."
- "Use `use_figma` to create one frame, add one title text layer, and apply auto layout spacing."
- "Use `figma-use` with `use_figma` for a small Figma Design write, then validate with a screenshot."
- "After the write, use `get_screenshot` to verify the result."
- "Before writing, inspect the file and use `search_design_system` for existing components or variables."

## Live UI Capture

- "Start my local app and use `generate_figma_design` to capture the current screen into a new Figma file."
- "Use `generate_figma_design` to capture this URL into the existing Figma file."
- "Use `generate_figma_design` to capture this page to my clipboard."

## FigJam Flows

- "Use `create_new_file` to create a new FigJam board for architecture planning."
- "Use `figma-create-new-file figjam 'Architecture Planning'` to create a new FigJam board."
- "Use `generate_diagram` to create a sequence diagram for login and checkout flow."
- "Use `generate_diagram` to add an ERD to this existing FigJam file."
- "Use `figma-use-figjam` with `use_figma` to organize this FigJam board into sections with stickies and connectors."
- "Use `use_figma` to update this architecture diagram with a new service."

## Figma Slides

- "Use `create_new_file` to create a Figma Slides deck named 'Q3 Review'."
- "Use `figma-use-slides` with `use_figma` to build a five-slide kickoff deck with speaker notes."
- "Use `get_screenshot` to verify the title slide and agenda slide."

## Figma Skills

- "Use `figma-use` for this Figma Design write-to-canvas task."
- "Use `figma-use-figjam` for this FigJam board update."
- "Use `figma-use-slides` for this Figma Slides deck update."
- "Use `figma-swiftui` to implement this design in SwiftUI or push these SwiftUI views into Figma."
- "Use `figma-generate-diagram` to turn this architecture description into an editable FigJam diagram."
- "Use `figma-generate-design` to build this app screen in Figma using the connected design system."
- "Use `figma-generate-library` to create or sync a Figma design-system library from this codebase."

## Agent Coverage

- "For this agent, tell me whether Figma officially supports its MCP setup path and which command/config I should use."
- "Compare this client's active Figma tools against the official Figma MCP matrix before choosing a workflow."

## Troubleshooting

- "I got a permission error. Use `whoami` and tell me what to check next."
- "I am rate-limited. Switch to a staged workflow with fewer `get_design_context` calls."
- "This client does not expose `get_screenshot`. Choose the closest supported verification path."
- "My `create_new_file` call failed. Check whether I need to choose a team or organization."
- "Images from the MCP response expired. Refresh the design context or save the assets locally."
- "The `download_assets` URLs expired. Run the scoped export again and fetch the returned URLs immediately."
