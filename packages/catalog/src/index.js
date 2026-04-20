import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
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

const MIRRORED_SKILL_METADATA_KEYS = [
  "author",
  "last-edit",
  "license",
  "version",
  "changelog",
  "auto-invoke",
  "allowed-tools"
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

  const hasSkillInstruction = manifest.files.some((file) => file.path === "SKILL.md" && file.kind === "instruction");
  if (!hasSkillInstruction) {
    throw new Error(`Skill "${manifest.id}" must include files entry for SKILL.md as instruction`);
  }

  assertFrontmatterFields(manifest);

  return true;
}

function toLf(text) {
  return text.replaceAll("\r\n", "\n");
}

function splitLinesWithOffsets(text) {
  const lines = [];
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") {
      lines.push({
        text: text.slice(start, index),
        start,
        end: index + 1
      });
      start = index + 1;
    }
  }
  if (start < text.length) {
    lines.push({
      text: text.slice(start),
      start,
      end: text.length
    });
  } else if (text.length === 0) {
    lines.push({ text: "", start: 0, end: 0 });
  }
  return lines;
}

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

function assertFrontmatterFields(manifest) {
  if (!manifest || typeof manifest !== "object") {
    throw new Error("Invalid manifest while building SKILL.md frontmatter");
  }

  if (typeof manifest.id !== "string" || manifest.id.trim().length === 0) {
    throw new Error(`Skill "${manifest.id}" is missing required manifest.id for frontmatter mirroring`);
  }

  if (typeof manifest.description !== "string" || manifest.description.length === 0) {
    throw new Error(`Skill "${manifest.id}" is missing required manifest.description for frontmatter mirroring`);
  }

  if (!manifest.skillMetadata || typeof manifest.skillMetadata !== "object") {
    throw new Error(`Skill "${manifest.id}" is missing required manifest.skillMetadata for frontmatter mirroring`);
  }

  for (const key of MIRRORED_SKILL_METADATA_KEYS) {
    if (!(key in manifest.skillMetadata)) {
      throw new Error(`Skill "${manifest.id}" is missing required skillMetadata.${key} for frontmatter mirroring`);
    }
  }

  const scalarKeys = ["author", "last-edit", "license", "version", "changelog", "auto-invoke"];
  for (const key of scalarKeys) {
    if (typeof manifest.skillMetadata[key] !== "string" || manifest.skillMetadata[key].trim().length === 0) {
      throw new Error(`Skill "${manifest.id}" has invalid skillMetadata.${key}; expected a non-empty string`);
    }
  }

  if (!Array.isArray(manifest.skillMetadata["allowed-tools"])) {
    throw new Error(`Skill "${manifest.id}" must declare skillMetadata.allowed-tools as an array`);
  }

  for (const tool of manifest.skillMetadata["allowed-tools"]) {
    if (typeof tool !== "string" || tool.trim().length === 0) {
      throw new Error(`Skill "${manifest.id}" has invalid skillMetadata.allowed-tools; expected non-empty strings`);
    }
  }
}

export function buildSkillFrontmatterPayload(manifest) {
  assertFrontmatterFields(manifest);
  return {
    name: manifest.id,
    description: manifest.description,
    skillMetadata: {
      author: manifest.skillMetadata.author,
      "last-edit": manifest.skillMetadata["last-edit"],
      license: manifest.skillMetadata.license,
      version: manifest.skillMetadata.version,
      changelog: manifest.skillMetadata.changelog,
      "auto-invoke": manifest.skillMetadata["auto-invoke"],
      "allowed-tools": [...manifest.skillMetadata["allowed-tools"]]
    }
  };
}

function renderSkillFrontmatterInner(payload) {
  const lines = [
    `name: ${yamlQuote(payload.name)}`,
    `description: ${yamlQuote(payload.description)}`,
    "skillMetadata:",
    `  author: ${yamlQuote(payload.skillMetadata.author)}`,
    `  last-edit: ${yamlQuote(payload.skillMetadata["last-edit"])}`,
    `  license: ${yamlQuote(payload.skillMetadata.license)}`,
    `  version: ${yamlQuote(payload.skillMetadata.version)}`,
    `  changelog: ${yamlQuote(payload.skillMetadata.changelog)}`,
    `  auto-invoke: ${yamlQuote(payload.skillMetadata["auto-invoke"])}`,
    "  allowed-tools:"
  ];

  for (const tool of payload.skillMetadata["allowed-tools"]) {
    lines.push(`    - ${yamlQuote(tool)}`);
  }

  return lines.join("\n");
}

export function renderSkillFrontmatter(manifest) {
  const payload = buildSkillFrontmatterPayload(manifest);
  return `---\n${renderSkillFrontmatterInner(payload)}\n---\n`;
}

export function splitSkillMarkdown(content) {
  const normalized = toLf(content);
  const source = normalized.startsWith("\uFEFF") ? normalized.slice(1) : normalized;
  const lines = splitLinesWithOffsets(source);
  const mirroredKeys = new Set([
    "name",
    "description",
    "skillMetadata",
    "author",
    "last-edit",
    "license",
    "version",
    "changelog",
    "auto-invoke",
    "allowed-tools"
  ]);
  const isYamlLike = (line) => (
    line.trim().length === 0 ||
    /^\s*[A-Za-z0-9_-]+:(?:\s.*)?$/.test(line) ||
    /^\s*-\s+.*$/.test(line)
  );

  let firstNonBlankIndex = 0;
  while (firstNonBlankIndex < lines.length && lines[firstNonBlankIndex].text.trim().length === 0) {
    firstNonBlankIndex += 1;
  }

  if (firstNonBlankIndex >= lines.length || lines[firstNonBlankIndex].text !== "---") {
    return {
      hasFrontmatter: false,
      malformedFrontmatter: false,
      frontmatter: null,
      body: source
    };
  }

  const openLine = lines[firstNonBlankIndex];
  let sawKeyValue = false;
  let sawMirroredKey = false;
  const detectedKeys = new Set();

  for (let index = firstNonBlankIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].text;
    const nextLine = index + 1 < lines.length ? lines[index + 1].text : null;

    if (
      sawMirroredKey &&
      line.trim().length === 0 &&
      nextLine &&
      /^(?:[-*+]\s+|\d+\.\s+|#{1,6}\s+|>\s+|```)/.test(nextLine)
    ) {
      return {
        hasFrontmatter: true,
        malformedFrontmatter: true,
        frontmatter: null,
        body: source.slice(lines[index + 1].start)
      };
    }

    if (line === "---") {
      if (!sawKeyValue || !sawMirroredKey) {
        return {
          hasFrontmatter: false,
          malformedFrontmatter: false,
          frontmatter: null,
          body: source
        };
      }
      const end = lines[index].end;
      const frontmatter = source.slice(openLine.start, end);
      return {
        hasFrontmatter: true,
        malformedFrontmatter: false,
        frontmatter: frontmatter.endsWith("\n") ? frontmatter : `${frontmatter}\n`,
        body: source.slice(end),
        detectedKeys: Array.from(detectedKeys)
      };
    }

    if (/^\s*[A-Za-z0-9_-]+:(?:\s.*)?$/.test(line)) {
      sawKeyValue = true;
      const key = line.split(":", 1)[0].trim();
      detectedKeys.add(key);
      if (mirroredKeys.has(key)) {
        sawMirroredKey = true;
      }
    }

    if (!isYamlLike(line)) {
      if (!sawKeyValue || !sawMirroredKey) {
        return {
          hasFrontmatter: false,
          malformedFrontmatter: false,
          frontmatter: null,
          body: source
        };
      }
      return {
        hasFrontmatter: true,
        malformedFrontmatter: true,
        frontmatter: null,
        body: source.slice(lines[index].start),
        detectedKeys: Array.from(detectedKeys)
      };
    }
  }

  if (!sawKeyValue) {
    return {
      hasFrontmatter: false,
      malformedFrontmatter: false,
      frontmatter: null,
      body: source
    };
  }

  if (!sawMirroredKey) {
    return {
      hasFrontmatter: false,
      malformedFrontmatter: false,
      frontmatter: null,
      body: source
    };
  }

  return {
    hasFrontmatter: true,
    malformedFrontmatter: true,
    frontmatter: null,
    body: "",
    detectedKeys: Array.from(detectedKeys)
  };
}

export function applyManifestFrontmatterToSkill(content, manifest) {
  const expectedFrontmatter = renderSkillFrontmatter(manifest);
  const parts = splitSkillMarkdown(content);
  return `${expectedFrontmatter}${parts.body}`;
}

export function verifySkillFrontmatterContent(content, manifest) {
  const expectedFrontmatter = renderSkillFrontmatter(manifest);
  const parts = splitSkillMarkdown(content);
  if (!parts.hasFrontmatter) {
    return { ok: false, reason: "missing" };
  }
  if (parts.malformedFrontmatter || !parts.frontmatter) {
    return { ok: false, reason: "malformed" };
  }
  if (parts.frontmatter !== expectedFrontmatter) {
    return { ok: false, reason: "mismatch" };
  }
  const residual = splitSkillMarkdown(parts.body);
  if (residual.hasFrontmatter && !residual.malformedFrontmatter && residual.frontmatter === expectedFrontmatter) {
    return { ok: false, reason: "residual-frontmatter" };
  }
  return { ok: true, reason: null };
}

export async function syncSkillFrontmatter({ skillId, dryRun = false } = {}) {
  const plan = await planSkillFrontmatterSync({ skillId });
  if (!dryRun) {
    await applyTextUpdatesAtomically(plan.updates);
  }
  return {
    skillCount: plan.skillCount,
    updatedSkillIds: plan.updatedSkillIds
  };
}

export async function planSkillFrontmatterSync({ skillId } = {}) {
  const allIds = await listSkillIds();
  if (skillId && !allIds.includes(skillId)) {
    throw new Error(`Unknown skill id: ${skillId}`);
  }

  const ids = skillId ? [skillId] : allIds;
  const updatedSkillIds = [];
  const updates = [];

  for (const id of ids) {
    const manifest = await loadSkillManifest(id);
    const skillPath = path.join(skillsDir, id, "SKILL.md");
    const current = await readFile(skillPath, "utf8");
    const next = applyManifestFrontmatterToSkill(current, manifest);
    if (next !== toLf(current)) {
      updatedSkillIds.push(id);
      updates.push({
        skillId: id,
        path: skillPath,
        content: next
      });
    }
  }

  return {
    skillCount: ids.length,
    updatedSkillIds,
    updates
  };
}

export async function applyTextUpdatesAtomically(updates) {
  const deduped = [];
  const seenPaths = new Set();
  for (let index = updates.length - 1; index >= 0; index -= 1) {
    const update = updates[index];
    if (!seenPaths.has(update.path)) {
      seenPaths.add(update.path);
      deduped.push(update);
    }
  }
  deduped.reverse();

  const originals = new Map();
  for (const update of deduped) {
    try {
      originals.set(update.path, await readFile(update.path, "utf8"));
    } catch (error) {
      if (error?.code === "ENOENT") {
        originals.set(update.path, null);
      } else {
        throw error;
      }
    }
  }

  const writtenPaths = [];
  try {
    for (const update of deduped) {
      await writeFile(update.path, update.content, "utf8");
      writtenPaths.push(update.path);
    }
  } catch (error) {
    for (const targetPath of writtenPaths.reverse()) {
      const original = originals.get(targetPath);
      if (original === null) {
        await rm(targetPath, { force: true });
      } else {
        await writeFile(targetPath, original, "utf8");
      }
    }
    throw error;
  }
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
  const escapeTableCell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
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
    lines.push(`| \`${skill.id}\` | ${escapeTableCell(skill.description)} | ${escapeTableCell(skill.tags.join(", "))} |`);
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
    "   - Default: use `step-brief` when there is no explicit mode or strong phrasing signal.",
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
      lines.push(`| ${escapeTableCell(skill.skillMetadata["auto-invoke"])} | \`${skill.id}\` |`);
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

    const skillDocPath = path.join(skillPath, "SKILL.md");
    let skillDocContent;
    try {
      skillDocContent = await readFile(skillDocPath, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        // Missing file is already surfaced above via manifest file verification.
        continue;
      }
      issues.push(`Cannot read ${skillId}/SKILL.md: ${error.message}`);
      continue;
    }

    try {
      const status = verifySkillFrontmatterContent(skillDocContent, manifest);
      if (!status.ok) {
        issues.push(`Frontmatter ${status.reason} for ${skillId}: SKILL.md`);
      }
    } catch (error) {
      issues.push(`Frontmatter validation failed for ${skillId}: ${error.message}`);
    }
  }

  return issues;
}
