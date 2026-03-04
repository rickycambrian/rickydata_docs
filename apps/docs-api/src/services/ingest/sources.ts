import type { DocProduct } from "@rickydata-docs/shared-types";
import { env } from "../../config.js";

export type RepoSource = {
  name: string;
  product: DocProduct;
  path: string;
  remoteUrl: string;
  defaultBranch: string;
  enabled: boolean;
  includeMarkdown: boolean;
  includeRoutes: boolean;
  includeCli: boolean;
  includeSdkExports: boolean;
};

export const repoSources: RepoSource[] = [
  {
    name: "mcp_deployments_registry",
    product: "marketplace",
    path: env.DOCS_REPO_MCP_DEPLOYMENTS,
    remoteUrl: env.DOCS_REPO_MCP_DEPLOYMENTS_REMOTE,
    defaultBranch: "main",
    enabled: true,
    includeMarkdown: true,
    includeRoutes: true,
    includeCli: false,
    includeSdkExports: false
  },
  {
    name: "rickydata_SDK",
    product: "sdk",
    path: env.DOCS_REPO_RICKYDATA_SDK,
    remoteUrl: env.DOCS_REPO_RICKYDATA_SDK_REMOTE,
    defaultBranch: "main",
    enabled: true,
    includeMarkdown: true,
    includeRoutes: false,
    includeCli: true,
    includeSdkExports: true
  },
  {
    name: "rickydata_mcp",
    product: "mcp-server",
    path: env.DOCS_REPO_RICKYDATA_MCP,
    remoteUrl: env.DOCS_REPO_RICKYDATA_MCP_REMOTE,
    defaultBranch: "main",
    enabled: true,
    includeMarkdown: true,
    includeRoutes: true,
    includeCli: false,
    includeSdkExports: false
  },
  {
    name: "KF_serverless",
    product: "serverless",
    path: env.DOCS_REPO_KF_SERVERLESS,
    remoteUrl: env.DOCS_REPO_KF_SERVERLESS_REMOTE,
    defaultBranch: "main",
    enabled: env.isPhase2Enabled,
    includeMarkdown: true,
    includeRoutes: false,
    includeCli: false,
    includeSdkExports: false
  },
  {
    name: "canvas-workflows",
    product: "canvas",
    path: env.DOCS_REPO_CANVAS_WORKFLOWS,
    remoteUrl: env.DOCS_REPO_CANVAS_WORKFLOWS_REMOTE,
    defaultBranch: "main",
    enabled: env.isPhase2Enabled,
    includeMarkdown: true,
    includeRoutes: false,
    includeCli: false,
    includeSdkExports: false
  }
];

export function getEnabledSources(): RepoSource[] {
  return repoSources.filter((source) => source.enabled);
}
