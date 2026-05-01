# Canvas Creation Playbook

## Goal

Deliver a first successful Figma canvas result with low risk and clear verification.

## Safe 0-to-1 Workflow

1. **Create or choose file context**
- New file path: run `whoami` if needed to obtain a plan/team context, then call `create_new_file`.
- Existing file path: confirm URL/node target and permissions.
- Live web UI path: use `generate_figma_design` to capture to a new file, existing file, or clipboard.
- Make path: use MCP resources from a Figma Make link to fetch project/file context before implementation.

2. **Verify identity and access**
- Run `whoami` (remote) to confirm account/plan.
- If access mismatch appears, stop and fix permissions first.

3. **Read before write**
- Use `get_libraries` if the Codex Figma plugin exposes it and library scope matters.
- Call `search_design_system` to reuse components/variables.
- Optionally call `get_metadata` for structure baseline.

4. **Perform first write step**
- Use `use_figma` for a small, atomic action:
- Create one frame.
- Add one text node.
- Apply one style/token decision.
- For FigJam, create or update one small board object such as a sticky, section, connector, or shape.

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
