# GSAP React Patterns

Extracted: 2026-05-03

Sources:

- https://gsap.com/resources/React/
- https://gsap.com/docs/v3/GSAP/gsap.context()/
- https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-react/SKILL.md

## Use `useGSAP()` When Available

For React and Next.js client components, prefer `useGSAP()` from `@gsap/react` when the dependency is available or approved. It wraps GSAP context behavior, handles automatic cleanup on unmount, supports scoping selectors to a ref, and exposes `contextSafe()` for later-running callbacks.

Ask before installing `@gsap/react` if it is not already present.

```js
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

function Example() {
  const container = useRef(null);

  useGSAP(() => {
    gsap.to(".box", { x: 100 });
  }, { scope: container });

  return <div ref={container}><div className="box" /></div>;
}
```

## Scope and Refs

Pass a `scope` ref or element when using selector text. This keeps `.box`, `.item`, and similar selectors inside the component root. Without scoping, selectors can match elements outside the component.

Use direct refs when a target is unique or when selector text would be ambiguous.

## Dependencies and Updates

`useGSAP()` accepts either a dependency array or a config object. Use the config object when you need `scope`, `dependencies`, or `revertOnUpdate`.

Use `revertOnUpdate: true` when dependency changes should tear down and rebuild GSAP objects instead of preserving them until unmount.

## Context-Safe Callbacks

Animations created after the hook body runs, such as inside event handlers, timers, or callbacks, are not automatically captured unless wrapped. Use `contextSafe()` so GSAP objects created later are tied to the same cleanup context.

When manually adding event listeners, return cleanup that removes the listeners.

## SSR and Next.js

GSAP manipulates browser-side targets. Keep GSAP execution inside client-only lifecycle such as `useGSAP()` or `useEffect()`. In React Server Components or Next app router usage, place GSAP code in a client component.

## Fallback Without `@gsap/react`

If `@gsap/react` is not used, create a `gsap.context()` inside an effect and call `ctx.revert()` in cleanup. Pass the component ref as scope.
