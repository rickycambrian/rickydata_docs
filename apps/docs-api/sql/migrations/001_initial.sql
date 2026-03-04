CREATE TABLE IF NOT EXISTS repos (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  local_path TEXT NOT NULL,
  default_branch TEXT NOT NULL DEFAULT 'main',
  remote_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id BIGSERIAL PRIMARY KEY,
  repo_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL,
  commit_sha TEXT,
  docs_count INTEGER NOT NULL DEFAULT 0,
  endpoints_count INTEGER NOT NULL DEFAULT 0,
  commands_count INTEGER NOT NULL DEFAULT 0,
  stats_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_log TEXT
);

CREATE TABLE IF NOT EXISTS docs (
  id BIGSERIAL PRIMARY KEY,
  product TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL,
  body_html TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source_repo TEXT NOT NULL,
  source_path TEXT NOT NULL,
  source_commit TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector(
      'english',
      COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(body_md, '')
    )
  ) STORED,
  UNIQUE (source_repo, source_path, source_commit, doc_type)
);

CREATE INDEX IF NOT EXISTS docs_search_idx ON docs USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS docs_product_type_idx ON docs (product, doc_type, published);

CREATE TABLE IF NOT EXISTS api_endpoints (
  id BIGSERIAL PRIMARY KEY,
  product TEXT NOT NULL,
  service TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  auth_mode TEXT NOT NULL DEFAULT 'unknown',
  request_schema_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_schema_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  examples_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_repo TEXT NOT NULL,
  source_path TEXT NOT NULL,
  source_commit TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product, service, method, path, source_repo, source_commit)
);

CREATE INDEX IF NOT EXISTS api_endpoints_product_idx ON api_endpoints (product, service);

CREATE TABLE IF NOT EXISTS cli_commands (
  id BIGSERIAL PRIMARY KEY,
  product TEXT NOT NULL,
  command TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  options_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  examples_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_repo TEXT NOT NULL,
  source_path TEXT NOT NULL,
  source_commit TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product, command, source_repo, source_commit)
);

CREATE INDEX IF NOT EXISTS cli_commands_product_idx ON cli_commands (product);

CREATE TABLE IF NOT EXISTS doc_links (
  id BIGSERIAL PRIMARY KEY,
  from_doc_id BIGINT NOT NULL REFERENCES docs(id) ON DELETE CASCADE,
  to_doc_id BIGINT NOT NULL REFERENCES docs(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL DEFAULT 'related',
  UNIQUE (from_doc_id, to_doc_id, link_type)
);

CREATE TABLE IF NOT EXISTS doc_versions (
  id BIGSERIAL PRIMARY KEY,
  doc_id BIGINT NOT NULL REFERENCES docs(id) ON DELETE CASCADE,
  source_commit TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diff_summary TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS ingest_state (
  repo_name TEXT PRIMARY KEY,
  latest_commit TEXT,
  last_ingested_at TIMESTAMPTZ,
  docs_count INTEGER NOT NULL DEFAULT 0,
  endpoints_count INTEGER NOT NULL DEFAULT 0,
  commands_count INTEGER NOT NULL DEFAULT 0
);
