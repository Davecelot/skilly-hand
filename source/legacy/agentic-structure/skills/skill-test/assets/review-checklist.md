# Skill Review Checklist

Use this rubric when performing semantic validation (Phases 2–3) on a skill.

## Phase 2: Consistency Checks

### C2.1 — Auto-Invoke Alignment

**Question:** Does the skill's `auto-invoke` field match how the skill is actually used in the body?

| Grade | Finding |
|---|---|
| ✓ PASS | Auto-invoke description covers all major patterns in the skill body. No false positives or edge cases missed. |
| ⚠ WARN | Auto-invoke is mostly accurate but missing one edge case or pattern. Can be clarified. |
| ✗ FAIL | Auto-invoke description does not match body. Skill would trigger on unintended inputs or would miss intended ones. |

**How to check:**
1. Read the `auto-invoke` field in YAML frontmatter.
2. Skim the skill body to identify all use cases mentioned.
3. Do all body use cases fall within the auto-invoke description?
4. Does the auto-invoke description suggest the skill should be used in cases NOT covered by the body?

**Example (PASS):**
```yaml
auto-invoke: "When writing or reviewing Angular component code"
```
Body covers: component structure, component best practices, component testing, component styling.
→ All fall under "writing/reviewing component code."

**Example (FAIL):**
```yaml
auto-invoke: "When writing Angular code"
```
Body covers: components, services, interceptors, guards, resolvers.
→ Too broad: "writing Angular code" could include configuration files, build scripts, etc.
Recommendation: Narrow to "When writing or reviewing Angular components and services."

---

### C2.2 — Allowed-Tools Usage

**Question:** Do all declared `allowed-tools` appear in the skill? Conversely, are unlisted tools used?

| Grade | Finding |
|---|---|
| ✓ PASS | Declared tools are used. No undeclared tools are referenced. List is accurate. |
| ⚠ WARN | Minor tool listed but rarely used. Or tool used but not critical to skill function. |
| ✗ FAIL | Tool listed but not used anywhere, OR tool used but not listed. Creates confusion. |

**How to check:**
1. Extract `allowed-tools` array from frontmatter.
2. Search skill body for references to each tool (e.g., "use Grep to...", "run Bash command").
3. Search for any tool names NOT in the array being used in the body.

**Example (PASS):**
```yaml
allowed-tools: [Read, Grep, Edit]
```
Body uses: "Read the component file", "Grep for hard-coded values", "Edit the CSS file."
→ All declared tools used. None undeclared.

**Example (FAIL):**
```yaml
allowed-tools: [Read, Edit, Write, Bash]
```
Body uses: Read ✓, Edit ✓, Write ✓ (but never used), Bash ✓, **SubAgent ✗** (not listed!).
→ Remove Write, add SubAgent.

---

### C2.3 — Language Consistency

**Question:** Are code examples in a consistent language? If multiple languages are needed, are they clearly organized?

| Grade | Finding |
|---|---|
| ✓ PASS | Single language for all examples, OR multiple languages clearly labeled and organized by section. |
| ⚠ WARN | Mostly consistent but one or two examples in unexpected language. Minor impact. |
| ✗ FAIL | Examples jump between languages without organization. Confusing for reader. |

**How to check:**
1. Identify all code blocks in the skill body.
2. Note the language of each (TypeScript, HTML, CSS, Bash, etc.).
3. Are examples grouped by language/topic?

**Example (PASS):**
```markdown
## TypeScript Examples

```typescript
const item = signal('value');
```

## Template Examples

```html
<app-component [data]="item()"></app-component>
```
```

Organization is clear. Reader knows which section to look at.

**Example (FAIL):**
```markdown
### Signal Patterns (mixed)

```typescript
const value = signal(0);
```

Common usage:

```html
<div>{{ value() }}</div>
```

But also in ng-if:

```bash
# Check if signal is used in templates
grep -r "signal(" src/
```
```

TypeScript, HTML, and Bash mixed without clear demarcation. Confusing.

---

### C2.4 — Trigger Specificity

**Question:** Is the skill's scope appropriately narrow or is it too broad?

| Grade | Finding |
|---|---|
| ✓ PASS | Skill scope is specific enough to be clearly invoked, but broad enough to cover related patterns. |
| ⚠ WARN | Scope could be clearer or slightly narrower, but still usable. |
| ✗ FAIL | Scope is too broad (would trigger on unintended tasks) or too narrow (would be missed in relevant scenarios). |

**How to check:**
1. Read the `auto-invoke` statement and the "When to Use" section.
2. Would a developer know when to invoke this skill?
3. Would this skill trigger on tasks it's NOT meant for?

**Example (PASS):**
```
auto-invoke: "When creating or updating Storybook stories for Angular components"
```
Clear: Stories → this skill. Testing → different skill. Component creation → different skill.

**Example (FAIL):**
```
auto-invoke: "When working with components"
```
Vague: Does this apply to component testing? Styling? Layout? All of the above?
Recommendation: Narrow to specific activity (e.g., "When creating Storybook stories for...").

---

## Phase 3: Behavioral Checks

### B3.1 — Code Example Correctness

**Question:** Are code examples syntactically valid and do they follow current best practices?

| Grade | Finding |
|---|---|
| ✓ PASS | All examples are valid, runnable, and follow current framework/language best practices. |
| ⚠ WARN | Most examples are correct; 1–2 use outdated patterns but are still functional. Recommend updating. |
| ✗ FAIL | Example(s) are syntactically invalid, use deprecated APIs, or would cause errors if run. Blocker. |

**How to check:**
1. For each code example, mentally run or test it.
2. Does it compile/run without errors?
3. Does it follow the framework's current best practices?
4. Is the example outdated (e.g., using Class Components in an Angular 20 signals guide)?

**Example (PASS — Angular 20.3+):**
```typescript
export class MyComponent {
  count = signal(0);
  increment = () => this.count.update(v => v + 1);
}
```
Valid syntax, uses signals (current best practice for Angular 20.3+). ✓

**Example (FAIL — Outdated):**
```typescript
export class MyComponent implements OnInit {
  countValue = 0;
  ngOnInit() { }
}
```
Uses class properties, no signals. Would trigger anti-pattern guidance in `scannlab-best-practices`.
Recommendation: Update to signal-based pattern.

---

### B3.2 — Pattern Applicability

**Question:** Do patterns address real-world scenarios? Are edge cases covered?

| Grade | Finding |
|---|---|
| ✓ PASS | Patterns are based on common real-world scenarios. Edge cases are acknowledged or explicitly out-of-scope. |
| ⚠ WARN | Patterns cover 80% of use cases; some edge cases mentioned but not fully explored. |
| ✗ FAIL | Patterns are theoretical or unrealistic. Developers would not encounter documented scenarios in practice. |

**How to check:**
1. Do the "When to Use" examples match real tasks a developer does?
2. Are there obvious edge cases NOT mentioned?
3. Does the skill say "in all cases..." when exceptions exist?

**Example (PASS):**
```markdown
### When to Use
- Creating new button variants
- Updating existing button styles
- Adding responsive breakpoints

### When NOT to Use (edge cases)
- For icon styling (use icon-specific patterns)
- For animated buttons (use animation guidelines, not here)
```
Covers the normal case and explicitly calls out exceptions. ✓

**Example (FAIL):**
```markdown
### When to Use
- Writing Angular code
```
Too broad. What kind of Angular code? Components? Services? Pipes? Utilities?
Recommendation: List specific scenarios.

---

### B3.3 — Instruction Clarity

**Question:** Are instructions unambiguous and actionable?

| Grade | Finding |
|---|---|
| ✓ PASS | Each instruction is specific, has a clear trigger or condition, and provides a step-by-step path. |
| ⚠ WARN | Instructions are mostly clear but have one vague phrase or missing example. Interpretable. |
| ✗ FAIL | Instructions are ambiguous, use undefined terms, or lack examples. Developer would be confused. |

**How to check:**
1. Pick a random instruction from the body.
2. Could a developer follow it without asking for clarification?
3. Are terms like "appropriate", "relevant", "typically" vague without examples?

**Example (PASS):**
```
1. Check that the component accepts @Input() properties for customization.
2. In your test file, create a fixture using TestBed.createComponent(MyComponent).
3. Set the input: component.componentInstance.myProp = testValue;
4. Verify behavior with expect().toEqual().
```
Specific, ordered, actionable. ✓

**Example (FAIL):**
```
1. Make sure your component is appropriate for testing.
2. Write tests that make sense.
3. Use good test patterns.
```
Vague: What makes a component "appropriate"? What does "makes sense" mean? Which patterns are "good"?
Recommendation: Add specifics and examples.

---

## Scoring Summary

After checking all items, assign an overall grade:

| Grade | Criteria |
|---|---|
| **A** | Passes C2.1–2.4 and B3.1–3.3 with only minor warnings. Ready to publish. |
| **B** | Passes most checks; 1–2 ⚠ warnings. Recommend fixes before wide publication. |
| **C** | Has several ⚠ warnings or minor ✗ failures. Needs revision. |
| **D** | Multiple ✗ failures in Phase 2 or 3. Must fix before publishing. |
| **F** | Critical failures in correctness (Phase 3) or scope (Phase 2). Do not publish. |

---

## Quick Checklist Template

```markdown
## Semantic Validation: {skill-name}

### Phase 2 — Consistency
- [ ] C2.1 Auto-invoke alignment: _____ (PASS/WARN/FAIL)
- [ ] C2.2 Allowed-tools usage: _____ (PASS/WARN/FAIL)
- [ ] C2.3 Language consistency: _____ (PASS/WARN/FAIL)
- [ ] C2.4 Trigger specificity: _____ (PASS/WARN/FAIL)

### Phase 3 — Behavioral
- [ ] B3.1 Code example correctness: _____ (PASS/WARN/FAIL)
- [ ] B3.2 Pattern applicability: _____ (PASS/WARN/FAIL)
- [ ] B3.3 Instruction clarity: _____ (PASS/WARN/FAIL)

### Overall Grade: _____

### Recommended Actions (Priority)
1. [ ] ...
2. [ ] ...
3. [ ] ...
```
