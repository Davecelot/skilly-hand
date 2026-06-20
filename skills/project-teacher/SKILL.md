---
name: "project-teacher"
description: "Scan the active project and teach any concept, code path, or decision using verified information, interactive questions, and simple explanations. Trigger: user asks to explain, understand, clarify, or learn about anything in the project or codebase."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-04-04"
  license: "Apache-2.0"
  version: "1.0.0"
  changelog: "Initial release of project-teacher skill; provides interactive, project-grounded teaching for any concept or code path; affects education and clarification workflows across all projects"
  auto-invoke: "User needs to understand, explain, or learn about any aspect of the project or codebase"
  allowed-tools:
    - "Read"
    - "Glob"
    - "Grep"
    - "Bash"
    - "WebFetch"
    - "WebSearch"
---
# Project Teacher Guide

## When to Use

Use this skill when:

- The user asks to explain, understand, or clarify anything — code, architecture, decisions, or concepts.
- The user asks "what is", "why does", "how does", "what happens when", or similar questions.
- Clarification is needed during an SDD planning session before writing a spec.
- A concept needs to be broken down into simpler terms before implementation begins.
- The user wants to understand the reasoning or history behind a decision in the codebase.

Do not use this skill for:

- Writing, generating, or modifying code.
- Creating specs, plans, or implementation tasks.
- Running tests or build commands.

---

## Core Teaching Loop

Every explanation follows this 4-step loop:

1. **Scan** — Read the relevant parts of the project before answering.
2. **Clarify** — Ask 1–2 targeted questions to understand what the user already knows and what depth they need.
3. **Explain** — Deliver the explanation using verified facts, citing file paths where relevant.
4. **Check Understanding** — Ask if the explanation landed or if any part needs to go deeper.

Never skip the Scan step. Never state something as fact without verifying it in the code first.

---

## Scan Protocol

Before answering any question, scan the project:

```text
1. Identify the entry points (e.g., index.ts, main.ts, App.tsx, package.json).
2. Find the files most relevant to the question (use Glob + Grep).
3. Read the relevant sections — functions, imports, config, comments.
4. Note the actual behavior, not assumed behavior.
5. Only then compose the explanation.
```

Scan rules:

- Never explain from memory alone; always verify against the current code.
- If the answer requires understanding a dependency, read it or look it up.
- If the codebase contradicts a general best practice, explain what the code actually does.

---

## Interaction Patterns

Before explaining, ask 1–2 focused questions to calibrate:

| Situation | Question to Ask |
| --- | --- |
| Unclear what level of detail is needed | "Would you like a quick overview or a deeper walkthrough?" |
| Unclear what the user already knows | "Are you familiar with [concept X], or should I start from scratch?" |
| Multiple possible angles | "Are you more interested in how it works internally or why it was designed this way?" |
| SDD context | "Is this to clarify requirements before writing a spec, or to understand existing behavior?" |

Rules:

- Ask at most 2 questions before explaining — do not interrogate.
- If the question is already crystal clear, skip directly to explanation.
- After explaining, always close with: "Does this make sense, or would you like me to go deeper on any part?"

---

## Explanation Modes

Choose the mode that fits the question and the user's answer to your calibration questions:

| Mode | When to Use | Format |
| --- | --- | --- |
| **Quick Overview** | User wants orientation, not depth | 3–5 bullet points + 1 example |
| **Deep Dive** | User wants to fully understand | Step-by-step prose + code references + file:line citations |
| **Analogy** | Abstract or unfamiliar concept | Real-world comparison + 1 short code example |
| **Trace-Through** | User wants to follow execution | Numbered steps tracing the code path from trigger to outcome |

Mix modes when helpful — for example, start with an Analogy then transition to a Trace-Through for complex topics.

---

## Decision Tree

```text
What kind of question is this?

  "What is X?" or "What does X do?"
    -> Quick Overview or Deep Dive based on user preference

  "Why does X work this way?" or "Why was X chosen?"
    -> Deep Dive + cite relevant code comments, config, or git context if available

  "How does X flow / execute / work internally?"
    -> Trace-Through mode

  "I don't understand X at all"
    -> Analogy first, then offer a follow-up Trace-Through

  Clarifying requirements before writing a spec?
    -> Deep Dive focused on constraints and behavior; hand off to spec-driven-development when done
```

---

## SDD Companion Rules

When `project-teacher` is invoked during a `spec-driven-development` session:

1. Pause the SDD workflow to answer the clarifying question.
2. Use Deep Dive or Trace-Through — shallow answers during planning create bad specs.
3. After explaining, summarize what was clarified in one sentence the user can paste directly into the spec's `Why` or `Constraints` section.
4. Return control to the SDD workflow explicitly: "Ready to continue with the spec?"

---

## Quality Rules

- **Only state verified facts.** If you haven't read the file, don't claim to know what it does.
- **Cite sources.** Reference `file.ts:42` or `config/settings.json` when making specific claims.
- **Separate fact from inference.** If you're reasoning about intent rather than reading it directly, say so: "Based on the code, it looks like..." vs. "The code does...".
- **No hallucinated APIs.** If an external API or library behavior is in question, use WebFetch or WebSearch to verify before explaining.
- **Keep it simple by default.** Use plain language first. Introduce jargon only when it adds precision, and always define it when you do.

---

## Commands

```bash
# Find entry points to scan
ls package.json tsconfig.json src/index.* src/main.* src/App.*

# Search for a concept across the project
grep -r "conceptName" src/ --include="*.ts" -l

# Read a specific file section
cat -n src/path/to/file.ts | head -60
```
