function asString(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function createResultDoc(title, sections = []) {
  return { type: "result-doc", title, sections };
}

export function section(title, blocks = []) {
  return { type: "section", title, blocks };
}

export function textBlock(text) {
  return { type: "text", text: asString(text) };
}

export function kvBlock(entries) {
  return { type: "kv", entries: entries || [] };
}

export function tableBlock(columns, rows) {
  return { type: "table", columns: columns || [], rows: rows || [] };
}

export function listBlock(items, bullet) {
  return { type: "list", items: items || [], bullet };
}

export function statusBlock(level, message, detail = "") {
  return { type: "status", level, message, detail };
}

function renderBlock(renderer, block) {
  if (!block) return "";
  if (block.type === "text") return asString(block.text);
  if (block.type === "kv") return renderer.kv(block.entries);
  if (block.type === "table") return renderer.table(block.columns, block.rows);
  if (block.type === "list") return renderer.list(block.items, block.bullet ? { bullet: block.bullet } : {});
  if (block.type === "status") return renderer.status(block.level, block.message, block.detail);
  return "";
}

export function renderResultDocText(renderer, appVersion, doc, options = {}) {
  const includeBanner = options.includeBanner !== false;
  const blocks = [];
  if (includeBanner) {
    blocks.push(renderer.banner(appVersion));
  }

  for (const sec of doc.sections || []) {
    const body = renderer.joinBlocks((sec.blocks || []).map((block) => renderBlock(renderer, block)));
    blocks.push(renderer.section(sec.title, body));
  }

  return renderer.joinBlocks(blocks);
}

