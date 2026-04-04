# React Component Creator

## When to Use

Use this sub-agent when:

- Creating a new React component.
- Refactoring an existing React component to modern patterns.
- Reviewing component implementation details and composition patterns.

Do not use this sub-agent for:

- Framework-agnostic architecture decisions.
- Test-only tasks (use `react-tester`).
- Non-React frameworks.

---

## Core Rules

- Prefer function components and composition-first design.
- Keep render logic pure and deterministic.
- Keep state minimal; derive values from props/state instead of duplicating state.
- Use custom hooks to encapsulate reusable stateful behavior.
- Follow Rules of Hooks in all code paths.
- Use `'use client'` only for interactive/client-only modules; keep server components free of client-only hooks.
- For interactive elements, include keyboard and ARIA semantics.

---

## Template Snippets

### Minimal Pure Function Component

```tsx
type BadgeProps = {
  label: string;
};

export function Badge({ label }: BadgeProps) {
  return <span>{label}</span>;
}
```

### Composition + Custom Hook

```tsx
import { useState } from "react";

function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  return { on, toggle: () => setOn((value) => !value) };
}

export function ToggleButton() {
  const { on, toggle } = useToggle();
  return (
    <button type="button" aria-pressed={on} onClick={toggle}>
      {on ? "On" : "Off"}
    </button>
  );
}
```

### Suspense Boundary

```tsx
import { Suspense } from "react";

export function ProfileSection() {
  return (
    <Suspense fallback={<p>Loading profile...</p>}>
      <ProfileContent />
    </Suspense>
  );
}
```

---

## Review Checklist

- Component is function-based and render-pure.
- State is minimal and colocated; derived values are not redundantly stored.
- Hook calls follow Rules of Hooks.
- Composition is preferred over inheritance or over-abstraction.
- Client/server boundary directives are correctly scoped.
- Accessibility semantics are present for interactive controls.
