---
title: MCP Gateway Security
description: MCP Gateway security architecture and verification
---

# MCP Gateway Security

## Overview

The MCP Gateway (`mcp.rickydata.org`) runs in an AMD SEV-SNP confidential VM and uses the **@rickydata/security-kernel** package for secret management.

## Encryption Model

The MCP Gateway uses the **in-memory encryption model**:

- **Master Key**: Fresh 32-byte random value generated at startup
- **Per-User Keys**: HKDF-derived using wallet address + random salt
- **Per-Server Keys**: HKDF with serverId for isolation
- **Persistence**: None - secrets cleared on restart (by design)

This is the "gateway_secret_key_fallback" source in the health endpoint.

## Security Properties

| Property | Value |
|----------|-------|
| Encryption | AES-256-GCM |
| Key Derivation | HKDF-SHA256 |
| Master Key Source | Random (fresh each startup) |
| Secret Persistence | None (in-memory only) |
| TEE | AMD SEV-SNP |

## Verification

### Health Check

```bash
curl -s https://mcp.rickydata.org/health | jq '.securityPosture'
```

Expected fields:
- `mode`: "tee"
- `attestationAvailability.teeEnabled`: true
- `keySources.jwtSecret`: "tpm_pcr"
- `keySources.vaultEncryptionKey`: "gateway_secret_key_fallback"
- `crossGatewayTrust.state`: "trusted"
- `degraded`: false (or check degradedReasons)

### Security Kernel Verification

The MCP Gateway imports from `@rickydata/security-kernel`:

```bash
# Check the package is installed
ls -la node_modules/@rickydata/security-kernel/

# Or verify via the gateway
curl -s https://mcp.rickydata.org/health | jq '.securityPosture.keySources'
```

## Secret Management

### Storing Secrets

```bash
curl -X PUT https://mcp.rickydata.org/api/secrets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "io-github-brave-brave-search-mcp-server",
    "secrets": {
      "BRAVE_API_KEY": "your-api-key"
    }
  }'
```

### Retrieving Secrets

Secrets are retrieved via the vault with per-wallet isolation:

```bash
curl https://mcp.rickydata.org/api/secrets \
  -H "Authorization: Bearer <token>"
```

Only returns secret **names** and **status**, never values.

## Cross-Gateway Trust

The MCP Gateway trusts the Agent Gateway via ES256 JWKS:

```bash
curl -s https://mcp.rickydata.org/health | jq '.securityPosture.crossGatewayTrust'
```

Expected:
- `state`: "trusted"
- `attestationUrl`: "https://agents.rickydata.org/api/attestation/report"
- `attestedJwksHashTrunc16`: matches expected value

## Related Documentation

- [Security Overview](/docs/security/overview)
- [Security Kernel Verification](/docs/security/kernel-verification)
- [TEE Trust Chain](/docs/security/tee-trust-chain)