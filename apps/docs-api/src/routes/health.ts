import { Router } from "express";
import { healthcheckDb, pool } from "../db/pool.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "docs-api" });
});

healthRouter.get("/internal/health/db", async (_req, res, next) => {
  try {
    const ok = await healthcheckDb();
    res.json({ status: ok ? "healthy" : "unhealthy" });
  } catch (error) {
    next(error);
  }
});

healthRouter.get("/internal/health/ingest", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT repo_name, started_at, ended_at, status
      FROM ingest_runs
      ORDER BY started_at DESC
      LIMIT 5
      `
    );
    res.json({ status: "ok", latestRuns: result.rows });
  } catch (error) {
    next(error);
  }
});
