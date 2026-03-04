import { type FormEvent, type PropsWithChildren, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getNav, type NavResponse } from "../api/docs-api";

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

  return (
    <div className="layout-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">RickyData Docs</Link>
          <nav className="top-links">
            <Link to="/changelog">Changelog</Link>
            <Link to="/versions">Version Matrix</Link>
          </nav>
          <form className="search-form" onSubmit={onSubmit}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search docs"
            />
          </form>
        </div>
      </header>

      <div className="content-shell">
        <aside className="sidebar">
          <h3>Products</h3>
          <ul>
            {nav?.products.map((product) => (
              <li key={product.product}>
                <Link to={`/search?q=&section=${encodeURIComponent(product.product)}`}>
                  {product.product} ({product.total})
                </Link>
                <div className="sidebar-meta">
                  {product.types.map((type) => (
                    <span key={type.docType}>{type.docType}: {type.count}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </aside>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
