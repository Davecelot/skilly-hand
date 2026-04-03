# Code Connect Examples

Use these as reference formats. Replace placeholders with real values from the repo and Figma.

## Example: Button Contract + Mapping

**Contract excerpt (button):**

```markdown
## Identity

| Field | Value |
|---|---|
| Figma component name | Button |
| Figma node URL | https://www.figma.com/file/FILE_KEY/Library?node-id=123-456 |
| Angular component name | Button |
| Source file | projects/scanntech-ui/src/components/button/button.ts |
| Public selector | button[sButton], a[sButton] |
| Mapping file | projects/scanntech-ui/src/components/button/figma/button.figma.ts |

## Inputs

| Category | Name | Allowed values / shape | Source file |
|---|---|---|---|
| Enum | variant | primary, secondary, tertiary, danger, on-negative | button.ts |
| Enum | level | filled, outlined, link | button.ts |
| Enum | size | sm, md, lg | button.ts |
| Boolean | disabled | true, false | button.ts |
| Content slot | label | string | button.stories.ts |

## Constraints

| Rule | Evidence |
|---|---|
| tertiary does not allow outlined | button.ts |
```

**Mapping skeleton (button):**

```ts
import { figma } from '@figma/code-connect/html';

figma.connect('https://www.figma.com/file/FILE_KEY/Library?node-id=123-456', {
  props: {
    Variant: figma.enum('Variant', {
      Primary: 'primary',
      Secondary: 'secondary',
      Tertiary: 'tertiary',
      Danger: 'danger',
      'On Negative': 'on-negative',
    }),
    Level: figma.enum('Level', {
      Filled: 'filled',
      Outlined: 'outlined',
      Link: 'link',
    }),
    Size: figma.enum('Size', {
      Sm: 'sm',
      Md: 'md',
      Lg: 'lg',
    }),
    Disabled: figma.boolean('Disabled'),
    Label: figma.string('Label'),
  },
  example: (props) =>
    `<button sButton [variant]="'${props.Variant}'" [level]="'${props.Level}'" [size]="'${props.Size}'" [disabled]="${props.Disabled}">${props.Label}</button>`,
});
```

## Example: Text Field Contract + Mapping

**Contract excerpt (text-field):**

```markdown
## Identity

| Field | Value |
|---|---|
| Figma component name | Text Field |
| Figma node URL | https://www.figma.com/file/FILE_KEY/Library?node-id=789-101 |
| Angular component name | TextField |
| Source file | projects/scanntech-ui/src/components/text-field/text-field.ts |
| Public selector | s-text-field |
| Mapping file | projects/scanntech-ui/src/components/text-field/figma/text-field.figma.ts |

## Inputs

| Category | Name | Allowed values / shape | Source file |
|---|---|---|---|
| Enum | type | default, search, password | text-field.ts |
| Enum | state | default, success, warning, error | text-field.ts |
| Enum | inputType | text, number, email, password | text-field.ts |
| Boolean | disabled | true, false | text-field.ts |
| Boolean | readonly | true, false | text-field.ts |
| Boolean | showLabelInfoIcon | true, false | text-field.ts |
| String | label | string | text-field.stories.ts |
| String | placeholder | string | text-field.stories.ts |
| String | value | string | text-field.stories.ts |

## Constraints

| Rule | Evidence |
|---|---|
| readonly and disabled can both be true | text-field.ts |
```

**Mapping skeleton (text-field):**

```ts
import { figma } from '@figma/code-connect/html';

figma.connect('https://www.figma.com/file/FILE_KEY/Library?node-id=789-101', {
  props: {
    Type: figma.enum('Type', {
      Default: 'default',
      Search: 'search',
      Password: 'password',
    }),
    State: figma.enum('State', {
      Default: 'default',
      Success: 'success',
      Warning: 'warning',
      Error: 'error',
    }),
    InputType: figma.enum('Input Type', {
      Text: 'text',
      Number: 'number',
      Email: 'email',
      Password: 'password',
    }),
    Disabled: figma.boolean('Disabled'),
    Readonly: figma.boolean('Readonly'),
    ShowLabelInfoIcon: figma.boolean('Show Label Info Icon'),
    Label: figma.string('Label'),
    Placeholder: figma.string('Placeholder'),
    Value: figma.string('Value'),
  },
  example: (props) =>
    `<s-text-field [type]="'${props.Type}'" [state]="'${props.State}'" [inputType]="'${props.InputType}'" [disabled]="${props.Disabled}" [readonly]="${props.Readonly}" [showLabelInfoIcon]="${props.ShowLabelInfoIcon}" [label]="'${props.Label}'" [placeholder]="'${props.Placeholder}'" [value]="'${props.Value}'"></s-text-field>`,
});
```
