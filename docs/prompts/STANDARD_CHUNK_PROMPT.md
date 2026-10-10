# STANDARD_CHUNK_PROMPT.md

**Owner: dinesh-gix**

# Standard Chunk Implementation Prompt

Use this template for all implementation chunks after P00.01.

## Chunk Information

**Chunk ID**: P{XX}.{YY}
**Title**: {Chunk Title}
**MVP**: {1|2|3}
**Dependencies**: {List of chunk IDs that must be VERIFIED or ACCEPTED}

## Prerequisites

- [ ] All dependency chunks are VERIFIED or ACCEPTED
- [ ] Repository inspected (run inspection commands)
- [ ] STATUS.md and CHUNK_REGISTER.md read
- [ ] Chunk prompt read and understood

## Implementation Requirements

### 1. Scope

Implement ONLY what is described in this chunk's acceptance criteria.
Do not implement future chunks or refactor unrelated code.

### 2. Files to Create/Modify

List specific files expected to be created or modified:

```
packages/<name>/src/<file>.ts
packages/<name>/src/<file>.test.ts
apps/<name>/src/<file>.tsx
```

### 3. Code Conventions

- Follow existing patterns in the codebase
- Use strict TypeScript (`strict: true`)
- No `any` types (use `unknown` with narrowing)
- Zod schemas for all external boundaries
- Discriminated unions for state machines
- Explicit return types for public APIs
- Co-located tests (`*.test.ts`)

### 4. Testing Requirements

- Unit tests for all new functions/classes
- Integration tests for cross-package interactions
- Security tests for any file/command/network operations
- Deterministic tests (use fake providers, fixed timestamps)
- Target: 80% coverage for business logic

### 5. Security Requirements

- All file paths canonicalized before use
- All command execution through bounded interface
- All tool inputs validated against Zod schemas
- Permission checks for all mutating operations
- Secrets redacted from logs
- No trust in model output or repository content

## Implementation Steps

### Step 1: Create Types and Interfaces

Define TypeScript interfaces and Zod schemas in the appropriate package.

### Step 2: Implement Core Logic

Implement the main functionality following the architectural patterns.

### Step 3: Add Tests

Create comprehensive tests alongside implementation.

### Step 4: Run Verification

```bash
# In package directory or root
pnpm install          # If new dependencies added
pnpm build            # Must pass
pnpm typecheck        # Must pass
pnpm lint             # Must pass
pnpm test             # Must pass
pnpm test --filter=<package>  # Package-specific tests
```

### Step 5: Security Review

Self-review against security checklist:
- [ ] Path traversal prevented
- [ ] Command injection prevented
- [ ] Input validation on all boundaries
- [ ] Permission checks on mutations
- [ ] Secrets not logged
- [ ] Resource limits enforced

### Step 6: Record Evidence

Create report in `docs/reports/P{XX}.{YY}_report.md`

### Step 7: Update Tracking

Update `docs/CHUNK_REGISTER.md` and `docs/STATUS.md` with actual results.

## Verification Checklist

Before marking chunk as VERIFIED:

- [ ] All acceptance criteria met with evidence
- [ ] All tests pass (provide test output)
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Security review complete
- [ ] Report created in docs/reports/
- [ ] CHUNK_REGISTER.md updated with status VERIFIED
- [ ] STATUS.md updated with current state
- [ ] No blockers remain

## Blocker Handling

If blocked:

1. Stop implementation
2. Record in report:
   - Precise root cause
   - Error output and exit code
   - Remediation attempts
   - Blocker type: environmental / architectural / dependency / code defect
   - Minimum safe action to proceed
3. Update CHUNK_REGISTER.md status to BLOCKED
4. Update STATUS.md with blocker details
5. Do not proceed to dependent chunks

## Report Template

Create `docs/reports/P{XX}.{YY}_report.md`:

```markdown
# Chunk P{XX}.{YY} Report

## Summary
Brief description of work done.

## Files Created/Changed
- path/to/file.ts

## Commands Executed
| Command | Exit Code | Output Summary |
|---------|-----------|----------------|
| pnpm install | 0 | Success |
| pnpm typecheck | 0 | No errors |
| pnpm test --filter=contracts | 0 | 45 tests passed |

## Tests
- Passed: X
- Failed: Y (list with details)
- Not Run: Z (reasons)

## Security Review
- [ ] Path traversal: Tested
- [ ] Command injection: Tested
- [ ] Input validation: Verified
- [ ] Permission checks: Verified
- [ ] Secret redaction: Verified
- [ ] Resource limits: Verified

## Acceptance Criteria
- [ ] Criterion 1: Verified (evidence: ...)
- [ ] Criterion 2: Verified (evidence: ...)

## Remaining Issues
- Issue 1: Description and impact

## Next Recommended Action
- Start chunk P{XX}.{YY+1} or resolve blocker
```

## Common Patterns

### Adding a New Package

1. Create directory: `mkdir -p packages/<name>/src`
2. Create `package.json` with workspace config
3. Create `tsconfig.json` extending base
4. Add to `pnpm-workspace.yaml` if not using glob
5. Run `pnpm install` to link

### Adding a Dependency

```bash
# Workspace dependency
pnpm add @gix/contracts --filter=@gix/config

# External dependency
pnpm add zod --filter=@gix/config
pnpm add -D vitest --filter=@gix/config
```

### Running Single Package Commands

```bash
pnpm --filter=@gix/contracts build
pnpm --filter=@gix/contracts test
pnpm --filter=@gix/contracts typecheck
pnpm --filter=@gix/contracts lint
```

### Database Migrations (when applicable)

```bash
# Create migration
# Edit packages/persistence/migrations/001_initial_schema.sql

# Run migrations (in code)
# See persistence package for migration runner
```

## Architecture Reminders

### Package Dependencies

```
contracts (leaf)
  ↑
config, event-bus
  ↑
persistence, workspace, model-gateway, permission-engine
  ↑
context-engine, tool-runtime, verification, task-engine
  ↑
agent-core
  ↑
apps/*
```

### Agent Lifecycle

Task submission → workspace resolution → bounded context retrieval → model request → tool validation → permission evaluation → execution → event persistence → verification → final result

### Event Types

TaskStarted, ContextRetrieved, ModelRequested, ModelResponded, ToolInvoked, ToolCompleted, ToolFailed, PermissionRequested, PermissionGranted, PermissionDenied, VerificationStarted, VerificationCompleted, CheckpointCreated, TaskCompleted, TaskFailed, TaskCancelled

## Getting Help

- Check `docs/DECISIONS.md` for architectural context
- Check `docs/ARCHITECTURE.md` for system design
- Check `docs/API_AND_DATA_MODEL.md` for data structures
- Check `docs/SECURITY.md` for security requirements
- Look at existing packages for patterns
- Ask in team channel