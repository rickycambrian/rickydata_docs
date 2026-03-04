#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const apiUrl = (process.env.DOCS_API_URL || "http://localhost:8080").replace(/\/$/, "");
const repoMap = {
  mcp_deployments_registry: process.env.DOCS_REPO_MCP_DEPLOYMENTS || "/Users/riccardoesclapon/Documents/github/mcp_deployments_registry",
  rickydata_SDK: process.env.DOCS_REPO_RICKYDATA_SDK || "/Users/riccardoesclapon/Documents/github/rickydata_SDK",
  rickydata_mcp: process.env.DOCS_REPO_RICKYDATA_MCP || "/Users/riccardoesclapon/Documents/github/rickydata_mcp",
  KF_serverless: process.env.DOCS_REPO_KF_SERVERLESS || "/Users/riccardoesclapon/Documents/github/KF_serverless",
  "canvas-workflows": process.env.DOCS_REPO_CANVAS_WORKFLOWS || "/Users/riccardoesclapon/Documents/github/canvas-workflows"
};

function gitHead(path) {
  try {
    return execFileSync("git", ["-C", path, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

async function main() {
  const response = await fetch(`${apiUrl}/api/public/version-matrix`);
  if (!response.ok) {
    throw new Error(`Failed to fetch version matrix: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const rows = payload.rows || [];

  let driftFound = false;
  for (const row of rows) {
    const localHead = gitHead(repoMap[row.repo]);
    const ingested = row.latestIngestedCommit;

    if (!localHead || !ingested) {
      console.log(`[WARN] ${row.repo}: unable to compare (local=${localHead}, ingested=${ingested})`);
      continue;
    }

    if (localHead !== ingested) {
      driftFound = true;
      console.log(`[DRIFT] ${row.repo}: local=${localHead.slice(0, 12)} ingested=${ingested.slice(0, 12)}`);
    } else {
      console.log(`[OK] ${row.repo}: ${ingested.slice(0, 12)}`);
    }
  }

  if (driftFound) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
