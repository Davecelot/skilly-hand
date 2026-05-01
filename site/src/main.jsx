import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { release } from "./generated/release.js";
import { skills } from "./generated/skills.js";
import "./styles.css";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((module) => ({ default: module.Dithering }))
);

const workflow = [
  ["Detect", "Read the project stack and recommend the right workflows."],
  ["Choose", "Filter the portable catalog by stack, tags, or team intent."],
  ["Install", "Write assistant-native skills and instructions into the repo."],
  ["Verify", "Run doctor checks so every target stays healthy."]
];

const supportedTargets = [
  ["Codex", "OpenAI", "codex.svg"],
  ["Claude Code", "Anthropic", "claude-code.svg"],
  ["Cursor", "Anysphere", "cursor.svg"],
  ["Copilot", "GitHub", "copilot.svg"],
  ["Gemini", "Google", "gemini.svg"],
  ["Antigravity", "Google", "antigravity.svg"],
  ["Windsurf", "Cognition", "windsurf.svg"],
  ["TRAE", "ByteDance", "trae.svg"]
];
const setupSteps = [
  {
    number: "01",
    title: "Run install",
    commandLabel: "install",
    command: "npx skilly-hand install",
    status: "Managed instructions ready",
    detail: "Creates AGENTS.md plus portable skills from the catalog.",
    output: ["detect stack", "write skill hooks", "sync routing map"]
  },
  {
    number: "02",
    title: "Pick targets",
    commandLabel: "target",
    command: "npx skilly-hand install --agent codex --agent cursor",
    status: "Assistant adapters selected",
    detail: "Adds native files for the coding assistants your team uses.",
    output: ["codex rules", "cursor rules", "shared skills"]
  },
  {
    number: "03",
    title: "Run doctor",
    commandLabel: "verify",
    command: "npx skilly-hand doctor",
    status: "Routing stays predictable",
    detail: "Checks generated files, skill manifests, and target health.",
    output: ["manifests ok", "targets ok", "ready for agents"]
  }
];

function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(query.matches);

    function updatePreference(event) {
      setShouldReduceMotion(event.matches);
    }

    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return shouldReduceMotion;
}

function useReveal({ threshold = 0.22, rootMargin = "0px 0px -8% 0px" } = {}) {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || shouldReduceMotion || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldReduceMotion, threshold]);

  return { ref, isVisible };
}

function Reveal({ as = "div", children, className = "", delay = 0, variant = "rise", ...props }) {
  const { ref, isVisible } = useReveal();
  const Component = as;
  const revealClass = `reveal reveal-${variant}${isVisible ? " reveal-visible" : ""}${className ? ` ${className}` : ""}`;
  const style = delay ? { ...props.style, "--reveal-delay": `${delay}ms` } : props.style;

  return (
    <Component ref={ref} className={revealClass} style={style} {...props}>
      {children}
    </Component>
  );
}

function smoothScrollToHash(event, shouldReduceMotion) {
  if (shouldReduceMotion || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const anchor = event.currentTarget;
  const hash = anchor.hash;

  if (!hash || anchor.pathname !== window.location.pathname) {
    return;
  }

  const target = document.querySelector(hash);

  if (!target) {
    return;
  }

  event.preventDefault();

  const startY = window.scrollY;
  const targetY = target.getBoundingClientRect().top + startY;
  const distance = targetY - startY;
  const duration = Math.min(950, Math.max(550, Math.abs(distance) * 0.52));
  const startTime = performance.now();
  let frameId = 0;
  let isCancelled = false;

  function cancel() {
    isCancelled = true;
    window.cancelAnimationFrame(frameId);
    removeCancelListeners();
  }

  function removeCancelListeners() {
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
  }

  window.addEventListener("wheel", cancel, { once: true, passive: true });
  window.addEventListener("touchstart", cancel, { once: true, passive: true });
  window.addEventListener("keydown", cancel, { once: true });

  function easeOutCubic(progress) {
    return 1 - Math.pow(1 - progress, 3);
  }

  function step(now) {
    if (isCancelled) {
      return;
    }

    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY + distance * easeOutCubic(progress));

    if (progress < 1) {
      frameId = window.requestAnimationFrame(step);
      return;
    }

    removeCancelListeners();
    history.pushState(null, "", hash);
    target.focus?.({ preventScroll: true });
  }

  frameId = window.requestAnimationFrame(step);
}

function CopyCommand({ command, label }) {
  const [copied, setCopied] = useState(false);
  const [pulseId, setPulseId] = useState(0);
  const timeoutRef = useRef();

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  async function copy() {
    try {
      await navigator.clipboard?.writeText(command);
    } catch {
      // The visual feedback should still fire when clipboard access is unavailable.
    }
    setCopied(true);
    setPulseId((current) => current + 1);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`command-row pulse-${pulseId % 2}${copied ? " copied" : ""}`}>
      <span>{label}</span>
      <code>{command}</code>
      <button type="button" onClick={copy} aria-label={`Copy ${command}`}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function TargetCarousel() {
  const assetBase = import.meta.env.BASE_URL;

  return (
    <div className="target-marquee" aria-label="Supported AI coding assistants">
      <div className="target-track">
        {[0, 1].map((group) => (
          <div className="target-group" key={group} aria-hidden={group === 1 ? "true" : undefined}>
            {supportedTargets.map(([name, company, logoPath]) => (
              <article className="target-logo-card" key={`${name}-${group}`}>
                <span className="target-mark">
                  <img src={`${assetBase}${logoPath}`} alt="" loading="lazy" />
                </span>
                <span className="target-copy">
                  <span className="target-name">{name}</span>
                  <span className="target-company">{company}</span>
                </span>
              </article>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroBento() {
  return (
    <div className="hero-bento" aria-label="skilly-hand setup overview">
      <Reveal as="div" className="bento-card command-card" delay={120}>
        <p className="eyebrow">Setup command</p>
        <CopyCommand label="run" command="npx skilly-hand install" />
      </Reveal>
      <Reveal as="div" className="bento-card impact-card" delay={210}>
        <span>{skills.length}</span>
        <p>portable workflow skills routed into assistant-native files.</p>
      </Reveal>
      <Reveal as="div" className="bento-card flow-card" delay={300}>
        <div className="flow-map" aria-label="Workflow from detection to verification">
          {workflow.map(([title, body], index) => (
            <Reveal as="article" className="flow-node" delay={index * 45} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>
      <Reveal as="div" className="bento-card target-card" delay={390}>
        <p className="eyebrow">Targets</p>
        <TargetCarousel />
      </Reveal>
    </div>
  );
}

function InstallSetup() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = setupSteps[activeStepIndex];

  return (
    <section className="install-setup" id="install" aria-labelledby="install-title">
      <Reveal className="section-heading">
        <p className="eyebrow">Install setup</p>
        <h2 id="install-title">One command, then the repo knows how agents should work.</h2>
      </Reveal>
      <div className="setup-console">
        <Reveal className="setup-preview" delay={120} aria-live="polite">
          <div className="setup-window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="setup-preview-head">
            <div>
              <p className="eyebrow">Step {activeStep.number}</p>
              <h3>{activeStep.status}</h3>
            </div>
            <span className="setup-state">active</span>
          </div>
          <CopyCommand label={activeStep.commandLabel} command={activeStep.command} />
          <p>{activeStep.detail}</p>
          <div className="setup-output" aria-label={`${activeStep.title} output`}>
            {activeStep.output.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Reveal>
        <Reveal className="setup-table-card" delay={180}>
          <div className="setup-table-header">
            <span>#</span>
            <span>Action</span>
            <span>Status</span>
          </div>
          <ol className="setup-steps" aria-label="Install setup steps">
            {setupSteps.map((step, index) => (
              <li key={step.title}>
                <button
                  type="button"
                  className={index === activeStepIndex ? "selected" : ""}
                  aria-pressed={index === activeStepIndex}
                  onClick={() => setActiveStepIndex(index)}
                >
                  <span>{step.number}</span>
                  <strong>{step.title}</strong>
                  <small>{step.status}</small>
                </button>
              </li>
            ))}
          </ol>
          <div className="setup-table-footer">
            <span>Showing {setupSteps.length} steps</span>
            <span>Click a row to preview</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ReleaseBanner() {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="release-band" id="release" aria-labelledby="release-title">
      <Reveal
        className="release-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="release-dither" aria-hidden="true">
          <Suspense fallback={<div className="release-shader-fallback" />}>
            <Dithering
              colorBack="#00000000"
              colorFront="#7ee0d4"
              shape="warp"
              type="4x4"
              speed={shouldReduceMotion ? 0 : isHovered ? 0.55 : 0.18}
              className="release-shader"
              minPixelRatio={1}
            />
          </Suspense>
        </div>

        <Reveal className="release-summary" delay={120}>
          <p className="eyebrow">Latest release</p>
          <h2 id="release-title">v{release.version}</h2>
          <p>Current changelog notes, generated from the matching release entry before the site ships.</p>
          <div className="release-meta" aria-label="Release metadata">
            <span>stable</span>
            <time dateTime={release.date}>{release.date}</time>
          </div>
          <a className="release-link" href={release.npmUrl}>
            View npm release
          </a>
        </Reveal>

        <Reveal className="release-notes" delay={220} aria-label={`Changes in skilly-hand ${release.version}`}>
          {release.sections.length > 0 ? (
            release.sections.map((section, index) => (
              <Reveal as="article" className="release-note-group" key={section.title} delay={index * 55}>
                <h3>{section.title}</h3>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>
            ))
          ) : (
            <p className="release-empty">No categorized changes were recorded for this release.</p>
          )}
        </Reveal>
      </Reveal>
    </section>
  );
}

function SkillDirectory({ filteredSkills, selectedSkill, onSelect, query, onQueryChange }) {
  return (
    <>
      <Reveal className="section-heading catalog-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2 id="catalog-title">Skills you can scan like a directory.</h2>
        </div>
        <label className="search">
          <span id="skill-search-label">Search skills</span>
          <input
            aria-labelledby="skill-search-label"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="React, Figma, security..."
          />
        </label>
      </Reveal>

      <Reveal className="skills-shell" delay={120}>
        <Reveal as="section" className="skill-panel" delay={180} aria-label="Skill list">
          <div className="skill-list" role="list" aria-label="Available skills">
            {filteredSkills.map((skill, index) => (
              <Reveal
                as="article"
                className={skill.id === selectedSkill.id ? "skill-row selected" : "skill-row"}
                delay={Math.min(index, 8) * 38}
                id={`skill-${skill.id}`}
                key={skill.id}
                role="listitem"
              >
                <a className="skill-rank" href={`#skill-${skill.id}`} aria-label={`${skill.title} permalink`}>
                  {String(index + 1).padStart(2, "0")}
                </a>
                <div className="skill-main">
                  <p className="skill-id">{skill.id}</p>
                  <h3>{skill.title}</h3>
                </div>
                <button type="button" aria-pressed={skill.id === selectedSkill.id} onClick={() => onSelect(skill)}>
                  Deep dive
                </button>
              </Reveal>
            ))}
            {filteredSkills.length === 0 ? (
              <p className="empty-state">No skills match this search yet.</p>
            ) : null}
          </div>
        </Reveal>

        <Reveal as="aside" className="skill-detail" delay={260} aria-labelledby="skill-detail-title">
          <p className="eyebrow">Deep dive</p>
          <h3 id="skill-detail-title">{selectedSkill.title}</h3>
          <p>{selectedSkill.description}</p>
          <div className="source-path">
            <span>Source</span>
            <code>{selectedSkill.sourcePath}</code>
          </div>
          <pre className="skill-markdown">{selectedSkill.content}</pre>
        </Reveal>
      </Reveal>
    </>
  );
}

function App() {
  const [query, setQuery] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState(skills[0]?.id);
  const shouldReduceMotion = useReducedMotion();

  const filteredSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const content = `${skill.title} ${skill.id} ${skill.description} ${skill.tags.join(" ")} ${skill.content}`.toLowerCase();
      return !normalizedQuery || content.includes(normalizedQuery);
    });
  }, [query]);
  const selectedSkill = useMemo(
    () => filteredSkills.find((skill) => skill.id === selectedSkillId) || filteredSkills[0] || skills[0],
    [filteredSkills, selectedSkillId]
  );
  const handleSectionLinkClick = (event) => smoothScrollToHash(event, shouldReduceMotion);

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <nav className="topbar" aria-label="Primary">
          <Reveal as="a" className="brand" href="#hero-title" onClick={handleSectionLinkClick}>
            skilly-hand
          </Reveal>
          <div>
            <Reveal as="a" href="#release" delay={60} onClick={handleSectionLinkClick}>Release</Reveal>
            <Reveal as="a" href="#catalog" delay={110} onClick={handleSectionLinkClick}>Skills</Reveal>
            <Reveal as="a" href="#install" delay={160} onClick={handleSectionLinkClick}>Install</Reveal>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <Reveal as="p" className="eyebrow">Portable AI agent skills</Reveal>
            <Reveal as="h1" id="hero-title" delay={80}>skilly-hand</Reveal>
            <Reveal as="p" className="lede" delay={170}>Install curated, stack-aware workflows into the assistants already living in your repo.</Reveal>
            <Reveal className="hero-actions" delay={260} aria-label="Quick links">
              <a className="button primary" href="#install" onClick={handleSectionLinkClick}>Install setup</a>
              <a className="button secondary" href="#catalog" onClick={handleSectionLinkClick}>Browse skills</a>
            </Reveal>
          </div>

          <HeroBento />
        </div>
      </section>

      <ReleaseBanner />

      <InstallSetup />

      <section className="catalog" id="catalog" aria-labelledby="catalog-title">
        <SkillDirectory
          filteredSkills={filteredSkills}
          selectedSkill={selectedSkill}
          onSelect={(skill) => setSelectedSkillId(skill.id)}
          query={query}
          onQueryChange={setQuery}
        />
      </section>
      <footer className="site-footer" aria-label="Project links">
        <span>skilly-hand</span>
        <nav aria-label="External links">
          <a href="https://www.npmjs.com/package/@skilly-hand/skilly-hand">npx skilly-hand install</a>
          <a href="https://github.com/Davecelot/skilly-hand">GitHub</a>
          <a href="https://www.linkedin.com/in/villarroeldiego/">LinkedIn</a>
        </nav>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
