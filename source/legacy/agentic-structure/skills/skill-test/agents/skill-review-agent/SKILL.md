# skill-review-agent

**Purpose**: Perform Phase 2–3 (Semantic) validation on a skill's SKILL.md file.

**What it validates:**
- Consistency between `auto-invoke` description and actual triggers used in body
- `allowed-tools` list matches patterns actually used in the skill
- Code examples are syntactically correct and match declared language
- Trigger descriptions match common use cases and actual skill patterns
- Instructions are unambiguous and actionable

**Prerequisite**: Phase 1 (structural) validation should pass first.

---

## Three-Phase Review Protocol

### Phase 1 — Schema ✓ (Already Completed)

Assumed to have been validated by `skill-lint-agent`. If not, run that first.

### Phase 2 — Consistency

**What it checks:**

| Check | What to Look For |
|---|---|
| **auto-invoke alignment** | Does the human-readable `auto-invoke` description match how the skill is actually used in the body? |
| **allowed-tools usage** | Are all listed `allowed-tools` actually referenced in the skill instructions? Conversely, do instructions use unlisted tools? |
| **language consistency** | If code examples are in TypeScript, do all examples actually use TypeScript? Mixed languages suggest poor organization. |
| **trigger specificity** | Is the skill's trigger narrowly scoped or overly broad? Would following the trigger cause this skill to activate on unintended inputs? |

**How to validate:**

```markdown
### Phase 2 — Consistency

**Check auto-invoke alignment:**
- Skill says: "Use this when writing Angular component code"
- Body actually uses it for: [component creation, component testing, styling]
- ✓ ALIGNED: All three are covered by "writing component code"

**Check allowed-tools usage:**
- Declared: [Read, Edit, Write, Grep]
- Actually used: Read ✓, Edit ✓, Write ✓, Grep ✓, Bash ✗
- ✗ MISALIGNED: Body uses Bash but not listed in allowed-tools

**Check language consistency:**
- Declared examples: TypeScript
- Actual examples: [TypeScript ✓, TypeScript ✓, HTML ✗]
- ⚠ WARNING: One HTML example in a TypeScript-focused skill
```

### Phase 3 — Behavioral

**What it checks:**

| Check | What to Look For |
|---|---|
| **Example correctness** | Are code examples syntactically valid and runnable? Would a developer copy-paste them without errors? |
| **Pattern applicability** | Do examples match real-world scenarios developers encounter? Are edge cases covered? |
| **Completeness** | If the skill says "do X", does it explain when NOT to do X? |

**How to validate:**

```markdown
### Phase 3 — Behavioral

**Example: Accessibility Checklist**

Example given:
  ```html
  <img src="chart.png" alt="Monthly sales comparison bar chart">
  ```

Test: Is this example correct?
- ✓ Syntax valid
- ✓ Follows WCAG 2.2 guidance
- ✓ `alt` text is descriptive and not redundant
- Verdict: **CORRECT**

---

**Example: Signal Input Testing**

Code snippet provided:
  ```typescript
  const component = TestBed.createComponent(MyComponent);
  component.componentInstance.mySignal.set(newValue);
  ```

Test: Would this work in modern Angular tests?
- ⚠ Uses old TestBed API (assumes zoneful change detection)
- ✗ Doesn't show zoneless pattern (current best practice)
- ✓ Syntax valid, but outdated pattern
- Verdict: **NEEDS UPDATE** — add zoneless example

---

**Edge Case Check:**

Skill says: "Use const over let"
- ✓ Policy stated clearly
- ✗ But missing: When should let be used? (Loop counters, reactive reassignment)
- Recommendation: Add "Exceptions" section explaining when let is necessary
```

---

## Validation Output Format

Present findings in this structured format:

```markdown
## Semantic Validation Report: {skill-name}

### Phase 1 — Schema ✓
All frontmatter valid. Passed structural checks.

### Phase 2 — Consistency

Status: [✓ PASS | ⚠ WARNINGS | ✗ FAIL]

**Checks:**
- ✓ auto-invoke matches body patterns
- ⚠ allowed-tools: Bash used but not declared
- ✓ Language consistency: All TypeScript examples
- ✓ Trigger specificity: Appropriately scoped

**Recommendation**: Add `Bash` to allowed-tools array.

### Phase 3 — Behavioral

Status: [✓ PASS | ⚠ WARNINGS | ✗ FAIL]

**Code Examples:**
- ✓ Signal input example correct per Angular 20.3+
- ⚠ Zoneless pattern example works but needs clarification
- ✓ CSS Modules syntax valid

**Pattern Completeness:**
- ⚠ "Use strong types" section missing exception for `any` in legacy code
- ✓ All recommended patterns have counterexamples

**Findings:**
1. Update zoneless explanation with zone.js vs zoneless comparison
2. Add "When to use `any`" subsection
3. Consider adding link to Angular style guide

---

## Overall Grade: A (Minor improvements suggested)

**Suggested Actions (Priority):**
1. [ ] Add Bash to allowed-tools (1 minute)
2. [ ] Clarify zoneless pattern (5 minutes)
3. [ ] Add legacy code exception for `any` (5 minutes)

**After fixes**, re-validate with Phase 1 to confirm YAML is still valid.
```

---

## Escalation Paths

**If Phase 2 fails:**
```
The skill has inconsistencies between declared scope and actual usage.
Recommend fixing before publishing. Priority: [HIGH | MEDIUM | LOW]
```

**If Phase 3 fails:**
```
Code examples are outdated or incorrect. This could mislead developers.
Recommend fixing before skill is widely used. Priority: [HIGH | MEDIUM]
```

**If all phases pass:**
```
✓ Skill is production-ready. Recommend proceeding to skill-sync and AGENTS.md updates.
```

---

## Notes for AI

- Be specific about findings. Instead of "unclear", say exactly what's ambiguous.
- Prefer actionable recommendations over criticism.
- Reference official docs (Angular, WCAG, etc.) when validating correctness.
- Distinguish between "breaking issues" (Phase 3 correctness) and "style issues" (Phase 2 consistency).
