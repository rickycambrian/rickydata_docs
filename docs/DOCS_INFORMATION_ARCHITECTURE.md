# Docs Information Architecture

## Objective

Make public docs intuitive for first-time users and scalable for advanced users by separating:

1. Journey-first onboarding (task-driven)
2. Product/reference hubs (system-driven)
3. Machine-readable assistant endpoints (`llms.txt`)

## Navigation Model

### Top navigation

- `Quickstart`: fastest successful setup path
- `Playbooks`: operational journeys and rollout checklists
- `Changelog`
- `Version Matrix`
- `llms.txt`

### Sidebar sections

- `Start Here`: quickstart + playbooks + primary references
- `Primary Journeys`: anchor links into `Playbooks`
- `Reference Hubs`: product-based doc indexes (`marketplace`, `sdk`, `mcp-server`, ...)
- `Agent Access`: global machine prompt and agent/canvas journeys

## Page Roles

### `/quickstart`

Purpose: first successful outcome in under 5 minutes.

Includes:
- featured video card (CLI + Claude Code end-to-end)
- exact prompt to run in Claude Code
- command blocks for bootstrap + verification

### `/playbooks`

Purpose: production rollout documentation, ordered by user goal.

Sections:
- local MCP setup
- MCP runtime loop (search/enable/call/disable)
- wallet controls (funding, retention, budgets, self-improvement)
- BYOK agent chat
- agent as MCP endpoint
- canvas workflows
- marketplace UI operations
- video backlog inventory

### `/products/:product`

Purpose: deep reference grouped by doc type and freshness.

Use for:
- API and CLI details
- architecture references
- latest updates within one product boundary

SDK hub requirements:
- keep `sdk-readme` and `sdk-docs-kfdb-getting-started` in `Start Here`
- make KFDB scope model explicit: reads default `global`, opt into `private`, writes tenant-isolated
- include one short, copy-pasteable `withScope("private")` example near top

### `/search`

Purpose: advanced discovery only.

Behavior:
- grouped by `docType`
- warns users when broad section search should be replaced with product hub navigation

## Video Placement Model

- Featured setup demo appears on:
  - `/quickstart`
  - `/playbooks` local MCP setup section
- Additional recordings tracked in `src/content/video-guides.ts`
- Video source is environment-driven (`VITE_VIDEO_QUICKSTART_DEMO_URL`) to keep deployments CI-safe and media decoupled from source control

## Machine-Readable Docs

- Global: `/llms.txt`
- Per page: `/docs/:slug/llms.txt`

These remain canonical for agent consumption and should be updated whenever onboarding or command syntax changes.
