import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchDocs, type SearchResponse } from "../api/docs-api";

const GROUP_LABELS: Record<string, string> = {
  guide: "Guides",
  architecture: "Architecture",
  cli: "CLI Reference",
  api: "API Reference",
  security: "Security",
  workflow: "Workflows",
  "release-note": "Release Notes",
  other: "Other",
};

function groupWeight(groupName: string): "primary" | "reference" | "default" {
  if (groupName === "guide" || groupName === "architecture") return "primary";
  if (groupName === "cli" || groupName === "api") return "reference";
  return "default";
}

export function SearchPage(): JSX.Element {
  const [params] = useSearchParams();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = params.get("q") || "";
  const section = params.get("section") || undefined;
  const type = params.get("type") || undefined;
  const broadSectionSearch = q.trim().length === 0 && Boolean(section);

  const grouped = (data?.items || []).reduce<Record<string, SearchResponse["items"]>>((acc, item) => {
    const key = item.docType || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const groupOrder = ["guide", "architecture", "cli", "api", "security", "workflow", "release-note", "other"];
  const orderedGroups = Object.entries(grouped).sort((a, b) => {
    const ai = groupOrder.indexOf(a[0]);
    const bi = groupOrder.indexOf(b[0]);
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a[0].localeCompare(b[0]);
  });

  useEffect(() => {
    document.title = q ? `Search: ${q} — RickyData Docs` : "Search — RickyData Docs";
    searchDocs(q, section, type)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Search failed");
      });
  }, [q, section, type]);

  return (
    <div className="page search-page">
      <h1>Advanced Search</h1>
      {(section || type) && (
        <div className="filter-row">
          {section && <span className="pill filter-pill">{section}</span>}
          {type && <span className="pill filter-pill">{type}</span>}
          <Link className="pill-link" to="/search">Clear filters</Link>
        </div>
      )}
      {broadSectionSearch && (
        <div className="prompt-callout">
          <p className="muted">
            Browsing a broad section view. For structured onboarding, try the product hub:
          </p>
          <p>
            <Link to={`/products/${encodeURIComponent(section || "")}`}>Open {section} product hub</Link>
          </p>
        </div>
      )}
      {error && <p className="error">{error}</p>}

      <p className="search-results-count">{data?.total ?? 0} results</p>

      {orderedGroups.length === 0 && data && (
        <div className="search-empty">
          <p>No results found{q ? ` for "${q}"` : ""}.</p>
          <small>Try broadening your search or removing filters.</small>
        </div>
      )}

      {orderedGroups.map(([groupName, items]) => {
        const weight = groupWeight(groupName);
        return (
          <section key={groupName} className={`search-group search-group--${weight}`}>
            <div className="search-group-head">
              <h2>{GROUP_LABELS[groupName] || groupName}</h2>
              <span className="search-group-count">{items.length}</span>
            </div>
            <ul className="result-list">
              {items.map((item) => (
                <li key={item.slug}>
                  <div className="result-head">
                    <Link to={`/docs/${item.slug}`}>{item.title}</Link>
                    <a href={`/docs/${item.slug}/llms.txt`}>llms.txt</a>
                  </div>
                  <p>{item.summary}</p>
                  <small>
                    {item.product} · {new Date(item.updatedAt).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
