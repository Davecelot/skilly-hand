#!/usr/bin/env node
import path from "node:path";
import { createRequire } from "node:module";
import { loadAllSkills } from "../../catalog/src/index.js";
import { installProject, runDoctor, uninstallProject } from "../../core/src/index.js";
import { createTerminalRenderer } from "../../core/src/terminal.js";
import { detectProject } from "../../detectors/src/index.js";

const require = createRequire(import.meta.url);
const { version } = require("../../../package.json");

const renderer = createTerminalRenderer();

function parseArgs(argv) {
  const args = [...argv];
  const positional = [];
  const flags = {
    dryRun: false,
    yes: false,
    verbose: false,
    json: false,
    agents: [],
    include: [],
    exclude: []
  };

  function takeFlagValue(flagName) {
    const value = args.shift();
    if (!value || value.startsWith("-")) {
      throw new Error(`Missing value for ${flagName}`);
    }
    return value;
  }

  while (args.length > 0) {
    const token = args.shift();
    if (!token.startsWith("-")) {
      positional.push(token);
      continue;
    }

    if (token === "--dry-run") flags.dryRun = true;
    else if (token === "--yes" || token === "-y") flags.yes = true;
    else if (token === "--verbose" || token === "-v") flags.verbose = true;
    else if (token === "--json") flags.json = true;
    else if (token === "--agent" || token === "-a") flags.agents.push(takeFlagValue(token));
    else if (token === "--cwd") flags.cwd = takeFlagValue(token);
    else if (token === "--include") flags.include.push(takeFlagValue(token));
    else if (token === "--exclude") flags.exclude.push(takeFlagValue(token));
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return { command: positional[0], flags };
}

function buildHelpText() {
  const usage = renderer.section("Usage", renderer.list([
    "npx skilly-hand [install]",
    "npx skilly-hand detect",
    "npx skilly-hand list",
    "npx skilly-hand doctor",
    "npx skilly-hand uninstall"
  ], { bullet: "-" }));

  const flags = renderer.section("Flags", renderer.list([
    "--dry-run                     Show install plan without writing files",
    "--json                        Emit stable JSON output for automation",
    "--yes, -y                     Reserved for future non-interactive confirmations",
    "--verbose, -v                 Reserved for future debug detail",
    "--agent, -a <name>            codex|claude|cursor|gemini|copilot (repeatable)",
    "--cwd <path>                  Project root (defaults to current directory)",
    "--include <tag>               Include only skills matching all tags",
    "--exclude <tag>               Exclude skills matching any tag",
    "--help, -h                    Show help"
  ], { bullet: "-" }));

  const examples = renderer.section("Examples", renderer.list([
    "npx skilly-hand install --dry-run",
    "npx skilly-hand detect --json",
    "npx skilly-hand install --agent codex --agent claude",
    "npx skilly-hand list --include workflow"
  ], { bullet: "-" }));

  return renderer.joinBlocks([
    renderer.banner(version),
    usage,
    flags,
    examples
  ]);
}

function printInstallResult(result, flags) {
  const mode = flags.dryRun ? "dry-run" : "apply";
  const preflight = renderer.section(
    "Install Preflight",
    renderer.kv([
      ["Project", result.plan.cwd],
      ["Install root", result.plan.installRoot],
      ["Agents", result.plan.agents.join(", ") || "none"],
      ["Include tags", flags.include.join(", ") || "none"],
      ["Exclude tags", flags.exclude.join(", ") || "none"],
      ["Mode", mode]
    ])
  );

  const detections = renderer.section(
    "Detected Technologies",
    result.plan.detections.length > 0
      ? renderer.detectionGrid(result.plan.detections)
      : renderer.status("warn", "No technology signals were detected.", "Only core skills will be selected.")
  );

  const skills = renderer.section(
    "Skill Plan",
    result.plan.skills.length > 0
      ? renderer.table(
          [
            { key: "id", header: "Skill ID" },
            { key: "title", header: "Title" },
            { key: "tags", header: "Tags" }
          ],
          result.plan.skills.map((skill) => ({
            id: skill.id,
            title: skill.title,
            tags: skill.tags.join(", ")
          }))
        )
      : renderer.status("warn", "No skills selected.")
  );

  const status = result.applied
    ? renderer.status("success", "Installation completed.", "Managed files and symlinks are in place.")
    : renderer.status("info", "Dry run complete.", "No files were written.");

  const nextSteps = result.applied
    ? renderer.nextSteps([
      "Review generated AGENTS and assistant instruction files.",
      "Run `npx skilly-hand doctor` to validate installation health.",
      "Use `npx skilly-hand uninstall` to restore backed-up files if needed."
    ])
    : renderer.nextSteps([
      "Run `npx skilly-hand install` to apply this plan.",
      "Adjust `--include` and `--exclude` tags to tune skill selection."
    ]);

  renderer.write(renderer.joinBlocks([renderer.banner(version), preflight, detections, skills, status, nextSteps]));
}

function printDetectResult(cwd, detections) {
  const summary = renderer.section(
    "Detection Summary",
    renderer.kv([
      ["Project", cwd],
      ["Signals found", String(detections.length)]
    ])
  );

  const findings = renderer.section(
    "Findings",
    detections.length > 0
      ? renderer.detectionGrid(detections)
      : renderer.status("warn", "No technology signals were detected.", "Only core skills will be selected.")
  );

  renderer.write(renderer.joinBlocks([summary, findings]));
}

function printListResult(skills) {
  const summary = renderer.section(
    "Catalog Summary",
    renderer.kv([["Skills available", String(skills.length)]])
  );

  const table = renderer.section(
    "Skills",
    renderer.table(
      [
        { key: "id", header: "Skill ID" },
        { key: "title", header: "Title" },
        { key: "tags", header: "Tags" },
        { key: "agents", header: "Agents" }
      ],
      skills.map((skill) => ({
        id: skill.id,
        title: skill.title,
        tags: skill.tags.join(", "),
        agents: skill.agentSupport.join(", ")
      }))
    )
  );

  renderer.write(renderer.joinBlocks([summary, table]));
}

function printDoctorResult(result) {
  const badge = renderer.healthBadge(result.installed);

  const summary = renderer.section(
    "Doctor Summary",
    renderer.kv([
      ["Project", result.cwd],
      ["Installed", result.installed ? "yes" : "no"],
      ["Catalog issues", String(result.catalogIssues.length)]
    ])
  );

  const lock = result.lock
    ? renderer.section(
        "Lock Metadata",
        renderer.kv([
          ["Generated at", result.lock.generatedAt],
          ["Agents", result.lock.agents.join(", ")],
          ["Skills", result.lock.skills.join(", ")]
        ])
      )
    : "";

  const issues = result.catalogIssues.length
    ? renderer.section("Catalog Issues", renderer.list(result.catalogIssues))
    : renderer.section("Catalog Issues", renderer.status("success", "No catalog issues found."));

  const probes = renderer.section(
    "Project Probes",
    renderer.table(
      [
        { key: "path", header: "Path" },
        { key: "exists", header: "Exists" },
        { key: "type", header: "Type" }
      ],
      result.fileStatus.map((item) => ({
        path: item.path,
        exists: item.exists ? "yes" : "no",
        type: item.type || "-"
      }))
    )
  );

  renderer.write(renderer.joinBlocks([badge, summary, lock, issues, probes]));
}

function printUninstallResult(result) {
  if (result.removed) {
    renderer.write(
      renderer.joinBlocks([
        renderer.status("success", "skilly-hand installation removed."),
        renderer.nextSteps([
          "Run `npx skilly-hand install` if you want to reinstall managed files.",
          "Run `npx skilly-hand doctor` to confirm the project state."
        ])
      ])
    );
    return;
  }

  renderer.write(
    renderer.joinBlocks([
      renderer.status("warn", "Nothing to uninstall.", result.reason),
      renderer.nextSteps(["Run `npx skilly-hand install` to create a managed installation first."])
    ])
  );
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (flags.help) {
    if (flags.json) {
      renderer.writeJson({
        command: command || "install",
        help: true,
        usage: [
          "npx skilly-hand [install]",
          "npx skilly-hand detect",
          "npx skilly-hand list",
          "npx skilly-hand doctor",
          "npx skilly-hand uninstall"
        ]
      });
      return;
    }

    renderer.write(buildHelpText());
    return;
  }

  const cwd = path.resolve(flags.cwd || process.cwd());
  const effectiveCommand = command || "install";

  if (effectiveCommand === "detect") {
    const detections = await detectProject(cwd);
    if (flags.json) {
      renderer.writeJson({
        command: "detect",
        cwd,
        count: detections.length,
        detections
      });
      return;
    }
    printDetectResult(cwd, detections);
    return;
  }

  if (effectiveCommand === "list") {
    const skills = await loadAllSkills();
    if (flags.json) {
      renderer.writeJson({
        command: "list",
        count: skills.length,
        skills
      });
      return;
    }
    printListResult(skills);
    return;
  }

  if (effectiveCommand === "doctor") {
    const result = await runDoctor(cwd);
    if (flags.json) {
      renderer.writeJson({
        command: "doctor",
        ...result
      });
      return;
    }
    printDoctorResult(result);
    return;
  }

  if (effectiveCommand === "uninstall") {
    const result = await uninstallProject(cwd);
    if (flags.json) {
      renderer.writeJson({
        command: "uninstall",
        ...result
      });
      return;
    }
    printUninstallResult(result);
    return;
  }

  if (effectiveCommand === "install") {
    const result = await installProject({
      cwd,
      agents: flags.agents,
      dryRun: flags.dryRun,
      includeTags: flags.include,
      excludeTags: flags.exclude
    });

    if (flags.json) {
      renderer.writeJson({
        command: "install",
        applied: result.applied,
        plan: result.plan,
        lockPath: result.lockPath || null
      });
      return;
    }

    printInstallResult(result, flags);
    return;
  }

  throw new Error(`Unknown command: ${effectiveCommand}`);
}

const jsonRequested = process.argv.includes("--json");

main().catch((error) => {
  const hint =
    error.message.startsWith("Unknown command:")
      ? "Run `npx skilly-hand --help` to see available commands."
      : error.message.startsWith("Unknown flag:") || error.message.startsWith("Missing value")
      ? "Check command flags with `npx skilly-hand --help`."
      : "Retry with `--verbose` for expanded context if needed.";

  if (jsonRequested) {
    renderer.writeErrorJson({
      ok: false,
      error: {
        what: "skilly-hand command failed",
        why: error.message,
        hint
      }
    });
    process.exitCode = 1;
    return;
  }

  renderer.writeError(
    renderer.error({
      what: "skilly-hand command failed",
      why: error.message,
      hint,
      exitCode: 1
    })
  );
  process.exitCode = 1;
});
