import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { runDependencyUpdateSafe } from "../scripts/dependency-update-safe.mjs";

async function makeProject() {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-deps-update-"));
  await writeFile(path.join(tmpDir, "package.json"), JSON.stringify({
    name: "tmp",
    version: "1.0.0",
    dependencies: {
      react: "18.3.1"
    }
  }, null, 2), "utf8");
  await writeFile(path.join(tmpDir, "package-lock.json"), JSON.stringify({
    name: "tmp",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": {
        name: "tmp",
        version: "1.0.0",
        dependencies: {
          react: "18.3.1"
        }
      }
    }
  }, null, 2), "utf8");
  return tmpDir;
}

test("dependency update safe runs install and full validation gates", async () => {
  const cwd = await makeProject();
  const calls = [];

  const result = await runDependencyUpdateSafe({
    cwd,
    specs: ["react@18.3.1"],
    runCommandImpl: async (command, args) => {
      calls.push([command, ...args].join(" "));
      return { exitCode: 0, stdout: "", stderr: "" };
    }
  });

  assert.equal(result.ok, true);
  assert.deepEqual(calls, [
    "npm install --save-exact react@18.3.1",
    "npm install --package-lock-only --ignore-scripts",
    "npm run deps:policy:check",
    "npm run security:check",
    "npm test",
    "npm run verify:publish"
  ]);
});

test("dependency update safe fails closed when a validation phase fails", async () => {
  const cwd = await makeProject();

  const result = await runDependencyUpdateSafe({
    cwd,
    specs: ["react@18.3.1"],
    runCommandImpl: async (command, args) => {
      const rendered = [command, ...args].join(" ");
      if (rendered === "npm test") {
        return { exitCode: 1, stdout: "", stderr: "tests failed" };
      }
      return { exitCode: 0, stdout: "", stderr: "" };
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.failedPhase, "test");
  assert.equal(typeof result.hint, "string");
  assert.match(result.hint, /restore/i);
});

test("dependency update safe synchronizes npm-shrinkwrap from package-lock", async () => {
  const cwd = await makeProject();

  const result = await runDependencyUpdateSafe({
    cwd,
    specs: ["react@18.3.1"],
    runCommandImpl: async () => ({ exitCode: 0, stdout: "", stderr: "" })
  });

  assert.equal(result.ok, true);
  const lockRaw = await readFile(path.join(cwd, "package-lock.json"), "utf8");
  const shrinkRaw = await readFile(path.join(cwd, "npm-shrinkwrap.json"), "utf8");
  assert.deepEqual(JSON.parse(shrinkRaw), JSON.parse(lockRaw));
});
