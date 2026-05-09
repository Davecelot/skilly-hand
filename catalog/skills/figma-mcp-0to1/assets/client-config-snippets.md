# Client Config Snippets

## Remote Endpoint

`https://mcp.figma.com/mcp`

## Desktop Endpoint

`http://127.0.0.1:3845/mcp`

## Codex CLI (manual)

```bash
codex mcp add figma --url https://mcp.figma.com/mcp
```

## Codex App

Use the Figma plugin/app install path in Codex when available, then complete the OAuth authentication flow.

## Claude Code Plugin

```bash
claude plugin install figma@claude-plugins-official
```

## Claude Code (manual remote)

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
claude mcp list
```

## Claude Code (manual remote, user scope)

```bash
claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp
claude mcp list
```

## Claude Code (manual desktop)

```bash
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
claude mcp list
```

## VS Code `mcp.json` (remote)

```json
{
  "inputs": [],
  "servers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "type": "http"
    }
  }
}
```

## VS Code `mcp.json` (desktop)

```json
{
  "servers": {
    "figma-desktop": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

## Cursor MCP config (remote)

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

## Cursor Plugin

```bash
/add-plugin figma
```

## Gemini CLI

Use the Figma MCP catalog/client instructions for the Gemini CLI extension. Figma currently lists Gemini CLI as a supported client for remote and desktop setup.

## Cursor MCP config (desktop)

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

## Other Desktop MCP Config

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

## Agent Coverage Notes

- Figma-supported and skilly-hand-supported: `codex`, `claude`, `cursor`, `copilot`.
- Figma-supported and skilly-hand-supported via client docs/catalog: `gemini`.
- Figma-supported but not skilly-hand-native: Amazon Q, Android Studio, VS Code, Warp, Augment, Factory, Firebender, Kiro, OpenHands, Replit.
- skilly-hand-supported but not source-backed in current Figma docs: `antigravity`, `windsurf`, `trae`.
