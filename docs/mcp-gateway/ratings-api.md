# Ratings API

The MCP Gateway provides a receipt-backed ratings system that lets wallets submit star ratings for MCP servers. Ratings require a valid signed receipt from a recent paid tool call, preventing spam and Sybil attacks.

This feature is opt-in and disabled by default.

## Anti-Gaming Model

- **One rating per wallet per server** — submitting again updates the existing rating (upsert)
- **Receipt required** — the receipt must be a valid EIP-712 signature from the gateway's offer/receipt signer
- **Receipt age limit** — receipts older than 30 days are rejected
- **Minimum raters** — aggregated ratings are only returned publicly when at least 5 unique wallets have rated

## Configuration

| Environment Variable | Required | Default | Description |
|---------------------|----------|---------|-------------|
| `RECEIPT_RATINGS_ENABLED` | Yes | `false` | Set to `true` to enable |
| `VAULT_ENCRYPTION_KEY` | Yes | — | 32-byte hex or base64 key for AES-256-GCM storage |
| `RATINGS_STORE_DIR` | No | `/var/lib/mcp-gateway/vault/ratings` | Storage directory |

The ratings store uses the same encrypted storage pattern as the metrics store — AES-256-GCM with HKDF-derived per-server keys and atomic writes. Server IDs are never stored as plaintext in directory names (HMAC-SHA256 hashing).

The x402 offer/receipt signing feature must also be enabled (`X402_OFFER_SIGNING_ENABLED=true`) for receipts to exist for validation.

## API Endpoints

### `POST /api/ratings` — Submit a Rating

**Auth required.** Submit a star rating for a server backed by a signed receipt.

**Request body:**
```json
{
  "serverId": "exa-mcp-server",
  "score": 5,
  "comment": "Works reliably, fast responses",
  "receipt": {
    "format": "eip712",
    "payload": {
      "version": 1,
      "network": "eip155:8453",
      "resourceUrl": "https://mcp.rickydata.org/api/servers/exa-mcp-server/tools/search",
      "payer": "0x75992f829DF3B5d515D70DB0f77A98171cE261EF",
      "issuedAt": 1711046400,
      "transaction": "0x..."
    },
    "signature": "0x...",
    "signer": "0x..."
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `serverId` | Yes | MCP server identifier |
| `score` | Yes | Integer 1–5 |
| `comment` | No | Optional text, max 1000 chars |
| `receipt` | Yes | EIP-712 signed receipt from gateway (from `_payment.receipt` in MCP tool result) |

**Success (201):**
```json
{
  "success": true,
  "serverId": "exa-mcp-server",
  "score": 5,
  "message": "Rating submitted successfully"
}
```

**Error responses:**
- `400` — invalid score, missing serverId, receipt verification failed
- `401` — missing auth
- `503` — rating service unavailable

**Receipt verification checks:**
1. Signature recovers to the gateway's configured signer address
2. Receipt payer matches the authenticated wallet
3. Receipt age ≤ 30 days
4. Receipt issuedAt not more than 5 minutes in the future (clock skew tolerance)

---

### `GET /api/ratings/:serverId` — Get Aggregated Rating

**Public.** Returns the aggregated rating for a server. Returns `hasEnoughRaters: false` with no score data if fewer than 5 wallets have rated.

```bash
curl -s https://mcp.rickydata.org/api/ratings/exa-mcp-server | jq .
```

**With enough raters (≥ 5):**
```json
{
  "serverId": "exa-mcp-server",
  "enabled": true,
  "count": 23,
  "average": 4.35,
  "distribution": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 8,
    "5": 12
  },
  "hasEnoughRaters": true
}
```

**Fewer than 5 raters:**
```json
{
  "serverId": "exa-mcp-server",
  "enabled": true,
  "hasEnoughRaters": false,
  "count": 0
}
```

---

### `GET /api/ratings/:serverId/mine` — Get Own Rating

**Auth required.** Returns the authenticated wallet's own rating for a server.

```bash
curl -s https://mcp.rickydata.org/api/ratings/exa-mcp-server/mine \
  -H "Authorization: Bearer <token>" | jq .
```

**With rating:**
```json
{
  "serverId": "exa-mcp-server",
  "walletAddress": "0x75992...",
  "hasRating": true,
  "score": 5,
  "comment": "Works reliably, fast responses",
  "submittedAt": "2026-03-21T22:00:00.000Z"
}
```

**Without rating:**
```json
{
  "serverId": "exa-mcp-server",
  "walletAddress": "0x75992...",
  "hasRating": false
}
```

---

### `GET /api/ratings/aggregations` — Bulk Aggregations

**Public.** Returns aggregations for all servers that have enough raters (≥ 5). Used by the marketplace data pipeline.

> **Note:** Mount order matters — this route must be registered before `/:serverId` or `aggregations` is treated as a server ID parameter.

```bash
curl -s https://mcp.rickydata.org/api/ratings/aggregations | jq .
```

```json
{
  "enabled": true,
  "count": 12,
  "aggregations": [
    {
      "serverId": "exa-mcp-server",
      "count": 23,
      "average": 4.35,
      "distribution": { "1": 0, "2": 1, "3": 2, "4": 8, "5": 12 },
      "hasEnoughRaters": true
    }
  ]
}
```

## Getting a Receipt

Receipts are issued by the gateway after a successful paid tool call. They appear in two places:

1. **MCP protocol** — in the `_payment.receipt` field of MCP tool result content items
2. **HTTP** — in the `PAYMENT-RESPONSE` header (base64 JSON), decoded under `.extensions.offer-receipt.info.receipt`

The rickydata SDK automatically extracts and stores receipts when using `ToolsManager.callTool()`.

For receipts to be issued, the gateway must have `X402_OFFER_SIGNING_ENABLED=true` configured. See the [x402 Offer & Receipt](./x402-offer-receipt.md) documentation.
