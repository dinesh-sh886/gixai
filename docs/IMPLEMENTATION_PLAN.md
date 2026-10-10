# IMPLEMENTATION_PLAN.md

**Owner: dinesh-gix**

# GiX-AI Implementation Plan

## Overview

This document details the phased implementation plan for GiX-AI, an AI coding agent with balanced CLI and Web experiences. The plan is organized into three MVPs, each with multiple phases and implementation chunks.

## MVP-1: Local Coding Agent (P00-P08)

### P00 — Repository and Engineering Foundation

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P00.01 | Initialize pnpm workspace and strict TypeScript foundation | — | IN_PROGRESS |
| P00.02 | Establish lint, formatting, type-check, test, and build commands | P00.01 | NOT_STARTED |
| P00.03 | Establish CI checks | P00.02 | NOT_STARTED |
| P00.04 | Document engineering conventions and architecture decisions | P00.01 | NOT_STARTED |
| P00.05 | Create deterministic testing utilities and repository fixtures | P00.02 | NOT_STARTED |

### P01 — Contracts, Configuration, and Events

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P01.01 | Define common IDs, DTOs, domain errors, and task states | P00.02 | NOT_STARTED |
| P01.02 | Implement validated configuration and precedence | P01.01 | NOT_STARTED |
| P01.03 | Define model and tool interfaces | P01.01 | NOT_STARTED |
| P01.04 | Define structured logging and secret redaction | P01.01 | NOT_STARTED |
| P01.05 | Add contract validation tests | P01.01-P01.04 | NOT_STARTED |

### P02 — Model Gateway

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P02.01 | Define provider interfaces and capability detection | P01.03 | NOT_STARTED |
| P02.02 | Implement a deterministic fake provider | P02.01 | NOT_STARTED |
| P02.03 | Implement the first real Nemotron-compatible adapter | P02.01 | NOT_STARTED |
| P02.04 | Support streaming, tool calls, cancellation, and errors | P02.02, P02.03 | NOT_STARTED |
| P02.05 | Implement timeouts, retry policies, and usage budgets | P02.04 | NOT_STARTED |
| P02.06 | Add provider conformance tests | P02.05 | NOT_STARTED |

### P03 — Workspace and Repository Context

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P03.01 | Register workspaces and canonicalize paths | P01.02 | NOT_STARTED |
| P03.02 | Implement safe file listing and bounded file reading | P03.01 | NOT_STARTED |
| P03.03 | Implement code search | P03.02 | NOT_STARTED |
| P03.04 | Add context selection and size budgets | P03.03 | NOT_STARTED |
| P03.05 | Support repository instructions using AGENTS.md | P03.04 | NOT_STARTED |
| P03.06 | Test path traversal, symlinks, ignored files, binary files, and large outputs | P03.05 | NOT_STARTED |

### P04 — Tool Runtime and Permissions

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P04.01 | Implement the typed tool registry | P01.03 | NOT_STARTED |
| P04.02 | Implement read_file, list_files, and search_code | P04.01 | NOT_STARTED |
| P04.03 | Implement write_file and apply_patch | P04.01 | NOT_STARTED |
| P04.04 | Implement git_status and git_diff | P04.01 | NOT_STARTED |
| P04.05 | Implement bounded command execution | P04.01 | NOT_STARTED |
| P04.06 | Implement allow, deny, and ask permission policies | P04.01 | NOT_STARTED |
| P04.07 | Test dangerous commands, stale approvals, concurrent edits, and filesystem boundaries | P04.06 | NOT_STARTED |

### P05 — Agent Core

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P05.01 | Implement a bounded agent loop | P02.06, P04.07 | NOT_STARTED |
| P05.02 | Implement tool execution and permission integration | P05.01 | NOT_STARTED |
| P05.03 | Implement planning and execution workflows | P05.02 | NOT_STARTED |
| P05.04 | Implement maximum steps, deadlines, cancellation, and budgets | P05.03 | NOT_STARTED |
| P05.05 | Implement ordered task events | P05.04 | NOT_STARTED |
| P05.06 | Add deterministic agent evaluation cases | P05.05 | NOT_STARTED |

### P06 — Persistence and Recovery

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P06.01 | Implement SQLite migrations and repositories | P01.02 | NOT_STARTED |
| P06.02 | Persist workspaces, sessions, messages, tasks, and events | P06.01 | NOT_STARTED |
| P06.03 | Persist tool invocations, approvals, and verification results | P06.02 | NOT_STARTED |
| P06.04 | Implement versioned checkpoints | P06.03 | NOT_STARTED |
| P06.05 | Implement safe recovery of interrupted tasks | P06.04 | NOT_STARTED |
| P06.06 | Add retention and cleanup policies | P06.05 | NOT_STARTED |
| P06.07 | Test restart recovery, migrations, and event replay | P06.06 | NOT_STARTED |

### P07 — CLI and TUI

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P07.01 | Implement the `gix` command | P05.06, P06.07 | NOT_STARTED |
| P07.02 | Implement configuration and provider diagnostics | P07.01 | NOT_STARTED |
| P07.03 | Implement the interactive terminal experience | P07.01 | NOT_STARTED |
| P07.04 | Implement run, plan, review, tasks, and resume commands | P07.03 | NOT_STARTED |
| P07.05 | Implement scripting-friendly JSON output | P07.04 | NOT_STARTED |
| P07.06 | Implement cancellation and graceful shutdown | P07.05 | NOT_STARTED |
| P07.07 | Validate clean installation in WSL | P07.06 | NOT_STARTED |

### P08 — MVP-1 Stabilization

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P08.01 | Run representative repository evaluations | P07.07 | NOT_STARTED |
| P08.02 | Measure task success, verification results, regressions, recovery, and cost | P08.01 | NOT_STARTED |
| P08.03 | Resolve critical and high-priority defects | P08.02 | NOT_STARTED |
| P08.04 | Complete documentation and security review | P08.03 | NOT_STARTED |
| P08.05 | Produce the MVP-1 release report | P08.04 | NOT_STARTED |

### MVP-1 Acceptance Criteria

MVP-1 is complete when:
- Clean installation works
- CLI communicates with configured real model
- Deterministic fake provider supports automated tests
- Repository search and file inspection work
- Changes are reviewable through Git diffs
- File modifications and command execution pass through permission controls
- Agent executes commands with time and output limits
- Sessions persist locally and can be resumed safely
- Verification results reflect commands actually executed
- Test suite and build pass
- Release report documents limitations and evaluation evidence

---

## MVP-2: Balanced CLI and Web Experience (P09-P11)

### P09 — Local API

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P09.01 | Versioned `/api/v1` routes with health and capability endpoints | P08.05 | NOT_STARTED |
| P09.02 | Workspace, session, and task endpoints | P09.01 | NOT_STARTED |
| P09.03 | Task creation, cancellation, resume, and approval endpoints | P09.02 | NOT_STARTED |
| P09.04 | Diff and verification endpoints | P09.03 | NOT_STARTED |
| P09.05 | Server-sent events for live task updates | P09.04 | NOT_STARTED |
| P09.06 | Durable event IDs and reconnection/replay | P09.05 | NOT_STARTED |
| P09.07 | Request validation and consistent error responses | P09.06 | NOT_STARTED |
| P09.08 | Loopback-only binding, browser-origin protections, local auth | P09.07 | NOT_STARTED |

### P10 — Web Workspace

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P10.01 | Next.js application with shared typed API client | P09.08 | NOT_STARTED |
| P10.02 | Workspace and session navigation | P10.01 | NOT_STARTED |
| P10.03 | Task creation and task history | P10.02 | NOT_STARTED |
| P10.04 | Streaming conversation and execution events | P10.03 | NOT_STARTED |
| P10.05 | Repository file tree, file viewing and editing | P10.04 | NOT_STARTED |
| P10.06 | Diff review and approval prompts | P10.05 | NOT_STARTED |
| P10.07 | Verification output and error presentation | P10.06 | NOT_STARTED |
| P10.08 | Reconnection handling | P10.07 | NOT_STARTED |
| P10.09 | Playwright end-to-end tests | P10.08 | NOT_STARTED |

### P11 — Hybrid Remote Execution

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P11.01 | Remote execution architecture and threat model | P10.09 | NOT_STARTED |
| P11.02 | Authenticated worker registration | P11.01 | NOT_STARTED |
| P11.03 | Job dispatch and durable task tracking | P11.02 | NOT_STARTED |
| P11.04 | Per-task isolated execution environments | P11.03 | NOT_STARTED |
| P11.05 | CPU, memory, runtime, and output limits | P11.04 | NOT_STARTED |
| P11.06 | Workspace and credential restrictions | P11.05 | NOT_STARTED |
| P11.07 | Network egress restrictions | P11.06 | NOT_STARTED |
| P11.08 | Cancellation, retry, and idempotency controls | P11.07 | NOT_STARTED |
| P11.09 | Worker-loss and duplicate-delivery tests | P11.08 | NOT_STARTED |
| P11.10 | Clear local-versus-remote execution configuration | P11.09 | NOT_STARTED |

### MVP-2 Acceptance Criteria

- CLI and Web operate through shared backend/runtime
- Web task events stream and reconnect correctly
- File changes and diffs are reviewable
- Approvals enforced by backend, not just UI
- Local API security tests pass
- Remote execution has tested isolation and recovery
- Web application builds and e2e tests pass

---

## MVP-3: Autonomous Engineering Workflows (P12-P14)

### P12 — Multi-Step Orchestration

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P12.01 | Task dependency graphs | P11.10 | NOT_STARTED |
| P12.02 | Planner, implementer, tester, and reviewer roles | P12.01 | NOT_STARTED |
| P12.03 | Isolated workspaces for parallel tasks | P12.02 | NOT_STARTED |
| P12.04 | Global budgets across child tasks | P12.03 | NOT_STARTED |
| P12.05 | Durable background jobs | P12.04 | NOT_STARTED |
| P12.06 | Integration and conflict resolution | P12.05 | NOT_STARTED |
| P12.07 | Cancellation propagation | P12.06 | NOT_STARTED |
| P12.08 | Operator visibility into every child task | P12.07 | NOT_STARTED |

### P13 — GitHub and CI Integration

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P13.01 | Least-privilege GitHub integration | P12.08 | NOT_STARTED |
| P13.02 | Issue-to-plan workflows | P13.01 | NOT_STARTED |
| P13.03 | Branch and worktree creation | P13.02 | NOT_STARTED |
| P13.04 | Bounded implementation tasks | P13.03 | NOT_STARTED |
| P13.05 | Automated test execution | P13.04 | NOT_STARTED |
| P13.06 | Independent review reports | P13.05 | NOT_STARTED |
| P13.07 | Draft pull request creation | P13.06 | NOT_STARTED |
| P13.08 | Human approval before merge | P13.07 | NOT_STARTED |
| P13.09 | Mocked integration tests | P13.08 | NOT_STARTED |

### P14 — Evaluation and Operational Maturity

| Chunk | Title | Dependencies | Status |
|-------|-------|--------------|--------|
| P14.01 | Versioned evaluation datasets | P13.09 | NOT_STARTED |
| P14.02 | Repeatable regression benchmarks | P14.01 | NOT_STARTED |
| P14.03 | Provider/model version tracking | P14.02 | NOT_STARTED |
| P14.04 | Tracing and cost monitoring | P14.03 | NOT_STARTED |
| P14.05 | Concurrency and retention controls | P14.04 | NOT_STARTED |
| P14.06 | Documented deployment options | P14.05 | NOT_STARTED |
| P14.07 | Decision on multi-user support | P14.06 | NOT_STARTED |

### MVP-3 Acceptance Criteria

- Parallel tasks are isolated
- Task dependencies and failures are tracked
- Budgets enforced across child tasks
- Verification results persisted
- GitHub changes auditable
- Pull request publication follows configured policy
- Merging requires explicit human approval
- Evaluation and regression results reproducible

---

## Dependency Graph Summary

```
P00.01 → P00.02 → P00.03 → P00.04 → P00.05
                        ↓
P01.01 → P01.02 → P01.03 → P01.04 → P01.05
                        ↓
P02.01 → P02.02 → P02.03 → P02.04 → P02.05 → P02.06
                        ↓
P03.01 → P03.02 → P03.03 → P03.04 → P03.05 → P03.06
                        ↓
P04.01 → P04.02-P04.05 → P04.06 → P04.07
                        ↓
P06.01 → P06.02 → P06.03 → P06.04 → P06.05 → P06.06 → P06.07
                        ↓
P05.01 → P05.02 → P05.03 → P05.04 → P05.05 → P05.06
                        ↓
P07.01 → P07.02 → P07.03 → P07.04 → P07.05 → P07.06 → P07.07
                        ↓
P08.01 → P08.02 → P08.03 → P08.04 → P08.05
                        ↓
P09.01 → ... → P09.08 → P10.01 → ... → P10.09 → P11.01 → ... → P11.10
                        ↓
P12.01 → ... → P12.08 → P13.01 → ... → P13.09 → P14.01 → ... → P14.07
```