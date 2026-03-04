import fg from "fast-glob";
import { readFileSync } from "node:fs";
import type { ApiEndpointRecord, DocProduct, DocRecord } from "@rickydata-docs/shared-types";
import { slugify } from "../utils/slug.js";

const ROUTE_REGEX = /(app|router)\.(get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]/g;
const AUTH_HINT_REGEX = /(requireAuth|optionalAuth|authMiddleware|Authorization)/i;

export type RouteExtractParams = {
  product: DocProduct;
  repoName: string;
  repoPath: string;
  commit: string;
};

function serviceNameFromPath(path: string): string {
  const parts = path.split("/");
  if (parts.includes("routes")) {
    return parts[parts.indexOf("routes") + 1]?.replace(/\.[jt]s$/, "") || "routes";
  }
  return parts[parts.length - 1]?.replace(/\.[jt]s$/, "") || "service";
}

function buildCurlExample(path: string, method: string): string {
  const upper = method.toUpperCase();
  if (upper === "GET") {
    return `curl -X GET \"$BASE_URL${path}\"`;
  }
  return `curl -X ${upper} \"$BASE_URL${path}\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{}'`;
}

export async function extractExpressRoutes(params: RouteExtractParams): Promise<{ endpoints: ApiEndpointRecord[]; docs: DocRecord[] }> {
  const files = await fg(["**/*.ts", "**/*.js"], {
    cwd: params.repoPath,
    onlyFiles: true,
    ignore: [
      "node_modules/**",
      "dist/**",
      "dist-package/**",
      ".git/**",
      "**/*.test.*",
      "**/*.spec.*"
    ]
  });

  const endpoints: ApiEndpointRecord[] = [];
  const docs: DocRecord[] = [];

  for (const file of files) {
    if (!file.includes("route") && !file.includes("index") && !file.includes("src/")) {
      continue;
    }

    const content = readFileSync(`${params.repoPath}/${file}`, "utf8");
    const authMode = AUTH_HINT_REGEX.test(content) ? "auth-or-conditional" : "public-or-unknown";

    let match: RegExpExecArray | null;
    while ((match = ROUTE_REGEX.exec(content)) !== null) {
      const method = match[2]?.toUpperCase() || "GET";
      const routePath = match[3] || "/";
      const service = serviceNameFromPath(file);

      const endpoint: ApiEndpointRecord = {
        product: params.product,
        service,
        method,
        path: routePath,
        authMode,
        requestSchema: {},
        responseSchema: {},
        examples: [buildCurlExample(routePath, method)],
        sourceRepo: params.repoName,
        sourcePath: file,
        sourceCommit: params.commit
      };

      endpoints.push(endpoint);

      const slug = slugify(`${params.product}-api-${method}-${routePath}`);
      const title = `${method} ${routePath}`;
      const bodyMd = [
        `# ${title}`,
        "",
        `- Product: \`${params.product}\``,
        `- Service: \`${service}\``,
        `- Auth: \`${authMode}\``,
        "",
        "## cURL",
        "",
        "```bash",
        buildCurlExample(routePath, method),
        "```",
        "",
        `Source: \`${file}\``
      ].join("\n");

      docs.push({
        product: params.product,
        docType: "api",
        slug,
        title,
        summary: `API endpoint for ${service}`,
        bodyMd,
        bodyHtml: bodyMd,
        tags: ["api", method.toLowerCase()],
        sourceRepo: params.repoName,
        sourcePath: file,
        sourceCommit: params.commit,
        published: true
      });
    }
  }

  return { endpoints, docs };
}
