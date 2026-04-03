# Agentic Benchmark — Standard GitHub Search Queries

Use these queries in every benchmark run to ensure consistent, reproducible comparator discovery.
Run all queries in Phase 2. Document which repos you selected and why.

---

## Query Set 1: Official & Reference Repositories

These find authoritative sources that define the standard being measured against.

```
anthropics/skills
```
```
GitHub AGENTS.md specification official 2025 2026
```
```
site:github.com AGENTS.md "skill" "SKILL.md" official reference
```

**Expected finds:** anthropics/skills, official Claude Code docs, AGENTS.md spec repos.

---

## Query Set 2: Large Community Skill Collections

These establish the ceiling for Dimension 2 (Breadth) and provide the widest comparator baseline.

```
GitHub "awesome-agent-skills" OR "awesome-claude-skills" SKILL.md collection 2025 2026
```
```
GitHub Claude Code skills community collection 500+ 1000+ SKILL.md
```
```
GitHub repository "agent skills" "AGENTS.md" cross-platform Cursor Copilot Gemini
```

**Expected finds:** VoltAgent/awesome-agent-skills, skillmatic-ai/awesome-agent-skills,
alirezarezvani/claude-skills, hesreallyhim/awesome-claude-code, travisvn/awesome-claude-skills.

---

## Query Set 3: Multi-Agent Orchestration

These find repos with workflow chaining, prerequisite management, and subagent delegation.

```
GitHub Claude Code multi-agent orchestration subagent workflow chaining 2025
```
```
GitHub repository CLAUDE.md agents subfolder orchestration workflow production
```
```
GitHub "wshobson" OR "ruvnet" agents orchestration Claude multi-agent
```

**Expected finds:** wshobson/agents, ruvnet/ruflo, FlorianBruniaux/claude-code-ultimate-guide.

---

## Query Set 4: Skill Lifecycle & Meta-Infrastructure

These find repos that manage skills as artifacts with their own lifecycle (create, validate, sync).

```
GitHub "skill-creator" OR "skill-factory" "SKILL.md" validation lifecycle 2025 2026
```
```
GitHub agent skill validation lint pre-commit metadata versioning
```
```
GitHub "skill-creator" "skill-test" "skill-sync" agent lifecycle management
```

**Expected finds:** FrancyJGLisboa/agent-skill-creator, alirezarezvani/claude-code-skill-factory.

---

## Query Set 5: Domain-Similar Projects (adapt per target repo)

Adapt these queries to the target repo's tech stack and domain. Replace `{DOMAIN}` and
`{TECH_STACK}` with the relevant terms before running.

```
GitHub AGENTS.md CLAUDE.md "{DOMAIN}" "{TECH_STACK}" AI agentic 2025 2026
```
```
GitHub design system AGENTS.md AI skills workflow "{TECH_STACK}" production
```
```
GitHub "{DOMAIN}" agentic structure CLAUDE.md AI integration production codebase
```

**Examples of {DOMAIN}:** `design system`, `fintech`, `e-commerce`, `healthcare`, `devops`
**Examples of {TECH_STACK}:** `Angular`, `React`, `Next.js`, `Django`, `Rails`, `Spring`

**Expected finds:** Any production codebases in the same domain with AI integration.
If none are found, document that as a finding (target repo may be a pioneer).

---

## Query Set 6: Cross-Platform AI Config

These find repos that support multiple AI tools simultaneously.

```
GitHub repository "AGENTS.md" "CLAUDE.md" "GEMINI.md" "copilot-instructions" multi-model 2025
```
```
GitHub "cross-platform" AI agent skills Claude Cursor Copilot Gemini 14 platforms
```

**Expected finds:** FrancyJGLisboa/agent-skill-creator, hoodini/ai-agents-skills.

---

## Query Set 7: Context & Token Management

These find repos with explicit AI reasoning depth or token optimization guidance.

```
GitHub "token optimization" "reasoning depth" "model tier" AI agent CLAUDE.md 2025
```
```
GitHub AGENTS.md "complexity" "thinking" model selection strategy production
```

**Expected finds:** Likely few — this is an advanced practice. Note the absence.

---

## Comparator Selection Criteria

After running all queries, select 6–10 comparators following this criteria:

| Slot | Type | Rule |
|---|---|---|
| 1 | Official reference | Must include: always use anthropics/skills or equivalent official source |
| 2–3 | Large community catalog | At least 2 large collections (500+ skills) for breadth baseline |
| 4–5 | Orchestration / lifecycle | At least 1 multi-agent or skill-lifecycle repo |
| 6–7 | Domain-similar | At least 1 repo from the same domain/stack (if exists) |
| 8–10 | Wildcard | Best additional finds from any category |

**Minimum requirement:** At least 5 comparators. If fewer are found, document why and
note which query sets returned no results.

---

## Documenting Comparators

For each selected comparator, record:

```markdown
| {repo/name} | {official/community-catalog/orchestration/production} | {~N skills} |
| Self-management: {None/Partial/Full — explain} |
| Chaining: {None/Partial/Full — explain} |
| Validation: {None/Partial/Full — explain} |
| Multi-model: {Yes/No — which tools} |
| URL: {github.com/...} |
```
