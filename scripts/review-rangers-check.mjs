#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function parseArgs(argv = process.argv.slice(2)) {
  return {
    json: argv.includes("--json")
  };
}

function runNodeTests(files) {
  const result = spawnSync("node", ["--test", ...files], {
    cwd: rootDir,
    encoding: "utf8",
    env: {
      ...process.env,
      NO_COLOR: "1",
      NODE_NO_WARNINGS: "1"
    }
  });

  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim()
  };
}

function scanEvidence() {
  const files = {
    inquirerUi: path.join(rootDir, "packages/cli/src/inquirer-ui.js"),
    bin: path.join(rootDir, "packages/cli/src/bin.js")
  };

  const inquirerUi = fs.readFileSync(files.inquirerUi, "utf8");
  const bin = fs.readFileSync(files.bin, "utf8");

  const findings = [];

  if (!inquirerUi.includes('type: "search"')) {
    findings.push({
      severity: "high",
      code: "guided-home-search-missing",
      message: "Interactive launcher is missing searchable command discovery."
    });
  }

  if (!inquirerUi.includes("Command Guide")) {
    findings.push({
      severity: "high",
      code: "command-guide-missing",
      message: "Interactive launcher is missing built-in Command Guide output."
    });
  }

  if (!bin.includes("formatHelpUsageLines")) {
    findings.push({
      severity: "high",
      code: "help-registry-sync-missing",
      message: "Help output is not using shared command registry usage lines."
    });
  }

  return findings;
}

function printReport(renderer, report) {
  const summary = renderer.kv([
    ["Critical findings", String(report.criticalCount)],
    ["High findings", String(report.highCount)],
    ["Checks run", String(report.checkCount)]
  ]);

  const findingsBlock = report.findings.length
    ? renderer.list(report.findings.map((finding) => `[${finding.severity}] ${finding.code}: ${finding.message}`))
    : renderer.status("success", "No review-rangers findings.");

  const blocks = [
    renderer.status(report.ok ? "success" : "error", "review-rangers verification"),
    renderer.section("Summary", summary),
    renderer.section("Findings", findingsBlock)
  ];

  if (report.testOutput && !report.ok) {
    blocks.push(renderer.section("Test Output", report.testOutput));
  }

  if (report.ok) {
    blocks.push(renderer.section("Next Steps", renderer.list([
      "Gate passed. Continue release workflow.",
      "Re-run with `npm run review:rangers -- --json` for machine-readable output."
    ])));
  }

  renderer.write(renderer.joinBlocks(blocks));
}

function main() {
  const args = parseArgs();
  const renderer = createTerminalRenderer();
  const findings = scanEvidence();
  const testRun = runNodeTests(["tests/interactive-cli.test.js", "tests/cli-output.test.js"]);
  const reportFindings = [...findings];

  if (!testRun.ok) {
    reportFindings.push({
      severity: "critical",
      code: "ux-regression-tests-failed",
      message: "Interactive/discoverability regression tests failed."
    });
  }

  const criticalCount = reportFindings.filter((finding) => finding.severity === "critical").length;
  const highCount = reportFindings.filter((finding) => finding.severity === "high").length;
  const ok = criticalCount === 0 && highCount === 0;

  const report = {
    command: "review-rangers-check",
    ok,
    criticalCount,
    highCount,
    checkCount: 4,
    findings: reportFindings,
    checks: {
      guidedHomeSearch: !findings.find((item) => item.code === "guided-home-search-missing"),
      commandGuide: !findings.find((item) => item.code === "command-guide-missing"),
      helpRegistrySync: !findings.find((item) => item.code === "help-registry-sync-missing"),
      uxRegressionTests: testRun.ok
    },
    testOutput: testRun.ok ? "" : testRun.output
  };

  if (args.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    printReport(renderer, report);
  }

  if (!ok) process.exitCode = 1;
}

main();

