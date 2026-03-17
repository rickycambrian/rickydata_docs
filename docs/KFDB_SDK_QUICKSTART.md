# KFDB SDK Quick Start

The `@rickydata/core` TypeScript SDK provides typed clients for all KFDB APIs. This guide covers the fastest path to get started with each system.

## Installation

```bash
npm install @rickydata/core
```

## Configuration

All clients take a `baseUrl` and `apiKey`:

```typescript
const config = {
  baseUrl: process.env.KFDB_URL || 'http://34.60.37.158',
  apiKey: process.env.KFDB_API_KEY,
};
```

---

## 1. Automation Rules

Create event-driven rules that trigger LLM operations when graph events occur.

```typescript
import { AutomationClient } from '@rickydata/core';

const automation = new AutomationClient(config);

// Create a rule: auto-summarize new files
const rule = await automation.createRule({
  name: 'Summarize new files',
  trigger_type: 'node_created',
  trigger_filters: { label_filter: 'File' },
  operation_type: 'summarize',
  llm_provider: 'google',
  llm_model: 'gemini-3-flash-preview',
  input_property: 'content',
  output_strategy: 'update_property',
  output_property: 'summary',
  is_active: true,
});

console.log(`Created rule: ${rule.rule_id}`);

// List all rules
const rules = await automation.listRules();
console.log(`${rules.length} rules configured`);

// Pause a rule
await automation.updateRule(rule.rule_id, { is_active: false });

// Check execution history
const executions = await automation.listExecutions({ limit: 10 });
for (const exec of executions) {
  console.log(`${exec.status} - ${exec.execution_time_ms}ms - $${exec.cost_usd}`);
}

// Clean up
await automation.deleteRule(rule.rule_id);
```

### Trigger Types

| Trigger | Fires when |
|---|---|
| `node_created` | New node added |
| `node_updated` | Node properties changed |
| `node_deleted` | Node removed |
| `edge_created` | New edge created |
| `edge_deleted` | Edge removed |
| `property_added` | New property set |
| `property_updated` | Property value changed |

### Operation Types

| Operation | LLM task |
|---|---|
| `summarize` | Generate text summary |
| `classify` | Assign category/label |
| `extract_entities` | Extract structured entities |
| `generate_embedding` | Create vector embedding |

---

## 2. Answer Sheets

Query and manage proven solution patterns for error resolution.

```typescript
import { AnswerSheetClient } from '@rickydata/core';

const sheets = new AnswerSheetClient(config);

// Match an error against known solutions
const matches = await sheets.match(
  'TypeError: Cannot read property "map" of undefined',
  { language: 'javascript', tool_name: 'Bash' }
);

if (matches.matches.length > 0) {
  const best = matches.matches[0];
  console.log(`Found solution (${best.match_score} match):`);
  console.log(`  ${best.solution_summary}`);
  console.log(`  Confidence: ${best.confidence}`);

  // Report whether it worked
  await sheets.feedback(best.answer_sheet_id, true, {
    context: 'Applied fix successfully',
  });
}

// Create a new answer sheet from a successful fix
await sheets.create({
  error_signature: 'Cannot read property.*of undefined',
  problem_category: 'type_error',
  solution_steps: [
    { step: 1, tool: 'Grep', action: 'find_usage', rationale: 'Locate where the variable is used' },
    { step: 2, tool: 'Read', action: 'check_initialization', rationale: 'Verify initialization path' },
    { step: 3, tool: 'Edit', action: 'add_null_check', rationale: 'Add optional chaining guard' },
  ],
  solution_summary: 'Add null check before accessing nested property',
  languages: ['javascript', 'typescript'],
});

// Search by category
const results = await sheets.search({
  problem_category: 'type_error',
  language: 'rust',
  min_confidence: 0.3,
  limit: 20,
});
```

---

## 3. Workspace Notes

Manage agent workspace notes with version tracking.

```typescript
import { WorkspaceClient } from '@rickydata/core';

const workspace = new WorkspaceClient(config);

// Create a note
const note = await workspace.create({
  title: 'agent-workspace/investigation-results',
  body: '## Findings\n\nThe query timeout is caused by...',
  tags: ['investigation', 'performance'],
});

// Update with new content
await workspace.update(note.note_id, {
  body: '## Findings (Updated)\n\nRoot cause confirmed...',
});

// List all notes
const notes = await workspace.list({ limit: 50 });

// Check if a note was edited externally
const edits = await workspace.checkEdits({
  note_id: note.note_id,
  known_hash: note.content_hash,
});
```

---

## 4. Canvas Workflows

Execute visual AI workflows with multi-agent orchestration.

```typescript
import { CanvasClient } from '@rickydata/core';

const canvas = new CanvasClient(config);

// Execute a saved workflow
const result = await canvas.executeWorkflow('workflow-id', {
  inputs: { repo_url: 'https://github.com/org/repo' },
  stream: true,
});

// Stream events
for await (const event of result.events) {
  switch (event.type) {
    case 'node_started':
      console.log(`Running: ${event.node_id}`);
      break;
    case 'text_delta':
      process.stdout.write(event.text);
      break;
    case 'run_completed':
      console.log('\nWorkflow complete');
      break;
  }
}
```

---

## 5. Autonomous Pipeline

Resolve issues autonomously with confidence-based routing.

```typescript
import { PipelineClient } from '@rickydata/core';

const pipeline = new PipelineClient(config);

// Submit an issue for autonomous resolution
const result = await pipeline.resolve({
  issue_url: 'https://github.com/org/repo/issues/42',
  routing: 'auto', // or 'agent', 'human'
});

console.log(`Status: ${result.status}`);
console.log(`Outcome: ${result.outcome_type}`);

// Check ROI
const roi = await pipeline.queryROI({
  model: 'gemini-3-flash-preview',
  task_type: 'bug_fix',
});
console.log(`Cost per resolution: $${roi.avg_cost_usd}`);
```

---

## Error Handling

All clients throw descriptive errors with HTTP status codes:

```typescript
try {
  await automation.getRule('nonexistent-id');
} catch (err) {
  // "Failed to get automation rule: 404 Rule not found: nonexistent-id"
  console.error(err.message);
}
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `KFDB_URL` | API base URL (default: `http://34.60.37.158`) |
| `KFDB_API_KEY` | Authentication API key |

---

## Related Documentation

- [Automation Rules API](./AUTOMATION_API.md) -- Full REST API reference
- [Answer Sheets](./ANSWER_SHEETS.md) -- Concepts, matching, and feedback
- [Plugin Hooks API](./PLUGIN_HOOKS_API.md) -- Claude Code integration
- [Session Intelligence API](./SESSION_INTELLIGENCE_API.md) -- Insights pipeline
- [Pipeline Client API](./PIPELINE_CLIENT_API.md) -- Autonomous resolution
