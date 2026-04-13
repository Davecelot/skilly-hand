import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { runDependencyPolicyCheck } from "../scripts/dependency-policy-check.mjs";

async function makeProject({
  deps = { react: "18.3.1" },
  withShrinkwrap = true,
  shrinkwrapContent = null
} = {}) {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-deps-policy-"));
  await writeFile(path.join(tmpDir, "package.json"), JSON.stringify({
    name: "tmp",
    version: "1.0.0",
    dependencies: deps
  }, null, 2), "utf8");

  const lockData = {
    name: "tmp",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": {
        name: "tmp",
        version: "1.0.0",
        dependencies: deps
      }
    }
  };

  await writeFile(path.join(tmpDir, "package-lock.json"), `${JSON.stringify(lockData, null, 2)}\n`, "utf8");
  if (withShrinkwrap) {
    const content = shrinkwrapContent ?? lockData;
    await writeFile(path.join(tmpDir, "npm-shrinkwrap.json"), `${JSON.stringify(content, null, 2)}\n`, "utf8");
  }

  return tmpDir;
}

test("dependency policy check fails on ranged runtime dependencies", async () => {
  const cwd = await makeProject({ deps: { react: "^18.3.1" } });
  const result = await runDependencyPolicyCheck({ cwd });
  assert.equal(result.valid, false);
  assert.equal(result.issues.some((issue) => /exact versions/i.test(issue)), true);
});

test("dependency policy check fails when npm-shrinkwrap.json is missing", async () => {
  const cwd = await makeProject({ withShrinkwrap: false });
  const result = await runDependencyPolicyCheck({ cwd });
  assert.equal(result.valid, false);
  assert.equal(result.issues.some((issue) => /npm-shrinkwrap\.json is required/.test(issue)), true);
});

test("dependency policy check passes with exact versions and synced lockfiles", async () => {
  const cwd = await makeProject({ deps: { inquirer: "13.4.1" } });
  const result = await runDependencyPolicyCheck({ cwd });
  assert.equal(result.valid, true);
  assert.equal(result.lockfilesSynchronized, true);
  assert.equal(result.issues.length, 0);
});

test("dependency policy check fails when lockfiles are not synchronized", async () => {
  const cwd = await makeProject({
    deps: { react: "18.3.1" },
    shrinkwrapContent: {
      name: "tmp",
      version: "1.0.0",
      lockfileVersion: 3,
      packages: {}
    }
  });
  const result = await runDependencyPolicyCheck({ cwd });
  assert.equal(result.valid, false);
  assert.equal(result.lockfilesSynchronized, false);
  assert.equal(result.issues.some((issue) => /out of sync/.test(issue)), true);
});

test("runtime dependencies do not include react or ink", async () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = path.resolve(here, "../package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const deps = packageJson.dependencies || {};

  assert.equal(Boolean(deps.react), false);
  assert.equal(Boolean(deps.ink), false);
  assert.equal(typeof deps.inquirer, "string");
});
