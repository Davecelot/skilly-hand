import test from "node:test";
import assert from "node:assert/strict";
import { lstat, readdir } from "node:fs/promises";
import { checkSkillsOverlay } from "../scripts/sync-skills-overlay.mjs";

test("skills.sh overlay contains real directories matching the canonical catalog", async () => {
  const result = await checkSkillsOverlay();
  assert.deepEqual(result.issues, []);

  const entries = await readdir(new URL("../skills/", import.meta.url), { withFileTypes: true });
  assert.equal(entries.length, 20);

  for (const entry of entries) {
    const metadata = await lstat(new URL(`../skills/${entry.name}`, import.meta.url));
    assert.equal(metadata.isSymbolicLink(), false, `${entry.name} must not be a symlink`);
    assert.equal(metadata.isDirectory(), true, `${entry.name} must be a directory`);
  }
});
