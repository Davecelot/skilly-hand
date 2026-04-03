---
name: token-optimizer
description: >
  Guides AI models to match reasoning depth and token usage to task complexity, optimizing for efficiency by recommending appropriate model tiers and thinking strategies.
  Trigger: When analyzing task complexity, selecting model reasoning level, optimizing token usage, or determining how much effort to invest in a response.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.2"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Optimizing token usage and reasoning depth"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

# Token Optimizer Guide

## When to Use

**Use this skill when:**

- Starting a new task and need to determine the appropriate reasoning depth.
- Deciding whether a task warrants advanced reasoning or can be handled with lighter models.
- Optimizing token consumption across a development workflow.
- Balancing speed/cost against task complexity.
- Evaluating if a response requires thinking blocks or can be answered directly.

**Don't use this skill for:**

- Tasks where the user explicitly requests a specific model or reasoning level.
- Emergency debugging where speed matters more than token optimization.
- Tasks already in progress (optimize at the start, not mid-flight).

---

## Critical Patterns

### Pattern 1: Classify Task Complexity FIRST

Before starting any task, evaluate its complexity using this framework:

| Complexity | Characteristics | Examples |
|------------|----------------|----------|
| **Trivial** | Single-step, deterministic, no ambiguity | File existence check, simple grep, retrieve version number |
| **Simple** | 2-3 steps, clear path, minimal context needed | Read a config value, list directory contents, basic search |
| **Moderate** | Multiple steps, some reasoning, context from 1-3 files | Implement a small function, debug simple error, update config |
| **Complex** | Multi-file analysis, architectural decisions, edge cases | Refactor across files, design new feature, resolve integration issue |
| **Expert** | System-wide impact, optimization, security, or critical bugs | Performance optimization, security audit, breaking API changes |

### Pattern 2: Match Reasoning Depth to Complexity

Once complexity is determined, apply the appropriate reasoning strategy:

```text
Trivial Tasks
├─ Model tier: Basic/Fast (GPT-3.5, Claude Haiku, Gemini Flash)
├─ Thinking blocks: None
├─ Context gathering: Minimal (direct tool call)
└─ Response style: 1-2 sentences max

Simple Tasks
├─ Model tier: Basic/Fast
├─ Thinking blocks: Rare, only if ambiguous
├─ Context gathering: 1-2 parallel reads
└─ Response style: Brief, factual (2-4 sentences)

Moderate Tasks
├─ Model tier: Mid-range (GPT-4, Claude Sonnet, Gemini Pro)
├─ Thinking blocks: Selective (key decisions only)
├─ Context gathering: 3-5 targeted operations
└─ Response style: Concise with key details (1 paragraph)

Complex Tasks
├─ Model tier: Advanced (GPT-4, Claude Sonnet 4.5, Gemini Advanced)
├─ Thinking blocks: Regular (plan, analyze, verify)
├─ Context gathering: Systematic exploration
└─ Response style: Detailed with rationale (multiple paragraphs)

Expert Tasks
├─ Model tier: Reasoning-optimized (o1, Claude Opus, Gemini Ultra)
├─ Thinking blocks: Extensive (reasoning through trade-offs)
├─ Context gathering: Comprehensive investigation
└─ Response style: Thorough analysis with alternatives
```

### Pattern 3: Progressive Escalation

Start with the lightest appropriate tier. Escalate only if:

1. Initial approach reveals unexpected complexity.
2. Task has hidden dependencies or edge cases.
3. User feedback indicates more depth is needed.

**Anti-pattern**: Don't automatically reach for advanced reasoning because a task "might" be complex.

### Pattern 4: Token-Saving Strategies

Apply these patterns regardless of complexity tier:

**DO:**
- Batch independent read operations in parallel.
- Use targeted searches (grep with specific patterns) over semantic search when keywords are known.
- Read larger file sections once instead of multiple small reads.
- Combine related edits with multi_replace_string_in_file.
- Filter and limit output with `grep`, `head`, `tail` before displaying.

**DON'T:**
- Re-search for information already in context.
- Read entire files when you need specific sections.
- Make redundant tool calls for the same data.
- Generate extensive thinking blocks for straightforward tasks.
- Provide lengthy explanations when a brief answer suffices.

---

## Decision Tree

```text
Task is a single lookup/check?                      → Trivial (basic model, no thinking)
Task needs 2-3 simple steps with clear path?        → Simple (basic model, rare thinking)
Task involves multiple files or design choices?     → Moderate (mid-range model, selective thinking)
Task requires architecture/refactoring decisions?   → Complex (advanced model, regular thinking)
Task impacts security/performance/critical system?  → Expert (reasoning model, extensive thinking)
```

**Complexity Indicators** (upgrade one tier if present):
- User says "optimize", "performance", "security", "critical"
- Dependencies span 5+ files
- Requires backwards compatibility analysis
- Involves public API changes or user-facing behavior
- Needs cross-component integration

**Complexity Reducers** (downgrade one tier if possible):
- User provides exact file paths and line numbers
- Task is well-defined with clear acceptance criteria
- Problem is isolated to single component
- Reference implementation exists

---

## Model-Agnostic Recommendations

This skill is designed to work across all AI/LLM environments. Use this mapping to translate tiers to your available models:

| Tier | Anthropic | OpenAI | Google | Others |
|------|-----------|--------|--------|--------|
| **Basic/Fast** | Haiku | GPT-3.5 Turbo | Flash | Llama 3.1 8B, Mistral Small |
| **Mid-range** | Sonnet 3.5 | GPT-4 Turbo | Pro 1.5 | Llama 3.1 70B, Mixtral 8x7B |
| **Advanced** | Sonnet 4.6 | GPT-4 | Advanced | Llama 3.1 405B, Command R+ |
| **Reasoning** | Opus 4.6 | o1 | Ultra | DeepSeek-R1, QwQ-32B |

If your environment auto-selects models, configure it to respect complexity signals in prompts or tool invocations.

---

## Thinking Block Guidelines

Use thinking blocks strategically:

**ALWAYS use thinking for:**
- Architectural decisions with multiple valid approaches.
- Debugging complex interactions across components.
- Planning multi-step refactoring.
- Analyzing security or performance implications.

**RARELY use thinking for:**
- Direct lookups (file contents, error messages).
- Straightforward implementations with clear patterns.
- Tasks with single correct approach.
- Confirming user-provided information.

**NEVER use thinking for:**
- Trivial queries (math calculations, simple searches).
- Repeating information already established in context.
- Formatting or stylistic decisions without trade-offs.

---

## Complexity Assessment Checklist

Before starting a task, answer these questions:

- [ ] How many files need to be read/modified? (1-2 = simple, 3-5 = moderate, 6+ = complex)
- [ ] Are there multiple valid approaches? (no = simple, yes = moderate+)
- [ ] Does this affect public APIs or user-facing behavior? (yes = +1 tier)
- [ ] Is performance/security/accessibility critical? (yes = expert tier)
- [ ] Can I answer this from existing context? (yes = trivial)
- [ ] Does the user provide exact locations/specifications? (yes = -1 tier)

---

## Code Examples

### Example 1: Trivial Task (< 50 tokens)

```text
User: "What's the current version in package.json?"

Classification: Trivial
- Single file read
- Direct lookup
- No decisions needed

Response approach:
- Read package.json lines 1-10
- Extract version field
- Return value (no thinking, no explanation)
```

### Example 2: Simple Task (50-200 tokens)

```text
User: "Check if the alert component has tests"

Classification: Simple
- 1-2 file operations
- Boolean determination
- Minimal context

Response approach:
- Search for alert test files
- Confirm presence/absence
- 1 sentence response
```

### Example 3: Moderate Task (200-800 tokens)

```text
User: "Add a disabled state to the button component"

Classification: Moderate
- Multiple file edits (component, styles, types)
- Design decision (attribute vs class)
- Follows existing patterns

Response approach:
- Brief thinking for approach
- Read button component structure
- Implement following project conventions
- Concise confirmation
```

### Example 4: Complex Task (800-2000 tokens)

```text
User: "Refactor the form validation system to support async validators"

Classification: Complex
- Multi-file impact
- Architectural change
- Backwards compatibility needed

Response approach:
- Thinking block for design
- Search existing validation patterns
- Plan migration strategy
- Detailed implementation with rationale
```

### Example 5: Expert Task (2000+ tokens)

```text
User: "Optimize the datepicker rendering performance"

Classification: Expert
- Performance-critical
- Requires profiling and measurement
- Multiple optimization strategies
- Trade-off analysis

Response approach:
- Extensive thinking on bottlenecks
- Profile current implementation
- Analyze multiple approaches
- Thorough explanation with benchmarks
```

---

## Anti-Patterns to Avoid

### ❌ Over-Engineering Simple Tasks

```text
User: "What files are in src/components/button?"

BAD:
- Use semantic search
- Read 5 files to understand structure
- Provide detailed architectural analysis
- 500-word explanation

GOOD:
- List directory contents
- Return file names
- 1 sentence response
```

### ❌ Under-Estimating Complex Tasks

```text
User: "Make the app work on mobile"

BAD:
- Assume it's just CSS tweaks
- Make quick changes without analysis
- Skip responsive design patterns

GOOD:
- Classify as Complex/Expert
- Analyze current viewport handling
- Plan systematic responsive implementation
- Consider touch interactions, performance
```

### ❌ Context Thrashing

```text
INEFFICIENT:
1. Search for "button"
2. Search for "component"
3. Search for "styles"
4. Read button.ts lines 1-20
5. Read button.ts lines 21-40
6. Read button.ts lines 41-60

EFFICIENT:
1. Search for "button component styles" (single query)
2. Read button.ts lines 1-100 (one read)
```

---

## Commands

```bash
# Quick complexity check - count related files
find . -name "*{component}*" | wc -l

# Estimate file size before reading (helps assess context needs)
wc -l path/to/file.ts

# Check dependencies (complex if 5+)
grep -r "import.*from.*component" --include="*.ts" | wc -l

# Measure current token usage in responses
# (Strategy: if repeatedly over 1000 tokens for simple tasks, reassess complexity classification)
```

---

## Resources

- **Complexity Guide**: See [references/complexity-indicators.md](references/complexity-indicators.md) for detailed heuristics.
- **Model Capabilities**: Consult your AI platform's documentation for model tier specifications.
- **Usage Tracking**: Monitor token consumption patterns to refine complexity classification over time.
