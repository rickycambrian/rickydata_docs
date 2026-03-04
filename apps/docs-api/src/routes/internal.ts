import { Router } from "express";
import { z } from "zod";
import { env } from "../config.js";
import { pool } from "../db/pool.js";
import { isIngestInProgress, runFullIngest, runRepoIngest } from "../services/ingest/service.js";

export const internalRouter = Router();

internalRouter.use((req, res, next) => {
  const auth = req.header("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";

  if (!token || token !== env.INGEST_API_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

const ingestRunSchema = z.object({
  repos: z.array(z.string()).optional()
});

internalRouter.get("/health/db", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

internalRouter.get("/health/ingest", async (_req, res, next) => {
  try {
    const latestRuns = await pool.query(
      `
      SELECT repo_name, started_at, ended_at, status, commit_sha, docs_count, endpoints_count, commands_count, error_log
      FROM ingest_runs
      ORDER BY started_at DESC
      LIMIT 10
      `
    );

    res.json({
      status: "ok",
      inProgress: isIngestInProgress(),
      recentRuns: latestRuns.rows
    });
  } catch (error) {
    next(error);
  }
});

internalRouter.post("/ingest/run", async (req, res, next) => {
  try {
    const parsed = ingestRunSchema.safeParse(req.body || {});
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }

    const results = await runFullIngest(parsed.data.repos);
    res.json({ status: "ok", results });
  } catch (error) {
    next(error);
  }
});

const ingestRepoSchema = z.object({
  repo: z.string().min(1)
});

internalRouter.post("/ingest/repo", async (req, res, next) => {
  try {
    const parsed = ingestRepoSchema.safeParse(req.body || {});
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }

    const result = await runRepoIngest(parsed.data.repo);
    res.json({ status: "ok", result });
  } catch (error) {
    next(error);
  }
});

internalRouter.get("/ingest/status", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT id, repo_name, started_at, ended_at, status, commit_sha,
             docs_count, endpoints_count, commands_count, error_log
      FROM ingest_runs
      ORDER BY started_at DESC
      LIMIT 30
      `
    );

    res.json({
      inProgress: isIngestInProgress(),
      runs: result.rows
    });
  } catch (error) {
    next(error);
  }
});
