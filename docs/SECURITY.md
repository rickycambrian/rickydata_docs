# Security Architecture

How the MCP Gateway platform protects user data, secrets, and tool execution with hardware-backed cryptographic proof.

## Overview

The platform runs on **AMD SEV-SNP Confidential VMs** with 10 defense-in-depth layers. Every security claim is independently verifiable — users never need to trust the gateway itself.

**Live verification:** [mcpmarketplace.rickydata.org/security](https://mcpmarketplace.rickydata.org/security) — interactive page that calls real gateway endpoints and shows raw proof payloads for each trust layer.

**Production endpoints:**
- MCP Gateway: `https://mcp.rickydata.org`
- Agent Gateway: `https://agents.rickydata.org`

---

## Defense-in-Depth Layers

| Layer | Technology | What It Protects |
|-------|-----------|-----------------|
| 1. Hardware | AMD SEV-SNP | Memory encryption — hypervisor cannot read VM RAM |
| 2. Code Identity | SHA-256 hash pinning | Proves exactly which code version is running |
| 3. Build Provenance | Signed CI/CD metadata | Links deployed image to specific GitHub commit |
| 4. Secrets | vTPM PCR-bound keys | Platform secrets sealed to hardware — cannot be extracted |
| 5. Wallet Isolation | AES-256-GCM + HKDF | Each user's secrets encrypted with wallet-derived keys |
| 6. Authentication | Wallet tokens + ES256 | Cryptographic proof of wallet ownership |
| 7. Sandbox | Docker + gVisor + read-only FS | MCP servers run in isolated containers |
| 8. Payments | x402 conditional settlement | Charge only on success, EIP-712 signed |
| 9. Output Protection | Secret redaction | Secrets never appear in logs or responses |
| 10. Release Guard | Attestation-gated | Secrets blocked if attestation state is degraded |

---

## 1. Hardware Trust — AMD SEV-SNP

Both gateways run inside AMD SEV-SNP Confidential VMs on Google Cloud.

**What the hardware provides:**
- All VM memory is encrypted — the cloud hypervisor cannot read it
- Memory tampering is detected by the CPU
- Attestation reports are signed by a key burned into the AMD chip at the factory

**Supply chain hardening (Dockerfile.tee):**
- `snpguest` binary pinned to specific git commit (not piped from CDN)
- `uv` package manager verified with SHA-256 checksum before extraction
- APT package lists removed after install
- Non-root user (`uid 999`) — no privilege escalation

**Independent verification:**
```bash
# Download attestation report from gateway
curl -s https://mcp.rickydata.org/api/attestation/report > report.json

# Download AMD certificate chain and verify
curl -s https://kdsintf.amd.com/vlek/v1/Milan/cert_chain -o amd_chain.pem
jq -r '.certificates.vcek' report.json > vcek.pem
openssl verify -CAfile amd_chain.pem vcek.pem
# Expected: vcek.pem: OK
```

---

## 2. Code Identity — Hash Pinning

The gateway computes a SHA-256 hash of its own code at startup. This hash is:

1. **Embedded in the AMD attestation report** (`REPORT_DATA` field) — hardware attests which code is running
2. **Compared against `PUBLISHED_CODE_HASH`** — set during CI/CD deployment
3. **Included in every execution proof** — each tool call result is tied to a specific code version

If anyone modified the code after deployment, the hash would change and verification would fail.

```bash
# Check runtime vs published hash
curl -s https://mcp.rickydata.org/api/attestation | jq '{codeHash, publishedHash, match: .verified}'
```

---

## 3. Build Provenance

Deployed images include signed CI/CD metadata linking the running container to a specific GitHub commit and workflow run.

**Published at:** `GET /api/attestation/provenance`

**Includes:**
- Git commit SHA
- Immutable OCI image digest
- Attestation bundle SHA-256
- GitHub Actions workflow run ID
- Verification command hint

```bash
# Inspect provenance
curl -s https://mcp.rickydata.org/api/attestation/provenance | \
  jq '{commit: .source.gitCommit, digest: .image.digest, bundleSha256: .attestation.bundleSha256}'
```

---

## 4. Secret Management — TPM PCR-Bound Keys

Platform secrets are sealed to the vTPM using PCR-bound policy (`sha256:0,1,2,3,4,5,7`).

**MCP Gateway secrets (3):**
| Secret | Purpose |
|--------|---------|
| `JWT_SECRET` | Signs MCP gateway session tokens |
| `GATEWAY_SECRET_KEY` | Derives vault encryption keys (AES-256-GCM) + signs execution proofs |
| `GATEWAY_PROOF_PRIVATE_KEY_B64` | Ed25519 key for offline-verifiable execution proof signatures |

**Agent Gateway secrets (3):**
| Secret | Purpose |
|--------|---------|
| `JWT_SECRET` | Signs agent gateway session tokens |
| `LEDGER_ENCRYPTION_KEY` | Derives vault encryption keys for BYOK Anthropic API keys |
| `MCP_SIGNING_KEY` | ES256 (P-256) key for per-wallet MCP JWTs (cross-gateway auth) |

**TPM sealing properties:**
- Persistent handle: `0x81000099`
- Only this specific TEE VM can unseal
- Keys never stored in plaintext on disk
- If the VM's boot chain changes, unsealing fails
- Injected at container startup via `tpm2_unseal`

```bash
# Verify key sources on Agent Gateway
curl -s https://agents.rickydata.org/health | jq '.securityPosture.keySources'
# Expected: all values show "tpm_pcr"
```

---

## 5. Wallet-Scoped Secret Isolation

User secrets (API keys for MCP servers, Anthropic keys) are encrypted per-wallet using multi-layer key derivation.

**Encryption layers:**
1. **HKDF-SHA256 key derivation** — `KDF(masterKey, walletAddress + salt, serverId)` produces a unique key per wallet per server
2. **AES-256-GCM encryption** — each secret independently encrypted with random IV + auth tag
3. **HMAC-SHA256 vault keys** — wallet addresses are never stored in plaintext (HMAC used as map keys)
4. **Secure wipe** — derived keys wiped from memory (`Buffer.fill(0)`) after use

**Isolation guarantees:**
- Wallet A's secrets are encrypted with keys derived from A's address — wallet B cannot decrypt them
- One wallet's secrets are never visible to another wallet, even in memory
- The `/api/secrets/:serverId` endpoint returns only secret **names** (configured/missing), never values

**Sponsorship model:** When a sponsor shares agent access with another user, the sponsored user can USE the sponsor's secrets through MCP tool calls but can never VIEW them. Tool results are redacted before reaching the client (see Layer 9).

---

## 6. Authentication

Three authentication methods, all based on wallet ownership:

### Wallet Token (`mcpwt_`)
- Self-signed, self-verifying — zero server storage
- Format: `mcpwt_` + base64url of `{wallet, expiry, message, signature}`
- Verified via `ecrecover(signature, message)` — pure cryptographic math
- Survives gateway restarts (unlike session tokens)
- Long-lived (up to years), recommended for MCP clients

### JWT (24h session)
- Created via challenge-response: `GET /api/auth/challenge` then `POST /api/auth/verify`
- One-time use nonce, 5-minute expiry on challenges
- Standard JWT with wallet address in payload

### ES256 Cross-Gateway Auth
- Agent Gateway signs per-wallet JWTs with ES256 private key (TPM-sealed)
- MCP Gateway verifies via JWKS: `GET /.well-known/jwks.json`
- JWKS public key hash is bound into the AMD attestation report
- Trust states: `trusted`, `degraded_hash_mismatch`, `degraded_no_attestation`

```bash
# Verify JWKS endpoint
curl -s https://agents.rickydata.org/.well-known/jwks.json | jq '.keys[0].kid'

# Check cross-gateway trust state
curl -s https://mcp.rickydata.org/health | jq '.crossGatewayTrust'
```

---

## 7. Container Sandbox

MCP servers run in isolated Docker containers with multiple hardening layers.

**Container properties:**
- Read-only root filesystem (`--read-only`)
- `/tmp` mounted as `noexec` — prevents script execution
- All capabilities dropped (`--cap-drop=ALL`)
- No new privileges (`--security-opt=no-new-privileges`)
- Non-root user inside container
- Network policy: only allow specific upstream services
- Optional gVisor runtime for syscall filtering

**Secrets in containers:**
- Injected as environment variables (never written to filesystem)
- Bridge process (`mcp-bridge.ts`) redacts secrets in all 4 error paths
- Environment variable names recorded in execution proofs for audit

---

## 8. Payment Security — x402 Protocol

Tool calls use the x402 payment protocol with conditional settlement.

**Flow:**
1. Client signs EIP-712 `TransferWithAuthorization` (ERC-3009) for USDC on Base mainnet
2. Gateway verifies signature and recovers signer address
3. Tool executes
4. **Only on success:** USDC transfer is settled on-chain
5. On failure: payment is not settled

**Protections:**
- In-flight nonce guard prevents concurrent replay (5-minute TTL)
- If all RPC nodes unavailable, execution is blocked (fail-closed)
- Network: Base mainnet only (chain ID 8453) — never testnet
- `tools/list` is free; only `tools/call` costs ($0.0005 USDC per call)

---

## 9. Output Protection — Secret Redaction

Secrets are redacted from all output paths before reaching clients.

**Redaction patterns (applied everywhere):**
- Anthropic API keys: `sk-ant-*` replaced with `[REDACTED]`
- Wallet tokens: `mcpwt_*`
- Bearer tokens in headers
- Key-value pairs with sensitive names (`SECRET`, `TOKEN`, `PASSWORD`, `API_KEY`)
- JSON fields with sensitive keys

**SSE stream protection (Agent Gateway):**
- `createSecretRedactor()` builds a matcher from all active agent secrets
- `redactEventSecrets()` deep-traverses every SSE event (text, tool_result, error) before client write
- Longest-match-first ordering prevents partial redaction
- Minimum 4-character threshold to avoid false positives

**Applied to:**
- Console logs
- Error responses (400, 401, 402, 500)
- SSE streaming chat responses
- Tool call results

---

## 10. Secret Release Guard

Before decrypting vault secrets for MCP server startup, the system checks attestation state.

**Guard checks:**
1. Cross-gateway attestation state (ES256 JWT trust)
2. Trust states: `trusted`, `degraded`, `unavailable`
3. In enforced mode: degraded attestation blocks secret release

**Metrics tracked:**
- Total decisions, trusted count, degraded count
- Shadow enforcement count (would-block in audit mode)
- Last decision timestamp and state

This prevents MCP server secrets from being released while the gateway's attestation chain is compromised.

```bash
# Check release guard status
curl -s https://agents.rickydata.org/health | jq '.securityPosture.secretReleaseGuard'
```

---

## Execution Proofs

Every MCP tool call returns a cryptographic execution proof.

| Field | What It Proves |
|-------|---------------|
| `gateway.codeHash` | Which code version processed the request |
| `gateway.gitCommit` | Which git commit the code was built from |
| `gateway.teeEnabled` | Whether AMD SEV-SNP was active |
| `server.package` | Which npm/pypi package was executed |
| `server.packageAttestation.integrity.registryDigest` | SHA-512 digest from package registry |
| `execution.requestHash` | SHA-256 of the request |
| `execution.responseHash` | SHA-256 of the response |
| `execution.timestamp` | When the tool call happened |
| `signature.value` | HMAC-SHA256 or Ed25519 over all fields |
| `signature.keySource` | Where the signing key came from (vTPM or env) |

**Independent verification:**
```bash
# Download offline verification bundle
curl -s https://mcp.rickydata.org/api/attestation/bundle | \
  jq -r '.offlineVerification.script' > verify.sh && bash verify.sh
```

---

## API Endpoints

All attestation endpoints are free and publicly accessible.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/attestation` | GET | TEE summary + security properties |
| `/api/attestation/report` | GET | Raw AMD SEV-SNP attestation report + certificates |
| `/api/attestation/bundle` | GET | Offline verification bundle |
| `/api/attestation/security` | GET | Security feature details |
| `/api/attestation/build-info` | GET | Git commit, source hash, build time |
| `/api/attestation/provenance` | GET | Signed build provenance metadata |
| `/api/verify` | GET | Gateway state verification |
| `/health` | GET | System health + security posture |
| `/.well-known/jwks.json` | GET | ES256 public key (Agent Gateway) |

Both gateways expose matching attestation endpoints.

---

## Quick Verification Commands

```bash
# Full TEE status
curl -s https://mcp.rickydata.org/api/attestation | jq '{teeEnabled, platform, codeHash}'

# Agent Gateway security posture
curl -s https://agents.rickydata.org/health | jq '.securityPosture'

# Cross-gateway trust
curl -s https://mcp.rickydata.org/health | jq '.crossGatewayTrust'

# Build provenance
curl -s https://mcp.rickydata.org/api/attestation/provenance | jq '{source, image, attestation}'

# Offline verification (downloads and runs script)
curl -s https://mcp.rickydata.org/api/attestation/bundle | \
  jq -r '.offlineVerification.script' > verify.sh && bash verify.sh
```

---

## Trust Chain Visualization

```
AMD Factory (Root of Trust)
    |
    v
VCEK Certificate (burned into CPU chip)
    |
    v
AMD SEV-SNP Attestation Report
    |  (signs REPORT_DATA containing SHA-256 code hash)
    v
Gateway Code Hash (SHA-256 over dist/**/*.js)
    |  - matches PUBLISHED_CODE_HASH from GitHub Actions
    |  - matches runtime hash in /api/attestation/provenance
    |  - embedded in every execution proof
    v
Build Provenance (GitHub Actions metadata + attestation)
    |  - git commit, workflow run ID, immutable image digest
    |  - attestation bundle hash + verification hints
    v
vTPM PCR-Bound Secrets (sha256:0,1,2,3,4,5,7)
    |  MCP GW: JWT_SECRET, GATEWAY_SECRET_KEY, PROOF_PRIVATE_KEY
    |  Agent GW: JWT_SECRET, LEDGER_ENCRYPTION_KEY, MCP_SIGNING_KEY
    |  (only this specific TEE can unseal - handle 0x81000099)
    v
Per-Wallet Encrypted Vault (AES-256-GCM + HKDF)
    |  (wallet-scoped isolation, HMAC address obfuscation)
    v
Execution Proof Signatures (Ed25519 / HMAC-SHA256)
    |  (covers code hash + server package + request/response hashes)
    v
Verified Tool Call Result
```
