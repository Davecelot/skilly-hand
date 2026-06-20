# Canvas Creation Playbook

## Goal

Deliver a first successful Figma canvas result with low risk and clear verification.

## Safe 0-to-1 Workflow

1. **Create or choose file context**
- New file path: run `whoami` if needed to confirm identity, then call `create_new_file` for Design, FigJam, or Slides; choose a team or organization if prompted.
- Existing file path: confirm URL/node target and permissions.
- Live web UI path: use `generate_figma_design` to capture to a new file, existing file, or clipboard.
- Make path: use MCP resources from a Figma Make link to fetch project/file context before implementation.

2. **Verify identity and access**
- Run `whoami` (remote) to confirm account/plan.
- If access mismatch appears, stop and fix permissions first.

3. **Read before write**
- Use `get_libraries` when library scope matters.
- Call `search_design_system` to reuse components/variables.
- Optionally call `get_metadata` for structure baseline.

4. **Perform first write step**
- Use `use_figma` for a small, atomic action:
- Create one frame.
- Add one text node.
- Apply one style/token decision.
- For Figma Design, load or invoke `figma-use` when available.
- For FigJam, load or invoke `figma-use-figjam` when available, then create or update one small board object such as a sticky, section, connector, shape, table, or code block.
- For Slides, load or invoke `figma-use-slides` when available, then create or update one slide, section, theme decision, or speaker-note block.

5. **Validate state**
- Inspect with `get_metadata` or `get_screenshot`.
- Confirm node IDs and visual result.

6. **Iterate in small increments**
- Add layout, spacing, variants, or additional sections in separate write steps.
- Re-validate after each step.

## Alternative First-Creation Flows

### Diagram-first flow (FigJam)

1. Call `generate_diagram` from plain-language workflow description or Mermaid syntax.
2. Let `generate_diagram` create a new FigJam file, or provide an existing FigJam file key.
3. Validate diagram structure and labels.

### FigJam board-first flow

1. Create or choose a FigJam file, using `create_new_file figjam <name>` if a fresh board is needed.
2. Use `figma-use-figjam` with `use_figma` for small write steps.
3. Validate with `get_figjam` or `get_screenshot`.

### Slides deck-first flow

1. Create or choose a Slides file, using `create_new_file` with the Slides editor type for a fresh deck.
2. Use `figma-use-slides` with `use_figma` for small write steps.
3. Validate the deck or selected slide with `get_screenshot`.

### Asset-transfer flow

1. Use `download_assets` with the smallest relevant node set; choose raw mode for original source images.
2. Fetch the returned temporary URLs before they expire.
3. Deliver the files, or pass them to `upload_assets` to transfer images into another Figma file.

### Code-to-canvas flow

1. Ask client to start local app capture workflow.
2. Use `generate_figma_design` to capture screen/element states to a new file, existing file, or clipboard.
3. Open generated file and validate generated layers.
4. Follow up with `use_figma` for cleanup/polish.

### Make-to-code context flow

1. Provide a valid Figma Make link.
2. Use MCP resources to list available project files.
3. Fetch only the files needed for the task.
4. Implement or refine the production code using that Make context.

## Guardrails

- Do not run large multi-section writes as the first operation.
- Always return to read/verify tools after each write step.
- If a write fails, use troubleshooting flow before retrying.
- Do not call `create_new_file` before `generate_diagram`; diagrams can create their own FigJam file.
