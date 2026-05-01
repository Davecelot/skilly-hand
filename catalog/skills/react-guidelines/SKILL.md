---
name: "react-guidelines"
description: "Guide React and Next.js code generation, review, and performance tuning using latest stable React verification and modern framework best practices. Trigger: generating, reviewing, refactoring, or optimizing React code artifacts in React projects."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-05-01"
  license: "Apache-2.0"
  version: "1.1.0"
  changelog: "Added curated Vercel-style React and Next.js performance review guidance with a dedicated performance-reviewer mode; improves async, bundle, server, client data, and rendering optimization coverage; affects react-guidelines routing, review checklists, and catalog discovery"
  auto-invoke: "Generating, reviewing, refactoring, or optimizing React code artifacts in React projects"
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
# React Guidelines

## When to Use

Use this skill when:

- You are generating React components, hooks, or supporting modules.
- You are refactoring existing React code to current framework patterns.
- You are reviewing React code quality and framework-alignment in a React workspace.
- You are optimizing React or Next.js behavior around async work, bundle size, data fetching, server/client boundaries, or rendering cost.

Do not use this skill for:

- Non-React frontend stacks (Angular, Vue, Svelte, or framework-agnostic UI tasks).
- Deep architecture decisions outside code artifact generation/review scope.
- Pure test-strategy design unrelated to React implementation details.

---

## Routing Map

Choose sub-agents by intent:

| Intent | Sub-agent |
| --- | --- |
| Create, refactor, or review React components | [agents/component-creator.md](agents/component-creator.md) |
| Write or review React tests | [agents/react-tester.md](agents/react-tester.md) |
| Optimize or review React/Next.js performance | [agents/performance-reviewer.md](agents/performance-reviewer.md) |

---

## Standard Execution Sequence

1. Run latest stable React preflight checks.
2. Route to the smallest matching sub-agent by task intent.
3. If the request mentions performance, Next.js, data fetching, server/client boundaries, bundles, or re-renders, include the performance priority checklist.
4. Apply the sub-agent checklist before finalizing generated code or review output.

---

## Critical Patterns

### Pattern 1: Latest Stable React Preflight (Mandatory)

Before generating or changing React code:

1. Check the latest stable React release:
   `npm view react version`
2. Check the project's installed or declared React version:
   `npm ls react` or inspect `package.json`.
3. Verify release alignment using official version documentation:
   `https://react.dev/versions`
4. If versions diverge, generate content for latest stable APIs and call out upgrade steps.

Never hardcode a specific React major/minor as the default baseline.

### Pattern 2: Modern React Defaults for New Code

Use these defaults unless project constraints explicitly prevent them:

| Area | Default |
| --- | --- |
| Component model | Function components with pure render logic |
| State + derivation | `useState`/`useReducer` + derived values without redundant state |
| Reuse | Composition and custom hooks over inheritance |
| Boundaries | Apply `'use client'` or `'use server'` only where required |
| Rendering patterns | Suspense-ready async boundaries where applicable |
| Debug/profiling | StrictMode-safe behavior and optional Profiler instrumentation |

### Pattern 3: Hook and Purity Guardrails

- Follow Rules of Hooks consistently.
- Keep Components and Hooks pure.
- Avoid unnecessary Effects; prefer deriving values in render when possible.
- Keep state minimal and colocated near usage.
- For component-specific work, apply [agents/component-creator.md](agents/component-creator.md).
- For testing-specific work, apply [agents/react-tester.md](agents/react-tester.md).
- For performance-specific work, apply [agents/performance-reviewer.md](agents/performance-reviewer.md).

### Pattern 4: Performance Review Priority

Use this Vercel-style priority order for React and Next.js performance review. Start with the highest-impact item that applies to the request; do not add complexity for hypothetical bottlenecks.

| Priority | Review Focus | Default Action |
| --- | --- | --- |
| 1 | Eliminating waterfalls | Start independent promises early, defer awaits until values are needed, and use `Promise.all` for independent async work. |
| 2 | Bundle size optimization | Avoid problematic barrel imports unless tooling optimizes them, dynamically import heavy or client-only modules, and defer third-party libraries. |
| 3 | Server-side performance | Authenticate server actions, avoid shared request state, minimize client-component serialization, and use per-request dedupe where applicable. |
| 4 | Client-side data fetching | Dedupe repeated requests, keep global listeners passive and cleaned up, and keep browser storage minimal and versioned. |
| 5 | Re-render optimization | Derive state during render, avoid redundant state, keep non-primitive defaults stable, and memoize only when it removes measured churn. |
| 6 | Rendering performance | Split expensive work, place Suspense boundaries around meaningful async UI, and use transitions/deferred values for user-visible responsiveness. |
| 7 | JavaScript performance | Keep hot-path work small, avoid repeated parsing or allocation in render paths, and prefer platform APIs over bulky helpers where practical. |
| 8 | Advanced patterns | Use virtualization, streaming, caching, or compiler-aware patterns only when the project stack and bottleneck justify them. |

---

## Decision Tree

```text
Is this a React project (react dependency present)?
  NO  -> Do not apply this skill
  YES -> Continue

Is this a create/generate task?
  YES -> Run latest stable preflight, then generate with modern defaults
  NO  -> Continue

Is this a refactor task?
  YES -> Preserve behavior, migrate incrementally to modern React patterns
  NO  -> Continue

Is this a review task?
  YES -> Validate latest-stable alignment + hook/purity/performance checklist
  NO  -> Apply the minimal React guidance needed for the request

Does the task mention performance, Next.js, data fetching, bundles, RSC, or re-renders?
  YES -> Route through performance-reviewer before finalizing
  NO  -> Keep the existing component/test route
```

---

## Code Examples

### Example 1: Pure Function Component with Derived State

```tsx
import { useMemo, useState } from "react";

type CounterBadgeProps = {
  label: string;
};

export function CounterBadge({ label }: CounterBadgeProps) {
  const [count, setCount] = useState(0);
  const isNonZero = useMemo(() => count > 0, [count]);

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {label}: {count} {isNonZero ? "active" : "idle"}
    </button>
  );
}
```

### Example 2: Server/Client Boundary Split

```tsx
// app/user-panel.tsx
import { UserPanelClient } from "./user-panel-client";

export default async function UserPanel() {
  const user = await fetch("/api/user").then((r) => r.json());
  return <UserPanelClient name={user.name} />;
}

// app/user-panel-client.tsx
"use client";

export function UserPanelClient({ name }: { name: string }) {
  return <p>Hello, {name}</p>;
}
```

---

## Review Checklist

- Latest stable React preflight was completed before code generation/refactor.
- New artifacts use function-first, composition-first patterns.
- Hooks follow call-order rules and purity constraints.
- `'use client'`/`'use server'` directives are only used where boundary semantics require them.
- Suspense/StrictMode/Profiler guidance is considered when relevant to behavior.
- Performance work follows the priority order from waterfalls through advanced patterns and avoids speculative optimization.

---

## Commands

```bash
# Latest stable React version
npm view react version

# Workspace React version
npm ls react

# Build catalog index
npm run build

# Sync catalog README table
npm run catalog:sync

# Validate catalog manifests and files
npm run catalog:check
```

---

## Resources

- React reference: https://react.dev/reference/react
- React Hooks reference: https://react.dev/reference/react/hooks
- React Components reference: https://react.dev/reference/react/components
- React APIs reference: https://react.dev/reference/react/apis
- React Server Components directives: https://react.dev/reference/rsc/directives
- React versions: https://react.dev/versions
- Rules of Hooks: https://react.dev/reference/rules/rules-of-hooks
- Components and Hooks must be pure: https://react.dev/reference/rules/components-and-hooks-must-be-pure
- Suspense: https://react.dev/reference/react/Suspense
- StrictMode: https://react.dev/reference/react/StrictMode
- Fragment: https://react.dev/reference/react/Fragment
- Profiler: https://react.dev/reference/react/Profiler
- Vercel Labs React best practices skill: https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices
