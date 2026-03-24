# Semantic Search API

Search for MCP servers and agents using natural language with AI-powered embeddings. The system uses a hybrid approach combining vector-based semantic similarity with text keyword matching, fused via Reciprocal Rank Fusion (RRF).

## Authentication

**Wallet authentication required.** Provide a `mcpwt_` wallet token or JWT in the `Authorization` header. Unauthenticated requests return `401`.

When authenticated, results are personalized: servers the wallet has enabled get a score boost.

## Rate Limiting

- **30 requests per minute** per wallet address
- Exceeding the limit returns `429` with a clear error message
- The window resets after 60 seconds of the first request in the window

## Endpoint

```
POST https://mcp.rickydata.org/api/catalog/semantic-search
Authorization: Bearer mcpwt_...
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | — | Natural language search query |
| `limit` | number | No | 20 | Max results (min: 1, max: 100) |
| `includeAgents` | boolean | No | `false` | Include agents in results |
| `category` | string | No | — | Filter by category name |
| `type` | string | No | `'all'` | `'server'`, `'agent'`, or `'all'` |

### Response

```json
{
  "results": [
    {
      "id": "exa-mcp-server",
      "name": "exa-mcp-server",
      "title": "Exa Search",
      "description": "AI-powered web search with neural retrieval...",
      "type": "server",
      "score": 0.0327,
      "semanticScore": 0.72,
      "textScore": 0.8,
      "matchReason": "hybrid",
      "categories": ["Search", "AI"],
      "toolCount": 5,
      "securityScore": 90,
      "isEnabled": true
    }
  ],
  "query": "search the web",
  "totalResults": 5,
  "searchMode": "hybrid",
  "embeddingStats": {
    "dimensions": 768,
    "serverCount": 3200,
    "agentCount": 50,
    "lastIndexedAt": "2026-03-24T12:00:00.000Z"
  },
  "latencyMs": 85
}
```

### Result Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Server or agent identifier |
| `name` | string | Package or display name |
| `title` | string | Human-readable title |
| `description` | string | Truncated to 300 characters |
| `type` | `'server'` or `'agent'` | Item type |
| `score` | number | RRF fused score (higher = more relevant) |
| `semanticScore` | number | Raw cosine similarity `[-1, 1]` |
| `textScore` | number | Tiered text match score `[0, 1]` |
| `matchReason` | string | `'hybrid'` (both), `'semantic'` (vector only), or `'text'` (keyword only) |
| `categories` | string[] | Server/agent categories |
| `toolCount` | number | Number of tools |
| `securityScore` | number? | Security score (servers only) |
| `skillCount` | number? | Number of skills (agents only) |
| `isEnabled` | boolean? | Whether the wallet has this server enabled (servers only) |

### Search Modes

- **`hybrid`** — Both semantic embeddings and keyword text search are active. Results from both streams are fused using RRF with `k=60`.
- **`text_only`** — Embedding index not available (KFDB API key missing or embeddings not yet indexed). Falls back to keyword matching only.

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | Missing or empty `query` field |
| `401` | No wallet token provided |
| `429` | Rate limit exceeded (30/min per wallet) |
| `500` | Internal search error |
| `503` | Semantic search not available (embedding service not initialized) |

## MCP Meta-Tool

Semantic search is also available as the `gateway__semantic_search` MCP tool when connected to the gateway via MCP protocol. The tool requires wallet authentication; without it, the tool returns an error suggesting `gateway__search_servers` as a keyword-only alternative.

```
Tool: gateway__semantic_search
Input: { "query": "search the web", "limit": 5 }
```

## SDK Usage

The `rickydata` SDK (`>= 1.2.x`) provides both a programmatic method and a CLI command.

### TypeScript / Node.js

```typescript
import { MCPGateway } from 'rickydata';

const gw = new MCPGateway({
  url: 'https://mcp.rickydata.org',
  auth: { token: 'mcpwt_...' },
});

const result = await gw.semanticSearch('database management tools', {
  limit: 10,
  includeAgents: true,
  category: 'Database',
  type: 'all',   // 'server' | 'agent' | 'all'
});

console.log(result.results);    // SemanticSearchResultItem[]
console.log(result.searchMode); // 'hybrid' or 'text_only'
console.log(result.latencyMs);  // e.g. 85
```

**Types:**

```typescript
interface SemanticSearchOptions {
  limit?: number;
  includeAgents?: boolean;
  category?: string;
  type?: 'server' | 'agent' | 'all';
}

interface SemanticSearchResult {
  results: SemanticSearchResultItem[];
  searchMode: string;
  totalResults: number;
  latencyMs: number;
}
```

### CLI

```bash
# Basic semantic search
rickydata mcp semantic-search "search the web"

# With options
rickydata mcp semantic-search "database tools" --limit 20 --agents --category Database

# JSON output
rickydata mcp semantic-search "code analysis" -o json

# Filter by type
rickydata mcp semantic-search "AI agents" --type agent
```

**Options:**

| Flag | Description |
|------|-------------|
| `-l, --limit <n>` | Max results (default: 10) |
| `--agents` | Include agents in results |
| `-c, --category <cat>` | Filter by category |
| `-t, --type <type>` | `server`, `agent`, or `all` (default: `all`) |
| `-o, --output <format>` | `table` or `json` (default: `table`) |
| `--profile <profile>` | Config profile |

Requires wallet authentication (`rickydata auth login` first).

## Examples

### curl

```bash
# Basic search
curl -s -X POST https://mcp.rickydata.org/api/catalog/semantic-search \
  -H "Authorization: Bearer mcpwt_..." \
  -H "Content-Type: application/json" \
  -d '{"query": "search the web", "limit": 5}' | jq '.results[:3]'

# Search with agent results
curl -s -X POST https://mcp.rickydata.org/api/catalog/semantic-search \
  -H "Authorization: Bearer mcpwt_..." \
  -H "Content-Type: application/json" \
  -d '{"query": "database management", "limit": 10, "includeAgents": true}' | jq .

# Filter by category
curl -s -X POST https://mcp.rickydata.org/api/catalog/semantic-search \
  -H "Authorization: Bearer mcpwt_..." \
  -H "Content-Type: application/json" \
  -d '{"query": "code analysis", "category": "Developer Tools"}' | jq .
```

### Check embedding index health

```bash
curl -s https://mcp.rickydata.org/health | jq '.embeddingIndex'
```

## How It Works

1. **Embedding Index** — All servers (and optionally agents) are embedded into 768-dimensional vectors using KFDB's `text-embedding-004` model. Text representation: `name | title | description | Tools: tool1, tool2 | Categories: Database`.
2. **Query Embedding** — The search query is embedded with `RETRIEVAL_QUERY` task type for asymmetric similarity.
3. **Dual Search** — Text search (tiered keyword matching) and semantic search (cosine similarity) run in parallel.
4. **RRF Fusion** — Results are merged using Reciprocal Rank Fusion: `score = sum(1 / (60 + rank))`. Items appearing in both streams score higher.
5. **Wallet Personalization** — Enabled servers get a `+0.1` RRF score boost.
6. **Graceful Degradation** — If embeddings are unavailable, falls back to text-only search. If KFDB is down during reindex, old embeddings are preserved.
