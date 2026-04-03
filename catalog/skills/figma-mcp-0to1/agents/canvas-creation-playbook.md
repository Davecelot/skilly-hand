# Canvas Creation Playbook

## Goal

Deliver a first successful Figma canvas result with low risk and clear verification.

## Safe 0-to-1 Workflow

1. **Create or choose file context**
- New file path: call `create_new_file`.
- Existing file path: confirm URL/node target and permissions.

2. **Verify identity and access**
- Run `whoami` (remote) to confirm account/plan.
- If access mismatch appears, stop and fix permissions first.

3. **Read before write**
- Call `search_design_system` to reuse components/variables.
- Optionally call `get_metadata` for structure baseline.

4. **Perform first write step**
- Use `use_figma` for a small, atomic action:
- Create one frame.
- Add one text node.
- Apply one style/token decision.

5. **Validate state**
- Inspect with `get_metadata` or `get_screenshot`.
- Confirm node IDs and visual result.

6. **Iterate in small increments**
- Add layout, spacing, variants, or additional sections in separate write steps.
- Re-validate after each step.

## Alternative First-Creation Flows

### Diagram-first flow (FigJam)

1. `create_new_file` (FigJam)
2. `generate_diagram` from plain-language workflow description
3. Validate diagram structure and labels

### Code-to-canvas flow

1. Ask client to start local app capture workflow
2. Capture screen/element states to Figma
3. Open generated file and validate generated layers
4. Follow up with `use_figma` for cleanup/polish

## Guardrails

- Do not run large multi-section writes as the first operation.
- Always return to read/verify tools after each write step.
- If a write fails, use troubleshooting flow before retrying.
