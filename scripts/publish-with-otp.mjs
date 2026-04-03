#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import readline from "node:readline";
import process from "node:process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const tag = parseTag(process.argv.slice(2));

const prepareResult = runCommand(npmCommand, ["run", "publish:prepare"]);
if (prepareResult.status !== 0) {
  process.exit(prepareResult.status ?? 1);
}

const otp = await promptHidden(
  "Enter npm OTP (leave empty to use your default npm security method): ",
);

const publishArgs = ["publish"];
if (tag) {
  publishArgs.push("--tag", tag);
}
if (otp) {
  publishArgs.push("--otp", otp);
}

const publishResult = runCommand(npmCommand, publishArgs);
if (publishResult.status !== 0) {
  console.error(
    "Publish failed. Confirm your 2FA code or complete your configured npm security verification, then retry.",
  );
  process.exit(publishResult.status ?? 1);
}

function parseTag(args) {
  const tagFlagIndex = args.indexOf("--tag");
  if (tagFlagIndex >= 0) {
    const tagValue = args[tagFlagIndex + 1];
    if (!tagValue || tagValue.startsWith("--")) {
      console.error("Missing value for --tag. Example: --tag next");
      process.exit(1);
    }
    return tagValue;
  }

  return null;
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`Failed to run '${command} ${args.join(" ")}':`, result.error.message);
    process.exit(1);
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
