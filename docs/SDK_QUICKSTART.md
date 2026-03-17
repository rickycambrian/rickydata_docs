# RickyData SDK Quick Start

The `@rickydata/core` SDK is the unified TypeScript client for the RickyData platform. It connects two systems:

- **KFDB (KnowledgeFlowDB)** — Knowledge graph database with automation, session intelligence, answer sheets, and semantic search
- **MCP Gateway** — Marketplace of MCP tool servers with wallet-based authentication and x402 micropayments

## Installation

```bash
npm install @rickydata/core
```

---

## Architecture

```
@rickydata/core
    │
    ├── MCPGateway          ─── MCP Marketplace (paid tool execution)
    │   ├── Auth (wallet signing, JWT, x402)
    │   ├── Server discovery + tool listing
    │   ├── Tool execution with automatic payments
    │   └── Spending wallet + policy limits
    │
    ├── AgentClient         ─── AI agent chat sessions
    │   ├── Streaming SSE responses
    │   ├── Team workflows
    │   └── Session + secret management
    │
    ├── AutomationClient    ─── KFDB event-driven LLM rules
    ├── AnswerSheetClient   ─── Error-to-solution pattern matching
    ├── CanvasClient        ─── Visual workflow orchestration
    ├── WorkspaceClient     ─── Agent workspace notes
    ├── PipelineClient      ─── Autonomous issue resolution
    ├── BenchmarkClient     ─── Model benchmarking + ROI
    └── CycleClient         ─── Autonomous loop tracking
```

---

## MCP Gateway (Paid Tools)

Access marketplace MCP servers with x402 micropayments:

```typescript
import { MCPGateway, SpendingWallet, SpendingPolicy } from '@rickydata/core';

const wallet = await SpendingWallet.create({
  privateKey: process.env.WALLET_PRIVATE_KEY,
});

const gateway = new MCPGateway({
  url: 'https://gateway.rickydata.com',
  spendingWallet: wallet,
  payment: { autoSign: true },
});

await gateway.authenticate();

// Discover servers and tools
const servers = await gateway.listServers();
const tools = await gateway.listTools('brave-search');

// Execute a tool (auto-pays via x402)
const result = await gateway.callTool('brave-search', 'web_search', {
  query: 'latest rust async patterns',
});
```

### Spending Policy

Control costs with configurable limits:

```typescript
const policy = new SpendingPolicy({
  maxPerCall: '0.001',   // $0.001 per tool call
  maxDaily: '1.00',      // $1/day cap
  allowedEndpoints: ['brave-search', 'github-mcp'],
});
```

---

## KFDB Direct API

For direct access to KnowledgeFlowDB features, all clients share the same config:

```typescript
const kfdbConfig = {
  baseUrl: process.env.KFDB_URL || 'http://34.60.37.158',
  apiKey: process.env.KFDB_API_KEY,
};
```

### Automation Rules

Create event-driven rules that trigger LLM operations on graph events:

```typescript
import { AutomationClient } from '@rickydata/core';

const automation = new AutomationClient(kfdbConfig);

// Auto-summarize new files when added to the graph
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

// List rules, check execution history
const rules = await automation.listRules();
const executions = await automation.listExecutions({ limit: 10 });

// Pause or delete
await automation.updateRule(rule.rule_id, { is_active: false });
await automation.deleteRule(rule.rule_id);
```

### Answer Sheets

Match errors against proven solution patterns:

```typescript
import { AnswerSheetClient } from '@rickydata/core';

const sheets = new AnswerSheetClient(kfdbConfig);

// Find solutions for an error
const matches = await sheets.match(
  'TypeError: Cannot read property "map" of undefined',
  { language: 'javascript' }
);

if (matches.matches.length > 0) {
  const best = matches.matches[0];
  console.log(`Solution (${best.confidence} confidence): ${best.solution_summary}`);
  await sheets.feedback(best.answer_sheet_id, true);
}

// Create a new answer sheet from a successful fix
await sheets.create({
  error_signature: 'Cannot read property.*of undefined',
  problem_category: 'type_error',
  solution_steps: [
    { step: 1, tool: 'Grep', action: 'find_usage', rationale: 'Locate variable usage' },
    { step: 2, tool: 'Edit', action: 'add_guard', rationale: 'Add optional chaining' },
  ],
  solution_summary: 'Add null check before accessing nested property',
  languages: ['javascript', 'typescript'],
});
```

### Agent Chat

Stream AI agent responses:

```typescript
import { AgentClient } from '@rickydata/core';

const agent = new AgentClient({
  baseUrl: 'https://gateway.rickydata.com',
});

await agent.authenticateWithWallet(process.env.WALLET_PRIVATE_KEY);

const stream = await agent.chat('Analyze my query router performance', {
  agentId: 'kfdb-assistant',
  stream: true,
});

for await (const event of stream) {
  if (event.type === 'text') process.stdout.write(event.text);
  if (event.type === 'tool_call') console.log(`\nTool: ${event.name}`);
}
```

### Canvas Workflows

Execute visual multi-agent workflows:

```typescript
import { CanvasClient } from '@rickydata/core';

const canvas = new CanvasClient(kfdbConfig);

const result = await canvas.executeWorkflow('workflow-id', {
  inputs: { repo_url: 'https://github.com/org/repo' },
});
```

### Workspace Notes

```typescript
import { WorkspaceClient } from '@rickydata/core';

const workspace = new WorkspaceClient(kfdbConfig);

const note = await workspace.create({
  title: 'agent-workspace/investigation',
  body: '## Findings\n\nRoot cause identified...',
});
```

### Autonomous Pipeline

```typescript
import { PipelineClient } from '@rickydata/core';

const pipeline = new PipelineClient(kfdbConfig);

const result = await pipeline.resolve({
  issue_url: 'https://github.com/org/repo/issues/42',
});
```

---

## Error Handling

All clients throw descriptive errors:

```typescript
try {
  await automation.getRule('nonexistent');
} catch (err) {
  // "Failed to get automation rule: 404 Rule not found: nonexistent"
  console.error(err.message);
}
```

---

## Environment Variables

| Variable | Used by | Purpose |
|---|---|---|
| `KFDB_URL` | KFDB clients | API base URL (default: `http://34.60.37.158`) |
| `KFDB_API_KEY` | KFDB clients | API key authentication |
| `WALLET_PRIVATE_KEY` | MCPGateway, AgentClient | Wallet for x402 payments |

---

## Related Documentation

- [Automation Rules API](/docs/AUTOMATION_API.md) -- Full REST reference
- [Answer Sheets](/docs/ANSWER_SHEETS.md) -- Concepts, matching, feedback
- [Plugin Hooks API](/docs/PLUGIN_HOOKS_API.md) -- Claude Code integration
- [Session Intelligence API](/docs/SESSION_INTELLIGENCE_API.md) -- Insights pipeline
- [Pipeline Client API](/docs/PIPELINE_CLIENT_API.md) -- Autonomous resolution
- [Autonomous Pipeline](/docs/AUTONOMOUS_PIPELINE.md) -- Pipeline architecture
