# Answer Sheets Quickstart

Get started with the `AnswerSheetClient` from the RickyData SDK. Answer sheets are proven solution patterns mined from successful agent sessions — use them to match errors to known fixes and improve solutions with feedback.

For the full data model, REST API, and MCP gateway reference, see [ANSWER_SHEETS.md](./ANSWER_SHEETS.md).

## Installation

```bash
npm install @rickydata/core
```

## Setup

```typescript
import { AnswerSheetClient } from '@rickydata/core';

const client = new AnswerSheetClient({
  baseUrl: process.env.KFDB_URL!,
  apiKey: process.env.KFDB_API_KEY!,
});
```

## Search Answer Sheets

Find answer sheets by category, language, tag, or confidence threshold.

```typescript
const results = await client.search({
  problem_category: 'edit_mismatch',
  language: 'rust',
  min_confidence: 0.3,
  limit: 10,
});

console.log(`Found ${results.total} answer sheets`);
for (const sheet of results.items) {
  console.log(`[${sheet.confidence.toFixed(2)}] ${sheet.solution_summary}`);
}
```

### Search Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `problem_category` | string | — | Filter by one of 12 categories (e.g. `edit_mismatch`, `test_failure`) |
| `language` | string | — | Filter by programming language |
| `tag` | string | — | Filter by tag |
| `min_confidence` | number | 0.0 | Minimum confidence threshold |
| `is_public` | boolean | — | Filter public/private sheets |
| `limit` | number | 50 | Max results |
| `offset` | number | 0 | Pagination offset |

## Get an Answer Sheet by ID

```typescript
const sheet = await client.get('answer-sheet-uuid');

console.log(sheet.error_signature);    // "Edit.*old_string.*not found"
console.log(sheet.problem_category);   // "edit_mismatch"
console.log(sheet.solution_steps);     // Array of ordered solution steps
console.log(sheet.confidence);         // 0.72
```

## Match an Error to Answer Sheets

The `match` method uses hybrid retrieval (regex signature match, then category classification) to rank the best answer sheets for a given error.

```typescript
const matches = await client.match(
  'Edit tool error: old_string "fn process_data" not found in /src/main.rs',
  {
    tool_name: 'Edit',
    file_path: '/src/main.rs',
    language: 'rust',
    recent_tools: ['Read', 'Grep', 'Edit'],
  }
);

for (const m of matches.matches) {
  console.log(`${m.match_method} (score: ${m.match_score.toFixed(2)})`);
  console.log(`  Fix: ${m.solution_summary}`);
  console.log(`  Confidence: ${m.confidence} (${m.success_count} successes)`);

  // Apply the solution steps
  for (const step of m.solution_steps) {
    console.log(`  Step ${step.step}: [${step.tool}] ${step.action}`);
  }
}
```

### Match Options

Pass an optional second argument with context to improve ranking:

| Field | Type | Description |
|-------|------|-------------|
| `tool_name` | string | Tool that produced the error |
| `file_path` | string | File where the error occurred |
| `language` | string | Programming language |
| `recent_tools` | string[] | Tools used recently in the session |

You can also pass `limit`, `min_confidence`, and `include_public` as top-level options.

## Create an Answer Sheet

Record a new solution pattern when you discover a repeatable fix.

```typescript
const created = await client.create({
  error_signature: 'Cannot find module .+',
  problem_category: 'import_error',
  solution_steps: [
    { step: 1, tool: 'Grep', action: 'Find the module source file', rationale: 'Locate where the module actually lives' },
    { step: 2, tool: 'Read', action: 'Read the import statement', rationale: 'Verify the current import path' },
    { step: 3, tool: 'Edit', action: 'Fix the import path', rationale: 'Correct the path to match actual location' },
  ],
  solution_summary: 'Locate the module and correct the import path',
  languages: ['typescript'],
  tags: ['imports', 'module-resolution'],
});

console.log(`Created: ${created.answer_sheet_id}`);
// New sheets start with confidence 0.0
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `error_signature` | string | Regex pattern matching the error |
| `problem_category` | string | One of 12 categories (see below) |
| `solution_steps` | array | Ordered steps with `step`, `tool`, `action`, `rationale` |
| `solution_summary` | string | Human-readable description of the fix |

### Optional Fields

`languages`, `frameworks`, `tags`, `repo_context`, `source_session_ids`, `source_extraction_ids`, `is_public`

## Submit Feedback

Feedback updates the Bayesian confidence score so the best solutions rise to the top.

```typescript
// Confirm: the answer sheet solved the problem
await client.feedback(
  'answer-sheet-uuid',
  'confirm',
  'Applied the re-read strategy and the edit succeeded on retry'
);

// Reject: the answer sheet did not help
await client.feedback(
  'answer-sheet-uuid',
  'reject',
  'File had been deleted, not just modified'
);
```

The SDK translates `'confirm'`/`'reject'` to the `positive: true/false` boolean used by the REST API.

## Confidence Scoring

Answer sheets use a Bayesian formula with a prior of 5 to prevent premature high confidence:

```
confidence = success_count / (success_count + failure_count + 5)
```

| Successes | Failures | Confidence | Meaning |
|-----------|----------|------------|---------|
| 0 | 0 | 0.00 | New, untested |
| 1 | 0 | 0.17 | Single confirmation |
| 5 | 1 | 0.45 | Moderate |
| 10 | 2 | 0.59 | Good |
| 20 | 3 | 0.71 | High confidence |
| 50 | 5 | 0.83 | Very reliable |

The `+5` prior means a sheet needs multiple confirmations before reaching high confidence, preventing one lucky success from over-promoting a fragile solution.

## Problem Categories

| Category | Description |
|----------|-------------|
| `edit_mismatch` | Edit tool `old_string` not found |
| `test_failure` | Test assertion failures |
| `import_error` | Module resolution errors |
| `type_error` | Type system errors |
| `build_failure` | Build/compilation errors |
| `runtime_error` | Runtime exceptions |
| `permission_error` | Permission denied |
| `network_error` | Connection issues |
| `config_error` | Configuration issues |
| `syntax_error` | Parse errors |
| `dependency_error` | Package issues |
| `timeout` | Operation timeouts |

## Next Steps

- [Full Answer Sheets reference](./ANSWER_SHEETS.md) — data model, REST API, MCP gateway tools, extraction pipeline
- [PipelineClient API](./PIPELINE_CLIENT_API.md) — autonomous issue resolution pipeline
