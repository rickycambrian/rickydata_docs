import { access, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import {
  extractCliCommands,
  extractExpressRoutes,
  extractMarkdownDocs,
  extractSdkExports
} from "@rickydata-docs/content-parsers";
import type {
  ApiEndpointRecord,
  CliCommandRecord,
  DocRecord,
  IngestRunResult
} from "@rickydata-docs/shared-types";
import { env } from "../../config.js";
import { execFileText } from "../../utils/shell.js";
import type { RepoSource } from "./sources.js";

export type ParsedRepoData = {
  docs: DocRecord[];
  endpoints: ApiEndpointRecord[];
  commands: CliCommandRecord[];
  commit: string;
};

function getGitAuthArgs(source: RepoSource): string[] {
  if (!env.DOCS_GIT_TOKEN) {
    return [];
  }

  try {
    const remote = new URL(source.remoteUrl);
    if (remote.protocol !== "https:") {
      return [];
    }

    const basicAuth = Buffer.from(`x-access-token:${env.DOCS_GIT_TOKEN}`).toString("base64");
    return ["-c", `http.${remote.origin}/.extraheader=AUTHORIZATION: basic ${basicAuth}`];
  } catch {
    return [];
  }
}

async function runGit(source: RepoSource, args: string[]): Promise<string> {
  return execFileText("git", [...getGitAuthArgs(source), ...args]);
}

async function ensureRepoAvailable(source: RepoSource): Promise<void> {
  let hasLocalRepo = true;
  try {
    await access(source.path);
    await access(`${source.path}/.git`);
  } catch {
    hasLocalRepo = false;
  }

  if (!hasLocalRepo) {
    await mkdir(dirname(source.path), { recursive: true });
    await runGit(source, ["clone", "--depth=1", "--branch", source.defaultBranch, source.remoteUrl, source.path]);
    return;
  }

  if (env.syncReposOnIngest) {
    await runGit(source, ["-C", source.path, "fetch", "origin", source.defaultBranch, "--depth=1"]);
    await runGit(source, ["-C", source.path, "checkout", source.defaultBranch]);
    await runGit(source, ["-C", source.path, "pull", "--ff-only", "origin", source.defaultBranch]);
  }
}

export async function parseRepo(source: RepoSource): Promise<ParsedRepoData> {
  await ensureRepoAvailable(source);

  const commit = await execFileText("git", ["-C", source.path, "rev-parse", "HEAD"]);

  let docs: DocRecord[] = [];
  let endpoints: ApiEndpointRecord[] = [];
  let commands: CliCommandRecord[] = [];

  if (source.includeMarkdown) {
    docs = await extractMarkdownDocs({
      product: source.product,
      repoName: source.name,
      repoPath: source.path,
      commit
    });
  }

  if (source.includeRoutes) {
    const routeData = await extractExpressRoutes({
      product: source.product,
      repoName: source.name,
      repoPath: source.path,
      commit
    });
    endpoints = routeData.endpoints;
    docs = docs.concat(routeData.docs);
  }

  if (source.includeCli) {
    const cliData = await extractCliCommands({
      product: source.product,
      repoName: source.name,
      repoPath: source.path,
      commit
    });
    commands = cliData.commands;
    docs = docs.concat(cliData.docs);
  }

  if (source.includeSdkExports) {
    docs = docs.concat(
      extractSdkExports({
        product: source.product,
        repoName: source.name,
        repoPath: source.path,
        commit
      })
    );
  }

  // Ensure deterministic unique docs by slug.
  const dedupedDocs = Array.from(new Map(docs.map((doc) => [doc.slug, doc])).values());

  return {
    docs: dedupedDocs,
    endpoints,
    commands,
    commit
  };
}

export function toRunResult(repoName: string, parsed: ParsedRepoData): IngestRunResult {
  return {
    repoName,
    commit: parsed.commit,
    status: "success",
    docsCount: parsed.docs.length,
    endpointsCount: parsed.endpoints.length,
    commandsCount: parsed.commands.length,
    warnings: []
  };
}
