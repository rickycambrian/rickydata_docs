import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNav, type NavResponse } from "../api/docs-api";
import { getProductLabel } from "../content/product-meta";

export function HomePage(): JSX.Element {
  const [nav, setNav] = useState<NavResponse | null>(null);

  useEffect(() => {
    getNav().then(setNav).catch(() => setNav({ products: [] }));
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Public Docs</p>
        <h1>Production docs for MCP onboarding, wallet controls, and agent operations</h1>
        <p className="lead">
          Journey-first documentation for real users: install once, authenticate once, discover and use MCP servers,
          then scale into agents, wallet policy, and workflow automation.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/quickstart">Open Quickstart</Link>
          <Link className="btn btn-secondary" to="/playbooks">Open Playbooks</Link>
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
        <h2>Primary user journeys</h2>
        <div className="journey-grid">
          <article className="journey-card">
            <h3>CLI + Claude setup</h3>
            <p>Install CLI, authenticate, connect gateway, verify MCP tools.</p>
            <Link to="/playbooks#local-mcp-setup">Open journey</Link>
          </article>
          <article className="journey-card">
            <h3>MCP server runtime loop</h3>
            <p>Search, enable, call tools, then disable and audit active servers.</p>
            <Link to="/playbooks#mcp-runtime">Open journey</Link>
          </article>
          <article className="journey-card">
            <h3>Wallet + policy controls</h3>
            <p>Funding, Base-network safety, retention, budgets, self-improvement.</p>
            <Link to="/playbooks#wallet-controls">Open journey</Link>
          </article>
          <article className="journey-card">
            <h3>Agents and canvas workflows</h3>
            <p>BYOK chat, agent-as-MCP, and workflow execution through canvas.</p>
            <Link to="/playbooks#agent-chat">Open journey</Link>
          </article>
        </div>
      </section>

      <section className="quickstart-strip">
        <h2>3-step minimum setup</h2>
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
            <h2>{getProductLabel(product.product)}</h2>
            <p>{product.total} pages</p>
            <Link to={`/products/${encodeURIComponent(product.product)}`}>Open product hub</Link>
          </article>
        ))}
      </div>

      <section className="quick-links">
        <h2>Common Journeys</h2>
        <ul>
          <li><Link to="/quickstart">CLI + MCP install and login</Link></li>
          <li><a href="/playbooks#mcp-runtime">MCP search/enable/call/disable runtime loop</a></li>
          <li><a href="/playbooks#wallet-controls">Wallet funding + retention + budgets</a></li>
          <li><a href="/playbooks#agent-chat">Agents quickstart and BYOK</a></li>
          <li><a href="/playbooks#canvas">Canvas workflow docs</a></li>
          <li><a href="/playbooks#marketplace-ui">Marketplace web operations</a></li>
          <li><Link to="/changelog">Latest release notes</Link></li>
        </ul>
      </section>
    </div>
  );
}
