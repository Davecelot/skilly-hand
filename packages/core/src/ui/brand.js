// Brand identity: SK logo, app name, tagline.

// Unicode block-letter "SK" — 5 rows, uses FULL BLOCK (U+2588) and LOWER HALF BLOCK (U+2584)
const LOGO_UNICODE = [
  " \u2588\u2588\u2588\u2588  \u2588\u2588  \u2588\u2588",
  "\u2588\u2588      \u2588\u2588  \u2588\u2588",
  " \u2588\u2588\u2588\u2588  \u2588\u2588\u2588\u2588\u2588\u2588",
  "    \u2588\u2588  \u2588\u2588  \u2588\u2588",
  " \u2588\u2588\u2588\u2588  \u2588\u2588  \u2588\u2588",
];

// ASCII fallback — 5 rows, same shape using pipe/underscore
const LOGO_ASCII = [
  " ____  _  _",
  "/___   |//",
  " ___/  |--\\",
  "    |  |  \\",
  " ___|  |   \\",
];

export function getBrand() {
  return {
    name: "skilly-hand",
    tagline: "portable AI skill orchestration",
    hint: "npx skilly-hand --help",
    logo: {
      unicode: LOGO_UNICODE,
      ascii: LOGO_ASCII,
    },
  };
}
