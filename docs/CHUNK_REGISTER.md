# CHUNK_REGISTER.md

**Owner: dinesh-gix**

# GiX-AI Chunk Register

Status values: `NOT_STARTED` | `IN_PROGRESS` | `BLOCKED` | `IMPLEMENTED` | `VERIFIED` | `ACCEPTED`

## MVP-1: Local Coding Agent (P00-P08)

### P00 — Repository and Engineering Foundation

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P00.01 | Initialize pnpm workspace and strict TypeScript foundation | 1 | — | VERIFIED | pnpm workspace configured, tsconfig.base.json with strict settings, package.json with scripts, builds without errors | Workspace installs, typecheck passes | pnpm install/build/typecheck/lint/format all exit 0; commits f154593, fa51691 | Proceed to P00.02 |
| P00.02 | Establish lint, formatting, type-check, test, and build commands | 1 | P00.01 | VERIFIED | ESLint, Prettier, Vitest, TypeScript commands work; all pass on empty workspace | `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm build` all exit 0 | pnpm format:check/lint/typecheck/test/build all exit 0; CI workflow created at .github/workflows/ci.yml; 17 packages with tests (25 tests total) | Proceed to P00.03 |
| P00.03 | Establish CI checks | 1 | P00.02 | VERIFIED | GitHub Actions workflow runs lint, typecheck, test on push/PR | CI passes on clean repo | Run URL: https://github.com/dinesh-sh886/gixai/actions/runs/38041665799; Commit: b6a6fcd; All 10 steps pass (checkout, pnpm install, node setup, approve builds, install deps, format:check, lint, typecheck, test, build) | Proceed to P00.04 |
| P00.04 | Document engineering conventions and architecture decisions | 1 | P00.01 | NOT_STARTED | DEVELOPMENT_WORKFLOW.md, DECISIONS.md created and accurate | Documents exist and are readable | | Wait for P00.01 |
| P00.05 | Create deterministic testing utilities and repository fixtures | 1 | P00.02 | NOT_STARTED | Fake model provider, test fixtures, repository helpers in tests/ | Used by P01.05+ tests | | Wait for P00.02 |

### P01 — Contracts, Configuration, and Events

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P01.01 | Define common IDs, DTOs, domain errors, and task states | 1 | P00.02 | NOT_STARTED | contracts package with types, Zod schemas, ID generators, error classes | Unit tests for all types, validation | | Wait for P00.02 |
| P01.02 | Implement validated configuration and precedence | 1 | P01.01 | NOT_STARTED | config package loads 5-layer precedence, validates with Zod | Tests for each layer, merge behavior | | Wait for P01.01 |
| P01.03 | Define model and tool interfaces | 1 | P01.01 | NOT_STARTED | ModelProvider, Tool interfaces, capability types in contracts | Interface compliance tests | | Wait for P01.01 |
| P01.04 | Define structured logging and secret redaction | 1 | P01.01 | NOT_STARTED | Logger interface, redaction patterns, structured output | Log output tests, redaction tests | | Wait for P01.01 |
| P01.05 | Add contract validation tests | 1 | P01.01-P01.04 | NOT_STARTED | All contracts packages have validation tests passing | 100% contract test coverage | | Wait for P01.04 |

### P02 — Model Gateway

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P02.01 | Define provider interfaces and capability detection | 1 | P01.03 | NOT_STARTED | ProviderAdapter interface, capability flags, detection logic | Interface tests, capability detection tests | | Wait for P01.03 |
| P02.02 | Implement a deterministic fake provider | 1 | P02.01 | NOT_STARTED | FakeProvider returns predictable responses, supports streaming/tool calls | All agent tests use fake provider | | Wait for P02.01 |
| P02.03 | Implement the first real Nemotron-compatible adapter | 1 | P02.01 | NOT_STARTED | NemotronAdapter calls configured endpoint, handles auth, streaming | Integration test with real endpoint (manual) | | Wait for P02.01 |
| P02.04 | Support streaming, tool calls, cancellation, and errors | 1 | P02.02, P02.03 | NOT_STARTED | Both providers support streaming, tool calls, cancellation, error mapping | Conformance tests for each capability | | Wait for P02.02, P02.03 |
| P02.05 | Implement timeouts, retry policies, and usage budgets | 1 | P02.04 | NOT_STARTED | Configurable timeouts, exponential backoff, token/cost budgets | Budget enforcement tests, timeout tests | | Wait for P02.04 |
| P02.06 | Add provider conformance tests | 1 | P02.05 | NOT_STARTED | Shared test suite runs against both fake and real providers | Both providers pass conformance suite | | Wait for P02.05 |

### P03 — Workspace and Repository Context

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P03.01 | Register workspaces and canonicalize paths | 1 | P01.02 | NOT_STARTED | Workspace registration, path canonicalization, persistence | Path traversal tests, symlink tests | | Wait for P01.02 |
| P03.02 | Implement safe file listing and bounded file reading | 1 | P03.01 | NOT_STARTED | list_files, read_file with size limits, ignore rules | File ops tests, boundary tests | | Wait for P03.01 |
| P03.03 | Implement code search | 1 | P03.02 | NOT_STARTED | search_code using ripgrep, bounded results, context lines | Search accuracy tests, performance tests | | Wait for P03.02 |
| P03.04 | Add context selection and size budgets | 1 | P03.03 | NOT_STARTED | ContextEngine selects files within token budget, ranks by relevance | Budget adherence tests, relevance tests | | Wait for P03.03 |
| P03.05 | Support repository instructions using AGENTS.md | 1 | P03.04 | NOT_STARTED | AGENTS.md parsed, directives applied to context/permissions | Directive parsing tests, integration tests | | Wait for P03.04 |
| P03.06 | Test path traversal, symlinks, ignored files, binary files, and large outputs | 1 | P03.05 | NOT_STARTED | Security test suite passes all attack vectors | All security tests pass | | Wait for P03.05 |

### P04 — Tool Runtime and Permissions

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P04.01 | Implement the typed tool registry | 1 | P01.03 | NOT_STARTED | ToolRegistry with Zod schemas, type-safe invocation | Registry tests, schema validation tests | | Wait for P01.03 |
| P04.02 | Implement read_file, list_files, and search_code | 1 | P04.01 | NOT_STARTED | Three tools work, respect permissions, return structured results | Tool tests, permission integration tests | | Wait for P04.01 |
| P04.03 | Implement write_file and apply_patch | 1 | P04.01 | NOT_STARTED | Write and patch tools with diff preview, atomic writes | Write tests, patch tests, concurrent edit tests | | Wait for P04.01 |
| P04.04 | Implement git_status and git_diff | 1 | P04.01 | NOT_STARTED | Git tools return parsed status and diff output | Git tool tests, large diff handling | | Wait for P04.01 |
| P04.05 | Implement bounded command execution | 1 | P04.01 | NOT_STARTED | execute_command with allowlist, resource limits, no shell | Command execution tests, security tests | | Wait for P04.01 |
| P04.06 | Implement allow, deny, and ask permission policies | 1 | P04.01 | NOT_STARTED | PermissionEngine evaluates policies, caches decisions, requests approvals | Policy tests, approval flow tests | | Wait for P04.01 |
| P04.07 | Test dangerous commands, stale approvals, concurrent edits, and filesystem boundaries | 1 | P04.06 | NOT_STARTED | Security test suite covers all threat vectors | All security tests pass | | Wait for P04.06 |

### P05 — Agent Core

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P05.01 | Implement a bounded agent loop | 1 | P02.06, P04.07 | NOT_STARTED | Agent loop with max steps, calls model, executes tools, handles errors | Loop tests, step counting, error handling | | Wait for P02.06, P04.07 |
| P05.02 | Implement tool execution and permission integration | 1 | P05.01 | NOT_STARTED | Tools execute through permission engine, approvals block/allow | Integration tests with permissions | | Wait for P05.01 |
| P05.03 | Implement planning and execution workflows | 1 | P05.02 | NOT_STARTED | Plan phase creates steps, execute phase runs them, review phase shows diff | Workflow tests, plan accuracy tests | | Wait for P05.02 |
| P05.04 | Implement maximum steps, deadlines, cancellation, and budgets | 1 | P05.03 | NOT_STARTED | All budgets enforced, cancellation propagates, deadlines respected | Budget tests, cancellation tests, deadline tests | | Wait for P05.03 |
| P05.05 | Implement ordered task events | 1 | P05.04 | NOT_STARTED | Events emitted in order, sequence numbers, persisted | Event ordering tests, persistence tests | | Wait for P05.04 |
| P05.06 | Add deterministic agent evaluation cases | 1 | P05.05 | NOT_STARTED | Evaluation suite with known-good tasks, assertions on behavior | Evaluation tests pass deterministically | | Wait for P05.05 |

### P06 — Persistence and Recovery

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P06.01 | Implement SQLite migrations and repositories | 1 | P01.02 | NOT_STARTED | Migration runner, repositories for all entities, WAL mode | Migration tests, repository CRUD tests | | Wait for P01.02 |
| P06.02 | Persist workspaces, sessions, messages, tasks, and events | 1 | P06.01 | NOT_STARTED | All core entities persisted, queries work | Persistence tests, query tests | | Wait for P06.01 |
| P06.03 | Persist tool invocations, approvals, and verification results | 1 | P06.02 | NOT_STARTED | Tool invocations, approvals, verifications persisted with links | Link integrity tests, cascade tests | | Wait for P06.02 |
| P06.04 | Implement versioned checkpoints | 1 | P06.03 | NOT_STARTED | Checkpoints created at transitions, versioned, restorable | Checkpoint tests, restore tests | | Wait for P06.03 |
| P06.05 | Implement safe recovery of interrupted tasks | 1 | P06.04 | NOT_STARTED | Task resumes from last checkpoint, events replayed | Recovery tests, crash simulation tests | | Wait for P06.04 |
| P06.06 | Add retention and cleanup policies | 1 | P06.05 | NOT_STARTED | Cleanup job removes old events per policy, keeps checkpoints | Retention tests, cleanup tests | | Wait for P06.05 |
| P06.07 | Test restart recovery, migrations, and event replay | 1 | P06.06 | NOT_STARTED | Full recovery test suite passes | All recovery tests pass | | Wait for P06.06 |

### P07 — CLI and TUI

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P07.01 | Implement the `gix` command | 1 | P05.06, P06.07 | NOT_STARTED | Commander CLI with subcommands, help, version | CLI smoke tests, help output tests | | Wait for P05.06, P06.07 |
| P07.02 | Implement configuration and provider diagnostics | 1 | P07.01 | NOT_STARTED | `gix config`, `gix doctor` show config and provider status | Diagnostic tests | | Wait for P07.01 |
| P07.03 | Implement the interactive terminal experience | 1 | P07.01 | NOT_STARTED | Ink-based TUI with streaming output, input handling | TUI integration tests (manual) | | Wait for P07.01 |
| P07.04 | Implement run, plan, review, tasks, and resume commands | 1 | P07.03 | NOT_STARTED | All commands work end-to-end | Command integration tests | | Wait for P07.03 |
| P07.05 | Implement scripting-friendly JSON output | 1 | P07.04 | NOT_STARTED | `--json` flag produces machine-readable output | JSON output tests, schema validation | | Wait for P07.04 |
| P07.06 | Implement cancellation and graceful shutdown | 1 | P07.05 | NOT_STARTED | Ctrl+C cancels task, SIGTERM shuts down cleanly | Signal handling tests | | Wait for P07.05 |
| P07.07 | Validate clean installation in WSL | 1 | P07.06 | NOT_STARTED | Fresh clone, `pnpm install`, `pnpm build`, `gix --version` works | WSL installation test | | Wait for P07.06 |

### P08 — MVP-1 Stabilization

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P08.01 | Run representative repository evaluations | 1 | P07.07 | NOT_STARTED | Evaluation on 5+ real repos, metrics recorded | Evaluation report | | Wait for P07.07 |
| P08.02 | Measure task success, verification results, regressions, recovery, and cost | 1 | P08.01 | NOT_STARTED | Metrics dashboard/data for all dimensions | Metrics report | | Wait for P08.01 |
| P08.03 | Resolve critical and high-priority defects | 1 | P08.02 | NOT_STARTED | All critical/high bugs fixed, verified | Bug fix verification | | Wait for P08.02 |
| P08.04 | Complete documentation and security review | 1 | P08.03 | NOT_STARTED | All docs complete, security review signed off | Review checklist | | Wait for P08.03 |
| P08.05 | Produce the MVP-1 release report | 1 | P08.04 | NOT_STARTED | Release report with evidence, limitations, next steps | Release report published | | Wait for P08.04 |

---

## MVP-2: Balanced CLI and Web Experience (P09-P11)

### P09 — Local API

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P09.01 | Versioned `/api/v1` routes with health and capability endpoints | 2 | P08.05 | NOT_STARTED | Fastify server, health/capabilities endpoints, versioning | API contract tests | | Wait for P08.05 |
| P09.02 | Workspace, session, and task endpoints | 2 | P09.01 | NOT_STARTED | CRUD for workspaces, sessions, tasks via API | API CRUD tests | | Wait for P09.01 |
| P09.03 | Task creation, cancellation, resume, and approval endpoints | 2 | P09.02 | NOT_STARTED | Task lifecycle endpoints, approval decisions via API | Lifecycle tests, approval tests | | Wait for P09.02 |
| P09.04 | Diff and verification endpoints | 2 | P09.03 | NOT_STARTED | Diff endpoint returns unified diff, verification results | Diff tests, verification tests | | Wait for P09.03 |
| P09.05 | Server-sent events for live task updates | 2 | P09.04 | NOT_STARTED | SSE endpoint streams TaskEvents, reconnection works | SSE tests, reconnection tests | | Wait for P09.04 |
| P09.06 | Durable event IDs and reconnection/replay | 2 | P09.05 | NOT_STARTED | Last-Event-ID replay, durable IDs, gap detection | Replay tests, gap tests | | Wait for P09.05 |
| P09.07 | Request validation and consistent error responses | 2 | P09.06 | NOT_STARTED | Zod validation on all routes, standard error format | Validation tests, error format tests | | Wait for P09.06 |
| P09.08 | Loopback-only binding, browser-origin protections, local auth | 2 | P09.07 | NOT_STARTED | Server binds 127.0.0.1, validates Origin, requires token | Security tests, auth tests | | Wait for P09.07 |

### P10 — Web Workspace

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P10.01 | Next.js application with shared typed API client | 2 | P09.08 | NOT_STARTED | Next.js app, typed client from API schemas, builds | Build tests, type safety tests | | Wait for P09.08 |
| P10.02 | Workspace and session navigation | 2 | P10.01 | NOT_STARTED | Workspace list, session list, navigation UI | Navigation tests | | Wait for P10.01 |
| P10.03 | Task creation and task history | 2 | P10.02 | NOT_STARTED | Create task form, task list with status, history view | Task creation tests, history tests | | Wait for P10.02 |
| P10.04 | Streaming conversation and execution events | 2 | P10.03 | NOT_STARTED | SSE connection, event rendering, auto-scroll | Streaming tests, UI tests | | Wait for P10.03 |
| P10.05 | Repository file tree, file viewing and editing | 2 | P10.04 | NOT_STARTED | File tree, file view, edit with diff preview | File tree tests, edit tests | | Wait for P10.04 |
| P10.06 | Diff review and approval prompts | 2 | P10.05 | NOT_STARTED | Diff view, approve/deny buttons, real-time updates | Approval UI tests | | Wait for P10.05 |
| P10.07 | Verification output and error presentation | 2 | P10.06 | NOT_STARTED | Verification results displayed, errors highlighted | Verification UI tests | | Wait for P10.06 |
| P10.08 | Reconnection handling | 2 | P10.07 | NOT_STARTED | Auto-reconnect, event replay, UI state recovery | Reconnection tests | | Wait for P10.07 |
| P10.09 | Playwright end-to-end tests | 2 | P10.08 | NOT_STARTED | E2E tests for critical user flows | Playwright tests pass | | Wait for P10.08 |

### P11 — Hybrid Remote Execution

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P11.01 | Remote execution architecture and threat model | 2 | P10.09 | NOT_STARTED | Threat model document, architecture diagram | Threat model review | | Wait for P10.09 |
| P11.02 | Authenticated worker registration | 2 | P11.01 | NOT_STARTED | Worker registration, auth tokens, heartbeat | Registration tests | | Wait for P11.01 |
| P11.03 | Job dispatch and durable task tracking | 2 | P11.02 | NOT_STARTED | Tasks dispatched to workers, durable tracking | Dispatch tests, tracking tests | | Wait for P11.02 |
| P11.04 | Per-task isolated execution environments | 2 | P11.03 | NOT_STARTED | Each task in isolated env, no cross-contamination | Isolation tests | | Wait for P11.03 |
| P11.05 | CPU, memory, runtime, and output limits | 2 | P11.04 | NOT_STARTED | Resource limits enforced per task | Limit enforcement tests | | Wait for P11.04 |
| P11.06 | Workspace and credential restrictions | 2 | P11.05 | NOT_STARTED | Workers see only assigned workspace, scoped credentials | Credential scope tests | | Wait for P11.05 |
| P11.07 | Network egress restrictions | 2 | P11.06 | NOT_STARTED | Default deny egress, allowlist for model API | Network tests | | Wait for P11.06 |
| P11.08 | Cancellation, retry, and idempotency controls | 2 | P11.07 | NOT_STARTED | Cancel propagates, retries with idempotency keys | Cancellation tests, retry tests | | Wait for P11.07 |
| P11.09 | Worker-loss and duplicate-delivery tests | 2 | P11.08 | NOT_STARTED | Worker crash recovery, no duplicate execution | Chaos tests | | Wait for P11.08 |
| P11.10 | Clear local-versus-remote execution configuration | 2 | P11.09 | NOT_STARTED | Config controls local vs remote, documented | Config tests, docs | | Wait for P11.09 |

---

## MVP-3: Autonomous Engineering Workflows (P12-P14)

### P12 — Multi-Step Orchestration

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P12.01 | Task dependency graphs | 3 | P11.10 | NOT_STARTED | DAG of tasks, topological execution, parallel branches | DAG tests, parallel tests | | Wait for P11.10 |
| P12.02 | Planner, implementer, tester, and reviewer roles | 3 | P12.01 | NOT_STARTED | Role-based task types, specialized prompts | Role tests | | Wait for P12.01 |
| P12.03 | Isolated workspaces for parallel tasks | 3 | P12.02 | NOT_STARTED | Each parallel task gets isolated workspace copy | Isolation tests | | Wait for P12.02 |
| P12.04 | Global budgets across child tasks | 3 | P12.03 | NOT_STARTED | Parent task budget shared across children | Budget tests | | Wait for P12.03 |
| P12.05 | Durable background jobs | 3 | P12.04 | NOT_STARTED | Long-running tasks persist, survive restart | Background job tests | | Wait for P12.04 |
| P12.06 | Integration and conflict resolution | 3 | P12.05 | NOT_STARTED | Merge child task results, detect conflicts | Integration tests | | Wait for P12.05 |
| P12.07 | Cancellation propagation | 3 | P12.06 | NOT_STARTED | Cancel parent cancels all children | Propagation tests | | Wait for P12.06 |
| P12.08 | Operator visibility into every child task | 3 | P12.07 | NOT_STARTED | UI shows all child tasks, logs, status | Visibility tests | | Wait for P12.07 |

### P13 — GitHub and CI Integration

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P13.01 | Least-privilege GitHub integration | 3 | P12.08 | NOT_STARTED | GitHub App with minimal permissions, token storage | Auth tests, permission tests | | Wait for P12.08 |
| P13.02 | Issue-to-plan workflows | 3 | P13.01 | NOT_STARTED | Issue fetched, plan generated, tasks created | Workflow tests | | Wait for P13.01 |
| P13.03 | Branch and worktree creation | 3 | P13.02 | NOT_STARTED | Branches/worktrees created for tasks | Git integration tests | | Wait for P13.02 |
| P13.04 | Bounded implementation tasks | 3 | P13.03 | NOT_STARTED | Tasks execute in worktrees, bounded budgets | Implementation tests | | Wait for P13.03 |
| P13.05 | Automated test execution | 3 | P13.04 | NOT_STARTED | Tests run in task environment, results captured | Test execution tests | | Wait for P13.04 |
| P13.06 | Independent review reports | 3 | P13.05 | NOT_STARTED | Reviewer role produces independent report | Review tests | | Wait for P13.05 |
| P13.07 | Draft pull request creation | 3 | P13.06 | NOT_STARTED | PR created as draft with summary | PR creation tests | | Wait for P13.06 |
| P13.08 | Human approval before merge | 3 | P13.07 | NOT_STARTED | Merge requires explicit human action | Approval tests | | Wait for P13.07 |
| P13.09 | Mocked integration tests | 3 | P13.08 | NOT_STARTED | GitHub API mocked, full flow tested | Mocked integration tests | | Wait for P13.08 |

### P14 — Evaluation and Operational Maturity

| Chunk | Title | MVP | Dependencies | Status | Acceptance Criteria | Test Expectations | Evidence/Blocker | Next Action |
|-------|-------|-----|--------------|--------|---------------------|-------------------|------------------|-------------|
| P14.01 | Versioned evaluation datasets | 3 | P13.09 | NOT_STARTED | Datasets with tasks, expected outcomes, versioned | Dataset tests | | Wait for P13.09 |
| P14.02 | Repeatable regression benchmarks | 3 | P14.01 | NOT_STARTED | Benchmark suite runs automatically, tracks regressions | Benchmark tests | | Wait for P14.01 |
| P14.03 | Provider/model version tracking | 3 | P14.02 | NOT_STARTED | Model versions recorded per task, correlated with results | Tracking tests | | Wait for P14.02 |
| P14.04 | Tracing and cost monitoring | 3 | P14.03 | NOT_STARTED | Distributed tracing, cost per task/session | Tracing tests | | Wait for P14.03 |
| P14.05 | Concurrency and retention controls | 3 | P14.04 | NOT_STARTED | Configurable limits, retention enforced | Control tests | | Wait for P14.04 |
| P14.06 | Documented deployment options | 3 | P14.05 | NOT_STARTED | Deployment guide for local, server, container | Deployment docs | | Wait for P14.05 |
| P14.07 | Decision on whether multi-user support is justified | 3 | P14.06 | NOT_STARTED | Decision document with evidence | Decision record | | Wait for P14.06 |