// Color level detection and palette creation.
// Level 0: no color  Level 1: basic ANSI  Level 2: 256-color  Level 3: truecolor

function normalizeBooleanEnv(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "" || normalized === "0" || normalized === "false" || normalized === "no") return false;
  return true;
}

export function detectColorLevel({ env = process.env, stream = process.stdout } = {}) {
  if (normalizeBooleanEnv(env.NO_COLOR)) return 0;

  const force = env.FORCE_COLOR;
  if (force !== undefined) {
    const level = parseInt(force, 10);
    if (!isNaN(level)) return Math.min(Math.max(level, 0), 3);
    if (normalizeBooleanEnv(force) === true) return 1;
    if (normalizeBooleanEnv(force) === false) return 0;
  }

  if (!stream?.isTTY) return 0;
  if (env.CI) return 0;

  const colorterm = (env.COLORTERM || "").toLowerCase();
  if (colorterm === "truecolor" || colorterm === "24bit") return 3;

  const term = env.TERM || "";
  const termProgram = env.TERM_PROGRAM || "";
  if (term.includes("256color") || termProgram === "iTerm.app" || termProgram === "vscode") return 2;

  return 1;
}

// ANSI wrap helpers
function wrapBasic(code) {
  return (value) => `\x1b[${code}m${String(value)}\x1b[0m`;
}
function wrap256(code) {
  return (value) => `\x1b[38;5;${code}m${String(value)}\x1b[0m`;
}
function wrapRgb(r, g, b) {
  return (value) => `\x1b[38;2;${r};${g};${b}m${String(value)}\x1b[0m`;
}
function wrapBg256(code) {
  return (value) => `\x1b[48;5;${code}m${String(value)}\x1b[0m`;
}
function wrapBgRgb(r, g, b) {
  return (value) => `\x1b[48;2;${r};${g};${b}m${String(value)}\x1b[0m`;
}

const PALETTE = {
  primary: { l3: [0, 184, 169],   l2: 38,  l1: 36  },
  accent:  { l3: [77, 208, 225],  l2: 51,  l1: 36  },
  muted:   { l3: [0, 150, 136],   l2: 30,  l1: 2   },
  success: { l3: [80, 200, 120],  l2: 40,  l1: 32  },
  warn:    { l3: [255, 185, 0],   l2: 214, l1: 33  },
  error:   { l3: [240, 80, 80],   l2: 196, l1: 31  },
  info:    { l3: [60, 130, 220],  l2: 33,  l1: 34  },
  magenta: { l3: [200, 100, 200], l2: 141, l1: 35  },
};

const PALETTE_BG = {
  primary: { l3: [0, 184, 169],   l2: 38  },
  success: { l3: [40, 140, 80],   l2: 28  },
  warn:    { l3: [160, 100, 0],   l2: 136 },
  error:   { l3: [160, 40, 40],   l2: 124 },
};

const identity = (value) => String(value);

export function createTheme(level, options = {}) {
  const colorProfile = options.colorProfile || "mono-accent";
  if (level === 0) {
    const noop = identity;
    return {
      level,
      primary: noop, accent: noop, muted: noop,
      success: noop, warn: noop, error: noop, info: noop, magenta: noop,
      bold: noop, dim: noop, reset: noop, italic: noop,
      bgPrimary: noop, bgSuccess: noop, bgWarn: noop, bgError: noop,
    };
  }

  function makeColor(slot) {
    const p = PALETTE[slot];
    if (level === 3) return wrapRgb(...p.l3);
    if (level === 2) return wrap256(p.l2);
    // level 1: muted is dim, rest are basic codes
    if (slot === "muted") return wrapBasic(2);
    return wrapBasic(p.l1);
  }

  function makeBg(slot) {
    const p = PALETTE_BG[slot];
    if (!p) return identity;
    if (level === 3) return wrapBgRgb(...p.l3);
    if (level === 2) return wrapBg256(p.l2);
    return identity;
  }

  const baseTheme = {
    level,
    primary:   makeColor("primary"),
    accent:    makeColor("accent"),
    muted:     makeColor("muted"),
    success:   makeColor("success"),
    warn:      makeColor("warn"),
    error:     makeColor("error"),
    info:      makeColor("info"),
    magenta:   makeColor("magenta"),
    bold:      wrapBasic(1),
    dim:       wrapBasic(2),
    italic:    wrapBasic(3),
    reset:     wrapBasic(0),
    bgPrimary: makeBg("primary"),
    bgSuccess: makeBg("success"),
    bgWarn:    makeBg("warn"),
    bgError:   makeBg("error"),
  };

  if (colorProfile === "mono-accent") {
    return {
      ...baseTheme,
      success: baseTheme.accent,
      warn: identity,
      error: identity,
      info: baseTheme.accent,
      magenta: baseTheme.accent
    };
  }

  return baseTheme;
}
