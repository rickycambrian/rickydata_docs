# TEE Encrypted Graph Storage Guide

KnowledgeFlowDB supports Trusted Execution Environment (TEE) encryption for operator-inaccessible graph property storage. When enabled, all property values are encrypted at rest using AES-256-GCM. The database operator cannot read your data — only holders of the correct encryption key can decrypt properties.

## What TEE Protects

```
┌──────────────────────────────────────────────────────────┐
│                    TEE-Encrypted KFDB                      │
│                                                            │
│  ┌─────────────────┐     ┌─────────────────────────────┐  │
│  │  Plaintext       │     │  Encrypted (at rest)         │  │
│  │  (for routing)   │     │  (only key holder reads)     │  │
│  │                  │     │                              │  │
│  │  - Node labels   │     │  - All property values       │  │
│  │  - Node IDs      │     │  - String, Integer, Float    │  │
│  │  - Edge types    │     │  - Boolean, Vector, Array    │  │
│  │  - Edge IDs      │     │  - Object, Null              │  │
│  │  - Graph         │     │  - CDC data in ClickHouse    │  │
│  │    structure     │     │                              │  │
│  └─────────────────┘     └─────────────────────────────┘  │
│                                                            │
│  TEE Hardware: GCE AMD SEV (memory encrypted in transit)   │
│  Trust Posture: Permissive → Audit → Enforced              │
└──────────────────────────────────────────────────────────┘
```

### What the operator CAN see

| Data | Visible? | Why |
|------|----------|-----|
| Node labels (e.g., "File", "Function") | Yes | Required for query routing and ScyllaDB partition keys |
| Node and edge UUIDs | Yes | Required for graph traversal and indexing |
| Edge types (e.g., "CONTAINS", "IMPORTS") | Yes | Required for edge queries |
| Graph structure (which nodes connect) | Yes | Edges are stored by source/target ID |
| Number of nodes/edges | Yes | Counts are structural, not property data |

### What the operator CANNOT see

| Data | Visible? | Why |
|------|----------|-----|
| Property values (name, path, content, etc.) | No | AES-256-GCM encrypted with tenant key |
| Embedding vectors | No | Encrypted with dedicated vector key |
| Full-text search tokens | No | Encrypted with dedicated FTS key |
| Property values in ClickHouse CDC replica | No | CDC syncs ciphertext, not plaintext |

## How Attestation Verification Works

TEE attestation proves that the KFDB server is running in genuine TEE hardware and has not been tampered with. The flow uses a challenge-response protocol:

```
Client                              KFDB TEE Server
  │                                       │
  │  1. GET /health                       │
  │  ──────────────────────────────────►  │
  │  ◄──────────────────────────────────  │
  │     { security_posture:               │
  │         tee_platform: "GCE_AMD_SEV",  │
  │         encryption_at_rest: true,     │
  │         memory_encrypted: true,       │
  │         trust_posture: "Enforced" }   │
  │                                       │
  │  2. POST /api/v1/tee/attest           │
  │     { nonce: "random_hex_32+" }       │
  │  ──────────────────────────────────►  │
  │  ◄──────────────────────────────────  │
  │     { nonce, hash, signature,         │
  │       public_key, platform,           │
  │       binary_hash }                   │
  │                                       │
  │  3. Verify:                           │
  │     - hash == SHA256(nonce +          │
  │       image_digest + platform +       │
  │       timestamp)                      │
  │     - signature valid for hash        │
  │     - nonce matches (anti-replay)     │
  │                                       │
```

### Verify with curl

```bash
# Step 1: Check health — confirm TEE is active
curl -s http://34.60.37.158/health | jq '.security_posture'

# Expected response:
# {
#   "tee_platform": "GCE_AMD_SEV",
#   "attestation_verified": true,
#   "encryption_at_rest": true,
#   "memory_encrypted": true,
#   "trust_posture": "Enforced",
#   "binary_hash": "sha256:..."
# }

# Step 2: List registered TEE nodes
curl -s http://34.60.37.158/api/v1/tee/nodes \
  -H "Authorization: Bearer $KFDB_API_KEY" | jq .

# Step 3: Submit attestation challenge
NONCE=$(openssl rand -hex 32)
curl -X POST http://34.60.37.158/api/v1/tee/attest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $KFDB_API_KEY" \
  -d "{\"nonce\": \"$NONCE\"}" | jq .
```

## How to Add Your Own TEE Node

TEE nodes can register with the KFDB cluster to participate in encrypted graph storage:

```bash
# Register a new TEE node
curl -X POST http://34.60.37.158/api/v1/tee/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $KFDB_API_KEY" \
  -d '{
    "node_id": "your-unique-node-id",
    "platform": "GCE_AMD_SEV",
    "public_key": "hex-encoded-ed25519-pubkey",
    "capabilities": ["encryption", "attestation"]
  }'
```

### Requirements

- **Hardware**: GCE Confidential VM (AMD SEV) or equivalent TEE platform
- **Network**: Must be reachable from the KFDB cluster
- **Authentication**: Valid KFDB API key with TEE registration permissions
- **Software**: KFDB binary compiled with TEE support (`KFDB_TEE_MODE=encrypted`)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KFDB_TEE_MODE` | Yes | Set to `encrypted` to enable encryption |
| `TEE_PLATFORM` | Yes | Platform identifier (e.g., `GCE_AMD_SEV`) |
| `TEE_TRUST_POSTURE` | No | `permissive` (default), `audit`, or `enforced` |
| `ENCRYPTION_MASTER_KEY` | Yes | 32-byte hex-encoded master encryption key |

## Encryption Details

### Wire Format

All property values are encrypted individually using AES-256-GCM:

```
__enc_{type}:{base64(nonce[12 bytes] || ciphertext || tag[16 bytes])}
```

Type tags preserve the original value type through encryption/decryption:
- `str` (String), `int` (Integer), `float` (Float), `bool` (Boolean)
- `vec` (Vector/embedding), `arr` (Array), `obj` (Object), `null` (Null)

### Key Hierarchy

A single root key derives purpose-specific sub-keys via HKDF-SHA256:

```
Root Key (32 bytes, from wallet signature or master key)
  ├── Graph Key    → encrypt node/edge property values
  ├── Vector Key   → encrypt embedding vectors
  ├── FTS Key      → encrypt full-text search tokens
  └── Property Key → per-property-name key (for selective disclosure)
```

### Sign-to-Derive (Wallet Auth) — Mandatory

Sign-to-derive is **required** for all wallet users. Writes are blocked without an active derive session.

Users with wallet-based auth derive their encryption key from an ECDSA signature:

1. Server sends a deterministic EIP-712 challenge
2. User signs with their wallet
3. Root key = SHA-256(r || s || v) from the signature
4. All sub-keys derived from root via HKDF
5. Derive session stored server-side (keyed by session ID, short TTL)

This means: no long-lived encryption keys are stored server-side. The user's wallet IS the key.

**Login flow**: On login, users are prompted for **two** wallet signatures — one for KFDB auth (challenge/verify), and one for the sign-to-derive key derivation. If the second signature is rejected, login fails. This is intentional: without a user key, writes would be stored as plaintext.

**SDK usage**: When constructing `KFDBClient` with a `walletAddress`, you must call `setDeriveSession(sessionId, keyHex)` before calling `write()`. The client throws if you attempt a write without an active derive session.

```ts
const client = new KFDBClient({ baseUrl, token, walletAddress: '0x...' });
// Must call this before write():
client.setDeriveSession(sessionId, derivedKeyHex);
await client.write({ operations: [...] }); // OK
```

## Key Rotation

Key rotation requires re-encrypting all properties with a new key:

1. Derive the old key hierarchy from the current root key
2. Generate or derive a new root key
3. For each node: decrypt properties with old key, encrypt with new key, persist
4. For each edge: same decrypt/re-encrypt cycle
5. Update the root key reference in tenant configuration

**Important**: During rotation, both old and new keys must be available. The system supports graceful degradation — if decryption fails with the new key, it falls back to returning encrypted values (detectable via `is_encrypted()` check).

## Trust Posture Levels

| Posture | TEE Required? | Behavior |
|---------|--------------|----------|
| **Permissive** | No | No TEE checks. Development default. |
| **Audit** | No | Logs warnings when TEE is missing but allows operation. |
| **Enforced** | Yes | Refuses to start without `TEE_PLATFORM` set. Production recommended. |

The trust posture is set via `TEE_TRUST_POSTURE` environment variable and checked at server startup by the Release Guard.

## GKE Infrastructure

TEE pods run on a dedicated GKE node pool with hardware encryption:

| Component | Configuration |
|-----------|---------------|
| Node pool | `tee-pool`, n2d-highmem-4, confidential nodes enabled |
| Autoscaling | 0-3 nodes |
| Pod replicas | 2 (high availability) |
| Priority class | `kfdb-tee-high` (1,000,000) |
| Service | `kfdb-api-tee` (ClusterIP) |
| Memory encryption | AMD SEV (hardware-level) |
| Env vars | `KFDB_TEE_MODE=encrypted`, `TEE_PLATFORM=GCE_AMD_SEV` |
