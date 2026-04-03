import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cliPath = path.resolve("packages/cli/src/bin.js");
const fixturesDir = path.resolve("tests/fixtures");

function runCli(args, options = {}) {
  return spawnSync("node", [cliPath, ...args], {
    cwd: options.cwd || process.cwd(),
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" }
  });
}

test("help output is structured and includes JSON mode", () => {
  const result = runCli(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage/);
  assert.match(result.stdout, /Flags/);
  assert.match(result.stdout, /--json/);
});

test("detect command supports --json output", () => {
  const result = runCli(["detect", "--cwd", path.join(fixturesDir, "react-vite"), "--json"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "detect");
  assert.equal(payload.cwd.endsWith("react-vite"), true);
  assert.equal(Array.isArray(payload.detections), true);
  assert.equal(payload.count > 0, true);
});

test("install dry-run provides structured text output", () => {
  const result = runCli(["install", "--dry-run", "--cwd", path.join(fixturesDir, "react-vite")]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Install Preflight/);
  assert.match(result.stdout, /Skill Plan/);
  assert.match(result.stdout, /Dry run complete/);
});

test("doctor defaults to human-readable output", () => {
  const result = runCli(["doctor", "--cwd", path.join(fixturesDir, "node-basic")]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Doctor Summary/);
  assert.match(result.stdout, /Project Probes/);
  assert.equal(result.stdout.trim().startsWith("{"), false);
});

test("command errors emit JSON payload when --json is set", () => {
  const result = runCli(["unknown-command", "--json"]);
  assert.equal(result.status, 1);
  const payload = JSON.parse(result.stderr);
  assert.equal(payload.ok, false);
  assert.match(payload.error.why, /Unknown command/);
});
