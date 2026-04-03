# WCAG 2.2 — Level A + AA Checklist for Angular Components

> Based on [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [How to Meet WCAG 2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/).

## Principle 1: Perceivable

### Guideline 1.1 — Text Alternatives

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 1.1.1 | A | Non-text content has text alternatives | `<img>` has `alt`; icon buttons have `aria-label`; decorative images use `alt=""` + `role="presentation"` |

### Guideline 1.2 — Time-based Media

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 1.2.1 | A | Audio/video-only: alternative provided | Prerecorded audio/video has transcript or description |
| 1.2.2 | A | Captions (prerecorded) | Videos have synchronized captions |
| 1.2.3 | A | Audio description or media alternative | Video content has audio description track |
| 1.2.4 | AA | Captions (live) | Live video has real-time captions |
| 1.2.5 | AA | Audio description (prerecorded) | Prerecorded video has audio description |

### Guideline 1.3 — Adaptable

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 1.3.1 | A | Info and relationships conveyed through structure | Semantic HTML (`<h1>`–`<h6>`, `<label>`, `<table>`, `<fieldset>`); no heading skips |
| 1.3.2 | A | Meaningful sequence | DOM order matches visual reading order |
| 1.3.3 | A | Sensory characteristics | Instructions don't rely solely on shape, color, size, location |
| 1.3.4 | AA | Orientation | Content works in both portrait and landscape |
| 1.3.5 | AA | Identify input purpose | Input fields use `autocomplete` attribute for common data (name, email, etc.) |

### Guideline 1.4 — Distinguishable

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 1.4.1 | A | Use of color | Color is not sole means of conveying info (add icons, patterns, text) |
| 1.4.2 | A | Audio control | Auto-playing audio can be paused/stopped/muted |
| 1.4.3 | AA | Contrast (minimum) | Normal text ≥ 4.5:1; large text ≥ 3:1 |
| 1.4.4 | AA | Resize text | Content readable at 200% zoom without horizontal scrolling |
| 1.4.5 | AA | Images of text | Real text used instead of images of text |
| 1.4.10 | AA | Reflow | Content reflows at 320px width without 2D scrolling |
| 1.4.11 | AA | Non-text contrast | UI components & graphics have ≥ 3:1 contrast |
| 1.4.12 | AA | Text spacing | Content works with increased letter/word/line spacing |
| 1.4.13 | AA | Content on hover or focus | Hoverable/focused tooltips are dismissible, hoverable, persistent |

---

## Principle 2: Operable

### Guideline 2.1 — Keyboard Accessible

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 2.1.1 | A | Keyboard | All functionality available via keyboard |
| 2.1.2 | A | No keyboard trap | Focus can be moved away from any component using keyboard |
| 2.1.4 | A | Character key shortcuts | Single-char shortcuts can be turned off, remapped, or activated only on focus |

### Guideline 2.2 — Enough Time

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 2.2.1 | A | Timing adjustable | Time limits can be extended, disabled, or are ≥ 20 hours |
| 2.2.2 | A | Pause, stop, hide | Auto-updating/moving content can be paused, stopped, or hidden |

### Guideline 2.3 — Seizures and Physical Reactions

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 2.3.1 | A | Three flashes or below threshold | No content flashes more than 3 times per second |

### Guideline 2.4 — Navigable

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 2.4.1 | A | Bypass blocks | Skip-navigation link or landmarks to bypass repeated content |
| 2.4.2 | A | Page titled | Pages have descriptive `<title>` |
| 2.4.3 | A | Focus order | Tab order matches logical reading/operation order |
| 2.4.4 | A | Link purpose (in context) | Link text (or context) describes destination |
| 2.4.5 | AA | Multiple ways | More than one way to locate pages (search, sitemap, nav) |
| 2.4.6 | AA | Headings and labels | Headings and labels describe topic or purpose |
| 2.4.7 | AA | Focus visible | Keyboard focus indicator is visible |
| 2.4.11 | AA | Focus not obscured (minimum) | Focused element is not entirely hidden by other content |

### Guideline 2.5 — Input Modalities

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 2.5.1 | A | Pointer gestures | Multi-point/path gestures have single-pointer alternative |
| 2.5.2 | A | Pointer cancellation | Down-event doesn't trigger action; can abort/undo |
| 2.5.3 | A | Label in name | Accessible name contains visible label text |
| 2.5.4 | A | Motion actuation | Motion-triggered functions have UI alternative + can be disabled |
| 2.5.7 | AA | Dragging movements | Drag operations have single-pointer alternative |
| 2.5.8 | AA | Target size (minimum) | Touch/click targets ≥ 24×24 CSS px |

---

## Principle 3: Understandable

### Guideline 3.1 — Readable

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 3.1.1 | A | Language of page | `<html lang="...">` is present |
| 3.1.2 | AA | Language of parts | Content in different language uses `lang` attribute |

### Guideline 3.2 — Predictable

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 3.2.1 | A | On focus | No context change on focus alone |
| 3.2.2 | A | On input | No context change on input without prior warning |
| 3.2.3 | AA | Consistent navigation | Navigation order consistent across pages |
| 3.2.4 | AA | Consistent identification | Same functional components have same labels |
| 3.2.6 | AA | Consistent help | Help mechanisms in same relative position across pages |

### Guideline 3.3 — Input Assistance

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 3.3.1 | A | Error identification | Errors described in text (not color alone) |
| 3.3.2 | A | Labels or instructions | Form inputs have visible labels/instructions |
| 3.3.3 | AA | Error suggestion | Error messages suggest correction when known |
| 3.3.4 | AA | Error prevention (legal, financial, data) | Submissions are reversible, checked, or confirmed |
| 3.3.7 | A | Redundant entry | Previously entered data is auto-populated or selectable |
| 3.3.8 | AA | Accessible authentication (minimum) | Auth doesn't require cognitive tests; alternatives available |

---

## Principle 4: Robust

### Guideline 4.1 — Compatible

| SC | Level | Summary | What to Check |
|---|---|---|---|
| 4.1.2 | A | Name, role, value | Custom widgets have ARIA name, role, states, and values |
| 4.1.3 | AA | Status messages | Dynamic messages use `role="status"`, `role="alert"`, or `aria-live` |

---

*Reference: [WCAG 2.2 W3C Recommendation](https://www.w3.org/TR/WCAG22/) · [Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)*
