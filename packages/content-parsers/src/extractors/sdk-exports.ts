import { readFileSync } from "node:fs";
import type { DocProduct, DocRecord } from "@rickydata-docs/shared-types";
import { slugify } from "../utils/slug.js";

const EXPORT_REGEX = /^export\s+(?:\{[^}]+\}|type\s+\{[^}]+\}|class\s+\w+|function\s+\w+)/gm;

export type SdkExportExtractParams = {
  product: DocProduct;
  repoName: string;
  repoPath: string;
  commit: string;
  entryFile?: string;
};

export function extractSdkExports(params: SdkExportExtractParams): DocRecord[] {
  const entry = params.entryFile || "src/index.ts";
  const fullPath = `${params.repoPath}/${entry}`;

  let content = "";
  try {
    content = readFileSync(fullPath, "utf8");
  } catch {
    return [];
  }

  const exports = [...content.matchAll(EXPORT_REGEX)].map((match) => match[0].trim());
  if (exports.length === 0) {
    return [];
  }

  const bodyMd = [
    "# SDK Export Surface",
    "",
    "This page is auto-generated from the SDK entrypoint exports.",
    "",
    "## Exports",
    "",
    ...exports.map((line) => `- \`${line}\``),
    "",
    `Source: \`${entry}\``
  ].join("\n");

  return [
    {
      product: params.product,
      docType: "api",
      slug: slugify(`${params.product}-sdk-exports`),
      title: "SDK Export Surface",
      summary: `Auto-generated list of exported SDK modules (${exports.length})`,
      bodyMd,
      bodyHtml: bodyMd,
      tags: ["api", "sdk"],
      sourceRepo: params.repoName,
      sourcePath: entry,
      sourceCommit: params.commit,
      published: true
    }
  ];
}
