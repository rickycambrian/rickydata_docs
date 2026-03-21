# x402 Offer & Receipt Extension

The MCP Gateway supports the [x402 Offer & Receipt extension](https://docs.x402.org/extensions/offer-receipt), adding cryptographic proof-of-interaction to payment flows.

When enabled, the gateway automatically signs an **offer** on every 402 response (committing to payment terms) and a **receipt** on every 200 response after successful payment (confirming service delivery).

## How It Works

### Signed Offers (402 Responses)

When a tool call requires payment, the 402 response includes signed offers in the `extensions` field:

```json
{
  "x402Version": 2,
  "accepts": [{ "scheme": "exact", "network": "eip155:8453", "amount": "500", ... }],
  "extensions": {
    "offer-receipt": {
      "info": {
        "offers": [{
          "format": "eip712",
          "payload": {
            "version": 1,
            "resourceUrl": "https://mcp.rickydata.org/api/servers/{id}/tools/{tool}",
            "scheme": "exact",
            "network": "eip155:8453",
            "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            "payTo": "0x...",
            "amount": "500",
            "validUntil": 1711046400
          },
          "signature": "0x...",
          "signer": "0x..."
        }]
      }
    }
  }
}
```

Each offer cryptographically commits the gateway to specific payment terms. The `validUntil` timestamp controls how long the offer remains valid (default: 300 seconds).

### Signed Receipts (200 Responses)

After successful payment and tool execution, the `PAYMENT-RESPONSE` header includes a signed receipt:

```json
{
  "x402Version": 2,
  "success": true,
  "txHash": "0x...",
  "extensions": {
    "offer-receipt": {
      "info": {
        "receipt": {
          "format": "eip712",
          "payload": {
            "version": 1,
            "network": "eip155:8453",
            "resourceUrl": "https://mcp.rickydata.org/api/servers/{id}/tools/{tool}",
            "payer": "0x...",
            "issuedAt": 1711046400,
            "transaction": "0x..."
          },
          "signature": "0x...",
          "signer": "0x..."
        }
      }
    }
  }
}
```

For MCP protocol calls (JSON-RPC), the receipt is embedded in the `_payment.receipt` field of the tool result.

### DID Document

The gateway hosts a DID document at `GET /.well-known/did.json` that binds the signing key to the gateway's identity. Clients can verify that offer/receipt signatures come from the authorized gateway signer.

## Client-Side (rickydata SDK)

The SDK automatically extracts and verifies offers and receipts:

```typescript
import { ToolsManager } from 'rickydata';
import {
  verifyOfferSignature,
  verifyReceiptSignature,
  verifyReceiptMatchesOffer,
} from 'rickydata/payment/offer-receipt-verifier';

// callTool() automatically extracts offers from 402 and receipts from 200
const result = await tools.callTool('server-id', 'tool-name', { query: 'test' });

// Access server receipts from the spending tracker
const receipts = wallet.getServerReceipts();

// Verify signatures independently
const { signerAddress } = await verifyOfferSignature(offer);
const { signerAddress } = await verifyReceiptSignature(receipt);
const valid = verifyReceiptMatchesOffer(receipt, offer, [myWalletAddress]);
```

## EIP-712 Signing

Both offers and receipts use EIP-712 structured data signing with dedicated domains:

| Type | Domain Name | Version | Chain ID |
|------|-------------|---------|----------|
| Offer | `x402 offer` | `1` | `1` |
| Receipt | `x402 receipt` | `1` | `1` |

Chain ID 1 is intentional — EIP-712 is used as an off-chain signing format, not tied to any specific on-chain network. The payment network is identified by the `network` field in the payload.

## Configuration

The feature is opt-in and disabled by default.

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `X402_OFFER_SIGNING_ENABLED` | `false` | Enable offer/receipt signing |
| `X402_OFFER_SIGNING_KEY` | — | Hex-encoded secp256k1 private key (dedicated signing key, not the settlement key) |
| `X402_OFFER_VALIDITY_SECONDS` | `300` | How long signed offers remain valid |
| `X402_RECEIPT_INCLUDE_TX_HASH` | `true` | Include blockchain tx hash in receipts |

## Use Cases

- **Reputation systems** — Clients attach receipts to on-chain attestations as proof-of-interaction
- **Dispute resolution** — Offers prove the server committed to terms; receipts prove delivery
- **Auditing** — Receipts create a verifiable trail of service delivery
- **Client confidence** — Services with verifiable proof-of-interaction build stronger trust signals
