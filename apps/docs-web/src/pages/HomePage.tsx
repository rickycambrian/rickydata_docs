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
          Install once, authenticate once, then discover and use 5,000+ MCP servers and AI agents.
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
            <h3>Get started</h3>
            <p>Two paths: connect via Claude.ai web chat (no CLI) or install the CLI for full local setup. Pick whichever fits.</p>
            <Link to="/quickstart">Start here</Link>
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

      <section className="resources-strip">
        <span className="muted">Also:</span>
        <Link to="/changelog">Changelog</Link>
        <Link to="/versions">Version Matrix</Link>
        <Link to="/search">Search</Link>
        <a href="/llms.txt">llms.txt</a>
      </section>
    </div>
  );
}
