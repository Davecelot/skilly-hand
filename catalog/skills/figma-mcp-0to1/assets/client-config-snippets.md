# Client Config Snippets

## Remote Endpoint

`https://mcp.figma.com/mcp`

## Desktop Endpoint

`http://127.0.0.1:3845/mcp`

## Codex CLI (manual)

```bash
codex mcp add figma --url https://mcp.figma.com/mcp
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

## Claude Code (manual remote)

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
claude mcp list
```

## Claude Code (manual desktop)

```bash
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
claude mcp list
```

## Gemini CLI

```bash
gemini extensions install https://github.com/figma/mcp-server-guide
# then inside gemini CLI:
# /mcp auth figma
```
