import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getChangelog, type ChangelogResponse } from "../api/docs-api";

export function ChangelogPage(): JSX.Element {
  const [data, setData] = useState<ChangelogResponse | null>(null);

  useEffect(() => {
    getChangelog().then(setData).catch(() => setData({ total: 0, items: [] }));
  }, []);

  return (
    <div className="page">
      <h1>Changelog</h1>
      <p>{data?.total ?? 0} release-note pages indexed.</p>
      <ul className="result-list">
        {data?.items.map((item) => (
          <li key={item.slug}>
            <Link to={`/docs/${item.slug}`}>{item.title}</Link>
            <p>{item.summary}</p>
            <small>{item.product} · {new Date(item.updatedAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
