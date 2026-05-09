# Troubleshooting and Recovery

## Goal

Recover quickly from Figma MCP setup and execution failures without compounding errors.

## Decision Flow

```text
Failure observed?
  -> Tools missing/not loading
     -> Recheck MCP server config, restart client session, re-auth
  -> Permission/resource error
     -> Verify link format, run whoami, confirm seat/plan and file access
  -> Rate-limit behavior
     -> Reduce read call volume, stage calls, wait/backoff, upgrade seat/plan if needed
  -> Missing expected tool
     -> Compare active client tools with official matrix, then choose a supported fallback
  -> Write failure
     -> Stop retries, inspect state with read tools, fix cause, retry scoped step
```

## Common Issues

### Tools are not visible

- Confirm server endpoint is correct.
- Confirm MCP server is started in client.
- Re-authenticate and restart client session.

### Permission denied or inaccessible resources

1. Validate Figma URL format and node id.
2. Run `whoami` to verify authenticated account.
3. Confirm authenticated user belongs to correct plan and has file access.
4. For write-to-canvas, confirm the user has edit access; Dev seats are read-only outside drafts.

### Rate limiting

- Read-heavy calls are rate-limited by plan/seat.
- Starter plan or View/Collab seats are limited to low monthly usage.
- Dev/Full seats on Professional or Organization plans have higher daily usage.
- Enterprise Dev/Full seats have the highest documented daily usage.
- Officially documented exempt tools include `add_code_connect_map`, `generate_figma_design`, and `whoami`.
- `use_figma` write tools may be documented outside standard read limits, but still require correct seat and edit permissions.
- Use smaller selections and fewer repeated reads.
- Prefer `get_metadata` preflight before broad `get_design_context`.
- Batch intent into fewer, targeted calls.

### Missing expected tools

- Official Figma MCP tools may not be exposed by every client plugin surface.
- Client-specific helpers, such as Codex `get_libraries`, are not official substitutes for every client.
- Prefer a documented fallback rather than forcing an unavailable tool.

### Write step errors

- Do not immediately retry the exact same large request.
- Split into smaller write actions.
- Verify partial outcomes using read tools before next step.
- For `create_new_file`, ensure a plan/team context is available.
- For `generate_diagram`, do not pre-create a blank FigJam file unless adding to an existing file is the explicit goal.
- For FigJam writes, use `figma-use-figjam` guidance where available instead of generic Figma Design assumptions.

### Expired image URLs

- Figma-hosted image URLs returned by MCP can expire.
- Refresh the design context to get new URLs, or download/save assets into the project and reference local files for durable implementation.

## Scoped Retry Pattern

1. Isolate the failed step.
2. Run one diagnostic read call (`get_metadata` or `whoami`).
3. Correct only the failing input.
4. Retry that one step.
5. Re-validate and continue.
