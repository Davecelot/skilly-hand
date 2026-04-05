import test from "node:test";
import assert from "node:assert/strict";
import { checkSecurity } from "../scripts/security-check.mjs";

test("security check passes for this repository", async () => {
  const result = await checkSecurity();

  assert.deepEqual(result.violations, [],
    `Hardcoded secret patterns found:\n${result.violations.map((v) =>
      `  ${v.file}:${v.line} — ${v.patternName}`).join("\n")}`
  );

  assert.deepEqual(result.gitignoreProblems, [],
    `.gitignore is missing required entries: ${result.gitignoreProblems.join(", ")}`
  );

  assert.deepEqual(result.envFileProblems, [],
    `Unexpected .env files found:\n${result.envFileProblems.map((f) => `  ${f}`).join("\n")}`
  );
});
