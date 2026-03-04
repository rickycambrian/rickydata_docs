# RickyData Docs Platform

Independent documentation platform for RickyData MCP and agent marketplace systems.

## Implemented Stack

- **Frontend**: React 18 + Vite + TypeScript (`apps/docs-web`)
- **Backend**: Express + TypeScript (`apps/docs-api`)
- **Database**: PostgreSQL schema + migrations (`apps/docs-api/sql/migrations`)
- **Infra**: Terraform skeleton for GCP Cloud SQL + Artifact Registry (`infra/terraform`)
- **Deploy**: GitHub Actions for CI, deploy, ingest, and drift monitoring (`.github/workflows`)

## Repository Structure

- `apps/docs-web`: Public docs site UI
- `apps/docs-api`: Public docs API + protected ingest API
- `packages/shared-types`: Shared schemas/types
- `packages/content-parsers`: Markdown/API/CLI extraction logic
- `scripts/check-content-drift.mjs`: Detect source-vs-ingested commit drift
- `infra/terraform`: GCP infrastructure definitions

## Implemented API Surface

### Public

- `GET /health`
- `GET /api/public/nav`
- `GET /api/public/search?q=&section=&type=&limit=`
- `GET /api/public/docs/:slug`
- `GET /api/public/docs/:slug/llms.txt` (plain text markdown for agents)
- `GET /api/public/changelog?product=&limit=`
- `GET /api/public/version-matrix`
- `GET /api/public/llms.txt` (global machine prompt)

### Internal (Token Protected)

- `POST /api/internal/ingest/run`
- `POST /api/internal/ingest/repo`
- `GET /api/internal/ingest/status`
- `GET /api/internal/health/db`
- `GET /api/internal/health/ingest`

## Local Development

### 1. Install

```bash
npm install
```

### 2. Configure API env

```bash
cp apps/docs-api/.env.example apps/docs-api/.env
```

For local development with local source repos, keep the `DOCS_REPO_*` paths in `.env` pointing to your checked-out directories.

### 3. Run migrations

```bash
npm run migrate
```

### 4. Run ingest (initial content sync)

```bash
npm run ingest
```

### 5. Run both services

```bash
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:8080`

## Ingestion Behavior

Current v1 defaults ingest these repos:

- `mcp_deployments_registry`
- `rickydata_SDK`
- `rickydata_mcp`

Phase 2 repos are supported but disabled by default:

- `KF_serverless`
- `canvas-workflows`

Enable with:

```env
INGEST_INCLUDE_PHASE2=true
```

## Quality Gates

Run all checks:

```bash
npm run lint
npm run build
npm run test
```

## CI/CD Workflows

- `ci.yml`: lint/build/test
- `deploy-docs.yml`: build Docker images and deploy docs API + web to Cloud Run
- `ingest-nightly.yml`: scheduled full ingest
- `ingest-on-dispatch.yml`: manual repo-specific ingest
- `content-drift-check.yml`: compares latest source commits vs ingested commits

## Operations Runbook

- `docs/GCP_SETUP_AND_OPERATIONS.md`: step-by-step GCP setup, GitHub secrets, deploy flow, DNS mapping, and ops procedures.

## UX Features

- Marketplace-style dark visual language aligned with the MCP Marketplace brand direction.
- Dedicated `/quickstart` flow for SDK/CLI install + auth + MCP + agents.
- Per-doc copy action for full markdown.
- Agent-friendly plain-text endpoints on the docs domain:
- `/llms.txt`
- `/docs/:slug/llms.txt`

## Required GitHub Secrets

- `GCP_SA_KEY`
- `CLOUD_SQL_CONNECTION_NAME`
- `DOCS_DATABASE_URL`
- `INGEST_API_TOKEN`
- `DOCS_API_URL`
- `INGEST_INCLUDE_PHASE2`
- `DOCS_GIT_TOKEN` (required if any source repos are private)

## Database Notes

- Migration SQL is idempotent (`CREATE TABLE IF NOT EXISTS`).
- API runs migrations automatically at startup.
- Default Terraform tier is `db-f1-micro` in `us-central1`.
- Cloud Run uses Cloud SQL socket connectivity (`--add-cloudsql-instances`).
