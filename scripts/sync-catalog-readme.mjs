import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAllSkills } from "../packages/catalog/src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const readmePath = path.join(rootDir, "catalog", "README.md");
const skills = await loadAllSkills();

const lines = [
  "# Portable Catalog",
  "",
  "Published portable skills consumed by the `skilly-hand` CLI.",
  "",
  "| Skill | Description | Tags | Installs For |",
  "| ----- | ----------- | ---- | ------------ |"
];

for (const skill of skills) {
  lines.push(
    `| \`${skill.id}\` | ${skill.description} | ${skill.tags.join(", ")} | ${skill.installsFor.join(", ")} |`
  );
}

lines.push("", "Legacy source remains under `source/legacy/agentic-structure` and is excluded from installation.");

await writeFile(readmePath, lines.join("\n") + "\n", "utf8");

console.log(`Synced catalog README for ${skills.length} skills.`);
