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
      <a
        href="#main-content"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          zIndex: 100,
        }}
        onFocus={(e) => {
          e.currentTarget.style.position = "fixed";
          e.currentTarget.style.left = "1rem";
          e.currentTarget.style.top = "0.5rem";
          e.currentTarget.style.width = "auto";
          e.currentTarget.style.height = "auto";
          e.currentTarget.style.overflow = "visible";
          e.currentTarget.style.padding = "0.5rem 1rem";
          e.currentTarget.style.background = "var(--accent)";
          e.currentTarget.style.color = "oklch(18% 0.02 70)";
          e.currentTarget.style.borderRadius = "var(--radius-sm)";
          e.currentTarget.style.fontWeight = "600";
          e.currentTarget.style.fontSize = "0.875rem";
          e.currentTarget.style.textDecoration = "none";
        }}
        onBlur={(e) => {
          e.currentTarget.style.position = "absolute";
          e.currentTarget.style.left = "-9999px";
          e.currentTarget.style.width = "1px";
          e.currentTarget.style.height = "1px";
          e.currentTarget.style.overflow = "hidden";
        }}
      >
        Skip to main content
      </a>

      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">RickyData Docs</Link>
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
            <h3>Navigate</h3>
            <ul className="sidebar-links">
              <li><Link to="/quickstart">Quickstart</Link></li>
              <li><Link to="/playbooks">Playbooks</Link></li>
              <li><Link to="/docs/sdk-readme">SDK + CLI Reference</Link></li>
              <li><Link to="/docs/sdk-docs-kfdb-getting-started">KFDB Scope Guide</Link></li>
              <li><Link to="/changelog">Changelog</Link></li>
              <li><Link to="/search">Search All Docs</Link></li>
              <li><Link to="/versions">Version Matrix</Link></li>
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
        </aside>
        <main id="main-content" className="main-content">{children}</main>
      </div>
    </div>
  );
}
