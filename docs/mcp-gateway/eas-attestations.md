# EAS On-Chain Attestations

The MCP Gateway can publish on-chain attestations to the [Ethereum Attestation Service (EAS)](https://attest.org/) on Base mainnet after each successful x402 payment settlement. Attestations create a permanent, publicly queryable proof that a specific MCP tool was called and payment was made.

This feature is opt-in and disabled by default.

## How It Works

After a tool call is executed and the x402 payment settles, the gateway queues an attestation containing the receipt hash, payer address, server ID, tool name, settled amount, and timestamp. Attestations are submitted in batches every 5 minutes via the EAS `multiAttest` contract method.

```
x402 payment settles
  → EASAttestationService.queueAttestation() [O(1), fire-and-forget]
    → batched every 5 min
      → EAS.multiAttest() on Base mainnet
        → on-chain attestation UID
```

Queuing never blocks the tool response. Failures are re-queued for the next batch.

## Schema

```
bytes32 receiptHash, address payer, string serverId, string toolName, uint256 settledAmount, uint256 timestamp
```

| Field | Description |
|-------|-------------|
| `receiptHash` | keccak256 of the EIP-712 signed receipt JSON |
| `payer` | Wallet address that made the payment |
| `serverId` | MCP server identifier |
| `toolName` | MCP tool that was called |
| `settledAmount` | Amount paid in USDC base units (6 decimals) |
| `timestamp` | Unix timestamp in seconds |

## Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| EAS | `0x4200000000000000000000000000000000000021` |
| SchemaRegistry | `0x4200000000000000000000000000000000000020` |

## Configuration

| Environment Variable | Required | Default | Description |
|---------------------|----------|---------|-------------|
| `EAS_ATTESTATION_ENABLED` | Yes | `false` | Set to `true` to enable |
| `EAS_SCHEMA_UID` | Yes | — | `bytes32` UID from SchemaRegistry |
| `SETTLEMENT_OPERATOR_KEY` | Yes | — | Operator wallet private key (hex) |
| `EAS_BATCH_INTERVAL_MS` | No | `300000` | Batch flush interval (min: 5000ms) |
| `SETTLEMENT_RPC_URL` | No | `https://mainnet.base.org` | Base RPC URL |

The schema must be registered once with `SchemaRegistry.register()` before enabling. The returned `bytes32` UID is set as `EAS_SCHEMA_UID`.

## API Endpoints

### `GET /api/attestations/schema`

Returns the schema UID, definition, contract addresses, and EAS explorer link. Public, no auth required.

```bash
curl -s https://mcp.rickydata.org/api/attestations/schema | jq .
```

```json
{
  "enabled": true,
  "schemaUID": "0xabc...",
  "definition": "bytes32 receiptHash,address payer,string serverId,string toolName,uint256 settledAmount,uint256 timestamp",
  "easContractAddress": "0x4200000000000000000000000000000000000021",
  "schemaRegistryAddress": "0x4200000000000000000000000000000000000020",
  "network": "base",
  "chainId": 8453,
  "registryUrl": "https://base.easscan.org/schema/view/0xabc..."
}
```

### `GET /api/attestations/stats`

Returns queue and submission statistics. Public.

```bash
curl -s https://mcp.rickydata.org/api/attestations/stats | jq .
```

```json
{
  "enabled": true,
  "queued": 3,
  "submitted": 142,
  "failed": 0,
  "lastBatchAt": "2026-03-21T22:00:00.000Z"
}
```

When `EAS_ATTESTATION_ENABLED` is not set or the service failed to initialize:

```json
{
  "enabled": false,
  "message": "EAS attestation service not initialized (EAS_ATTESTATION_ENABLED=false or missing config)"
}
```

### `GET /api/attestations/:serverId`

Returns gateway-wide stats with an explorer search link scoped to the schema. Public.

Note: Per-server on-chain filtering requires querying EAS directly (see below) — the gateway does not maintain a per-server attestation index.

```bash
curl -s https://mcp.rickydata.org/api/attestations/exa-mcp-server | jq .
```

## Querying Attestations On-Chain

Attestations are publicly queryable via the [EAS GraphQL API](https://base.easscan.org/graphql):

```graphql
query {
  attestations(
    where: {
      schemaId: { equals: "<EAS_SCHEMA_UID>" }
      recipient: { equals: "<payer-address>" }
    }
    orderBy: { time: desc }
    take: 10
  ) {
    id
    attester
    recipient
    decodedDataJson
    time
    txid
  }
}
```

Or browse all attestations for the schema at:
`https://base.easscan.org/attestation/attestationsBySchema/<schemaUID>`

## Relationship to x402 Offer & Receipt

EAS attestations are a complement to the [x402 Offer & Receipt extension](./x402-offer-receipt.md). Receipts are off-chain EIP-712 signatures stored by the client; EAS attestations are permanent on-chain records published by the gateway. The `receiptHash` field in the attestation links the on-chain record to the off-chain receipt.
