import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVersionMatrix, type VersionMatrixResponse } from "../api/docs-api";

export function VersionMatrixPage(): JSX.Element {
  const [data, setData] = useState<VersionMatrixResponse | null>(null);

  useEffect(() => {
    document.title = "Version Matrix — RickyData Docs";
    getVersionMatrix().then(setData).catch(() => setData({ rows: [] }));
  }, []);

  return (
    <div className="page">
      <section className="hero hero-compact">
        <p className="eyebrow">System Status</p>
        <h1>Version Matrix</h1>
        <p className="lead">
          This matrix shows the latest ingestion snapshot from each source repository.
          Docs are automatically parsed and indexed whenever source repos update.
        </p>
      </section>

      <table className="matrix-table">
        <thead>
          <tr>
            <th>Repo</th>
            <th>Latest Commit</th>
            <th>Docs</th>
            <th>Endpoints</th>
            <th>Commands</th>
            <th>Last Ingested</th>
          </tr>
        </thead>
        <tbody>
          {data?.rows.map((row) => (
            <tr key={row.repo}>
              <td>{row.repo}</td>
              <td><code>{row.latestIngestedCommit?.slice(0, 12) || "-"}</code></td>
              <td>{row.docs}</td>
              <td>{row.endpoints}</td>
              <td>{row.commands}</td>
              <td>{row.lastIngestedAt ? new Date(row.lastIngestedAt).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="see-also">
        <h3>See also</h3>
        <ul className="see-also-links">
          <li><Link to="/changelog">Changelog</Link></li>
          <li><Link to="/products/marketplace">MCP Marketplace Platform</Link></li>
          <li><Link to="/products/sdk">RickyData SDK + CLI</Link></li>
          <li><Link to="/products/mcp-server">RickyData MCP Server</Link></li>
        </ul>
      </section>
    </div>
  );
}
