import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../..");
export const catalogDir = path.join(rootDir, "catalog");
export const skillsDir = path.join(catalogDir, "skills");
export const templatesDir = path.join(catalogDir, "templates");

const REQUIRED_FIELDS = [
  "id",
  "title",
  "description",
  "portable",
  "tags",
  "detectors",
  "installsFor",
  "agentSupport",
  "files",
  "dependencies"
];

export function getCatalogRoot() {
  return catalogDir;
}

export async function listSkillIds() {
  const entries = await readdir(skillsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export async function loadSkillManifest(skillId) {
  const manifestPath = path.join(skillsDir, skillId, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  validateSkillManifest(manifest);
  return manifest;
}

export async function loadAllSkills() {
  const ids = await listSkillIds();
  const manifests = [];

  for (const skillId of ids) {
    manifests.push(await loadSkillManifest(skillId));
  }

  return manifests;
}

export function validateSkillManifest(manifest) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in manifest)) {
      throw new Error(`Missing required field "${field}" in skill manifest`);
    }
  }

  if (!Array.isArray(manifest.tags) || manifest.tags.length === 0) {
    throw new Error(`Skill "${manifest.id}" must declare at least one tag`);
  }

  if (!Array.isArray(manifest.agentSupport) || manifest.agentSupport.length === 0) {
    throw new Error(`Skill "${manifest.id}" must declare agentSupport`);
  }

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error(`Skill "${manifest.id}" must declare files`);
  }

  return true;
}

export async function copySkillTo(targetCatalogDir, skillId) {
  const source = path.join(skillsDir, skillId);
  const destination = path.join(targetCatalogDir, skillId);

  await mkdir(targetCatalogDir, { recursive: true });
  await cp(source, destination, { recursive: true, force: true });

  return destination;
}

export async function readTemplate(templateName) {
  return readFile(path.join(templatesDir, templateName), "utf8");
}

export function renderAgentsMarkdown({ skills, detections, generatedAt, projectName }) {
  const sortedSkills = [...skills].sort((a, b) => a.id.localeCompare(b.id));
  const sortedDetections = [...detections].sort((a, b) => a.technology.localeCompare(b.technology));
  const autoInvokeSkills = sortedSkills.filter((skill) => skill.skillMetadata?.["auto-invoke"]);

  const lines = [
    "<!-- Managed by skilly-hand. Re-run `npx skilly-hand install` or `npm run agentic:self:sync` to regenerate. -->",
    `# ${projectName || "Project"} AI Agent Orchestrator`,
    "",
    "> Root guidance for repository-wide AI routing. Use this file to understand where work belongs, what skills to invoke, and when triggers apply.",
    "",
    "## Where",
    "",
    "- Scope: repository root and all descendant folders unless a deeper AGENTS guide overrides locally.",
    `- Generated at: ${generatedAt}`,
    `- Detected technologies: ${sortedDetections.length === 0 ? "none" : sortedDetections.map((item) => item.technology).join(", ")}`,
    "- Escalation boundary: when work changes global architecture, CI/CD, release, or security policy, escalate before implementation.",
    "",
    "## What",
    "",
    "### Installed Skill Registry",
    "",
    "| Skill | Description | Tags |",
    "| ----- | ----------- | ---- |"
  ];

  for (const skill of sortedSkills) {
    lines.push(`| \`${skill.id}\` | ${skill.description} | ${skill.tags.join(", ")} |`);
  }

  lines.push(
    "",
    "### Mandatory Skill Gate (Must Use / Must Read)",
    "",
    "This gate has global precedence and applies to every user interaction across all supported agent conventions/files.",
    "",
    "1. Always run `token-optimizer` first to classify complexity and set the minimum viable reasoning depth.",
    "2. Always run `output-optimizer` immediately after `token-optimizer` for response-shape control.",
    "3. `output-optimizer` mode policy:",
    "   - Default: select a random canonical mode for each new interaction.",
    "   - Override: if user explicitly requests a mode (for example `mode: step-brief`), that explicit mode wins.",
    "   - Persistence: keep the explicitly requested mode active until the user asks for a different mode.",
    "",
    "### Task Routing",
    "",
    "**Mandatory-gate precedence:** apply the mandatory optimizer gate before task-routing chains below.",
    "",
    "**SDD-first policy:** for feature delivery, bug fixes, or any multi-step implementation, start with `spec-driven-development` unless the task is clearly trivial and one-step.",
    "",
    "| Task Type | Recommended Skill Chain |",
    "| --------- | ----------------------- |",
    "| Planning feature work, bug fixes, and multi-phase implementation | `spec-driven-development` |",
    "| Executing approved implementation plans | `spec-driven-development` -> task-specific skills |",
    "| Creating or updating reusable skills | `skill-creator` |",
    "| Creating or updating root AGENTS orchestration guidance | `agents-root-orchestrator` |",
    "",
    "## When",
    "",
    "### Auto-invoke Triggers",
    ""
  );

  if (autoInvokeSkills.length === 0) {
    lines.push("No explicit auto-invoke triggers were found in installed skill metadata.");
  } else {
    lines.push("| Action | Skill |", "| ------ | ----- |");
    for (const skill of autoInvokeSkills) {
      lines.push(`| ${skill.skillMetadata["auto-invoke"]} | \`${skill.id}\` |`);
    }
  }

  lines.push(
    "",
    "### Sequencing Rules",
    "",
    "1. Classify task intent and scope first.",
    "2. If work is non-trivial, invoke `spec-driven-development` before implementation.",
    "3. Invoke prerequisite skills before implementation skills.",
    "4. Verify outcomes and update this routing map when workflows change.",
    "",
    "## Chaining Notations",
    "",
    "Chaining notations document integrated workflows where multiple skills are sequentially invoked for complex tasks. Always invoke skills in documented order.",
    "",
    "### Root AGENTS Maintenance Workflow",
    "",
    "```text",
    "Updating root AGENTS.md guidance",
    "  -> agents-root-orchestrator",
    "  -> skill-creator (if reusable workflow docs changed)",
    "```",
    "",
    "### Skill Introduction Workflow",
    "",
    "```text",
    "Asking for a new reusable skill",
    "  -> skill-creator",
    "  -> spec-driven-development",
    "  -> agents-root-orchestrator",
    "```",
    "",
    "### SDD-First Delivery Workflow",
    "",
    "```text",
    "Feature, bug, or multi-step execution request",
    "  -> spec-driven-development",
    "  -> task-specific implementation skill(s)",
    "  -> agents-root-orchestrator (if routing guidance changed)",
    "```",
    "",
    "## Usage",
    "",
    "- Read the relevant `SKILL.md` file before starting a specialized task.",
    "- Prefer installed skills under `.skilly-hand/catalog/` or repository `catalog/skills` as the source of truth.",
    "- Use project-specific docs only as a supplement to these portable rules."
  );

  return lines.join("\n") + "\n";
}

export async function writeCatalogIndex() {
  const ids = await listSkillIds();
  const outputPath = path.join(catalogDir, "catalog-index.json");
  await writeFile(outputPath, JSON.stringify(ids, null, 2) + "\n", "utf8");
  return outputPath;
}

export async function verifyCatalogFiles() {
  const skillIds = await listSkillIds();
  const issues = [];

  for (const skillId of skillIds) {
    const skillPath = path.join(skillsDir, skillId);
    const manifest = await loadSkillManifest(skillId);

    for (const file of manifest.files) {
      const filePath = path.join(skillPath, file.path);
      try {
        await stat(filePath);
      } catch {
        issues.push(`Missing file for ${skillId}: ${file.path}`);
      }
    }
  }

  return issues;
}
