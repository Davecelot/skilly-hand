# GSAP Framework Patterns

Extracted: 2026-05-23

Sources:

- https://gsap.com/docs/v3/GSAP/gsap.context()/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-frameworks/SKILL.md

## When to Use

Use this reference for Vue, Nuxt, Svelte, SvelteKit, and other component frameworks that are not React. For React and Next.js, prefer [react-patterns.md](react-patterns.md).

## Principles

- Create tweens, timelines, and ScrollTriggers only after the component DOM exists.
- Scope selector text to a component root with `gsap.context(callback, scope)`.
- Revert the context during unmount/destroy so animations, inline styles, and ScrollTriggers are cleaned up.
- Register plugins once at app/module level, not inside render paths or repeatedly called component bodies.
- Call `ScrollTrigger.refresh()` after async content, route transitions, font loading, or layout changes that affect trigger positions.

## Vue and Nuxt

In Vue 3, create GSAP work in `onMounted()` and clean it up in `onUnmounted()`:

```js
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";

const container = ref(null);
let ctx;

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from(".item", { autoAlpha: 0, y: 20, stagger: 0.08 });
  }, container.value);
});

onUnmounted(() => {
  ctx?.revert();
});
```

For Nuxt, keep browser-only GSAP work in client-safe lifecycle and lazy-load less common plugins when bundle size matters.

## Svelte and SvelteKit

In Svelte, create GSAP work in `onMount()` and return cleanup:

```js
import { onMount } from "svelte";
import { gsap } from "gsap";

let container;

onMount(() => {
  const ctx = gsap.context(() => {
    gsap.to(".box", { x: 100, duration: 0.6 });
  }, container);

  return () => ctx.revert();
});
```

For SvelteKit, keep DOM-dependent GSAP setup on the client and avoid running it during server rendering.

## ScrollTrigger Cleanup

ScrollTriggers created inside `gsap.context()` are reverted with the context. Place `scrollTrigger` configs and `ScrollTrigger.create()` calls inside the same context as related tweens or timelines.

When trigger positions depend on data, images, fonts, or route transitions, refresh after the DOM has settled.

## Guardrails

- Do not create GSAP animations before component DOM refs are available.
- Do not use unscoped selector strings in reusable component instances.
- Do not skip teardown; detached DOM nodes with live animations or ScrollTriggers cause leaks and stale callbacks.
- Do not register plugins in reactive code that runs frequently.
