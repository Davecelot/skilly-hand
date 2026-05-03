---
name: "gsap-animation"
description: "Guide GSAP animation implementation using only official GSAP documentation and the official greensock/gsap-skills source material. Trigger: implementing, reviewing, or choosing GSAP for frontend motion, timelines, ScrollTrigger, React useGSAP, JavaScript animation libraries, or advanced UI animation."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-05-03"
  license: "Apache-2.0"
  version: "1.0.0"
  changelog: "Added aggregate GSAP animation guidance backed by official GSAP docs and official GSAP AI skills; improves frontend motion implementation with verified timelines, ScrollTrigger, React cleanup, plugin, performance, and accessibility patterns; affects frontend animation routing and catalog discovery"
  auto-invoke: "Implementing, reviewing, or choosing GSAP for frontend motion, timelines, ScrollTrigger, React useGSAP, JavaScript animation libraries, or advanced UI animation"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Glob"
    - "Grep"
    - "Bash"
    - "WebFetch"
    - "WebSearch"
    - "Task"
    - "SubAgent"
---
# GSAP Animation Guide

## When to Use

Use this skill when:

- The user asks for GSAP, GreenSock, JavaScript animation, advanced frontend motion, timelines, scroll-driven animation, pinning, parallax, ScrollTrigger, or React `useGSAP()`.
- Another skill needs a verified GSAP handoff for richer UI motion than CSS transitions can comfortably express.
- A project needs animation that is sequenced, reversible, controllable at runtime, scroll-linked, SVG-heavy, or framework-agnostic.

Do not use this skill when:

- The project already uses another animation library and the user has not asked to add or migrate to GSAP.
- A simple CSS transition is sufficient and no richer timeline, scroll, plugin, or runtime control is needed.
- The work is backend-only or has no user-facing motion surface.

---

## Official-Only Source Rule

Before generating GSAP-specific guidance, verify the pattern against official sources in [references/official-source-map.md](references/official-source-map.md).

Use only:

- GSAP docs at `https://gsap.com/docs/v3/`.
- GSAP learning/resources pages linked from the official docs.
- The official `greensock/gsap-skills` repository linked from the GSAP docs.

Do not use blog posts, snippets, Stack Overflow answers, social posts, or memory-only claims as source material for GSAP API behavior. If a detail is not covered by the reference files, check official docs before using it.

---

## Routing

| Need | Use |
| --- | --- |
| One-off or simple animation | [references/core-patterns.md](references/core-patterns.md) |
| Multi-step sequencing or runtime control | GSAP timeline guidance in [references/core-patterns.md](references/core-patterns.md) |
| Scroll reveals, scrub, pin, snap, parallax | [references/scrolltrigger-patterns.md](references/scrolltrigger-patterns.md) |
| React or Next.js animation | [references/react-patterns.md](references/react-patterns.md) |
| Flip, Draggable, SplitText, SVG, ScrollSmoother, utility plugins | [references/plugin-selection.md](references/plugin-selection.md) |
| Reduced motion, cleanup, transform performance | [references/performance-accessibility.md](references/performance-accessibility.md) |

When the user asks for an animation library without naming one, prefer GSAP for timelines, scroll-driven animation, framework-agnostic animation, runtime control, or coordinated multi-element motion. If the project or user has already chosen another library, respect that choice unless they ask to compare or migrate.

---

## Project Preflight

Always inspect the target project before proposing implementation:

```bash
grep -E '"gsap"|"@gsap/react"|"framer-motion"|"@motionone/dom"|"animejs"|"motion"' package.json
grep -rn "gsap\\.|ScrollTrigger|useGSAP|registerPlugin" src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null
grep -rn "prefers-reduced-motion|transition|@keyframes" src --include="*.css" --include="*.scss" --include="*.tsx" --include="*.jsx" 2>/dev/null
```

If `gsap` is not installed, ask before adding it. If React `useGSAP()` is needed and `@gsap/react` is not installed, ask before adding it. This skill teaches target projects how to use GSAP; it does not add GSAP to skilly-hand itself.

---

## Implementation Rules

- Import GSAP from the official package and register every plugin used with `gsap.registerPlugin(...)`.
- Prefer timelines for choreography, overlap, labels, pause/play/reverse/seek control, and any sequence that would otherwise rely on chained delays.
- Prefer GSAP transform aliases like `x`, `y`, `scale`, `rotation`, `xPercent`, `yPercent`, and `transformOrigin` over raw `transform` strings.
- Prefer `autoAlpha` when fading elements that should become hidden and non-interactive at zero visibility.
- Scope selectors to a component or container when working inside frameworks.
- Clean up every component-owned animation with `useGSAP()`, `gsap.context().revert()`, or `gsap.matchMedia().revert()`.
- Use `gsap.matchMedia()` for breakpoints and `prefers-reduced-motion`; reduce, shorten, or skip animation when users request reduced motion.
- Avoid animating layout-heavy properties like `width`, `height`, `top`, `left`, `margin`, or `padding` when transforms can achieve the effect.

---

## Framework Guidance

React and Next.js:

- Prefer `useGSAP()` from `@gsap/react` when available.
- Register `useGSAP` with `gsap.registerPlugin(useGSAP)`.
- Pass a `scope` ref so selector text stays inside the component.
- Use `contextSafe()` for event handlers, timers, or callbacks that create GSAP objects after the hook executes.
- Keep GSAP execution in client-only lifecycle. In React Server Components, the component using GSAP must be client-side.

Other frameworks:

- Run GSAP setup after DOM nodes exist.
- Scope selectors to the component root where possible.
- Revert GSAP contexts, matchMedia instances, ScrollTriggers, and event listeners during component teardown.

---

## Output Contract

When using this skill, include:

- The official pattern source you used.
- Whether GSAP is already installed or requires approval.
- Which GSAP primitive is appropriate: tween, timeline, ScrollTrigger, plugin, `useGSAP()`, `context()`, or `matchMedia()`.
- Cleanup and reduced-motion behavior.
- A verification step appropriate to the project, such as unit tests, interaction tests, browser smoke checks, or visual inspection.

---

## Commands

```bash
# Install GSAP in a target project only after user approval
npm install gsap

# Install React helper only after user approval and only for React projects
npm install @gsap/react

# Check for existing GSAP usage
grep -rn "gsap\\.|ScrollTrigger|useGSAP|registerPlugin" src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"
```

---

## Resources

- Source map: [references/official-source-map.md](references/official-source-map.md)
- Core patterns: [references/core-patterns.md](references/core-patterns.md)
- React patterns: [references/react-patterns.md](references/react-patterns.md)
- ScrollTrigger patterns: [references/scrolltrigger-patterns.md](references/scrolltrigger-patterns.md)
- Plugin selection: [references/plugin-selection.md](references/plugin-selection.md)
- Performance and accessibility: [references/performance-accessibility.md](references/performance-accessibility.md)
