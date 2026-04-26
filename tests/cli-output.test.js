import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cliPath = path.resolve("packages/cli/src/bin.js");
const fixturesDir = path.resolve("tests/fixtures");
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

function runCli(args, options = {}) {
  const env = {
    ...process.env,
    NO_COLOR: "1",
    NODE_NO_WARNINGS: "1",
    ...options.env
  };

  // Keep tests deterministic even if the parent shell exports NODE_OPTIONS.
  if (!options.env || !Object.prototype.hasOwnProperty.call(options.env, "NODE_OPTIONS")) {
    delete env.NODE_OPTIONS;
  }

  return spawnSync("node", [cliPath, ...args], {
    cwd: options.cwd || process.cwd(),
    encoding: "utf8",
    env
  });
}

function parseJsonPayload(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}\s*$/);
    if (!match) {
      throw new SyntaxError(`Could not find JSON payload in output:\n${raw}`);
    }
    return JSON.parse(match[0]);
  }
}

function maxVisibleLineLength(block) {
  return String(block)
    .split("\n")
    .reduce((max, line) => Math.max(max, line.replace(ANSI_PATTERN, "").length), 0);
}

test("help output is structured and includes JSON mode", () => {
  const result = runCli(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage/);
  assert.match(result.stdout, /Commands/);
  assert.match(result.stdout, /Flags/);
  assert.match(result.stdout, /--json/);
  assert.match(result.stdout, /Install portable skills into the current project/);
  assert.match(result.stdout, /antigravity/);
  assert.match(result.stdout, /windsurf/);
  assert.match(result.stdout, /trae/);
  assert.match(result.stdout, /skilly-hand/);
  assert.doesNotMatch(result.stdout, /autoskills/);
});

test("detect command supports --json output", () => {
  const result = runCli(["detect", "--cwd", path.join(fixturesDir, "react-vite"), "--json"]);
  assert.equal(result.status, 0);
  const payload = parseJsonPayload(result.stdout);
  assert.equal(payload.command, "detect");
  assert.equal(payload.cwd.endsWith("react-vite"), true);
  assert.equal(Array.isArray(payload.detections), true);
  assert.equal(payload.count > 0, true);
});

test("install dry-run provides structured text output", () => {
  const result = runCli(["install", "--dry-run", "--cwd", path.join(fixturesDir, "react-vite")]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Install Preflight/);
  assert.match(result.stdout, /Decisions registry/);
  assert.match(result.stdout, /\.ai\/DECISIONS\.md \(will create\)/);
  assert.match(result.stdout, /Skill Plan/);
  assert.match(result.stdout, /Dry run complete/);
});

test("native setup dry-run provides structured text output", () => {
  const result = runCli(["native", "setup", "--dry-run", "--cwd", path.join(fixturesDir, "react-vite")]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Native Setup Preflight/);
  assert.match(result.stdout, /Native Coverage/);
  assert.match(result.stdout, /dry run complete/i);
});

test("native setup supports --json output", () => {
  const result = runCli(["native", "setup", "--dry-run", "--cwd", path.join(fixturesDir, "react-vite"), "--json"]);
  assert.equal(result.status, 0);
  const payload = parseJsonPayload(result.stdout);
  assert.equal(payload.command, "native setup");
  assert.equal(Array.isArray(payload.nativeStatus), true);
});

test("non-interactive no-command invocation defaults to install output", () => {
  const result = runCli(["--dry-run", "--cwd", path.join(fixturesDir, "react-vite")]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Install Preflight/);
  assert.doesNotMatch(result.stdout, /Select a command/);
});

test("doctor defaults to human-readable output", () => {
  const result = runCli(["doctor", "--cwd", path.join(fixturesDir, "node-basic")]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Doctor Summary/);
  assert.match(result.stdout, /Project Probes/);
  assert.equal(result.stdout.trim().startsWith("{"), false);
});

test("list output adapts to constrained terminal width", () => {
  const result = runCli(["list"], {
    env: { COLUMNS: "72" }
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Skills/);
  assert.equal(maxVisibleLineLength(result.stdout) <= 72, true);
});

test("command errors emit JSON payload when --json is set", () => {
  const result = runCli(["unknown-command", "--json"]);
  assert.equal(result.status, 1);
  const payload = parseJsonPayload(result.stderr);
  assert.equal(payload.ok, false);
  assert.match(payload.error.why, /Unknown command/);
});

test("symlinked CLI entrypoint executes and honors flags", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "skilly-hand-cli-"));
  const symlinkPath = path.join(tmpDir, "skilly-hand.js");
  const env = {
    ...process.env,
    NO_COLOR: "1",
    NODE_NO_WARNINGS: "1"
  };
  delete env.NODE_OPTIONS;

  try {
    fs.symlinkSync(cliPath, symlinkPath, "file");
    const result = spawnSync("node", [
      symlinkPath,
      "install",
      "--dry-run",
      "--json",
      "--cwd",
      path.join(fixturesDir, "react-vite")
    ], {
      cwd: process.cwd(),
      encoding: "utf8",
      env
    });

    assert.equal(result.status, 0);
    const payload = parseJsonPayload(result.stdout);
    assert.equal(payload.command, "install");
    assert.equal(payload.applied, false);
    assert.equal(payload.plan.cwd.endsWith(path.join("fixtures", "react-vite")), true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
