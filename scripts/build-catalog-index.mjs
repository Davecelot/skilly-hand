import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const renderer = createTerminalRenderer();

export async function buildCatalogIndex({ rootDir = path.resolve(__dirname, "..") } = {}) {
  const catalogDir = path.join(rootDir, "catalog", "skills");
  const outputFile = path.join(rootDir, "catalog", "catalog-index.json");
  const entries = [];

  for (const name of await readdir(catalogDir)) {
    entries.push(name);
  }

  entries.sort();
  await writeFile(outputFile, JSON.stringify(entries, null, 2) + "\n", "utf8");

  return {
    rootDir,
    catalogDir,
    outputFile,
    entries
  };
}

function parseArgs(argv) {
  const flags = { json: false };
  const args = [...argv];

  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") flags.json = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "build-catalog-index"),
    renderer.section(
      "Usage",
      renderer.list(["node scripts/build-catalog-index.mjs [--json]"], { bullet: "-" })
    )
  ]));
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const jsonRequested = process.argv.includes("--json");
  try {
    const flags = parseArgs(process.argv.slice(2));
    if (flags.help) {
      printHelp();
    } else {
      const result = await buildCatalogIndex();
      if (flags.json) {
        renderer.writeJson({
          command: "build-catalog-index",
          outputFile: result.outputFile,
          entries: result.entries,
          count: result.entries.length
        });
      } else {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "Catalog index written."),
          renderer.kv([
            ["Entries", String(result.entries.length)],
            ["Output file", result.outputFile]
          ])
        ]));
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "build-catalog-index failed",
          why: error.message,
          hint: "Run `node scripts/build-catalog-index.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "build-catalog-index failed",
        why: error.message,
        hint: "Ensure catalog files are present and readable.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
