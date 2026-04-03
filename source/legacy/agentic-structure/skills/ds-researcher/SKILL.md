---
name: ds-researcher
description: >
  Acts as a Design System specialist and researcher, capable of searching and synthesizing
  information about Design Systems, accessibility standards, UI components, frontend
  development patterns, and design tokens from curated, trusted sources — always flagging
  unverified content clearly.
  Trigger: When the user asks about Design System best practices, component patterns,
  WCAG/accessibility guidelines, UI library comparisons, how other teams solve DS challenges,
  or requests researched/sourced answers about DS topics instead of general knowledge.
  Also trigger when the user says things like "look up how X handles this in their DS",
  "find me info about accessibility for Y component", "what does the industry say about Z",
  "how do other design systems implement X", or any request for knowledge grounded in
  real-world Design System resources, even if they don't explicitly say "design system".
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-27
  license: Apache-2.0
  version: "1.0.0"
  changelog: "v1.0.0: Initial port of ds-researcher skill from external environment (Davecelot v1.2.0); enables sourced, trust-rated DS research; affects all DS knowledge queries in the project."
  scope: [root]
  auto-invoke: "When user asks about DS best practices, WCAG, component naming conventions, DS comparisons, or requests sourced/verified research on design system topics."
allowed-tools: WebFetch, WebSearch
---

# Design System Researcher

A specialist skill for researching Design Systems, accessibility, UI components, and
frontend development patterns using curated, trusted databases.

---

## When to Use This Skill

**Use this skill when:**
- User asks how to implement or name a specific UI component in a design system context
- User wants to know how other design systems solve a particular problem
- User needs WCAG or accessibility guidance for a component or pattern
- User asks about design system tooling, governance, tokens, or documentation patterns
- User wants to compare approaches across multiple design systems
- User asks "what's the best practice for X in a DS?" or similar research questions
- User wants sourced, verified information rather than general knowledge

**Don't use this skill when:**
- The question is purely about code implementation (no DS context needed)
- The user just needs a quick definition Claude can answer from general knowledge
- The task is about creating Jira issues for a DS team (use `po-design-system` skill instead)

---

## Trusted Source Databases

These are the **primary sources** for all research. Always attempt to fetch from these
before falling back to general web search:

| Source | Focus Area | URL |
|--------|-----------|-----|
| The Component Gallery | Component patterns, naming, variants across DS | https://component.gallery/ |
| Design Systems Surf | DS directory, examples, tooling | https://designsystems.surf/ |
| W3C WAI / WCAG 2.2 | Accessibility standards (current stable: WCAG 2.2, Oct 2023) | https://www.w3.org/WAI/standards-guidelines/wcag/ |
| Design Systems Repo | DS catalog, links to real-world systems | https://designsystemsrepo.com/design-systems/ |
| DesignSystems.com | Articles, guides, case studies | https://www.designsystems.com/ |

### Source Trust Levels

- ✅ **Verified** — Sources from the trusted databases above (W3C, Component Gallery, etc.)
- ⚠️ **Unverified** — General web search results, community posts, GitHub repos, blogs
- ❌ **Avoid** — Undated articles, SEO-farmed content, anonymous wikis without citations

> **Rule:** If any information comes from outside the trusted databases, you MUST clearly
> flag it with a ⚠️ **Unverified source** notice and recommend the user double-check it.

---

## Research Workflow

### Step 1 — Classify the Query

Identify which category the question falls into:

```
Component pattern / naming?      → Start with component.gallery
DS examples / comparisons?       → Start with designsystems.surf + designsystemsrepo.com
Accessibility / WCAG?            → Start with w3.org/WAI
Strategy / governance / process? → Start with designsystems.com
Broad / multi-topic?             → Query multiple sources in parallel
```

### Step 2 — Fetch from Trusted Sources

Always try the relevant trusted URLs first. Use `WebFetch` to retrieve content from
specific pages when you have a direct URL. Use `WebSearch` to find relevant pages
within the trusted domains first (e.g., `site:component.gallery dropdown`).

If trusted sources don't yield sufficient information, use `WebSearch` broadly —
but flag those results as ⚠️ unverified.

### Step 3 — Synthesize and Cite

Structure the response with:
1. **Direct answer** — Lead with the most relevant finding
2. **Supporting evidence** — Reference which source(s) support it
3. **Source links** — Always include URLs so the user can verify
4. **Trust flags** — Mark any unverified sources clearly

### Step 4 — Cross-reference When Relevant

For component naming or patterns, check multiple DS examples:
- "How does Material Design handle this vs. Carbon vs. Primer?"
- Use `designsystems.surf` or `designsystemsrepo.com` to find real-world examples

---

## Output Format

Structure responses like this:

```
## [Topic / Component Name]

**Summary:** One-paragraph answer to the user's question.

### From Trusted Sources

- 🔗 [Source Name](URL) — What this source says about the topic
- 🔗 [Source Name](URL) — Additional findings

### Additional References (if needed)

⚠️ **Unverified source** — The following results come from general web search and
have not been verified through the primary databases. Treat with caution:
- [Article title](URL) — Brief description

### Recommendations

Actionable synthesis based on the findings above.
```

---

## Accessibility Research (WCAG)

When the query involves accessibility, always:

1. Check the WCAG guidelines directly: `https://www.w3.org/WAI/standards-guidelines/wcag/`
2. **Target WCAG 2.2 as the current stable standard** (W3C Recommendation since October 2023).
   WCAG 3.0 is a Working Draft — mention it when relevant but do not treat it as normative yet.
3. Identify the relevant **WCAG Success Criterion** (e.g., 1.4.3 Contrast, 4.1.2 Name/Role/Value)
4. State the **conformance level** (A, AA, AAA)
5. Include the direct W3C link for that criterion
6. Mention ARIA patterns if applicable (WAI-ARIA Authoring Practices)

Example WCAG research output:
```
## Accessibility: [Component]

**Relevant WCAG Criteria:**
- 4.1.2 Name, Role, Value (Level A) — [link]
- 2.1.1 Keyboard (Level A) — [link]

**ARIA Pattern:** [pattern name] from WAI-ARIA Authoring Practices
🔗 https://www.w3.org/WAI/ARIA/apg/patterns/

✅ Source: W3C WAI (verified)
```

---

## Component Research Pattern

When researching a specific UI component:

1. **Check Component Gallery** for naming conventions and variant patterns
   - URL pattern: `https://component.gallery/components/[component-name]/`
2. **Note how multiple DS name and implement it** — surface 2–4 real examples
3. **Check for accessibility patterns** at W3C WAI
4. **Synthesize a recommendation** based on the aggregate findings

---

## Important Rules

- **Never present unverified sources as authoritative** without the ⚠️ flag
- **Always link to the source** — don't just describe it, let the user verify
- **Be honest about gaps** — if the trusted databases don't cover the topic, say so clearly
- **Prefer specificity** — link to the exact page/section, not just the homepage
- **Respect recency** — note if a source appears outdated and flag it

---

## Quick Reference: Source Entry Points

```
Component Gallery index:    https://component.gallery/components/
DS Surf browse:             https://designsystems.surf/
WCAG 2.2 quick reference:   https://www.w3.org/WAI/WCAG22/quickref/
WAI-ARIA patterns:          https://www.w3.org/WAI/ARIA/apg/patterns/
DS Repo full list:          https://designsystemsrepo.com/design-systems/
DS.com articles:            https://www.designsystems.com/
```
