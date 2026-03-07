import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchDocs, type SearchResponse } from "../api/docs-api";

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
    <div className="page">
      <h1>Advanced Search</h1>
      {(section || type) && (
        <div className="filter-row">
          {section && <span className="pill">section: {section}</span>}
          {type && <span className="pill">type: {type}</span>}
        </div>
      )}
      {broadSectionSearch && (
        <div className="prompt-callout">
          <p className="muted">
            You are browsing a broad section view. For structured onboarding, use the product hub:
          </p>
          <p>
            <Link to={`/products/${encodeURIComponent(section || "")}`}>Open {section} product hub</Link>
          </p>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <p className="muted">{data?.total ?? 0} results</p>

      {orderedGroups.map(([groupName, items]) => (
        <section key={groupName} className="product-section">
          <div className="product-section-head">
            <h2>{groupName}</h2>
            <p className="muted">{items.length} result{items.length === 1 ? "" : "s"}</p>
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
                  {item.product} · {item.docType} · {new Date(item.updatedAt).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
