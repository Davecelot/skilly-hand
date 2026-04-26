---
name: "review-rangers"
description: "Review code, decisions, and artifacts through a multi-perspective committee and a domain expert safety guard, then synthesize a structured verdict."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-04-26"
  license: "Apache-2.0"
  version: "1.1.0"
  changelog: "Added DECISIONS.md registry ownership guidance; preserves durable review insights and anti-slop decisions across sessions; affects review-rangers workflow, install scaffolding, and project memory usage"
  auto-invoke: "Reviewing code, decisions, or artifacts where adversarial multi-perspective evaluation adds value"
  allowed-tools:
    - "Read"
    - "Edit"
    - "Write"
    - "Grep"
    - "Glob"
    - "Bash"
    - "Task"
    - "SubAgent"
---
# Review Rangers Guide

## When to Use

Use this skill when:

- A code change, architecture decision, or artifact carries meaningful risk.
- A single reviewer perspective is likely to miss domain-specific edge cases.
- You need a structured verdict, not an opinion.
- Pull requests, API designs, security decisions, or data models require adversarial scrutiny.

Do not use this skill for:

- Trivial single-file edits with no systemic impact.
- Tasks already covered by a domain-specific automated linter or test suite.
- Reviews where committee overhead exceeds the risk of getting it wrong.

---

## Core Workflow

1. Identify the target (code, decision, artifact) and its domain.
2. Read `.ai/DECISIONS.md` if it exists. Treat it as project memory for avoiding repeated mistakes and reusing documented decisions.
3. Determine committee size: 3 members for routine reviews, 5 for high-risk or cross-domain targets.
4. Spawn N committee members using `assets/committee-member-template.md`. Assign each a distinct evaluation lens. Run them independently — no member sees another's output.
5. Determine the expert domain for the safety guard.
6. Spawn 1 safety guard using `assets/safety-guard-template.md`. It evaluates the target from an authoritative expert position.
7. Run the committee and safety guard in parallel.
8. Collect all outputs.
9. Synthesize a structured verdict following the Synthesis Rules.
10. Emit the final verdict with confidence tier, top findings, and recommended action.
11. Decide whether any insight qualifies for `.ai/DECISIONS.md`; if yes, update the registry and its changelog in the same edit.

---

## Committee Protocol

### Size

| Target Risk | Committee Size |
| ----------- | -------------- |
| Routine (single concern) | 3 members |
| High-risk or cross-domain | 5 members |

### Lens Assignment

Assign lenses based on what is being reviewed. Examples:

| Domain | Possible Lenses |
| ------ | --------------- |
| Code change | Security, Performance, Maintainability, Testability, UX impact |
| Architecture decision | Scalability, Operational risk, Developer experience, Cost, Data integrity |
| API design | Consumer ergonomics, Contract stability, Security, Versioning, Documentation |
| Data model | Normalization, Query performance, Migration safety, Privacy, Extensibility |

Never assign the same lens to two committee members. Each member evaluates independently — no member sees another's prompt or output during evaluation.

### Independence Rules

- Spawn committee members in parallel.
- Pass only the target artifact and the member's assigned lens as context.
- Do not share intermediate findings between members before synthesis.

---

## Safety Guard Protocol

### Domain Resolution

Determine the expert domain from the target:

```text
Target is code?               -> Domain is the language + ecosystem (e.g., "TypeScript + Node.js security")
Target is architecture?       -> Domain is the system archetype (e.g., "distributed systems reliability")
Target is a decision?         -> Domain is the function it affects (e.g., "data privacy compliance")
Target is an API?             -> Domain is the protocol + consumer context (e.g., "REST API design for web clients")
Target is unclear?            -> Ask before spawning
```

### Specialization

The safety guard:

- Operates as an authoritative expert, not a peer reviewer.
- Evaluates the target for correctness, safety, and conformance to domain standards.
- Raises blockers, not suggestions. If the safety guard finds a structural flaw, it is a hard finding.
- Runs in parallel with the committee, not after it.

---

## Synthesis Rules

### Confidence Tiers

| Tier | Condition | Recommended Action |
| ---- | --------- | ------------------ |
| HIGH | Safety guard passes + committee majority agrees | Approve with noted caveats |
| MEDIUM | Safety guard passes + committee is split | Approve after addressing split findings |
| LOW | Safety guard raises a blocker OR committee majority flags risk | Block — require remediation before approval |
| VETO | Safety guard raises a structural flaw | Hard block — do not proceed |

### Contradiction Handling

- Safety guard findings override committee findings on correctness and safety.
- When committee members contradict each other, count lenses: majority rules unless a minority finding is a security or data-integrity concern.
- A single security or data-integrity finding from any voice is sufficient for LOW or VETO tier.

### Verdict Structure

Emit exactly this structure:

```text
CONFIDENCE: {HIGH | MEDIUM | LOW | VETO}

SUMMARY:
{1–2 sentences on the overall state of the target}

TOP FINDINGS:
1. [{Voice}] {Finding} — {Severity: Info | Warning | Blocker}
2. [{Voice}] {Finding} — {Severity: Info | Warning | Blocker}
...

RECOMMENDED ACTION:
{Approve | Approve with caveats | Block — remediate before resubmit | Hard block}
```

---

## Decisions Registry Protocol

`review-rangers` owns `.ai/DECISIONS.md` maintenance when the registry exists. Use it as both:

- A documentary source before solving or reviewing relevant problems.
- A durable memory target after review when a finding has future value.

### Read Rules

- Read `.ai/DECISIONS.md` near the start of relevant review or problem-solving work.
- Apply documented decisions and "avoid repeating" notes as project constraints.
- If the file does not exist, continue the review without creating it unless the current task is installation or explicit registry setup.

### Write Criteria

Write to `.ai/DECISIONS.md` only for:

- Breaking changes.
- Mid-interest or high-interest solutions.
- Architectural decisions.
- Repeated issue patterns.
- Project-specific conventions likely to matter in future sessions.

Do not write entries for minimal cleanup, obvious one-off bugs, insignificant changes, local-only implementation details, or full review transcripts.

### Write Format

Insert new entries above the final `## Changelog` section so the changelog remains the last section.

```md
## YYYY-MM-DD - Short Decision Title

- Interest level: Mid | High | Breaking
- Context:
- Decision / Insight:
- Rationale:
- Avoid repeating:
- Source:
```

Every change to `.ai/DECISIONS.md` must update `## Changelog` in the same edit.

```md
- YYYY-MM-DD: Created/updated entry "<title>" because <why>.
```

If the changelog section is missing, add it as the final section before making any other registry change.

---

## Decision Tree

```text
Is there a safety guard blocker?
  YES -> VETO — hard block regardless of committee output

Does the safety guard pass?
  YES -> evaluate committee output

Do 3+ of 5 committee members (or 2+ of 3) flag a risk?
  YES -> LOW — block and require remediation
  NO  -> continue

Does any committee member flag a security or data-integrity risk?
  YES -> LOW at minimum — escalate to safety guard if not already covered

Does committee majority agree the target is sound?
  YES and safety guard passes -> HIGH or MEDIUM depending on split
  NO                          -> LOW
```

---

## Commands

```bash
# Reference committee member template when constructing agent prompts
cat .skilly-hand/catalog/review-rangers/assets/committee-member-template.md

# Reference safety guard template when constructing agent prompts
cat .skilly-hand/catalog/review-rangers/assets/safety-guard-template.md
```

---

## Resources

- Committee member prompt template: [assets/committee-member-template.md](assets/committee-member-template.md)
- Safety guard prompt template: [assets/safety-guard-template.md](assets/safety-guard-template.md)
