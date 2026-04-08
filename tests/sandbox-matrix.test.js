import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { runSandboxMatrixTests } from "../scripts/test-in-sandbox.mjs";

test("sandbox matrix scenarios pass", { timeout: 180000 }, async () => {
  const repoRoot = path.resolve(".");
  const result = await runSandboxMatrixTests({ repoRoot });

  assert.equal(result.ok, true);
  assert.equal(result.total, 10);
  assert.deepEqual(
    result.results.map((item) => item.ok),
    Array(result.total).fill(true)
  );
});
