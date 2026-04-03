import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const catalogDir = path.join(rootDir, "catalog", "skills");
const outputFile = path.join(rootDir, "catalog", "catalog-index.json");

const entries = [];

for (const name of await readdir(catalogDir)) {
  entries.push(name);
}

entries.sort();

await writeFile(outputFile, JSON.stringify(entries, null, 2) + "\n", "utf8");

console.log(`Wrote ${entries.length} catalog entries to ${outputFile}`);
