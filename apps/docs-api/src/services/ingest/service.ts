import type { IngestRunResult } from "@rickydata-docs/shared-types";
import { pool } from "../../db/pool.js";
import { parseRepo, toRunResult } from "./repo-parser.js";
import { replaceRepoData } from "./db-writer.js";
import { getEnabledSources, repoSources } from "./sources.js";

let ingestInProgress = false;

async function startRun(repoName: string): Promise<number> {
  const result = await pool.query(
    `
    INSERT INTO ingest_runs (repo_name, status, started_at)
    VALUES ($1, 'running', NOW())
    RETURNING id
    `,
    [repoName]
  );
  return result.rows[0]?.id as number;
}

async function finishRun(runId: number, status: "success" | "failed", payload: {
  commit?: string;
  docsCount?: number;
  endpointsCount?: number;
  commandsCount?: number;
  stats?: Record<string, unknown>;
  error?: string;
}): Promise<void> {
  await pool.query(
    `
    UPDATE ingest_runs
    SET ended_at = NOW(),
        status = $2,
        commit_sha = $3,
        docs_count = $4,
        endpoints_count = $5,
        commands_count = $6,
        stats_json = $7::jsonb,
        error_log = $8
    WHERE id = $1
    `,
    [
      runId,
      status,
      payload.commit || null,
      payload.docsCount || 0,
      payload.endpointsCount || 0,
      payload.commandsCount || 0,
      JSON.stringify(payload.stats || {}),
      payload.error || null
    ]
  );
}

export async function runRepoIngest(repoName: string): Promise<IngestRunResult> {
  const source = repoSources.find((item) => item.name === repoName);
  if (!source) {
    throw new Error(`Unknown repo source: ${repoName}`);
  }
  if (!source.enabled) {
    throw new Error(`Repo source is disabled: ${repoName}`);
  }

  const runId = await startRun(repoName);
  try {
    const parsed = await parseRepo(source);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await replaceRepoData(client, source.name, parsed.commit, parsed.docs, parsed.endpoints, parsed.commands);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const result = toRunResult(source.name, parsed);
    await finishRun(runId, "success", {
      commit: parsed.commit,
      docsCount: parsed.docs.length,
      endpointsCount: parsed.endpoints.length,
      commandsCount: parsed.commands.length,
      stats: { warnings: result.warnings }
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await finishRun(runId, "failed", { error: message });
    return {
      repoName,
      commit: "",
      status: "failed",
      docsCount: 0,
      endpointsCount: 0,
      commandsCount: 0,
      warnings: [],
      error: message
    };
  }
}

export async function runFullIngest(requestedRepos?: string[]): Promise<IngestRunResult[]> {
  if (ingestInProgress) {
    throw new Error("Ingest already in progress");
  }

  ingestInProgress = true;
  try {
    const targetNames = requestedRepos && requestedRepos.length > 0
      ? requestedRepos
      : getEnabledSources().map((source) => source.name);

    const results: IngestRunResult[] = [];
    for (const repoName of targetNames) {
      const result = await runRepoIngest(repoName);
      results.push(result);
    }
    return results;
  } finally {
    ingestInProgress = false;
  }
}

export function isIngestInProgress(): boolean {
  return ingestInProgress;
}
