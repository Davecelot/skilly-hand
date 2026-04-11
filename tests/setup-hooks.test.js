import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { setupHooks } from "../scripts/setup-hooks.mjs";

async function makeRepo() {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-hooks-"));
  const gitDir = path.join(tmpDir, ".git");
  await mkdir(path.join(gitDir, "hooks"), { recursive: true });
  await writeFile(path.join(gitDir, "HEAD"), "ref: refs/heads/main\n", "utf8");
  return tmpDir;
}

test("setup-hooks installs both pre-commit and pre-push hooks", async () => {
  const cwd = await makeRepo();
  const result = await setupHooks({ cwd });
  assert.deepEqual(result.hookPaths.sort(), [".git/hooks/pre-commit", ".git/hooks/pre-push"]);

  const preCommit = await readFile(path.join(cwd, ".git/hooks/pre-commit"), "utf8");
  const prePush = await readFile(path.join(cwd, ".git/hooks/pre-push"), "utf8");

  assert.match(preCommit, /verify:versions --silent/);
  assert.match(preCommit, /deps:policy:check --silent/);
  assert.match(prePush, /verify:publish --silent/);
  assert.match(prePush, /deps:policy:check --silent/);
});

test("setup-hooks is idempotent and preserves executable mode", async () => {
  const cwd = await makeRepo();
  await setupHooks({ cwd });
  await setupHooks({ cwd });

  const preCommitStats = await stat(path.join(cwd, ".git/hooks/pre-commit"));
  const prePushStats = await stat(path.join(cwd, ".git/hooks/pre-push"));

  assert.equal(Boolean(preCommitStats.mode & 0o100), true);
  assert.equal(Boolean(prePushStats.mode & 0o100), true);
});

test("setup-hooks respects foreign existing hooks unless forced", async () => {
  const cwd = await makeRepo();
  await writeFile(path.join(cwd, ".git/hooks/pre-push"), "#!/bin/sh\necho custom\n", "utf8");

  await assert.rejects(
    () => setupHooks({ cwd }),
    /pre-push hook already exists/
  );

  const forced = await setupHooks({ cwd, force: true });
  assert.deepEqual(forced.hookPaths.sort(), [".git/hooks/pre-commit", ".git/hooks/pre-push"]);
});
