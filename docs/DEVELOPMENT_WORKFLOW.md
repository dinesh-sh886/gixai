# DEVELOPMENT_WORKFLOW.md

**Owner: dinesh-gix**

# GiX-AI Development Workflow

## Session Protocol

Every development session must follow this protocol:

### 1. Repository Inspection

```bash
pwd
git rev-parse --show-toplevel
git status --short --branch
git remote -v
git log -5 --oneline
node --version
npm --version
pnpm --version
```

Record all outputs. If any command fails, record the failure.

### 2. Read Status Documents

```bash
cat docs/STATUS.md
cat docs/CHUNK_REGISTER.md
```

Identify:
- Current project status
- Current branch and commit
- Latest completed chunk
- Current chunk (should be IN_PROGRESS or NOT_STARTED)
- MVP progress
- Known blockers

### 3. Identify Current Chunk

From `CHUNK_REGISTER.md`, find the chunk with status `IN_PROGRESS` or the first `NOT_STARTED` chunk whose dependencies are all `VERIFIED` or `ACCEPTED`.

### 4. Read Chunk Prompt

```bash
cat docs/prompts/P{XX}.{YY}_PROMPT.md
```

Or for standard chunks:
```bash
cat docs/prompts/STANDARD_CHUNK_PROMPT.md
```

### 5. Implement Only That Chunk

- Do not implement future chunks
- Do not refactor unrelated code
- Complete the chunk fully before moving on

### 6. Run Applicable Checks

```bash
# For P00.01-P00.03
pnpm install
pnpm build
pnpm typecheck
pnpm lint

# For chunks with tests
pnpm test --filter=<package>

# For all
git status --short
git diff --check
git diff --stat
git diff
```

### 7. Record Results

Create report in `docs/reports/P{XX}.{YY}_report.md`:

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

## Tests
- Passed: X
- Failed: Y (list)
- Not Run: Z (reasons)

## Security Review
- Path traversal: Tested
- Command injection: Tested
- etc.

## Acceptance Criteria
- [ ] Criterion 1: Verified
- [ ] Criterion 2: Verified

## Remaining Issues
- Issue 1: Description

## Next Recommended Action
- Start chunk P{XX}.{YY+1}
```

### 8. Update Status Documents

Update `docs/STATUS.md` and `docs/CHUNK_REGISTER.md` with actual evidence.

### 9. Report Blockers

If blocked, document:
- Precise root cause
- Error output and exit code
- Remediation attempts
- Blocker type: environmental / architectural / dependency / code defect
- Minimum safe action to proceed

---

## Coding Agent Prompts

### P00.01 Prompt

See `docs/prompts/P00.01_PROMPT.md`

### Standard Chunk Prompt

See `docs/prompts/STANDARD_CHUNK_PROMPT.md`

---

## Git Workflow

### Branch Naming

- `main` — Protected, only release commits
- `feature/P{XX}.{YY}-<short-description>` — Implementation branches
- `fix/<issue-id>-<short-description>` — Bug fixes
- `docs/<description>` — Documentation only

### Commit Messages

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `security`

Scope: Package name (e.g., `contracts`, `agent-core`, `apps/cli`)

Example:
```
feat(contracts): Add TaskEvent type and validation

Adds TaskEventType union, TaskEvent interface, and Zod schemas
for all event types. Includes sequence numbering per task.

Closes P01.01
```

### Pre-commit Checks

Run before every commit:
```bash
pnpm lint
pnpm typecheck
pnpm test
git diff --check
```

### PR Process

1. Create feature branch from `main`
2. Implement single chunk (or logical group)
3. Run all checks
4. Create PR with:
   - Link to chunk ID
   - Test results
   - Security review checklist
   - Updated STATUS.md and CHUNK_REGISTER.md
5. Review and merge to `main`

### CI Verification Workflow (Dual Remote)

Since the canonical repository (`origin`) is read-only for the connected account, use the `writable` remote for CI verification:

```bash
# Push to writable remote for CI
git push writable HEAD:master

# Monitor CI run
gh run watch --repo dinesh-sh886/gixai
```

The canonical repository (`origin`) remains the source of truth. Only push to `origin` with explicit authorization.

---

---

## Testing Strategy

### Unit Tests (Vitest)

- Location: `packages/<name>/tests/`
- Naming: `*.test.ts`
- Run: `pnpm test --filter=<package>`
- Coverage target: 80% for business logic

### Integration Tests (Vitest)

- Location: `tests/integration/`
- Test cross-package interactions
- Use real SQLite, fake model provider

### E2E Tests (Playwright)

- Location: `apps/web/tests/` or `tests/e2e/`
- Test Web UI flows
- Run against local-server

### Test Data

- Fixtures in `tests/fixtures/`
- Deterministic fake model for all automated tests
- Repository fixtures for workspace tests

---

## Code Conventions

### TypeScript

- `strict: true` in all tsconfigs
- No `any` (use `unknown` with narrowing)
- Explicit return types for public APIs
- Zod schemas for all external boundaries
- Discriminated unions for state machines

### File Organization

```
packages/<name>/
├── src/
│   ├── index.ts           # Public exports
│   ├── types.ts           # Internal types
│   ├── <feature>.ts       # Implementation
│   └── <feature>.test.ts  # Co-located tests
├── tests/                 # Integration tests
├── package.json
├── tsconfig.json
└── README.md
```

### Naming

- Interfaces: PascalCase (`TaskEvent`)
- Types: PascalCase (`TaskStatus`)
- Functions: camelCase (`createTask`)
- Constants: UPPER_SNAKE_CASE (`MAX_STEPS`)
- Files: kebab-case (`task-engine.ts`)
- IDs: `prefix_ulid` (`task_01ARZ3NDEKTSV4RRFFQ69G5FAV`)

---

## Dependency Management

### Adding Dependencies

1. Check if already in workspace (`pnpm list <pkg>`)
2. Add to appropriate package.json
3. Run `pnpm install`
4. Verify no circular dependencies (`pnpm dlx madge --circular`)

### Updating Dependencies

- Only when required for chunk
- Update lockfile
- Run full test suite
- Document in DECISIONS.md if major version

---

## Documentation Standards

### Required in Every Document

```
**Owner: dinesh-gix**
```

At top of file.

### Markdown Style

- ATX headings (`#`, `##`, `###`)
- Tables for structured data
- Code blocks with language
- Links relative to repo root
- No emojis unless requested

### Decision Records

In `docs/DECISIONS.md`:

```markdown
## <YYYY-MM-DD> Decision Title

**Status**: Accepted | Superseded | Deprecated

**Context**: What problem are we solving?

**Decision**: What did we decide?

**Consequences**: Trade-offs, follow-up work
```

---

## Release Process

### Versioning

Semantic Versioning (MAJOR.MINOR.PATCH)
- MVP-1: 0.1.0
- MVP-2: 0.2.0
- MVP-3: 0.3.0

### Release Gates

Each MVP has gates in `docs/RELEASE_PLAN.md`

### Release Checklist

- [ ] All chunks VERIFIED or ACCEPTED
- [ ] All tests pass
- [ ] Security review complete
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] Release notes published

---

## Tooling Commands

```bash
# Install
pnpm install

# Build all
pnpm build

# Build single package
pnpm --filter=<package> build

# Type check all
pnpm typecheck

# Type check single
pnpm --filter=<package> typecheck

# Lint all
pnpm lint

# Lint single
pnpm --filter=<package> lint

# Format
pnpm format

# Test all
pnpm test

# Test single
pnpm test --filter=<package>

# Test with coverage
pnpm test --coverage

# Check circular deps
pnpm dlx madge --circular --extensions ts packages/*

# Dependency graph
pnpm dlx madge --image graph.svg packages/*
```

---

## Environment Setup

### Required Tools

- Node.js 24.x (LTS)
- pnpm 12.x
- Git
- SQLite3 (for CLI tools)
- ripgrep (`rg`) for code search

### WSL Specific

- Use `/mnt/c/...` for Windows paths
- Git line endings: `core.autocrlf=input`
- Docker Desktop for container tests (future)

### IDE Configuration

- VS Code recommended
- Extensions: TypeScript, ESLint, Prettier, Vitest
- Settings: Format on save, strict null checks

---

## Troubleshooting

### Common Issues

| Issue | Resolution |
|-------|------------|
| pnpm install fails | Clear cache: `pnpm store prune`, delete `node_modules`, reinstall |
| TypeScript errors | Run `pnpm typecheck` for full output |
| Circular dependency | Check `madge` output, refactor to contracts |
| Test flakery | Check for async cleanup, shared state |
| Port in use | `lsof -i :3456`, kill process |

### Getting Help

- Check `docs/DECISIONS.md` for architectural context
- Search existing issues in GitHub
- Ask in team channel