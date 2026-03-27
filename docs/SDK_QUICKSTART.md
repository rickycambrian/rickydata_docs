# RickyData SDK Quick Start

The `rickydata` SDK is the unified TypeScript client for RickyData platform workflows.

It covers two integration modes:

- **MCP Gateway**: discover and call marketplace tools with wallet auth and x402 payments.
- **KFDB Direct API**: read/write entity data with explicit read scope (`global` or `private`).

## Installation

```bash
npm install rickydata
```

## Import Surface

```typescript
import {
  MCPGateway,
  SpendingWallet,
  SpendingPolicy,
  KFDBClient,
} from 'rickydata';
```

## MCP Gateway (Marketplace Tools)

```typescript
const wallet = await SpendingWallet.create({
  privateKey: process.env.WALLET_PRIVATE_KEY,
});

const gateway = new MCPGateway({
  url: 'https://gateway.rickydata.com',
  spendingWallet: wallet,
  payment: { autoSign: true },
});

await gateway.authenticate();

const servers = await gateway.listServers();
const tools = await gateway.listTools('brave-search');

const result = await gateway.callTool('brave-search', 'web_search', {
  query: 'latest rust async patterns',
});
```

### Spending policy

```typescript
const policy = new SpendingPolicy({
  maxPerCall: '0.001',
  maxDaily: '1.00',
  allowedEndpoints: ['brave-search', 'github-mcp'],
});
```

## KFDB Direct API (Explicit Scope UX)

Use `KFDBClient` when you want direct KFDB entity access.

```typescript
const kfdb = new KFDBClient({
  baseUrl: process.env.KFDB_URL || 'http://34.60.37.158',
  token: process.env.KFDB_TOKEN,
  // or apiKey: process.env.KFDB_API_KEY,
  // defaultReadScope: 'global' // default if omitted
});
```

### Scope model

- Read methods default to `global` and send scope explicitly.
- You can switch to `private` using `withScope('private')` or per-call `scope`.
- Writes always go through `/api/v1/write` and are tenant-isolated.

### Read examples

```typescript
// Global read (default)
const servers = await kfdb.listEntities('MCPServer', { limit: 10 });

// Client-level switch to private reads
const privateKfdb = kfdb.withScope('private');
const myNotes = await privateKfdb.listEntities('Note', { limit: 20 });

// Per-call override (takes precedence)
const myTasks = await kfdb.listEntities('Task', {
  scope: 'private',
  limit: 20,
});
```

### Write example

```typescript
await kfdb.write({
  operations: [
    {
      operation: 'create_node',
      label: 'Note',
      properties: {
        title: { String: 'SDK note' },
      },
    },
  ],
});
```

## Environment Variables

| Variable | Used by | Purpose |
|---|---|---|
| `KFDB_URL` | `KFDBClient` | KFDB API base URL |
| `KFDB_TOKEN` | `KFDBClient` | Wallet session token auth |
| `KFDB_API_KEY` | `KFDBClient` | API key auth (alternative) |
| `WALLET_PRIVATE_KEY` | `MCPGateway` | Wallet signing for marketplace payments |

## Related Docs

- `rickydata_SDK/docs/KFDB_GETTING_STARTED.md` — KFDB scope behavior and direct API usage
- `rickydata_SDK/README.md` — Package-level usage overview
