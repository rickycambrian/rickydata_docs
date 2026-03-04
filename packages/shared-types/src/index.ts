import { z } from "zod";

export const docProductSchema = z.enum([
  "marketplace",
  "sdk",
  "mcp-server",
  "serverless",
  "canvas"
]);

export const docTypeSchema = z.enum([
  "guide",
  "api",
  "cli",
  "architecture",
  "security",
  "workflow",
  "release-note"
]);

export const ingestStatusSchema = z.enum(["pending", "running", "success", "failed"]);

export const docRecordSchema = z.object({
  product: docProductSchema,
  docType: docTypeSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().default(""),
  bodyMd: z.string(),
  bodyHtml: z.string(),
  tags: z.array(z.string()).default([]),
  sourceRepo: z.string().min(1),
  sourcePath: z.string().min(1),
  sourceCommit: z.string().min(1),
  published: z.boolean().default(true)
});

export const apiEndpointRecordSchema = z.object({
  product: docProductSchema,
  service: z.string().min(1),
  method: z.string().min(1),
  path: z.string().min(1),
  authMode: z.string().default("unknown"),
  requestSchema: z.record(z.any()).optional(),
  responseSchema: z.record(z.any()).optional(),
  examples: z.array(z.string()).default([]),
  sourceRepo: z.string().min(1),
  sourcePath: z.string().min(1),
  sourceCommit: z.string().min(1)
});

export const cliCommandRecordSchema = z.object({
  product: docProductSchema,
  command: z.string().min(1),
  description: z.string().default(""),
  options: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  sourceRepo: z.string().min(1),
  sourcePath: z.string().min(1),
  sourceCommit: z.string().min(1)
});

export const ingestRunResultSchema = z.object({
  repoName: z.string(),
  commit: z.string(),
  status: ingestStatusSchema,
  docsCount: z.number(),
  endpointsCount: z.number(),
  commandsCount: z.number(),
  warnings: z.array(z.string()).default([]),
  error: z.string().optional()
});

export type DocProduct = z.infer<typeof docProductSchema>;
export type DocType = z.infer<typeof docTypeSchema>;
export type DocRecord = z.infer<typeof docRecordSchema>;
export type ApiEndpointRecord = z.infer<typeof apiEndpointRecordSchema>;
export type CliCommandRecord = z.infer<typeof cliCommandRecordSchema>;
export type IngestStatus = z.infer<typeof ingestStatusSchema>;
export type IngestRunResult = z.infer<typeof ingestRunResultSchema>;

export type VersionMatrixRow = {
  repo: string;
  latestIngestedCommit: string | null;
  docs: number;
  endpoints: number;
  commands: number;
  lastIngestedAt: string | null;
};

export type PublicDocListItem = {
  slug: string;
  title: string;
  summary: string;
  product: DocProduct;
  docType: DocType;
  updatedAt: string;
};

export type SearchResponse = {
  query: string;
  total: number;
  items: PublicDocListItem[];
};

export const DEFAULT_DOC_TAGS = {
  architecture: ["architecture"],
  security: ["security"],
  workflow: ["workflow"],
  guide: ["guide"],
  api: ["api"],
  cli: ["cli"],
  "release-note": ["release-note"]
} as const;
