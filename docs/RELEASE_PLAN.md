# RELEASE_PLAN.md

**Owner: dinesh-gix**

# GiX-AI Release Plan

## Release Strategy

- **Versioning**: Semantic Versioning (MAJOR.MINOR.PATCH)
- **Release Cadence**: Per MVP (major milestones)
- **Pre-releases**: Alpha/Beta for each MVP
- **Stability**: Main branch always deployable

## MVP-1: Local Coding Agent (Target: v0.1.0)

### Alpha Release (v0.1.0-alpha.0)

**Gate Criteria**:
- [ ] P00.01-P00.05: Foundation complete, CI passing
- [ ] P01.01-P01.05: Contracts, config, events complete
- [ ] P02.01-P02.02: Fake provider working, real adapter stubbed
- [ ] P03.01-P03.02: Workspace registration, file ops working
- [ ] P04.01: Tool registry with read_file, list_files
- [ ] All tests passing
- [ ] Security review of foundation complete

**Artifacts**:
- CLI binary installable via `pnpm pack`
- Documentation: README, AGENTS.md, ARCHITECTURE.md

### Beta Release (v0.1.0-beta.0)

**Gate Criteria**:
- [ ] P02.03-P02.06: Real Nemotron adapter working, conformance tests pass
- [ ] P03.03-P03.06: Code search, context selection, AGENTS.md, security tests pass
- [ ] P04.02-P04.07: All tools implemented, permission engine, security tests pass
- [ ] P05.01-P05.02: Agent loop with tool execution and permissions
- [ ] Integration tests passing
- [ ] Performance benchmarks recorded

**Artifacts**:
- CLI with real model integration
- Evaluation harness

### Release Candidate (v0.1.0-rc.0)

**Gate Criteria**:
- [ ] P05.03-P05.06: Planning, execution workflows, budgets, evaluation cases
- [ ] P06.01-P06.07: Full persistence, checkpoints, recovery tested
- [ ] P07.01-P07.07: Full CLI with TUI, JSON output, WSL validated
- [ ] P08.01-P08.03: Evaluations run, critical defects resolved
- [ ] Security review complete
- [ ] All tests passing in CI

**Artifacts**:
- Release candidate binary
- Complete documentation

### General Availability (v0.1.0)

**Gate Criteria**:
- [ ] P08.04: Documentation and security review signed off
- [ ] P08.05: MVP-1 release report published
- [ ] No critical/high severity bugs
- [ ] Performance within targets
- [ ] Migration path documented (N/A for first release)

**Artifacts**:
- GitHub release with binaries
- Announcement
- Updated docs site

---

## MVP-2: Balanced CLI and Web Experience (Target: v0.2.0)

### Alpha Release (v0.2.0-alpha.0)

**Gate Criteria**:
- [ ] P09.01-P09.04: Local API with CRUD endpoints
- [ ] P10.01: Next.js app with typed client building
- [ ] Shared types between CLI and Web
- [ ] All MVP-1 tests still passing

### Beta Release (v0.2.0-beta.0)

**Gate Criteria**:
- [ ] P09.05-P09.08: SSE streaming, reconnection, security hardened
- [ ] P10.02-P10.07: Full Web workspace UI, diff review, approvals
- [ ] P10.08: Reconnection handling tested
- [ ] CLI and Web use same agent runtime (verified)
- [ ] Playwright E2E tests passing

### Release Candidate (v0.2.0-rc.0)

**Gate Criteria**:
- [ ] P11.01-P11.10: Remote execution architecture (disabled by default), isolation tested
- [ ] Security review of API and Web complete
- [ ] Load testing of local server
- [ ] All tests passing

### General Availability (v0.2.0)

**Gate Criteria**:
- [ ] MVP-2 release report published
- [ ] No regressions from MVP-1
- [ ] Web application production-ready
- [ ] Remote execution opt-in documented with warnings

---

## MVP-3: Autonomous Engineering Workflows (Target: v0.3.0)

### Alpha Release (v0.3.0-alpha.0)

**Gate Criteria**:
- [ ] P12.01-P12.04: Task graphs, roles, isolated workspaces, global budgets
- [ ] Multi-task orchestration working
- [ ] All MVP-2 tests passing

### Beta Release (v0.3.0-beta.0)

**Gate Criteria**:
- [ ] P12.05-P12.08: Background jobs, integration, cancellation, visibility
- [ ] P13.01-P13.04: GitHub integration, issue-to-plan, branches, bounded tasks
- [ ] Mocked GitHub integration tests passing

### Release Candidate (v0.3.0-rc.0)

**Gate Criteria**:
- [ ] P13.05-P13.09: Automated tests, review reports, draft PRs, human approval
- [ ] P14.01-P14.04: Evaluation datasets, benchmarks, model tracking, tracing
- [ ] Full integration tests with mocked GitHub
- [ ] Security review of GitHub integration

### General Availability (v0.3.0)

**Gate Criteria**:
- [ ] P14.05-P14.07: Retention controls, deployment docs, multi-user decision
- [ ] MVP-3 release report published
- [ ] No regressions
- [ ] Operational maturity demonstrated

---

## Release Process

### Pre-Release Checklist

For each release candidate:

1. **Code Complete**
   - [ ] All chunks for release VERIFIED or ACCEPTED
   - [ ] No TODO/FIXME in release scope
   - [ ] CHANGELOG.md updated

2. **Quality Gates**
   - [ ] `pnpm typecheck` passes (exit 0)
   - [ ] `pnpm lint` passes (exit 0)
   - [ ] `pnpm test` passes (exit 0)
   - [ ] `pnpm build` passes (exit 0)
   - [ ] Security tests pass
   - [ ] Performance benchmarks within 10% of baseline

3. **Documentation**
   - [ ] README.md updated
   - [ ] API docs generated/updated
   - [ ] Migration guide (if breaking changes)
   - [ ] Release notes drafted

4. **Security**
   - [ ] `pnpm audit` - no critical/high vulnerabilities
   - [ ] Dependency review for new packages
   - [ ] Secret scanning clean
   - [ ] Security review signed off

5. **Verification**
   - [ ] Smoke tests on clean install
   - [ ] WSL validation (MVP-1+)
   - [ ] Cross-platform check (if applicable)

### Release Steps

1. Create release branch: `release/vX.Y.Z`
2. Final version bump in root package.json
3. Generate CHANGELOG.md (auto + manual)
4. Create Git tag: `vX.Y.Z`
5. Push tag and release branch
6. CI builds and publishes artifacts
7. Create GitHub Release with notes
8. Announce (if public)
9. Merge release branch to main
10. Bump version to next pre-release (e.g., vX.Y.Z+1-alpha.0)

### Hotfix Process

For critical production issues:

1. Branch from tag: `hotfix/vX.Y.Z+1`
2. Minimal fix with test
3. Fast-track through quality gates
4. Tag: `vX.Y.Z+1`
5. Release
6. Merge to main and develop branches

---

## Rollback Plan

- Each release tagged for easy rollback
- Database migrations forward-only (no down migrations)
- Config backward compatible within major version
- Feature flags for risky new features
- Rollback: redeploy previous tag, restore database from backup

---

## Support Policy

| Version | Support Status | End of Life |
|---------|----------------|-------------|
| 0.1.x   | MVP-1 Maintenance | After v0.2.0 GA + 3 months |
| 0.2.x   | MVP-2 Maintenance | After v0.3.0 GA + 3 months |
| 0.3.x   | Current | TBD |

- Security fixes backported to supported versions
- No new features in maintenance versions
- Migration guides for major upgrades

---

## Release Metrics

Track per release:
- Time from code complete to release
- Defect escape rate (bugs found post-release)
- Install success rate
- Performance regression %
- Test coverage %
- Security issues found