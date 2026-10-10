# SECURITY.md

**Owner: dinesh-gix**

# GiX-AI Security Documentation

## Security Principles

1. **Defense in Depth** — Multiple layers of validation and authorization
2. **Least Privilege** — Minimum permissions required for each operation
3. **Fail Secure** — Default deny, explicit allow
4. **Auditability** — All security-relevant events logged and persisted
5. **Local-First** — No external dependencies for core security functions
6. **No Trust in Model Output** — Model output is untrusted input

---

## Filesystem Security

### Path Traversal Prevention

All file paths must pass through `canonicalizePath()` before use:

```typescript
function canonicalizePath(workspaceRoot: string, requestedPath: string): string {
  // 1. Resolve to absolute path
  const absolute = path.resolve(workspaceRoot, requestedPath);

  // 2. Ensure it's within workspace root
  const normalizedRoot = path.resolve(workspaceRoot);
  if (!absolute.startsWith(normalizedRoot + path.sep) && absolute !== normalizedRoot) {
    throw new SecurityError('Path traversal attempt detected');
  }

  // 3. Resolve symlinks (prevents symlink escape)
  const realPath = fs.realpathSync.native(absolute);
  if (!realPath.startsWith(normalizedRoot + path.sep) && realPath !== normalizedRoot) {
    throw new SecurityError('Symlink escape attempt detected');
  }

  return realPath;
}
```

### Symlink Escape Prevention

- All paths resolved with `fs.realpathSync.native()` before operations
- Symlinks pointing outside workspace root are rejected
- Workspace root itself is canonicalized at registration time

### Binary File Handling

- File reads bounded by configurable max size (default: 1MB)
- Binary detection via `file-type` or heuristic (null bytes, high entropy)
- Binary files returned as base64 with metadata, not raw content
- Tool schemas reject binary content for text-based tools

### Ignored Files

- Respect `.gitignore`, `.gixignore`, global git ignores
- Configurable additional ignore patterns
- `list_files` and `search_code` honor ignore rules by default

### Large Output Handling

- All file reads and command outputs bounded by `maxOutputBytes` config
- Truncation with clear indication (`... [truncated, N bytes omitted]`)
- Streaming for large searches with pagination

---

## Shell Command Execution

### Bounded Execution Interface

```typescript
interface CommandExecution {
  command: string;           // Executable name only (no shell)
  args: string[];            // Pre-validated arguments
  cwd: string;               // Canonicalized, within workspace
  env: Record<string, string>;  // Allowlisted env vars only
  timeoutMs: number;         // Hard limit
  maxOutputBytes: number;    // Hard limit
  allowNetwork: boolean;     // Default false
}
```

### Protection Measures

1. **No Shell Interpolation** — `execFile` only, never `exec` or `spawn` with shell
2. **Allowlist Validation** — Command must be in configured allowlist
3. **Argument Validation** — Each argument validated against schema
4. **Working Directory** — Canonicalized, within workspace
5. **Environment** — Only allowlisted vars passed (PATH, HOME, LANG, etc.)
6. **Resource Limits** — CPU time, memory, output size, wall time
7. **Network Isolation** — `allowNetwork: false` by default (no egress)
8. **Process Isolation** — Each command in new process group, killed on timeout

### Dangerous Command Blocklist

Default deny for:
- `rm -rf /`, `rm -rf *`, `dd`, `mkfs`, `fdisk`
- `curl`, `wget`, `nc`, `telnet`, `ssh` (unless `allowNetwork: true`)
- `sudo`, `su`, `doas`, `pkexec`
- Shell builtins: `eval`, `exec`, `source`, `.`

---

## Tool Schema Validation

### Input Validation

Every tool defines a Zod schema for inputs:
- Strict validation (no extra properties)
- Size limits on string/array fields
- Path fields validated via `canonicalizePath()`
- Command fields validated against allowlist

### Output Validation

- Tool outputs validated against output schema
- Size limits enforced
- Structured error responses for validation failures

---

## Permission Policies

### Policy Model

```typescript
type PermissionPolicy = 'allow' | 'deny' | 'ask';

interface PermissionRule {
  tool: string;              // Tool name or '*'
  policy: PermissionPolicy;
  conditions?: {
    paths?: string[];        // Glob patterns
    args?: Record<string, unknown>;  // Argument constraints
  };
}
```

### Decision Flow

```
Tool Invocation
      │
      ▼
┌─────────────┐
│ Check Cache │──Hit──► Return Cached Decision
└──────┬──────┘
       │ Miss
       ▼
┌──────────────────┐
│ Match Rules      │──Deny──► Deny (audit)
└────────┬─────────┘
         │ Allow
         ▼
┌──────────────────┐
│ Policy = 'ask'?  │──No (allow)──► Allow (audit)
└────────┬─────────┘
         │ Yes
         ▼
┌──────────────────┐
│ Check Approval   │──Valid & Not Expired──► Allow (audit)
│  (pending/allowed)│
└────────┬─────────┘
         │ Not found or expired
         ▼
┌──────────────────┐
│ Request Approval │──User Responds──► Allow/Deny (audit)
└──────────────────┘
```

### Approval Binding & Expiry

- Approvals bound to specific tool + input hash
- Any input change requires new approval
- Default expiry: 5 minutes (configurable)
- Stale approvals automatically expire
- Concurrent edits: approval invalidated if file modified externally

### Permission Persistence

- All decisions persisted with timestamp, decider, reason
- Audit log queryable via API
- No in-memory-only decisions

---

## Prompt Injection & Untrusted Content

### Threat Model

Untrusted inputs that could influence agent behavior:
- Model output (tool calls, reasoning)
- Repository content (AGENTS.md, README, code comments)
- User-provided prompts
- External API responses

### Mitigations

1. **Structured Tool Calls** — Never execute raw model text as commands
2. **Schema Validation** — All tool calls validated against strict schemas
3. **Permission Gates** — All mutating operations require authorization
4. **AGENTS.md Sandboxing** — Repository instructions parsed, not executed
5. **Context Sanitization** — Repository content treated as data, not instructions
6. **Output Encoding** — All outputs escaped for display context

### AGENTS.md Handling

- Parsed as structured configuration, not executable code
- Only allowlisted directives supported (e.g., `tool.allow`, `context.include`)
- Unknown directives ignored with warning
- No shell commands, no dynamic evaluation

---

## Secret Storage & Log Redaction

### Secret Types

- API keys (model providers, GitHub, etc.)
- Database passwords
- OAuth tokens
- SSH keys

### Storage

- **Development**: Encrypted config file (`~/.config/gix/secrets.enc`) with OS keyring fallback
- **Production**: External secret manager (HashiCorp Vault, AWS Secrets Manager, etc.)
- **Never** in plaintext files, environment variables (except CI), or git

### Log Redaction

```typescript
function redactSecrets(input: string): string {
  // Patterns for common secret formats
  const patterns = [
    /sk-[a-zA-Z0-9]{48}/g,           // OpenAI-style
    /ghp_[a-zA-Z0-9]{36}/g,          // GitHub PAT
    /gho_[a-zA-Z0-9]{36}/g,          // GitHub OAuth
    /glpat-[a-zA-Z0-9]{20}/g,        // GitLab PAT
    /xoxb-[a-zA-Z0-9-]{50,}/g,       // Slack Bot
    /xoxp-[a-zA-Z0-9-]{50,}/g,       // Slack User
    /[a-zA-Z0-9]{32,}/g,             // Generic high-entropy strings (heuristic)
  ];

  return patterns.reduce((str, pattern) => str.replace(pattern, '[REDACTED]'), input);
}
```

- Applied to all structured logs before output
- Applied to event payloads before persistence (optional, config-controlled)
- Not applied to user-visible diffs (user controls their own secrets)

---

## Provider Data Exposure

### Model Provider Communication

- Only necessary context sent to provider
- Secrets never included in prompts
- Tool results sanitized before sending to model (if configured)
- Provider responses validated before use

### Data Minimization

- Context selection respects token budgets
- Sensitive file patterns excluded by default (`.env*`, `*.key`, `*.pem`, `secrets/*`)
- Configurable redaction rules for context

---

## Network Restrictions

### Local API Server

- Binds to `127.0.0.1` by default (loopback only)
- Configurable bind address (documented security impact)
- TLS optional for local (self-signed cert for localhost)
- CORS restricted to configured origins (default: none)

### Browser-Origin Protection

- `Origin` header validated against allowlist
- `Sec-Fetch-Site` / `Sec-Fetch-Mode` checked
- CSRF tokens for state-changing operations
- `SameSite=Strict` cookies for session auth

### Remote Worker Egress

- Default: No network egress
- Allowlist for required endpoints (model API, package registries)
- DNS resolution restricted
- No inbound connections to worker

---

## Remote Worker Isolation

### Execution Environment

- Separate process (not container by default, config option)
- Dedicated workspace copy (no shared filesystem)
- Resource limits enforced via OS (cgroups on Linux, Job Objects on Windows)
- No access to host Docker socket, SSH agent, GPG agent

### Credential Restrictions

- Workers receive only task-scoped credentials
- No access to user's global config or secrets
- Model API calls proxied through local server (token never leaves)

### Resource Limits

| Resource | Default Limit | Configurable |
|----------|---------------|--------------|
| CPU Time | 5 minutes | Yes |
| Memory | 2 GB | Yes |
| Disk | 5 GB | Yes |
| Output | 10 MB | Yes |
| Wall Time | 10 minutes | Yes |
| Processes | 50 | Yes |
| File Descriptors | 1024 | Yes |

---

## Resource Exhaustion Protection

### Agent-Level Budgets

- Max steps per task (default: 50)
- Max tokens per task (default: 100k)
- Max wall time per task (default: 10 min)
- Max cost per task (default: $1.00)
- Max concurrent tasks per session (default: 3)

### System-Level Limits

- SQLite WAL mode for concurrent reads
- Connection pooling for database
- Event bus backpressure handling
- Streaming responses to avoid buffering

---

## Cancellation & Crash Recovery

### Cooperative Cancellation

- Cancellation token passed through all async operations
- Model requests cancelled via provider API (if supported)
- Tool execution interrupted via process kill
- Database transactions rolled back on cancellation

### Crash Recovery

- Checkpoints at each major state transition
- Task state recoverable from last checkpoint
- Event log replay for verification
- Incomplete tool invocations marked failed, not lost
- No automatic retry of non-idempotent operations

### Uncertain Side Effects

- After crash: never blindly repeat shell commands
- Recovery presents diff for user confirmation
- Idempotency keys for external API calls

---

## Audit Events

All security-relevant events logged:

| Event | Fields |
|-------|--------|
| `PermissionDecision` | taskId, tool, inputHash, policy, decision, decider, reason |
| `PathAccess` | taskId, path, operation (read/write/execute), allowed |
| `CommandExecution` | taskId, command, args, cwd, allowed, exitCode |
| `SecretAccess` | taskId, secretRef, operation, allowed |
| `NetworkRequest` | taskId, destination, allowed |
| `ConfigChange` | user, setting, oldValue, newValue |
| `AuthAttempt` | source, success, reason |

---

## Security Testing Requirements

### Mandatory Tests

1. Path traversal attempts (various encodings, symlinks)
2. Symlink escape (nested, absolute, relative)
3. Shell injection via tool arguments
4. Oversized file reads and command outputs
5. Binary file handling
6. Ignored file access
7. Permission policy enforcement (allow/deny/ask)
8. Approval expiry and binding
9. Concurrent edit detection
10. Model output with malicious tool calls
11. AGENTS.md directive injection
12. Secret redaction in logs
13. API origin validation
14. Worker resource limit enforcement
15. Cancellation during tool execution
16. Recovery from interrupted task

### Test Evidence

All security tests must:
- Run in CI on every commit
- Produce machine-readable results
- Fail build on any regression
- Include negative test cases (attack attempts that must fail)

---

## Incident Response

### Security Incident Classification

| Severity | Criteria | Response Time |
|----------|----------|---------------|
| Critical | Active exploitation, data exfiltration | 1 hour |
| High | Vulnerability with known exploit | 24 hours |
| Medium | Vulnerability requiring specific conditions | 1 week |
| Low | Defense-in-depth improvement | Next release |

### Responsible Disclosure

- Report to: security@dinesh-gix.github.io
- PGP key: [link to key]
- Acknowledgment within 24 hours
- Fix timeline communicated within 72 hours

---

## Compliance Considerations

- **GDPR**: No personal data processed without consent; right to deletion via workspace deletion
- **SOC 2**: Audit logs, access controls, encryption at rest (config), availability monitoring
- **Supply Chain**: `pnpm audit` in CI, dependency pinning, minimal dependencies