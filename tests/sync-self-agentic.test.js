import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { cp, mkdir, mkdtemp, readFile } from "node:fs/promises";
import { syncSelfAgentic } from "../scripts/sync-self-agentic.mjs";

const repoRoot = path.resolve(".");

async function makeSandboxRepo() {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), "skilly-hand-sync-"));
  const sandbox = path.join(tmpRoot, "repo");
  await mkdir(sandbox, { recursive: true });
  await cp(path.join(repoRoot, "catalog"), path.join(sandbox, "catalog"), { recursive: true });
  await cp(path.join(repoRoot, "package.json"), path.join(sandbox, "package.json"));
  return sandbox;
}

test("sync-self-agentic generates managed files and is idempotent", async () => {
  const sandbox = await makeSandboxRepo();
  const first = await syncSelfAgentic({ cwd: sandbox });

  assert.equal(first.writtenFiles.includes("AGENTS.md"), true);
  assert.deepEqual(first.writtenFiles, ["AGENTS.md"]);

  const agents = await readFile(path.join(sandbox, "AGENTS.md"), "utf8");

  assert.match(agents, /SDD-first policy/);
  assert.match(agents, /### SDD-First Delivery Workflow/);

  const second = await syncSelfAgentic({ cwd: sandbox });
  assert.deepEqual(second.writtenFiles, []);
});
