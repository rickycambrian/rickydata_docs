---
name: rickydata-docs
description: Use RickyData documentation to connect MCP clients, build SDK integrations, run hosted agents, configure wallet billing, and verify gateway security boundaries.
---

# RickyData Docs

Use this skill when a task requires current RickyData product documentation, implementation guidance, or safe agent behavior around MCP tools, wallet-scoped secrets, hosted agents, SDKs, and x402 payment.

## Canonical Sources

- Docs home: `https://docs.rickydata.org/`
- Platform home: `https://rickydata.org/`
- MCP Gateway: `https://mcp.rickydata.org/mcp`
- Agent Gateway health: `https://agents.rickydata.org/health`
- MCP Gateway health: `https://mcp.rickydata.org/health`
- Product skill: `https://rickydata.org/skill.md`
- Agent docs map: `https://docs.rickydata.org/llms.txt`

## Workflow

1. Start at the docs home to identify the correct product area.
2. Use the CLI quickstart for MCP client setup.
3. Use the MCP gateway docs for search, enable, list, call, and disable flows.
4. Use wallet billing docs before explaining tokens, secrets, spending, or payment.
5. Use security docs before making claims about isolation, trust, or production verification.

## Safety Rules

Never expose real wallet tokens, JWTs, provider API keys, vault secrets, or payment credentials. Treat anonymous discovery, bearer authentication, stored server secrets, and x402 paid execution as separate states.
