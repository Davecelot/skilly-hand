# Motion React Patterns

Extracted: 2026-05-03

Sources:

- https://motion.dev/docs/react
- https://motion.dev/docs/react-motion-component
- https://motion.dev/docs/react-animate-presence
- https://motion.dev/docs/react-use-scroll
- https://motion.dev/docs/react-use-reduced-motion

## Selection

Use Motion for React when a React project already uses Motion/Framer Motion, when animation should be expressed through component props, or when the desired behavior is gestures, exit animation, layout animation, scroll animation, or SVG animation in React.

Use JavaScript patterns from [js-patterns.md](js-patterns.md) for framework-agnostic utilities. Use `gsap-animation` when the project requires GSAP-specific timelines, ScrollTrigger behavior, plugins, or existing GSAP conventions.

## Installation and Imports

Motion for React uses the same package:

```bash
npm install motion
```

Import React APIs from `"motion/react"`:

```tsx
import { motion } from "motion/react";
```

Ask before adding `motion` when it is not already present.

## motion Components

Use `motion` components for animating HTML and SVG elements with props:

- `initial` defines the starting visual state.
- `animate` defines the current target visual state.
- `transition` defines duration, easing, spring, and related transition behavior.
- Variants can coordinate named states across parent/child component trees.

Use `motion.create()` for custom components only when the official component integration pattern is needed.

## Gestures

Use React gesture props for interaction feedback:

- `whileHover` for hover targets.
- `whileTap` for press/tap targets.
- Hover, tap, focus, and drag are supported gesture categories in the React quick start.

Keep gesture motion brief and meaningful, and pair it with accessible non-motion feedback when needed.

## Scroll Animation

Use `whileInView` for scroll-triggered animation when an element should animate as it enters or leaves the viewport.

Use `useScroll()` when a MotionValue should be linked directly to scroll progress, such as a progress bar scale.

## Layout Animation

Use `layout` when React layout changes in size, position, or reorder should animate smoothly.

Use `layoutId` for shared layout transitions between different elements.

When mixing layout animation with exits, consider official `AnimatePresence` mode guidance and `LayoutGroup` guidance if surrounding components need coordinated layout updates.

## Exit Animation

Use `AnimatePresence` when removed React elements should animate out before leaving the DOM:

- Place the conditional child inside `AnimatePresence`; do not unmount `AnimatePresence` at the same time as the child.
- Give every direct child a stable unique `key`.
- Use the `exit` prop on `motion` components.
- Use `mode="wait"` only for one child at a time.
- Use `mode="popLayout"` carefully with positioned parents and forwarded refs for custom immediate children.

## SVG Animation

Motion for React supports SVG animation. Use `motion` SVG elements and official SVG props such as `pathLength` for path drawing effects where appropriate.

## React Server Components

In React Server Component projects, components that use Motion runtime behavior must be client components. Keep Motion imports and animated components in client-side files.
