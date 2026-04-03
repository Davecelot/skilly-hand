#!/usr/bin/env node
import path from "node:path";
import { loadAllSkills } from "../../catalog/src/index.js";
import { installProject, runDoctor, uninstallProject } from "../../core/src/index.js";
import { detectProject } from "../../detectors/src/index.js";

function parseArgs(argv) {
  const args = [...argv];
  const positional = [];
  const flags = {
    dryRun: false,
    yes: false,
    verbose: false,
    agents: [],
    include: [],
    exclude: []
  };

  while (args.length > 0) {
    const token = args.shift();
    if (!token.startsWith("-")) {
      positional.push(token);
      continue;
    }

    if (token === "--dry-run") flags.dryRun = true;
    else if (token === "--yes" || token === "-y") flags.yes = true;
    else if (token === "--verbose" || token === "-v") flags.verbose = true;
    else if (token === "--agent" || token === "-a") flags.agents.push(args.shift());
    else if (token === "--cwd") flags.cwd = args.shift();
    else if (token === "--include") flags.include.push(args.shift());
    else if (token === "--exclude") flags.exclude.push(args.shift());
    else if (token === "--help" || token === "-h") flags.help = true;
    else throw new Error(`Unknown flag: ${token}`);
  }

  return { command: positional[0], flags };
}

function printHelp() {
  console.log(`skilly-hand

Usage:
  npx skilly-hand [install]
  npx skilly-hand detect
  npx skilly-hand list
  npx skilly-hand doctor
  npx skilly-hand uninstall

Flags:
  --dry-run
  --yes
  --verbose
  --agent <codex|claude|cursor|gemini|copilot>
  --cwd <path>
  --include <tag>
  --exclude <tag>
`);
}

function printDetections(detections) {
  if (detections.length === 0) {
    console.log("No technology signals were detected.");
    return;
  }

  for (const item of detections) {
    console.log(`- ${item.technology} (${item.confidence})`);
    console.log(`  reasons: ${item.reasons.join("; ")}`);
    console.log(`  recommended skills: ${item.recommendedSkillIds.join(", ")}`);
  }
}

function printPlan(plan) {
  console.log(`Project: ${plan.cwd}`);
  console.log(`Install root: ${plan.installRoot}`);
  console.log(`Agents: ${plan.agents.join(", ")}`);
  console.log("Detected technologies:");
  printDetections(plan.detections);
  console.log("Skills to install:");
  for (const skill of plan.skills) {
    console.log(`- ${skill.id}: ${skill.title} [${skill.tags.join(", ")}]`);
  }
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (flags.help) {
    printHelp();
    return;
  }

  const cwd = path.resolve(flags.cwd || process.cwd());
  const effectiveCommand = command || "install";

  if (effectiveCommand === "detect") {
    printDetections(await detectProject(cwd));
    return;
  }

  if (effectiveCommand === "list") {
    const skills = await loadAllSkills();
    for (const skill of skills) {
      console.log(`- ${skill.id}: ${skill.title}`);
      console.log(`  tags: ${skill.tags.join(", ")}`);
      console.log(`  agents: ${skill.agentSupport.join(", ")}`);
    }
    return;
  }

  if (effectiveCommand === "doctor") {
    const result = await runDoctor(cwd);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (effectiveCommand === "uninstall") {
    const result = await uninstallProject(cwd);
    console.log(result.removed ? "skilly-hand installation removed." : result.reason);
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

    printPlan(result.plan);
    console.log(result.applied ? "Installation completed." : "Dry run only; nothing was written.");
    return;
  }

  throw new Error(`Unknown command: ${effectiveCommand}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
