import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { skills } from "./generated/skills.js";
import "./styles.css";

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
  ["01", "Run install", "Creates the managed agent instructions and portable skills."],
  ["02", "Pick targets", "Adds native adapters for the assistants your team uses."],
  ["03", "Run doctor", "Checks the install so routing stays predictable."]
];

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
      <div className="bento-card command-card">
        <p className="eyebrow">Setup command</p>
        <CopyCommand label="run" command="npx skilly-hand install" />
      </div>
      <div className="bento-card impact-card">
        <span>{skills.length}</span>
        <p>portable workflow skills routed into assistant-native files.</p>
      </div>
      <div className="bento-card flow-card">
        <div className="flow-map" aria-label="Workflow from detection to verification">
          {workflow.map(([title, body], index) => (
            <article className="flow-node" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="bento-card target-card">
        <p className="eyebrow">Targets</p>
        <TargetCarousel />
      </div>
    </div>
  );
}

function InstallSetup() {
  return (
    <section className="install-setup" id="install" aria-labelledby="install-title">
      <div className="section-heading">
        <p className="eyebrow">Install setup</p>
        <h2 id="install-title">One command, then the repo knows how agents should work.</h2>
      </div>
      <div className="setup-grid">
        <div className="setup-command">
          <CopyCommand label="install" command="npx skilly-hand install" />
          <p>Run it from the project root. Use <code>doctor</code> after setup when you want a quick health check.</p>
        </div>
        <ol className="setup-steps">
          {setupSteps.map(([number, title, body]) => (
            <li key={title}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SkillDirectory({ filteredSkills, selectedSkill, onSelect, query, onQueryChange }) {
  return (
    <>
      <div className="section-heading catalog-heading">
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
      </div>

      <div className="skills-shell">
        <section className="skill-panel" aria-label="Skill list">
          <div className="skill-list" role="list" aria-label="Available skills">
            {filteredSkills.map((skill, index) => (
              <article className={skill.id === selectedSkill.id ? "skill-row selected" : "skill-row"} id={`skill-${skill.id}`} key={skill.id} role="listitem">
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
              </article>
            ))}
            {filteredSkills.length === 0 ? (
              <p className="empty-state">No skills match this search yet.</p>
            ) : null}
          </div>
        </section>

        <aside className="skill-detail" aria-labelledby="skill-detail-title">
          <p className="eyebrow">Deep dive</p>
          <h3 id="skill-detail-title">{selectedSkill.title}</h3>
          <p>{selectedSkill.description}</p>
          <div className="source-path">
            <span>Source</span>
            <code>{selectedSkill.sourcePath}</code>
          </div>
          <pre className="skill-markdown">{selectedSkill.content}</pre>
        </aside>
      </div>
    </>
  );
}

function App() {
  const [query, setQuery] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState(skills[0]?.id);

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

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <nav className="topbar" aria-label="Primary">
          <a className="brand" href="#hero-title">skilly-hand</a>
          <div>
            <a href="#catalog">Skills</a>
            <a href="#install">Install</a>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Portable AI agent skills</p>
            <h1 id="hero-title">skilly-hand</h1>
            <p className="lede">Install curated, stack-aware workflows into the assistants already living in your repo.</p>
            <div className="hero-actions" aria-label="Quick links">
              <a className="button primary" href="#install">Install setup</a>
              <a className="button secondary" href="#catalog">Browse skills</a>
            </div>
          </div>

          <HeroBento />
        </div>
      </section>

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
