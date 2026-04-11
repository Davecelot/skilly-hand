import test from "node:test";
import assert from "node:assert/strict";
import { buildSkillBlocksForRender, computeSkillWindow } from "../packages/cli/src/ink-ui.js";

function makeSkills(count, { longAgents = false } = {}) {
  return Array.from({ length: count }, (_, idx) => ({
    id: `skill-${idx + 1}`,
    title: `Skill ${idx + 1}`,
    tags: ["core", "workflow"],
    agentSupport: longAgents
      ? ["codex", "claude", "cursor", "gemini", "copilot", "antigravity", "windsurf", "trae"]
      : ["codex", "claude"]
  }));
}

function sumLines(blocks, start, end) {
  return blocks.slice(start, end).reduce((total, block) => total + block.lineCount, 0);
}

test("skill blocks wrap long metadata lines and avoid fixed 3-row assumptions", () => {
  const skills = makeSkills(3, { longAgents: true });
  const blocks = buildSkillBlocksForRender({
    skills,
    cursor: 0,
    selectedIds: new Set([skills[0].id]),
    contentWidth: 28
  });

  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].lineCount > 3, true);

  const window = computeSkillWindow({
    blocks,
    cursor: 0,
    availableLines: 7
  });

  assert.equal(window.start, 0);
  assert.equal(window.end >= 1, true);
  assert.equal(window.end <= blocks.length, true);

  const visibleLines = sumLines(blocks, window.start, window.end);
  assert.equal(visibleLines <= 7 || window.end - window.start === 1, true);
});

test("window follows cursor and stays clamped across top/middle/bottom", () => {
  const skills = makeSkills(10, { longAgents: true });
  const blocks = buildSkillBlocksForRender({
    skills,
    cursor: 0,
    selectedIds: new Set(),
    contentWidth: 34
  });

  const top = computeSkillWindow({ blocks, cursor: 0, availableLines: 12 });
  const middle = computeSkillWindow({ blocks, cursor: 5, availableLines: 12 });
  const bottom = computeSkillWindow({ blocks, cursor: 9, availableLines: 12 });

  assert.equal(top.start, 0);
  assert.equal(top.end > top.start, true);

  assert.equal(middle.start <= 5 && middle.end > 5, true);
  assert.equal(middle.start > 0, true);
  assert.equal(middle.end <= blocks.length, true);

  assert.equal(bottom.end, blocks.length);
  assert.equal(bottom.start <= 9 && bottom.end > 9, true);
});

test("tiny line budgets still render at least one complete skill block", () => {
  const skills = makeSkills(4, { longAgents: true });
  const blocks = buildSkillBlocksForRender({
    skills,
    cursor: 2,
    selectedIds: new Set(),
    contentWidth: 24
  });

  const window = computeSkillWindow({
    blocks,
    cursor: 2,
    availableLines: 1
  });

  assert.equal(window.start <= 2 && window.end > 2, true);
  assert.equal(window.end - window.start, 1);
  assert.equal(window.usedLines, blocks[2].lineCount);
});
