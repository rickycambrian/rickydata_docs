import { Router } from "express";
import { pool } from "../db/pool.js";

export const publicRouter = Router();

publicRouter.get("/nav", async (_req, res, next) => {
  try {
    const docsResult = await pool.query(
      `
      SELECT product, doc_type, COUNT(*)::int AS count
      FROM docs
      WHERE published = TRUE
      GROUP BY product, doc_type
      ORDER BY product, doc_type
      `
    );

    const byProduct = new Map<string, { docType: string; count: number }[]>();
    for (const row of docsResult.rows) {
      const product = row.product as string;
      const list = byProduct.get(product) || [];
      list.push({ docType: row.doc_type as string, count: Number(row.count) });
      byProduct.set(product, list);
    }

    const products = Array.from(byProduct.entries()).map(([product, types]) => ({
      product,
      types,
      total: types.reduce((sum, t) => sum + t.count, 0)
    }));

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/search", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const section = req.query.section ? String(req.query.section) : null;
    const type = req.query.type ? String(req.query.type) : null;
    const limit = Math.min(Number(req.query.limit || 20), 100);

    const params: Array<string | number | null> = [q, section, type, limit];

    const result = await pool.query(
      `
      WITH query_input AS (
        SELECT
          NULLIF($1::text, '') AS q,
          CASE WHEN NULLIF($1::text, '') IS NULL THEN NULL ELSE websearch_to_tsquery('english', $1::text) END AS tsq
      )
      SELECT
        d.slug,
        d.title,
        d.summary,
        d.product,
        d.doc_type,
        d.updated_at,
        CASE
          WHEN qi.tsq IS NULL THEN 0
          ELSE ts_rank(d.search_vector, qi.tsq)
        END AS rank
      FROM docs d
      CROSS JOIN query_input qi
      WHERE d.published = TRUE
        AND ($2::text IS NULL OR d.product = $2::text)
        AND ($3::text IS NULL OR d.doc_type = $3::text)
        AND (
          qi.q IS NULL
          OR d.search_vector @@ qi.tsq
          OR d.title ILIKE ('%' || qi.q || '%')
          OR d.summary ILIKE ('%' || qi.q || '%')
        )
      ORDER BY rank DESC, d.updated_at DESC
      LIMIT $4::int
      `,
      params
    );

    res.json({
      query: q,
      total: result.rowCount,
      items: result.rows.map((row: any) => ({
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        product: row.product,
        docType: row.doc_type,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/docs/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const docResult = await pool.query(
      `
      SELECT id, product, doc_type, slug, title, summary, body_md, tags,
             source_repo, source_path, source_commit, updated_at
      FROM docs
      WHERE slug = $1 AND published = TRUE
      LIMIT 1
      `,
      [slug]
    );

    if (docResult.rowCount === 0) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    const doc = docResult.rows[0];

    const relatedResult = await pool.query(
      `
      SELECT slug, title, summary, product, doc_type, updated_at
      FROM docs
      WHERE product = $1 AND slug <> $2 AND published = TRUE
      ORDER BY updated_at DESC
      LIMIT 6
      `,
      [doc.product, doc.slug]
    );

    const endpointResult = await pool.query(
      `
      SELECT service, method, path, auth_mode, examples_json
      FROM api_endpoints
      WHERE product = $1
      ORDER BY service, method, path
      LIMIT 200
      `,
      [doc.product]
    );

    const commandResult = await pool.query(
      `
      SELECT command, description, examples_json
      FROM cli_commands
      WHERE product = $1
      ORDER BY command
      LIMIT 200
      `,
      [doc.product]
    );

    res.json({
      doc: {
        id: doc.id,
        product: doc.product,
        docType: doc.doc_type,
        slug: doc.slug,
        title: doc.title,
        summary: doc.summary,
        bodyMd: doc.body_md,
        tags: doc.tags,
        sourceRepo: doc.source_repo,
        sourcePath: doc.source_path,
        sourceCommit: doc.source_commit,
        updatedAt: doc.updated_at
      },
      related: relatedResult.rows.map((row: any) => ({
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        product: row.product,
        docType: row.doc_type,
        updatedAt: row.updated_at
      })),
      endpoints: endpointResult.rows.map((row: any) => ({
        service: row.service,
        method: row.method,
        path: row.path,
        authMode: row.auth_mode,
        examples: row.examples_json
      })),
      commands: commandResult.rows.map((row: any) => ({
        command: row.command,
        description: row.description,
        examples: row.examples_json
      }))
    });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/changelog", async (req, res, next) => {
  try {
    const product = req.query.product ? String(req.query.product) : null;
    const limit = Math.min(Number(req.query.limit || 50), 200);

    const result = await pool.query(
      `
      SELECT slug, title, summary, product, source_repo, source_path, updated_at
      FROM docs
      WHERE published = TRUE
        AND doc_type = 'release-note'
        AND ($1::text IS NULL OR product = $1)
      ORDER BY updated_at DESC
      LIMIT $2
      `,
      [product, limit]
    );

    res.json({
      total: result.rowCount,
      items: result.rows.map((row: any) => ({
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        product: row.product,
        sourceRepo: row.source_repo,
        sourcePath: row.source_path,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/version-matrix", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT
        repo_name,
        latest_commit,
        docs_count,
        endpoints_count,
        commands_count,
        last_ingested_at
      FROM ingest_state
      ORDER BY repo_name
      `
    );

    res.json({
      rows: result.rows.map((row: any) => ({
        repo: row.repo_name,
        latestIngestedCommit: row.latest_commit,
        docs: row.docs_count,
        endpoints: row.endpoints_count,
        commands: row.commands_count,
        lastIngestedAt: row.last_ingested_at
      }))
    });
  } catch (error) {
    next(error);
  }
});
