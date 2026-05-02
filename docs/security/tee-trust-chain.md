---
title: TEE Trust Chain
description: How Rickydata ties hardware attestation, package integrity, Rust trust-plane helpers, and execution proofs together
---

# TEE Trust Chain

The live trust chain is anchored by AMD SEV-SNP attestation and exposed through the production gateway APIs. The public audit path is:

1. Verify the TEE and code hash: `GET https://mcp.rickydata.org/api/verify`
2. Verify the deployed image and GitHub Actions provenance: `GET https://mcp.rickydata.org/api/attestation/provenance`
3. Audit `@rickydata/security-kernel` for encryption, sign-to-derive, and TPM sealing.
4. Audit the Rust trust plane in `mcp_deployments_registry/rust/` for sandbox lifecycle, secret-release, and proof boundaries.
5. Verify an execution proof from a real tool call.

## Live Verification

```bash
curl -s https://mcp.rickydata.org/api/attestation/provenance | \
  jq '{source, image, securityKernel, trustPlane}'
```

The `securityKernel` object shows the npm package version, package-lock hash, installed version, and integrity string for `@rickydata/security-kernel`.

The `trustPlane` object shows the Rust helper hashes and rollout modes:

- `sandboxd`: container planning/start policy and per-session isolation
- `trust-plane`: secret-release decisions and proof/receipt canonicalization
- `runtimeModes`: current sandbox mode, runtime profile, secret-release guard mode, and TEE mode

## User-Session Isolation

The `session_permissive_isolated` runtime profile allows tools to use broad internet egress while keeping each authenticated session in its own isolated container/network scope. Metadata endpoints and private/internal ranges remain blocked.

This lets user sessions be permissive enough for real tools while preserving the hard boundary that one session or wallet must not share secret-bearing process state with another.

## Public Audit Surfaces

- Security page: https://rickydata.org/security
- Security kernel source: https://github.com/rickycambrian/rickydata_security_kernel
- Security kernel package: https://www.npmjs.com/package/@rickydata/security-kernel
- MCP Gateway provenance: https://mcp.rickydata.org/api/attestation/provenance
