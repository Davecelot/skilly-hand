# Task Complexity Indicators

Use this reference to score task complexity before selecting reasoning depth and token budget.

---

## Scoring Bands

| Total Points | Tier |
| --- | --- |
| 0-2 | Trivial |
| 3-5 | Simple |
| 6-10 | Moderate |
| 11-15 | Complex |
| 16+ | Expert |

---

## Scoring Matrix

### File Scope

| Indicator | Points |
| --- | --- |
| Single file, known location | 0 |
| Single file, needs search | +1 |
| 2-3 related files | +2 |
| 4-6 files | +4 |
| 7+ files or cross-package | +6 |
| Build/config/tooling impact | +3 |

### Decision Complexity

| Indicator | Points |
| --- | --- |
| Single obvious approach | 0 |
| 2-3 valid approaches, clear best option | +2 |
| Multiple trade-off-heavy approaches | +4 |
| Architectural design required | +6 |
| System-wide pattern impact | +8 |

### Context Requirements

| Indicator | Points |
| --- | --- |
| Can answer from current context | 0 |
| Requires 1-2 file reads | +1 |
| Requires 3-5 file reads | +2 |
| Requires codebase-wide search | +3 |
| Requires dependency understanding | +4 |
| Requires external docs/specs | +2 |

### Impact Level

| Indicator | Points |
| --- | --- |
| Internal helper only | 0 |
| Private module behavior | +1 |
| Public API behavior | +3 |
| Shared utility used broadly | +4 |
| Breaking public change | +6 |
| Security-sensitive code | +8 |
| Performance-critical path | +6 |

### Testing and Validation

| Indicator | Points |
| --- | --- |
| No tests needed | 0 |
| Small unit test update | +1 |
| Multiple test scenarios | +2 |
| Integration/e2e coverage changes | +3 |
| Manual QA verification required | +3 |
| Accessibility validation required | +4 |

### User Clarity (Reduction)

| Indicator | Points |
| --- | --- |
| Vague request | 0 |
| Clear goal | -1 |
| Exact file paths provided | -2 |
| Specific line numbers provided | -3 |
| Reference implementation provided | -4 |
| Explicit acceptance criteria | -2 |

---

## Keyword Signals

High-complexity signals (+3 to +5):

- optimize, performance, security, refactor, migrate, architect, scale

Moderate signals (+1 to +2):

- improve, extend, integrate, validate, fix bug

Low signals (0):

- show, list, find, read, check existence

---

## Context Size Heuristic

| Context Size | Reads/Searches | Typical Tier |
| --- | --- | --- |
| Minimal | 0-1 | Trivial-Simple |
| Light | 2-3 | Simple-Moderate |
| Moderate | 4-7 | Moderate |
| Heavy | 8-15 | Complex |
| Extensive | 16+ | Expert |

---

## Reassessment Triggers

Re-score during execution when:

1. Scope expands into additional systems.
2. The initial approach fails and alternatives are needed.
3. User adds new constraints or quality requirements.
4. Gathered context is insufficient for a safe answer.

Escalate one tier when any of these materially changes risk or effort.

---

## Quick Card

```text
TRIVIAL (0-2)   -> Minimal reasoning, direct answer
SIMPLE (3-5)    -> Light reasoning, focused context
MODERATE (6-10) -> Selective reasoning, targeted exploration
COMPLEX (11-15) -> Regular reasoning, systematic analysis
EXPERT (16+)    -> Deep reasoning, broad trade-off evaluation
```
