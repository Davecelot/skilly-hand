# Storybook Stories - Quick Reference

> Based on the Button component pattern in ScannLab Design System

⚠️ **Important Notes:**
- AI should **NOT modify `.storybook/main.ts`** — Storybook's sidebar configuration is managed by the tooling, not AI integration.
- Always create the **`.mdx` file first** for main documentation, then create `.stories.ts` for interactive examples.

## File Organization

```
component/
├── component.ts                  # Component class
├── component.spec.ts             # Unit tests
├── component.css                 # Styles
├── component.mdx                 # Main documentation (Storybook page)
└── stories/
    ├── component.stories.ts              ← Interactive: Meta + Playground
    ├── component-variant.stories.ts      ← Interactive: Variants (primary, secondary, etc.)
    ├── component-size.stories.ts         ← Interactive: Sizes (xs, sm, md, lg)
    ├── component-level.stories.ts        ← Interactive: Levels (filled, outlined, link)
    └── component-state.stories.ts        ← Interactive: States (disabled, loading, etc.)
```

### Documentation Files

- **`component.mdx`** — **Main file** for documentation (written content, usage examples, guidelines). **Create this first** for the primary component documentation.
- **`stories/*.stories.ts`** — **Complementary files** for interactive examples (controls, variants playground). Focus on UI variations and interactive controls, not long doc text.

## Main File: `component.stories.ts`

**Purpose**: Define meta configuration and Playground story with all controls enabled.

**Checklist**:
- [ ] Import `Meta`, `StoryObj`, and optional `Decorator` from `@storybook/angular`
- [ ] Define a `ComponentStoryArgs` interface with all props as type-safe properties
- [ ] Create custom `Decorator` if you need dynamic control logic (optional)
- [ ] Define `Meta` with:
  - `title: 'Components/ComponentName'`
  - `component: YourComponent`
  - `decorators: [...]` (optional)
  - `argTypes: { ... }` for all interactive controls
- [ ] Export `meta` as default
- [ ] Export `Story` type for reuse in organized files
- [ ] Create `Playground` story with:
  - `args` with default values
  - `render()` function with template
  - `parameters: { controls: { expanded: true } }`

**Template**:
```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { MyComponent } from '../my-component';

export interface MyComponentStoryArgs {
  variant: string;
  disabled?: boolean;
}

const meta: Meta<MyComponentStoryArgs> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  argTypes: { /* ... */ },
};

export default meta;
export type Story = StoryObj<MyComponentStoryArgs>;

export const Playground: Story = {
  args: { /* ... */ },
  render: args => ({
    props: args,
    template: `<my-component [variant]="variant"></my-component>`,
  }),
  parameters: { controls: { expanded: true } },
};
```

---

## Organized Files: `component-{variant|size|state}.stories.ts`

**Purpose**: Show one variant/size/state per story, focused view.

**Checklist**:
- [ ] Import the main meta and Story type: `import meta, { MyComponentStoryArgs, Story } from './my-component.stories'`
- [ ] Define new `Meta` by spreading the imported meta: `const newMeta: Meta<MyComponentStoryArgs> = { ...meta, title: 'Components/MyComponent/Variants' }`
- [ ] Export `newMeta` as default
- [ ] For each variant/size/state, create a story with:
  - `args` with fixed values for that variant
  - `argTypes: { variant: { control: false } }` to disable the picker
  - `render()` function with template
- [ ] Write descriptions and labels in **Spanish**

**Template**:
```typescript
import meta, { MyComponentStoryArgs, Story } from './my-component.stories';
import { Meta } from '@storybook/angular';

const componentMeta: Meta<MyComponentStoryArgs> = {
  ...meta,
  title: 'Components/MyComponent/Variants', // Creates sub-folder
};

export default componentMeta;

export const Primary: Story = {
  args: {
    variant: 'primary',
    disabled: false,
  },
  argTypes: {
    variant: { control: false }, // Disable picker
  },
  render: args => ({
    props: args,
    template: `<my-component [variant]="variant"></my-component>`,
  }),
};

export const Secondary: Story = {
  args: { variant: 'secondary', disabled: false },
  argTypes: { variant: { control: false } },
  render: args => ({
    props: args,
    template: `<my-component [variant]="variant"></my-component>`,
  }),
};
```

---

## Decision Tree: Which Files Do I Need?

| Scenario | Main File | Variant File | Size File | State File |
|----------|:---------:|:------------:|:---------:|:----------:|
| Simple component (no variants) | ✅ | ❌ | ❌ | ❌ |
| Component with variants | ✅ | ✅ | ❌ | ❌ |
| Component with variants + sizes | ✅ | ✅ | ✅ | ❌ |
| Component with states (disabled, loading) | ✅ | ❌ | ❌ | ✅ |
| Complex component (all of above) | ✅ | ✅ | ✅ | ✅ |

---

## Common Patterns

### Pattern: Disable Irrelevant Controls

When showing a specific variant, disable the variant picker:

```typescript
argTypes: {
  variant: { control: false }, // User can't change it
}
```

### Pattern: Update Options Based on Another Control

Use a custom **Decorator** in the main file:

```typescript
const withLevelsByVariant: Decorator<ButtonStoryArgs> = (
  StoryFn,
  context,
) => {
  const variant = context.args?.variant;
  const levels = getLevelsForVariant(variant);
  context.argTypes['level'].options = levels;
  return StoryFn(context.args, context);
};

const meta: Meta<ButtonStoryArgs> = {
  decorators: [withLevelsByVariant],
  // ...
};
```

### Pattern: Conditional Rendering

Use template syntax for conditional rendering:

```typescript
template: `
  <my-component [disabled]="disabled">
    {{ loading ? 'Loading...' : 'Click Me' }}
  </my-component>
`
```

### Pattern: Multiple Stories for Size Variations

Create one story per size in `component-size.stories.ts`:

```typescript
export const xs: Story = {
  args: { size: 'xs' },
  argTypes: { size: { control: false } },
  render: args => ({
    props: args,
    template: `<my-component [size]="size">X-Small</my-component>`,
  }),
};

export const sm: Story = {
  args: { size: 'sm' },
  argTypes: { size: { control: false } },
  render: args => ({
    props: args,
    template: `<my-component [size]="size">Small</my-component>`,
  }),
};
// ... etc for md, lg
```

---

## Spanish Descriptions

Always write descriptions and labels in Spanish (following project convention):

```typescript
argTypes: {
  variant: {
    description: 'Representa la variante visual del botón (jerarquía).',
    table: { defaultValue: { summary: 'primary' } },
  },
  disabled: {
    description: 'Deshabilita el botón.',
    table: { defaultValue: { summary: 'false' } },
  },
}
```

---

## Example: Button Component

Main file: `button.stories.ts`
- Meta configuration
- Playground story (all controls)

Organized files:
- `button-variant.stories.ts` → Primary, Secondary, Tertiary, Danger
- `button-size.stories.ts` → xs, sm, md, lg
- `button-level.stories.ts` → Filled, Outlined, Link
- `button-icon.stories.ts` → WithSupportIcon, WithLeadingIcon

See [/projects/scanntech-ui/src/components/button/stories/](../../../../projects/scanntech-ui/src/components/button/stories/) for the actual implementation.

---

## Commands

```bash
npm run storybook           # Start dev server
npm run storybook:build    # Build static output
```

---

## See Also

- [SKILL.md](../SKILL.md) — Full documentation
- [template.stories.ts](./template.stories.ts) — Complete template with all patterns
- [scannlab-best-practices](../../scannlab-best-practices/SKILL.md) — Angular best practices
- [scannlab-unit-test](../../scannlab-unit-test/SKILL.md) — Unit testing guide
