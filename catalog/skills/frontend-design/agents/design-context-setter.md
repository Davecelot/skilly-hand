# Design Context Setter

## Goal

Gather the project's design intent once, then write it to `DESIGN.md` at the project root. This file becomes the single source of truth for all design decisions across sessions and across agents. Every other agent in this skill reads `DESIGN.md` before making aesthetic choices.

This agent is modeled on how modern AI-first design platforms (Stitch, v0, Galileo) treat a persistent design brief — a short, always-available document that anchors every generation.

---

## When to Use

Run this agent when:

- `DESIGN.md` does not exist at the project root and the project has no existing components to read style conventions from.
- The user starts a greenfield project (no `src/components`, no existing UI, blank or near-blank codebase).
- The user says "let's set up the design" or "define the visual direction" before any component work.
- The stack detector finds no design tokens and no existing components to sample.

Do not run this agent when:

- `DESIGN.md` already exists and the user has not asked to update it. Read it instead.
- The project has existing components — stack detection provides sufficient context for matching.
- The user has explicitly said "just match what's there."

---

## Check First

Before starting the interview, check:

```bash
# Is DESIGN.md already present?
cat DESIGN.md 2>/dev/null

# Are there existing components to learn from instead?
find src -name "*.tsx" -o -name "*.vue" -o -name "*.svelte" 2>/dev/null | head -5
```

If `DESIGN.md` exists, surface it to the user and ask: "A `DESIGN.md` already exists. Should I use it as-is, update it, or start fresh?"

If components exist but no `DESIGN.md`, suggest: "I found existing components. I can either read those to infer style conventions, or we can write a `DESIGN.md` to set a deliberate direction. Which do you prefer?"

---

## Interview Protocol

Ask these questions one at a time. Do not front-load the full list.

**1. Who is this for?**
"Who are the primary users of this interface? (e.g., technical professionals, general public, enterprise ops teams, consumers aged 25–35)"

**2. What does this product do — in one sentence?**
"Describe the product's core value proposition in a single sentence."

**3. What's the brand personality?**
"Pick 3 adjectives that describe how this interface should feel. Examples: sharp, friendly, calm, bold, minimal, playful, authoritative, warm, precise."

**4. Are there any visual references?**
"Any products, sites, or brands whose aesthetic this should feel close to? (Optional — skip if none.)"

**5. What's the accessibility baseline?**
"Should we target WCAG 2.2 Level AA (standard), AAA (enhanced), or is there a specific requirement? Default is AA."

**6. Any hard constraints?**
"Are there colors, fonts, or patterns that must be used or must be avoided? (brand guidelines, corporate requirements, legal restrictions)"

After collecting answers, propose a brief aesthetic direction and ask for confirmation before writing the file.

---

## Output Format

Write the following structure to `DESIGN.md` at the project root. Every field must come from user answers — no invented values.

```markdown
# DESIGN.md

> This file is the canonical design brief for this project.
> All AI agents and contributors should read it before making visual decisions.
> Update it when the design direction changes.

## Product

**What it is:** [one-sentence description]
**Primary users:** [user description]

## Brand Personality

**Adjectives:** [3 adjectives from user]
**Visual references:** [references, or "none specified"]

## Aesthetic Direction

[2–4 sentences written in plain language describing the desired look and feel.
Derived from the adjectives and references above.
Example: "Clean, high-contrast layouts with generous whitespace. Typography-driven hierarchy — let size and weight do the work before reaching for color. Warm neutrals, not pure grays. Motion should feel intentional and restrained."]

## Color Strategy

> Intent only — not token declarations. Actual color values are determined after stack detection reads the project's existing tokens.

**Approach:** [e.g., "Monochromatic with a single warm accent" / "High contrast, dark-first" / "Muted palette, earthy tones" / "To be defined — read from stack tokens"]
**Accent color intent:** [e.g., "Call-to-action only" / "Interactive states only" / "Not yet defined"]

## Typography Intent

> Intent only — not font declarations. Actual font families and sizes are determined after stack detection reads the project's existing tokens or dependencies.

**Character:** [e.g., "Geometric sans-serif for clarity" / "Humanist serif for warmth" / "Monospace for technical credibility" / "To be determined from stack"]
**Scale approach:** [e.g., "Tight utilitarian scale for app UI" / "Dramatic editorial scale for marketing" / "Match existing project scale"]

## Spacing Philosophy

[e.g., "Generous whitespace — let content breathe" / "Dense, information-rich — prioritize data density" / "Match existing project rhythm"]

## Motion Character

[e.g., "Subtle and purposeful — transitions only, no decorative motion" / "Expressive — micro-interactions on every interaction" / "Minimal — respect reduced-motion by default"]

## Accessibility

**Target level:** [WCAG 2.2 AA / AAA / project-specific]
**Hard constraints:** [any must-have or must-avoid rules from user]

## Notes

[Any other constraints, references, or decisions captured during setup]
```

---

## After Writing DESIGN.md

Tell the user:

> `DESIGN.md` has been created at the project root. Every design agent in this skill will read it before making visual decisions. You can edit it at any time — it's plain Markdown.
>
> Ready to proceed with stack detection and component design.

Then hand off to `stack-detector.md`.

**If the assistant cannot write files** (sandboxed or read-only environment): Tell the user the DESIGN.md content that would have been written, and ask them to create the file manually or paste it into the project. Do not block on the write failure — treat the content as confirmed context for the current session even if the file was not persisted.

---

## Updating DESIGN.md

If the user asks to update the design direction mid-project:

1. Read the current `DESIGN.md`.
2. Ask which section they want to change.
3. Make only the requested change — do not rewrite the whole file.
4. Confirm the update before writing.

Never overwrite the entire file silently.
