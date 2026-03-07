import { useEffect } from "react";
import { Link } from "react-router-dom";

export function NotFoundPage(): JSX.Element {
  useEffect(() => { document.title = "Page Not Found — RickyData Docs"; }, []);
  return (
    <div className="page">
      <section className="hero hero-compact">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="lead">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/">Go to Home</Link>
          <Link className="btn btn-secondary" to="/playbooks">Browse Playbooks</Link>
          <Link className="btn btn-ghost" to="/search">Search Docs</Link>
        </div>
      </section>
    </div>
  );
}
