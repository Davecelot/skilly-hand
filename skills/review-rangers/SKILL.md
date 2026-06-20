---
name: "review-rangers"
description: "Review code, decisions, and artifacts through an independent committee and safety guard, then optionally run bounded, approval-gated remediation. Trigger: reviewing risky artifacts or remediating structured review findings."
skillMetadata:
  author: "skilly-hand"
  last-edit: "2026-06-20"
  license: "Apache-2.0"
  version: "1.2.0"
  changelog: "Added approval-gated Mender remediation with bounded independent re-review; prevents unauthorized writes and unbounded fix loops; affects review orchestration, installation dependencies, and prompt assets"
  auto-invoke: "Reviewing risky code, decisions, or artifacts, or remediating structured review findings"
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
10. If the verdict is `HIGH`, emit the final report and stop. If it is `VETO` or any critical-stop condition applies, return control to a human without modifying the target.
11. For `MEDIUM` or `LOW`, present the open findings and request explicit approval before the first mutation. Skip this checkpoint only when the caller explicitly requested unattended or autonomous remediation in the current task.
12. After approval, invoke The Mender using `assets/mender-template.md`. Pass only the target context and open findings; do not pass intermediate reviewer discussion.
13. Run repository-native verification, then send the changed target to a fresh independent committee and safety guard. Reviewers from every round remain read-only.
14. Repeat only while progress is material and no termination rule applies. Allow at most three remediation rounds and stop when the same finding survives two consecutive rounds without material progress.
15. Emit the final report with confidence tier, finding-to-fix evidence, unresolved items, stop reason when applicable, and recommended action.
16. Evaluate durable `.ai/DECISIONS.md` updates after the final `HIGH` report or terminal escalation; if an insight qualifies, update the registry and its changelog in the same edit.

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
- Committee members and the safety guard are read-only in every round. They MUST NOT modify the target, assign work, or reuse another reviewer's conclusions.

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

## Remediation Protocol

### Role Separation

The Mender is the only role allowed to modify the target during a Review Rangers remediation cycle.

- Committee members and the safety guard remain independent, read-only judges.
- The Mender receives the synthesized open findings and target context, not reviewer identities or hidden reasoning.
- The Mender MUST NOT assign, raise, lower, or otherwise edit confidence tiers.
- The orchestrator owns approval, round counting, critical-stop evaluation, re-review, and the final verdict.
- A Mender MUST NOT invoke Review Rangers recursively. Re-review returns to the orchestrator.

### Approval Boundary

Interactive review MUST pause before the first file mutation and obtain explicit approval.

- A request to review, assess, audit, or invoke this skill is not write approval.
- Skill invocation alone is not write approval.
- The checkpoint may be skipped only when the caller explicitly asks for unattended or autonomous remediation in the current task.
- Approval covers only the presented open findings and target. New scope or a critical-stop condition returns control to the caller.

### Critical Stops

Stop before another mutation or remediation round when any of these applies:

- The verdict is `VETO`.
- A security, privacy, accessibility, or data-integrity blocker requires human judgment.
- A fix would cause a breaking public API change.
- A fix would alter a broadly shared foundation, architecture, release policy, CI/CD policy, or security policy without explicit authority.
- Required repository-native verification is unavailable or failing for reasons the remediation cannot safely resolve.
- Product intent, ownership, migration policy, or another authoritative decision is required.
- Three remediation rounds have completed.
- The same finding survives two consecutive rounds without material progress.

For every stop, report the unresolved finding, available evidence, stop reason, and required human decision. Do not broaden scope to conceal a failed check or force a higher confidence tier.

### Repository-Native Verification

The Mender MUST discover and run the narrowest relevant verification supported by the target repository.

1. Read repository instructions and declared scripts or commands.
2. Choose relevant lint, test, type-check, build, artifact, or deterministic document checks.
3. When testable behavior changes, follow the installed `test-driven-development` guidance and record RED, GREEN, REFACTOR, and regression evidence.
4. For non-code artifacts, use the narrowest deterministic structural or content check.
5. Report exact commands, outcomes, failures, and checks that could not run.

Never assume npm, a particular test runner, or a fixed toolchain. A failed required check blocks `HIGH` unless a human explicitly accepts the residual risk.

### Re-review and Termination

- Every remediation round receives a monotonically increasing round number from 1 through 3.
- After verification, use a fresh committee and safety guard with the same independence rules as the initial review.
- Compare findings by underlying issue, not wording alone.
- Material progress means a finding is resolved, reduced in severity with evidence, or narrowed by a verified constraint.
- `HIGH` ends the loop successfully.
- `MEDIUM` or `LOW` may enter another approved round only when progress is material and no stop applies.
- Any stop ends the loop with a terminal escalation report.

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

Evaluate registry writes only after the final `HIGH` report or terminal escalation. Intermediate remediation rounds MUST NOT create duplicate or provisional decision entries.

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

Is the verdict MEDIUM or LOW without a critical stop?
  YES -> obtain explicit mutation approval unless unattended remediation was explicitly requested

Is remediation approved and within the termination bounds?
  YES -> invoke The Mender, verify with repository-native checks, then run a fresh independent review
  NO  -> emit a terminal escalation report

Did the review reach HIGH, three rounds, or two stagnant rounds?
  YES -> stop and emit the final report
  NO  -> continue only when material progress is evidenced
```

---

## Commands

```bash
# Reference committee member template when constructing agent prompts
cat .skilly-hand/catalog/review-rangers/assets/committee-member-template.md

# Reference safety guard template when constructing agent prompts
cat .skilly-hand/catalog/review-rangers/assets/safety-guard-template.md

# Reference the only write-capable remediation template after approval
cat .skilly-hand/catalog/review-rangers/assets/mender-template.md
```

---

## Resources

- Committee member prompt template: [assets/committee-member-template.md](assets/committee-member-template.md)
- Safety guard prompt template: [assets/safety-guard-template.md](assets/safety-guard-template.md)
- Mender prompt template: [assets/mender-template.md](assets/mender-template.md)
- Test-driven remediation guidance: [../test-driven-development/SKILL.md](../test-driven-development/SKILL.md)
