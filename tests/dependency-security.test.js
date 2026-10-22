import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, writeFile } from "node:fs/promises";
import { runDependencySecurityCheck } from "../scripts/dependency-security-check.mjs";

async function makeProject({ lockfile = "package-lock.json" } = {}) {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-deps-"));
  await writeFile(path.join(tmpDir, "package.json"), JSON.stringify({ name: "tmp", version: "1.0.0" }, null, 2), "utf8");
  if (lockfile) {
    await writeFile(path.join(tmpDir, lockfile), "{}\n", "utf8");
  }
  return tmpDir;
}

test("dependency check warns in non-strict mode for high vulnerabilities", async () => {
  const cwd = await makeProject({ lockfile: "package-lock.json" });

  const result = await runDependencySecurityCheck({
    cwd,
    strict: false,
    runCommandImpl: async (command) => {
      if (command === "npm") {
        return {
          exitCode: 1,
          stdout: JSON.stringify({ vulnerabilities: { lodash: { severity: "high" } } }),
          stderr: ""
        };
      }
      return { exitCode: 0, stdout: JSON.stringify({}), stderr: "" };
    }
  });

  assert.equal(result.valid, true);
  assert.equal(result.checks.audit.severity.high, 1);
  assert.equal(result.warnings.some((w) => /high\/critical/.test(w)), true);
});

test("dependency check blocks in strict mode for high vulnerabilities", async () => {
  const cwd = await makeProject({ lockfile: "package-lock.json" });

  const result = await runDependencySecurityCheck({
    cwd,
    strict: true,
    runCommandImpl: async (command) => {
      if (command === "npm") {
        return {
          exitCode: 1,
          stdout: JSON.stringify({ vulnerabilities: { react: { severity: "critical" } } }),
          stderr: ""
        };
      }
      return { exitCode: 0, stdout: JSON.stringify({}), stderr: "" };
    }
  });

  assert.equal(result.valid, false);
  assert.equal(result.checks.audit.severity.critical, 1);
  assert.equal(result.issues.some((issue) => /high\/critical/.test(issue)), true);
});

test("pnpm strict checks include vulnerable development dependencies", async () => {
  const cwd = await makeProject({ lockfile: "pnpm-lock.yaml" });

  const result = await runDependencySecurityCheck({
    cwd,
    strict: true,
    runCommandImpl: async (command, args) => {
      if (command === "pnpm" && args[0] === "audit") {
        // A production-only audit hides this development-server vulnerability.
        const vulnerabilities = args.includes("--prod")
          ? {}
          : { vite: { severity: "high" } };
        return { exitCode: Object.keys(vulnerabilities).length ? 1 : 0,
          stdout: JSON.stringify({ vulnerabilities }), stderr: "" };
      }
      return { exitCode: 0, stdout: "{}", stderr: "" };
    }
  });

  assert.equal(result.valid, false);
  assert.equal(result.checks.audit.severity.high, 1);
  assert.equal(result.checks.audit.blocked, true);
});

test("dependency check fails closed in strict mode when lockfile is missing", async () => {
  const cwd = await makeProject({ lockfile: null });

  const result = await runDependencySecurityCheck({
    cwd,
    strict: true,
    runCommandImpl: async () => ({ exitCode: 0, stdout: "{}", stderr: "" })
  });

  assert.equal(result.valid, false);
  assert.equal(result.lockfilePresent, false);
  assert.equal(result.issues.some((issue) => /lockfile/.test(issue)), true);
});

test("dependency check accepts npm-shrinkwrap lockfile for npm projects", async () => {
  const cwd = await makeProject({ lockfile: "npm-shrinkwrap.json" });

  const result = await runDependencySecurityCheck({
    cwd,
    strict: true,
    runCommandImpl: async () => ({ exitCode: 0, stdout: "{}", stderr: "" })
  });

  assert.equal(result.valid, true);
  assert.equal(result.manager, "npm");
  assert.equal(result.lockfile, "npm-shrinkwrap.json");
  assert.equal(result.lockfilePresent, true);
});
