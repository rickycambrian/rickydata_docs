import type { ApiEndpointRecord, CliCommandRecord, DocRecord } from "@rickydata-docs/shared-types";
import type { PoolClient } from "pg";

async function upsertDocs(client: PoolClient, docs: DocRecord[]): Promise<void> {
  for (const doc of docs) {
    await client.query(
      `
      INSERT INTO docs (
        product, doc_type, slug, title, summary, body_md, body_html, tags,
        source_repo, source_path, source_commit, published, updated_at, published_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, NOW(), CASE WHEN $12 THEN NOW() ELSE NULL END
      )
      ON CONFLICT (slug)
      DO UPDATE SET
        product = EXCLUDED.product,
        doc_type = EXCLUDED.doc_type,
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        body_md = EXCLUDED.body_md,
        body_html = EXCLUDED.body_html,
        tags = EXCLUDED.tags,
        source_repo = EXCLUDED.source_repo,
        source_path = EXCLUDED.source_path,
        source_commit = EXCLUDED.source_commit,
        published = EXCLUDED.published,
        updated_at = NOW(),
        published_at = CASE WHEN EXCLUDED.published THEN COALESCE(docs.published_at, NOW()) ELSE NULL END
      `,
      [
        doc.product,
        doc.docType,
        doc.slug,
        doc.title,
        doc.summary,
        doc.bodyMd,
        doc.bodyHtml,
        doc.tags,
        doc.sourceRepo,
        doc.sourcePath,
        doc.sourceCommit,
        doc.published
      ]
    );
  }
}

async function upsertEndpoints(client: PoolClient, endpoints: ApiEndpointRecord[]): Promise<void> {
  for (const endpoint of endpoints) {
    await client.query(
      `
      INSERT INTO api_endpoints (
        product, service, method, path, auth_mode,
        request_schema_json, response_schema_json, examples_json,
        source_repo, source_path, source_commit, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6::jsonb, $7::jsonb, $8::jsonb,
        $9, $10, $11, NOW()
      )
      ON CONFLICT (product, service, method, path, source_repo, source_commit)
      DO UPDATE SET
        auth_mode = EXCLUDED.auth_mode,
        request_schema_json = EXCLUDED.request_schema_json,
        response_schema_json = EXCLUDED.response_schema_json,
        examples_json = EXCLUDED.examples_json,
        source_path = EXCLUDED.source_path,
        updated_at = NOW()
      `,
      [
        endpoint.product,
        endpoint.service,
        endpoint.method,
        endpoint.path,
        endpoint.authMode,
        JSON.stringify(endpoint.requestSchema || {}),
        JSON.stringify(endpoint.responseSchema || {}),
        JSON.stringify(endpoint.examples || []),
        endpoint.sourceRepo,
        endpoint.sourcePath,
        endpoint.sourceCommit
      ]
    );
  }
}

async function upsertCommands(client: PoolClient, commands: CliCommandRecord[]): Promise<void> {
  for (const command of commands) {
    await client.query(
      `
      INSERT INTO cli_commands (
        product, command, description, options_json, examples_json,
        source_repo, source_path, source_commit, updated_at
      ) VALUES (
        $1, $2, $3, $4::jsonb, $5::jsonb,
        $6, $7, $8, NOW()
      )
      ON CONFLICT (product, command, source_repo, source_commit)
      DO UPDATE SET
        description = EXCLUDED.description,
        options_json = EXCLUDED.options_json,
        examples_json = EXCLUDED.examples_json,
        source_path = EXCLUDED.source_path,
        updated_at = NOW()
      `,
      [
        command.product,
        command.command,
        command.description,
        JSON.stringify(command.options || []),
        JSON.stringify(command.examples || []),
        command.sourceRepo,
        command.sourcePath,
        command.sourceCommit
      ]
    );
  }
}

export async function replaceRepoData(
  client: PoolClient,
  repoName: string,
  commit: string,
  docs: DocRecord[],
  endpoints: ApiEndpointRecord[],
  commands: CliCommandRecord[]
): Promise<void> {
  await client.query("DELETE FROM docs WHERE source_repo = $1", [repoName]);
  await client.query("DELETE FROM api_endpoints WHERE source_repo = $1", [repoName]);
  await client.query("DELETE FROM cli_commands WHERE source_repo = $1", [repoName]);

  await upsertDocs(client, docs);
  await upsertEndpoints(client, endpoints);
  await upsertCommands(client, commands);

  await client.query(
    `
    INSERT INTO ingest_state (
      repo_name, latest_commit, last_ingested_at, docs_count, endpoints_count, commands_count
    ) VALUES ($1, $2, NOW(), $3, $4, $5)
    ON CONFLICT (repo_name)
    DO UPDATE SET
      latest_commit = EXCLUDED.latest_commit,
      last_ingested_at = EXCLUDED.last_ingested_at,
      docs_count = EXCLUDED.docs_count,
      endpoints_count = EXCLUDED.endpoints_count,
      commands_count = EXCLUDED.commands_count
    `,
    [repoName, commit, docs.length, endpoints.length, commands.length]
  );
}
