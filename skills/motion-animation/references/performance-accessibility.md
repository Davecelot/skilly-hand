# Motion Performance and Accessibility

Extracted: 2026-05-03

Sources:

- https://motion.dev/docs/quick-start
- https://motion.dev/docs/animate
- https://motion.dev/docs/react
- https://motion.dev/docs/react-use-reduced-motion
- https://motion.dev/docs/performance
- https://motion.dev/docs/react-accessibility

## Performance

Motion's hybrid engine uses browser animation capabilities where possible and JavaScript where browser APIs cannot provide the needed behavior. Prefer the smallest Motion surface that solves the job:

- Use CSS transitions for simple static hover/focus transitions.
- Use `motion/mini` for small HTML/SVG style animation when independent transforms, sequences, object animation, or advanced hybrid behavior are unnecessary.
- Use the hybrid `"motion"` import for independent transforms, SVG paths, CSS variables, JavaScript objects, values, sequences, and spring/inertia behavior.
- In React, use `motion` components and hooks from `"motion/react"` rather than manual DOM animation when animation is tied to React render state.

Prefer `opacity` and transform-style motion for routine UI animation. Avoid layout-heavy animation unless the official React layout animation API is the intended feature.

## Reduced Motion

Respect user reduced-motion preferences. In React, use `useReducedMotion()` when animation values need to change based on preference.

Reduced-motion behavior may:

- Skip non-essential animation.
- Shorten motion to a near-instant transition.
- Replace spatial movement with opacity or a static final state.
- Disable looping or decorative animation.

## Cleanup

For framework-agnostic JavaScript, store animation controls and cleanup functions returned by Motion APIs that attach listeners, observers, or active animations. Stop animations and call cleanup during component/page teardown.

For React `motion` components, React handles component lifecycle for prop-based animation. Manual timers, callbacks, or JavaScript Motion APIs used inside React still need normal effect cleanup.

## Checklist

- [ ] The official Motion source for the chosen API was checked.
- [ ] Motion is already installed or dependency approval was obtained.
- [ ] Imports match the environment: `"motion"` for JavaScript, `"motion/react"` for React.
- [ ] Component/page-owned JavaScript animations and listeners are cleaned up.
- [ ] Reduced-motion users get static, skipped, or simplified motion.
- [ ] The implementation uses Motion for Motion-shaped needs and GSAP only for GSAP-shaped needs.
