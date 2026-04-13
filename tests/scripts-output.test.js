import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

function runScript(scriptPath, args = [], options = {}) {
  return spawnSync("node", [path.resolve(scriptPath), ...args], {
    cwd: options.cwd || process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      NO_COLOR: "1",
      ...(options.env || {})
    }
  });
}

test("check-catalog exposes --json contract", () => {
  const result = runScript("scripts/check-catalog.mjs", ["--json"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "check-catalog");
  assert.equal(typeof payload.valid, "boolean");
  assert.equal(Array.isArray(payload.issues), true);
});

test("build-catalog-index exposes --json contract", () => {
  const result = runScript("scripts/build-catalog-index.mjs", ["--json"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "build-catalog-index");
  assert.equal(typeof payload.count, "number");
  assert.equal(Array.isArray(payload.entries), true);
});

test("sync-catalog exposes --json contract", () => {
  const result = runScript("scripts/sync-catalog.mjs", ["--json", "--check"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "sync-catalog");
  assert.equal(payload.checkOnly, true);
  assert.equal(typeof payload.readmeChanged, "boolean");
  assert.equal(typeof payload.skillCount, "number");
  assert.equal(Array.isArray(payload.updatedSkillIds), true);
  assert.equal(Array.isArray(payload.changedFiles), true);
});

test("sync-skill-frontmatter exposes --json contract", () => {
  const result = runScript("scripts/sync-skill-frontmatter.mjs", ["--json", "--check"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "sync-skill-frontmatter");
  assert.equal(payload.checkOnly, true);
  assert.equal(typeof payload.skillCount, "number");
  assert.equal(Array.isArray(payload.updatedSkillIds), true);
});

test("sync-skill-frontmatter supports --skill filter", () => {
  const result = runScript("scripts/sync-skill-frontmatter.mjs", ["--json", "--check", "--skill", "token-optimizer"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "sync-skill-frontmatter");
  assert.equal(payload.checkOnly, true);
  assert.equal(payload.skillCount, 1);
  assert.equal(Array.isArray(payload.updatedSkillIds), true);
});

test("verify-packlist exposes --json contract", async () => {
  const npmCache = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-npm-cache-"));
  const result = runScript("scripts/verify-packlist.mjs", ["--json"], {
    env: { npm_config_cache: npmCache }
  });

  const raw = (result.stdout || "").trim() || (result.stderr || "").trim();
  assert.equal(raw.length > 0, true);
  const payload = JSON.parse(raw);

  if (result.status === 0) {
    assert.equal(payload.command, "verify-packlist");
    assert.equal(typeof payload.valid, "boolean");
    assert.equal(Array.isArray(payload.packedPaths), true);
  } else {
    assert.equal(payload.ok, false);
    assert.equal(typeof payload.error?.why, "string");
  }
});

test("release-changelog supports JSON success output", async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-release-"));
  const changelogPath = path.join(tmpDir, "CHANGELOG.md");
  const packageJsonPath = path.join(tmpDir, "package.json");

  await writeFile(
    changelogPath,
    `# Changelog

## [Unreleased]

### Added
- Added machine-readable output.

### Changed
- _None._

### Fixed
- _None._

### Removed
- _None._
`,
    "utf8"
  );

  await writeFile(packageJsonPath, JSON.stringify({ name: "tmp-package", version: "1.2.3" }, null, 2) + "\n", "utf8");

  const result = runScript("scripts/release-changelog.mjs", [
    "--json",
    "--no-stage",
    "--changelog",
    changelogPath,
    "--package-json",
    packageJsonPath
  ]);

  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "release-changelog");
  assert.equal(payload.version, "1.2.3");
});

test("security-check exposes --json contract", () => {
  const result = runScript("scripts/security-check.mjs", ["--json"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "security-check");
  assert.equal(typeof payload.valid, "boolean");
  assert.equal(Array.isArray(payload.violations), true);
  assert.equal(typeof payload.dependencySecurity, "object");
});

test("dependency-security-check exposes --json contract", () => {
  const result = runScript("scripts/dependency-security-check.mjs", ["--json"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "dependency-security-check");
  assert.equal(typeof payload.valid, "boolean");
  assert.equal(typeof payload.checks, "object");
});

test("dependency-policy-check exposes --json contract", () => {
  const result = runScript("scripts/dependency-policy-check.mjs", ["--json"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "dependency-policy-check");
  assert.equal(typeof payload.valid, "boolean");
  assert.equal(typeof payload.lockfilesSynchronized, "boolean");
});

test("review-rangers-check exposes --json contract", () => {
  const result = runScript("scripts/review-rangers-check.mjs", ["--json"]);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "review-rangers-check");
  assert.equal(typeof payload.ok, "boolean");
  assert.equal(typeof payload.criticalCount, "number");
  assert.equal(typeof payload.highCount, "number");
  assert.equal(typeof payload.checks, "object");
});

test("publish-with-otp provides non-interactive OTP guidance in JSON mode", async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-publish-"));
  const fakeNpmPath = path.join(tmpDir, "npm");
  const fakeNpmCmdPath = path.join(tmpDir, "npm.cmd");

  const fakeNpmScript = `#!/usr/bin/env node
const args = process.argv.slice(2);
if (args[0] === "run" && args[1] === "publish:prepare") process.exit(0);
if (args[0] === "publish") {
  if (args.includes("--otp")) process.exit(0);
  console.error("EOTP: OTP required");
  process.exit(1);
}
process.exit(0);
`;

  await writeFile(fakeNpmPath, fakeNpmScript, "utf8");
  await chmod(fakeNpmPath, 0o755);
  await writeFile(fakeNpmCmdPath, "@echo off\r\nnode \"%~dp0\\npm\" %*\r\n", "utf8");

  const result = runScript("scripts/publish-with-otp.mjs", ["--json"], {
    env: { PATH: `${tmpDir}${path.delimiter}${process.env.PATH || ""}` }
  });

  assert.equal(result.status, 1);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.command, "publish-with-otp");
  assert.equal(payload.ok, false);
  assert.equal(payload.phase, "publish");
  assert.match(payload.hint, /non-interactive/i);
  assert.equal(Array.isArray(payload.warnings), true);
  assert.equal(payload.warnings.length > 0, true);
});
