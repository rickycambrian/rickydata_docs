import { type FormEvent, type PropsWithChildren, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getNav, type NavResponse } from "../api/docs-api";
import { getProductLabel } from "../content/product-meta";

export function Layout({ children }: PropsWithChildren): JSX.Element {
  const [nav, setNav] = useState<NavResponse | null>(null);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    getNav().then(setNav).catch(() => setNav({ products: [] }));
  }, []);

  useEffect(() => {
    if (location.pathname === "/search") {
      setSearch(searchParams.get("q") || "");
    }
  }, [location.pathname, searchParams]);

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    const q = search.trim();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  const topLinks = [
    { href: "/quickstart", label: "Quickstart" },
    { href: "/playbooks", label: "Playbooks" },
    { href: "/changelog", label: "Changelog" },
    { href: "/versions", label: "Version Matrix" },
    { href: "/llms.txt", label: "llms.txt", external: true }
  ];

  return (
    <div className="layout-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">MCP Marketplace Docs</Link>
          <nav className="top-links">
            {topLinks.map((item) => (
              item.external ? (
                <a key={item.href} href={item.href}>{item.label}</a>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={location.pathname === item.href ? "active" : undefined}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>
          <form className="search-form" onSubmit={onSubmit}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search setup, commands, API docs..."
            />
          </form>
        </div>
      </header>

      <div className="content-shell">
        <aside className="sidebar">
          <section className="sidebar-section">
            <h3>Start Here</h3>
            <ul className="sidebar-links">
              <li><Link to="/quickstart">CLI + MCP Quickstart</Link></li>
              <li><Link to="/playbooks">Operational Playbooks</Link></li>
              <li><Link to="/docs/sdk-readme">SDK + CLI Reference</Link></li>
              <li><a href="/quickstart">Featured Setup Video</a></li>
            </ul>
          </section>

          <section className="sidebar-section">
            <h3>Primary Journeys</h3>
            <ul className="sidebar-links">
              <li><a href="/playbooks#local-mcp-setup">Local MCP setup</a></li>
              <li><a href="/playbooks#mcp-runtime">MCP runtime loop</a></li>
              <li><a href="/playbooks#wallet-controls">Wallet + safety controls</a></li>
              <li><a href="/playbooks#agent-chat">Agent chat (BYOK)</a></li>
              <li><a href="/playbooks#agent-as-mcp">Agent as MCP endpoint</a></li>
              <li><a href="/playbooks#canvas">Canvas workflows</a></li>
            </ul>
          </section>

          <section className="sidebar-section">
            <h3>Reference Hubs</h3>
            <ul>
              {nav?.products.map((product) => (
                <li key={product.product} className="product-item">
                  <Link to={`/products/${encodeURIComponent(product.product)}`}>
                    {getProductLabel(product.product)} ({product.total})
                  </Link>
                  <div className="sidebar-meta">
                    {product.types.map((type) => (
                      <span key={type.docType}>{type.docType}: {type.count}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="sidebar-section">
            <h3>Agent Access</h3>
            <ul className="sidebar-links">
              <li><a href="/llms.txt">Global llms prompt</a></li>
              <li><a href="/playbooks#agent-chat">Agent quickstarts</a></li>
              <li><a href="/playbooks#canvas">Canvas workflows</a></li>
            </ul>
          </section>
        </aside>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
