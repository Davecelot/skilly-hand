import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const renderer = createTerminalRenderer();

export async function extractChangelogSection({ version, cwd = process.cwd() } = {}) {
  if (!version) throw new Error("Missing version argument.");

  const changelogPath = path.join(cwd, "CHANGELOG.md");
  const content = await readFile(changelogPath, "utf8");
  const normalized = content.replace(/\r\n/g, "\n");

  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headingRegex = new RegExp(`^## \\[${escaped}\\]`, "m");
  const match = headingRegex.exec(normalized);
  if (!match) {
    throw new Error(`No section found for version ${version} in CHANGELOG.md.`);
  }

  const bodyStart = normalized.indexOf("\n", match.index) + 1;
  const remaining = normalized.slice(bodyStart);
  const nextHeading = /^## \[/m.exec(remaining);
  const bodyEnd = nextHeading ? bodyStart + nextHeading.index : normalized.length;

  const notes = normalized.slice(bodyStart, bodyEnd).trim();
  return { version, notes };
}

function parseArgs(argv) {
  const flags = { json: false, raw: false, help: false };
  const args = [...argv];
  while (args.length > 0) {
    const token = args.shift();
    if (token === "--version") flags.version = args.shift();
    else if (token === "--json") flags.json = true;
    else if (token === "--raw") flags.raw = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }
  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "extract-changelog-section"),
    renderer.section(
      "Usage",
      renderer.list(["node scripts/extract-changelog-section.mjs --version <x.y.z> [--json|--raw]"], { bullet: "-" })
    ),
    renderer.section(
      "Flags",
      renderer.list([
        "--version <x.y.z>  Version to extract from CHANGELOG.md",
        "--json             Emit JSON: { command, version, notes }",
        "--raw              Emit only the notes text (for piping into GitHub Actions outputs)",
        "--help, -h         Show this help output"
      ], { bullet: "-" })
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
      const result = await extractChangelogSection({ version: flags.version });
      if (flags.raw) {
        process.stdout.write(result.notes + "\n");
      } else if (flags.json) {
        renderer.writeJson({ command: "extract-changelog-section", ...result });
      } else {
        renderer.write(renderer.joinBlocks([
          renderer.status("info", `Changelog notes for v${result.version}`),
          result.notes
        ]));
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "extract-changelog-section failed",
          why: error.message,
          hint: "Run `node scripts/extract-changelog-section.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "extract-changelog-section failed",
        why: error.message,
        hint: "Ensure the version exists as a released section in CHANGELOG.md.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
