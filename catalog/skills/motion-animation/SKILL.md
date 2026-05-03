---
name: "motion-animation"
description: "Guide Motion, formerly Framer Motion, animation implementation using only official Motion documentation. Trigger: implementing, reviewing, or choosing Motion for JavaScript animation, React motion components, gestures, scroll animation, layout animation, exit animation, or framework-agnostic UI motion."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-05-03"
  license: "Apache-2.0"
  version: "1.0.0"
  changelog: "Added official-source Motion animation guidance for JavaScript and React; improves framework-agnostic and React-native motion implementation with verified Motion APIs; affects frontend animation routing and catalog discovery"
  auto-invoke: "Implementing, reviewing, or choosing Motion for JavaScript animation, React motion components, gestures, scroll animation, layout animation, exit animation, or framework-agnostic UI motion"
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
# Motion Animation Guide

## When to Use

Use this skill when:

- The user asks for Motion, Framer Motion, Motion One, JavaScript animation with `motion`, React `motion` components, gestures, scroll-triggered animation, scroll-linked animation, layout animation, or exit animation.
- Another skill needs a verified Motion handoff for lightweight UI motion, React-native animation props, or framework-agnostic JavaScript animation.
- A project already uses `motion`, `framer-motion`, or `@motionone/dom` and the user has not asked to migrate away.

Do not use this skill when:

- The project already uses another animation library and the user has not asked to add or migrate to Motion.
- A simple CSS transition is sufficient and no JavaScript, React prop, layout, gesture, scroll, or exit animation behavior is needed.
- The work needs GSAP-specific timelines, ScrollTrigger pin/scrub behavior, GSAP plugins, or existing GSAP patterns. Use `gsap-animation` for that.
- The work is backend-only or has no user-facing motion surface.

---

## Official-Only Source Rule

Before generating Motion-specific guidance, verify the pattern against official sources in [references/official-source-map.md](references/official-source-map.md).

Use only:

- Motion docs at `https://motion.dev/docs/quick-start`.
- Motion for React docs at `https://motion.dev/docs/react`.
- Official `motion.dev/docs/*` pages linked from those pages when a referenced API needs more detail.

Do not use blog posts, snippets, Stack Overflow answers, social posts, or memory-only claims as source material for Motion API behavior. If a detail is not covered by the reference files, check official Motion docs before using it.

---

## Routing

| Need | Use |
| --- | --- |
| Framework-agnostic DOM/SVG/object animation | [references/js-patterns.md](references/js-patterns.md) |
| Plain HTML, Webflow, no-code, or script tag usage | Script-tag guidance in [references/js-patterns.md](references/js-patterns.md) |
| React or Next.js prop-based UI animation | [references/react-patterns.md](references/react-patterns.md) |
| React exit, layout, gesture, scroll, and SVG animation | [references/react-patterns.md](references/react-patterns.md) |
| Reduced motion, cleanup, and performance guidance | [references/performance-accessibility.md](references/performance-accessibility.md) |

When the user asks for an animation library without naming one, prefer Motion when the need is lightweight JavaScript animation, React prop-based animation, gestures, layout animation, exit animation, or a project already uses Motion/Framer Motion. Prefer GSAP for GSAP timelines, ScrollTrigger pin/scrub choreography, GSAP plugins, or an existing GSAP stack.

---

## Project Preflight

Always inspect the target project before proposing implementation:

```bash
grep -E '"motion"|"framer-motion"|"@motionone/dom"|"gsap"|"@gsap/react"|"animejs"' package.json
grep -rn "from \"motion\"|from 'motion'|from \"motion/react\"|from 'motion/react'|framer-motion|motion\\.|AnimatePresence|useScroll|useReducedMotion" src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null
grep -rn "prefers-reduced-motion|transition|@keyframes" src --include="*.css" --include="*.scss" --include="*.tsx" --include="*.jsx" 2>/dev/null
```

If `motion` is not installed, ask before adding it. This skill teaches target projects how to use Motion; it does not add Motion to skilly-hand itself.

---

## Implementation Rules

- Use the official package name `motion`.
- Prefer JavaScript imports from `"motion"` for framework-agnostic work.
- Prefer React imports from `"motion/react"` for React components and hooks.
- Use `animate()` for DOM, SVG, object, value, and sequence animation where JavaScript control is needed.
- Use `motion` components for React UI state animation through `initial`, `animate`, `whileHover`, `whileTap`, `whileInView`, `layout`, `layoutId`, and `exit`.
- Use `AnimatePresence` when React elements need exit animations before DOM removal.
- Use `scroll()` or `useScroll()` for scroll-linked animation; use `inView()` or `whileInView` for scroll-triggered animation.
- Use `stagger()` for sibling offsets instead of manually stacking delay values.
- Respect reduced-motion preferences. Skip, simplify, or replace non-essential motion when users request reduced motion.
- Clean up JavaScript animations, gestures, scroll listeners, and observers during component or page teardown.
- Avoid introducing Motion Studio, Motion+ premium APIs, or MCP tooling unless the user explicitly asks for those products.

---

## Framework Guidance

JavaScript and other frameworks:

- Run Motion setup after DOM nodes exist.
- Pass elements directly when possible, or scope selector text to the component/page root.
- Store returned animation controls or cleanup functions when teardown or runtime control is needed.
- For script tag usage, prefer a pinned CDN version instead of `latest`.

React and Next.js:

- Import `motion`, `AnimatePresence`, and hooks from `"motion/react"`.
- Components using Motion in React Server Component projects must run on the client.
- Use stable unique keys for `AnimatePresence` children.
- Use `layout` for size/position/reorder animation and `layoutId` for shared layout transitions.
- Use `useReducedMotion()` to branch React animation values when needed.

---

## Output Contract

When using this skill, include:

- The official Motion source you used.
- Whether Motion or legacy Framer Motion usage is already installed or requires approval.
- Which Motion primitive is appropriate: `animate()`, `scroll()`, `inView()`, gesture function, `motion` component, `AnimatePresence`, `useScroll()`, `layout`, `layoutId`, or `useReducedMotion()`.
- Cleanup and reduced-motion behavior.
- A verification step appropriate to the project, such as unit tests, interaction tests, browser smoke checks, or visual inspection.

---

## Commands

```bash
# Install Motion in a target project only after user approval
npm install motion

# Check for existing Motion usage
grep -rn "from \"motion\"|from \"motion/react\"|framer-motion|AnimatePresence|useScroll|useReducedMotion" src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"
```

---

## Resources

- Source map: [references/official-source-map.md](references/official-source-map.md)
- JavaScript patterns: [references/js-patterns.md](references/js-patterns.md)
- React patterns: [references/react-patterns.md](references/react-patterns.md)
- Performance and accessibility: [references/performance-accessibility.md](references/performance-accessibility.md)
