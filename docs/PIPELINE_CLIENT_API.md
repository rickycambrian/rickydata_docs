# PipelineClient API Reference

SDK client for the RickyData Autonomous Issue Resolution Pipeline. For architecture and routing details, see [AUTONOMOUS_PIPELINE.md](./AUTONOMOUS_PIPELINE.md).

## Installation

```bash
npm install @rickydata/core
```

## PipelineClient

### Constructor

```typescript
import { PipelineClient } from '@rickydata/core';

const client = new PipelineClient(config: PipelineClientConfig);
```

#### PipelineClientConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `baseUrl` | `string` | Yes | Pipeline service URL (e.g. `"https://agents.rickydata.org"`) |
| `apiKey` | `string` | Yes | RickyData API key for authentication |

```typescript
const client = new PipelineClient({
  baseUrl: 'https://agents.rickydata.org',
  apiKey: process.env.RICKYDATA_API_KEY!,
});
```

---

## Methods

### `resolve(repo, issueNumber, options?)`

Submit a GitHub issue for autonomous resolution. The pipeline classifies difficulty, selects the optimal model via ROI routing, executes the fix, and routes by confidence score.

**Signature**:
```typescript
resolve(
  repo: string,
  issueNumber: number,
  options?: PipelineResolveOptions
): Promise<PipelineResolveResponse>
```

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `repo` | `string` | GitHub repository in `"owner/name"` format |
| `issueNumber` | `number` | GitHub issue number |
| `options` | `PipelineResolveOptions` | Optional configuration (see below) |

**Example**:
```typescript
const result = await client.resolve('pallets/flask', 5521);
console.log(result.run_id);        // "uuid"
console.log(result.routing.model); // "claude-haiku"
console.log(result.routing.roi);   // 40.6
console.log(result.status);        // "queued"
```

---

### `getStatus()`

Get pipeline service health and aggregate statistics.

**Signature**:
```typescript
getStatus(): Promise<PipelineStatusResponse>
```

**Example**:
```typescript
const status = await client.getStatus();
console.log(status.healthy);      // true
console.log(status.success_rate); // 0.74
console.log(status.total_runs);   // 847
```

---

### `reportOutcome(outcome)`

Report the outcome of a completed resolution run. Feeds back into the ROI engine to improve future routing decisions.

**Signature**:
```typescript
reportOutcome(outcome: PipelineOutcomeRequest): Promise<PipelineOutcomeResponse>
```

**Example**:
```typescript
await client.reportOutcome({
  run_id: 'uuid',
  outcome: 'merged',
  actual_cost_usd: 0.008,
  actual_quality_score: 0.85,
  duration_seconds: 145,
});
```

---

## Types

### PipelineResolveOptions

```typescript
interface PipelineResolveOptions {
  /** "local" uses resolve_issue.py on current machine; "remote" delegates to gateway */
  mode?: 'local' | 'remote';
  /** Override model selection, bypasses ROI routing */
  model?: string;
  /** Maximum spend for this run in USD */
  budget_usd?: number;
  /** Subprocess timeout in seconds */
  timeout_seconds?: number;
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | `"local" \| "remote"` | `"local"` | Local uses resolve_issue.py; remote delegates to gateway |
| `model` | `string` | *(ROI routing)* | Override model selection, skips ROI routing |
| `budget_usd` | `number` | `0.10` | Maximum spend for this run |
| `timeout_seconds` | `number` | `600` | Subprocess timeout |

### PipelineResolveResponse

```typescript
interface PipelineResolveResponse {
  run_id: string;
  repo: string;
  issue_number: number;
  accepted: boolean;
  routing: {
    model: string;
    expected_success_rate: number;
    expected_cost_usd: number;
    roi: number;
    reasoning: string;
  };
  status: 'queued' | 'running' | 'completed' | 'failed';
  created_at: string;
}
```

### PipelineStatusResponse

```typescript
interface PipelineStatusResponse {
  healthy: boolean;
  checked_at: string;
  active_runs: number;
  total_runs: number;
  success_rate: number;
  roi_data: {
    loaded: boolean;
    last_updated: string;
    repos_count: number;
    configs_count: number;
  };
}
```

### PipelineOutcomeRequest

```typescript
interface PipelineOutcomeRequest {
  run_id: string;
  outcome: 'merged' | 'closed' | 'timeout' | 'error';
  actual_cost_usd: number;
  actual_quality_score: number;
  duration_seconds?: number;
}
```

| Outcome | Meaning |
|---------|---------|
| `"merged"` | PR was merged — fix accepted |
| `"closed"` | PR closed without merge — fix rejected |
| `"timeout"` | Resolution timed out |
| `"error"` | Unexpected error during resolution |

### PipelineOutcomeResponse

```typescript
interface PipelineOutcomeResponse {
  recorded: boolean;
  updated_roi: {
    config_name: string;
    new_success_rate: number;
    new_avg_cost: number;
    new_avg_quality: number;
    sample_size: number;
  };
}
```

---

## Common Workflows

### Resolve a single issue

```typescript
import { PipelineClient } from '@rickydata/core';

const client = new PipelineClient({
  baseUrl: 'https://agents.rickydata.org',
  apiKey: process.env.RICKYDATA_API_KEY!,
});

const result = await client.resolve('pallets/flask', 5521);
console.log(`Run ${result.run_id} → ${result.routing.model} (ROI: ${result.routing.roi})`);
```

### Check pipeline health before submitting work

```typescript
const status = await client.getStatus();
if (!status.healthy) {
  console.error('Pipeline unavailable');
  process.exit(1);
}
console.log(`Pipeline ready. ${status.roi_data.repos_count} repos loaded.`);
```

### Batch-resolve issues

```typescript
const issues = [
  { repo: 'pallets/flask', number: 5521 },
  { repo: 'django/django', number: 18234 },
  { repo: 'psf/requests', number: 6721 },
];

for (const issue of issues) {
  const result = await client.resolve(issue.repo, issue.number);
  console.log(`${issue.repo}#${issue.number} → ${result.routing.model} (status: ${result.status})`);
}
```

### Local vs remote mode

```typescript
// Local: uses resolve_issue.py + Claude CLI on current machine
const local = await client.resolve('owner/repo', 123, {
  mode: 'local',
  timeout_seconds: 300,
});

// Remote: delegates to the gateway's ClaudeAgentRunner
const remote = await client.resolve('owner/repo', 123, {
  mode: 'remote',
  budget_usd: 0.05,
});
```

### Override model selection

```typescript
// Bypass ROI routing and force a specific model
const result = await client.resolve('owner/repo', 123, {
  model: 'claude-sonnet',
});
```

### Report outcome and close the feedback loop

```typescript
const result = await client.resolve('owner/repo', 42);

// After the PR is merged or closed:
const feedback = await client.reportOutcome({
  run_id: result.run_id,
  outcome: 'merged',
  actual_cost_usd: 0.008,
  actual_quality_score: 0.85,
  duration_seconds: 145,
});

console.log(`Updated ROI: success_rate=${feedback.updated_roi.new_success_rate}`);
```

---

## Related

- [Autonomous Pipeline Architecture](./AUTONOMOUS_PIPELINE.md) — routing logic, confidence scoring, self-improvement loop
- [Answer Sheets](./ANSWER_SHEETS.md) — error resolution patterns that feed into the pipeline
