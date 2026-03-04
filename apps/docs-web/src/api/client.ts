const API_BASE = (import.meta.env.VITE_DOCS_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8080";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}
