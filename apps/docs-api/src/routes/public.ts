import { type Request, Router } from "express";
import { pool } from "../db/pool.js";

export const publicRouter = Router();

function resolveDocsBaseUrl(req: Request): string {
  const docsHost = req.header("x-docs-host");
  const docsProto = req.header("x-docs-proto");
  if (docsHost) {
    return `${docsProto || "https"}://${docsHost}`;
  }

  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto?.split(",")[0]?.trim() || req.protocol || "https";
  const host = req.header("x-forwarded-host") || req.get("host");
  return host ? `${protocol}://${host}` : "https://docs.rickydata.org";
}

function toIso(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value || "");
}

publicRouter.get("/llms.txt", async (req, res, next) => {
  try {
    const docsBaseUrl = resolveDocsBaseUrl(req);

    const navResult = await pool.query(
      `
      SELECT product, doc_type, COUNT(*)::int AS count
      FROM docs
      WHERE published = TRUE
      GROUP BY product, doc_type
      ORDER BY product, doc_type
      `
    );

    const keyDocsResult = await pool.query(
      `
      SELECT slug, title, summary, product, doc_type, updated_at
      FROM docs
      WHERE published = TRUE
      ORDER BY
        CASE
          WHEN slug = 'sdk-readme' THEN 0
          WHEN slug = 'marketplace-readme' THEN 1
          WHEN lower(title) LIKE '%quickstart%' THEN 2
          WHEN lower(title) LIKE '%get started%' THEN 3
          WHEN doc_type = 'guide' THEN 4
          ELSE 9
        END,
        updated_at DESC
      LIMIT 30
      `
    );

    const productMap = new Map<string, Array<{ docType: string; count: number }>>();
    for (const row of navResult.rows) {
      const product = String(row.product);
      const list = productMap.get(product) || [];
      list.push({
        docType: String(row.doc_type),
        count: Number(row.count)
      });
      productMap.set(product, list);
    }

    const lines: string[] = [];
    lines.push("# MCP Marketplace Docs: LLM Setup Prompt");
    lines.push("");
    lines.push("Use this document to help users set up RickyData MCP + agents quickly.");
    lines.push(`Canonical docs site: ${docsBaseUrl}`);
    lines.push(`Machine-readable index: ${docsBaseUrl}/llms.txt`);
    lines.push(`Operational playbooks: ${docsBaseUrl}/playbooks`);
    lines.push("");
    lines.push("## Critical Quickstart (CLI + MCP in Claude Code)");
    lines.push("```bash");
    lines.push("npm install -g rickydata");
    lines.push("rickydata init");
    lines.push("# Restart Claude Code when prompted");
    lines.push("```");
    lines.push("");
    lines.push("Manual flow:");
    lines.push("```bash");
    lines.push("rickydata auth login");
    lines.push("rickydata mcp connect");
    lines.push("# Restart Claude Code");
    lines.push("```");
    lines.push("");
    lines.push("Verify marketplace discovery and MCP usage:");
    lines.push("```bash");
    lines.push("rickydata mcp search \"brave\"");
    lines.push("rickydata mcp enable brave-search-mcp-server");
    lines.push("rickydata mcp tools");
    lines.push("rickydata mcp call blazickjp-arxiv-mcp-server__search_papers '{\"query\":\"transformers\",\"max_results\":3}'");
    lines.push("```");
    lines.push("");
    lines.push("## Agents Quickstart (BYOK)");
    lines.push("```bash");
    lines.push("rickydata apikey set");
    lines.push("rickydata agents list");
    lines.push("rickydata chat <agent-id>");
    lines.push("```");
    lines.push("");
    lines.push("## Product Coverage");
    for (const [product, types] of productMap.entries()) {
      const total = types.reduce((sum, item) => sum + item.count, 0);
      const breakDown = types.map((item) => `${item.docType}:${item.count}`).join(", ");
      lines.push(`- ${product}: ${total} docs (${breakDown})`);
    }
    lines.push("");
    lines.push("## Key Pages");
    for (const row of keyDocsResult.rows) {
      const slug = String(row.slug);
      const title = String(row.title);
      const summary = String(row.summary || "");
      const product = String(row.product || "");
      const docType = String(row.doc_type || "");
      lines.push(`- ${title} [${product}/${docType}]`);
      lines.push(`  - Page: ${docsBaseUrl}/docs/${slug}`);
      lines.push(`  - LLM markdown: ${docsBaseUrl}/docs/${slug}/llms.txt`);
      if (summary) {
        lines.push(`  - Summary: ${summary}`);
      }
    }
    lines.push("");
    lines.push("## Instructions for Assistants");
    lines.push("- Prefer SDK/CLI docs first for install + auth.");
    lines.push("- For implementation details, fetch per-page llms endpoint and quote exact commands.");
    lines.push("- Do not invent command flags if not present in docs.");
    lines.push("- If user wants agent workflows, include canvas and agents commands.");
    lines.push("");
    lines.push(`Last generated: ${new Date().toISOString()}`);

    res.type("text/plain; charset=utf-8").send(lines.join("\n"));
  } catch (error) {
    next(error);
  }
});

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

publicRouter.get("/products/:product", async (req, res, next) => {
  try {
    const product = String(req.params.product || "").trim();
    if (!product) {
      res.status(400).json({ error: "Product is required" });
      return;
    }

    const summaryResult = await pool.query(
      `
      SELECT doc_type, COUNT(*)::int AS count
      FROM docs
      WHERE product = $1
        AND published = TRUE
      GROUP BY doc_type
      ORDER BY count DESC, doc_type ASC
      `,
      [product]
    );

    if (summaryResult.rowCount === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const docsResult = await pool.query(
      `
      SELECT slug, title, summary, doc_type, updated_at, source_repo, source_path
      FROM docs
      WHERE product = $1
        AND published = TRUE
      ORDER BY
        CASE
          WHEN lower(title) LIKE '%quickstart%' OR lower(title) LIKE '%get started%' THEN 0
          WHEN source_path ILIKE '%readme%' THEN 1
          WHEN doc_type = 'guide' THEN 2
          WHEN doc_type = 'architecture' THEN 3
          WHEN doc_type = 'api' THEN 4
          WHEN doc_type = 'cli' THEN 5
          ELSE 9
        END,
        updated_at DESC
      LIMIT 400
      `,
      [product]
    );

    const docs = docsResult.rows.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      docType: row.doc_type,
      updatedAt: row.updated_at,
      sourceRepo: row.source_repo,
      sourcePath: row.source_path
    }));

    const types = summaryResult.rows.map((row: any) => ({
      docType: row.doc_type,
      count: Number(row.count)
    }));

    const total = types.reduce((sum, item) => sum + item.count, 0);
    const startHere = docs
      .filter((doc: any) =>
        /quickstart|get started|readme/i.test(doc.title) ||
        /readme/i.test(doc.sourcePath) ||
        doc.docType === "guide" ||
        doc.docType === "architecture"
      )
      .slice(0, 12);

    const recent = [...docs]
      .sort((a: any, b: any) => new Date(String(b.updatedAt)).getTime() - new Date(String(a.updatedAt)).getTime())
      .slice(0, 12);

    res.json({
      product,
      total,
      types,
      sections: {
        startHere,
        guides: docs.filter((doc: any) => doc.docType === "guide").slice(0, 80),
        architecture: docs.filter((doc: any) => doc.docType === "architecture").slice(0, 40),
        api: docs.filter((doc: any) => doc.docType === "api").slice(0, 120),
        cli: docs.filter((doc: any) => doc.docType === "cli").slice(0, 120),
        recent,
        references: docs.filter((doc: any) => !["guide", "architecture", "api", "cli"].includes(doc.docType)).slice(0, 60)
      }
    });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/docs/:slug/llms.txt", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const docsBaseUrl = resolveDocsBaseUrl(req);

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
      res.status(404).type("text/plain; charset=utf-8").send("Document not found");
      return;
    }

    const doc = docResult.rows[0];

    const relatedResult = await pool.query(
      `
      SELECT slug, title, summary, product, doc_type, updated_at
      FROM docs
      WHERE product = $1 AND slug <> $2 AND published = TRUE
      ORDER BY updated_at DESC
      LIMIT 10
      `,
      [doc.product, doc.slug]
    );

    const endpointResult = await pool.query(
      `
      SELECT service, method, path, auth_mode
      FROM api_endpoints
      WHERE product = $1
      ORDER BY service, method, path
      LIMIT 80
      `,
      [doc.product]
    );

    const commandResult = await pool.query(
      `
      SELECT command, description
      FROM cli_commands
      WHERE product = $1
      ORDER BY command
      LIMIT 80
      `,
      [doc.product]
    );

    const lines: string[] = [];
    lines.push(`# ${String(doc.title)}`);
    lines.push("");
    lines.push(`- Product: ${String(doc.product)}`);
    lines.push(`- Doc Type: ${String(doc.doc_type)}`);
    lines.push(`- Canonical page: ${docsBaseUrl}/docs/${String(doc.slug)}`);
    lines.push(`- LLM endpoint: ${docsBaseUrl}/docs/${String(doc.slug)}/llms.txt`);
    lines.push(`- Updated: ${toIso(doc.updated_at)}`);
    lines.push(`- Source repo: ${String(doc.source_repo)}`);
    lines.push(`- Source path: ${String(doc.source_path)}`);
    lines.push(`- Source commit: ${String(doc.source_commit)}`);
    lines.push("");
    lines.push("## Summary");
    lines.push(String(doc.summary || ""));
    lines.push("");
    lines.push("## Full Markdown");
    lines.push(String(doc.body_md || ""));
    lines.push("");
    lines.push("## API Endpoint Inventory (Same Product)");
    if (endpointResult.rowCount === 0) {
      lines.push("- None indexed.");
    } else {
      for (const row of endpointResult.rows) {
        lines.push(`- ${String(row.method)} ${String(row.path)} (${String(row.service)}; auth=${String(row.auth_mode)})`);
      }
    }
    lines.push("");
    lines.push("## CLI Command Inventory (Same Product)");
    if (commandResult.rowCount === 0) {
      lines.push("- None indexed.");
    } else {
      for (const row of commandResult.rows) {
        lines.push(`- rickydata ${String(row.command)} — ${String(row.description || "")}`);
      }
    }
    lines.push("");
    lines.push("## Related Docs");
    for (const row of relatedResult.rows) {
      const relatedSlug = String(row.slug);
      lines.push(`- ${String(row.title)} [${String(row.product)}/${String(row.doc_type)}]`);
      lines.push(`  - ${docsBaseUrl}/docs/${relatedSlug}`);
      lines.push(`  - ${docsBaseUrl}/docs/${relatedSlug}/llms.txt`);
    }

    res.type("text/plain; charset=utf-8").send(lines.join("\n"));
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
