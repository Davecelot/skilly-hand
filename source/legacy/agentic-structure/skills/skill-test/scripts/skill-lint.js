#!/usr/bin/env node

/**
 * skill-lint.js
 * 
 * Structural validator for SKILL.md files in the scannlab-repo.
 * Validates frontmatter, file references, version format, and AGENTS.md consistency.
 * 
 * Usage:
 *   node skills/skill-test/scripts/skill-lint.js                 # Validate all skills
 *   node skills/skill-test/scripts/skill-lint.js <skill-path>    # Validate single skill
 * 
 * Examples:
 *   node skills/skill-test/scripts/skill-lint.js skills/scannlab-best-practices
 *   node skills/skill-test/scripts/skill-lint.js skills/token-optimizer/SKILL.md
 * 
 * Exit codes:
 *   0 = all skills passed
 *   1 = one or more skills failed validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ============================================================================
// CONFIGURATION
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const AGENTS_MD = path.join(REPO_ROOT, 'AGENTS.md');
const README_MD = path.join(SKILLS_DIR, 'README.md');

const REQUIRED_FRONTMATTER_FIELDS = [
  'name',
  'description',
  'metadata',
];

const REQUIRED_METADATA_FIELDS = [
  'author',
  'last-edit',
  'license',
  'version',
  'changelog',
  'scope',
  'auto-invoke',
];

const ALLOWED_SCOPES = ['[root]', '[ui]', '[storybook]', '[scripts]', '[docs]'];

const ALLOWED_TOOLS = [
  'Read',
  'Edit',
  'Write',
  'Grep',
  'Bash',
  'Node.js',
  'SubAgent',
  'Task',
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================



/**
 * Validate semver format (X.Y.Z).
 */
function isValidSemver(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

/**
 * Check if file/folder exists.
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Load content of a file.
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    return null;
  }
}

/**
 * Execute git command safely (returns null on error).
 */
function gitCommand(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf-8',
      cwd: REPO_ROOT,
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch (err) {
    return null;
  }
}

/**
 * Check if SKILL.md was modified since last-edit date.
 * Returns { modified: boolean, checks: { gitStatus, gitDate, lastEditDate } }
 */
function checkMetadataFreshness(skillMdPath, lastEditDate) {
  // Check git status (unstaged/staged changes)
  const gitStatus = gitCommand(`git status --porcelain "${skillMdPath}"`);
  const hasUncommittedChanges = gitStatus && gitStatus.length > 0;

  // Check git log (last commit date for this file)
  const gitLog = gitCommand(`git log -1 --format=%ci -- "${skillMdPath}"`);
  let gitDate = null;
  if (gitLog) {
    // Extract YYYY-MM-DD from git date string (format: "2024-03-21 14:30:45 +0000")
    gitDate = gitLog.split(' ')[0];
  }

  // Normalize date formats for comparison (handle both ISO and DD.MM.YYYY)
  const lastEditNormalized = normalizeDate(lastEditDate);
  const gitDateNormalized = gitDate ? normalizeDate(gitDate) : null;

  // Determine if modification happened after last-edit
  const modifiedAfterLastEdit = 
    gitDateNormalized && lastEditNormalized &&
    gitDateNormalized > lastEditNormalized;

  return {
    modified: hasUncommittedChanges || modifiedAfterLastEdit,
    checks: {
      gitStatus: hasUncommittedChanges ? 'has changes' : 'clean',
      gitDate,
      lastEditDate,
    },
  };
}

/**
 * Normalize date strings to ISO format for comparison.
 * Handles: YYYY-MM-DD (ISO), DD.MM.YYYY (DD.MM.YYYY), and other formats.
 */
function normalizeDate(dateStr) {
  if (!dateStr) return null;

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // DD.MM.YYYY format
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Collect all skill directories in skills/ folder.
 */
function getAllSkills() {
  if (!fileExists(SKILLS_DIR)) return [];

  return fs
    .readdirSync(SKILLS_DIR)
    .filter((name) => {
      const skillPath = path.join(SKILLS_DIR, name);
      return fs.statSync(skillPath).isDirectory() && name !== 'node_modules';
    });
}

/**
 * Parse AGENTS.md to extract auto-invoke table.
 */
function parseAgentsMDAutoInvokeTable() {
  const content = readFile(AGENTS_MD);
  if (!content) return new Set();

  const autoInvokeSection = content.match(/### Auto-invoke Skills([\s\S]*?)(?=###|$)/);
  if (!autoInvokeSection) return new Set();

  const table = autoInvokeSection[1];
  const rows = table.match(/\|\s*[^|]+\s*\|\s*[^|]+\s*\|/g) || [];

  const skills = new Set();
  for (const row of rows) {
    const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length >= 3) {
      const skillName = cells[1]; // Second column is skill name
      if (skillName !== 'Skill' && skillName.trim()) {
        skills.add(skillName.trim());
      }
    }
  }

  return skills;
}

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Validate a single SKILL.md file.
 * Returns { valid: boolean, errors: string[] }
 */
function validateSkill(skillName, skillPath) {
  const errors = [];
  const skillMdPath = path.join(skillPath, 'SKILL.md');

  // Check if SKILL.md exists
  if (!fileExists(skillMdPath)) {
    errors.push(`SKILL.md not found at ${skillMdPath}`);
    return { valid: false, errors, data: null };
  }

  const content = readFile(skillMdPath);
  if (!content) {
    errors.push(`Failed to read SKILL.md`);
    return { valid: false, errors, data: null };
  }

  // Check for merge conflict markers (but not in code blocks)
  // Only flag if marker is on its own line (actual merge conflict syntax)
  const conflictLineRegex = /^(<<<<<<<|=======|>>>>>>>)/m;
  if (conflictLineRegex.test(content)) {
    errors.push(`Merge conflict markers detected in SKILL.md`);
  }

  // Extract frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) {
    errors.push('Missing frontmatter (---...---)');
    return { valid: false, errors, data: null };
  }

  const frontmatterText = fmMatch[1];
  const body = content.slice(fmMatch[0].length);

  // Regex-based validation for required fields
  const requiredFields = ['name', 'description', 'metadata'];
  const requiredMetadataFields = [
    'author',
    'last-edit',
    'license',
    'version',
    'changelog',
    'scope',
    'auto-invoke',
  ];

  // Check top-level fields
  for (const field of requiredFields) {
    const regex = new RegExp(`^${field}:`, 'm');
    if (!regex.test(frontmatterText)) {
      errors.push(`Missing required field in frontmatter: '${field}'`);
    }
  }

  // Check metadata sub-fields
  const hasMetadata = /^metadata:/m.test(frontmatterText);
  if (!hasMetadata) {
    errors.push(`Missing required field in frontmatter: 'metadata'`);
  } else {
    for (const field of requiredMetadataFields) {
      const regex = new RegExp(`^\\s+${field}:`, 'm');
      if (!regex.test(frontmatterText)) {
        errors.push(`Missing required metadata field: '${field}'`);
      }
    }
  }

  // Validate version format
  const versionMatch = frontmatterText.match(/^\s+version:\s*['""]?([^'""\n]+)['""]?/m);
  if (versionMatch) {
    const version = versionMatch[1].trim();
    if (!isValidSemver(version)) {
      errors.push(
        `version field '${version}' does not match semver format (expected X.Y.Z)`
      );
    }
  }

  // Validate scope format
  const scopeMatch = frontmatterText.match(/^\s+scope:\s*(.+)$/m);
  if (scopeMatch) {
    const scopeStr = scopeMatch[1].trim();
    const scopeValues = scopeStr
      .match(/\[.*?\]/g) || [scopeStr];
    for (const scope of scopeValues) {
      if (!ALLOWED_SCOPES.includes(scope.trim())) {
        // Skip validation if it looks like a variable reference
        if (!scope.includes('$')) {
          errors.push(`Invalid scope: '${scope.trim()}'. Allowed: ${ALLOWED_SCOPES.join(', ')}`);
        }
      }
    }
  }

  // Validate allowed-tools (just warn, don't fail)
  const toolsMatch = frontmatterText.match(/^allowed-tools:\s*(.+)$/m);
  if (toolsMatch) {
    const toolsStr = toolsMatch[1].trim();
    // Extract comma-separated list
    const toolsList = toolsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);
    
    // Warn for unknown tools, but don't fail
    for (const tool of toolsList) {
      if (!ALLOWED_TOOLS.includes(tool) && !toolsStr.includes(tool.split('[')[0])) {
        // Only warn if it looks like a real tool name, not a complex expression
        if (!/^[A-Z\s,]+$/.test(toolsStr.substring(0, 50))) {
          console.warn(`  ⚠ Warning: Tool used in skill: '${tool}' (verify it exists)`);
        }
      }
    }
  }

  // Validate file references in assets/ and references/
  const assetMatches = body.match(/assets\/[\w\-\.]+/g) || [];
  for (const assetRef of assetMatches) {
    const fullPath = path.join(skillPath, assetRef);
    if (!fileExists(fullPath)) {
      errors.push(`Referenced asset file not found: ${assetRef}`);
    }
  }

  // Check reference paths mentioned in body
  const refMatches = body.match(/references\/[\w\-\.]+/g) || [];
  for (const refRef of refMatches) {
    const fullPath = path.join(skillPath, refRef);
    if (!fileExists(fullPath)) {
      errors.push(`Referenced file not found: ${refRef}`);
    }
  }

  // NEW: Check if metadata was updated when file changed
  const lastEditMatch = frontmatterText.match(/^\s+last-edit:\s*["']?([^"'\n]+)["']?/m);
  if (lastEditMatch) {
    const lastEditDate = lastEditMatch[1].trim();
    const freshness = checkMetadataFreshness(skillMdPath, lastEditDate);
    
    if (freshness.modified) {
      errors.push(
        `SKILL.md was modified but metadata not updated. Run: node skills/skill-test/scripts/skill-metadata-updater.js ${path.relative(REPO_ROOT, skillPath)}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: { name: skillName }, // Return minimal data for consistency checks
  };
}

/**
 * Validate AGENTS.md references.
 */
function validateAgentsMDConsistency(skillName, skillData) {
  const errors = [];
  const content = readFile(AGENTS_MD);

  if (!content) {
    errors.push(`Could not read AGENTS.md to verify references`);
    return errors;
  }

  // Check if skill is mentioned in AGENTS.md (not mandatory, but good to verify)
  if (!content.includes(skillName)) {
    errors.push(`Skill '${skillName}' not found in AGENTS.md`);
  }

  // If auto-invoke is set, verify it appears in the auto-invoke table
  if (skillData?.['auto-invoke']) {
    const autoInvokeTable = parseAgentsMDAutoInvokeTable();
    if (!autoInvokeTable.has(skillName)) {
      errors.push(
        `Skill '${skillName}' has auto-invoke field but not in AGENTS.md auto-invoke table`
      );
    }
  }

  return errors;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  let skillsToValidate = [];

  if (args.length === 0) {
    // Validate all skills
    skillsToValidate = getAllSkills();
  } else {
    // Validate specified skill(s)
    const targetPath = args[0];
    const resolved = path.resolve(targetPath);

    if (resolved.endsWith('SKILL.md')) {
      skillsToValidate = [path.basename(path.dirname(resolved))];
    } else {
      skillsToValidate = [path.basename(resolved)];
    }
  }

  if (skillsToValidate.length === 0) {
    console.log('\nℹ No skills found to validate.\n');
    process.exit(0);
  }

  console.log(`\n🔍 Validating ${skillsToValidate.length} skill(s)...\n`);

  let passed = 0;
  let failed = 0;

  for (const skillName of skillsToValidate) {
    const skillPath = path.join(SKILLS_DIR, skillName);
    const { valid, errors, data } = validateSkill(skillName, skillPath);

    if (valid) {
      console.log(`✓ PASS  skills/${skillName}/SKILL.md`);
      passed++;
    } else {
      console.log(`✗ FAIL  skills/${skillName}/SKILL.md`);
      for (const error of errors) {
        console.log(`  → ${error}`);
      }
      failed++;

      // Additional consistency checks
      const consistencyErrors = validateAgentsMDConsistency(skillName, data);
      for (const error of consistencyErrors) {
        console.log(`  → ${error}`);
      }
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Summary: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
