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

  useEffect(() => {
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
      <h1>Search</h1>
      {(section || type) && (
        <div className="filter-row">
          {section && <span className="pill">section: {section}</span>}
          {type && <span className="pill">type: {type}</span>}
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <p className="muted">{data?.total ?? 0} results</p>

      <ul className="result-list">
        {data?.items.map((item) => (
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
    </div>
  );
}
