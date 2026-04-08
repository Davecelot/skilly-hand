import test from "node:test";
import assert from "node:assert/strict";
import { syncCatalog } from "../scripts/sync-catalog.mjs";

test("sync-catalog computes all outputs before writing and writes on success", async () => {
  const writes = [];
  const result = await syncCatalog({
    io: {
      planReadme: async () => ({
        readmePath: "/tmp/catalog/README.md",
        changed: true,
        content: "README next"
      }),
      planFrontmatter: async () => ({
        skillCount: 2,
        updatedSkillIds: ["a", "b"],
        updates: [
          { path: "/tmp/catalog/a/SKILL.md", content: "A next" },
          { path: "/tmp/catalog/b/SKILL.md", content: "B next" }
        ]
      }),
      writeTextFile: async (targetPath, content) => {
        writes.push({ targetPath, content });
      }
    }
  });

  assert.equal(writes.length, 3);
  assert.deepEqual(result.changedFiles, ["/tmp/catalog/README.md", "/tmp/catalog/a/SKILL.md", "/tmp/catalog/b/SKILL.md"]);
});

test("sync-catalog does not write anything if planning fails", async () => {
  const writes = [];
  await assert.rejects(
    syncCatalog({
      io: {
        planReadme: async () => ({
          readmePath: "/tmp/catalog/README.md",
          changed: true,
          content: "README next"
        }),
        planFrontmatter: async () => {
          throw new Error("planned failure");
        },
        writeTextFile: async (targetPath, content) => {
          writes.push({ targetPath, content });
        }
      }
    }),
    /planned failure/
  );
  assert.equal(writes.length, 0);
});

test("sync-catalog check mode is non-mutating and idempotent with no changes", async () => {
  const writes = [];
  const result = await syncCatalog({
    checkOnly: true,
    io: {
      planReadme: async () => ({
        readmePath: "/tmp/catalog/README.md",
        changed: false,
        content: "README current"
      }),
      planFrontmatter: async () => ({
        skillCount: 2,
        updatedSkillIds: [],
        updates: []
      }),
      writeTextFile: async (targetPath, content) => {
        writes.push({ targetPath, content });
      }
    }
  });

  assert.equal(writes.length, 0);
  assert.deepEqual(result.changedFiles, []);
  assert.equal(result.readmeChanged, false);
  assert.deepEqual(result.updatedSkillIds, []);
});

test("sync-catalog rolls back applied writes when a later write fails", async () => {
  const files = new Map([
    ["/tmp/catalog/README.md", "README old"],
    ["/tmp/catalog/a/SKILL.md", "A old"]
  ]);

  let writeAttempt = 0;
  await assert.rejects(
    syncCatalog({
      io: {
        planReadme: async () => ({
          readmePath: "/tmp/catalog/README.md",
          changed: true,
          content: "README new"
        }),
        planFrontmatter: async () => ({
          skillCount: 1,
          updatedSkillIds: ["a"],
          updates: [
            { path: "/tmp/catalog/a/SKILL.md", content: "A new" }
          ]
        }),
        readTextFile: async (targetPath) => {
          if (!files.has(targetPath)) {
            const error = new Error("missing");
            error.code = "ENOENT";
            throw error;
          }
          return files.get(targetPath);
        },
        writeTextFile: async (targetPath, content) => {
          writeAttempt += 1;
          if (writeAttempt === 2) {
            throw new Error("write failure");
          }
          files.set(targetPath, content);
        },
        removeFile: async (targetPath) => {
          files.delete(targetPath);
        }
      }
    }),
    /write failure/
  );

  assert.equal(files.get("/tmp/catalog/README.md"), "README old");
  assert.equal(files.get("/tmp/catalog/a/SKILL.md"), "A old");
});
