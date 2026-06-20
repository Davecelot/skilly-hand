# Motion JavaScript Patterns

Extracted: 2026-05-03

Sources:

- https://motion.dev/docs/quick-start
- https://motion.dev/docs/animate
- https://motion.dev/docs/scroll
- https://motion.dev/docs/inview
- https://motion.dev/docs/hover
- https://motion.dev/docs/press

## Selection

Use Motion JavaScript when animation should work across frameworks or plain pages, when a project already uses Motion, or when the need is lightweight DOM/SVG/object animation without a framework-specific component model.

Prefer CSS transitions for small hover/focus/press states that need no JavaScript control. Prefer `gsap-animation` for GSAP-specific timelines, ScrollTrigger pin/scrub choreography, or GSAP plugins.

## Installation and Imports

For package-managed projects, the official install command is:

```bash
npm install motion
```

Use module imports in bundled JavaScript:

```js
import { animate, scroll } from "motion";
```

For smaller HTML/SVG-only animation, Motion also documents:

```js
import { animate } from "motion/mini";
```

For plain HTML or no-code contexts, Motion can be imported by script tag. Prefer pinning a specific version in CDN URLs instead of using `latest`.

Ask before adding `motion` when it is not already present.

## animate()

Use `animate()` for one-step animations and controlled JavaScript animation:

- It accepts CSS selectors or element collections.
- It can animate HTML/CSS, SVG attributes and paths, independent transforms, JavaScript objects, colors, strings, numbers, and single values.
- The hybrid import from `"motion"` supports independent transform axes like `x`, `y`, `rotate`, `scale`, skew, perspective, CSS variables, SVG paths, object animation, and sequences.
- The mini import from `"motion/mini"` focuses on HTML/SVG styles through native browser APIs.

Use transition options such as `duration`, `delay`, `ease`, `repeat`, `repeatType`, and spring options when the official API supports the chosen transition type.

## Sequences and Stagger

Use hybrid `animate()` sequences when several targets or values need ordered animation. Use each segment's transition options or `at` scheduling instead of hand-stacking unrelated timers.

Use `stagger()` as a `delay` function when sibling animations should be offset:

```js
import { animate, stagger } from "motion";

animate(".item", { opacity: 1, y: 0 }, { delay: stagger(0.1) });
```

## Scroll and Viewport

Use `scroll()` for scroll-linked animation where an animation progress should follow scroll progress.

Use `inView()` for scroll-triggered animation when an element entering or leaving the viewport should start behavior. Store and run its cleanup in framework teardown when used inside component lifecycles.

## Gestures

Use `hover()` and `press()` for JavaScript gesture animation outside React. Store cleanup functions returned by gesture helpers and call them during teardown.

For React, prefer `whileHover`, `whileTap`, and related `motion` component props instead of manual DOM gesture listeners.

## Cleanup

Store returned animation controls or cleanup functions when an animation, scroll listener, observer, or gesture belongs to a component/page lifecycle. Stop animations and call cleanup during teardown.
