# Stack Scan Checklist

Reference table for stack-detector. Use this to ensure no detection category is missed before producing the confirmed stack summary.

---

## Detection Categories

| Category | What to Find | Where to Look | How to Detect | Confirmed? |
| --- | --- | --- | --- | --- |
| **Framework** | React, Vue, Angular, Svelte, Solid, Astro, etc. | `package.json` dependencies | `react`, `vue`, `@angular/core`, `svelte`, `astro` in deps | [ ] |
| **Meta-framework** | Next.js, Nuxt, Remix, SvelteKit, etc. | `package.json`, config files | `next`, `nuxt`, `@remix-run/react` in deps; `next.config.*`, `nuxt.config.*` | [ ] |
| **UI component library** | MUI, Chakra, shadcn, Radix, Headless, Ant, Mantine | `package.json` + component imports | `@mui/material`, `@chakra-ui/react`, `antd`, `@mantine/core`, `@headlessui/react`, or `components.json` | [ ] |
| **shadcn/ui (special)** | Local shadcn component files | `src/components/ui/`, `components.json` | `ls src/components/ui/`; `cat components.json` | [ ] |
| **CSS approach** | Tailwind, CSS Modules, styled-components, Emotion, Sass, vanilla | File extensions + package.json | `.module.css`, `.module.scss`, `styled.`, `css\``, `tailwindcss` in deps | [ ] |
| **CSS preprocessor** | Sass/SCSS, Less, PostCSS | `package.json`, file extensions | `sass`, `less`, `postcss` in deps; `.scss`, `.less` files | [ ] |
| **Design tokens (CSS vars)** | Custom properties at `:root` | Global CSS/SCSS files | `grep -rn ":root"` in stylesheets | [ ] |
| **Design tokens (Tailwind)** | Extended colors, spacing, fonts | `tailwind.config.ts` / `tailwind.config.js` | `theme.extend.colors`, `theme.extend.spacing`, `theme.extend.fontFamily` | [ ] |
| **Design tokens (theme file)** | MUI theme, Chakra theme, custom theme provider | `src/theme.ts`, `src/styles/theme.ts`, `ThemeProvider` usage | `cat theme.ts`; search for `createTheme`, `extendTheme`, `ThemeProvider` | [ ] |
| **Design tokens (JSON)** | Figma tokens, Style Dictionary output | `tokens.json`, `design-tokens.json` | `find . -name "tokens.json"` | [ ] |
| **Style utilities** | cn(), clsx(), classnames, twMerge | Utility files, component imports | `grep -rl "clsx\|cn(\|classnames\|twMerge" src/` | [ ] |
| **Component location** | Where components live in the project | `src/components/`, `app/components/`, `components/` | `find src -maxdepth 3 -type d -name "components"` | [ ] |
| **Naming convention** | PascalCase files, kebab-case files, flat vs nested | Sampled component file names | Read 3–5 component files | [ ] |
| **TypeScript** | Typed props, interfaces, generics in use | File extensions, tsconfig | `.tsx`, `.ts` files; `typescript` in deps | [ ] |
| **Existing breakpoints** | sm, md, lg, xl values | `tailwind.config`, global CSS, theme file | `theme.screens` in Tailwind; media queries in global CSS | [ ] |

---

## Ambiguity Flags

Stop and ask the user if any of these are true:

| Condition | Question to Ask |
| --- | --- |
| Both Tailwind and styled-components present | "Which is the canonical styling approach for new components?" |
| Multiple UI libraries detected | "Are all of these in active use, or is one being deprecated?" |
| No tokens found anywhere | "No design tokens were found. Are values hardcoded throughout, or is there a file I missed?" |
| `components/ui/` exists but no `components.json` | "I see a `ui/` folder but no shadcn config. Is this shadcn, or a custom component library?" |
| CSS Modules and Tailwind both in use | "Do new components use Tailwind, CSS Modules, or both? Which does the team prefer?" |
| No component files found in expected locations | "Where does the project keep its UI components?" |
| `package.json` exists but no lock file | "Is this project actively maintained? No lock file found — dependencies may be inconsistent." |

---

## Minimum Viable Summary

The confirmed stack summary passed to component-designer must include all of the following. Any `[unknown]` field must be resolved with the user before proceeding.

```
Framework:         [name + version]
Meta-framework:    [name + version] or [none]
UI library:        [name + version] or [none]
CSS approach:      [primary approach] + [secondary if applicable]
Design tokens:     [source file(s) + list of key token categories available]
Style utilities:   [e.g. cn() from @/lib/utils] or [none]
Component pattern: [structural observation from sampled files]
Sampled files:     [list of 3–5 file paths read]
```
