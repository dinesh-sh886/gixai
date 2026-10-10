# API_AND_DATA_MODEL.md

**Owner: dinesh-gix**

# GiX-AI API and Data Model

## API Overview

### Base URL
- Local development: `http://127.0.0.1:3456/api/v1`
- CLI uses direct in-process calls (no HTTP)

### Versioning
- URL versioned: `/api/v1/`
- Breaking changes require new version
- Deprecation policy: 6 months notice

### Authentication
- Local server: Loopback-only binding by default
- Browser-origin protection: `Origin` header validation
- Local auth: Shared secret token via `GIX_API_TOKEN` env or config file
- No authentication for CLI (in-process)

### Content Type
- Requests: `application/json`
- Responses: `application/json`
- SSE: `text/event-stream`

### Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {},
    "requestId": "req_abc123"
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `UNAUTHORIZED` | 401 | Missing or invalid auth |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Dependency unavailable |

---

## API Routes

### Health & Capabilities

#### GET /api/v1/health
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "uptimeMs": 123456
}
```

#### GET /api/v1/capabilities
```json
{
  "modelProviders": ["nemotron", "fake"],
  "tools": ["read_file", "write_file", "list_files", "search_code", "git_status", "git_diff", "execute_command"],
  "maxContextTokens": 128000,
  "streaming": true,
  "remoteExecution": false
}
```

### Workspaces

#### GET /api/v1/workspaces
```json
{
  "workspaces": [
    {
      "id": "ws_abc123",
      "rootPath": "/home/user/project",
      "name": "project",
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/v1/workspaces
```json
// Request
{
  "rootPath": "/home/user/project",
  "name": "project"
}

// Response
{
  "id": "ws_abc123",
  "rootPath": "/home/user/project",
  "name": "project",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z"
}
```

#### GET /api/v1/workspaces/{workspaceId}
```json
{
  "id": "ws_abc123",
  "rootPath": "/home/user/project",
  "name": "project",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z"
}
```

#### DELETE /api/v1/workspaces/{workspaceId}
```json
{
  "success": true
}
```

### Sessions

#### GET /api/v1/workspaces/{workspaceId}/sessions
```json
{
  "sessions": [
    {
      "id": "sess_abc123",
      "workspaceId": "ws_abc123",
      "title": "Feature: Add auth",
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-01-15T11:45:00Z",
      "messageCount": 12
    }
  ]
}
```

#### POST /api/v1/workspaces/{workspaceId}/sessions
```json
// Request
{
  "title": "Feature: Add auth"
}

// Response
{
  "id": "sess_abc123",
  "workspaceId": "ws_abc123",
  "title": "Feature: Add auth",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z",
  "messageCount": 0
}
```

#### GET /api/v1/sessions/{sessionId}
```json
{
  "id": "sess_abc123",
  "workspaceId": "ws_abc123",
  "title": "Feature: Add auth",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T11:45:00Z",
  "messageCount": 12
}
```

#### GET /api/v1/sessions/{sessionId}/messages
```json
{
  "messages": [
    {
      "id": "msg_abc123",
      "sessionId": "sess_abc123",
      "role": "user",
      "content": "Add authentication to the API",
      "createdAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": "msg_def456",
      "sessionId": "sess_abc123",
      "role": "assistant",
      "content": "I'll implement authentication...",
      "toolCalls": [],
      "createdAt": "2026-01-15T10:30:05Z"
    }
  ],
  "cursor": "msg_def456"
}
```

### Tasks

#### POST /api/v1/workspaces/{workspaceId}/tasks
```json
// Request
{
  "sessionId": "sess_abc123",
  "type": "coding",
  "prompt": "Add JWT authentication middleware",
  "budget": {
    "maxSteps": 20,
    "maxTokens": 50000,
    "maxDurationMs": 300000
  }
}

// Response
{
  "id": "task_abc123",
  "workspaceId": "ws_abc123",
  "sessionId": "sess_abc123",
  "type": "coding",
  "status": "running",
  "prompt": "Add JWT authentication middleware",
  "budget": {
    "maxSteps": 20,
    "maxTokens": 50000,
    "maxDurationMs": 300000
  },
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z"
}
```

#### GET /api/v1/tasks/{taskId}
```json
{
  "id": "task_abc123",
  "workspaceId": "ws_abc123",
  "sessionId": "sess_abc123",
  "type": "coding",
  "status": "running",
  "prompt": "Add JWT authentication middleware",
  "budget": {
    "maxSteps": 20,
    "maxTokens": 50000,
    "maxDurationMs": 300000
  },
  "currentStep": 3,
  "tokensUsed": 12500,
  "durationMs": 45000,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:45Z"
}
```

#### POST /api/v1/tasks/{taskId}/cancel
```json
{
  "success": true,
  "task": {
    "id": "task_abc123",
    "status": "cancelled"
  }
}
```

#### POST /api/v1/tasks/{taskId}/resume
```json
// Request
{
  "checkpointVersion": 2
}

// Response
{
  "id": "task_abc123",
  "status": "running"
}
```

#### GET /api/v1/tasks/{taskId}/events
```json
{
  "events": [
    {
      "id": "evt_abc123",
      "taskId": "task_abc123",
      "sequence": 1,
      "type": "TaskStarted",
      "payload": { "prompt": "Add JWT authentication middleware" },
      "createdAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": "evt_def456",
      "taskId": "task_abc123",
      "sequence": 2,
      "type": "ContextRetrieved",
      "payload": { "fileCount": 15, "tokenCount": 8500 },
      "createdAt": "2026-01-15T10:30:01Z"
    }
  ],
  "cursor": "evt_def456"
}
```

### Approvals

#### GET /api/v1/tasks/{taskId}/approvals
```json
{
  "approvals": [
    {
      "id": "appr_abc123",
      "taskId": "task_abc123",
      "toolName": "write_file",
      "toolInput": { "path": "src/auth.ts", "content": "..." },
      "status": "pending",
      "expiresAt": "2026-01-15T11:30:00Z",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/v1/approvals/{approvalId}/decide
```json
// Request
{
  "decision": "allow",
  "reason": "Approved by user"
}

// Response
{
  "id": "appr_abc123",
  "status": "allowed",
  "decidedAt": "2026-01-15T10:30:15Z"
}
```

### Diffs & Verification

#### GET /api/v1/tasks/{taskId}/diff
```json
{
  "diff": "diff --git a/src/auth.ts b/src/auth.ts\n+export function authMiddleware() {...}",
  "files": [
    { "path": "src/auth.ts", "status": "modified", "additions": 25, "deletions": 0 }
  ]
}
```

#### GET /api/v1/tasks/{taskId}/verification
```json
{
  "runs": [
    {
      "id": "ver_abc123",
      "taskId": "task_abc123",
      "type": "lint",
      "command": "pnpm lint",
      "status": "passed",
      "output": "No lint errors found",
      "durationMs": 5000,
      "createdAt": "2026-01-15T10:35:00Z"
    },
    {
      "id": "ver_def456",
      "taskId": "task_abc123",
      "type": "test",
      "command": "pnpm test",
      "status": "failed",
      "output": "FAIL src/auth.test.ts\n  Expected true, got false",
      "durationMs": 12000,
      "createdAt": "2026-01-15T10:35:12Z"
    }
  ]
}
```

### Server-Sent Events (SSE)

#### GET /api/v1/tasks/{taskId}/stream
```
event: TaskStarted
data: {"taskId":"task_abc123","prompt":"Add JWT auth","sequence":1}

event: ContextRetrieved
data: {"taskId":"task_abc123","fileCount":15,"tokenCount":8500,"sequence":2}

event: ModelRequested
data: {"taskId":"task_abc123","model":"nemotron-3-ultra","sequence":3}

event: ToolInvoked
data: {"taskId":"task_abc123","tool":"read_file","input":{"path":"src/auth.ts"},"sequence":4}

event: ToolCompleted
data: {"taskId":"task_abc123","tool":"read_file","output":"...","durationMs":15,"sequence":5}

event: ApprovalRequested
data: {"taskId":"task_abc123","approvalId":"appr_abc123","tool":"write_file","sequence":6}

event: VerificationCompleted
data: {"taskId":"task_abc123","verificationId":"ver_abc123","type":"lint","status":"passed","sequence":7}

event: TaskCompleted
data: {"taskId":"task_abc123","status":"completed","result":"Authentication middleware added","sequence":8}
```

#### Reconnection & Replay
- Client sends `Last-Event-ID` header on reconnect
- Server replays events from that sequence number
- If `Last-Event-ID` not recognized, replay from task start
- Durable event IDs: `evt_{taskId}_{sequence}`

---

## Data Model

### Entity Definitions

#### Workspace
```typescript
interface Workspace {
  id: WorkspaceId;           // ws_<ulid>
  rootPath: string;          // Absolute, canonicalized
  name: string;              // Human-readable
  config: WorkspaceConfig;   // JSON config
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Session
```typescript
interface Session {
  id: SessionId;             // sess_<ulid>
  workspaceId: WorkspaceId;
  title: string;
  metadata: Record<string, unknown>;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Message
```typescript
interface Message {
  id: MessageId;             // msg_<ulid>
  sessionId: SessionId;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];    // For assistant messages
  toolCallId?: ToolCallId;   // For tool messages
  createdAt: DateTime;
}
```

#### Task
```typescript
interface Task {
  id: TaskId;                // task_<ulid>
  workspaceId: WorkspaceId;
  sessionId: SessionId | null;
  parentTaskId: TaskId | null;  // For subtasks
  type: TaskType;            // 'coding' | 'review' | 'test' | 'plan' | 'background'
  status: TaskStatus;        // 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  prompt: string;
  budget: TaskBudget;
  currentStep: number;
  tokensUsed: number;
  durationMs: number;
  result: string | null;
  error: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
  completedAt: DateTime | null;
}

type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

interface TaskBudget {
  maxSteps: number;
  maxTokens: number;
  maxDurationMs: number;
  maxCostUsd?: number;
}
```

#### TaskEvent
```typescript
interface TaskEvent {
  id: EventId;               // evt_<ulid>
  taskId: TaskId;
  sequence: number;          // Monotonic per task
  type: TaskEventType;
  payload: Record<string, unknown>;
  createdAt: DateTime;
}

type TaskEventType =
  | 'TaskStarted'
  | 'TaskCompleted'
  | 'TaskFailed'
  | 'TaskCancelled'
  | 'ContextRetrieved'
  | 'ModelRequested'
  | 'ModelResponded'
  | 'ToolInvoked'
  | 'ToolCompleted'
  | 'ToolFailed'
  | 'PermissionRequested'
  | 'PermissionGranted'
  | 'PermissionDenied'
  | 'VerificationStarted'
  | 'VerificationCompleted'
  | 'CheckpointCreated';
```

#### ToolInvocation
```typescript
interface ToolInvocation {
  id: ToolInvocationId;      // inv_<ulid>
  taskId: TaskId;
  eventId: EventId;          // Links to ToolInvoked event
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  approvalId: ApprovalId | null;
  verificationId: VerificationId | null;
  durationMs: number | null;
  error: string | null;
  createdAt: DateTime;
  completedAt: DateTime | null;
}
```

#### Approval
```typescript
interface Approval {
  id: ApprovalId;            // appr_<ulid>
  taskId: TaskId;
  toolInvocationId: ToolInvocationId;
  toolName: string;
  toolInput: Record<string, unknown>;
  status: 'pending' | 'allowed' | 'denied' | 'expired';
  policy: 'allow' | 'deny' | 'ask';
  requestedBy: 'agent' | 'user';
  decidedBy: string | null;  // User identifier
  reason: string | null;
  expiresAt: DateTime;
  decidedAt: DateTime | null;
  createdAt: DateTime;
}
```

#### Checkpoint
```typescript
interface Checkpoint {
  id: CheckpointId;          // chk_<ulid>
  taskId: TaskId;
  version: number;           // Monotonic per task
  state: CheckpointState;    // Serialized agent state
  description: string;
  createdAt: DateTime;
}

interface CheckpointState {
  currentStep: number;
  messages: Message[];
  contextSummary: string;
  tokensUsed: number;
  toolInvocations: ToolInvocation[];
  // ... other runtime state
}
```

#### VerificationRun
```typescript
interface VerificationRun {
  id: VerificationId;        // ver_<ulid>
  taskId: TaskId;
  toolInvocationId: ToolInvocationId | null;
  type: VerificationType;    // 'lint' | 'test' | 'typecheck' | 'build' | 'custom'
  command: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  output: string | null;
  durationMs: number | null;
  createdAt: DateTime;
  completedAt: DateTime | null;
}
```

#### ModelUsage
```typescript
interface ModelUsage {
  id: UsageId;               // use_<ulid>
  taskId: TaskId | null;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number | null;
  requestId: string;
  createdAt: DateTime;
}
```

### ID Format

All IDs use ULID (Universally Unique Lexicographically Sortable Identifier) with type prefix:
- `ws_` — Workspace
- `sess_` — Session
- `msg_` — Message
- `task_` — Task
- `evt_` — TaskEvent
- `inv_` — ToolInvocation
- `appr_` — Approval
- `chk_` — Checkpoint
- `ver_` — VerificationRun
- `use_` — ModelUsage

Format: `{prefix}{ulid}` (e.g., `ws_01ARZ3NDEKTSV4RRFFQ69G5FAV`)

### Database Schema (SQLite)

```sql
-- Workspaces
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  root_path TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  config TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_workspaces_root_path ON workspaces(root_path);

-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_sessions_workspace ON sessions(workspace_id);

-- Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  tool_calls TEXT,
  tool_call_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  parent_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('coding', 'review', 'test', 'plan', 'background')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  prompt TEXT NOT NULL,
  budget TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  result TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_session ON tasks(session_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Task Events
CREATE TABLE task_events (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(task_id, sequence)
);

CREATE INDEX idx_task_events_task ON task_events(task_id);
CREATE INDEX idx_task_events_sequence ON task_events(task_id, sequence);

-- Tool Invocations
CREATE TABLE tool_invocations (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES task_events(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  approval_id TEXT REFERENCES approvals(id) ON DELETE SET NULL,
  verification_id TEXT REFERENCES verification_runs(id) ON DELETE SET NULL,
  duration_ms INTEGER,
  error TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX idx_tool_invocations_task ON tool_invocations(task_id);
CREATE INDEX idx_tool_invocations_approval ON tool_invocations(approval_id);

-- Approvals
CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tool_invocation_id TEXT NOT NULL REFERENCES tool_invocations(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_input TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'allowed', 'denied', 'expired')),
  policy TEXT NOT NULL CHECK (policy IN ('allow', 'deny', 'ask')),
  requested_by TEXT NOT NULL CHECK (requested_by IN ('agent', 'user')),
  decided_by TEXT,
  reason TEXT,
  expires_at TEXT NOT NULL,
  decided_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_approvals_task ON approvals(task_id);
CREATE INDEX idx_approvals_status ON approvals(status);

-- Checkpoints
CREATE TABLE checkpoints (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  state TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(task_id, version)
);

CREATE INDEX idx_checkpoints_task ON checkpoints(task_id);

-- Verification Runs
CREATE TABLE verification_runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tool_invocation_id TEXT REFERENCES tool_invocations(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('lint', 'test', 'typecheck', 'build', 'custom')),
  command TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'passed', 'failed', 'skipped')),
  output TEXT,
  duration_ms INTEGER,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX idx_verification_runs_task ON verification_runs(task_id);

-- Model Usage
CREATE TABLE model_usage (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd REAL,
  request_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_model_usage_task ON model_usage(task_id);
CREATE INDEX idx_model_usage_created ON model_usage(created_at);

-- Schema Version
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);
```

### Relationships

```
Workspace (1) ─────< (N) Session
Workspace (1) ─────< (N) Task
Session   (1) ─────< (N) Message
Session   (1) ─────< (N) Task
Task      (1) ─────< (N) TaskEvent (ordered by sequence)
Task      (1) ─────< (N) ToolInvocation
Task      (1) ─────< (N) Approval
Task      (1) ─────< (N) Checkpoint (ordered by version)
Task      (1) ─────< (N) VerificationRun
Task      (1) ─────< (N) ModelUsage
ToolInvocation (1) ──< (1) Approval
ToolInvocation (1) ──< (1) VerificationRun
Task      (1) ─────< (N) Task (subtasks via parent_task_id)
```

### Transaction Boundaries

- Task creation: Single transaction (task + initial event)
- Tool execution: ToolInvocation + Approval (if needed) + Event in single transaction
- Checkpoint creation: Checkpoint + Task update (current_step, tokens) in transaction
- Verification: VerificationRun + ToolInvocation update in transaction
- Task completion: Task status + TaskCompleted event + final checkpoint in transaction

### Retention Policies

| Entity | Retention | Cleanup Trigger |
|--------|-----------|-----------------|
| TaskEvents | 90 days | Daily cron |
| ToolInvocations | 90 days | Daily cron |
| VerificationRuns | 90 days | Daily cron |
| ModelUsage | 1 year | Monthly cron |
| Checkpoints | 30 days (keep last 10 per task) | On new checkpoint |
| Messages | 1 year | Monthly cron |
| Approvals | 30 days after decision | Daily cron |

### Pagination

- Cursor-based pagination using `cursor` parameter
- Cursor = last item ID from previous page
- Default page size: 50, max: 200
- Response includes `nextCursor` if more pages exist

```json
{
  "items": [...],
  "nextCursor": "msg_def456",
  "hasMore": true
}
```