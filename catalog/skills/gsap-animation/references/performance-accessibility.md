# GSAP Performance and Accessibility

Extracted: 2026-05-03

Sources:

- https://gsap.com/docs/v3/GSAP/gsap.context()/
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- https://gsap.com/resources/React/
- https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-core/SKILL.md
- https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-performance/SKILL.md

## Cleanup

Use `gsap.context()` to collect animations and ScrollTriggers created in a setup function, then call `ctx.revert()` during teardown. Context can also scope selector text to a root element or ref.

In React, prefer `useGSAP()` when available because it uses context-style cleanup automatically. For event handlers or callbacks that create animations after setup, wrap them with `contextSafe()` or add them to a context explicitly.

Use `gsap.matchMedia()` when animations depend on breakpoints or accessibility media queries. Call `mm.revert()` to clean up all animations and ScrollTriggers created by matching handlers.

## Reduced Motion

Respect `prefers-reduced-motion`. Use `gsap.matchMedia()` with a named condition such as:

```js
const mm = gsap.matchMedia();

mm.add({
  isDesktop: "(min-width: 800px)",
  reduceMotion: "(prefers-reduced-motion: reduce)"
}, (context) => {
  const { reduceMotion } = context.conditions;

  if (reduceMotion) {
    gsap.set(".panel", { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.from(".panel", { autoAlpha: 0, y: 24, duration: 0.6 });
});
```

Reduced-motion behavior may set final states immediately, shorten motion to near-zero duration, or skip non-essential animation.

## Performance

- Prefer transform aliases and opacity/`autoAlpha` for UI motion.
- Avoid layout-heavy properties when transforms can achieve the same visual result.
- Avoid raw `transform` strings when GSAP transform aliases communicate the intent more clearly.
- Store tween/timeline instances only when control is needed; otherwise keep animation setup inside cleanup-aware contexts.
- For ScrollTrigger, refresh after layout changes that alter trigger positions.

## Review Checklist

- [ ] GSAP dependency additions were approved.
- [ ] Plugins are imported and registered before use.
- [ ] Component-owned animations are cleaned up.
- [ ] Selector text is scoped in framework components.
- [ ] Reduced-motion users get static, skipped, or simplified motion.
- [ ] Timelines are used for sequences instead of chained delay values.
- [ ] Transform aliases and `autoAlpha` are preferred where they fit.
