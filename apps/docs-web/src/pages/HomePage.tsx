import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNav, type NavResponse } from "../api/docs-api";

export function HomePage(): JSX.Element {
  const [nav, setNav] = useState<NavResponse | null>(null);

  useEffect(() => {
    getNav().then(setNav).catch(() => setNav({ products: [] }));
  }, []);

  return (
    <div className="page">
      <h1>RickyData Documentation</h1>
      <p>
        Independent docs platform for MCP marketplace, SDK, agent infrastructure, and supporting services.
      </p>

      <div className="card-grid">
        {(nav?.products || []).map((product) => (
          <article className="card" key={product.product}>
            <h2>{product.product}</h2>
            <p>{product.total} pages</p>
            <Link to={`/search?q=&section=${encodeURIComponent(product.product)}`}>Browse section</Link>
          </article>
        ))}
      </div>

      <section className="quick-links">
        <h3>Start Here</h3>
        <ul>
          <li><Link to="/search?q=get+started">Get started guides</Link></li>
          <li><Link to="/search?q=api&type=api">API references</Link></li>
          <li><Link to="/search?q=cli&type=cli">CLI command docs</Link></li>
          <li><Link to="/changelog">Latest release notes</Link></li>
        </ul>
      </section>
    </div>
  );
}
