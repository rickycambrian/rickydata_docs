import fg from "fast-glob";
import { readFileSync } from "node:fs";
import type { CliCommandRecord, DocProduct, DocRecord } from "@rickydata-docs/shared-types";
import { slugify } from "../utils/slug.js";

const COMMAND_REGEX = /\.command\(\s*["'`]([^"'`]+)["'`]/g;
const DESCRIPTION_REGEX = /\.description\(\s*["'`]([^"'`]+)["'`]/g;

export type CliExtractParams = {
  product: DocProduct;
  repoName: string;
  repoPath: string;
  commit: string;
};

export async function extractCliCommands(params: CliExtractParams): Promise<{ commands: CliCommandRecord[]; docs: DocRecord[] }> {
  const files = await fg(["src/cli/**/*.ts"], {
    cwd: params.repoPath,
    onlyFiles: true,
    unique: true
  });

  const commands: CliCommandRecord[] = [];
  const docs: DocRecord[] = [];

  for (const file of files) {
    const content = readFileSync(`${params.repoPath}/${file}`, "utf8");

    const descriptions: string[] = [];
    let dMatch: RegExpExecArray | null;
    while ((dMatch = DESCRIPTION_REGEX.exec(content)) !== null) {
      descriptions.push(dMatch[1] || "");
    }

    let cMatch: RegExpExecArray | null;
    let idx = 0;
    while ((cMatch = COMMAND_REGEX.exec(content)) !== null) {
      const command = cMatch[1] || "";
      const description = descriptions[idx] || "";
      idx += 1;

      const record: CliCommandRecord = {
        product: params.product,
        command,
        description,
        options: [],
        examples: [`rickydata ${command}`],
        sourceRepo: params.repoName,
        sourcePath: file,
        sourceCommit: params.commit
      };
      commands.push(record);

      const slug = slugify(`${params.product}-cli-${command}`);
      const bodyMd = [
        `# CLI: ${command}`,
        "",
        description || "No description available.",
        "",
        "## Example",
        "",
        "```bash",
        `rickydata ${command}`,
        "```",
        "",
        `Source: \`${file}\``
      ].join("\n");

      docs.push({
        product: params.product,
        docType: "cli",
        slug,
        title: `CLI: ${command}`,
        summary: description,
        bodyMd,
        bodyHtml: bodyMd,
        tags: ["cli"],
        sourceRepo: params.repoName,
        sourcePath: file,
        sourceCommit: params.commit,
        published: true
      });
    }
  }

  return { commands, docs };
}
