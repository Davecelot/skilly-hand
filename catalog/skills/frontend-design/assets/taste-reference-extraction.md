# Taste Reference Extraction

Use this when a user provides visual references, asks for better taste, or wants the agent to explain a design direction in language another AI can reliably apply.

This workflow is informed by two public reference systems:

- Refero Styles: https://styles.refero.design/
- Impeccable: https://impeccable.style/

Refero's useful pattern is searchable real-product reference extraction: brand, mood, color, typography, URL, spacing, components, and DESIGN.md-ready output. Impeccable's useful pattern is shared design vocabulary: product-vs-brand register, anti-references, command-like refinement dimensions, and deterministic anti-slop checks.

Do not copy either source's site language into project briefs. Use them as a model for how to structure taste into observable decisions.

---

## When to Use

Use this asset when:

- The user names sites, products, brands, moods, or URLs as references.
- `DESIGN.md` needs stronger language than vague adjectives.
- A generated UI feels generic but the fix is not obvious from tokens alone.
- The user asks to make something feel more premium, editorial, playful, precise, calm, technical, or distinctive.

Do not use it to override existing project tokens, accessibility requirements, or explicit user constraints.

---

## Extraction Ladder

Move from vague taste to buildable decisions in this order.

### 1. Register

Classify the surface before choosing visual moves.

| Register | Design Role | Good Taste Looks Like |
| --- | --- | --- |
| Brand | Design is the product: landing pages, launches, portfolios, editorial, venues, campaigns | Distinctive imagery, stronger type voice, memorable composition, carefully chosen drama |
| Product | Design serves repeated work: dashboards, tools, CRM, admin, commerce flows | Fast scanning, durable hierarchy, predictable controls, restrained styling, task-first density |
| Hybrid | Brand expression wraps a functional flow: onboarding, pricing, checkout, product-led homepage | Brand moments at entry points; product clarity at decision and action points |

Write the register into `DESIGN.md` when it is known.

### 2. Reference Inventory

For each reference, extract the visible ingredients:

```text
Reference:
Role: close model / partial ingredient / anti-reference
Register: brand / product / hybrid
Borrow:
- Typography:
- Color:
- Spacing and density:
- Layout structure:
- Component shape:
- Imagery or texture:
- Motion:
Avoid:
- Surface-level mimicry:
- Patterns that would not fit this product:
```

If the user provides only a mood, ask for one concrete reference or translate the mood into likely ingredients and mark them as assumptions.

### 3. Taste Rules

Convert references into rules the implementation can check.

Good taste rules are concrete:

- "Use color as state and emphasis, not as section decoration."
- "Favor one strong typographic contrast over multiple decorative containers."
- "Keep dashboard panels dense and flat; reserve depth for dialogs and active overlays."
- "Use asymmetry in hero composition, but keep form controls conventional."

Weak taste rules are vague:

- "Make it premium."
- "Use modern design."
- "Make it clean."
- "Add personality."

### 4. Anti-References

Name what must not happen. Anti-references prevent the model from falling back to common AI reflexes.

Capture:

- explicit sites or products to avoid;
- visual tropes to reject;
- category cliches to resist;
- font, palette, layout, or motion reflexes that would make the output generic.

Common anti-reference language:

- no purple-to-blue gradients unless already in the brand system;
- no glass cards, glow borders, or blurred background blobs as decoration;
- no nested card stacks for page sections;
- no icon-tile feature grid as the default explanation pattern;
- no centered hero plus metrics unless the product actually needs that story;
- no monospace as shorthand for technical credibility;
- no motion that does not communicate state, cause, or hierarchy.

### 5. Taste Contract

End with a short contract that can be pasted into `DESIGN.md` or a task prompt.

```markdown
## Taste Contract

**Register:** [brand/product/hybrid]
**Reference role:** [what each reference contributes]
**Borrow:** [3-5 concrete ingredients]
**Avoid:** [3-5 anti-references]
**Hierarchy:** [how attention should move]
**Density:** [sparse, balanced, dense, or context-specific]
**Color role:** [brand, state, emphasis, data, or restraint]
**Typography role:** [voice, clarity, editorial contrast, utility]
**Motion role:** [none, state feedback, spatial continuity, delight]
**Failure mode:** [what would make this feel generic or wrong]
```

---

## Reference Use Rules

- Borrow decisions, not whole layouts.
- Prefer real product evidence over mood words.
- Keep brand and product registers separate; do not critique one by the other.
- When references conflict, decide which ingredient each one owns.
- Let anti-references constrain reflexes before choosing new decoration.
- Translate every aesthetic claim into at least one implementation lever: type, color, spacing, density, shape, imagery, motion, or copy voice.
- Do not introduce new tokens without stack confirmation and user approval.

---

## Example

```text
User says: "Make it feel like Linear and Apple, but not another dark SaaS dashboard."

Register: product
Reference roles:
- Linear: density, command-center clarity, restrained dark surfaces
- Apple: precision, generous detail spacing, high trust, fewer competing borders
Borrow:
- crisp text hierarchy with clear primary action
- muted surfaces with state-driven accent color
- shallow depth and precise separators instead of card stacks
- dense tables, but roomy detail panes
Avoid:
- neon-on-dark glow effects
- purple gradients
- giant centered hero metrics
- generic rounded cards around every group
Failure mode:
- looking like a launch page instead of a work surface
```
