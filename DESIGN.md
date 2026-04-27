# DESIGN.md

> This file is the canonical design brief for this project.
> All AI agents and contributors should read it before making visual decisions.
> Update it when the design direction changes.

## Product

**What it is:** skilly-hand is a portable AI agent skill orchestrator that installs curated, stack-aware workflow skills into coding projects from one CLI.
**Primary users:** Developers, technical founders, and AI-assisted teams who want consistent agent behavior across Codex, Claude Code, Cursor, Copilot, Gemini, Windsurf, Antigravity, TRAE, and OpenCode.
**Core promise:** Skill today. Grow tomorrow. One command teaches the repo how its agents should work.

## Verified Frontend Context

**App surface:** `site/` workspace.
**Stack:** Vite 8, React 19, plain JSX, plain CSS.
**UI library:** None detected.
**Styling approach:** CSS custom properties in `site/src/styles.css`; component classes are authored directly in the stylesheet.
**Current tokens:** `--ink`, `--muted`, `--paper`, `--panel`, `--line`, `--strong-line`, `--accent`, `--accent-soft`, `--accent-wash`, `--focus`, `--shadow`.
**Design rule:** Prefer evolving these existing CSS variables over introducing an external design system.

## Brand Personality

**Adjectives:** precise, natural, capable, calm, curious, hands-on.
**Tone of voice:** Helpful. Smart. Exploratory. Human.
**Brand idea:** Nature x Pixels. The identity should feel like organic growth being routed through a crisp digital system.
**Do not feel like:** generic SaaS, crypto dashboard, corporate AI gradient, playful toy, or documentation-only utility.

## Visual References

Use the attached skilly-hand brand-book pages as the primary visual reference. They establish:

- Pixel cursor hand plus leaf sprout as the central signature.
- Botanical halftone imagery dissolving into square pixels.
- Off-white paper fields, deep pine contrast blocks, teal accents, and mint washes.
- Thin construction lines, crosshair marks, grid details, page numbers, and small mono labels.
- Asymmetric editorial layouts with generous open space and dense texture at the edges.
- Brand applications that mix logo, command-like typography, natural imagery, and modular UI blocks.

Secondary references should reinforce output quality without overriding the brand-book system:

- `getdesign.md`: reference for a useful, persistent design brief that gives future agents durable context before they make visual decisions.
- `autoskills.sh`: reference for a compact, command-first developer-tool landing page that keeps installation, workflow, and utility immediately clear.

## Aesthetic Direction

The website should feel like a brand-book page that became an interactive developer tool. Keep the product utility first, but give it a distinctive system: botanical texture for growth, pixel grids for agent routing, and cursor-hand details for action.

The first viewport should make `skilly-hand` unmistakable. Use the name, install command, supported targets, and workflow routing as the primary signals. Avoid a generic hero card layout; the hero should read as a composed brand system with useful controls embedded inside it.

Prefer an editorial interface: thin rules, labeled sections, numbered steps, gridded panels, small mono metadata, and restrained iconography. Let imagery and texture gather around edges or supporting panels so the core command, catalog search, and skill details stay readable.

## Logo And Signature

**Primary mark:** Pixel hand cursor with sprout. It represents intentional digital action plus learning growth.
**Usage:** Treat the mark as a signature, not decoration. Use it in the nav, hero, footer, app icon contexts, and selected emphasis moments.
**Avoid:** Repeating the hand icon as a background pattern, using it as a bullet everywhere, or placing it near dense body copy.
**Clear space:** Leave at least the visual height of the sprout around the mark when used with the wordmark.
**Minimum digital size:** Keep the full lockup legible at roughly 90 px wide or larger; use icon-only below that.

## Color Strategy

> Intent and current token mapping. Actual values should continue to live in CSS tokens, not inline component styles.

**Primary palette:**

- Core teal: brand accent and main action color. Current closest token: `--accent`.
- Deep pine: dark anchor for contrast blocks, footer, and high-emphasis UI. Current closest tokens: `--ink` and `--strong-line`; a greener pine can be introduced only as a token.
- Mist mint: calm supporting surface for pixel grids, halftone overlays, and selected states. Current closest tokens: `--accent-soft` and `--accent-wash`.
- Soft ivory: main page background. Current closest token: `--paper`.
- Moss gray: secondary text, separators, and quiet metadata. Current closest tokens: `--muted` and `--line`.

**Usage ratios:** Keep ivory dominant, pine/ink as the structural anchor, teal as the active signal, and mint as atmosphere. Teal should highlight decisions and state, not flood entire sections.

**Accessibility:** Normal text must meet WCAG 2.2 AA contrast. On light backgrounds, prefer pine/ink for text and teal for headings or labels only when contrast is verified. On dark backgrounds, use ivory text and mint/teal accents.

## Typography Intent

> Font declarations should be validated against project dependencies before implementation.

**Desired hierarchy from references:**

- Display/headlines: geometric sans with a technical edge, similar in spirit to Space Grotesk Bold.
- Body/UI: highly readable sans, similar in spirit to Inter Regular.
- Labels/metadata/commands: mono voice, similar in spirit to IBM Plex Mono.

**Current implementation:** The site currently uses system sans for body and system mono for commands and labels. That is acceptable until web fonts are deliberately added.

**Rules:**

- Product name and major headings may be large and assertive.
- Interface panels, cards, and catalog rows should use compact, scannable type.
- Mono labels should be short, uppercase where useful, and never spaced with negative letter spacing.
- Commands, file paths, skill ids, versions, and route labels should use mono treatment.

## Graphic System

Use these elements as the shared visual language:

- Pixel grid: small square grids for transitions, scan effects, routing diagrams, and state feedback.
- Dot/halftone texture: bridge between botanical imagery and digital surfaces.
- Sprout motif: small growth cue for brand moments, onboarding, or success states.
- Thin framing lines: guide the eye and structure content, without enclosing every section in a heavy card.
- Crosshair marks: sparse alignment details for page corners, hero composition, or footer metadata.
- Modular UI blocks: command rows, skill rows, target cards, and detail panes should align to a clear grid.

**Composition rules:** Modular, asymmetric, breathable, layered. Combine dense texture with open space. Use pixels for transitions and state changes, not visual noise.

## Imagery And Texture

Imagery should blend the organic and digital:

- Macro botanicals: leaves, sprouts, veins, dew, soil, and tactile close crops.
- Pixel erosion: natural forms dissolving into square pixels.
- Halftone atmosphere: misty forests, grain, dot screens, and soft depth.
- Hands and interaction: cursor hands, gestures, and direct manipulation where they reinforce action.
- Grid interfaces: clean diagrams, command surfaces, progress, catalog routing, and agent targets.

For the website, imagery can be implemented as real raster assets, generated assets, CSS masks, or carefully built texture layers. Avoid stock-like hero photos that do not show the brand system. Avoid purely abstract gradients.

## Layout Direction

**Page model:** One-page landing experience with three primary zones: hero/setup overview, install flow, searchable skill catalog.
**Hero:** Product name, value proposition, install command, workflow routing, and supported targets should all be visible or implied in the first viewport.
**Sections:** Use full-width bands and editorial grids. Cards are for repeated items, command modules, skill rows, and tool panes only.
**Catalog:** Keep it work-focused and dense. Search, list, selected detail, source path, and raw skill content should remain easy to scan.
**Footer:** Treat as brand-book metadata: logo/name, version-like cues, links, and small pixel trail details.

## Interaction And Motion

Motion should feel like pixels resolving into clarity:

- Command copy feedback may use a short pixel scan or dither burst.
- Skill filtering can subtly clarify selected rows without moving layout.
- Target marquees may move slowly and pause on hover/focus.
- Step progression can use line, pixel, or cursor cues.
- Respect `prefers-reduced-motion`; all content must remain complete without animation.

Motion should be brief, purposeful, and tied to user action or system state.

## Accessibility

**Target level:** WCAG 2.2 Level AA.
**Hard constraints:**

- All controls must be keyboard accessible.
- Focus states must be visible against both light and dark surfaces.
- Text cannot depend on texture, animation, or imagery to be understood.
- Dense halftone or pixel overlays must not sit behind paragraph text unless contrast is verified.
- The catalog must remain usable at mobile widths and with reduced motion enabled.

## Implementation Guardrails

- Keep the site one page unless a concrete navigation need emerges.
- Prefer existing CSS variables; add new tokens only when the current set cannot express the brand-book system cleanly.
- Do not introduce a UI library for visual polish alone.
- Do not use large rounded marketing cards; keep radii minimal unless matching an existing app-icon or device mockup context.
- Do not make a beige-only or teal-only page. Balance soft ivory, deep pine, teal, mint, and gray.
- Use icons and visual marks sparingly. The hand/sprout signature should remain special.
- Do not add instructional in-app text explaining the visual system. Let layout, labels, and interactions carry the experience.
- Keep text inside buttons, command rows, and catalog items resilient at mobile widths.

## Content Priorities

- What skilly-hand is.
- How install works.
- Which assistants and skill targets are supported.
- Which skills are available.
- How to deep dive into a skill.
- How to run install and doctor checks.

## Notes

- The attached brand-book direction is primary; `getdesign.md` and `autoskills.sh` remain secondary references for brief structure and command-first clarity.
- The product should still feel command-first and useful, but the memorable layer is Nature x Pixels.
- Future UI work should treat this file as the source of truth before changing `site/src/main.jsx` or `site/src/styles.css`.
