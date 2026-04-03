# Behavioral Fixture Template

When adding behavioral test scenarios to a skill (Phase 3 validation), use this template to document realistic input → expected output relationships.

## What is a Behavioral Fixture?

A **fixture** is a real-world example + expected output that demonstrates whether following a skill's guidance produces correct results.

**Example:**

**Input** (realistic scenario):
```typescript
// Existing component WITHOUT best practices
export class ButtonComponent {
  color: string = 'blue';
  size: string = 'medium';
  disabled: boolean = false;
  
  constructor() {}
  
  onClick() {
    console.log('clicked');
  }
}
```

**Expected Output** (what the skill says to do):
Following `scannlab-best-practices`, this should be refactored to:
```typescript
// Refactored WITH best practices
export class ButtonComponent {
  color = signal<string>('blue');
  size = signal<string>('medium');
  disabled = signal<boolean>(false);
  
  onClick = () => console.log('clicked');
}
```

**Verification**: Code uses signals, arrow functions, no lifecycle hooks unless needed. ✓

---

## Fixture File Template

Create a file per high-stakes skill in the skill folder. Filename: `tests/fixture-{scenario-name}.ts` or `tests/fixture-{scenario-name}.md`.

### Header

```yaml
---
skill: scannlab-best-practices
scenario: "Refactoring class-based component to signals"
complexity: basic
expected-phase: 2–3 (consistency & behavioral)
---
```

### Section 1: Input (Before Applying Skill)

Describe the problematic code or situation:

```markdown
## Input: Class Component Without Signals

**Context**: A legacy Angular component using class properties and OnInit.

**Problem**: Uses `@Input()` instead of signals, causing unnecessary zone.js overhead.

### Code

\`\`\`typescript
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button [disabled]="isDisabled">{{ label }}</button>`,
})
export class ButtonComponent implements OnInit {
  @Input() label: string = '';
  @Input() isDisabled: boolean = false;

  ngOnInit() {}
}
\`\`\`
```

---

### Section 2: Expected Output (After Applying Skill)

Describe what correct application of the skill should produce:

```markdown
## Expected Output: Signals-Based Component

**Guidance Applied**: `scannlab-best-practices` directs converting `@Input()` to signals.

### Code

\`\`\`typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button [disabled]="isDisabled()">{{ label() }}</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  label = input('');
  isDisabled = input(false);
  
  // No OnInit needed
}
\`\`\`

**Why this is correct:**
- ✓ Uses `input()` signal (required-inputs pattern)
- ✓ No `@Input()` decorators
- ✓ No `OnInit` lifecycle hook (not needed)
- ✓ Template calls signals as functions: `label()`, `isDisabled()`
- ✓ Change detection set to `OnPush` (best practice with signals)
```

---

### Section 3: Verification Checklist

List the specific criteria that prove the output is correct:

```markdown
## Verification

When applying the skill, confirm:

- [ ] All `@Input()` properties are converted to `input()` signals
- [ ] Template expressions call signals as functions: `label()` not `label`
- [ ] No `OnInit`, `ngOnInit`, or unused lifecycle hooks
- [ ] Change detection set to `ChangeDetectionStrategy.OnPush`
- [ ] No class properties without signals
- [ ] No `ngOnDestroy` (signals auto-cleanup)
- [ ] Imports use new standalone APIs (no NgModule)

**Result**: If all checks pass, skill guidance was correctly applied. ✓
```

---

### Section 4: Edge Cases & Exceptions (Optional)

Document scenarios where the skill's guidance might NOT apply:

```markdown
## Edge Cases

### Case 1: Required Input with Dynamic Type

**Scenario**: Input accepts multiple types (e.g., `string | number`).

**Guidance**:
\`\`\`typescript
// This is okay:
value = input<string | number>('');
\`\`\`

**Why**: Signals support generics. Type safety is preserved.

---

### Case 2: Legacy Third-Party Library

**Scenario**: Component wraps a jQuery plugin that expects DOM properties.

**Guidance**:
\`\`\`typescript
// If you MUST avoid signals for external lib compatibility:
export class JqueryWrapperComponent {
  @Input() config: object; // Only when library demands it
  elementRef = viewChild('plugin');
}
\`\`\`

**Note**: Document why signals cannot be used. This should be rare.
```

---

### Section 5: Related Patterns (Optional)

Link to other skills or patterns that interact with this one:

```markdown
## Related Patterns

- **Signals in Tests**: See `scannlab-unit-test` for signal testing patterns
- **Styling Signals**: CSS classes can be bound via `[class.active]="prop()"`
- **Two-Way Binding**: Use `[()]` syntax with signals (see Angular docs)
```

---

## Fixture Template (Markdown Format)

Copy this template for new fixtures:

```markdown
---
skill: {skill-name}
scenario: "{brief description of the scenario}"
complexity: [basic | intermediate | advanced]
expected-phase: [1–2 | 2–3] (which validation phase tests this)
---

# Fixture: {Scenario Title}

## Input: {Before State}

**Context**: [Describe the situation]

\`\`\`{language}
[problematic code]
\`\`\`

---

## Expected Output: {After State}

**Guidance Applied**: [Which skill guidance applies]

\`\`\`{language}
[correct code]
\`\`\`

**Why this is correct:**
- ✓ [Reason 1]
- ✓ [Reason 2]

---

## Verification

When applying the skill, confirm:

- [ ] [Check 1]
- [ ] [Check 2]
- [ ] [Check 3]

---

## Edge Cases

### Case 1: [Scenario]

**Guidance**: [What to do]

### Case 2: [Scenario]

**Guidance**: [What to do]

---

## Related Patterns

- [Link to related skill or pattern]
```

---

## Fixture Template (TypeScript File Format)

For code-heavy skills, fixtures can be standalone TypeScript/HTML files:

```typescript
/**
 * Fixture: Refactoring Button Component to Signals
 * 
 * Skill: scannlab-best-practices
 * Scenario: Converting class component to signals
 * 
 * INPUT (before): Class-based component with @Input
 * EXPECTED (after): Signal-based component with input()
 * 
 * Verification: See comments below each section
 */

// ============================================================================
// INPUT — BEFORE (Problematic)
// ============================================================================

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button [disabled]="isDisabled">{{ label }}</button>`,
})
export class ButtonBeforeComponent {
  @Input() label: string = '';
  @Input() isDisabled: boolean = false;
}

// ✗ ISSUES:
// - Uses @Input (outdated pattern)
// - No change detection strategy
// - Unnecessary zone.js overhead

// ============================================================================
// EXPECTED — AFTER (Correct per scannlab-best-practices)
// ============================================================================

import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button [disabled]="isDisabled()">{{ label() }}</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonAfterComponent {
  label = input('');
  isDisabled = input(false);
}

// ✓ CORRECT:
// - Uses input() signals ✓
// - Change detection optimized ✓
// - Template calls signal functions ✓
// - No lifecycle hooks needed ✓

// ============================================================================
// VERIFICATION CHECKLIST
// ============================================================================

// When applying the skill, verify:
// ✓ All @Input() converted to input() signals
// ✓ Template expressions call signals as functions
// ✓ Change detection set to OnPush
// ✓ No unused OnInit lifecycle
// ✓ Component remains standalone-compatible
```

---

## When to Create Fixtures

Create fixtures for:

1. **High-risk skills** (errors would propagate widely)
   - `scannlab-best-practices`
   - `scannlab-unit-test`
   - `scannlab-a11y-checker`
   - `scannlab-token-audit`

2. **Frequently-used skills** (large surface area for drift)
   - Any skill with `auto-invoke` entry

3. **Patterns that change** (when framework/repo patterns evolve)
   - Angular version upgrades
   - Design token refactors
   - Accessibility standard updates

Fixtures DON'T need to exist for simple, rarely-changing skills like `commit-writer` or `pr-writer`.

---

## Integrating Fixtures into Review

When running semantic review (Phase 3):

```
1. Read the skill's SKILL.md
2. Check if fixtures exist in tests/
3. For each fixture:
   - Load the INPUT code
   - Ask: "If I follow this skill, would I produce the EXPECTED code?"
   - Compare actual vs. expected
   - If different: ✗ FAIL, recommend skill correction
4. Report findings in Phase 3 section
```
