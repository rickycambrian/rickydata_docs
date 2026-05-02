---
title: Security Kernel Verification
description: How to verify the @rickydata/security-kernel is running in both gateways
---

# Security Kernel Verification Guide

## What is the Security Kernel?

The `@rickydata/security-kernel` is a publicly auditable npm package that provides:
- AES-256-GCM encryption
- HKDF key derivation
- TPM sealing (Agent Gateway)
- Sign-to-derive key derivation (user-controlled encryption)

Both the MCP Gateway and Agent Gateway use this same package, enabling public verification that both gateways use identical cryptographic code.

The MCP Gateway also publishes Rust trust-plane provenance for the security-sensitive runtime boundary. The npm package proves the crypto implementation; the Rust helper hashes prove the deployed sandbox, secret-release, and proof-canonicalization helpers.

## Quick Verification

### Step 1: Check Security Kernel Package

```bash
npm view @rickydata/security-kernel version
# Should return: 1.1.0 or higher

npm view @rickydata/security-kernel repository.url
# Should return: https://github.com/rickycambrian/rickydata_security_kernel
```

### Step 2: Verify MCP Gateway Uses In-Memory Security Kernel

```bash
curl -s https://mcp.rickydata.org/health | jq '.securityPosture.keySources'
```

Expected output shows `vaultEncryptionKey` using `gateway_secret_key_fallback` (in-memory model).

### Step 3: Verify Agent Gateway Uses TPM-Sealed Security Kernel

```bash
curl -s https://agents.rickydata.org/health | jq '.securityPosture.keySources'
```

Expected output shows keys with `tpm_pcr` source.

### Step 4: Verify MCP Gateway Trust Plane

```bash
curl -s https://mcp.rickydata.org/api/attestation/provenance | \
  jq '{securityKernel: .securityKernel, trustPlane: .trustPlane}'
```

Expected output shows `securityKernel.lockedVersion`, npm integrity, `trustPlane.cargoLockHashSha256`, and matching hashes for `sandboxd` and `trust-plane`.

## Detailed Verification

### MCP Gateway Health Check

```bash
curl -s https://mcp.rickydata.org/health | jq '
  {
    status: .status,
    tee: .securityPosture.mode,
    attestation: .securityPosture.attestationAvailability.teeEnabled,
    keySources: .securityPosture.keySources,
    crossGatewayTrust: .securityPosture.crossGatewayTrust.state
  }'
```

Expected:
- `status`: "healthy"
- `tee`: "tee"
- `attestation`: true
- `keySources.vaultEncryptionKey`: "gateway_secret_key_fallback"
- `crossGatewayTrust`: "trusted"

### Agent Gateway Health Check

```bash
curl -s https://agents.rickydata.org/health | jq '
  {
    status: .status,
    tee: .securityPosture.mode,
    attestation: .securityPosture.attestationAvailability.teeEnabled,
    keySources: .securityPosture.keySources
  }'
```

Expected:
- `status`: "healthy"
- `tee`: "tee"
- `attestation`: true
- `keySources.jwtSecret`: "tpm_pcr"
- `keySources.signingKeyMaterial`: "tpm_pcr"

## Source Code Audit

### Clone and Verify

```bash
# Clone the security kernel repository
git clone https://github.com/rickycambrian/rickydata_security_kernel.git
cd rickydata_security_kernel

# View the encryption implementation
cat src/encryption.ts
cat src/encryption-inmem.ts

# Build and test
npm install
npm run build
npm test
```

### What to Look For

1. **AES-256-GCM**: Standard authenticated encryption
2. **HKDF**: Key derivation using HMAC-based KDF
3. **No hardcoded keys**: Keys should come from TPM or random generation
4. **No secret logging**: Secrets should never appear in logs

## Security Properties

| Property | MCP Gateway | Agent Gateway |
|----------|-------------|---------------|
| Encryption | AES-256-GCM | AES-256-GCM |
| Key Derivation | HKDF | HKDF |
| Master Key Source | Random (in-memory) | TPM-sealed |
| Persistence | None | TPM |
| PCR Binding | N/A | sha256:0,1,2,3,4,5,7 |

## Rust Trust Plane

| Helper | Gateway | Responsibility |
|--------|---------|----------------|
| `sandboxd` | MCP Gateway | Container lifecycle, Docker isolation args, per-session network posture |
| `trust-plane` | MCP Gateway | Secret-release decisions and proof/receipt canonicalization |

## Related Documentation

- [TEE Trust Chain](/docs/security/tee-trust-chain)
- [MCP Gateway Security](/docs/mcp-gateway/security)
- [Agent Gateway Security](/docs/agent-gateway/security)
