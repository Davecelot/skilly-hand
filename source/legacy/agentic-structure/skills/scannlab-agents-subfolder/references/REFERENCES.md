# References for scannlab-agents-subfolder

This skill helps organize AI instructions at the folder level using the orchestrator-lead-director model. Key references:

## Agent Rulesets (Live Examples)

- **Root AGENTS.md**: [AGENTS.md](../../../AGENTS.md) — Repository-wide orchestrator, full skill registry, chaining workflows
- **Library Lead example** (scanntech-ui): [projects/scanntech-ui/AGENTS.md](../../../projects/scanntech-ui/AGENTS.md) — Domain Map + Task→Skill Routing Table, delegates to child directors
- **Component Director example** (components): [projects/scanntech-ui/src/components/AGENTS.md](../../../projects/scanntech-ui/src/components/AGENTS.md) — Task→Skill Routing Table, ordered skill chains, quality gates

## Related Skills

- **skill-creator**: [skills/skill-creator/SKILL.md](../skill-creator/SKILL.md) — Frontmatter standards and skill authoring conventions
- **agents-sync**: [skills/agents-sync/SKILL.md](../agents-sync/SKILL.md) — Syncs AGENTS.md content to CLAUDE.md, GEMINI.md, copilot-instructions.md
- **skill-sync**: [skills/skill-sync/SKILL.md](../skill-sync/SKILL.md) — Syncs skill metadata into AGENTS.md tables

## Asset Files (This Skill)

- **Template**: [assets/AGENTS-template.md](../assets/AGENTS-template.md) — Blank template for any subfolder AGENTS.md
- **Component Director example**: [assets/AGENTS-component-example.md](../assets/AGENTS-component-example.md) — Example for `src/components/` (leaf, no Domain Map)
- **Service Director example**: [assets/AGENTS-service-example.md](../assets/AGENTS-service-example.md) — Example for `src/services/` (leaf, no Orchestrator Role)
- **Library Lead example**: [assets/AGENTS-project-example.md](../assets/AGENTS-project-example.md) — Example for `projects/scanntech-ui/` (Domain Map + routing table)
