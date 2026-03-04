# GCP Setup and Operations Runbook

This runbook is for the `rickydata_docs` platform in project `ai-projects-442213`.

## Current Live State (2026-03-04)

- Project: `ai-projects-442213`
- Region: `us-central1`
- Cloud SQL instance: `rickydata-docs`
- Cloud SQL connection: `ai-projects-442213:us-central1:rickydata-docs`
- Cloud Run API: `https://rickydata-docs-api-2dbp4scmrq-uc.a.run.app`
- Cloud Run Web: `https://rickydata-docs-web-2dbp4scmrq-uc.a.run.app`
- Cloud Run docs domain mapping: `docs.rickydata.org` (certificate pending until DNS record is added)
- Artifact Registry repos:
- `rickydata-docs-api`
- `rickydata-docs-web`

## Architecture

- `apps/docs-api`: Express API (public docs endpoints + internal ingest endpoints)
- `apps/docs-web`: React 18 + Vite frontend
- Cloud SQL PostgreSQL stores parsed docs content
- Cloud Run hosts both API and web
- GitHub Actions deploys both services and triggers ingest jobs

## Required GitHub Secrets

Set in repo `rickycambrian/rickydata_docs`:

- `GCP_SA_KEY`: JSON key for GHA deploy service account
- `CLOUD_SQL_CONNECTION_NAME`: `ai-projects-442213:us-central1:rickydata-docs`
- `DOCS_DATABASE_URL`: `postgresql://<user>:<password>@/rickydata_docs?host=/cloudsql/ai-projects-442213:us-central1:rickydata-docs`
- `INGEST_API_TOKEN`: bearer token for internal ingest routes
- `DOCS_API_URL`: Cloud Run API URL
- `INGEST_INCLUDE_PHASE2`: `true` or `false`
- `DOCS_GIT_TOKEN`: GitHub token for cloning private source repos

## Service Account for GitHub Actions

Recommended dedicated service account:

- Name: `rickydata-docs-gha@ai-projects-442213.iam.gserviceaccount.com`
- Project roles:
- `roles/run.admin`
- `roles/artifactregistry.admin`
- `roles/serviceusage.serviceUsageConsumer`
- Runtime SA impersonation:
- Grant `roles/iam.serviceAccountUser` on runtime SA `883260741347-compute@developer.gserviceaccount.com`

## Cloud Run Runtime Environment

API service (`rickydata-docs-api`) should have:

- `NODE_ENV=production`
- `DATABASE_URL=<DOCS_DATABASE_URL secret value>`
- `INGEST_API_TOKEN=<secret value>`
- `CORS_ORIGIN=*` (tighten to your web domain after DNS cutover)
- `DOCS_REPO_WORKDIR=/tmp/docs-sources`
- `INGEST_INCLUDE_PHASE2=<secret value>`
- `DOCS_GIT_TOKEN=<secret value>`

And Cloud SQL mount:

- `--add-cloudsql-instances ai-projects-442213:us-central1:rickydata-docs`

## Deployment Flow

1. Push to `main` (or trigger `workflow_dispatch` for `deploy-docs.yml`).
2. Workflow builds and pushes API image.
3. Workflow deploys API to Cloud Run (with Cloud SQL wiring).
4. Workflow resolves API URL.
5. Workflow builds web image with `VITE_DOCS_API_URL=<resolved API URL>`.
6. Workflow deploys web to Cloud Run.
7. Workflow runs smoke checks.

Post-deploy validation:

- `GET /health`
- `GET /api/public/nav`
- `POST /api/internal/ingest/run` (with `INGEST_API_TOKEN`)

## DNS and Custom Domain (After Cloud Run URL Is Live)

Use a subdomain for docs, e.g. `docs.rickydata.org`.

1. Create mapping:
```bash
gcloud beta run domain-mappings create \
  --project ai-projects-442213 \
  --region us-central1 \
  --service rickydata-docs-web \
  --domain docs.rickydata.org
```
2. Get DNS records to add:
```bash
gcloud beta run domain-mappings describe \
  --project ai-projects-442213 \
  --region us-central1 \
  --domain docs.rickydata.org \
  --format='yaml(status.resourceRecords,status.conditions)'
```
3. Add the returned records in your DNS provider.
4. For this deployment, the exact required record is:
- `Type`: `CNAME`
- `Host/Name`: `docs`
- `Target/Value`: `ghs.googlehosted.com.`
5. Wait for certificate provisioning and DNS propagation.
6. Verify:
```bash
curl -I https://docs.rickydata.org
```
7. Verify llms endpoints on the custom domain:
```bash
curl -fsS https://docs.rickydata.org/llms.txt | head -n 20
curl -fsS https://docs.rickydata.org/docs/sdk-readme/llms.txt | head -n 20
```

For API custom domain (optional), repeat with `rickydata-docs-api`, then set:

- `CORS_ORIGIN=https://docs.rickydata.org`
- `DOCS_API_URL=https://<api-domain>` in GitHub secrets

## Operations and Maintenance

- Rotate DB password:
- Update Cloud SQL user password
- Update `DOCS_DATABASE_URL` GitHub secret
- Redeploy API
- Rotate `INGEST_API_TOKEN`:
- Update GitHub secret
- Redeploy API
- Keep `DOCS_GIT_TOKEN` scoped to minimal required repo read access
- Keep Cloud SQL automated backups enabled

## Cost and Sizing Notes

- Current instance is `db-custom-1-3840` in `ENTERPRISE` edition.
- If you want to minimize cost further, evaluate whether your workload can move to a shared-core tier (`db-f1-micro` or `db-g1-small`) before production load increases.
- Test ingest duration and query latency before and after any downsize.
