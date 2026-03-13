import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNav, type NavResponse } from "../api/docs-api";
import { getProductLabel } from "../content/product-meta";

export function HomePage(): JSX.Element {
  const [nav, setNav] = useState<NavResponse | null>(null);

  useEffect(() => {
    document.title = "RickyData Docs";
    getNav().then(setNav).catch(() => setNav({ products: [] }));
  }, []);

  const products = nav?.products || [];

  return (
    <div className="page">
      <section className="hero hero-home">
        <p className="eyebrow">Public Docs</p>
        <h1>Production docs for MCP&nbsp;onboarding, wallet&nbsp;controls, and agent&nbsp;operations</h1>
        <p className="lead">
          Journey-first documentation for real users: install once, authenticate once, discover and use MCP servers,
          then scale into agents, wallet policy, and workflow automation.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/quickstart">Get Started</Link>
          <Link className="btn btn-secondary" to="/playbooks">Browse Playbooks</Link>
        </div>
      </section>

      <section className="quickstart-strip">
        <h2>Three commands to working MCP</h2>
        <div className="quickstart-steps">
          <div className="quickstart-step">
            <span className="step-number">1</span>
            <div className="step-body">
              <span className="step-label">Install CLI</span>
              <code>npm install -g rickydata</code>
            </div>
          </div>
          <div className="quickstart-step">
            <span className="step-number">2</span>
            <div className="step-body">
              <span className="step-label">Authenticate + connect</span>
              <code>rickydata init</code>
            </div>
          </div>
          <div className="quickstart-step">
            <span className="step-number">3</span>
            <div className="step-body">
              <span className="step-label">Discover and enable servers</span>
              <code>rickydata mcp search "brave"</code>
            </div>
          </div>
        </div>
      </section>

      <section className="journey-section">
        <h2 className="section-heading">Choose your journey</h2>
        <div className="journey-grid">
          <article className="journey-card journey-card-featured">
            <h3>CLI + Claude setup</h3>
            <p>Install CLI, authenticate, connect gateway, verify MCP tools. The recommended starting point for new users.</p>
            <Link to="/playbooks#local-mcp-setup">Start here</Link>
          </article>
          <article className="journey-card">
            <h3>MCP server runtime</h3>
            <p>Search, enable, call tools, then disable and audit active servers.</p>
            <Link to="/playbooks#mcp-runtime">Open journey</Link>
          </article>
          <article className="journey-card">
            <h3>Wallet + policy</h3>
            <p>Funding, Base-network safety, retention, budgets, self-improvement.</p>
            <Link to="/playbooks#wallet-controls">Open journey</Link>
          </article>
          <article className="journey-card">
            <h3>Agents + canvas</h3>
            <p>BYOK chat, agent-as-MCP, and workflow execution through canvas.</p>
            <Link to="/playbooks#agent-chat">Open journey</Link>
          </article>
        </div>
      </section>

      {products.length > 0 && (
        <section className="products-section">
          <h2 className="section-heading">Product reference</h2>
          <div className="card-grid">
            {products.map((product, i) => (
              <article className={`card${i === 0 ? " card-featured" : ""}`} key={product.product}>
                <h2>{getProductLabel(product.product)}</h2>
                <p>{product.total} pages</p>
                <Link to={`/products/${encodeURIComponent(product.product)}`}>Open product hub</Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="resources-section">
        <h2 className="section-heading">Resources</h2>
        <div className="quick-links-grid">
          <Link className="quick-link-item" to="/changelog">
            <span className="quick-link-title">Changelog</span>
            <span className="quick-link-meta">Release notes from all source repos</span>
          </Link>
          <Link className="quick-link-item" to="/versions">
            <span className="quick-link-title">Version Matrix</span>
            <span className="quick-link-meta">Ingestion status across repos</span>
          </Link>
          <Link className="quick-link-item" to="/search">
            <span className="quick-link-title">Search All Docs</span>
            <span className="quick-link-meta">Full-text search across all indexed pages</span>
          </Link>
          <a className="quick-link-item" href="/llms.txt">
            <span className="quick-link-title">llms.txt</span>
            <span className="quick-link-meta">Machine-readable docs index</span>
          </a>
        </div>
      </section>
    </div>
  );
}
