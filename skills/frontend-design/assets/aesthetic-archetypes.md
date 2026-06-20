# Aesthetic Archetypes

Reference card for greenfield projects or when a user asks for design direction with no existing codebase to read from.

Each archetype describes a coherent visual personality using framework-agnostic, implementation-neutral language. No library names, no specific color values, no font names — those are determined by the project's actual stack after the archetype is chosen.

**How to use:**

1. Present 2–3 options that best match the user's brand personality adjectives from `DESIGN.md`.
2. Let the user choose or mix.
3. Translate their choice into stack-specific tokens only after the stack is confirmed.

---

## 1. Refined Minimal

**Character**: Quiet confidence. Less is deliberate, not lazy.

**Typography**: Small, tight type scale. Generous leading. Weight does the work — one bold statement surrounded by light body. No more than two font roles.

**Color**: Near-monochromatic. One neutral family (warm or cool), one restrained accent used sparingly. Near-black text, near-white backgrounds, or their dark-mode inversion.

**Spacing**: Generous. Breathing room is the dominant visual element. Consistent, predictable rhythm.

**Motion**: Subtle. Fade and micro-translate on interaction. Nothing draws attention to itself.

**Avoid**: Decorative dividers, rounded corners exceeding the system's established radius, anything that shouts.

---

## 2. Editorial

**Character**: Print-informed. Content is the design.

**Typography**: Dramatic scale jumps. Display-size headings, small caption text. Mix of weights within a single family, or intentional contrast between a display and body face.

**Color**: High contrast. Often near-black + near-white + one ink-like accent. Color is used to mark, not decorate.

**Spacing**: Asymmetric. Grid-breaking is intentional. Vertical rhythm anchors the layout.

**Motion**: Minimal — content should feel immediate. Scroll-driven reveals acceptable.

**Avoid**: Card-heavy layouts, rounded blobs, friendly pastels.

---

## 3. Brutalist

**Character**: Uncompromising. Honesty over comfort.

**Typography**: System stack or intentionally unglamorous. Oversized. Unkerned when intentional. All-caps statements.

**Color**: High contrast. Black, white, and one harsh accent (or pure black and white only). No gradients.

**Spacing**: Structural — not generous, not cramped. Grid is exposed.

**Motion**: Instant or near-instant. Snap, not glide.

**Avoid**: Soft shadows, border-radius, anything "friendly."

---

## 4. Retro-Futuristic

**Character**: Technology filtered through nostalgia.

**Typography**: Geometric or monospace. Tight tracking. All-caps labels. Clear grid hierarchy.

**Color**: Deep backgrounds (near-black or dark navy), bright accent (neon-adjacent — high chroma, not true neon). Subtle scanline or grid texture acceptable.

**Spacing**: Dense with breathing room only at macro level. Sections feel packed but orderly.

**Motion**: Purposeful. Reveal effects, typewriter entrances, scan-line wipes. All must have reduced-motion fallbacks.

**Avoid**: Glassmorphism, light-mode defaults, organic shapes.

---

## 5. Organic

**Character**: Human-made, unhurried.

**Typography**: Humanist or transitional — faces with visible calligraphic origin. Variable weight welcomed. Generous leading.

**Color**: Earth-adjacent. Warm neutrals, muted greens, terracotta, dusty indigo. Nothing fully saturated.

**Spacing**: Flowing. Sections breathe into each other. Asymmetry that feels natural, not forced.

**Motion**: Eases that feel physical — spring or custom cubic-bezier that overshoots slightly. Gentle.

**Avoid**: Sharp corners, high-tech palettes, monospace.

---

## 6. Luxury

**Character**: Restraint signals value.

**Typography**: Elegant — thin weights, generous tracking on headings. Serif display for brand moments, clean sans for utility.

**Color**: Muted, sophisticated. Champagne, slate, obsidian, aged gold. Saturation deliberately low. One metallic or warm-neutral accent.

**Spacing**: Very generous. White space is a premium material.

**Motion**: Slow and deliberate. 400–600ms entrances. Ease-out only — nothing bounces.

**Avoid**: Bright colors, heavy weights, any pattern that reads as cheap or casual.

---

## 7. Playful

**Character**: Fun is a feature, not a compromise.

**Typography**: Rounded or friendly. Variable weight for expression. Larger scale than strictly necessary.

**Color**: Multi-hue. 3–4 colors with clear semantic roles. Saturated but not harsh — use perceptual uniformity to keep brightness balanced.

**Spacing**: Responsive to content, not rigid. Cards can be different sizes. Grid can breathe unevenly.

**Motion**: Expressive micro-interactions. Confirmation states feel satisfying. Always reduced-motion safe.

**Avoid**: Pure black text, sharp corners, anything that reads as corporate or cold.

---

## 8. Industrial

**Character**: Form follows function. No apology for complexity.

**Typography**: Utilitarian sans-serif. Dense but readable. Tabular figures for data. Weight for hierarchy, not decoration.

**Color**: Neutral-forward. Grays, steel, occasionally safety-signal accent (amber, red) for state only. Not decorative.

**Spacing**: Dense. Information-rich layouts. Tables, grids, dashboards. Whitespace is used to separate data, not to decorate.

**Motion**: Minimal. State changes are instant or near-instant. Loading indicators, not entrances.

**Avoid**: Rounded blobs, decorative gradients, anything that prioritizes aesthetics over clarity.

---

## Mixing Archetypes

Users often want combinations. Common pairings:

| Combination | Character |
| ----------- | --------- |
| Refined Minimal + Editorial | High-end content publishing |
| Industrial + Retro-Futuristic | Developer tools with personality |
| Organic + Luxury | Premium wellness or lifestyle |
| Playful + Refined Minimal | Consumer product with restraint |
| Brutalist + Editorial | Independent media, strong POV |

When mixing, one archetype leads (governs spacing and color) and the other accents (contributes a single element — e.g., typography from Editorial onto a Refined Minimal base).
