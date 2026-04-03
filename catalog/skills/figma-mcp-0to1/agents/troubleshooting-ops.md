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

### Rate limiting

- Read-heavy calls are rate-limited by plan/seat.
- Use smaller selections and fewer repeated reads.
- Prefer `get_metadata` preflight before broad `get_design_context`.
- Batch intent into fewer, targeted calls.

### Write step errors

- Do not immediately retry the exact same large request.
- Split into smaller write actions.
- Verify partial outcomes using read tools before next step.

## Scoped Retry Pattern

1. Isolate the failed step.
2. Run one diagnostic read call (`get_metadata` or `whoami`).
3. Correct only the failing input.
4. Retry that one step.
5. Re-validate and continue.
