---
title: Agent Gateway Security
description: Agent Gateway security architecture and verification
---

# Agent Gateway Security

## Overview

The Agent Gateway (`agents.rickydata.org`) runs in an AMD SEV-SNP confidential VM and uses the **@rickydata/security-kernel** package with TPM-sealed keys for BYOK (Bring Your Own Key) functionality.

## Encryption Model

The Agent Gateway uses the **TPM-sealed encryption model**:

- **Master Key**: Sealed in TPM with PCR policy
- **PCR Policy**: sha256:0,1,2,3,4,5,7 (boot measurements)
- **Per-User Keys**: HKDF-derived from unsealed master key
- **Key Persistence**: Survives container restarts via TPM unsealing
- **Fallback**: Environment variables if TPM unavailable (with warnings)

## Security Properties

| Property | Value |
|----------|-------|
| Encryption | AES-256-GCM |
| Key Derivation | HKDF-SHA256 |
| Master Key Source | TPM-sealed (PCR-bound) |
| Secret Persistence | TPM (survives restarts) |
| TEE | AMD SEV-SNP |
| BYOK | Anthropic API keys sealed in TPM |

## Verification

### Health Check

```bash
curl -s https://agents.rickydata.org/health | jq '.securityPosture'
```

Expected fields:
- `mode`: "tee"
- `attestationAvailability.teeEnabled`: true
- `keySources.jwtSecret`: "tpm_pcr"
- `keySources.signingKeyMaterial`: "tpm_pcr"
- `keySources.ledgerEncryptionKey`: "tpm_pcr"
- `keySources.byokVaultEncryptionKey`: "tpm_pcr" (or "env_fallback" if TPM issue)
- `degraded`: false

### Security Kernel Verification

The Agent Gateway imports from `@rickydata/security-kernel`:

```bash
# Check via health endpoint
curl -s https://agents.rickydata.org/health | jq '.securityPosture.keySources'
```

All keys should show `tpm_pcr` as source when TPM is healthy.

## BYOK (Bring Your Own Key)

Users store their Anthropic API key, which is:
1. Encrypted with TPM-sealed master key
2. Never exposed to operators
3. Only decrypted when the user makes API calls

```bash
# Store API key
curl -X PUT https://agents.rickydata.org/wallet/apikey \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "anthropicApiKey": "sk-ant-..." }'
```

## LLM Provider Isolation

User secrets (MCP server API keys like Brave Search, database credentials, etc.) are **never sent to the LLM provider**. The Agent Gateway implements a server-side placeholder replacement architecture:

1. **Placeholder pattern** — Tool schemas instruct Claude to use `{{SECRET_NAME}}` placeholders. The LLM never sees actual secret values.
2. **Server-side injection** — The Agent Gateway replaces `{{SECRET_NAME}}` with real vault values before forwarding tool calls to the MCP Gateway.
3. **Tool result redaction** — Before tool results re-enter the LLM context for the next turn, a redactor scrubs any known secret values and replaces them with `[REDACTED:SECRET_NAME]`.
4. **SSE output redaction** — A second redaction layer scrubs all streamed events before they reach the client.

**What the LLM provider sees:**
- Tool arguments: `{ "query": "{{BRAVE_API_KEY}}" }` — placeholder only
- Tool results: text output, with any secret values redacted

**What the LLM provider never sees:**
- Actual API keys, passwords, or tokens
- Environment variables injected into MCP server processes
- The mapping between placeholder names and real values

## Cross-Gateway Trust

The Agent Gateway verifies MCP Gateway trust via JWKS:

```bash
curl -s https://agents.rickydata.org/health | jq '.securityPosture'
```

The MCP Gateway's ES256 JWT is verified against the published JWKS.

## Related Documentation

- [Security Overview](/docs/security/overview)
- [Security Kernel Verification](/docs/security/kernel-verification)
- [TEE Trust Chain](/docs/security/tee-trust-chain)
- [MCP Gateway Security](/docs/mcp-gateway/security)