#!/usr/bin/env node

/**
 * skill-metadata-updater.js
 * 
 * Automated tool to update SKILL.md metadata fields:
 * - last-edit: Updates to current date (ISO 8601 format)
 * - version: Auto-increments patch version (X.Y.Z → X.Y.Z+1)
 * - changelog: Prompts user for what changed (what/why/where structure)
 * 
 * Part of: skill-test validation suite
 * 
 * Usage:
 *   node skills/skill-test/scripts/skill-metadata-updater.js <skill-path>
 *   node skills/skill-test/scripts/skill-metadata-updater.js --all
 *   node skills/skill-test/scripts/skill-metadata-updater.js --check
 * 
 * Examples:
 *   node skills/skill-test/scripts/skill-metadata-updater.js skills/scannlab-best-practices
 *   node skills/skill-test/scripts/skill-metadata-updater.js --all
 * 
 * Exit codes:
 *   0 = all metadata updates successful
 *   1 = validation failed or user cancelled
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

// ============================================================================
// CONFIG
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current date in ISO 8601 format (YYYY-MM-DD)
 */
function getCurrentDateISO() {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

/**
 * Format output with colors
 */
function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

/**
 * Prompt user for input
 */
async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${COLORS.bright}${question}${COLORS.reset}\n`, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Increment semantic version (X.Y.Z → X.Y.(Z+1))
 */
function incrementPatchVersion(version) {
  const parts = version.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid semver format: ${version}`);
  }
  
  const [major, minor, patch] = parts.map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * Resolve skill path (handle both directory and SKILL.md file paths)
 */
function resolveSkillPath(inputPath) {
  let resolvedPath = path.join(REPO_ROOT, inputPath);
  
  // If it's a directory, append SKILL.md
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    resolvedPath = path.join(resolvedPath, 'SKILL.md');
  }
  
  // If SKILL.md doesn't exist, try assuming input is the file itself
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`SKILL.md not found at: ${resolvedPath}`);
  }
  
  return resolvedPath;
}

/**
 * Get the skill name from directory path
 */
function getSkillName(skillMdPath) {
  return path.basename(path.dirname(skillMdPath));
}

/**
 * Parse YAML frontmatter from SKILL.md
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid frontmatter format');
  }
  
  return {
    frontmatter: match[1],
    body: match[2],
  };
}

/**
 * Extract metadata values from frontmatter text
 */
function extractMetadata(frontmatterText) {
  const parseField = (fieldName) => {
    const regex = new RegExp(`^\\s+${fieldName}:\\s*["']?([^"'\\n]+)["']?`, 'm');
    const match = frontmatterText.match(regex);
    return match ? match[1].trim() : null;
  };

  return {
    version: parseField('version'),
    lastEdit: parseField('last-edit'),
    changelog: parseField('changelog'),
  };
}

/**
 * Check if SKILL.md was modified since last-edit date
 */
function wasModifiedSinceLastEdit(skillMdPath, lastEditDate) {
  try {
    // Get git log for this specific file
    const gitLog = execSync(
      `cd "${REPO_ROOT}" && git log -1 --format=%ci -- "${skillMdPath}"`,
      { encoding: 'utf-8' }
    ).trim();

    if (!gitLog) {
      return true; // File not in git, assume it was modified
    }

    // Extract just the date part (YYYY-MM-DD)
    const lastCommitDate = gitLog.split(' ')[0];
    
    return lastCommitDate > lastEditDate;
  } catch (err) {
    // If git command fails, assume file might have been modified
    return true;
  }
}

/**
 * Get git status for a specific file
 */
function getGitFileStatus(skillMdPath) {
  try {
    const status = execSync(
      `cd "${REPO_ROOT}" && git status --porcelain "${skillMdPath}"`,
      { encoding: 'utf-8' }
    ).trim();
    return status; // Empty string = not modified, otherwise shows status
  } catch (err) {
    return 'unknown';
  }
}

/**
 * Get list of all modified skills (from git)
 */
function getModifiedSkills() {
  try {
    const modified = execSync(
      `cd "${REPO_ROOT}" && git diff --name-only HEAD | grep "^skills/.*/SKILL\\.md$"`,
      { encoding: 'utf-8' }
    ).trim().split('\n').filter(Boolean);

    const untracked = execSync(
      `cd "${REPO_ROOT}" && git ls-files --others --exclude-standard | grep "^skills/.*/SKILL\\.md$"`,
      { encoding: 'utf-8' }
    ).trim().split('\n').filter(Boolean);

    return [...new Set([...modified, ...untracked])];
  } catch (err) {
    return [];
  }
}

/**
 * Update frontmatter fields in SKILL.md
 */
function updateFrontmatter(frontmatterText, updates) {
  let updated = frontmatterText;

  // Update last-edit
  if (updates.lastEdit) {
    const regex = /^(\s+last-edit:)\s*["']?[^"'\n]+["']?/m;
    updated = updated.replace(regex, `$1 ${updates.lastEdit}`);
  }

  // Update version
  if (updates.version) {
    const regex = /^(\s+version:)\s*["']?([^"'\n]+)["']?/m;
    updated = updated.replace(regex, `$1 "${updates.version}"`);
  }

  // Update changelog
  if (updates.changelog) {
    const regex = /^(\s+changelog:)\s*["']?([^"'\n]+)["']?/m;
    const escapedChangelog = updates.changelog.replace(/"/g, '\\"');
    updated = updated.replace(regex, `$1 "${escapedChangelog}"`);
  }

  return updated;
}

/**
 * Validate updated frontmatter
 */
function validateFrontmatter(frontmatterText) {
  const errors = [];

  // Check required fields exist
  const requiredMetadataFields = [
    'author',
    'last-edit',
    'license',
    'version',
    'changelog',
    'scope',
    'auto-invoke',
  ];

  for (const field of requiredMetadataFields) {
    const regex = new RegExp(`^\\s+${field}:`, 'm');
    if (!regex.test(frontmatterText)) {
      errors.push(`Missing required metadata field: '${field}'`);
    }
  }

  // Validate version format
  const versionMatch = frontmatterText.match(/^\s+version:\s*["']?([^"'\n]+)["']?/m);
  if (versionMatch) {
    const version = versionMatch[1].trim();
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      errors.push(`Invalid version format '${version}' (expected X.Y.Z)`);
    }
  }

  // Validate date format
  const dateMatch = frontmatterText.match(/^\s+last-edit:\s*["']?([^"'\n]+)["']?/m);
  if (dateMatch) {
    const date = dateMatch[1].trim();
    // Allow both ISO (YYYY-MM-DD) and DD.MM.YYYY for backwards compatibility
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) && !/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      errors.push(`Invalid date format '${date}' (expected YYYY-MM-DD or DD.MM.YYYY)`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// MAIN WORKFLOW
// ============================================================================

/**
 * Update a single skill's metadata
 */
async function updateSingleSkill(skillMdPath) {
  const skillName = getSkillName(skillMdPath);
  log(`\n📝 Updating metadata for: ${skillName}`, 'cyan');

  try {
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    const metadata = extractMetadata(frontmatter);

    // Check if file was actually modified
    const gitStatus = getGitFileStatus(skillMdPath);
    const wasModified = gitStatus || wasModifiedSinceLastEdit(skillMdPath, metadata.lastEdit);

    if (!wasModified) {
      log(`✓ No changes detected (already up to date)`, 'dim');
      return { success: true, skipped: true, skillName };
    }

    log(`Current metadata:`, 'yellow');
    log(`  version: ${metadata.version}`, 'dim');
    log(`  last-edit: ${metadata.lastEdit}`, 'dim');
    log(`  changelog: ${metadata.changelog}`, 'dim');

    // Prompt for new changelog
    log(`\n${COLORS.bright}What changed in this skill?${COLORS.reset}`);
    log(`Format: "what changed, why it matters, where it affects"`, 'dim');
    const newChangelog = await prompt('📋 Changelog entry: ');

    if (!newChangelog) {
      log('❌ Changelog cannot be empty', 'red');
      return { success: false, skillName };
    }

    // Calculate new version
    const newVersion = incrementPatchVersion(metadata.version);
    const newLastEdit = getCurrentDateISO();

    log(`\n${COLORS.green}Applying updates:${COLORS.reset}`);
    log(`  version: ${metadata.version} → ${newVersion}`, 'green');
    log(`  last-edit: ${metadata.lastEdit} → ${newLastEdit}`, 'green');
    log(`  changelog: "${newChangelog}"`, 'green');

    // Update frontmatter
    const updatedFrontmatter = updateFrontmatter(frontmatter, {
      version: newVersion,
      lastEdit: newLastEdit,
      changelog: newChangelog,
    });

    // Validate
    const validation = validateFrontmatter(updatedFrontmatter);
    if (!validation.valid) {
      log(`\n❌ Validation failed:`, 'red');
      validation.errors.forEach(err => log(`  • ${err}`, 'red'));
      return { success: false, skillName };
    }

    // Write back
    const updatedContent = `---\n${updatedFrontmatter}\n---\n${body}`;
    fs.writeFileSync(skillMdPath, updatedContent, 'utf-8');

    log(`\n✅ Metadata updated successfully!`, 'green');
    return { success: true, skillName, updates: { newVersion, newLastEdit } };
  } catch (err) {
    log(`\n❌ Error: ${err.message}`, 'red');
    return { success: false, skillName, error: err.message };
  }
}

/**
 * Check which skills need metadata updates
 */
function checkModifiedSkills() {
  const modified = getModifiedSkills();

  if (modified.length === 0) {
    log('✓ No modified skills detected', 'green');
    return [];
  }

  log(`\nFound ${modified.length} modified skill(s):`, 'yellow');
  modified.forEach(skillPath => {
    const skillName = path.basename(path.dirname(skillPath));
    log(`  • ${skillName}`, 'dim');
  });

  return modified;
}

/**
 * List all skills (for reference)
 */
function listAllSkills() {
  const skills = fs
    .readdirSync(SKILLS_DIR)
    .filter(name => {
      const skillPath = path.join(SKILLS_DIR, name);
      return fs.statSync(skillPath).isDirectory() && name !== 'node_modules';
    })
    .sort();

  return skills;
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log(`
${COLORS.bright}skill-metadata-updater.js${COLORS.reset} — Update SKILL.md metadata fields

${COLORS.bright}Usage:${COLORS.reset}
  node skills/skill-test/scripts/skill-metadata-updater.js <path>
  node skills/skill-test/scripts/skill-metadata-updater.js --all
  node skills/skill-test/scripts/skill-metadata-updater.js --check
  node skills/skill-test/scripts/skill-metadata-updater.js --list

${COLORS.bright}Examples:${COLORS.reset}
  node skills/skill-test/scripts/skill-metadata-updater.js skills/scannlab-best-practices
  node skills/skill-test/scripts/skill-metadata-updater.js --all
  node skills/skill-test/scripts/skill-metadata-updater.js --check

${COLORS.bright}Fields Updated:${COLORS.reset}
  • version     Auto-increments patch (X.Y.Z → X.Y.Z+1)
  • last-edit   Set to current date (ISO 8601: YYYY-MM-DD)
  • changelog   Prompted from user (required: what/why/where)
    `, 'cyan');
    process.exit(0);
  }

  try {
    if (args[0] === '--check') {
      // Check mode
      checkModifiedSkills();
      process.exit(0);
    }

    if (args[0] === '--list') {
      // List mode
      const skills = listAllSkills();
      log(`\n${COLORS.bright}All skills:${COLORS.reset}`);
      skills.forEach(skill => log(`  • ${skill}`, 'dim'));
      process.exit(0);
    }

    if (args[0] === '--all') {
      // Update all modified skills
      const modified = getModifiedSkills();

      if (modified.length === 0) {
        log('✓ No modified skills found', 'green');
        process.exit(0);
      }

      log(`\nUpdating ${modified.length} skill(s)...`, 'cyan');

      const results = [];
      for (const skillPath of modified) {
        const fullPath = path.join(REPO_ROOT, skillPath);
        const result = await updateSingleSkill(fullPath);
        results.push(result);
      }

      const successful = results.filter(r => r.success && !r.skipped).length;
      const skipped = results.filter(r => r.skipped).length;
      const failed = results.filter(r => !r.success).length;

      log(`\n${COLORS.bright}Summary:${COLORS.reset}`);
      if (successful > 0) log(`  ✓ Updated: ${successful}`, 'green');
      if (skipped > 0) log(`  → Skipped: ${skipped}`, 'dim');
      if (failed > 0) {
        log(`  ✗ Failed: ${failed}`, 'red');
        process.exit(1);
      }
      process.exit(0);
    }

    // Single skill update
    const skillPath = resolveSkillPath(args[0]);
    const result = await updateSingleSkill(skillPath);

    process.exit(result.success ? 0 : 1);
  } catch (err) {
    log(`\n❌ Fatal error: ${err.message}`, 'red');
    process.exit(1);
  }
}

main();
