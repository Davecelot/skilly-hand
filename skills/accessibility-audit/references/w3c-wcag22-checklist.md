# W3C WCAG 2.2 Level AA Checklist (Web)

Source basis:

- WCAG 2 Overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/
- Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/
- Understanding WCAG 2: https://www.w3.org/WAI/WCAG22/Understanding/

Default conformance target in this skill: **WCAG 2.2 Level AA**.

## Principle 1: Perceivable

| SC | Level | Audit Focus |
| --- | --- | --- |
| 1.1.1 Non-text Content | A | Images/icons/media alternatives (`alt`, labels, text alternatives) |
| 1.3.1 Info and Relationships | A | Semantic headings, labels, table/form relationships |
| 1.3.2 Meaningful Sequence | A | DOM reading order matches meaning |
| 1.3.3 Sensory Characteristics | A | Instructions are not only shape/color/position |
| 1.3.4 Orientation | AA | Content works in portrait and landscape unless essential |
| 1.3.5 Identify Input Purpose | AA | Appropriate `autocomplete` tokens for user-data fields |
| 1.4.1 Use of Color | A | Color is not the only information channel |
| 1.4.3 Contrast (Minimum) | AA | Text contrast thresholds are met |
| 1.4.4 Resize Text | AA | Content remains usable at 200% text resize |
| 1.4.10 Reflow | AA | Reflow at narrow viewport without two-dimensional scroll |
| 1.4.11 Non-text Contrast | AA | Component boundaries/icons/focus indicators are distinguishable |
| 1.4.12 Text Spacing | AA | Increased spacing does not break content/function |
| 1.4.13 Content on Hover or Focus | AA | Hover/focus content is dismissible, hoverable, persistent |

## Principle 2: Operable

| SC | Level | Audit Focus |
| --- | --- | --- |
| 2.1.1 Keyboard | A | All functionality operable via keyboard |
| 2.1.2 No Keyboard Trap | A | Focus can enter and leave all components |
| 2.1.4 Character Key Shortcuts | A | Single-character shortcuts are safe/controllable |
| 2.4.1 Bypass Blocks | A | Mechanism exists to bypass repeated blocks |
| 2.4.2 Page Titled | A | Document/page has descriptive title |
| 2.4.3 Focus Order | A | Focus sequence follows meaningful operation |
| 2.4.4 Link Purpose (In Context) | A | Link purpose is clear from text/context |
| 2.4.6 Headings and Labels | AA | Headings/labels clearly describe purpose |
| 2.4.7 Focus Visible | AA | Visible focus indicator for keyboard users |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Focused element is not fully hidden |
| 2.5.3 Label in Name | A | Accessible name includes visible label text |
| 2.5.7 Dragging Movements | AA | Drag interactions have non-drag alternatives |
| 2.5.8 Target Size (Minimum) | AA | Pointer targets meet minimum size/spacing |

## Principle 3: Understandable

| SC | Level | Audit Focus |
| --- | --- | --- |
| 3.1.1 Language of Page | A | Correct `lang` on root document |
| 3.1.2 Language of Parts | AA | Language changes are marked in content |
| 3.2.1 On Focus | A | Focus alone does not trigger unexpected context change |
| 3.2.2 On Input | A | Input alone does not trigger unexpected context change |
| 3.2.3 Consistent Navigation | AA | Repeated navigation mechanisms are consistent |
| 3.2.4 Consistent Identification | AA | Same functions are identified consistently |
| 3.2.6 Consistent Help | AA | Repeated help mechanisms are consistently positioned |
| 3.3.1 Error Identification | A | Errors are identified in text |
| 3.3.2 Labels or Instructions | A | Inputs include labels/instructions |
| 3.3.3 Error Suggestion | AA | Suggested correction is provided when possible |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | Reversible/confirmable/validated submissions |
| 3.3.7 Redundant Entry | A | Re-entry burden reduced where possible |
| 3.3.8 Accessible Authentication (Minimum) | AA | Authentication avoids inaccessible cognitive tests |

## Principle 4: Robust

| SC | Level | Audit Focus |
| --- | --- | --- |
| 4.1.2 Name, Role, Value | A | UI controls expose name, role, state/value correctly |
| 4.1.3 Status Messages | AA | Dynamic status is conveyed programmatically |

## W3C Tooling Complements

Use W3C validators from https://www.w3.org/developers/tools/ as supporting checks:

- Nu HTML Checker
- CSS Validator

These checks complement, but do not replace, manual WCAG behavior verification.
