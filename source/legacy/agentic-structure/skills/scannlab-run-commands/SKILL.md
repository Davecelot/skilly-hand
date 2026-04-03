---
name: scannlab-run-commands
description: >
  Guide on running each stage of the ScannLab Design System project (dev, storybook, tests, lint, build).
  Trigger: When user needs to run project commands or asks how to start dev server, run tests, build storybook, etc.
metadata:
  author: scannlab-design-system
  last-edit: 2026-03-30
  license: Apache-2.0
  version: "1.1.0"
  changelog: "Added Playwright/E2E commands; fixed build description; removed stale VS Code task shorthand"
  scope: [root]
  auto-invoke: "Running project-level commands"
allowed-tools: Task, Bash
---

# ScannLab Run Commands Guide

## When to Use

**Use this skill when:**

- User needs to run development server.
- User needs to run/build Storybook.
- User needs to run tests (unit, integration, watch, or coverage).
- User needs to run linting or formatting.
- User needs to build the project for production.
- User needs to check code coverage.

**Don't use this skill for:**

- Project setup (dependencies installation, environment config).
- Troubleshooting build failures (use project-specific tools).
- Creating new files or modifying source code.

---

## Project Stages & Commands

| Stage | Command | Purpose | Terminal Setup |
|-------|---------|---------|-----------------|
| **Angular Dev Server** | `npm start` | Starts Angular dev server (`ng serve`) | Leave running |
| **Storybook Dev** | `npm run storybook` or `npm run sb` | Starts Storybook dev server at `localhost:6006` | Leave running |
| **Test (Single Run)** | `npm test` | Runs all unit tests once (Vitest) | One-off |
| **Test (Watch)** | `npm run test:watch` | Runs unit tests in watch mode | Leave running |
| **Test Coverage** | `npm run test:coverage` | Runs unit tests and generates coverage report | One-off |
| **Coverage Check** | `npm run check:coverage` | Runs coverage and validates against thresholds | One-off |
| **E2E Tests** | `npm run test:e2e` | Runs Playwright e2e tests (headless) | One-off |
| **E2E Tests (UI)** | `npm run test:e2e:ui` | Opens Playwright interactive UI mode | One-off |
| **E2E Tests (Headed)** | `npm run test:e2e:headed` | Runs Playwright tests with visible browser | One-off |
| **E2E Update Snapshots** | `npm run test:e2e:update-snapshots` | Regenerates Playwright visual baselines | One-off |
| **E2E Report** | `npm run test:e2e:report` | Opens Playwright HTML test report | One-off |
| **Playwright Install** | `npm run playwright:install` | Installs Chromium + Firefox browsers for Playwright | One-off |
| **Lint** | `npm run lint` | Checks for linting errors (ESLint via `ng lint`) | One-off |
| **Lint & Fix** | `npm run lint:fix` | Auto-fixes linting errors | One-off |
| **Format Code** | `npm run format` | Formats code with Prettier | One-off |
| **Build** | `npm run build` | Builds the Angular library (`ng build`) | One-off |
| **Build (Watch)** | `npm run watch` | Builds in watch mode with development config | Leave running |
| **Build Storybook** | `npm run build-storybook` or `npm run sb:build` | Generates static Storybook build | One-off |

---

## Quick Start Scenarios

### Scenario 1: Start Storybook with Tests

```bash
# Open two terminals for parallel development

# Terminal 1: Storybook Dev Server
npm run storybook

# Terminal 2: Watch Tests
npm run test:watch
```

After running these, open:
- Storybook: http://localhost:6006
- Tests will auto-run in Terminal 2 when you save files

### Scenario 2: Work on Storybook Stories

```bash
# Terminal 1: Storybook Dev Server
npm run storybook

# Terminal 2: Watch Tests (optional)
npm run test:watch
```

Storybook will open at: http://localhost:6006

### Scenario 3: Run E2E / Playwright Tests

```bash
# Ensure Storybook is running first (Playwright tests run against it)
npm run storybook

# In a second terminal, run e2e tests
npm run test:e2e

# Or open the interactive Playwright UI
npm run test:e2e:ui
```

### Scenario 4: Pre-commit Quality Checks

```bash
# Run all checks before committing
npm run lint:fix    # Fix linting issues
npm run format      # Format code
npm run test:coverage  # Run tests with coverage
npm run build       # Build to verify no compilation errors
```

### Scenario 5: Verify Code Quality

```bash
# Run coverage check to validate coverage thresholds
npm run check:coverage
```

This validates that coverage meets the project's minimum thresholds.

---

## Terminal Management

### Multiple Terminals Needed

Some tasks are best run in parallel:

| Task | Terminal 1 | Terminal 2 | Terminal 3 |
|------|-----------|-----------|-----------|
| Storybook + Testing | `npm run storybook` | `npm run test:watch` | Code editing |
| Storybook + E2E | `npm run storybook` | `npm run test:e2e` | — |
| CI-like workflow | `npm run lint:fix` | `npm run test:coverage` | Monitor both |

### Long-Running Processes

**Keep running in dedicated terminals:**
- `npm start` (Angular dev server via `ng serve`)
- `npm run storybook` (Storybook dev server)
- `npm run test:watch` (unit test watcher)
- `npm run watch` (Angular build watcher, development config)

**Run once:**
- `npm test` (single unit test run)
- `npm run test:coverage` (unit test coverage report)
- `npm run check:coverage` (coverage validation against thresholds)
- `npm run test:e2e` (Playwright e2e tests, headless)
- `npm run test:e2e:ui` (Playwright interactive UI mode)
- `npm run test:e2e:update-snapshots` (regenerate visual baselines)
- `npm run build` (Angular library build)
- `npm run lint` (linting check)

---

## Commands by Category

### Development

```bash
# Start Angular dev server
npm start

# Start Storybook dev server
npm run storybook
# Short alias
npm run sb

# Build static Storybook
npm run build-storybook
# Short alias
npm run sb:build
```

### Unit Testing (Vitest)

```bash
# Run unit tests once
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run coverage check (validates against thresholds)
npm run check:coverage
```

### E2E Testing (Playwright)

```bash
# Run e2e tests headless
npm run test:e2e

# Open Playwright interactive UI
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Regenerate visual baselines
npm run test:e2e:update-snapshots

# Open last HTML report
npm run test:e2e:report

# Install Playwright browsers (one-time setup)
npm run playwright:install
```

### Linting & Formatting

```bash
# Check for linting errors (ng lint / ESLint)
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### Building

```bash
# Build Angular library (ng build)
npm run build

# Build in watch mode (development config, rebuilds on changes)
npm run watch
```

---

## Exit Codes & Troubleshooting

### Common Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| `0` | Success | All good ✓ |
| `1` | General error | Check error message above |
| `124` | Timeout | Command took too long |
| `130` | User interrupt | You pressed Ctrl+C |

### If a Command Fails

1. **Read the error message** — it usually points to the issue.
2. **Check file syntax** — especially in modified files.
3. **Clear node_modules** — if node version or dependency conflicts: `rm -rf node_modules && npm install`
4. **Check TypeScript errors** — run `npm run build` to verify compilation.
5. **Verify file changes** — use `git status` to see what changed.

