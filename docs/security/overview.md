---
title: Security Overview
description: Rickydata platform security architecture
---

# Security Overview

## Defense-in-Depth

The Rickydata platform implements multiple layers of security:

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Hardware TEE                                          │
│    └─ AMD SEV-SNP Confidential VM                                │
│       └─ Hardware-rooted attestation                             │
│                                                                  │
│  Layer 2: Code Identity                                          │
│    └─ Code hash pinning                                          │
│       └─ Runtime hash vs published hash verification             │
│                                                                  │
│  Layer 3: Build Provenance                                        │
│    └─ Signed CI/CD provenance                                     │
│       └─ Immutable image digests                                  │
│                                                                  │
│  Layer 4: Secrets Protection                                     │
│    └─ @rickydata/security-kernel                                  │
│       └─ TPM-sealed (Agent GW) or in-memory (MCP GW)            │
│                                                                  │
│  Layer 5: Execution Proofs                                        │
│    └─ Ed25519 proof signing                                      │
│       └─ Attestation-bound key material                          │
│                                                                  │
│  Layer 6: Gateway Verification                                    │
│    └─ Live verification suite                                    │
│       └─ End-to-end attestation checks                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Security Kernel

The **@rickydata/security-kernel** package is the cryptographic foundation:

- **Public npm package**: https://www.npmjs.com/package/@rickydata/security-kernel
- **Public source code**: https://github.com/rickycambrian/rickydata_security_kernel
- **Both gateways use the same package**: Enables public auditability

### Two Encryption Models

| Model | Gateway | Description |
|-------|---------|-------------|
| In-Memory | MCP Gateway | Fresh random key each startup, no persistence |
| TPM-Sealed | Agent Gateway | PCR-bound key survives restarts |

See [Security Kernel Verification](/docs/security/kernel-verification) for verification commands.

## Key Security Features

### Zero-Knowledge Architecture
- Operator cannot read user data
- Keys derived from user signatures (Sign-to-Derive)
- Or: Per-user keys with HKDF from wallet address

### LLM Provider Isolation

User secrets (MCP server API keys, credentials) are **never sent to the LLM provider** (Anthropic, etc.):

1. **Placeholder pattern** — Claude uses `{{SECRET_NAME}}` syntax in tool arguments. The gateway replaces placeholders with real values server-side before calling MCP tools.
2. **Tool result redaction** — Before tool results re-enter the LLM context for the next turn, a defense-in-depth redactor scrubs any known secret values and replaces them with `[REDACTED:SECRET_NAME]`.
3. **SSE output redaction** — A second layer redacts all streamed events before they reach the client.

Even if a buggy MCP server echoes back a secret in its output, the two-layer redaction prevents it from reaching the AI model or the client.

### TPM-Bound Keys
- Master key sealed in AMD SEV-SNP TPM
- PCR policy: sha256:0,1,2,3,4,5,7
- Automatic recovery on restart if TPM state unchanged

### Cross-Gateway Trust
- ES256 asymmetric auth between gateways
- JWKS published at `/.well-known/jwks.json`
- Strict mode: rejects non-trusted gateway calls

### Secret Release Guard
- Blocks secret release if attestation degraded
- Two modes: "enforced" (production) or "audit" (logging only)
- Per-gateway trusted/degraded count tracking

## Verification

Run the security verification:

```bash
# Full verification
curl -s https://mcp.rickydata.org/health | jq '.securityPosture'
curl -s https://agents.rickydata.org/health | jq '.securityPosture'

# Or use the security page
open https://marketplace.rickydata.org/security
```

## Related Documentation

- [TEE Trust Chain](/docs/security/tee-trust-chain)
- [Security Kernel Verification](/docs/security/kernel-verification)
- [MCP Gateway Security](/docs/mcp-gateway/security)
- [Agent Gateway Security](/docs/agent-gateway/security)