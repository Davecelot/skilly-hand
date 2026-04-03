# Agentic Benchmark — Scoring Rubric

This file defines anchor scores for all 10 standard dimensions. Use these anchors to
assign consistent, justifiable scores. Interpolate between anchors for intermediate values.

---

## Dimension 1: Skill Depth & Specificity

**What it measures:** How detailed, actionable, and context-rich are individual skill files?
A shallow skill is a short description. A deep skill has decision trees, anti-patterns,
code examples, scope taxonomy, and structured metadata.

| Score | Anchor Description |
|---|---|
| **1** | Skills are absent or contain only a one-line description with no structure. |
| **3** | Skills have a description and basic instructions but no examples, decision trees, or metadata. |
| **5** | Skills have structured sections (when to use, examples, commands) but are generic and not project-specific. |
| **7** | Skills have decision trees, project-specific patterns, frontmatter with trigger clauses, and code examples. |
| **10** | Skills have all of the above PLUS: scope taxonomy, anti-patterns, structured changelogs, metadata versioning, and local file references. |

---

## Dimension 2: Skill Breadth & Coverage

**What it measures:** How many areas of the software development lifecycle are addressed
by the skill set? Coverage gaps mean some workflows have no AI guidance.

| Score | Anchor Description |
|---|---|
| **1** | 1–3 skills covering a single narrow workflow. |
| **3** | 5–10 skills covering one or two areas (e.g., only testing or only deployment). |
| **5** | 10–20 skills covering core development workflows (component, test, docs, CI). |
| **7** | 20–50 skills covering most of the dev lifecycle including meta-skills. |
| **10** | 50+ skills covering the full dev lifecycle: frontend, backend, infra, QA, security, AI, design, docs, and more. |

---

## Dimension 3: Self-Governance / Meta-Infrastructure

**What it measures:** Do skills manage themselves? Is there a closed lifecycle
(create → validate → sync → evolve)? Self-governance means the agentic structure
can maintain its own quality without manual intervention.

| Score | Anchor Description |
|---|---|
| **1** | No meta-skills. Skills are static files with no management tooling. |
| **3** | A basic skill creator exists, but no validation or sync tooling. |
| **5** | Skills can be created and synced, but validation is manual and informal. |
| **7** | Full lifecycle: creator + lint validation + sync to registry + multi-file sync. |
| **10** | Full lifecycle PLUS: AI semantic review agent, pre-commit git hook enforcement, metadata auto-update with version tracking, and interactive changelog management. |

---

## Dimension 4: Workflow Orchestration / Chaining

**What it measures:** Are multi-skill workflows documented with prerequisites and
explicit ordering? Chaining turns isolated skills into complete end-to-end workflows.

| Score | Anchor Description |
|---|---|
| **1** | No chaining. Skills are independent and unconnected. |
| **3** | Some skills reference each other informally (e.g., "see also: skill-x"). |
| **5** | 1–2 documented workflows with ordering, but no prerequisite enforcement. |
| **7** | 3+ documented chains with explicit prerequisites, ordering, and auto-invoke directives. |
| **10** | Chains are formally documented with mandatory entry points, prerequisite enforcement, and "always invoke first" rules enforced in the AI config files. |

---

## Dimension 5: Validation & Quality Assurance

**What it measures:** Are there automated checks for skill integrity? Quality assurance
means a broken or stale skill is caught before it causes AI misbehavior.

| Score | Anchor Description |
|---|---|
| **1** | No validation. Skills are trusted as-is. |
| **3** | Validation is a manual checklist or informal review process. |
| **5** | A basic lint script exists that checks required fields or YAML syntax. |
| **7** | CLI lint script + metadata auto-update tool. Deterministic and fast. |
| **10** | CLI lint + metadata management + AI semantic review agent (multi-phase: schema, consistency, behavioral) + git hook enforcement + CI/CD exit codes. |

---

## Dimension 6: Multi-Model / Cross-Platform Support

**What it measures:** Do the AI instructions work across multiple AI tools (Claude Code,
Copilot, Cursor, Gemini, etc.)? Cross-platform support multiplies the reach of agentic work.

| Score | Anchor Description |
|---|---|
| **1** | Hard-coded for one AI tool only. No portability. |
| **3** | One AI config file that one tool reads; others have nothing. |
| **5** | Two AI config files (e.g., AGENTS.md + CLAUDE.md) covering two tools. |
| **7** | Three AI config files covering 3 major tools (Claude, Gemini, Copilot). Sync process exists. |
| **10** | 5+ tools supported with auto-generated format adapters per platform. Sync is automated and idempotent. |

---

## Dimension 7: Domain Specialization

**What it measures:** Is the agentic structure deeply integrated with the project's specific
domain? Generic skills help; domain-specific skills that understand the project's actual
components, tokens, APIs, and workflows help far more.

| Score | Anchor Description |
|---|---|
| **1** | All skills are generic (e.g., "write tests", "check accessibility") with no project-specific knowledge. |
| **3** | Skills mention the project's tech stack but provide no domain-specific patterns. |
| **5** | Skills include project-specific examples and patterns (e.g., naming conventions, file paths). |
| **7** | Skills encode deep domain knowledge: component APIs, design token systems, project-specific decision trees. |
| **10** | Full domain pipeline is agentic: end-to-end workflows from domain source (e.g., Figma) through code generation, testing, accessibility, and deployment — all guided by domain-specific skills. |

---

## Dimension 8: Context Management

**What it measures:** Is there explicit guidance for AI token usage, reasoning depth,
and model tier selection? Context management prevents AI waste and improves output quality.

| Score | Anchor Description |
|---|---|
| **1** | No context guidance. AI uses default behavior for all tasks. |
| **3** | A note in CLAUDE.md or AGENTS.md about being concise. |
| **5** | Basic guidance: "use thinking for complex tasks", "be brief for simple ones". |
| **7** | Complexity classification table with examples; reasoning depth matching; progressive escalation rules. |
| **10** | Dedicated skill with complexity tiers, model-agnostic tier mapping, thinking block guidelines, anti-pattern catalog, and mandatory pre-task invocation rule. |

---

## Dimension 9: Documentation & Discoverability

**What it measures:** Can an AI agent (or human developer) quickly find and understand
the right skill for a given task? Good discoverability means no skill is siloed or orphaned.

| Score | Anchor Description |
|---|---|
| **1** | Skills exist but are not indexed or referenced anywhere. Discovery is manual file browsing. |
| **3** | A flat list of skill names in a README, no descriptions or triggers. |
| **5** | Registry with names and descriptions, but no explicit trigger clauses or auto-invoke rules. |
| **7** | Registry with names, descriptions, and trigger clauses. Auto-invoke table maps actions to skills. |
| **10** | Above PLUS: skills have explicit "Trigger:" clauses in frontmatter, skill-sync keeps registry synchronized, chaining notations document workflows, and skills/README.md is auto-generated. |

---

## Dimension 10: Production Readiness / CI-CD Integration

**What it measures:** Is the agentic structure production-hardened? Are there automated
gates that prevent broken or stale AI infrastructure from reaching the main branch?

| Score | Anchor Description |
|---|---|
| **1** | No automation. Everything is manual. |
| **3** | Some npm scripts exist, but they are not enforced or documented. |
| **5** | A validation script runs on demand with clear pass/fail output. |
| **7** | Pre-commit hook enforces skill quality. Validation script returns exit codes usable in CI. |
| **10** | Pre-commit hook (automatically installed) + CI/CD step that validates on PR + exit codes for pipeline use + metadata auto-update integrated into the commit workflow. |

---

## Score Interpretation

| Composite (sum of 10 dims) | Maturity Level | Interpretation |
|---|---|---|
| 0–20 | Absent | No meaningful agentic structure. Skills or AI config may not exist. |
| 21–40 | Emerging | Basic AI config files exist, a few skills. No lifecycle or validation. |
| 41–60 | Developing | Reasonable skill coverage with some structure. Workflows informal. |
| 61–75 | Established | Solid skill set with meta-infrastructure. Most workflows are guided. |
| 76–88 | Advanced | Strong lifecycle, validation, orchestration. Deep domain integration. |
| 89–100 | Best-in-class | Full lifecycle, CI/CD hardened, cross-platform, domain-specialized. |
