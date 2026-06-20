# GSAP ScrollTrigger Patterns

Extracted: 2026-05-03

Sources:

- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-scrolltrigger/SKILL.md

## When to Use

Use ScrollTrigger for scroll-driven animation, scroll reveals, scrubbed timelines, pinned sections, snapping, parallax-style effects, or callbacks based on scroll position. Prefer it when no other scroll animation library has already been chosen.

## Registration

ScrollTrigger is a GSAP plugin. Import and register it before use in module-based projects:

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

## Basic Patterns

Attach a simple trigger to a tween when animation should start as an element enters the viewport:

```js
gsap.to(".box", {
  scrollTrigger: ".box",
  x: 500
});
```

Attach ScrollTrigger to a timeline for coordinated scroll-linked animation:

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".section",
    start: "top top",
    end: "+=500",
    scrub: true,
    pin: true
  }
});

tl.from(".title", { autoAlpha: 0, y: 24 })
  .to(".panel", { xPercent: -100 });
```

Use `ScrollTrigger.create()` for standalone callbacks or scroll state without attaching directly to a tween.

## Cleanup and Refresh

Create ScrollTriggers inside `useGSAP()`, `gsap.context()`, or `gsap.matchMedia()` so they are reverted during teardown. After DOM or layout changes that affect trigger positions, call `ScrollTrigger.refresh()` from the appropriate lifecycle point.

## Reduced Motion

Use `gsap.matchMedia()` to gate scroll-triggered motion when `prefers-reduced-motion: reduce` matches. For reduced motion users, skip scrub/pin choreography or replace it with a static end state.
