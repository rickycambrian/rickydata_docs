import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getChangelog, type ChangelogResponse } from "../api/docs-api";

export function ChangelogPage(): JSX.Element {
  const [data, setData] = useState<ChangelogResponse | null>(null);

  useEffect(() => {
    document.title = "Changelog — RickyData Docs";
    getChangelog().then(setData).catch(() => setData({ total: 0, items: [] }));
  }, []);

  return (
    <div className="page">
      <section className="hero hero-compact">
        <h1>Changelog</h1>
        <p className="lead">
          Release notes automatically ingested from all source repositories.
          Each entry links to the full release doc with structured metadata and llms.txt export.
        </p>
        <p className="muted">{data?.total ?? 0} release-note pages indexed.</p>
      </section>

      {data?.items.length === 0 ? (
        <div className="search-empty">
          <p>No release notes indexed yet.</p>
          <small>Release notes are automatically ingested from source repositories when new versions are published.</small>
        </div>
      ) : (
        <ul className="result-list">
          {data?.items.map((item) => (
            <li key={item.slug}>
              <div className="result-head">
                <Link to={`/docs/${item.slug}`}>{item.title}</Link>
                <a href={`/docs/${item.slug}/llms.txt`}>llms.txt</a>
              </div>
              <p>{item.summary}</p>
              <small>{item.product} · {new Date(item.updatedAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}

      <section className="see-also">
        <h3>See also</h3>
        <ul className="see-also-links">
          <li><Link to="/versions">Version Matrix</Link></li>
          <li><Link to="/playbooks">Playbooks</Link></li>
          <li><Link to="/products/marketplace">MCP Marketplace Platform</Link></li>
          <li><Link to="/products/sdk">RickyData SDK + CLI</Link></li>
          <li><Link to="/products/mcp-server">RickyData MCP Server</Link></li>
        </ul>
      </section>
    </div>
  );
}
