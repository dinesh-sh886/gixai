# GiX-AI

**Owner: dinesh-gix**

GiX-AI is an AI coding agent with balanced CLI and Web experiences, built for local-first, hybrid local and remote execution.

## Repository

- **Owner**: dinesh-gix
- **Primary repository**: https://github.com/dinesh-gix/GiX-AI (canonical, read-only for connected account)
- **Writable repository**: https://github.com/dinesh-sh886/gixai.git (used for CI verification and development pushes)
- **Local directory**: `~/gix/gix-ai`

## Git Remote Configuration

Two remotes are configured:
- `origin` → `https://github.com/dinesh-gix/GiX-AI.git` (canonical, read-only for connected account)
- `writable` → `https://github.com/dinesh-sh886/gixai.git` (used for CI verification and development pushes)

Do not push to `origin` without explicit authorization. Use `writable` for CI verification.

## Development Environment

- **Platform**: WSL (Windows Subsystem for Linux)
- **Node.js**: v24.19.0
- **npm**: 11.17.0
- **pnpm**: 12.8.1
- **Coding Agent**: OpenCode + Nemotron

## Product Strategy

- Local-first architecture with hybrid local/remote execution
- Single shared agent runtime for both CLI and Web interfaces
- Modular monolith design (no premature microservices)
- TypeScript with strict compiler settings
- pnpm workspaces for package management

## Architecture Overview

```
GiX-AI/
├── apps/
│   ├── cli/           # Commander-based CLI with Ink TUI
│   ├── local-server/  # Fastify HTTP API server
│   ├── web/           # Next.js React web application
│   └── worker/        # Isolated remote execution workers
├── packages/
│   ├── contracts/         # Shared types, DTOs, domain errors
│   ├── config/            # Validated configuration with precedence
│   ├── agent-core/        # Bounded agent loop, planning, execution
│   ├── model-gateway/     # Provider-neutral model adapters
│   ├── context-engine/    # Repository context retrieval and selection
│   ├── tool-runtime/      # Typed tool registry and execution
│   ├── permission-engine/ # Allow/deny/ask permission policies
│   ├── workspace/         # Workspace registration and path canonicalization
│   ├── task-engine/       # Task lifecycle and dependency graphs
│   ├── persistence/       # SQLite migrations and repositories
│   ├── verification/      # Command execution verification
│   └── event-bus/         # Structured event emission and replay
├── tests/                 # Shared test utilities and fixtures
└── docs/                  # Implementation documentation
```

## MVP Roadmap

### MVP-1: Local Coding Agent (P00-P08)
- Repository and engineering foundation
- Contracts, configuration, and events
- Model gateway with fake and real providers
- Workspace and repository context
- Tool runtime and permissions
- Agent core with bounded loop
- Persistence and recovery
- CLI and TUI
- Stabilization and release

### MVP-2: Balanced CLI and Web Experience (P09-P11)
- Local API server with SSE
- Next.js web workspace
- Hybrid remote execution (disabled by default)

### MVP-3: Autonomous Engineering Workflows (P12-P14)
- Multi-step orchestration with task graphs
- GitHub and CI integration
- Evaluation and operational maturity

## Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format check (non-mutating)
pnpm format:check
```

## Documentation

- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API and Data Model](docs/API_AND_DATA_MODEL.md)
- [Security](docs/SECURITY.md)
- [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md)
- [Decisions](docs/DECISIONS.md)
- [Chunk Register](docs/CHUNK_REGISTER.md)
- [Status](docs/STATUS.md)
- [Release Plan](docs/RELEASE_PLAN.md)