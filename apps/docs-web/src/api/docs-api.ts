import { apiGet } from "./client";

export type NavResponse = {
  products: Array<{
    product: string;
    total: number;
    types: Array<{ docType: string; count: number }>;
  }>;
};

export type SearchResponse = {
  query: string;
  total: number;
  items: Array<{
    slug: string;
    title: string;
    summary: string;
    product: string;
    docType: string;
    updatedAt: string;
  }>;
};

export type DocResponse = {
  doc: {
    id: number;
    product: string;
    docType: string;
    slug: string;
    title: string;
    summary: string;
    bodyMd: string;
    tags: string[];
    sourceRepo: string;
    sourcePath: string;
    sourceCommit: string;
    updatedAt: string;
  };
  related: Array<{
    slug: string;
    title: string;
    summary: string;
    product: string;
    docType: string;
    updatedAt: string;
  }>;
  endpoints: Array<{
    service: string;
    method: string;
    path: string;
    authMode: string;
    examples: string[];
  }>;
  commands: Array<{
    command: string;
    description: string;
    examples: string[];
  }>;
};

export type ChangelogResponse = {
  total: number;
  items: Array<{
    slug: string;
    title: string;
    summary: string;
    product: string;
    sourceRepo: string;
    sourcePath: string;
    updatedAt: string;
  }>;
};

export type VersionMatrixResponse = {
  rows: Array<{
    repo: string;
    latestIngestedCommit: string | null;
    docs: number;
    endpoints: number;
    commands: number;
    lastIngestedAt: string | null;
  }>;
};

export function getNav(): Promise<NavResponse> {
  return apiGet<NavResponse>("/api/public/nav");
}

export function searchDocs(query: string, section?: string, type?: string): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.set("q", query);
  if (section) params.set("section", section);
  if (type) params.set("type", type);
  params.set("limit", "50");
  return apiGet<SearchResponse>(`/api/public/search?${params.toString()}`);
}

export function getDoc(slug: string): Promise<DocResponse> {
  return apiGet<DocResponse>(`/api/public/docs/${encodeURIComponent(slug)}`);
}

export function getChangelog(product?: string): Promise<ChangelogResponse> {
  const params = new URLSearchParams();
  if (product) params.set("product", product);
  params.set("limit", "100");
  return apiGet<ChangelogResponse>(`/api/public/changelog?${params.toString()}`);
}

export function getVersionMatrix(): Promise<VersionMatrixResponse> {
  return apiGet<VersionMatrixResponse>("/api/public/version-matrix");
}
