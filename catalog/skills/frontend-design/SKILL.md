# Frontend Design Guide

## When to Use

Use this skill when:

- You are designing, building, or restyling a UI component, page, or layout in an existing project.
- You are adding new visual elements that must match the project's existing design language.
- You are refactoring styling or structure of frontend code to align with established patterns.
- You need to choose between UI components, tokens, or styles already available in the project.
- You are starting a greenfield project and need to establish a design direction before building.

Do not use this skill for:

- Backend, API, or data-layer tasks with no UI surface.
- Design tool work (Figma, Sketch) unrelated to code implementation.
- Projects where the user has explicitly opted out of stack detection.

---

## Routing Map

Always run stack detection first. Never skip to design.

| Step | Intent | Sub-agent |
| --- | --- | --- |
| 0 (always first) | Detect framework, UI library, CSS approach, tokens, and existing patterns | [agents/stack-detector.md](agents/stack-detector.md) |
| 0b (if no DESIGN.md and no existing components) | Gather design intent and create DESIGN.md | [agents/design-context-setter.md](agents/design-context-setter.md) |
| 1 (only after confirmation) | Design and implement components using confirmed stack | [agents/component-designer.md](agents/component-designer.md) |
| 2 (optional) | Add motion and micro-interactions | [agents/motion-designer.md](agents/motion-designer.md) |
| 3 (optional) | Evaluate quality and refine the output | [agents/visual-refiner.md](agents/visual-refiner.md) |

---

## Standard Execution Sequence

1. **Run stack detection** — always start with `stack-detector`, no exceptions.
2. **Check for DESIGN.md** — if it exists, read it before any design work. If it does not exist and the project has no existing components to sample, run `design-context-setter` to create it.
3. **Present findings to the user** — surface the detected stack and any DESIGN.md context clearly, then ask for explicit confirmation.
4. **If anything is unclear or ambiguous, ask** — do not proceed with partial or uncertain information.
5. **Scan existing tokens and components** — read what already exists before proposing anything.
6. **Design with confirmed context only** — hand off to `component-designer` only after steps 2–4 are complete.
7. **Optionally add motion** — invoke `motion-designer` if the component needs micro-interactions.
8. **Optionally refine** — invoke `visual-refiner` for a quality pass before handoff.

---

## DESIGN.md — Persistent Design Brief

`DESIGN.md` is a plain Markdown file at the project root that captures the project's design intent: target users, brand personality, aesthetic direction, color strategy, typography intent, spacing philosophy, and motion character.

It is created by `design-context-setter` on greenfield projects and can be updated at any time by the user.

**Every agent in this skill reads `DESIGN.md` if it exists before making aesthetic decisions.** This prevents design drift between sessions.

```bash
# Check if DESIGN.md exists before starting work
cat DESIGN.md 2>/dev/null
```

If `DESIGN.md` exists, surface its contents in the stack confirmation step. If it conflicts with what the stack detector found (e.g., DESIGN.md says "warm neutrals" but all existing tokens are cool blues), surface the conflict and ask the user which to follow.

---

## Critical Patterns

### Pattern 1: Tech Stack Detection is Non-Negotiable

Before writing a single line of UI code or proposing any design, run [agents/stack-detector.md](agents/stack-detector.md).

This means:

- Reading `package.json` to identify the framework and installed libraries.
- Detecting CSS approach (Tailwind, CSS Modules, styled-components, Sass, vanilla).
- Finding existing design tokens (CSS custom properties, theme files, `tokens.json`).
- Sampling real components from the project to understand naming, structure, and styling conventions.

If `package.json` is missing or the project root is unclear, stop and ask the user where to look.

Never assume a library is present based on file extensions alone — verify it in dependencies.

### Pattern 2: Never Invent Tokens — Read First

Before using any color, spacing, font size, border radius, shadow, or z-index value:

1. Search for CSS custom properties: `grep -r "var(--" src/`
2. Check for a theme file: `tailwind.config.ts`, `theme.ts`, `tokens.json`, `_variables.scss`
3. Check for a design system config: `@mui/material`, `chakra-ui/theme`, `shadcn/ui` config

If the token does not exist in the project, do not invent it. Ask the user: "This project doesn't define a token for X. Should I add one, or is there an existing value I missed?"

### Pattern 3: Confirm Before Every Design Decision

At every fork — layout choice, component variant, color, interaction pattern — if the right answer is not derivable from the existing code or from `DESIGN.md`, ask the user.

Examples of things that require confirmation:

- Which existing component to base a new one on.
- Whether to use Tailwind utility classes or a CSS module.
- Whether to match a specific existing page's spacing rhythm or start fresh.
- Which breakpoints the project already targets.

Short, specific questions are better than long ambiguous ones. One question at a time if possible.

### Pattern 4: Follow the Project's Visual Language

After stack detection, read 3–5 existing components before proposing any design. Identify:

- The naming convention (PascalCase components, BEM CSS, camelCase tokens, etc.)
- The composition pattern (atomic components, compound components, render props, slots)
- The styling approach (co-located styles, global theme, utility-first classes)

Every new component or style must feel like it was written by the same team that wrote the existing code — not imported from a different design system.

If no existing components are found, use `DESIGN.md` as the visual language reference. If neither exists, run `design-context-setter` before proceeding.

---

## What Not To Do

These are the most critical rules. Violating any of them produces AI slop.

- **Never assume a UI library is present** without verifying it in `package.json`. Shadcn and Radix look similar in JSX — check the deps.
- **Never pick colors, fonts, or spacing values not already in the project**. If the project has no purple, do not introduce purple.
- **Never use Inter as a default font** unless it is explicitly declared in the project. Inter is a sign of uncontextualized AI output.
- **Never generate a component without reading at least one existing component first** (or DESIGN.md if no components exist). The project's conventions must be the template.
- **Never apply a generic layout** (hero + cards + CTA, standard nav + footer) without verifying the project already uses or wants that structure.
- **Never chain design decisions silently**. If one decision implies a downstream choice (e.g., using a grid library implies a layout system), surface it.
- **Never proceed after ambiguity**. If the detected stack is inconsistent (e.g., Tailwind and styled-components both present), stop and ask which one is canonical.
- **Never treat a partial stack detection as complete**. If `package.json` was readable but no component files were found, say so and ask for the component directory.
- **Never ship a "placeholder" or "you can customize this later" design**. Every value must be intentional and project-derived.
- **Never skip the confirmation step** even if the stack looks obvious. One confirmation prevents ten corrections.
- **Never ignore DESIGN.md when it exists**. It represents deliberate decisions the user has already made.

---

## Decision Tree

```text
User asks for UI work
  -> Has stack-detector been run and confirmed by user?
       NO  -> Run stack-detector, present findings, ask for confirmation
       YES -> Continue

  -> Does DESIGN.md exist?
       YES -> Read it; surface any conflicts with detected stack
       NO  -> Are there existing components to sample?
                YES -> Sample them (Pattern 4)
                NO  -> Run design-context-setter to create DESIGN.md

Is the requested component similar to an existing one in the project?
  YES -> Read the existing component, use it as the structural and styling template
  NO  -> Ask the user which existing component is closest, or if this is a net-new pattern

Does the design require a token/value (color, spacing, font) not yet found in the project or DESIGN.md?
  YES -> Ask the user: add a new token, use an existing one, or clarify?
  NO  -> Use the existing token

Is the CSS approach Tailwind?
  YES -> Use only classes declared in tailwind.config; no arbitrary values unless project already uses them
  NO  -> Continue

Is the CSS approach CSS Modules or Sass?
  YES -> Follow the naming convention of existing .module.css or .scss files exactly
  NO  -> Continue

Is the CSS approach styled-components or CSS-in-JS?
  YES -> Match the theme structure; use theme.colors/spacing/typography from the existing theme provider
  NO  -> Use whatever CSS approach was detected; if none detected, ask the user

Ready to implement?
  YES -> Hand off to component-designer with full confirmed context

After generation:
  -> Does the component need motion? -> Invoke motion-designer
  -> Does the output need a quality pass? -> Invoke visual-refiner
```

---

## Code Examples

### Example 1: Detecting CSS custom properties in a project

```bash
# Find all CSS variables defined at :root
grep -rn ":root" src/ --include="*.css" --include="*.scss"

# Find all usages of CSS custom properties
grep -rn "var(--" src/ --include="*.css" --include="*.scss" --include="*.tsx" --include="*.vue"
```

### Example 2: Identifying a Tailwind project and reading its token config

```bash
# Check if Tailwind is installed
cat package.json | grep tailwind

# Read the full color/spacing/font token config
cat tailwind.config.ts
```

### Example 3: Sampling existing components to learn the pattern

```bash
# Find all component files in a React project
find src/components -name "*.tsx" | head -5

# Read one to understand structure and styling approach
cat src/components/Button/Button.tsx
```

### Example 4: Detecting shadcn/ui vs MUI vs Chakra

```bash
# shadcn/ui (no package — installed as local files)
ls src/components/ui/

# MUI
grep '"@mui/material"' package.json

# Chakra UI
grep '"@chakra-ui/react"' package.json

# Radix Primitives (often underlies shadcn)
grep '"@radix-ui' package.json
```

---

## Commands

```bash
# Check for DESIGN.md at project root
cat DESIGN.md 2>/dev/null

# Read project dependencies
cat package.json | grep -A 50 '"dependencies"'

# Detect CSS approach from file extensions
find src -name "*.module.css" | head -3       # CSS Modules
find src -name "*.module.scss" | head -3      # Sass Modules
grep -rl "styled-components\|emotion" src/    # CSS-in-JS
grep -rl "cn(\|clsx\|classnames" src/         # Tailwind class merging

# Find design token files
find . -name "tokens.json" -o -name "theme.ts" -o -name "_variables.scss" 2>/dev/null

# List existing components
find src/components -maxdepth 2 -name "*.tsx" -o -name "*.vue" | head -10
```

---

## Resources

- Stack detection procedure: [agents/stack-detector.md](agents/stack-detector.md)
- Design context setup (greenfield): [agents/design-context-setter.md](agents/design-context-setter.md)
- Component design rules: [agents/component-designer.md](agents/component-designer.md)
- Motion and micro-interactions: [agents/motion-designer.md](agents/motion-designer.md)
- Visual quality refinement: [agents/visual-refiner.md](agents/visual-refiner.md)
- Full scan checklist: [assets/stack-scan-checklist.md](assets/stack-scan-checklist.md)
- Aesthetic archetypes reference: [assets/aesthetic-archetypes.md](assets/aesthetic-archetypes.md)
