import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/rickydata_docs"),
  INGEST_API_TOKEN: z.string().min(1).default("change-me"),
  CORS_ORIGIN: z.string().default("*"),
  DOCS_REPO_WORKDIR: z.string().min(1).default("/tmp/docs-sources"),
  DOCS_REPO_MCP_DEPLOYMENTS: z.string().min(1).default("/tmp/docs-sources/mcp_deployments_registry"),
  DOCS_REPO_RICKYDATA_MCP: z.string().min(1).default("/tmp/docs-sources/rickydata_mcp"),
  DOCS_REPO_RICKYDATA_SDK: z.string().min(1).default("/tmp/docs-sources/rickydata_SDK"),
  DOCS_REPO_KF_SERVERLESS: z.string().min(1).default("/tmp/docs-sources/KF_serverless"),
  DOCS_REPO_CANVAS_WORKFLOWS: z.string().min(1).default("/tmp/docs-sources/canvas-workflows"),
  DOCS_REPO_MCP_DEPLOYMENTS_REMOTE: z.string().url().default("https://github.com/rickycambrian/mcp_deployments_registry.git"),
  DOCS_REPO_RICKYDATA_MCP_REMOTE: z.string().url().default("https://github.com/rickycambrian/rickydata_mcp.git"),
  DOCS_REPO_RICKYDATA_SDK_REMOTE: z.string().url().default("https://github.com/rickycambrian/rickydata_SDK.git"),
  DOCS_REPO_KF_SERVERLESS_REMOTE: z.string().url().default("https://github.com/rickycambrian/KF-serverless.git"),
  DOCS_REPO_CANVAS_WORKFLOWS_REMOTE: z.string().url().default("https://github.com/rickycambrian/canvas-workflows.git"),
  DOCS_GIT_TOKEN: z.string().optional().default(""),
  DOCS_REPO_SYNC_ON_INGEST: z.string().default("true"),
  INGEST_INCLUDE_PHASE2: z.string().default("false")
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = {
  ...parsed.data,
  isPhase2Enabled: parsed.data.INGEST_INCLUDE_PHASE2.toLowerCase() === "true",
  syncReposOnIngest: parsed.data.DOCS_REPO_SYNC_ON_INGEST.toLowerCase() === "true"
};
