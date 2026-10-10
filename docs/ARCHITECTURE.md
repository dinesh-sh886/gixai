# ARCHITECTURE.md

**Owner: dinesh-gix**

# GiX-AI Architecture

## High-Level Architecture

GiX-AI follows a modular monolith architecture with a single shared agent runtime used by both CLI and Web interfaces.

```
┌─────────────────────────────────────────────────────────────────┐
│                        GiX-AI System                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   CLI App    │    │  Web App     │    │ Local Server │      │
│  │  (Commander) │    │  (Next.js)   │    │  (Fastify)   │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             ▼                                   │
│                    ┌──────────────────┐                          │
│                    │   Agent Core     │                          │
│                    │  (Bounded Loop)  │                          │
│                    └────────┬─────────┘                          │
│                             │                                     │
│        ┌────────────────────┼────────────────────┐               │
│        ▼                    ▼                    ▼                │
│ ┌─────────────┐      ┌─────────────┐      ┌─────────────┐       │
│ │ Model       │      │ Context     │      │ Tool        │       │
│ │ Gateway     │      │ Engine      │      │ Runtime     │       │
│ └──────┬──────┘      └──────┬──────┘      └──────┬──────┘       │
│        │                    │                    │               │
│        │            ┌───────┴───────┐            │               │
│        │            ▼               ▼            │               │
│        │   ┌─────────────┐    ┌─────────────┐    │               │
│        │   │ Workspace   │    │ Permission  │    │               │
│        │   │             │    │ Engine      │    │               │
│        │   └──────┬──────┘    └──────┬──────┘    │               │
│        │          │                  │            │               │
│        ▼          ▼                  ▼            ▼               │
│ ┌─────────────────────────────────────────────────────┐           │
│ │                  Event Bus                          │           │
│ └────────────────────────┬────────────────────────────┘           │
│                          ▼                                        │
│ ┌─────────────────────────────────────────────────────┐           │
│ │                  Persistence                        │           │
│ │  (SQLite: Workspaces, Sessions, Tasks, Events, ...) │           │
│ └─────────────────────────────────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Package Boundaries and Dependencies

### Layer 0: Foundation (No Internal Dependencies)
- **contracts** — Shared types, DTOs, domain errors, task states, IDs

### Layer 1: Core Infrastructure
- **config** — Validated configuration with precedence (depends on contracts)
- **event-bus** — Structured event emission, replay, subscription (depends on contracts)

### Layer 2: Domain Services
- **persistence** — SQLite migrations, repositories (depends on contracts, config, event-bus)
- **workspace** — Workspace registration, path canonicalization (depends on contracts, config, persistence)
- **model-gateway** — Provider-neutral adapters, capability detection (depends on contracts, config, event-bus)
- **permission-engine** — Allow/deny/ask policies, approval tracking (depends on contracts, config, persistence)

### Layer 3: Application Services
- **context-engine** — Repository context retrieval, selection, budgets (depends on contracts, config, workspace, persistence)
- **tool-runtime** — Typed tool registry, execution, validation (depends on contracts, config, workspace, permission-engine, event-bus)
- **verification** — Command execution verification (depends on contracts, config, tool-runtime, event-bus)
- **task-engine** — Task lifecycle, dependency graphs (depends on contracts, config, persistence, event-bus)

### Layer 4: Agent Orchestration
- **agent-core** — Bounded agent loop, planning, execution workflows (depends on all Layer 2-3 packages)

### Layer 5: Applications (Depend on internal packages, no cross-app deps)
- **apps/cli** — Commander CLI, Ink TUI
- **apps/local-server** — Fastify HTTP API, SSE
- **apps/web** — Next.js React application
- **apps/worker** — Isolated remote execution workers

## Agent Lifecycle

```
Task Submission
      │
      ▼
Workspace Resolution ──► Validate workspace exists, canonicalize paths
      │
      ▼
Bounded Context Retrieval ──► Context Engine selects relevant files within token budget
      │
      ▼
Model Request ──► Model Gateway calls provider with context, tools, system prompt
      │
      ▼
Tool Validation ──► Tool Runtime validates tool call schema, parameters
      │
      ▼
Permission Evaluation ──► Permission Engine checks allow/deny/ask policy
      │
      ▼
Execution ──► Tool Runtime executes approved tool, captures output
      │
      ▼
Event Persistence ──► Event Bus emits TaskEvent, Persistence stores
      │
      ▼
Verification ──► Verification runs checks, records results
      │
      ▼
Final Result ──► Task completes, checkpoint created
```

### Lifecycle Guarantees

- **Cancellation**: Cooperative cancellation at each lifecycle stage
- **Timeouts**: Configurable deadlines for model calls, tool execution, overall task
- **Bounded Steps**: Maximum model steps per task to prevent runaway loops
- **Resource Budgets**: Token, time, and cost budgets per task and session
- **Checkpointing**: Versioned state snapshots at each major transition
- **Recovery**: Safe restart from last checkpoint, event replay for verification

## Data Flow

### Request Flow (CLI/Web → Agent)

1. User submits task via CLI command or Web API
2. Local Server (or CLI directly) resolves workspace
3. Agent Core creates Task, emits TaskStarted event
4. Context Engine retrieves bounded context
5. Model Gateway requests completion from provider
6. Tool Runtime validates and executes tool calls
7. Permission Engine authorizes each mutating operation
8. Events persisted, verification runs
9. Result returned to user

### Event Flow

All significant state changes emit structured events:
- `TaskStarted`, `TaskCompleted`, `TaskFailed`, `TaskCancelled`
- `ContextRetrieved`, `ModelRequested`, `ModelResponded`
- `ToolInvoked`, `ToolCompleted`, `ToolFailed`
- `PermissionRequested`, `PermissionGranted`, `PermissionDenied`
- `VerificationStarted`, `VerificationCompleted`
- `CheckpointCreated`

Events are:
- Ordered per task (sequence numbers)
- Persisted durably in SQLite
- Replayable for recovery and debugging
- Streamed via SSE for Web UI

## Security Architecture

### Defense in Depth

1. **Path Safety**: All file operations canonicalized, traversal blocked, symlinks resolved
2. **Command Safety**: Bounded execution, no shell injection, allowlist validation
3. **Permission Model**: Centralized allow/deny/ask with operation binding and expiry
4. **Secret Handling**: Redacted from logs, never persisted in plaintext
5. **API Security**: Loopback binding, origin validation, local authentication
6. **Worker Isolation**: Separate processes, resource limits, network restrictions

### Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                      Trusted Code                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Agent Core / Tool Runtime                  │    │
│  │  (Validates, Authorizes, Executes)                   │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │ Permission Check
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Untrusted Inputs                         │
│  • Model Output (tool calls, text)                          │
│  • Repository Content (AGENTS.md, code, configs)            │
│  • User Input (CLI args, Web requests)                      │
│  • External API Responses                                   │
└─────────────────────────────────────────────────────────────┘
```

**Critical Rule**: Never treat model output, repository content, or AGENTS.md as permission grants.

## Technology Choices

| Category | Choice | Rationale |
|----------|--------|-----------|
| Language | TypeScript (strict) | Type safety, ecosystem, shared types |
| Runtime | Node.js LTS (v24) | Stability, long-term support |
| Package Manager | pnpm workspaces | Fast, disk-efficient, monorepo support |
| CLI Framework | Commander | Mature, declarative, good TypeScript support |
| TUI | Ink | React-based, composable, works with Commander |
| HTTP Server | Fastify | Fast, schema validation, TypeScript-first |
| Web Framework | Next.js (App Router) | React Server Components, streaming, production-ready |
| Validation | Zod | Runtime validation, TypeScript inference |
| Database | SQLite (better-sqlite3) | Embedded, zero-config, ACID, sufficient for local-first |
| Git | Git CLI + ripgrep | Native performance, no wrapper limitations |
| Testing (Unit) | Vitest | Fast, Vite-native, TypeScript support |
| Testing (E2E) | Playwright | Cross-browser, reliable, good DX |

## Configuration Precedence

1. Default values (code)
2. Global config file (`~/.config/gix/config.json`)
3. Workspace config file (`.gix/config.json`)
4. Environment variables (`GIX_*`)
5. CLI flags / API request parameters

## Model Gateway Architecture

```
ModelGateway (Interface)
    │
    ├── ProviderAdapter (Interface)
    │       │
    │       ├── FakeProvider (Deterministic, for tests)
    │       ├── NemotronAdapter (Real provider)
    │       ├── OpenAIAdapter (Future)
    │       └── AnthropicAdapter (Future)
    │
    ├── CapabilityDetector
    ├── StreamingHandler
    ├── ToolCallParser
    ├── TimeoutManager
    ├── RetryPolicy
    └── UsageBudgetTracker
```

### Provider Capabilities (Feature Detection)

Not all providers support all features. Each adapter reports capabilities:
- `streaming`: Server-sent events or chunked responses
- `toolCalls`: Structured function calling
- `parallelToolCalls`: Multiple tools per response
- `cancellation`: Request cancellation mid-stream
- `systemPrompt`: Dedicated system message role
- `vision`: Image input support

## Persistence Schema (SQLite)

### Core Tables

- **workspaces** — Root paths, config, metadata
- **sessions** — CLI/Web session binding to workspace
- **messages** — Conversation history (user, assistant, tool)
- **tasks** — Task state, type, parent, budgets, status
- **task_events** — Ordered event log per task (sequence, type, payload)
- **tool_invocations** — Tool calls with input, output, timing, verification
- **approvals** — Permission requests, decisions, expiry, binding
- **checkpoints** — Versioned state snapshots (task_id, version, state_json)
- **verification_runs** — Verification results, command, output, pass/fail
- **model_usage** — Token counts, costs, provider, model per request

### Migration Strategy

- Numbered migration files (001_initial_schema.sql, 002_add_indexes.sql, ...)
- Applied in order on startup
- Down migrations not supported (forward-only)
- Schema version tracked in `schema_version` table

## Scaling Considerations

### Current (Local-First)
- Single-process agent core
- SQLite for persistence
- In-memory event bus
- Local model gateway

### Future (If Needed)
- **Horizontal**: Multiple local-server instances behind load balancer
- **Persistence**: PostgreSQL for multi-user, connection pooling
- **Event Bus**: Redis Streams or NATS for distributed events
- **Workers**: Dedicated worker pool for remote execution
- **Caching**: Redis for context, embeddings, model responses

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Cold start (CLI) | < 500ms |
| Model request latency (local) | < 2s p50 |
| Tool execution latency | < 100ms overhead |
| SQLite write throughput | > 1000 ops/sec |
| Memory usage (idle) | < 100MB |
| Memory usage (active task) | < 500MB |
| Task cancellation latency | < 100ms |
| WebSocket reconnection | < 2s |
| Test suite execution | < 60s |