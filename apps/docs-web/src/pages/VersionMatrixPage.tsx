import { useEffect, useState } from "react";
import { getVersionMatrix, type VersionMatrixResponse } from "../api/docs-api";

export function VersionMatrixPage(): JSX.Element {
  const [data, setData] = useState<VersionMatrixResponse | null>(null);

  useEffect(() => {
    document.title = "Version Matrix — RickyData Docs";
    getVersionMatrix().then(setData).catch(() => setData({ rows: [] }));
  }, []);

  return (
    <div className="page">
      <h1>Version Matrix</h1>
      <p className="muted">Latest ingest snapshot across source repos.</p>
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
    </div>
  );
}
