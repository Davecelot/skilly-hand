# Task Complexity Indicators

This reference provides detailed heuristics for classifying task complexity to optimize token usage and model selection.

---

## Complexity Scoring System

Assign points based on these indicators, then use the total to determine tier:

| Total Points | Complexity Tier |
|--------------|----------------|
| 0-2 | Trivial |
| 3-5 | Simple |
| 6-10 | Moderate |
| 11-15 | Complex |
| 16+ | Expert |

---

## Scoring Indicators

### File Scope (+points)

| Indicator | Points |
|-----------|--------|
| Single file, known location | 0 |
| Single file, needs search | +1 |
| 2-3 related files | +2 |
| 4-6 files | +4 |
| 7+ files or cross-package | +6 |
| Affects build configuration or tooling | +3 |

### Decision Complexity (+points)

| Indicator | Points |
|-----------|--------|
| Single obvious approach | 0 |
| 2-3 valid approaches, clear best choice | +2 |
| Multiple approaches with trade-offs | +4 |
| Requires architectural design | +6 |
| Impacts system-wide patterns | +8 |

### Context Requirements (+points)

| Indicator | Points |
|-----------|--------|
| Answer from memory/general knowledge | 0 |
| Requires 1-2 file reads | +1 |
| Requires 3-5 file reads | +2 |
| Requires search across codebase | +3 |
| Requires understanding dependencies | +4 |
| Requires external documentation | +2 |

### Impact Level (+points)

| Indicator | Points |
|-----------|--------|
| Internal helper function | 0 |
| Private component method | +1 |
| Public component API | +3 |
| Shared utility used widely | +4 |
| Breaking change to public API | +6 |
| Security-sensitive code | +8 |
| Performance-critical path | +6 |

### Testing & Validation (+points)

| Indicator | Points |
|-----------|--------|
| No tests needed | 0 |
| Simple unit test addition | +1 |
| Multiple test scenarios | +2 |
| Integration test changes | +3 |
| Requires manual QA validation | +3 |
| Needs accessibility audit | +4 |

### User Specification Clarity (-points, reduction)

| Indicator | Points |
|-----------|--------|
| Vague request ("improve X") | 0 |
| Clear goal stated | -1 |
| Exact file paths provided | -2 |
| Specific line numbers given | -3 |
| Reference implementation provided | -4 |
| Acceptance criteria listed | -2 |

---

## Domain-Specific Complexity Modifiers

### Frontend/UI Tasks

**Increase complexity if:**
- Affects responsive design (mobile, tablet, desktop)
- Involves accessibility (ARIA, keyboard navigation)
- Requires animation or interaction states
- Impacts cross-browser compatibility
- Changes component visual design

**Reduce complexity if:**
- Follows established component pattern
- Has existing similar component as reference
- Uses design system tokens (no custom styles)

### Backend/API Tasks

**Increase complexity if:**
- Involves database migrations
- Affects API versioning or contracts
- Requires authentication/authorization changes
- Impacts data privacy or security
- Involves async/concurrency patterns

**Reduce complexity if:**
- CRUD operation with existing patterns
- Single endpoint with no side effects
- Follows established service architecture

### Testing Tasks

**Increase complexity if:**
- Requires mocking complex dependencies
- Involves asynchronous behavior testing
- Needs integration or E2E test setup
- Testing error/edge cases extensively

**Reduce complexity if:**
- Simple unit test for pure function
- Follows existing test patterns
- Minimal setup/teardown needed

### Documentation Tasks

**Generally low complexity (Trivial-Simple), except:**
- Documenting complex architectural decisions (+4)
- Creating API reference for large surface area (+3)
- Writing migration guides (+5)

---

## Keyword Triggers

Certain keywords in user requests signal complexity:

### High Complexity Keywords (+3-5 points)

- "optimize", "performance"
- "refactor", "restructure"
- "security", "vulnerability"
- "migrate", "upgrade"
- "design", "architect"
- "scalability", "resilience"

### Moderate Complexity Keywords (+1-2 points)

- "improve", "enhance"
- "extend", "add feature"
- "fix bug" (depends on bug complexity)
- "integrate", "connect"
- "validate", "verify"

### Low Complexity Keywords (0 points)

- "get", "show", "find"
- "list", "check", "verify existence"
- "read", "display"
- "what", "where", "when"

---

## Context Size Estimation

Estimate how much context the task requires:

| Context Size | File Reads | Search Operations | Complexity Impact |
|--------------|------------|-------------------|-------------------|
| Minimal | 0-1 | 0-1 | Trivial/Simple |
| Light | 2-3 | 1-2 | Simple/Moderate |
| Moderate | 4-7 | 2-4 | Moderate |
| Heavy | 8-15 | 4-8 | Complex |
| Extensive | 16+ | 8+ | Expert |

---

## Real-World Examples Scored

### Example 1: "What's the version in package.json?"

```
File scope: Single file, known (+0)
Decisions: None (+0)
Context: Direct read (+1)
Impact: None (+0)
Testing: None (+0)
User clarity: Exact path (-2)
───────────────────────
TOTAL: -1 → Trivial
```

### Example 2: "Add a loading spinner to the button"

```
File scope: 2-3 files (+2)
Decisions: Icon choice, placement (+2)
Context: Read button component (+2)
Impact: Public component API (+3)
Testing: Visual states test (+2)
User clarity: Clear goal (-1)
───────────────────────
TOTAL: 10 → Moderate
```

### Example 3: "Fix the memory leak in datepicker"

```
File scope: Unknown, needs investigation (+4)
Decisions: Multiple debugging approaches (+4)
Context: Understand component lifecycle (+4)
Impact: Performance-critical (+6)
Testing: Memory profiling needed (+3)
User clarity: Clear issue (-1)
───────────────────────
TOTAL: 20 → Expert
```

### Example 4: "List all .ts files in src/components"

```
File scope: Directory listing (+0)
Decisions: None (+0)
Context: File system only (+0)
Impact: None (+0)
Testing: None (+0)
User clarity: Exact path (-2)
───────────────────────
TOTAL: -2 → Trivial
```

### Example 5: "Create a new checkbox component"

```
File scope: 4-6 files (component, styles, tests, docs) (+4)
Decisions: API design, states, styling (+4)
Context: Review similar components (+3)
Impact: Public API (+3)
Testing: Multiple scenarios (+2)
User clarity: Clear goal (-1)
───────────────────────
TOTAL: 15 → Complex
```

---

## Reassessment Triggers

Reassess complexity mid-task if:

1. **Scope Creep**: Task reveals hidden dependencies or requirements.
2. **Blocker Encountered**: Assumed solution doesn't work; alternative needed.
3. **User Feedback**: User clarifies or expands requirements.
4. **Insufficient Context**: Initial reads don't provide enough information.

**When reassessing**: Escalate to next tier and adjust reasoning depth accordingly.

---

## Calibration Over Time

Track these metrics to refine complexity estimation:

- **Token usage per complexity tier**: Are Simple tasks consistently under 200 tokens?
- **Task completion time**: Are Trivial tasks resolved in 1-2 tool calls?
- **User satisfaction**: Do users ask for more/less detail?
- **Rework frequency**: Are initial approaches sufficient or require revision?

Adjust scoring thresholds based on observed patterns in your specific codebase.

---

## Quick Reference Card

```text
TRIVIAL (0-2 pts)    → Basic model, no thinking, < 50 tokens
  "Show me X", "What is Y", "List Z"

SIMPLE (3-5 pts)     → Basic model, rare thinking, 50-200 tokens
  "Check if X exists", "Find where Y is used"

MODERATE (6-10 pts)  → Mid-range model, selective thinking, 200-800 tokens
  "Add feature X", "Update component Y", "Fix bug Z"

COMPLEX (11-15 pts)  → Advanced model, regular thinking, 800-2000 tokens
  "Refactor X system", "Design Y feature", "Integrate Z"

EXPERT (16+ pts)     → Reasoning model, extensive thinking, 2000+ tokens
  "Optimize X performance", "Secure Y endpoint", "Migrate Z architecture"
```
