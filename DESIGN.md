# DESIGN.md

> This file is the canonical design brief for this project.
> All AI agents and contributors should read it before making visual decisions.
> Update it when the design direction changes.

## Product

**What it is:** skilly-hand is a portable AI agent skill orchestrator that installs curated, stack-aware workflow skills into coding projects from one CLI.
**Primary users:** Developers, technical founders, and AI-assisted teams who want consistent agent behavior across Codex, Claude Code, Cursor, Copilot, Gemini, Windsurf, Antigravity, TRAE, and OpenCode.

## Brand Personality

**Adjectives:** minimal, precise, approachable.
**Visual references:** getdesign.md for a useful persistent design brief pattern; autoskills.sh for a compact command-first developer-tool landing page.

## Aesthetic Direction

The landing page should feel like a sharp developer utility, not a broad SaaS marketing site. Use strong typography, calm whitespace, and a visual system built from the product itself: terminal commands, skill cards, routing arrows, and install targets. Keep the page one-screen-at-a-time readable with as few sections as possible, while making the brand memorable through composition, rhythm, and small interactive details.

## Color Strategy

> Intent only -- not token declarations. Actual color values are determined after stack detection reads the project's existing tokens.

**Approach:** High-contrast neutral foundation with one restrained accent for command focus, interactive states, and skill taxonomy.
**Accent color intent:** Use sparingly for primary CTA, active filter state, and visual highlights in the "how it works" flow.

## Typography Intent

> Intent only -- not font declarations. Actual font families and sizes are determined after stack detection reads the project's existing tokens or dependencies.

**Character:** Clear sans-serif for product explanation with monospace treatment for commands, file paths, and agent targets.
**Scale approach:** Marketing-readable but compact; one strong hero headline, then dense, scannable supporting sections.

## Spacing Philosophy

Generous enough to feel premium, but not section-heavy. Prefer compact bands and purposeful grids over large decorative gaps.

## Motion Character

Subtle and purposeful. Motion should clarify state changes such as command copy feedback, skill filtering, and step progression; respect reduced-motion by default.

## Accessibility

**Target level:** WCAG 2.2 Level AA.
**Hard constraints:** The page must remain understandable without animation, must have keyboard-accessible controls, and must preserve readable contrast for command snippets and skill cards.

## Notes

- One-page landing only.
- Primary content: what skilly-hand is, how it works, which skills are available, how to deep dive into them, and how to install.
- Avoid many sub-sections or documentation-style sprawl.
- Do not add a generic hero-card layout; let the product name, command, and skill system be the first-viewport signal.
