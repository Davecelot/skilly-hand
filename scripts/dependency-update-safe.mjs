import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const renderer = createTerminalRenderer();

function parseArgs(argv) {
  const flags = {
    json: false,
    help: false,
    cwd: process.cwd(),
    specs: []
  };

  const args = [...argv];
  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") flags.json = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else if (token === "--cwd") {
      const value = args.shift();
      if (!value || value.startsWith("-")) throw new Error("Missing value for --cwd");
      flags.cwd = value;
    } else {
      flags.specs.push(token);
    }
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "dependency-update-safe"),
    renderer.section("Usage", renderer.list([
      "node scripts/dependency-update-safe.mjs [--json] [--cwd <path>] <pkg[@version]> ..."
    ], { bullet: "-" })),
    renderer.section("Description", "Updates dependencies with exact pins, synchronizes npm-shrinkwrap.json, and blocks completion unless security/tests/publish gates pass.")
  ]));
}

function runCommand(command, args, options = {}) {
  const { cwd, timeoutMs = 300000 } = options;
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

export async function syncShrinkwrapFromLockfile({ cwd = process.cwd() } = {}) {
  const resolvedCwd = path.resolve(cwd);
  const lockPath = path.join(resolvedCwd, "package-lock.json");
  const shrinkwrapPath = path.join(resolvedCwd, "npm-shrinkwrap.json");
  const lockRaw = await readFile(lockPath, "utf8");
  const lockData = JSON.parse(lockRaw);
  await writeFile(shrinkwrapPath, `${JSON.stringify(lockData, null, 2)}\n`, "utf8");
  return {
    lockPath,
    shrinkwrapPath
  };
}

export async function runDependencyUpdateSafe({
  cwd = process.cwd(),
  specs = [],
  runCommandImpl = runCommand
} = {}) {
  const resolvedCwd = path.resolve(cwd);
  const normalizedSpecs = specs.map((spec) => String(spec || "").trim()).filter(Boolean);
  if (normalizedSpecs.length === 0) {
    throw new Error("Provide at least one dependency spec, e.g. react@18.3.1");
  }

  const steps = [
    {
      phase: "install",
      command: "npm",
      args: ["install", "--save-exact", ...normalizedSpecs]
    },
    {
      phase: "lockfile",
      command: "npm",
      args: ["install", "--package-lock-only", "--ignore-scripts"]
    }
  ];

  const commandLog = [];
  for (const step of steps) {
    const run = await runCommandImpl(step.command, step.args, { cwd: resolvedCwd });
    commandLog.push({
      phase: step.phase,
      command: `${step.command} ${step.args.join(" ")}`,
      exitCode: run.exitCode
    });
    if (run.exitCode !== 0) {
      return {
        ok: false,
        cwd: resolvedCwd,
        specs: normalizedSpecs,
        failedPhase: step.phase,
        commands: commandLog,
        hint: "Dependency update was blocked. Restore package.json, package-lock.json, and npm-shrinkwrap.json from git, then retry."
      };
    }
  }

  await syncShrinkwrapFromLockfile({ cwd: resolvedCwd });

  const verificationSteps = [
    {
      phase: "policy",
      command: "npm",
      args: ["run", "deps:policy:check"]
    },
    {
      phase: "security",
      command: "npm",
      args: ["run", "security:check"]
    },
    {
      phase: "test",
      command: "npm",
      args: ["test"]
    },
    {
      phase: "publish-gate",
      command: "npm",
      args: ["run", "verify:publish"]
    }
  ];

  for (const step of verificationSteps) {
    const run = await runCommandImpl(step.command, step.args, { cwd: resolvedCwd });
    commandLog.push({
      phase: step.phase,
      command: `${step.command} ${step.args.join(" ")}`,
      exitCode: run.exitCode
    });
    if (run.exitCode !== 0) {
      return {
        ok: false,
        cwd: resolvedCwd,
        specs: normalizedSpecs,
        failedPhase: step.phase,
        commands: commandLog,
        hint: "Validation failed after dependency changes. Restore package.json, package-lock.json, and npm-shrinkwrap.json from git, then investigate."
      };
    }
  }

  return {
    ok: true,
    cwd: resolvedCwd,
    specs: normalizedSpecs,
    commands: commandLog
  };
}

const isEntryPoint = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const jsonRequested = process.argv.includes("--json");

  try {
    const flags = parseArgs(process.argv.slice(2));
    if (flags.help) {
      printHelp();
    } else {
      const result = await runDependencyUpdateSafe({
        cwd: flags.cwd,
        specs: flags.specs
      });

      if (flags.json) {
        renderer.writeJson({
          command: "dependency-update-safe",
          ...result
        });
      } else if (result.ok) {
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "Dependency update passed all validation gates."),
          renderer.kv([
            ["Project", result.cwd],
            ["Updated specs", result.specs.join(", ")],
            ["Commands executed", String(result.commands.length)]
          ])
        ]));
      } else {
        renderer.writeError(renderer.joinBlocks([
          renderer.status("error", `Dependency update blocked during ${result.failedPhase}.`),
          result.hint
        ]));
      }

      if (!result.ok) {
        process.exitCode = 1;
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "dependency-update-safe failed",
          why: error.message,
          hint: "Run `node scripts/dependency-update-safe.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "dependency-update-safe failed",
        why: error.message,
        hint: "Use at least one dependency spec, for example `npm run deps:update:safe -- react@18.3.1`.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
