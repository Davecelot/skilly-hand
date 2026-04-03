---
name: agentic-benchmark
description: >
  Audits any repository's agentic structure and generates a standardized benchmark
  comparison report against public GitHub projects. Produces a reproducible, scored
  report across 10 standard dimensions. Reusable across any project type or tech stack.
  Trigger: When auditing agentic structure, comparing AI integration quality, benchmarking
  a repository's agent infrastructure, generating an agentic maturity report, or showing
  value of agentic integration work to stakeholders.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.1"
  changelog: "Metadata updated to ensure compliance with current standards; maintains skill integrity and version tracking; affects metadata section"
  scope: [root]
  auto-invoke: "Auditing agentic structure or benchmarking AI integration quality"
allowed-tools: Read, Glob, Grep, WebSearch, WebFetch, Write, Bash
---

# Agentic Benchmark Guide

## When to Use

**Use this skill when:**

- Auditing a repository to assess its agentic integration maturity.
- Comparing a project's AI structure against public GitHub standards.
- Generating a stakeholder-facing report that demonstrates value of agentic work.
- Establishing a baseline before or after adding AI infrastructure to a project.
- Benchmarking multiple projects against each other using consistent criteria.

**Don't use this skill for:**

- Auditing non-agentic concerns (test coverage, code quality, security).
- Generating skills or changing the repo's AI structure (use `skill-creator`).
- One-off comparisons without using the standard template (defeats reproducibility).

---

## Three-Phase Execution Protocol

Always execute the benchmark in this exact order. Do not skip phases.

```
Phase 1: Target Repo Inventory
    → Discover all agentic artifacts in the repo
    → Classify and count each artifact type

Phase 2: GitHub Comparator Research
    → Run standard search queries (see assets/search-queries.md)
    → Identify 5–10 comparable public projects
    → Extract key metrics from each comparator

Phase 3: Scored Report Generation
    → Score the target repo on all 10 standard dimensions
    → Score each comparator on the same dimensions
    → Fill in assets/benchmark-template.md
    → Output the final report
```

---

## Phase 1: Target Repo Inventory

Scan the repository for all agentic artifacts. Use the checklist below to ensure complete coverage. Record counts and notes for use in Phase 3 scoring.

### Artifact Discovery Checklist

**AI Config Files** — files that instruct AI agents about the repo:
- [ ] `AGENTS.md` (universal)
- [ ] `CLAUDE.md` (Claude Code)
- [ ] `GEMINI.md` (Gemini CLI)
- [ ] `.github/copilot-instructions.md` (GitHub Copilot)
- [ ] `.cursor/rules/` or `.cursorrules` (Cursor)
- [ ] `.claude/` directory (Claude Code settings)
- [ ] Any other `*AGENTS*`, `*CLAUDE*`, `*AI*` config files

**Skills / Instructions** — reusable agentic instruction units:
- [ ] Skills folder (e.g., `skills/`, `.claude/skills/`, `agents/`)
- [ ] Count of individual skill files (`SKILL.md`, `.md` instructions)
- [ ] Frontmatter completeness: `name`, `description`, `version`, `trigger`
- [ ] Skill categories: generic vs. domain-specific vs. meta/self-managing
- [ ] Assets per skill (templates, schemas, examples)
- [ ] References per skill (local docs, external links)

**Workflow Orchestration** — multi-skill chains and routing:
- [ ] Documented chaining workflows
- [ ] Prerequisite relationships between skills
- [ ] Auto-invoke mappings (action → skill)
- [ ] Sub-agent delegation patterns

**Validation & Lifecycle Infrastructure**:
- [ ] Lint/validation scripts for skill content
- [ ] Metadata auto-update tooling
- [ ] Git hooks (pre-commit, pre-push)
- [ ] CI/CD integration for skill validation

**Design/Domain Integration**:
- [ ] MCP server connections (Figma, GitHub, Atlassian, etc.)
- [ ] Tool-specific integrations documented in skills
- [ ] Domain workflows (design → code, PR → review, etc.)

**Context Management**:
- [ ] Token optimization strategy
- [ ] Complexity classification system
- [ ] Model tier guidance
- [ ] Reasoning depth instructions

### Inventory Output Format

After scanning, produce a structured inventory table:

```markdown
| Artifact Type          | Present? | Count | Notes                          |
|------------------------|----------|-------|--------------------------------|
| AI config files        | Yes/No   | N     | Which tools covered            |
| Skills                 | Yes/No   | N     | Generic / domain / meta counts |
| Chaining workflows     | Yes/No   | N     | Named workflows                |
| Auto-invoke mappings   | Yes/No   | N     | Actions mapped                 |
| Validation scripts     | Yes/No   | N     | Types present                  |
| Git hooks              | Yes/No   | N     | Hook types                     |
| MCP integrations       | Yes/No   | N     | Services connected             |
| Context management     | Yes/No   | N     | Strategy type                  |
| Sub-agent delegation   | Yes/No   | N     | Patterns used                  |
```

---

## Phase 2: GitHub Comparator Research

Run the standard search queries from `assets/search-queries.md`. For each query, identify the most relevant public repositories. Aim for 6–10 comparators across:

- Official references (anthropics/skills, etc.)
- Large community collections (awesome-* repos)
- Domain-similar projects (same tech stack or workflow)
- Production codebases (not just libraries or catalogs)

### Comparator Extraction Checklist

For each comparator, extract:
- Repository name and URL
- Type (official / community collection / domain-specific / production codebase)
- Skill count (approximate)
- Self-management: does it have meta-skills or lifecycle tooling?
- Chaining: are multi-skill workflows documented?
- Domain-specificity: generic or specialized?
- Validation: any automated checks for skill content?
- Multi-model: does it support more than one AI tool?

---

## Phase 3: Scored Report Generation

Score the target repo and each comparator on the 10 standard dimensions. Use `assets/scoring-rubric.md` as the scoring guide. Then fill in `assets/benchmark-template.md`.

### 10 Standard Dimensions

| # | Dimension | What it measures |
|---|---|---|
| 1 | Skill Depth & Specificity | How detailed, actionable, and context-rich are individual skills? |
| 2 | Skill Breadth & Coverage | How many areas of the dev lifecycle are addressed? |
| 3 | Self-Governance / Meta-Infrastructure | Do skills manage themselves? Is there a lifecycle? |
| 4 | Workflow Orchestration / Chaining | Are multi-skill workflows documented with prerequisites? |
| 5 | Validation & Quality Assurance | Are there automated checks for skill integrity? |
| 6 | Multi-Model / Cross-Platform Support | Do AI instructions work across multiple tools? |
| 7 | Domain Specialization | Is the agentic structure deeply tied to the project's domain? |
| 8 | Context Management | Is there explicit guidance for token usage and reasoning depth? |
| 9 | Documentation & Discoverability | Can AI and humans find and understand the right skill quickly? |
| 10 | Production Readiness / CI-CD | Is the structure hardened with CI/CD hooks and automation? |

Apply scores using `assets/scoring-rubric.md`. Record each score with a one-line justification.

### Composite Score

Sum all 10 dimension scores (max 100). Add to the report alongside a positioning map and gap analysis.

---

## Critical Patterns

### Pattern 1: Always use the standard rubric

Never score from intuition alone. Every score must reference a specific criterion in `assets/scoring-rubric.md`. This ensures reproducibility across benchmark runs and comparability across different projects.

### Pattern 2: Calibrate comparators to the project type

Community skill catalogs (awesome-* repos) will always score high on breadth and low on depth. Production codebases will score the opposite. Weight the "best public reference" per dimension against the type of repo being compared — don't compare a production codebase only to catalogs.

### Pattern 3: Document justification for every score

In the final report, each score cell must have a one-line rationale. Without justification, scores cannot be challenged or updated in future runs. This is the difference between a benchmark and an opinion.

### Pattern 4: Save the report as a dated artifact

Output the benchmark report to `docs/benchmarks/agentic-benchmark-YYYY-MM-DD.md`. This creates a timestamped history for tracking improvement over time. Never overwrite previous runs.

### Pattern 5: Identify gaps, not just scores

For every dimension where the target repo scores below the best public reference, document a specific, actionable recommendation. Benchmarks without improvement paths are informational only — this skill produces actionable outputs.

---

## Decision Tree

```
Starting a benchmark run?
    → Start Phase 1 (inventory) first. Never skip.
    → Use Glob + Grep + Read to discover artifacts systematically.
    → Fill the inventory table completely before moving to Phase 2.

Selecting comparators?
    → Always include at least one official reference (e.g., anthropics/skills).
    → Always include at least one large community collection.
    → Always include at least one domain-similar project if one exists.
    → If none found for the domain, document that as a finding.

Unsure how to score a dimension?
    → Open assets/scoring-rubric.md
    → Find the dimension.
    → Match the observed evidence to the nearest anchor (1, 5, or 10).
    → Interpolate between anchors with a one-line justification.

No public comparators found for the domain?
    → Score domain-specific dimensions against the closest available references.
    → Note the absence as a finding: it means the target repo is a pioneer in that domain.
```

---

## Output

The benchmark produces three artifacts:

1. **Inventory table** — structured catalog of all agentic artifacts in the repo.
2. **Comparator table** — structured summary of all benchmarked public projects.
3. **Scored benchmark report** — filled `benchmark-template.md` with dimension scores, gap analysis, recommendations, and composite score.

Save the final report to:
```
docs/benchmarks/agentic-benchmark-{repo-name}-YYYY-MM-DD.md
```

---

## Commands

```bash
# Discover all agentic config files
find . -name "AGENTS.md" -o -name "CLAUDE.md" -o -name "GEMINI.md" -o -name ".cursorrules" | grep -v node_modules

# Count total skills
find ./skills -name "SKILL.md" | wc -l

# List skill names from frontmatter
grep -r "^name:" skills/*/SKILL.md

# Check for auto-invoke coverage
grep -A2 "auto-invoke" skills/*/SKILL.md | grep -v "^--$"

# Find chaining documentation
grep -n "Chaining\|chain\|prerequisite\|→" AGENTS.md

# Check for validation scripts
find . -name "*.sh" -o -name "*lint*" -o -name "*validate*" | grep -v node_modules | grep -v .git

# Check for git hooks
ls .git/hooks/
```

---

## References

- **Scoring rubric**: See [assets/scoring-rubric.md](assets/scoring-rubric.md) for anchor definitions per dimension.
- **Benchmark template**: See [assets/benchmark-template.md](assets/benchmark-template.md) for the standardized output format.
- **Search queries**: See [assets/search-queries.md](assets/search-queries.md) for standardized GitHub research queries.
- **Example run**: See [references/example-scannlab-2026-03-21.md](references/example-scannlab-2026-03-21.md) for a complete benchmark run.
