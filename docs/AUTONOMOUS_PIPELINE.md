# Autonomous Issue Resolution Pipeline

The autonomous pipeline is a closed-loop system that scans GitHub repositories for issues, recommends the optimal model based on historical benchmark ROI data, executes fixes, and feeds outcomes back to improve future recommendations.

## Architecture Overview

```
GitHub Issues
     │
     ▼
┌──────────────┐
│ Issue Scanner │  (Haiku) Classify difficulty, score tractability
│  (scan)       │  Outputs: difficulty, issue_type, estimated_lines
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Plan Recommender  │  (Sonnet) ROI lookup from benchmark data
│  (recommend)      │  Outputs: model, expected_cost, expected_roi
└──────┬───────────┘
       │
       ▼
┌─────────────────────────┐
│  Execution Bridge        │  Resolve locally or delegate to gateway
│  (execute)               │  Local: resolve_issue.py + Claude CLI
└──────┬──────────────────┘
       │
       ▼
┌───────────────────┐
│  Confidence Router │  Route by confidence score
│                   │  >=0.70 → auto_pr, 0.40-0.70 → review, <0.20 → reject
└──────┬────────────┘
       │
       ▼
┌───────────────────────┐
│  Outcome Tracker       │  Webhook: PR merged/closed → outcome report
│  (feedback loop)       │  Updates ROI engine for next recommendation
└───────────────────────┘
```

## Difficulty-Based Routing

Routing decisions are based on benchmark data (N=100 runs, 7 repos, 3 configs):

| Difficulty | Heuristic | Model | Avg Cost | Avg Quality | ROI |
|-----------|-----------|-------|----------|-------------|-----|
| Simple | <=30 lines, 1 file | Haiku | $0.009/run | 0.424 | **40.6** |
| Medium | 31-80 lines, 1-2 files | Haiku | $0.009/run | 0.350 | **51.9** |
| Complex | 3+ files, architectural | Sonnet | $0.082/run | 0.500 | 6.8 |

**Key insight**: Haiku delivers 7.7x better ROI than Sonnet overall, but Sonnet wins both quality AND ROI on truly complex tasks where Haiku produces near-zero quality (0.049). The router sends simple/medium tasks to Haiku and complex tasks to Sonnet.

**Never use thinking mode** -- it is strictly dominated: 30% more cost, lower quality (0.287 vs 0.432), lower success rate (87% vs 100%).

## Confidence Routing

After code generation, a confidence score [0.15, 1.0] is computed from 8 continuous signals:

| Score | Decision | Action |
|-------|----------|--------|
| >= 0.70 | `auto_pr` | Create PR automatically |
| 0.40 - 0.70 | `review` | Queue for human review |
| < 0.20 | `reject` | Do not submit |

Confidence signals include: graph coverage, keyword match quality, answer sheet confidence, code generation success, test pass rate, file overlap with expected changes.

## Self-Improvement Loop

```
resolve_issue.py → creates PR → webhook → outcomeTracker → ROIUpdater → ROI engine
                                                                  ↑
                                                    New benchmark data improves
                                                    next routing recommendation
```

The ROI engine uses Wilson confidence intervals so recommendations are calibrated correctly at low sample sizes.

## API Reference

### POST /api/v1/pipeline/resolve

Submit a GitHub issue for autonomous resolution.

**Request**:
```json
{
  "repo": "owner/name",
  "issue_number": 42,
  "options": {
    "mode": "local",
    "budget_usd": 0.10,
    "timeout_seconds": 600
  }
}
```

**Response**:
```json
{
  "run_id": "uuid",
  "repo": "owner/name",
  "issue_number": 42,
  "accepted": true,
  "routing": {
    "model": "claude-haiku",
    "expected_success_rate": 0.80,
    "expected_cost_usd": 0.009,
    "roi": 40.6,
    "reasoning": "Simple issue (22 lines, 1 file) → haiku for best ROI"
  },
  "status": "queued",
  "created_at": "2026-03-12T00:00:00Z"
}
```

**Options**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | `"local" \| "remote"` | `"local"` | Local uses resolve_issue.py; remote delegates to gateway |
| `model` | string | (ROI routing) | Override model selection, skips ROI routing |
| `budget_usd` | number | 0.10 | Maximum spend for this run |
| `timeout_seconds` | number | 600 | Subprocess timeout |

### GET /api/v1/pipeline/status

Get pipeline service health and aggregate statistics.

**Response**:
```json
{
  "healthy": true,
  "checked_at": "2026-03-12T00:00:00Z",
  "active_runs": 2,
  "total_runs": 847,
  "success_rate": 0.74,
  "roi_data": {
    "loaded": true,
    "last_updated": "2026-03-12T00:00:00Z",
    "repos_count": 7,
    "configs_count": 3
  }
}
```

### POST /api/feedback/outcome

Report the outcome of a completed resolution run. Feeds back into the ROI engine.

**Request**:
```json
{
  "run_id": "uuid",
  "outcome": "merged",
  "actual_cost_usd": 0.008,
  "actual_quality_score": 0.72,
  "duration_seconds": 145
}
```

**Outcome types**:
| Value | Meaning |
|-------|---------|
| `"merged"` | PR was merged -- fix accepted |
| `"closed"` | PR closed without merge -- fix rejected |
| `"timeout"` | Resolution timed out |
| `"error"` | Unexpected error during resolution |

**Response**:
```json
{
  "recorded": true,
  "updated_roi": {
    "config_name": "claude-haiku",
    "new_success_rate": 0.81,
    "new_avg_cost": 0.0088,
    "new_avg_quality": 0.425,
    "sample_size": 16
  }
}
```

## SDK Usage

### TypeScript / JavaScript

```typescript
import { PipelineClient } from '@rickydata/core';

const pipeline = new PipelineClient({
  baseUrl: 'https://agents.rickydata.org',
  apiKey: process.env.RICKYDATA_API_KEY!,
});

// Check service health
const status = await pipeline.getStatus();
console.log('Pipeline healthy:', status.healthy);
console.log('Success rate:', status.success_rate);

// Submit an issue for resolution
const result = await pipeline.resolve('pallets/flask', 5521);
console.log('Run ID:', result.run_id);
console.log('Routed to:', result.routing.model, '(ROI:', result.routing.roi, ')');

// Later: report what happened to the PR
await pipeline.reportOutcome({
  run_id: result.run_id,
  outcome: 'merged',
  actual_cost_usd: 0.008,
  actual_quality_score: 0.85,
});
```

### Options: Local vs Remote Mode

```typescript
// Local mode: uses resolve_issue.py + claude CLI on the current machine
const localResult = await pipeline.resolve('owner/repo', 123, {
  mode: 'local',
  timeout_seconds: 300,
});

// Remote mode: delegates to the gateway's ClaudeAgentRunner
const remoteResult = await pipeline.resolve('owner/repo', 123, {
  mode: 'remote',
  budget_usd: 0.05,
});

// Override model (bypasses ROI routing)
const forcedResult = await pipeline.resolve('owner/repo', 123, {
  model: 'claude-sonnet',
});
```

## Getting Started

### 1. Install the SDK

```bash
npm install @rickydata/core
```

### 2. Set up credentials

```bash
export RICKYDATA_API_KEY=your_api_key
```

### 3. Verify pipeline health

```typescript
import { PipelineClient } from '@rickydata/core';

const client = new PipelineClient({
  baseUrl: 'https://agents.rickydata.org',
  apiKey: process.env.RICKYDATA_API_KEY!,
});

const status = await client.getStatus();
if (!status.healthy) {
  console.error('Pipeline unavailable');
  process.exit(1);
}
console.log(`Pipeline ready. ROI data: ${status.roi_data.repos_count} repos loaded.`);
```

### 4. Run a batch of issues

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

### 5. Set up webhook for outcome reporting

Configure your GitHub webhook to call `/api/feedback/outcome` when PRs are merged or closed. The gateway handles this automatically if the ClaudeAgentRunner is used in remote mode.

## Python Reference

The pipeline was originally built in Python at `/Users/riccardoesclapon/Documents/github/ai_research/`:

```python
from src.execution import ExecutionBridge

# Local mode with gateway scan+recommend
bridge = ExecutionBridge(mode="local", gateway_url="https://agents.rickydata.org")
result = bridge.resolve_issue("owner/repo", 123)

# Full remote delegation
bridge = ExecutionBridge(mode="remote", gateway_url="https://agents.rickydata.org")
result = bridge.resolve_issue("owner/repo", 123)
```

Key files:
- `src/execution/execution_bridge.py` -- Unified local/remote resolution
- `src/execution/gateway_client.py` -- HTTP client (19 tests passing)
- `scripts/resolve_issue.py` -- End-to-end resolution script
- `data/benchmark/roi_snapshot.json` -- ROI data for routing

## Key Patterns

| Pattern | Detail |
|---------|--------|
| Gateway failures gracefully degrade | Log warning, continue with defaults |
| Both modes produce `ExecutionResult` | ROI-compatible output |
| Retry logic | Exponential backoff on 429/500/502/503 |
| Subprocess timeout | 600s default for local mode |
| Branch cleanup | Delete old `benchmark-*` branches before each run |
| Shallow clone + unshallow | `--depth=500` then `git fetch --unshallow` if base commit unreachable |
