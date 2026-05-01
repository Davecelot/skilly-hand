import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractReleaseMetadata, renderReleaseModule } from "./release-metadata.mjs";

const siteRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(siteRoot, "../..");
const skillsRoot = path.join(repoRoot, "catalog", "skills");
const outputPath = path.join(repoRoot, "site", "src", "generated", "skills.js");
const releaseOutputPath = path.join(repoRoot, "site", "src", "generated", "release.js");

async function scanSkillDir(dirPath, depth = 0) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  return Promise.all(
    entries.map(async (e) => {
      const item = { name: e.name, type: e.isDirectory() ? "dir" : "file" };
      if (e.isDirectory() && depth === 0) {
        item.children = await scanSkillDir(path.join(dirPath, e.name), 1);
      }
      return item;
    })
  );
}

function unquote(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function extractSkillMetadata(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    return {};
  }

  const metadata = {};
  const lines = frontmatterMatch[1].split("\n");
  const startIndex = lines.findIndex((line) => line.trim() === "skillMetadata:");

  if (startIndex === -1) {
    return metadata;
  }

  let currentListKey = "";

  for (const line of lines.slice(startIndex + 1)) {
    if (/^\S/.test(line)) {
      break;
    }

    const listMatch = line.match(/^\s{4}-\s*(.+)$/);

    if (listMatch && currentListKey) {
      metadata[currentListKey].push(unquote(listMatch[1]));
      continue;
    }

    const fieldMatch = line.match(/^\s{2}([\w-]+):(?:\s*(.*))?$/);

    if (!fieldMatch) {
      continue;
    }

    const [, key, rawValue = ""] = fieldMatch;
    const value = rawValue.trim();

    if (!value) {
      metadata[key] = [];
      currentListKey = key;
      continue;
    }

    metadata[key] = unquote(value);
    currentListKey = "";
  }

  return metadata;
}

const directories = await readdir(skillsRoot, { withFileTypes: true });
const skills = [];

for (const entry of directories) {
  if (!entry.isDirectory()) continue;

  const manifestPath = path.join(skillsRoot, entry.name, "manifest.json");
  const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const content = await readFile(skillPath, "utf8");
    const allEntries = await scanSkillDir(path.join(skillsRoot, entry.name));
    const extraFiles = allEntries.filter(
      (e) => e.name !== "SKILL.md" && e.name !== "manifest.json"
    );
    skills.push({
      id: manifest.id,
      title: manifest.title,
      description: manifest.description,
      tags: manifest.tags || [],
      sourcePath: `catalog/skills/${manifest.id}/SKILL.md`,
      metadata: extractSkillMetadata(content),
      files: extraFiles,
      content
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

skills.sort((left, right) => left.title.localeCompare(right.title));

await mkdir(path.dirname(outputPath), { recursive: true });
const [packageJsonContent, changelogContent] = await Promise.all([
  readFile(path.join(repoRoot, "package.json"), "utf8"),
  readFile(path.join(repoRoot, "CHANGELOG.md"), "utf8")
]);
const release = extractReleaseMetadata({ packageJsonContent, changelogContent });

await Promise.all([
  writeFile(
    outputPath,
    `export const skills = ${JSON.stringify(skills, null, 2)};\n`,
    "utf8"
  ),
  writeFile(releaseOutputPath, renderReleaseModule(release), "utf8")
]);
