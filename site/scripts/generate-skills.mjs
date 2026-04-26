import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(siteRoot, "../..");
const skillsRoot = path.join(repoRoot, "catalog", "skills");
const outputPath = path.join(repoRoot, "site", "src", "generated", "skills.js");

const directories = await readdir(skillsRoot, { withFileTypes: true });
const skills = [];

for (const entry of directories) {
  if (!entry.isDirectory()) continue;

  const manifestPath = path.join(skillsRoot, entry.name, "manifest.json");
  const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const content = await readFile(skillPath, "utf8");
    skills.push({
      id: manifest.id,
      title: manifest.title,
      description: manifest.description,
      tags: manifest.tags || [],
      sourcePath: `catalog/skills/${manifest.id}/SKILL.md`,
      content
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

skills.sort((left, right) => left.title.localeCompare(right.title));

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `export const skills = ${JSON.stringify(skills, null, 2)};\n`,
  "utf8"
);
