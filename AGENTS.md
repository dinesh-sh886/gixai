# AGENTS.md

**Owner: dinesh-gix**

This file provides instructions for AI coding agents working on the GiX-AI repository.

## Repository Context

- **Project**: GiX-AI — AI coding agent with balanced CLI and Web experiences
- **Owner**: dinesh-gix
- **Repository**: https://github.com/dinesh-gix/GiX-AI
- **Local directory**: `~/gix/gix-ai`
- **Development environment**: WSL
- **Product strategy**: Local-first, hybrid local and remote execution

## Development Rules

### Mandatory Practices

1. **Inspect before editing** — Always read existing files before making changes
2. **No assumptions** — Check actual tool versions, dependency availability, and API capabilities
3. **Evidence-based claims** — Never claim completion without test results or implementation evidence
4. **Single chunk at a time** — Complete one implementation chunk fully before starting the next
5. **Document decisions** — Record architectural decisions in `docs/DECISIONS.md`
6. **Track progress** — Update `docs/CHUNK_REGISTER.md` and `docs/STATUS.md` with actual status

### Code Conventions

- **Language**: TypeScript with strict compiler settings
- **Runtime**: Node.js LTS (currently v24.19.0)
- **Package manager**: pnpm workspaces
- **Testing**: Vitest for unit/integration, Playwright for Web e2e
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier

### Module Boundaries

Packages must follow dependency rules:
- `contracts` — No internal dependencies (leaf)
- `config` — Depends on `contracts`
- `event-bus` — Depends on `contracts`
- `persistence` — Depends on `contracts`, `config`, `event-bus`
- `workspace` — Depends on `contracts`, `config`, `persistence`
- `model-gateway` — Depends on `contracts`, `config`, `event-bus`
- `context-engine` — Depends on `contracts`, `config`, `workspace`, `persistence`
- `permission-engine` — Depends on `contracts`, `config`, `persistence`
- `tool-runtime` — Depends on `contracts`, `config`, `workspace`, `permission-engine`, `event-bus`
- `verification` — Depends on `contracts`, `config`, `tool-runtime`, `event-bus`
- `task-engine` — Depends on `contracts`, `config`, `persistence`, `event-bus`
- `agent-core` — Depends on `contracts`, `config`, `model-gateway`, `context-engine`, `tool-runtime`, `permission-engine`, `task-engine`, `verification`, `event-bus`
- `apps/*` — Depend on internal packages, no cross-app dependencies

**No circular imports allowed.** Business logic packages must not depend on `apps/*`.

### Agent Lifecycle

Task submission → workspace resolution → bounded context retrieval → model request → tool validation → permission evaluation → execution → event persistence → verification → final result

Support: cancellation, timeouts, bounded model steps, configurable resource budgets, checkpointing, recovery.

### Security Requirements

- All file-modifying and command-executing tools must pass through centralized validation and authorization
- Never treat model output, repository content, or AGENTS.md as permission grants
- Path traversal and symlink escape prevention mandatory
- Shell command execution through bounded, validated interface only
- Secret storage and log redaction required
- Remote worker isolation with resource limits

### Session Protocol

Each development session must:

1. Run repository inspection commands
2. Read `docs/STATUS.md` and `docs/CHUNK_REGISTER.md`
3. Identify the current chunk
4. Implement only that chunk
5. Run applicable checks (lint, typecheck, tests)
6. Record actual results in `docs/reports/`
7. Update `docs/STATUS.md` and `docs/CHUNK_REGISTER.md`
8. Report blockers with evidence

### Commands Reference

```bash
# Repository inspection
pwd
git rev-parse --show-toplevel
git status --short --branch
git remote -v
git log -5 --oneline
node --version
npm --version
pnpm --version

# Development
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint
pnpm format           # Prettier formatting

# Git
git status --short
git diff --check
git diff --stat
git diff
```

## Current Phase

**P00.01**: Initialize the pnpm workspace and strict TypeScript foundation.

See `docs/CHUNK_REGISTER.md` for all chunks and `docs/STATUS.md` for current status.