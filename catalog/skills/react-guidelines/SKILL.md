# React Guidelines

## When to Use

Use this skill when:

- You are generating React components, hooks, or supporting modules.
- You are refactoring existing React code to current framework patterns.
- You are reviewing React code quality and framework-alignment in a React workspace.

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

---

## Standard Execution Sequence

1. Run latest stable React preflight checks.
2. Route to the smallest matching sub-agent by task intent.
3. Apply the sub-agent checklist before finalizing generated code or review output.

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
  YES -> Validate latest-stable alignment + hook/purity checklist
  NO  -> Apply the minimal React guidance needed for the request
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
