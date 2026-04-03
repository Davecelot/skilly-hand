---
name: scannlab-code-connect
description: >
  Maps Figma components and variants to ScannLab Angular Code Connect files and Dev Mode snippets.
  Works on components with known APIs and specifications. For extracting raw Figma layer/node specs,
  see scannlab-figma-extractor (prerequisite for token matching workflows).
  Trigger: When connecting Figma components to this Angular repo, creating or editing `.figma.ts` mappings, or publishing Code Connect examples.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.1.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [ui]
  auto-invoke: "Connecting Figma components to Code Connect mappings"
allowed-tools: Read, Edit, Write, Grep, Bash, Task
---

# ScannLab Code Connect Guide

## Prerequisites

- **Angular component API is known** — You must understand the component's inputs, selectors, and allowed prop combinations beforehand.
- **Figma design specs are extracted** — For extracting raw Figma layer/node information, use [`scannlab-figma-extractor`](../scannlab-figma-extractor/SKILL.md) first.
- **For token matching** — If you have raw Figma values (colors, spacing, etc.) that need to be matched against ScannLab tokens, use [`scannlab-figma-token-matcher`](../scannlab-figma-token-matcher/SKILL.md).

---

## When to Use

**Use this skill when:**

- Connecting the ScannLab Figma library to this Angular repo with Code Connect.
- Creating or updating `figma.config.json`.
- Creating, editing, or publishing `.figma.ts` mapping files.
- Matching Figma variant properties to Angular `input()` APIs and Storybook controls.
- Writing Dev Mode snippets that developers should copy into Angular templates.

**Don't use this skill for:**

- **Extracting Figma layer/node specs** — use [`scannlab-figma-extractor`](../scannlab-figma-extractor/SKILL.md) first.
- Matching raw Figma colors, spacing, or typography to tokens only. Use [`scannlab-figma-token-matcher`](../scannlab-figma-token-matcher/SKILL.md).
- Writing or refactoring Angular production component code. Use `scannlab-best-practices`.
- Creating or repairing Storybook stories. Use `scannlab-storybook`.

---

## Critical Patterns

### Pattern 1: Build the Repo Contract Before Touching Code Connect

Never start from the Figma side alone. Read the Angular source and Storybook first.

| Contract Item | Where to Read It in This Repo |
|---|---|
| Component selector | `projects/scanntech-ui/src/components/**/{component}.ts` |
| Inputs and allowed values | `input()` declarations plus exported const arrays in the same file |
| Public export path | `projects/scanntech-ui/src/components/**/public-api.ts` |
| Canonical usage example | `projects/scanntech-ui/src/components/**/stories/*.stories.ts` |
| User-facing prop labels | `argTypes` descriptions and `args` defaults in Storybook |

**Key repo rules:**

- ScannLab source files are usually named `button.ts`, `text-field.ts`, etc. Do not assume `*.component.ts`.
- The Angular prefix is `s` (`angular.json`), so custom elements such as `<s-text-field>` are valid public API.
- Attribute selectors must stay attribute selectors in snippets. Example: `button[sButton]` should remain `<button sButton>...</button>`, not `<s-button>`.
- Prefer exported value arrays such as `VARIANTS`, `SIZES`, `TEXT_FIELD_STATES`, and `TEXT_FIELD_INPUT_TYPES` as the source of truth for enum mappings.

### Pattern 2: Capture a Component Contract First

Before editing a `.figma.ts` file, fill the template in [component-contract-template.md](assets/component-contract-template.md).

At minimum, capture:

- Figma component name and node URL.
- Angular selector or directive selector.
- Supported inputs grouped as enum, boolean, and string/content.
- Any invalid combinations the repo enforces.
- The Storybook story that best represents the canonical usage snippet.

This prevents the usual failure mode: publishing a Dev Mode example that looks right in Figma but does not match the actual Angular API.

### Pattern 3: Use Generated Code Connect Files as Syntax Source of Truth

Do not freehand the first mapping file. Generate a starter first, then edit it.

```bash
mkdir -p projects/scanntech-ui/src/components/{component}/figma
npx figma connect create "<figma-node-url>"
```

After generation:

- Move the file into `projects/scanntech-ui/src/components/{component}/figma/` and rename to `{component}.figma.ts`.
- Keep the generated import style and wrapper shape.
- Replace only the property definitions and example snippet.

**Key rule:** if Code Connect syntax changes, the generated file is more trustworthy than memory.

### Pattern 4: Keep Mapping Files Organized by Semantic Component

Use a `figma/` folder inside each component folder to co-locate Code Connect files:

```text
projects/scanntech-ui/src/components/button/figma/button.figma.ts
projects/scanntech-ui/src/components/button/figma/contract.md
projects/scanntech-ui/src/components/text-field/figma/text-field.figma.ts
projects/scanntech-ui/src/components/text-field/figma/contract.md
projects/scanntech-ui/src/components/alert/figma/alert.figma.ts
projects/scanntech-ui/src/components/alert/figma/contract.md
```

Inside a file, grouping multiple Figma nodes is acceptable when they belong to the same Angular API surface.

Good grouping:

- Multiple Button variants that all map to `sButton`
- Multiple TextField states that all map to `s-text-field`

Bad grouping:

- Button and Link together because they both look clickable

### Pattern 5: Map Figma Properties to Angular Inputs, Not Internal Styling

The mapping layer is an API contract, not a CSS snapshot.

Map these:

- Figma variant properties such as `Variant`, `Level`, `Size`, `State`
- Boolean toggles such as `Disabled`, `Readonly`, `Has icon`
- Text/content such as `Label`, `Placeholder`, projected text

Do not map these unless the Angular API actually exposes them:

- CSS classes
- `data-*` host attributes
- Internal implementation details used only inside Storybook
- Token names

### Pattern 6: Reuse Storybook Vocabulary and Defaults

Storybook is the best local source for the names developers already see.

Use Storybook to drive:

- Human-readable control labels
- Default prop values
- Allowed enum values
- Canonical example markup

For this repo, the `Playground` story is often the best starting point, but simplify it into the smallest copy-pasteable Angular example.

### Pattern 7: Preserve Angular Markup Shape in Dev Mode Snippets

The Dev Mode snippet should look like real Angular usage, not like Storybook render boilerplate.

Prefer:

```html
<button sButton [variant]="'primary'" [level]="'filled'">Label</button>
<s-text-field [label]="'Nombre'" [state]="'default'"></s-text-field>
```

Avoid:

- Storybook-only wrappers
- Inline demo backgrounds unless the component truly requires them
- Fake custom elements for attribute directives

When a prop is optional and omitted in the canonical example, leave it out instead of showing noise.

### Pattern 8: Follow HTML Parser Constraints

The HTML parser requires the `example` to return a single tagged template literal. Avoid dynamic string building or conditional expressions inside the template.

Prefer:

```ts
example: (props) => html`
   <button sButton
      variant=${props.variant}
      disabled=${props.disabled}
   >${props.label}</button>
`,
```

Avoid:

- `example` bodies that build strings or return from blocks
- Ternaries or binary expressions inside `${...}` placeholders

Use `figma.boolean` or `figma.enum` mappings to return `undefined` when a prop should be omitted.

### Pattern 9: Icon Instance Swaps

When Figma uses instance swaps for icons, map them directly and pass the instance output to the icon input. Do not hardcode icon names.

### Pattern 10: Respect Variant Constraints From the Repo

Some components have valid combinations, not a full Cartesian product.

Example from `Button`:

- `variant` is one of `primary | secondary | tertiary | danger | on-negative`
- `level` is one of `filled | outlined | link`
- `tertiary` only allows `filled` and `link`

If the Figma component exposes a combination the Angular component rejects:

1. Flag it as a contract mismatch.
2. Do not publish a misleading snippet.
3. Ask for either a Figma fix or a component API change.

---

## ScannLab Examples

Use these as orientation, not as a replacement for reading the live files.

| Component | Source | Public Selector | Inputs to Map First |
|---|---|---|---|
| Button | `projects/scanntech-ui/src/components/button/button.ts` | `button[sButton], a[sButton]` | `variant`, `level`, `size`, `supportingIcon`, `leadingIcon`, projected label |
| TextField | `projects/scanntech-ui/src/components/text-field/text-field.ts` | `s-text-field` | `type`, `state`, `inputType`, `label`, `placeholder`, `supportingIcon`, `showLabelInfoIcon`, `disabled`, `readonly`, `value` |

For Button, the Storybook usage example lives in `projects/scanntech-ui/src/components/button/stories/button.stories.ts`.

For TextField, the Storybook usage example lives in `projects/scanntech-ui/src/components/text-field/stories/text-field.stories.ts`.

---

## Step-by-Step Process

Follow this order every time:

1. **Read the component source**
   - Open the component `.ts` file.
   - Record selector, inputs, exported enum arrays, and any runtime constraints.

2. **Read Storybook**
   - Open the main `*.stories.ts` file plus any variant-specific stories.
   - Capture `argTypes`, default `args`, and the canonical render template.

3. **Fill the contract template**
   - Use [component-contract-template.md](assets/component-contract-template.md).
   - Resolve naming mismatches now, before any `.figma.ts` edit.

4. **Check or create Code Connect setup**
   - Confirm `figma.config.json` exists at the repo root.
   - Confirm the repo uses the HTML parser.
   - Confirm mapping files live under `projects/scanntech-ui/src/components/{component}/figma/`.

5. **Generate the starter mapping**
   - Run `npx figma connect create "<figma-node-url>"`.
   - Do not hand-author the first wrapper or imports.

6. **Edit the mapping**
   - Use Figma property labels that make sense in Dev Mode.
   - Map each label to the exact Angular input value used by the repo.
   - Keep the example snippet minimal, canonical, and a single tagged template literal.

7. **Publish and verify**
   - Publish with Code Connect.
   - Open the linked Figma node in Dev Mode.
   - Verify the snippet matches the component API and variant state.

8. **Report gaps clearly**
   - Missing input in code
   - Invalid Figma variant combination
   - Storybook missing a canonical example
   - Token mismatch that needs `scannlab-figma-token-matcher`

---

## Reference Component Walkthrough

Use this when starting Code Connect in a repo or onboarding a new teammate. The goal is to produce one high-quality mapping as a reference, then scale.

**Recommended first component:** `button` (if unavailable, use `text-field`).

1. **Contract capture (single component)**
   - Fill [component-contract-template.md](assets/component-contract-template.md) completely.
   - Confirm selector, inputs, enums, and constraints from source.
   - Confirm defaults and labels from Storybook `argTypes`/`args`.

2. **Generate mapping starter**
   - Run `npx figma connect create "<figma-node-url>"`.
   - Move file into `projects/scanntech-ui/src/components/{component}/figma/` and rename to `{component}.figma.ts`.

3. **Edit mapping**
   - Map Figma properties to Angular inputs only.
   - Keep a minimal Angular snippet (no Storybook wrappers).
   - Match defaults to Storybook `args`.

4. **Publish and validate**
   - Run `npx figma connect publish`.
   - Verify in Figma Dev Mode with at least 2 variants.

5. **Turn the result into a reference**
   - Note any repo-specific quirks in the mapping file header or the skill.
   - Use the same mapping structure for the next components.

---

## First Component Checklist (Reference Quality)

- Component source read and selector confirmed
- Inputs and enums captured from code
- Storybook `argTypes` labels copied for Dev Mode
- Contract template filled and saved
- Mapping file generated (not hand-authored)
- Snippet is minimal and matches Angular usage
- Constraints validated against repo rules
- Published and verified in Dev Mode

---

## Example Guides

Use the examples in [assets/code-connect-examples.md](skills/scannlab-code-connect/assets/code-connect-examples.md) as reference formats for contracts and mappings.

---

## Batch Cadence for Remaining Components

Use this repeatable cadence after the first reference mapping is approved.

1. **Queue 3-5 components per batch** (group by similar API or patterns)
2. **Contract pass** (read source + Storybook, fill contracts)
3. **Mapping pass** (generate starters, then edit)
4. **Publish + verify** (spot-check 1-2 variants per component)
5. **Log gaps** (mismatches, missing Storybook coverage, token issues)

---

## Decision Tree

```
Need to extract Figma layer/node specs?        → Use `scannlab-figma-extractor` first
Need selector or public API?                   → Read component source first
Need enum values or defaults?                  → Read exported const arrays and Storybook args
Need property labels for Dev Mode?             → Reuse Storybook argTypes vocabulary
Need the Code Connect wrapper syntax?          → Generate starter with `figma connect create`
Figma exposes raw design values to map?         → Use `scannlab-figma-token-matcher` first
Storybook is missing the state?                → Use `scannlab-storybook`
Angular API must change?                       → Use `scannlab-best-practices`
```

---

## Commands

```bash
# Install or verify the Code Connect CLI and HTML helper using the current Figma quickstart
# Then verify the generated mapping imports the expected HTML helper path.

# Create the mapping directory
mkdir -p projects/scanntech-ui/src/figma

# Generate a starter mapping from a Figma node URL
npx figma connect create "<figma-node-url>"

# Publish all mappings
npx figma connect publish
```

If the generated dependency names differ from the current Figma documentation, follow the generated file and the current quickstart, not old examples.

---

## Deliverable Expectations

When finishing a Code Connect task in this repo, provide:

- The component(s) mapped
- The Figma node URL(s)
- The Angular selector(s)
- The props mapped and any excluded props
- Any contract mismatches or follow-up work

---

## Resources

- **Figma extraction**: [../scannlab-figma-extractor/SKILL.md](../scannlab-figma-extractor/SKILL.md) — **Use first to extract raw layer/node specs from Figma links.**
- **Token matching**: [../scannlab-figma-token-matcher/SKILL.md](../scannlab-figma-token-matcher/SKILL.md) — For mapping Figma design values to ScannLab tokens.
- **Template**: [component-contract-template.md](assets/component-contract-template.md)
- **Examples**: [assets/code-connect-examples.md](skills/scannlab-code-connect/assets/code-connect-examples.md)
- **Angular source conventions**: [../scannlab-best-practices/SKILL.md](../scannlab-best-practices/SKILL.md)
- **Storybook conventions**: [../scannlab-storybook/SKILL.md](../scannlab-storybook/SKILL.md)
