# GSAP Plugin Selection

Extracted: 2026-05-03

Sources:

- https://gsap.com/docs/v3/
- https://gsap.com/docs/v3/Installation/
- https://gsap.com/docs/v3/Plugins/
- https://github.com/greensock/gsap-skills

## Rule

Use the smallest GSAP surface that solves the motion problem. Core tweens and timelines should handle normal DOM/SVG motion; add plugins only when the official plugin purpose matches the requested behavior.

Register every plugin used with `gsap.registerPlugin(...)`. Official installation guidance recommends registration in module environments so build tools do not drop plugins during tree shaking.

## Selection Matrix

| Need | Official GSAP Tool |
| --- | --- |
| Scroll-triggered playback, scrub, pin, snap, scroll callbacks | `ScrollTrigger` |
| Smooth scrolling built on native scroll behavior | `ScrollSmoother` |
| Scroll to an element or position | `ScrollToPlugin` |
| State-to-state UI transitions and layout changes | `Flip` |
| Drag interactions | `Draggable` |
| Momentum/inertia behavior | `InertiaPlugin` |
| Pointer/touch/wheel intent observation | `Observer` |
| Text splitting for animation | `SplitText` |
| Scrambled text effects | `ScrambleTextPlugin` |
| SVG shape drawing | `DrawSVGPlugin` |
| SVG shape morphing | `MorphSVGPlugin` |
| Motion along SVG paths | `MotionPathPlugin` |
| Custom easing curves | `CustomEase` |
| Development-time animation inspection | `GSDevTools` |

## Guardrails

- Do not add a plugin for a task core GSAP can solve clearly.
- Do not register unused plugins.
- Do not introduce scroll smoothing, draggable, inertia, or text-splitting behavior as decorative polish without user approval.
- Check official docs when selecting a plugin not listed in this matrix.
