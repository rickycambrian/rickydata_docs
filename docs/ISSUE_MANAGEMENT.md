# Intelligent Issue Management

AI-powered issue triage, labeling, relationship detection, and state context assembly for GitHub repositories.

## Overview

The Issue Intelligence system automatically enriches GitHub issues when they are created. On receiving an `issues.opened` webhook, the gateway:

1. Runs **auto-triage** before the agent resolution pipeline
2. Applies high-confidence labels (>= 0.8) to the issue
3. Detects parent-child, blocking, and duplicate relationships
4. Posts a triage summary comment with labels, relationships, and active repo areas

All AI inference uses **MiniMax-M2.7**. When no MiniMax API key is configured, the system falls back to keyword-based heuristics for label suggestions and explicit `#N` reference extraction for relationships.

## Architecture

```
GitHub webhook (issues.opened)
  |
  v
workflow-dispatcher.ts
  |
  v
autoTriage(repo, issueNumber)      <- runs BEFORE agent resolution
  |
  +-> buildStateContext()
  |     |
  |     +-> analyzeRecentCommits()    (parallel)
  |     +-> fetchRepoLanguages()      (parallel)
  |     +-> fetchOpenIssues()         (parallel)
  |     +-> fetchRecentPRs()          (parallel)
  |     +-> suggestLabels()           (after issues fetched)
  |     +-> detectRelationships()     (after issues fetched)
  |
  +-> apply labels (confidence >= 0.8)
  +-> post triage summary comment
  |
  v
Agent resolution continues with enriched issue context
```

## API Reference

All endpoints require Bearer token authentication. Base path: `/api/v1/issues/`

### POST /api/v1/issues/analyze-commits

Analyze recent commits to understand active areas, recent features, and work-in-progress.

**Request:**
```json
{
  "repo": "owner/name",
  "limit": 30
}
```
`limit` is optional (default 30, max 100). File details are fetched for the 10 most recent commits.

**Response:** `CommitAnalysis`
```json
{
  "recentCommits": [
    {
      "sha": "abc123",
      "message": "feat: add label suggestions",
      "files": ["src/github/issue-intelligence.ts"],
      "author": "Alice",
      "date": "2026-03-21T10:00:00Z"
    }
  ],
  "activeAreas": ["src/github", "src/routes"],
  "recentFeatures": ["add label suggestions"],
  "openWork": ["WIP: relationship detection tuning"]
}
```

### POST /api/v1/issues/suggest-labels

Suggest labels for an issue by matching content against the repo's existing label set.

**Request:**
```json
{
  "repo": "owner/name",
  "issueNumber": 42
}
```

**Response:**
```json
{
  "suggestions": [
    { "label": "bug", "confidence": 0.92, "reason": "Error-related keywords in title and body" },
    { "label": "security", "confidence": 0.85, "reason": "CVE reference in body" }
  ]
}
```
Returns up to 5 suggestions. Each label must exist in the repo's label set.

### POST /api/v1/issues/detect-relationships

Detect relationships between open issues in a repository.

**Request:**
```json
{
  "repo": "owner/name"
}
```

**Response:**
```json
{
  "relationships": [
    {
      "fromIssue": 10,
      "toIssue": 5,
      "type": "child",
      "confidence": 0.85,
      "reason": "Issue #10 implements a subtask of #5"
    }
  ]
}
```

**Relationship types:**
| Type | Meaning |
|------|---------|
| `parent` | Source is the parent of target |
| `child` | Source is a subtask of target |
| `related` | Issues are related but not hierarchical |
| `blocks` | Source blocks target |
| `blocked_by` | Source is blocked by target |
| `duplicate` | Source duplicates target |

Only relationships with confidence >= 0.5 are returned (max 20).

### POST /api/v1/issues/build-context

Build comprehensive state context for issue resolution.

**Request:**
```json
{
  "repo": "owner/name",
  "issueNumber": 42
}
```

**Response:** `StateContext`
```json
{
  "commitAnalysis": { "recentCommits": [...], "activeAreas": [...], "recentFeatures": [...], "openWork": [...] },
  "relatedIssues": [{ "number": 10, "title": "...", "state": "open", "labels": ["bug"] }],
  "suggestedLabels": [{ "label": "bug", "confidence": 0.92, "reason": "..." }],
  "relationships": [{ "fromIssue": 42, "toIssue": 10, "type": "related", "confidence": 0.7, "reason": "..." }],
  "repoLanguages": { "TypeScript": 50000, "JavaScript": 3000 },
  "recentPRs": [{ "number": 15, "title": "Fix auth flow", "state": "closed" }]
}
```

### POST /api/v1/issues/triage

Full auto-triage pipeline: classify, label, detect relationships, post comment.

**Request:**
```json
{
  "repo": "owner/name",
  "issueNumber": 42
}
```

**Response:** `TriageResult`
```json
{
  "labelsApplied": ["bug"],
  "relationshipsDetected": [{ "fromIssue": 42, "toIssue": 10, "type": "related", "confidence": 0.7, "reason": "..." }],
  "stateContext": { ... },
  "triageComment": "### Auto-Triage Summary\n\n**Labels applied:** `bug`\n..."
}
```

## SDK Usage

```typescript
import { IntelligenceApi } from '@nickydata/github';

const api = new IntelligenceApi({
  baseUrl: 'https://your-gateway.example.com',
  getToken: async () => 'your-bearer-token',
});

// Analyze repo activity
const commits = await api.analyzeCommits('owner/repo', 20);
console.log('Active areas:', commits.activeAreas);

// Get label suggestions
const labels = await api.suggestLabels('owner/repo', 42);

// Detect issue relationships
const rels = await api.detectRelationships('owner/repo');

// Build full resolution context
const ctx = await api.buildContext('owner/repo', 42);

// Run full triage
const result = await api.triage('owner/repo', 42);
console.log('Labels applied:', result.labelsApplied);
```

## Configuration

| Setting | Location | Default | Notes |
|---------|----------|---------|-------|
| MiniMax API key | `services.config.minimaxPlatformKey` | none | Without it, falls back to keyword heuristics |
| Label confidence threshold | `LABEL_CONFIDENCE_THRESHOLD` in `issue-intelligence.ts` | 0.8 | Only labels above this are auto-applied |
| Commit analysis limit | `DEFAULT_COMMIT_LIMIT` | 30 | Max 100, file details fetched for top 10 |
| GitHub App | `GitHubAppAuth` + `InstallationManager` | required | Must be installed on target repo's owner |

## How Relationships Work

Relationship detection combines two strategies:

1. **Explicit references** -- Scans issue bodies for `#N` patterns and creates `related` edges between issues that reference each other (confidence 0.7).

2. **AI semantic analysis** -- When MiniMax is available, sends up to 30 open issues to MiniMax-M2.7 which analyzes titles and bodies to identify parent-child hierarchies, blocking dependencies, and duplicates. Only relationships with confidence >= 0.5 are kept.

Results are merged and deduplicated. Explicit references take precedence when both methods find the same pair.
