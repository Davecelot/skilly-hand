---
name: scannlab-storybook
description: >
  Generates Storybook stories (.stories.ts) for Angular components in the ScannLab Design System.
  Trigger: When creating, updating, or reviewing Storybook stories for Angular components.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "2.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [ui]
  auto-invoke: "Creating or updating Storybook stories"
allowed-tools: Read, Edit, Write, Grep, Bash, Task
---

# ScannLab Storybook Guide

## When to Use

**Use this skill when:**

- Creating new `.stories.ts` files for Angular components.
- Updating existing stories to cover new inputs, outputs, or states.
- Reviewing stories for completeness (state coverage, organization).

**Don't use this skill for:**

- Modifying production component code (stories only — never touch `.component.ts`).
- Writing unit tests (use `scannlab-unit-test` instead).
- General Angular best practices (use `scannlab-best-practices` instead).
- Creating or modifying `.storybook/main.ts` (sidebar configuration is managed by Storybook tooling, not AI).

---

## File Organization

Stories for a component are organized in a **dedicated `stories/` subfolder** with a clear hierarchy:

```
components/my-component/
├── my-component.ts           (main component)
├── my-component.css          (styles)
├── my-component.spec.ts      (tests)
├── my-component.mdx          (docs)
└── stories/
    ├── my-component.stories.ts              (main file: Playground story + meta)
    ├── my-component-variant.stories.ts      (variant-specific stories)
    ├── my-component-size.stories.ts         (size-specific stories)
    └── my-component-state.stories.ts        (state-specific stories)
```

This approach creates **organized sub-folders** in Storybook by changing the `title` in each file.

---

## Documentation-First Workflow

**IMPORTANT**: Always create the **`.mdx` file FIRST** for main component documentation, then create `.stories.ts` files for interactive examples.

- **`.mdx` (Main file)**: Contains the complete component documentation, usage guidelines, examples, and API reference written in prose. This is the primary entry point for component documentation.
- **`.stories.ts` (Complementary files)**: Focus on **interactive examples and variant demonstrations**, not long-form documentation. Story files should show visual variations and control options, not replicate documentation text.

**Why this order?**
- Avoids duplicating descriptions in multiple places (documentation vs. story descriptions)
- Saves tokens by not generating long docstring text in `.stories.ts` when it's already in `.mdx`
- Creates a clearer separation: prose docs (`.mdx`) vs. interactive UI (`.stories.ts`)

---

## Critical Patterns

### Pattern 1: Main Stories File (`component.stories.ts`)

The main file defines:
- A TypeScript **interface** for story arguments
- **Meta** configuration with default args and argTypes
- An optional **decorator** for dynamic control logic
- A **Story type** export for reuse in organized story files
- A **Playground** story with interactive controls

```typescript
import type {
  Decorator,
  Meta,
  StoryContext,
  StoryFn,
  StoryObj,
} from '@storybook/angular';
import { MyComponent, VARIANTS, SIZES } from '../my-component';

// Define an interface for type-safe story args
export interface MyComponentStoryArgs {
  variant: string;
  size: string;
  disabled?: boolean;
}

// Optional: Custom decorator for dynamic control logic
const withVariantDefaults: Decorator<MyComponentStoryArgs> = (
  StoryFn: StoryFn<MyComponentStoryArgs>,
  context: StoryContext<MyComponentStoryArgs>,
) => {
  const { args } = context;
  // Dynamic logic here (e.g., update argTypes based on variant)
  return StoryFn(args, context);
};

const meta: Meta<MyComponentStoryArgs> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  decorators: [withVariantDefaults], // Optional: only if needed
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: VARIANTS,
      description: 'Representa la variante visual del componente.',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: { type: 'select' },
      options: SIZES,
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'false' } },
      description: 'Deshabilita el componente.',
    },
  },
};

export default meta;

export type Story = StoryObj<MyComponentStoryArgs>;

// Playground story: all controls enabled
export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
  render: args => ({
    props: args,
    template: `
      <my-component
        [variant]="variant"
        [size]="size"
        [attr.disabled]="disabled || null">
        Playground
      </my-component>
    `,
  }),
  parameters: {
    controls: { expanded: true },
  },
};
```

### Pattern 2: Organized Story Files (`component-variant.stories.ts`, etc.)

Organized story files:
- **Inherit meta** from the main file using the spread operator
- **Change the title** to create a sub-folder in Storybook
- **One story per variant/size/state**
- **Use render functions** with inline templates
- **Disable irrelevant controls** via argTypes
- **Write descriptions in Spanish** (or project language)

```typescript
import buttonMeta, { MyComponentStoryArgs, Story } from './my-component.stories';
import { Meta } from '@storybook/angular';

const meta: Meta<MyComponentStoryArgs> = {
  ...buttonMeta,
  title: 'Components/MyComponent/Variantes', // Creates sub-folder
};

export default meta;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    variant: { control: false }, // Disable variant picker
  },
  render: args => ({
    props: args,
    template: `
      <my-component
        [variant]="variant"
        [size]="size"
        [attr.disabled]="disabled || null">
        Primary
      </my-component>
    `,
  }),
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    variant: { control: false },
  },
  render: args => ({
    props: args,
    template: `
      <my-component
        [variant]="variant"
        [size]="size"
        [attr.disabled]="disabled || null">
        Secondary
      </my-component>
    `,
  }),
};
```

### Pattern 3: Size or Level Organization

For components with multiple sizes or levels, create a dedicated story file:

```typescript
import buttonMeta, { MyComponentStoryArgs, Story } from './my-component.stories';
import { Meta } from '@storybook/angular';

const meta: Meta<MyComponentStoryArgs> = {
  ...buttonMeta,
  title: 'Components/MyComponent/Tamaños', // Creates "Sizes" sub-folder
};

export default meta;

export const xs: Story = {
  args: {
    variant: 'primary',
    size: 'xs',
    disabled: false,
  },
  argTypes: { size: { control: false } },
  render: args => ({
    props: args,
    template: `
      <my-component [size]="size">X-Small</my-component>
    `,
  }),
};

export const sm: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    disabled: false,
  },
  argTypes: { size: { control: false } },
  render: args => ({
    props: args,
    template: `
      <my-component [size]="size">Small</my-component>
    `,
  }),
};

export const md: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
  argTypes: { size: { control: false } },
  render: args => ({
    props: args,
    template: `
      <my-component [size]="size">Medium</my-component>
    `,
  }),
};
```

---

## Key Patterns & Rules

| Rule | Details |
|------|---------|
| **Interface-first** | Define a TypeScript interface for all story args to ensure type safety. |
| **Decorators for logic** | Use custom decorators (`Decorator`) only for reusable dynamic control logic (e.g., updating options based on another control). |
| **Render functions** | Always use `render()` to define templates, not implicit template strings. |
| **Disable controls** | Disable irrelevant controls via `argTypes: { control: false }` in focused story files. |
| **Spanish descriptions** | Write `description`, `defaultValue`, and labels in Spanish (project standard). |
| **Inherit meta** | In organized files, use `...buttonMeta` to avoid duplicating Meta configuration. |
| **One per variant** | Each variant/size/level gets its own Story. Don't combine multiple states in one story. |
| **Template organization** | Inline inline templates directly in the `render()` function. Use template syntax for props: `[variant]="variant"`. |

---

## Decision Tree

```
Creating a new component story?
  ├─ Create main file (component.stories.ts)
  │  ├─ Define interface with all props/signals
  │  ├─ Create Meta with argTypes
  │  └─ Add Playground story (all controls enabled)
  │
  └─ Create organized story files if the component has multiple discrete states
     ├─ component-variant.stories.ts (for variant variations)
     ├─ component-size.stories.ts (for size variations)
     └─ component-state.stories.ts (for state variations like disabled, loading, etc.)

Updating an existing component story?
  ├─ Did props/signals change?
  │  ├─ Update interface
  │  └─ Update Meta argTypes
  │
  └─ Need to show a new variant/size/state?
     └─ Add a new Story to the appropriate organized file
```

---

## Step-by-Step Workflow

1. **Analyze** — Read the component's signal definitions (inputs, outputs, models).
2. **Plan** — Decide what story files you need:
   - Main file (always)
   - Organized files for variants, sizes, states (if component has discrete variations)
3. **Create main file** — Define interface, meta, Playground story.
4. **Create organized files** — One per logical grouping (variant, size, state, etc.).
5. **Verify** — Check that all stories render correctly in Storybook.

---

## Commands

```bash
npm run storybook          # Start Storybook dev server on port 6006
npm run storybook:build    # Build static Storybook
```

---

## Templates & Quick Reference

- **[assets/template.stories.ts](./assets/template.stories.ts)** — Complete template showing all patterns in action (main file + organized files, commented examples).
- **[assets/QUICK-REFERENCE.md](./assets/QUICK-REFERENCE.md)** — One-page cheat sheet for file organization, patterns, and decision trees.

---

## Resources

- **Best practices**: See [scannlab-best-practices](../scannlab-best-practices/SKILL.md) for Angular coding conventions.
- **Button example**: See [`projects/scanntech-ui/src/components/button/stories/`](../../projects/scanntech-ui/src/components/button/stories/) for a real-world example.
- **Unit testing**: See [scannlab-unit-test](../scannlab-unit-test/SKILL.md) for component testing patterns.
- **Docs prompt**: See [`docs/storybook.prompt.md`](../../docs/storybook.prompt.md) for the original prompt this skill evolved from.
