# GSAP Utility Patterns

Extracted: 2026-05-23

Sources:

- https://gsap.com/docs/v3/GSAP/UtilityMethods/
- https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-utils/SKILL.md

## When to Use

Use `gsap.utils` when animation logic needs value mapping, clamping, snapping, randomization, reusable helper functions, scoped selectors, or array normalization. Utilities do not need plugin registration.

Use utility functions inside tween vars, ScrollTrigger callbacks, pointer handlers, or plain JavaScript that drives GSAP state.

## Function Form

Many utilities accept the value to transform as the final argument. When that value is omitted, the utility returns a reusable function that accepts the value later. Use this form when the same range or rule is applied repeatedly.

`random()` is the notable exception: pass `true` as the final argument when you need a reusable random function.

## Selection Matrix

| Need | Utility |
| --- | --- |
| Keep a number inside a range | `gsap.utils.clamp(min, max, value?)` |
| Convert a number from one range to another | `gsap.utils.mapRange(inMin, inMax, outMin, outMax, value?)` |
| Convert a range value to progress from `0` to `1` | `gsap.utils.normalize(min, max, value?)` |
| Blend numbers, colors, arrays, or matching objects by progress | `gsap.utils.interpolate(start, end, progress?)` |
| Pick random numbers or array items | `gsap.utils.random(...)` |
| Align values to increments or allowed values | `gsap.utils.snap(snapTo, value?)` |
| Convert selectors, NodeLists, or single elements into arrays | `gsap.utils.toArray(value, scope?)` |
| Create a selector scoped to a component/container | `gsap.utils.selector(scope)` |
| Cycle a value through a range | `gsap.utils.wrap(min, max, value?)` |
| Compose multiple transforms into one function | `gsap.utils.pipe(...functions)` |

## Patterns

Use function-form utilities for repeated callback work:

```js
const toDegrees = gsap.utils.mapRange(0, 1, 0, 360);
const snapProgress = gsap.utils.snap(0.1);

function onUpdate(progress) {
  return snapProgress(toDegrees(progress));
}
```

Use scoped selectors in components when direct refs are too verbose:

```js
const q = gsap.utils.selector(container);
gsap.to(q(".item"), { y: 24, stagger: 0.05 });
```

Use string random values inside tween vars when each target should receive its own value:

```js
gsap.to(".particle", { x: "random(-100, 100, 5)", y: "random(-60, 60, 5)" });
```

## Guardrails

- Do not use numeric range utilities for unit conversion; use documented unit helpers when units matter.
- Prefer `toArray()` when downstream logic expects a real array instead of a NodeList.
- Prefer `selector(scope)` or `toArray(value, scope)` for framework components so selectors do not leak outside the component.
- Check official utility docs before using helpers not listed here.
