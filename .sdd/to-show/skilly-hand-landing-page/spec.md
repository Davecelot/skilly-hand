# skilly-hand Landing Page

## Why

skilly-hand has a strong CLI and catalog, but its public-facing explanation currently lives mostly in README form. A focused one-page landing page will make the product easier to understand, install, and trust without sending visitors through multiple docs.

## What

Build a minimal, visually appealing one-page landing page for skilly-hand that explains:

- What skilly-hand is and how it works.
- Which skills are available and how to deep dive on them.
- How to download or install skilly-hand.

## Constraints

### Must

- MUST stay one-page; no required sub-pages for the core experience.
- MUST use `DESIGN.md` before visual implementation.
- MUST run frontend stack detection before implementation.
- MUST present the product name and install command in the first viewport.
- MUST include all current catalog skills from `catalog/skills`.
- MUST support a path to deep dive into each skill, such as anchors, expandable details, or links to catalog docs.
- MUST include commands from the current README: `npx skilly-hand`, `install`, `detect`, `list`, `doctor`.
- MUST target WCAG 2.2 Level AA.
- MUST include responsive desktop and mobile layouts.

### Must Not

- MUST NOT turn into a documentation portal or multi-page site.
- MUST NOT add unrelated product claims beyond what the README and catalog support.
- MUST NOT introduce heavy decorative sections that obscure the install and catalog story.
- MUST NOT add runtime dependencies unless the selected frontend stack already needs them.

### Out of Scope

- Hosting/deployment setup.
- Analytics, newsletter signup, authentication, pricing, blog, changelog, or docs migration.
- CLI behavior changes.
- New catalog skills.

## Current State

- Root package: Node.js ESM package `@skilly-hand/skilly-hand`, currently `0.23.3`.
- README tagline: "Portable AI agent skills. One CLI. Every coding assistant."
- CLI commands documented in README: `npx skilly-hand`, `install`, `detect`, `list`, `doctor`, `uninstall`.
- Catalog lives in `catalog/skills` and currently includes 15 skills.
- No root `DESIGN.md` existed before this planning pass.
- No frontend app directory is currently present in the repository; implementation needs a small site location selected before coding.

## Content Architecture

Use the fewest sections that still answer the user's required questions:

1. **Hero / Install:** product name, one-line value proposition, primary command, secondary commands.
2. **How It Works:** four-step flow: detect project, choose skills, install for assistants, verify with doctor.
3. **Skills Catalog:** compact searchable/filterable or grouped grid of all current skills, with tags and deep-dive links.
4. **Install / Next Step:** concise command block plus supported assistant targets.

Footer can be a compact line inside the final band, not a separate large section.

## Recommended Stack Decision

Prefer a small static website in a new `site/` workspace unless the team wants docs hosting elsewhere.

- **Option A, recommended:** Vite + React in `site/`, using plain CSS modules or scoped CSS. Good for a polished interactive one-page site with catalog data imported/generated at build time.
- **Option B:** Static HTML/CSS/JS in `site/`. Lowest dependency footprint, less aligned with detected React guidance.
- **Option C:** Add a docs framework. Not recommended for this one-page scope.

Final stack must be confirmed through the frontend-design stack detector before implementation.

## Tasks

### T1: Confirm Site Stack and Data Source

**What:** Run frontend stack detection, decide where the landing page lives, and choose how catalog data is read into the page.

**Files:** `package.json`, `catalog/skills/*/manifest.json`, planned `site/` files

**Verify:** Confirm stack summary and data-source decision before coding.

---

### T2: Scaffold the One-Page Site

**What:** Add the minimal site shell, package scripts, and data loading path for catalog skills.

**Files:** `package.json`, `site/package.json`, `site/src/*` or equivalent

**Verify:** `npm run build` or the selected site build command completes.

---

### T3: Implement Core Landing Content

**What:** Build hero/install, how-it-works, skills catalog, and final install band from verified README/catalog content.

**Files:** site page/component files, site styles

**Verify:** Browser check confirms all required content is visible on desktop and mobile.

---

### T4: Add Skill Deep-Dive Behavior

**What:** Add a compact affordance for each skill to reveal more detail or link to catalog docs/source.

**Files:** site component/data files

**Verify:** Every listed skill has a working deep-dive path and keyboard-accessible interaction.

---

### T5: Visual Polish and Motion Pass

**What:** Apply `DESIGN.md` direction with restrained motion, responsive rhythm, and strong first-viewport brand signal.

**Files:** site styles/components

**Verify:** Visual inspection at mobile and desktop sizes; reduced-motion behavior remains acceptable.

---

### T6: Accessibility, Security, and Review Gates

**What:** Run accessibility audit, normal project tests, build checks, and final review-rangers gate.

**Files:** no expected feature files unless fixes are found

**Verify:** `npm test`, site build, accessibility scan/manual AA checklist, `npm run review:rangers`.

## Validation

- Landing page answers the three required questions: what/how, available skills/deep dive, install/download.
- Page remains one-page and minimal.
- All current catalog skills are represented.
- Install commands match README.
- Responsive checks pass for mobile and desktop.
- Keyboard navigation and color contrast meet WCAG 2.2 AA expectations.
- Final review includes `review-rangers` before archive.
