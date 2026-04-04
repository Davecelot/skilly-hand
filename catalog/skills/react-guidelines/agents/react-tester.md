# React Tester

## When to Use

Use this sub-agent when:

- Adding or updating React component or hook tests.
- Reviewing React tests for correctness and modern usage.
- Choosing test patterns for async rendering, Suspense, and transitions.

Do not use this sub-agent for:

- Component implementation guidance without tests (use `component-creator`).
- Framework-agnostic testing standards not tied to React behavior.

---

## Runner Policy

- Default: Use the repository's existing configured runner and testing library.
- Do not introduce test-runner migration inside unrelated feature tasks.
- Keep assertions focused on user-visible behavior and public contracts.

---

## Core Testing Patterns

- Ensure all stateful updates and async UI flows are wrapped in React-safe test flows (`act` semantics are respected by the testing setup).
- Prefer user-observable assertions over implementation details.
- Test Suspense fallbacks and resolved UI states when async boundaries exist.
- Test transitions and deferred updates based on visible outcomes.
- Keep mocks narrow and explicit at integration boundaries.

---

## Command Matrix

| Scenario | Preferred Command | Fallback |
| --- | --- | --- |
| Run all tests | Project test command (for example `npm test`) | Workspace equivalent |
| Watch mode | Project watch command | Workspace equivalent |
| Coverage | Project coverage command | Workspace equivalent |
| Single suite/file | Project targeted test command | Workspace equivalent |

Always align commands with the workspace's existing test setup.

---

## Decision Tree

```text
Is this a component behavior test?
  YES -> Assert rendered output, interactions, and accessibility semantics
  NO  -> Continue

Is this a custom hook test?
  YES -> Test observable state transitions and returned contracts
  NO  -> Continue

Is behavior async or Suspense-based?
  YES -> Assert fallback state and resolved state deterministically
  NO  -> Continue

Does behavior involve transitions/deferred rendering?
  YES -> Assert user-visible final state, not internal scheduling details
  NO  -> Use direct synchronous assertions
```

---

## Test Snippets

### Component Interaction Test

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleButton } from "./toggle-button";

it("toggles pressed state", async () => {
  const user = userEvent.setup();
  render(<ToggleButton />);

  const button = screen.getByRole("button", { name: "Off" });
  await user.click(button);

  expect(screen.getByRole("button", { name: "On" })).toHaveAttribute("aria-pressed", "true");
});
```

### Suspense Fallback Test

```tsx
import { render, screen } from "@testing-library/react";
import { ProfileSection } from "./profile-section";

it("shows fallback before async content resolves", () => {
  render(<ProfileSection />);
  expect(screen.getByText("Loading profile...")).toBeInTheDocument();
});
```

---

## Review Checklist

- Tests respect existing runner/library configuration.
- `act`-safe patterns are preserved for stateful and async updates.
- Assertions validate user-visible behavior and contracts.
- Suspense/transition scenarios are tested where relevant.
- Mocks are limited to necessary boundaries.
