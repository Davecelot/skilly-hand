#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import readline from "node:readline";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTerminalRenderer } from "../packages/core/src/terminal.js";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const renderer = createTerminalRenderer();

function parseArgs(argv) {
  const flags = { json: false };
  const args = [...argv];

  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") flags.json = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else if (token === "--tag") {
      const value = args.shift();
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --tag. Example: --tag next");
      }
      flags.tag = value;
    } else if (token === "--otp") {
      const value = args.shift();
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --otp.");
      }
      flags.otp = value;
    } else {
      throw new Error(`Unknown flag: ${token}`);
    }
  }

  return flags;
}

function printHelp() {
  renderer.write(renderer.joinBlocks([
    renderer.status("info", "publish-with-otp"),
    renderer.section(
      "Usage",
      renderer.list(["node scripts/publish-with-otp.mjs [--tag <name>] [--otp <code>] [--json]"], { bullet: "-" })
    ),
    renderer.section(
      "Flags",
      renderer.list([
        "--tag <name>   npm dist-tag to publish under (example: next)",
        "--otp <code>   One-time password for non-interactive environments",
        "--json         Emit stable JSON output for automation",
        "--help, -h     Show this help output"
      ], { bullet: "-" })
    )
  ]));
}

function runCommand(command, args, { inherit = true } = {}) {
  const result = spawnSync(command, args, {
    env: process.env,
    encoding: "utf8",
    stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
  });

  if (result.error) {
    throw new Error(`Failed to run '${command} ${args.join(" ")}': ${result.error.message}`);
  }

  return result;
}

function promptHidden(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    const originalWrite = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (text) => {
      if (rl.stdoutMuted) {
        return;
      }
      originalWrite(text);
    };

    rl.stdoutMuted = true;
    process.stdout.write(promptText);
    rl.question("", (answer) => {
      rl.history = [];
      rl.close();
      process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

export async function publishWithOtp({
  tag = null,
  otp: otpOverride = null,
  json = false
} = {}) {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const warnings = [];

  const prepareResult = runCommand(npmCommand, ["run", "publish:prepare"], { inherit: !json });
  if (prepareResult.status !== 0) {
    return {
      ok: false,
      phase: "prepare",
      status: prepareResult.status ?? 1,
      tag,
      interactive,
      warnings,
      stderr: (prepareResult.stderr || "").trim(),
      stdout: (prepareResult.stdout || "").trim()
    };
  }

  let otp = otpOverride;
  if (!otp && interactive) {
    otp = await promptHidden(
      "Enter npm OTP (leave empty to use your default npm security method): ",
    );
  } else if (!otp && !interactive) {
    warnings.push(
      "Non-interactive session detected. OTP prompt is unavailable; publish will continue without --otp."
    );
    warnings.push("If your npm account requires OTP, pass `--otp <code>` in CI or run in an interactive terminal.");
  }

  const publishArgs = ["publish"];
  if (tag) {
    publishArgs.push("--tag", tag);
  }
  if (otp) {
    publishArgs.push("--otp", otp);
  }

  const publishResult = runCommand(npmCommand, publishArgs, { inherit: !json });
  if (publishResult.status !== 0) {
    const hint = !interactive && !otp
      ? "Publish may require OTP in non-interactive mode. Provide `--otp <code>` or run from an interactive terminal."
      : "Confirm your 2FA code or complete your configured npm security verification, then retry.";

    return {
      ok: false,
      phase: "publish",
      status: publishResult.status ?? 1,
      tag,
      interactive,
      warnings,
      hint,
      stderr: (publishResult.stderr || "").trim(),
      stdout: (publishResult.stdout || "").trim()
    };
  }

  return {
    ok: true,
    phase: "publish",
    status: 0,
    tag,
    interactive,
    warnings
  };
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntryPoint) {
  const jsonRequested = process.argv.includes("--json");

  try {
    const flags = parseArgs(process.argv.slice(2));

    if (flags.help) {
      printHelp();
    } else {
      const result = await publishWithOtp({
        tag: flags.tag ?? null,
        otp: flags.otp ?? null,
        json: flags.json
      });

      if (flags.json) {
        renderer.writeJson({
          command: "publish-with-otp",
          ...result
        });
        if (!result.ok) {
          process.exitCode = result.status || 1;
        }
      } else if (result.ok) {
        const warnings = result.warnings.length
          ? renderer.section("Warnings", renderer.list(result.warnings))
          : "";
        renderer.write(renderer.joinBlocks([
          renderer.status("success", "npm publish completed."),
          renderer.kv([
            ["Tag", result.tag || "latest"],
            ["Interactive session", result.interactive ? "yes" : "no"]
          ]),
          warnings
        ]));
      } else {
        const details = [
          renderer.status("error", `Publish failed during ${result.phase}.`),
          renderer.kv([
            ["Exit status", String(result.status)],
            ["Tag", result.tag || "latest"],
            ["Interactive session", result.interactive ? "yes" : "no"]
          ]),
          result.warnings.length ? renderer.section("Warnings", renderer.list(result.warnings)) : "",
          result.hint ? renderer.kv([["How to recover", result.hint]]) : ""
        ];
        renderer.writeError(renderer.joinBlocks(details));
        process.exitCode = result.status || 1;
      }
    }
  } catch (error) {
    if (jsonRequested) {
      renderer.writeErrorJson({
        ok: false,
        error: {
          what: "publish-with-otp failed",
          why: error.message,
          hint: "Run `node scripts/publish-with-otp.mjs --help` for usage."
        }
      });
    } else {
      renderer.writeError(renderer.error({
        what: "publish-with-otp failed",
        why: error.message,
        hint: "Run `node scripts/publish-with-otp.mjs --help` for usage.",
        exitCode: 1
      }));
    }
    process.exitCode = 1;
  }
}
