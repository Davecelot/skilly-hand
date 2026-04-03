---
name: scannlab-figma-extractor
description: >
  Extracts comprehensive layer and node information from Figma links using the Figma MCP Server
  without requiring explicit user request. Provides spec-driven, layer-precise data for all subsequent
  Figma-related tasks (token matching, Code Connect mapping, design token validation). Automatically
  invokes Figma MCP Server tools when a Figma link is provided.
  Trigger: When user sends a Figma link or asks to extract, inspect, read, or analyze Figma component specifications.
metadata:
  author: scannlab-design-system
  version: "1.0.2"
  last-edit: 2026-03-27
  license: Apache-2.0
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "User provides a Figma link for extraction or analysis"
allowed-tools: >
  Figma MCP Server (get_design_context, get_screenshot, get_metadata, get_variable_defs, get_figjam),
  Read, Write, Glob, Grep, WebFetch
  Note: Environment exposes these as mcp_figma_mcp_ser_* prefixed (e.g., mcp_figma_mcp_ser_get_design_context)
---

# ScannLab Figma Extractor Skill

## Overview

The **Figma Extractor** skill provides spec-driven extraction of Figma layer and node information. When a user provides a Figma link, this skill automatically:

1. **Extracts layer hierarchy** — Maps all layers from root to leaf
2. **Retrieves component specs** — Gets dimensions, spacing, colors, typography, shadows, borders
3. **Extracts design tokens** — Identifies variable definitions and token references
4. **Captures metadata** — Gets node IDs, names, positions, rotations, constraints
5. **Generates screenshots** — Visual context for design-to-code workflows
6. **Identifies variants** — Component variants, states, and configurations

This skill is the **foundational step** for all Figma extraction tasks and reduces redundant work for downstream skills (`scannlab-figma-token-matcher`, `scannlab-code-connect`).

---

## When to Invoke

**Automatically invoke when:**

- User provides a Figma link (design file, branch, or node-specific URL)
- User asks to "extract," "inspect," "read," "analyze," or "get specs" from Figma
- User mentions a Figma component and wants design specifications
- User provides Figma screenshot or design reference and needs structured data

**Do NOT duplicate extraction if:**

- The user is already working with extracted Figma data from a prior skill invocation
- Another skill has already extracted the necessary context (reference that context instead)

---

## Figma Link Formats

```
# Standard design file
https://figma.com/design/:fileKey/:fileName

# Design file with node selection
https://figma.com/design/:fileKey/:fileName?node-id=123:456

# Branch-based URL (extract branchKey as fileKey)
https://figma.com/design/:fileKey/branch/:branchKey/:fileName

# Node-specific URL
https://figma.com/design/:fileKey/:fileName?node-id=123-456

# FigJam files
https://figma.com/board/:fileKey/:fileName?node-id=123:456
```

**URL Parsing Rule:** For branch URLs, extract the `branchKey` and use it as the `fileKey`.

---

## Extraction Strategy

### Step 1: Identify Node ID from URL

```
Input: https://figma.com/design/abc123/Button?node-id=10:20
Extract: fileKey="abc123", nodeId="10:20"

Input: https://figma.com/design/abc123/branch/branchKey456/Button?node-id=10:20
Extract: fileKey="branchKey456", nodeId="10:20"

Input: https://figma.com/design/abc123/Button
Extract: fileKey="abc123", nodeId="" (empty = page root)
```

### Step 2: Determine File Type

| Indicator | Type | Tool |
|-----------|------|------|
| URL contains `/design/` | Figma Design File | `get_design_context` |
| URL contains `/board/` | FigJam File | `get_figjam` |
| File name ends in `.figma` | Design File | `get_design_context` |

### Step 3: Extract Using Appropriate Tools

**For Design Files (Primary):**

```
Tool: get_design_context (exposed as mcp_figma_mcp_ser_get_design_context in this environment)
Parameters:
  - nodeId: extracted from URL or empty string for page
  - clientFrameworks: "react" (ScannLab is React + Angular)
  - clientLanguages: "typescript"
  - artifactType: infer from context
    * "REUSABLE_COMPONENT" for buttons, inputs, cards
    * "COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN" for composed components
    * "DESIGN_SYSTEM" for tokens or system components
  - taskType: infer from user request
    * "CREATE_ARTIFACT" if extracting for new implementation
    * "CHANGE_ARTIFACT" if extracting for updates
```

**Fallback Tools:**

```
Tool: get_metadata
Use when: Design context is too large, need structural overview only
Returns: Layer tree, node IDs, names, positions, sizes (no code)

Tool: get_variable_defs
Use when: Extracting only design tokens and variables
Returns: Token definitions, color variables, spacing scales

Tool: get_screenshot
Use when: Need visual reference alongside extracted data
Returns: PNG screenshot for visual verification
```

**For FigJam Files:**

```
Tool: get_figjam
Parameters:
  - nodeId: extracted from URL
  - clientFrameworks: "react"
  - clientLanguages: "typescript"
  - includeImagesOfNodes: true (for visual context)
```

(In this environment: `mcp_figma_mcp_ser_get_figjam`)

---

## Data Extraction Checklist

When extracting from Figma, collect the following spec-driven data:

### Layer Hierarchy
- [ ] All layer names and IDs (root to leaf)
- [ ] Layer nesting depth and relationships
- [ ] Component vs. instance vs. frame structure
- [ ] Auto-layout configuration (direction, spacing, padding)
- [ ] Visibility and lock status

### Dimensions & Layout
- [ ] Width, height (fixed, hugging, fill)
- [ ] X, Y position
- [ ] Rotation, skew
- [ ] Constraints (aspect ratio locks, responsive sizing)
- [ ] Padding, margin, gaps (auto-layout)

### Visual Properties
- [ ] Fill colors (hex, RGB, or token references)
- [ ] Stroke colors, width, style (solid, dashed, etc.)
- [ ] Border radius (individual corners if asymmetric)
- [ ] Shadow (blur, offset, spread, color)
- [ ] Opacity, blending mode
- [ ] Transparency/alpha values

### Typography
- [ ] Font family, weight, size
- [ ] Line height, letter spacing
- [ ] Text alignment, direction
- [ ] Text transform (uppercase, lowercase, etc.)
- [ ] Text decoration (underline, strikethrough)

### Token References
- [ ] Design variable names (e.g., `color/primary`, `spacing/lg`)
- [ ] Variable modes and overrides
- [ ] Token scale or mapping (if custom)

### Component Metadata
- [ ] Component name and path (e.g., `Button/Primary/Default`)
- [ ] Property definitions (for main components)
- [ ] Instance properties and overrides
- [ ] Variant structure and states
- [ ] Reset rules

### Interactive States
- [ ] Hover state (if separate components/variants)
- [ ] Focus state (if separate components/variants)
- [ ] Disabled state (if separate components/variants)
- [ ] Active/selected state (if separate components/variants)

---

## Output Format

Always return extracted Figma data in this structured format:

```markdown
# Figma Extraction: [Component/File Name]

## Metadata
- **File Key**: [fileKey from URL]
- **Node ID**: [nodeId or empty if page root]
- **Component Path**: [Full component path from Figma]
- **Type**: [Component / Instance / Frame / Page]
- **URL**: [Original Figma link provided]

## Layer Structure
\`\`\`
[Minimal tree showing parent > child relationships]
root/
  └─ Container [node-id: 10:20]
      ├─ Icon [dimensions, styles]
      └─ Label [dimensions, styles, typography]
\`\`\`

## Specifications

### Dimensions
| Property | Value |
|----------|-------|
| Width | [value] |
| Height | [value] |
| ...

### Colors (Design System Tokens)
| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | #XXXXXX | color/primary-50 |
| ...

### Typography
| Property | Value | Token Reference |
|----------|-------|-----------------|
| Font | InterVar, 14px | typography/body-sm |
| ...

### Spacing & Layout
[Auto-layout config, padding, gaps, etc.]

### Design Tokens Used
\`\`\`
- color/primary
- spacing/md
- border-radius/sm
- ...
\`\`\`

## Notes for Implementation
[Any caveats, special cases, responsive behavior notes]
```

---

## Common Patterns

### Pattern 1: Extracting Button Variants

```
User: "Here's a Figma link to the Button component"
→ Invoke get_design_context
→ Extract main component + all variants (Primary, Secondary, Outline, etc.)
→ Return complete variant matrix with states (default, hover, focus, disabled)
```

### Pattern 2: Extracting Design Tokens from System File

```
User: "Extract the color tokens from this Figma file"
→ Invoke get_variable_defs (tokens focus)
→ Optional: get_metadata (layer structure)
→ Return token definitions with hex/RGB values and naming hierarchy
```

### Pattern 3: Extracting Composed Component Specs

```
User: "Analyze this modal dialog in Figma"
→ Invoke get_design_context with taskType="CHANGE_ARTIFACT"
→ Extract modal structure: header, body, footer, buttons
→ Include all interactive states (open, closed, loading)
→ Return layer precision with z-index/stacking context
```

### Pattern 4: FigJam Extraction

```
User: "Extract the wireframe from this FigJam"
→ Detect /board/ URL or user context
→ Invoke get_figjam
→ Include screenshots for visual context
→ Return functional flow data
```

---

## Integration with Other Skills

This skill **feeds** downstream skills:

| Downstream Skill | Uses Data From | For Purpose |
|------------------|----------------|------------|
| `scannlab-figma-token-matcher` | Design context + variable defs | Match Figma values to ScannLab tokens |
| `scannlab-code-connect` | Layer hierarchy + component specs | Map Figma nodes to Angular components |
| `scannlab-storybook` | Component variants + states | Generate story control matrix |

**Prerequisite Relationship:**

```
scannlab-figma-extractor (Foundation - always first)
    ↓
scannlab-figma-token-matcher (Token validation)
    ↓
scannlab-code-connect (Code mapping)
    ↓
scannlab-best-practices (Implementation)
```

---

## Command Reference

### Extract Design Context (Full Spec)

```bash
# When user provides a link like:
# https://figma.com/design/xyz/Button?node-id=10:20

→ Parse URL
→ get_design_context(
    nodeId="10:20",
    clientFrameworks="react",
    clientLanguages="typescript",
    artifactType="REUSABLE_COMPONENT"
  )
# Environment exposes as: mcp_figma_mcp_ser_get_design_context
```

### Extract Metadata Only (Quick Overview)

```bash
# For large files, get structure first:
→ get_metadata(
    nodeId="10:20"
  )
# Environment exposes as: mcp_figma_mcp_ser_get_metadata
```

### Extract Variables/Tokens

```bash
# For design system files:
→ get_variable_defs(
    nodeId="" (or empty for entire file)
  )
# Environment exposes as: mcp_figma_mcp_ser_get_variable_defs
```

### Get Screenshot

```bash
# For visual reference:
→ get_screenshot(
    nodeId="10:20"
  )
# Environment exposes as: mcp_figma_mcp_ser_get_screenshot
```

---

## Decision Tree

```
User provides a Figma link?
├─ YES → Extract node ID from URL
│   ├─ Contains "/design/"? → Use design file tools
│   │   ├─ User wants full spec? → get_design_context
│   │   ├─ User wants structure only? → get_metadata
│   │   ├─ User wants tokens only? → get_variable_defs
│   │   └─ User wants visual? → get_screenshot
│   │
│   └─ Contains "/board/"? → Use FigJam tool
│       └─ get_figjam
│
└─ NO → Check if task requires Figma extraction
    └─ Ask user for Figma link or reference existing extracted data

Note: Environment exposes these with mcp_figma_mcp_ser_ prefix (e.g., mcp_figma_mcp_ser_get_design_context)
```

---

## Quality Standards

✓ **Precision**: Extract layer-by-layer, node-by-node without gaps  
✓ **Completeness**: Collect all spec data, don't assume values  
✓ **Structure**: Return organized, hierarchical data  
✓ **Token-Ready**: Flag design tokens and variable references  
✓ **Implementation-Ready**: Include notes for Code Connect and component building  

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Node ID not found" | Check URL format, ensure node-id parameter is present |
| "File access denied" | Verify Figma link is shareable/public, check file permissions |
| "Output too large" | Use `mcp_figma_mcp_ser_get_metadata` for structure first |
| "MCP Server not available" | Verify Figma MCP Server is configured in workspace |
| "Design context is empty" | File may be password-protected or link may be invalid |

---

## References

- [Figma MCP Server Documentation](https://github.com/figma/code-connect)
- [Figma REST API (Design Tokens)](https://www.figma.com/developers/api#variables_endpoint)
- [Code Connect Implementation](skills/scannlab-code-connect/SKILL.md)
- [Token Matching](skills/scannlab-figma-token-matcher/SKILL.md)
