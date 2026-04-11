import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const renderer = createTerminalRenderer();

const PACKAGE_MANAGERS = {
  pnpm: {
    lockfile: "pnpm-lock.yaml",
    auditCmd: ["pnpm", ["audit", "--json", "--prod"]],
    outdatedCmd: ["pnpm", ["outdated", "--format", "json"]]
  },
  yarn: {
    lockfile: "yarn.lock",
    auditCmd: ["yarn", ["npm", "audit", "--json"]],
    outdatedCmd: ["yarn", ["outdated", "--json"]]
  },
  npm: {
    lockfile: ["npm-shrinkwrap.json", "package-lock.json"],
    auditCmd: ["npm", ["audit", "--json"]],
    outdatedCmd: ["npm", ["outdated", "--json"]]
  }
};

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const flags = {
    json: false,
    help: false,
    strict: false,
    cwd: process.cwd()
  };

  const args = [...argv];
  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") flags.json = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else if (token === "--strict") flags.strict = true;
    else if (token === "--cwd") {
      const value = args.shift();
      if (!value || value.startsWith("-")) throw new Error("Missing value for --cwd");
      flags.cwd = value;
    } else {
      throw new Error(`Unknown flag: ${token}`);
    }
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "dependency-security-check"),
    renderer.section("Usage", renderer.list([
      "node scripts/dependency-security-check.mjs [--json] [--strict] [--cwd <path>]"
    ], { bullet: "-" })),
    renderer.section("Description", "Runs deterministic dependency vulnerability and maintenance checks across npm, pnpm, and yarn.")
  ]));
}

async function detectPackageManager(cwd) {
  const packageJsonPath = path.join(cwd, "package.json");
  const hasPackageJson = await exists(packageJsonPath);

  if (!hasPackageJson) {
    return {
      manager: null,
      hasPackageJson: false,
      lockfile: null,
      lockfilePresent: false,
      reason: "No package.json found."
    };
  }

  for (const manager of ["pnpm", "yarn", "npm"]) {
    const lockfiles = Array.isArray(PACKAGE_MANAGERS[manager].lockfile)
      ? PACKAGE_MANAGERS[manager].lockfile
      : [PACKAGE_MANAGERS[manager].lockfile];
    for (const lockfile of lockfiles) {
      if (await exists(path.join(cwd, lockfile))) {
        return {
          manager,
          hasPackageJson: true,
          lockfile,
          lockfilePresent: true,
          reason: ""
        };
      }
    }
  }

  return {
    manager: null,
    hasPackageJson: true,
    lockfile: null,
    lockfilePresent: false,
    reason: "package.json exists but lockfile is missing."
  };
}

function runCommand(command, args, options = {}) {
  const { cwd, timeoutMs = 180000 } = options;
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      resolve({ exitCode: 124, stdout, stderr: `${stderr}\nCommand timed out after ${timeoutMs}ms.`.trim() });
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ exitCode: 127, stdout, stderr: error.message });
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });
  });
}

function extractFirstJsonObject(raw) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
}

function normalizeSeverity(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["critical", "high", "moderate", "low", "info"].includes(normalized)) {
    return normalized;
  }
  return "unknown";
}

function createSeverityCounters() {
  return {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    info: 0,
    unknown: 0
  };
}

function summarizeNpmLikeAuditJson(payload) {
  const counters = createSeverityCounters();

  if (!payload || typeof payload !== "object") {
    return { counters, rawFindings: [], parseError: "Audit JSON output is empty or invalid." };
  }

  const vulnerabilities = payload.vulnerabilities;
  const advisories = payload.advisories;

  if (vulnerabilities && typeof vulnerabilities === "object") {
    for (const [name, issue] of Object.entries(vulnerabilities)) {
      const sev = normalizeSeverity(issue?.severity);
      counters[sev] += 1;
    }
  } else if (advisories && typeof advisories === "object") {
    for (const [, advisory] of Object.entries(advisories)) {
      const sev = normalizeSeverity(advisory?.severity);
      counters[sev] += 1;
    }
  }

  return {
    counters,
    rawFindings: payload,
    parseError: null
  };
}

function summarizeOutdatedPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { packageCount: 0, packages: [] };
  }

  const entries = Object.entries(payload)
    .filter(([, value]) => value && typeof value === "object")
    .map(([name, value]) => ({
      name,
      current: value.current || "",
      wanted: value.wanted || "",
      latest: value.latest || "",
      location: value.location || ""
    }));

  return {
    packageCount: entries.length,
    packages: entries
  };
}

function shouldBlockFromSeverity(counters) {
  return counters.critical > 0 || counters.high > 0;
}

export async function runDependencySecurityCheck({
  cwd = process.cwd(),
  strict = false,
  runCommandImpl = runCommand
} = {}) {
  const resolvedCwd = path.resolve(cwd);
  const detection = await detectPackageManager(resolvedCwd);
  const issues = [];
  const warnings = [];

  const result = {
    cwd: resolvedCwd,
    strict,
    valid: true,
    manager: detection.manager,
    lockfile: detection.lockfile,
    lockfilePresent: detection.lockfilePresent,
    checks: {
      audit: {
        executed: false,
        command: "",
        exitCode: null,
        severity: createSeverityCounters(),
        blocked: false,
        parseError: null,
        stderr: ""
      },
      outdated: {
        executed: false,
        command: "",
        exitCode: null,
        packageCount: 0,
        packages: [],
        parseError: null,
        stderr: ""
      }
    },
    issues,
    warnings
  };

  if (!detection.hasPackageJson) {
    warnings.push("No package.json found; dependency checks were skipped.");
    return result;
  }

  if (!detection.lockfilePresent) {
    const message = "Dependency security check requires a lockfile (pnpm-lock.yaml, yarn.lock, npm-shrinkwrap.json, or package-lock.json).";
    if (strict) {
      issues.push(message);
      result.valid = false;
    } else {
      warnings.push(message);
    }
    return result;
  }

  const managerInfo = PACKAGE_MANAGERS[detection.manager];
  const [auditCommand, auditArgs] = managerInfo.auditCmd;
  const [outdatedCommand, outdatedArgs] = managerInfo.outdatedCmd;

  result.checks.audit.executed = true;
  result.checks.audit.command = `${auditCommand} ${auditArgs.join(" ")}`;

  const auditRun = await runCommandImpl(auditCommand, auditArgs, { cwd: resolvedCwd });
  result.checks.audit.exitCode = auditRun.exitCode;
  result.checks.audit.stderr = auditRun.stderr;

  const auditPayload = extractFirstJsonObject(auditRun.stdout);
  const auditSummary = summarizeNpmLikeAuditJson(auditPayload);
  result.checks.audit.severity = auditSummary.counters;
  result.checks.audit.parseError = auditSummary.parseError;

  if (auditSummary.parseError) {
    if (strict) {
      issues.push(`Could not parse audit JSON output for ${detection.manager}.`);
      result.valid = false;
    } else {
      warnings.push(`Could not parse audit JSON output for ${detection.manager}.`);
    }
  }

  if (shouldBlockFromSeverity(auditSummary.counters)) {
    const message = "Audit reported high/critical dependency vulnerabilities.";
    result.checks.audit.blocked = true;
    if (strict) {
      issues.push(message);
      result.valid = false;
    } else {
      warnings.push(message);
    }
  }

  if (auditRun.exitCode !== 0 && !result.checks.audit.blocked) {
    const message = `Audit command exited with code ${auditRun.exitCode}.`;
    if (strict) {
      issues.push(message);
      result.valid = false;
    } else {
      warnings.push(message);
    }
  }

  result.checks.outdated.executed = true;
  result.checks.outdated.command = `${outdatedCommand} ${outdatedArgs.join(" ")}`;

  const outdatedRun = await runCommandImpl(outdatedCommand, outdatedArgs, { cwd: resolvedCwd });
  result.checks.outdated.exitCode = outdatedRun.exitCode;
  result.checks.outdated.stderr = outdatedRun.stderr;

  const outdatedPayload = extractFirstJsonObject(outdatedRun.stdout);
  const outdatedSummary = summarizeOutdatedPayload(outdatedPayload);
  result.checks.outdated.packageCount = outdatedSummary.packageCount;
  result.checks.outdated.packages = outdatedSummary.packages;

  if (outdatedRun.exitCode !== 0 && outdatedRun.exitCode !== 1 && outdatedRun.exitCode !== null) {
    warnings.push(`Outdated command exited with code ${outdatedRun.exitCode}.`);
  }

  return result;
}

function formatSummary(result) {
  const audit = result.checks.audit;
  const outdated = result.checks.outdated;

  const summary = renderer.section(
    "Dependency Security",
    renderer.kv([
      ["Project", result.cwd],
      ["Strict mode", result.strict ? "yes" : "no"],
      ["Package manager", result.manager || "none"],
      ["Lockfile", result.lockfile || "missing"],
      ["High vulnerabilities", String(audit.severity.high)],
      ["Critical vulnerabilities", String(audit.severity.critical)],
      ["Outdated packages", String(outdated.packageCount)]
    ])
  );

  const issuesBlock = result.issues.length
    ? renderer.section("Blocking Issues", renderer.list(result.issues, { bullet: "-" }))
    : "";

  const warningsBlock = result.warnings.length
    ? renderer.section("Warnings", renderer.list(result.warnings, { bullet: "-" }))
    : "";

  return renderer.joinBlocks([
    result.valid
      ? renderer.status("success", "Dependency security check passed.")
      : renderer.status("error", "Dependency security check failed."),
    summary,
    issuesBlock,
    warningsBlock
  ]);
}

const isEntryPoint = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const jsonRequested = process.argv.includes("--json");

  try {
    const flags = parseArgs(process.argv.slice(2));
    if (flags.help) {
      printHelp();
    } else {
      const result = await runDependencySecurityCheck({ cwd: flags.cwd, strict: flags.strict });
      if (flags.json) {
        renderer.writeJson({
          command: "dependency-security-check",
          ...result
        });
      } else {
        renderer.write(formatSummary(result));
      }

      if (!result.valid) {
        process.exitCode = 1;
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "dependency-security-check failed",
          why: error.message,
          hint: "Run `node scripts/dependency-security-check.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "dependency-security-check failed",
        why: error.message,
        hint: "Ensure your package manager is installed and a lockfile exists.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
