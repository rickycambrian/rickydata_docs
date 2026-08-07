# Answer Sheets

Answer sheets are proven solution patterns mined from successful agent sessions. They capture the error signature, ordered solution steps, and a Bayesian confidence score that improves with feedback.

> **New here?** See the [Answer Sheets Quickstart](./ANSWER_SHEETS_QUICKSTART.md) for install, setup, and working code examples.

## Concepts

### What Is an Answer Sheet?

An answer sheet records how an agent successfully resolved a specific type of error. It includes:

- **Error signature**: A regex pattern that matches the error (e.g., `Edit.*old_string.*not found`)
- **Problem category**: One of 12 classifications derived from Paper 3's error types
- **Solution steps**: Ordered list of tool calls with step number, action, and rationale
- **Solution summary**: Human-readable description of the fix
- **Confidence**: Bayesian score updated by feedback (`success / (success + failure + 5)`)
- **Provenance**: Source session IDs and Tier 2 extraction IDs

### How Confidence Works

Answer sheets start with confidence 0.0 (no feedback). As users confirm or reject solutions:

| Feedback | Effect |
|----------|--------|
| `positive: true` | +1 success_count, confidence increases |
| `positive: false` | +1 failure_count, confidence decreases |

Formula: `confidence = success_count / (success_count + failure_count + 5)`

The `+5` prior prevents new sheets with one confirmation from reaching high confidence too quickly.

| Success | Failure | Confidence | Interpretation |
|---------|---------|-----------|----------------|
| 0 | 0 | 0.00 | New, untested |
| 1 | 0 | 0.17 | Single success, low confidence |
| 5 | 1 | 0.45 | Moderate |
| 10 | 2 | 0.59 | Good |
| 20 | 3 | 0.71 | High confidence |
| 50 | 5 | 0.83 | Very reliable |

### Hybrid Matching

The match endpoint uses three strategies executed in order:

1. **Regex signature match**: Tests `error_text` against each sheet's `error_signature` regex. Score: 1.0 for regex match, 0.7 for substring fallback if regex is invalid.
2. **Category classification**: Classifies `error_text` into a `problem_category` using keyword heuristics (Paper 3), then looks up `answer_sheets_by_category`. Score: 0.6.
3. **(Future) Embedding similarity**: Gemini embedding of error text for semantic nearest-neighbor search.
4. **Score fusion**: Deduplicates by answer_sheet_id, keeps best score per sheet, computes `final = match_score * 0.4 + confidence * 0.6`.

## Data Model

### ScyllaDB Tables

**`answer_sheets`** -- Main records (partitioned by tenant_id)

| Column | Type | Description |
|--------|------|-------------|
| `tenant_id` | UUID | Partition key |
| `answer_sheet_id` | UUID | Clustering key |
| `error_signature` | TEXT | Regex matching the error |
| `problem_category` | TEXT | Error classification (12 categories) |
| `solution_steps` | TEXT | JSON array of ordered steps |
| `solution_summary` | TEXT | Human-readable fix description |
| `source_session_ids` | LIST\<UUID\> | Sessions this was mined from |
| `source_extraction_ids` | LIST\<UUID\> | Tier 2 extraction IDs |
| `success_count` | INT | Times this sheet led to success |
| `failure_count` | INT | Times this sheet was tried and failed |
| `confidence` | FLOAT | Bayesian confidence score |
| `repo_context` | TEXT | JSON: repo patterns and file types |
| `languages` | LIST\<TEXT\> | Programming languages |
| `frameworks` | LIST\<TEXT\> | Frameworks (axum, react, etc.) |
| `tags` | LIST\<TEXT\> | Free-form searchable tags |
| `version` | INT | Schema version |
| `is_public` | BOOLEAN | Cross-tenant sharing |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |
| `created_by` | TEXT | "pipeline", "human", or "agent" |

**`answer_sheets_by_category`** -- Lookup by problem category (clustered by confidence DESC)

**`answer_sheet_feedback`** -- Audit trail of feedback events

### Solution Step Structure

```json
{
  "step": 1,
  "tool": "Grep",
  "action": "Search for partial match of old_string",
  "file_pattern": "*.rs",
  "rationale": "The exact string may have changed since last read"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `step` | Yes | Integer ordering (1, 2, 3...) |
| `tool` | Yes | MCP tool: `Edit`, `Bash`, `Grep`, `Read`, `Write`, `Glob` |
| `action` | Yes | What this step does |
| `file_pattern` | No | Glob pattern for target files |
| `rationale` | Yes | Why this step is necessary |

## REST API

Base URL: `$KFDB_URL` with `X-KF-API-Key: $KFDB_API_KEY` header. All endpoints use tenant context middleware.

### Create Answer Sheet

```http
POST /api/v1/answer-sheets
Content-Type: application/json

{
  "error_signature": "Edit.*old_string.*not found",
  "problem_category": "edit_mismatch",
  "solution_steps": [
    {"step": 1, "tool": "Grep", "action": "Search for partial match", "file_pattern": "*", "rationale": "Find actual current content"},
    {"step": 2, "tool": "Read", "action": "Re-read target file", "rationale": "Get current contents"},
    {"step": 3, "tool": "Edit", "action": "Retry with correct old_string", "rationale": "Use verified content"}
  ],
  "solution_summary": "Re-read the file to get current content before retrying the edit",
  "source_session_ids": ["uuid1", "uuid2"],
  "source_extraction_ids": ["uuid3"],
  "languages": ["rust", "python"],
  "frameworks": ["axum"],
  "tags": ["file-editing", "stale-content"],
  "repo_context": {"repo_patterns": ["rust_workspace"], "file_types": [".rs", ".toml"]},
  "is_public": false
}
```

**Required fields:** `error_signature`, `problem_category`, `solution_steps`, `solution_summary`

**Response** (`201 Created`):
```json
{
  "answer_sheet_id": "uuid",
  "tenant_id": "uuid",
  "confidence": 0.0,
  "created_at": "2026-03-09T12:00:00Z"
}
```

### List Answer Sheets

```http
GET /api/v1/answer-sheets?problem_category=edit_mismatch&language=rust&min_confidence=0.3&limit=50&offset=0
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `problem_category` | string | - | Filter by category |
| `language` | string | - | Filter by language |
| `tag` | string | - | Filter by tag |
| `min_confidence` | float | 0.0 | Minimum confidence threshold |
| `is_public` | bool | - | Filter by public/private |
| `limit` | int | 50 | Max results |
| `offset` | int | 0 | Pagination offset |

**Response** (`200 OK`):
```json
{
  "items": [...],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

### Get Answer Sheet

```http
GET /api/v1/answer-sheets/:id
```

### Update Answer Sheet

```http
PUT /api/v1/answer-sheets/:id
Content-Type: application/json
```

All fields optional (partial update).

### Match Error to Answer Sheets

```http
POST /api/v1/answer-sheets/match
Content-Type: application/json

{
  "error_text": "Edit tool error: old_string \"fn process_data\" not found in /src/main.rs",
  "context": {
    "tool_name": "Edit",
    "file_path": "/src/main.rs",
    "language": "rust",
    "recent_tools": ["Read", "Grep", "Edit"]
  },
  "limit": 5,
  "min_confidence": 0.2,
  "include_public": true
}
```

**Response** (`200 OK`):
```json
{
  "matches": [
    {
      "answer_sheet_id": "uuid",
      "match_score": 0.83,
      "match_method": "signature",
      "error_signature": "Edit.*old_string.*not found",
      "problem_category": "edit_mismatch",
      "solution_summary": "Re-read the file to get current content before retrying",
      "solution_steps": [...],
      "confidence": 0.72,
      "success_count": 8,
      "languages": ["rust"],
      "source_session_count": 3
    }
  ],
  "total_candidates": 12,
  "search_time_ms": 45
}
```

### Submit Feedback

```http
POST /api/v1/answer-sheets/:id/feedback
Content-Type: application/json

{
  "positive": true,
  "context": "Applied the re-read strategy and the edit succeeded on retry",
  "session_id": "uuid-of-session-where-applied"
}
```

**Response** (`200 OK`):
```json
{
  "feedback_id": "uuid",
  "answer_sheet_id": "uuid",
  "old_confidence": 0.67,
  "new_confidence": 0.72,
  "total_success": 9,
  "total_failure": 2
}
```

### Delete Answer Sheet

```http
DELETE /api/v1/answer-sheets/:id
```

### Initialize Schema

```http
POST /api/v1/answer-sheets/schema/init
```

Creates all 3 tables and secondary indexes.

## MCP Gateway Tools

Four tools registered with the `gateway__` prefix (in mcp-gateway):

| Tool | Description |
|------|-------------|
| `gateway__get_answer_sheets` | Search by query, category, language, tag, confidence |
| `gateway__create_answer_sheet` | Create with error_signature, problem_category, solution_steps |
| `gateway__match_answer_sheet` | Match error_text to ranked answer sheets |
| `gateway__rate_answer_sheet` | Submit confirm/reject feedback |

Note: The MCP gateway tools use `type: "confirm"/"reject"` for feedback, which the gateway translates to `positive: true/false` for the KFDB REST API.

### Example: Match and Apply

```
// 1. Match the error
gateway__match_answer_sheet({
  error_text: "Edit tool error: old_string not found",
  context: { tool_name: "Edit", language: "rust" }
})

// 2. Apply the recommended steps from the match result

// 3. Submit feedback
gateway__rate_answer_sheet({
  answer_sheet_id: "returned-id",
  type: "confirm"
})
```

## SDK (TypeScript)

```typescript
import { AnswerSheetClient } from 'rickydata-sdk/answer-sheets';

const client = new AnswerSheetClient({
  baseUrl: 'http://34.60.37.158',
  apiKey: 'YOUR_API_KEY',
});

// Search
const results = await client.search({
  problem_category: 'edit_mismatch',
  language: 'rust',
  min_confidence: 0.3,
});

// Match error (hybrid retrieval)
const matches = await client.match(
  'Edit tool error: old_string not found',
  { language: 'rust' }
);

// Get by ID
const sheet = await client.get('answer-sheet-uuid');

// Create
const newSheet = await client.create({
  error_signature: 'Cannot find module .+',
  problem_category: 'import_error',
  solution_steps: [
    { tool: 'Grep', action: 'find_source', rationale: 'Locate module' },
    { tool: 'Edit', action: 'fix_path', rationale: 'Correct import' },
  ],
  languages: ['typescript'],
});

// Feedback (SDK translates confirm/reject to positive boolean)
await client.feedback('sheet-id', 'confirm', 'Worked perfectly');
```

## Claude Code Integration

### Skills

| Skill | Invocation | Purpose |
|-------|-----------|---------|
| `answer-sheet-query` | Auto-loaded when relevant | Search and match answer sheets |
| `answer-sheet-create` | `/answer-sheet-create` | Record a new answer sheet |

### Sub-agents

| Agent | Purpose | Model |
|-------|---------|-------|
| `answer-sheet-extractor` | Batch mine sessions for patterns | Sonnet |
| `answer-sheet-matcher` | Find solutions for current errors | Haiku |

## Problem Categories (12, from Paper 3)

| Category | Description | Classification Keywords |
|----------|-------------|------------------------|
| `edit_mismatch` | Edit tool old_string not found | old_string, not found in file, edit failed |
| `test_failure` | Test assertion failures | assertion failed, test failed, assert_eq |
| `import_error` | Module resolution | cannot find module, unresolved import |
| `type_error` | Type system errors | type mismatch, expected type, TypeError |
| `build_failure` | Build/compilation | compilation failed, cargo build, error[E |
| `runtime_error` | Runtime exceptions | panic, RuntimeError, segfault |
| `permission_error` | Permission denied | permission denied, EACCES, forbidden |
| `network_error` | Connection issues | connection refused, ECONNREFUSED |
| `config_error` | Configuration issues | missing env, config not found |
| `syntax_error` | Parse errors | SyntaxError, parse error, unexpected token |
| `dependency_error` | Package issues | package not found, version conflict |
| `timeout` | Operation timeout | timed out, deadline exceeded |

## Extraction Pipeline

Answer sheets are populated from two sources:

### Automated (Tier 2 Pipeline)

```
Tier 2 Extractions (debugging_episode, friction_point)
    -> Filter: has resolution, source-grounded
    -> Extract error pattern + solution steps
    -> Deduplicate against existing sheets (embedding similarity > 0.9)
    -> Create new sheet (confidence = 0.0, created_by = "pipeline")
    -> Schedule for human review
```

### Manual

Agents and humans create sheets directly via API or MCP tools when they discover a new pattern during a session.
