import fg from "fast-glob";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { marked } from "marked";
import type { DocProduct, DocRecord } from "@rickydata-docs/shared-types";
import { inferDocType } from "../utils/doc-type.js";
import { slugFromPath } from "../utils/slug.js";

function extractTitle(markdown: string, fallback: string): string {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) return heading;
  return fallback;
}

function extractSummary(markdown: string): string {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#") && !line.startsWith("```"));
  return (lines[0] || "").slice(0, 240);
}

export type MarkdownExtractParams = {
  product: DocProduct;
  repoName: string;
  repoPath: string;
  commit: string;
};

export async function extractMarkdownDocs(params: MarkdownExtractParams): Promise<DocRecord[]> {
  const patterns = ["README.md", "docs/**/*.md", "**/*.mdx"];
  const files = await fg(patterns, {
    cwd: params.repoPath,
    onlyFiles: true,
    unique: true,
    ignore: [
      "node_modules/**",
      "dist/**",
      "dist-package/**",
      ".git/**",
      "daily_development/**",
      "security-audit/**"
    ]
  });

  const docs: DocRecord[] = [];
  for (const file of files) {
    const absolutePath = `${params.repoPath}/${file}`;
    const bodyMd = readFileSync(absolutePath, "utf8");
    const fileNameTitle = file
      .split("/")
      .pop()
      ?.replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || file;

    const title = extractTitle(bodyMd, fileNameTitle);
    const summary = extractSummary(bodyMd);
    const bodyHtml = await marked.parse(bodyMd);
    const relativePath = relative(params.repoPath, absolutePath);

    docs.push({
      product: params.product,
      docType: inferDocType(relativePath),
      slug: slugFromPath(params.product, relativePath),
      title,
      summary,
      bodyMd,
      bodyHtml,
      tags: [],
      sourceRepo: params.repoName,
      sourcePath: relativePath,
      sourceCommit: params.commit,
      published: true
    });
  }

  return docs;
}
