/**
 * TEMPLATE: Complete Storybook Stories File
 *
 * This template demonstrates the structure for a main component stories file
 * and organized story files in the ScannLab Design System.
 *
 * File structure:
 * - template.stories.ts (this file — main meta + Playground story)
 * - template-variant.stories.ts (variant-specific stories)
 * - template-size.stories.ts (size-specific stories)
 * - template-state.stories.ts (state-specific stories like disabled, loading, etc.)
 */

// ============================================================================
// MAIN STORIES FILE: template.stories.ts
// ============================================================================

import type {
  Decorator,
  Meta,
  StoryContext,
  StoryFn,
  StoryObj,
} from '@storybook/angular';
import { Button, VARIANTS, SIZES } from '../button';

/**
 * Step 1: Define a TypeScript interface for story arguments
 * This ensures type safety and IntelliSense support for all args.
 */
export interface ButtonStoryArgs {
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size: 'xs' | 'sm' | 'md' | 'lg';
  level: 'filled' | 'outlined' | 'link';
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Step 2: Optional — Define a custom decorator for dynamic control logic
 * Use this if you need to update argTypes or other controls based on other props.
 *
 * Example: Updating the level options when the variant changes.
 */
const withLevelsByVariant: Decorator<ButtonStoryArgs> = (
  StoryFn: StoryFn<ButtonStoryArgs>,
  context: StoryContext<ButtonStoryArgs>,
) => {
  const { args, argTypes } = context;
  const variant = args?.variant || 'primary';

  // Update available levels based on variant
  if (variant === 'tertiary') {
    argTypes['level'].options = ['filled', 'link'];
  } else {
    argTypes['level'].options = ['filled', 'outlined', 'link'];
  }

  return StoryFn(args, context);
};

/**
 * Step 3: Define Meta configuration
 * - title: Storybook navigation path (e.g., "Components/Button")
 * - component: The Angular component to render
 * - decorators: Optional custom decorators
 * - argTypes: Define all interactive controls and their descriptions
 */
const meta: Meta<ButtonStoryArgs> = {
  title: 'Components/Button',
  component: Button,
  decorators: [withLevelsByVariant], // Optional: only if needed
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: VARIANTS,
      description: 'Representa la variante visual del botón (jerarquía).',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: { type: 'select' },
      options: SIZES,
      description: 'Tamaño del botón.',
      table: { defaultValue: { summary: 'md' } },
    },
    level: {
      control: { type: 'select' },
      options: ['filled', 'outlined', 'link'],
      description: 'Nivel o estilo visual del botón.',
      table: { defaultValue: { summary: 'filled' } },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Deshabilita el botón.',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Muestra estado de carga.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;

/**
 * Step 4: Export the Story type for reuse in organized story files
 * This allows other story files to import and extend this type.
 */
export type Story = StoryObj<ButtonStoryArgs>;

/**
 * Step 5: Create the Playground story
 * - All controls enabled (default)
 * - Shows the interaction panel with all available controls
 * - Use for exploration and manual testing
 */
export const Playground: Story = {
  args: {
    variant: 'primary',
    level: 'filled',
    size: 'md',
    disabled: false,
    loading: false,
  },
  render: args => ({
    props: args,
    template: `
      <button sButton
        [variant]="variant"
        [level]="level"
        [size]="size"
        [disabled]="disabled"
        [attr.aria-busy]="loading">
        {{ loading ? 'Cargando...' : 'Click Me' }}
      </button>
    `,
  }),
  parameters: {
    controls: { expanded: true },
  },
};

// ============================================================================
// ORGANIZED STORY FILES
// ============================================================================

/**
 * FILE: template-variant.stories.ts
 *
 * Shows each variant visually in isolation.
 * Disables irrelevant controls to focus on the variant difference.
 */

// import meta, { ButtonStoryArgs, Story } from './template.stories';
// import { Meta } from '@storybook/angular';
//
// const variantMeta: Meta<ButtonStoryArgs> = {
//   ...meta,
//   title: 'Components/Button/Variantes', // Creates a sub-folder in Storybook
// };
//
// export default variantMeta;
//
// export const Primary: Story = {
//   args: {
//     variant: 'primary',
//     level: 'filled',
//     size: 'md',
//     disabled: false,
//   },
//   argTypes: {
//     variant: { control: false }, // Hide variant picker
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton
//         [variant]="variant"
//         [level]="level"
//         [size]="size"
//         [disabled]="disabled">
//         Primary
//       </button>
//     `,
//   }),
// };
//
// export const Secondary: Story = {
//   args: {
//     variant: 'secondary',
//     level: 'filled',
//     size: 'md',
//     disabled: false,
//   },
//   argTypes: {
//     variant: { control: false },
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton
//         [variant]="variant"
//         [level]="level"
//         [size]="size"
//         [disabled]="disabled">
//         Secondary
//       </button>
//     `,
//   }),
// };
//
// export const Tertiary: Story = {
//   args: {
//     variant: 'tertiary',
//     level: 'filled',
//     size: 'md',
//     disabled: false,
//   },
//   argTypes: {
//     variant: { control: false },
//     level: { options: ['filled', 'link'] }, // Tertiary only supports these levels
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton
//         [variant]="variant"
//         [level]="level"
//         [size]="size"
//         [disabled]="disabled">
//         Tertiary
//       </button>
//     `,
//   }),
// };
//
// export const Danger: Story = {
//   args: {
//     variant: 'danger',
//     level: 'filled',
//     size: 'md',
//     disabled: false,
//   },
//   argTypes: {
//     variant: { control: false },
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton
//         [variant]="variant"
//         [level]="level"
//         [size]="size"
//         [disabled]="disabled">
//         Danger
//       </button>
//     `,
//   }),
// };

/**
 * FILE: template-size.stories.ts
 *
 * Shows each size visually in isolation.
 * Disables size picker to focus on size differences.
 */

// import meta, { ButtonStoryArgs, Story } from './template.stories';
// import { Meta } from '@storybook/angular';
//
// const sizeMeta: Meta<ButtonStoryArgs> = {
//   ...meta,
//   title: 'Components/Button/Tamaños', // Creates a sub-folder
// };
//
// export default sizeMeta;
//
// export const xs: Story = {
//   args: {
//     variant: 'primary',
//     level: 'filled',
//     size: 'xs',
//     disabled: false,
//   },
//   argTypes: {
//     size: { control: false }, // Hide size picker
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton
//         [variant]="variant"
//         [level]="level"
//         [size]="size"
//         [disabled]="disabled">
//         X-Small
//       </button>
//     `,
//   }),
// };
//
// export const sm: Story = {
//   args: {
//     variant: 'primary',
//     level: 'filled',
//     size: 'sm',
//     disabled: false,
//   },
//   argTypes: {
//     size: { control: false },
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton [variant]="variant" [level]="level" [size]="size" [disabled]="disabled">
//         Small
//       </button>
//     `,
//   }),
// };
//
// export const md: Story = {
//   args: {
//     variant: 'primary',
//     level: 'filled',
//     size: 'md',
//     disabled: false,
//   },
//   argTypes: {
//     size: { control: false },
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton [variant]="variant" [level]="level" [size]="size" [disabled]="disabled">
//         Medium
//       </button>
//     `,
//   }),
// };
//
// export const lg: Story = {
//   args: {
//     variant: 'primary',
//     level: 'filled',
//     size: 'lg',
//     disabled: false,
//   },
//   argTypes: {
//     size: { control: false },
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton [variant]="variant" [level]="level" [size]="size" [disabled]="disabled">
//         Large
//       </button>
//     `,
//   }),
// };

/**
 * FILE: template-state.stories.ts
 *
 * Shows different states (disabled, loading, etc.) in isolation.
 */

// import meta, { ButtonStoryArgs, Story } from './template.stories';
// import { Meta } from '@storybook/angular';
//
// const stateMeta: Meta<ButtonStoryArgs> = {
//   ...meta,
//   title: 'Components/Button/Estados', // Creates a sub-folder
// };
//
// export default stateMeta;
//
// export const Disabled: Story = {
//   args: {
//     variant: 'primary',
//     level: 'filled',
//     size: 'md',
//     disabled: true,
//   },
//   argTypes: {
//     disabled: { control: false }, // Hide disabled picker
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton
//         [variant]="variant"
//         [level]="level"
//         [size]="size"
//         [disabled]="disabled">
//         Disabled
//       </button>
//     `,
//   }),
// };
//
// export const Loading: Story = {
//   args: {
//     variant: 'primary',
//     level: 'filled',
//     size: 'md',
//     disabled: false,
//     loading: true,
//   },
//   argTypes: {
//     loading: { control: false },
//   },
//   render: args => ({
//     props: args,
//     template: `
//       <button sButton
//         [variant]="variant"
//         [level]="level"
//         [size]="size"
//         [attr.aria-busy]="loading">
//         {{ loading ? 'Cargando...' : 'Click Me' }}
//       </button>
//     `,
//   }),
// };

/**
 * KEY PATTERNS DEMONSTRATED:
 *
 * ✅ Type-safe args via ButtonStoryArgs interface
 * ✅ Custom decorator for dynamic control logic
 * ✅ Meta configuration with Spanish descriptions
 * ✅ Playground story with all controls enabled
 * ✅ Organized story files inheriting from main meta
 * ✅ Individual stories with disabled irrelevant controls
 * ✅ Inline render functions with templates
 * ✅ Semantic template binding (e.g., [variant]="variant")
 * ✅ Conditional rendering (e.g., loading state)
 *
 * WORKFLOW:
 * 1. Uncomment the organized story files above
 * 2. Rename them to match your component name
 * 3. Update import paths and exported type
 * 4. Add additional stories as needed for new variants/sizes/states
 */
