#!/usr/bin/env node

/**
 * templates-lint.js
 *
 * Validates asset templates in skills/scannlab-agents-subfolder/assets/
 * against the current state of the skills/ directory and SKILL.md conventions.
 *
 * Checks:
 *   1. Dead skill references — backtick-quoted skill names not in skills/
 *   2. Old path patterns    — .claude/skills/ prefix is no longer valid
 *   3. IMPORTANT notice     — example files must have the inheritance notice
 *
 * Usage:
 *   node skills/scannlab-agents-subfolder/scripts/templates-lint.js
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = one or more checks failed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../..');
const SKILL_DIR = path.join(REPO_ROOT, 'skills', 'scannlab-agents-subfolder');
const ASSETS_DIR = path.join(SKILL_DIR, 'assets');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

// Prefixes that indicate a skill reference vs a CSS var, code token, or Angular API
const SKILL_PREFIXES = [
  'scannlab-',
  'skill-',
  'angular-',
  'commit-',
  'pr-',
  'token-',
  'agentic-',
];

// Exact names that are skills but don't carry a recognizable prefix
const EXACT_SKILL_NAMES = new Set([
  'token-optimizer',
  'css-modules',
  'angular-20',
  'commit-writer',
  'pr-writer',
]);

// ─── Utilities ────────────────────────────────────────────────────────────────

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function getSkillNames() {
  if (!fs.existsSync(SKILLS_DIR)) return new Set();
  return new Set(
    fs
      .readdirSync(SKILLS_DIR)
      .filter((name) => {
        const p = path.join(SKILLS_DIR, name);
        return fs.statSync(p).isDirectory() && name !== 'node_modules';
      })
  );
}

function getAssetFiles() {
  if (!fs.existsSync(ASSETS_DIR)) return [];
  return fs
    .readdirSync(ASSETS_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(ASSETS_DIR, name));
}

function looksLikeSkillRef(name) {
  if (EXACT_SKILL_NAMES.has(name)) return true;
  return SKILL_PREFIXES.some((p) => name.startsWith(p));
}

// ─── Checks ───────────────────────────────────────────────────────────────────

/**
 * Check 1: Dead skill references.
 * Find backtick-quoted names that look like skill names but whose directory
 * no longer exists in skills/.
 */
function checkDeadSkillRefs(content, relPath, skillNames) {
  const errors = [];
  const pattern = /`([a-z][a-z0-9-]+)`/g;
  const seen = new Set();
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const name = match[1];
    if (seen.has(name)) continue;
    seen.add(name);

    if (!looksLikeSkillRef(name)) continue;

    // Sub-agent suffix (e.g. scannlab-token-validation/css-auditor) → check base name
    const baseName = name.split('/')[0];

    if (!skillNames.has(baseName)) {
      errors.push(`  → Dead skill reference \`${name}\` in ${relPath}`);
    }
  }

  return errors;
}

/**
 * Check 2: Old path pattern.
 * The .claude/skills/ prefix was removed — all skill links must use skills/ directly.
 */
function checkOldPaths(content, relPath) {
  const errors = [];
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    if (line.includes('.claude/skills/')) {
      errors.push(
        `  → Old path ".claude/skills/" found at line ${i + 1} in ${relPath}`
      );
    }
  });

  return errors;
}

/**
 * Check 3: IMPORTANT inheritance notice.
 * Every example file (not the blank template) must open with the IMPORTANT blockquote.
 */
function checkImportantNotice(content, relPath, fileName) {
  // The blank template uses {placeholders} — IMPORTANT is present but templated, skip
  if (fileName === 'AGENTS-template.md') return [];

  if (!content.includes('**IMPORTANT:**')) {
    return [
      `  → Missing IMPORTANT inheritance notice in ${relPath}`,
    ];
  }
  return [];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const skillNames = getSkillNames();
  const assetFiles = getAssetFiles();

  if (assetFiles.length === 0) {
    console.log('\nNo asset files found in assets/ — nothing to validate.\n');
    process.exit(0);
  }

  console.log(
    `\nValidating ${assetFiles.length} template(s) in scannlab-agents-subfolder/assets/...\n`
  );

  let totalErrors = 0;
  let passed = 0;

  for (const filePath of assetFiles) {
    const content = readFile(filePath);
    if (!content) {
      console.log(`  SKIP  ${path.relative(REPO_ROOT, filePath)} (unreadable)`);
      continue;
    }

    const relPath = path.relative(REPO_ROOT, filePath);
    const fileName = path.basename(filePath);

    const errors = [
      ...checkDeadSkillRefs(content, relPath, skillNames),
      ...checkOldPaths(content, relPath),
      ...checkImportantNotice(content, relPath, fileName),
    ];

    if (errors.length === 0) {
      console.log(`  PASS  ${relPath}`);
      passed++;
    } else {
      console.log(`  FAIL  ${relPath}`);
      for (const err of errors) {
        console.log(err);
      }
      totalErrors += errors.length;
    }
  }

  const line = '─'.repeat(60);
  console.log(`\n${line}`);

  if (totalErrors > 0) {
    console.log(
      `Templates lint: ${totalErrors} issue(s) found across ${assetFiles.length - passed} file(s).\n`
    );
    console.log(
      `Run the templates-sync agent to reconcile templates with SKILL.md.\n`
    );
    process.exit(1);
  } else {
    console.log(`Templates lint: all ${passed} file(s) passed.\n`);
    process.exit(0);
  }
}

main();
