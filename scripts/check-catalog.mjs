import { loadAllSkills, verifyCatalogFiles } from "../packages/catalog/src/index.js";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { syncCatalogReadme } from "./sync-catalog-readme.mjs";

const renderer = createTerminalRenderer();

export async function checkCatalog() {
  const issues = [];
  let manifests = [];
  let readmeStatus = { changed: false };

  try {
    manifests = await loadAllSkills();
  } catch (error) {
    issues.push(`Unable to load catalog manifests: ${error.message}`);
  }

  try {
    const catalogIssues = await verifyCatalogFiles();
    issues.push(...catalogIssues);
  } catch (error) {
    issues.push(`Catalog file verification failed: ${error.message}`);
  }

  try {
    readmeStatus = await syncCatalogReadme({ dryRun: true });
  } catch (error) {
    issues.push(`Catalog README verification failed: ${error.message}`);
  }

  for (const manifest of manifests) {
    if (manifest.id.startsWith("scannlab-")) {
      issues.push(`Portable catalog still contains legacy-prefixed id: ${manifest.id}`);
    }
  }

  if (readmeStatus.changed) {
    issues.push("Catalog README is out of sync (run `npm run catalog:sync`).");
  }

  return {
    skillCount: manifests.length,
    issues,
    valid: issues.length === 0
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
    renderer.status("info", "check-catalog"),
    renderer.section("Usage", renderer.list(["node scripts/check-catalog.mjs [--json]"], { bullet: "-" }))
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
      const result = await checkCatalog();

      if (flags.json) {
        renderer.writeJson({
          command: "check-catalog",
          ...result
        });
        if (!result.valid) {
          process.exitCode = 1;
        }
      } else if (result.valid) {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "Catalog validation passed."),
          renderer.kv([["Skills checked", String(result.skillCount)]])
        ]));
      } else {
        renderer.writeError(renderer.joinBlocks([
          renderer.status("error", "Catalog validation failed."),
          renderer.list(result.issues)
        ]));
        process.exitCode = 1;
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "check-catalog failed",
          why: error.message,
          hint: "Run `node scripts/check-catalog.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "check-catalog failed",
        why: error.message,
        hint: "Run `npm run catalog:check` after fixing catalog file issues.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
