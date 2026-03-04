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
      <section className="hero">
        <p className="eyebrow">Public Docs</p>
        <h1>Discover, enable, and run MCP tools fast</h1>
        <p className="lead">
          Everything needed to install `rickydata`, authenticate once, connect your local agentic client, discover
          marketplace servers, and use both MCP tools and agent workflows.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/quickstart">Open Quickstart</Link>
          <Link className="btn btn-secondary" to="/docs/sdk-readme">SDK + CLI Guide</Link>
          <a className="btn btn-ghost" href="/llms.txt">llms.txt</a>
        </div>
      </section>

      <section className="stats-grid">
        {(nav?.products || []).map((product) => (
          <article className="stat-card" key={product.product}>
            <p className="stat-value">{product.total}</p>
            <p className="stat-label">{product.product}</p>
          </article>
        ))}
      </section>

      <section className="quickstart-strip">
        <h2>3-step setup</h2>
        <ol>
          <li>
            Install CLI:
            <code>npm install -g rickydata</code>
          </li>
          <li>
            Authenticate + connect:
            <code>rickydata init</code>
          </li>
          <li>
            Discover and enable servers:
            <code>rickydata mcp search "brave"</code>
          </li>
        </ol>
      </section>

      <h2>Docs by Product</h2>
      <div className="card-grid">
        {(nav?.products || []).map((product) => (
          <article className="card" key={product.product}>
            <h2>{product.product}</h2>
            <p>{product.total} pages</p>
            <Link to={`/products/${encodeURIComponent(product.product)}`}>Open product hub</Link>
          </article>
        ))}
      </div>

      <section className="quick-links">
        <h2>Common Journeys</h2>
        <ul>
          <li><Link to="/quickstart">CLI + MCP install and login</Link></li>
          <li><Link to="/search?q=mcp+connect&section=sdk">Connect local client to MCP gateway</Link></li>
          <li><Link to="/search?q=agents+chat">Agents quickstart and BYOK</Link></li>
          <li><Link to="/search?q=canvas">Canvas workflow docs</Link></li>
          <li><Link to="/search?q=api&type=api">API references</Link></li>
          <li><Link to="/changelog">Latest release notes</Link></li>
        </ul>
      </section>
    </div>
  );
}
