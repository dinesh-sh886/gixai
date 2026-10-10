# DECISIONS.md

**Owner: dinesh-gix**

# Architectural Decisions

## 2026-10-09: Modular Monolith Architecture

**Status**: Accepted

**Context**: Need to choose between microservices, modular monolith, or monolith for GiX-AI.

**Decision**: Use modular monolith with clear package boundaries. Single process for CLI and local server. Separate worker process only for remote execution (MVP-2).

**Consequences**:
- Simpler deployment and debugging
- Shared memory for agent runtime (no serialization overhead)
- Clear upgrade path to distributed if needed
- Must enforce package boundaries strictly

---

## 2026-10-09: TypeScript with Strict Mode

**Status**: Accepted

**Context**: Language choice for type safety and maintainability.

**Decision**: TypeScript with `strict: true` in all packages. No `any` allowed. Zod for runtime validation at boundaries.

**Consequences**:
- Catch errors at compile time
- Self-documenting APIs
- Slightly slower initial development
- Requires discipline to maintain

---

## 2026-10-09: pnpm Workspaces

**Status**: Accepted

**Context**: Package manager for monorepo.

**Decision**: pnpm workspaces for dependency management.

**Consequences**:
- Fast, disk-efficient installs
- Strict dependency isolation
- Good TypeScript support
- Native workspace protocol

---

## 2026-10-09: SQLite for Persistence

**Status**: Accepted

**Context**: Local-first persistence choice.

**Decision**: SQLite (better-sqlite3) with WAL mode. Migrations via numbered SQL files. No ORM (raw SQL with typed mappers).

**Consequences**:
- Zero-config, embedded
- ACID transactions
- Sufficient for local-first scale
- Migration discipline required
- Easy backup (single file)

---

## 2026-10-09: Commander + Ink for CLI

**Status**: Accepted

**Context**: CLI framework choice.

**Decision**: Commander for command structure, Ink for interactive TUI.

**Consequences**:
- Familiar CLI patterns
- React-based TUI components
- Good TypeScript support
- Ink adds bundle size (acceptable)

---

## 2026-10-09: Fastify for Local Server

**Status**: Accepted

**Context**: HTTP server for local API.

**Decision**: Fastify with Zod schema validation.

**Consequences**:
- High performance
- Built-in validation
- TypeScript-first
- Good plugin ecosystem

---

## 2026-10-09: Next.js App Router for Web

**Status**: Accepted

**Context**: Web framework choice.

**Decision**: Next.js 14+ with App Router, React Server Components.

**Consequences**:
- Streaming SSR for live updates
- Shared types with API client
- Server components reduce client bundle
- Learning curve for App Router

---

## 2026-10-09: Deterministic Fake Model Provider

**Status**: Accepted

**Context**: Testing strategy for agent behavior.

**Decision**: Mandatory deterministic fake provider for all automated tests. Real provider only for integration/e2e.

**Consequences**:
- Fast, reliable tests
- No API costs in CI
- Deterministic assertions
- Must maintain parity with real provider interface

---

## 2026-10-09: ULID for All IDs

**Status**: Accepted

**Context**: ID format for entities.

**Decision**: ULID with type prefix (e.g., `task_01ARZ3NDEKTSV4RRFFQ69G5FAV`).

**Consequences**:
- Sortable by creation time
- No central coordinator needed
- Compact, URL-safe
- Type prefix aids debugging

---

## 2026-10-09: Event Sourcing for Task Lifecycle

**Status**: Accepted

**Context**: How to track task execution for debugging, recovery, and UI.

**Decision**: Append-only event log per task (TaskEvent). State reconstructed from events. Checkpoints for performance.

**Consequences**:
- Complete audit trail
- Time-travel debugging
- Easy replay for verification
- Event schema evolution required

---

## 2026-10-09: Permission Model (Allow/Deny/Ask)

**Status**: Accepted

**Context**: How to authorize tool execution.

**Decision**: Centralized permission engine with three policies. Approvals bound to tool+input, expiring, audited.

**Consequences**:
- Clear user control
- Auditable decisions
- No ambient authority
- Approval UX complexity

---

## 2026-10-09: No Trust in Model Output

**Status**: Accepted

**Context**: Security principle for LLM integration.

**Decision**: Model output is untrusted input. All tool calls validated, authorized, and sandboxed. AGENTS.md parsed, not executed.

**Consequences**:
- Defense against prompt injection
- Extra validation layer
- Slight latency overhead
- Critical for security

---

## 2026-10-09: Agent Lifecycle with Bounded Steps

**Status**: Accepted

**Context**: Prevent runaway agent loops.

**Decision**: Configurable max steps, token budget, wall time per task. Cooperative cancellation at each stage.

**Consequences**:
- Predictable resource usage
- User control over cost
- Requires careful budget defaults
- Checkpointing for long tasks

---

## 2026-10-09: Shared Agent Runtime for CLI and Web

**Status**: Accepted

**Context**: Avoid duplicate agent logic.

**Decision**: Single `agent-core` package used by both CLI (in-process) and Web (via local-server HTTP).

**Consequences**:
- Consistent behavior
- Single source of truth
- Local-server becomes thin adapter
- Web gets full CLI capability

---

## 2026-10-09: Remote Execution Disabled by Default

**Status**: Accepted

**Context**: Security posture for remote workers.

**Decision**: Remote execution architecture in MVP-2 but disabled by default. Requires explicit opt-in and security gate review.

**Consequences**:
- Secure by default
- No accidental exposure
- Clear migration path
- Extra config for power users

---

## 2026-10-09: Vitest + Playwright for Testing

**Status**: Accepted

**Context**: Testing framework choice.

**Decision**: Vitest for unit/integration (fast, Vite-native). Playwright for Web e2e (reliable, cross-browser).

**Consequences**:
- Unified config with Vite
- TypeScript support
- Good DX
- Playwright adds browser deps

---

## 2026-10-09: Zod for Runtime Validation

**Status**: Accepted

**Context**: Schema validation at boundaries.

**Decision**: Zod for all external boundaries (API, config, tool schemas, model responses). Inferred types for TypeScript.

**Consequences**:
- Single source of truth for schemas
- Type inference reduces duplication
- Good error messages
- Slight runtime overhead

---

## 2026-10-09: Git CLI + ripgrep for Repository Operations

**Status**: Accepted

**Context**: How to interact with git repositories and search code.

**Decision**: Direct Git CLI (`git` binary) and `rg` (ripgrep) via subprocess. No Node.js git libraries.

**Consequences**:
- Native performance
- Full Git feature support
- No wrapper limitations
- Requires git/rg in PATH
- Subprocess overhead (minimal)

---

## 2026-10-09: Configuration Precedence

**Status**: Accepted

**Context**: How configuration layers interact.

**Decision**: 5-layer precedence: defaults < global config < workspace config < env vars < CLI flags/API params.

**Consequences**:
- Predictable override behavior
- Works for CLI and Web
- Documented clearly
- Environment-specific configs easy

---

## 2026-10-09: Session Protocol for Development

**Status**: Accepted

**Context**: Ensure consistent, evidence-based development.

**Decision**: Mandatory session protocol: inspect → read status → identify chunk → implement → test → record → update status.

**Consequences**:
- No skipped steps
- Evidence-based progress
- Blocker visibility
- Discipline required