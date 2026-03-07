import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct, type ProductDocItem, type ProductPageResponse } from "../api/docs-api";
import { getProductMeta } from "../content/product-meta";

function ProductSection(props: { title: string; subtitle: string; items: ProductDocItem[]; empty: string }): JSX.Element {
  return (
    <section className="product-section">
      <div className="product-section-head">
        <h2>{props.title}</h2>
        <p className="muted">{props.subtitle}</p>
      </div>

      {props.items.length === 0 ? (
        <p className="muted">{props.empty}</p>
      ) : (
        <ul className="result-list">
          {props.items.map((item) => (
            <li key={`${props.title}-${item.slug}`}>
              <div className="result-head">
                <Link to={`/docs/${item.slug}`}>{item.title}</Link>
                <a href={`/docs/${item.slug}/llms.txt`}>llms.txt</a>
              </div>
              <p>{item.summary}</p>
              <small>{item.docType} · {new Date(item.updatedAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ProductPage(): JSX.Element {
  const { product } = useParams();
  const [data, setData] = useState<ProductPageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    getProduct(product)
      .then((result) => {
        setData(result);
        setError(null);
        const label = getProductMeta(product)?.label || product;
        document.title = `${label} — RickyData Docs`;
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load product docs");
      });
  }, [product]);

  const productMeta = useMemo(() => {
    if (!product) return undefined;
    return getProductMeta(product);
  }, [product]);

  if (error) {
    return <div className="page"><p className="error">{error}</p></div>;
  }

  if (!data) {
    return <div className="page"><p>Loading product documentation...</p></div>;
  }

  return (
    <div className="page">
      <section className="product-hero">
        <p className="eyebrow">Product Hub</p>
        <h1>{productMeta?.label || data.product}</h1>
        <p className="lead">{productMeta?.description || "Structured product documentation for this domain."}</p>
        <div className="type-chip-row">
          {data.types.map((type) => (
            <span key={type.docType} className="pill">{type.docType}: {type.count}</span>
          ))}
          <span className="pill">total: {data.total}</span>
          <a className="pill-link" href={`/search?section=${encodeURIComponent(data.product)}&q=`}>advanced search</a>
          <Link className="pill-link" to="/playbooks">playbooks</Link>
        </div>
      </section>

      <div className="product-sections">
        <ProductSection
          title="Start Here"
          subtitle="Curated docs to understand this product fast."
          items={data.sections.startHere}
          empty="No start-here docs indexed yet."
        />

        <ProductSection
          title="Guides"
          subtitle="Conceptual docs and implementation walkthroughs."
          items={data.sections.guides}
          empty="No guide docs indexed yet."
        />

        <ProductSection
          title="API Reference"
          subtitle="Endpoint-level documentation and contracts."
          items={data.sections.api}
          empty="No API docs indexed yet."
        />

        <ProductSection
          title="CLI Reference"
          subtitle="Command-level docs for terminal workflows."
          items={data.sections.cli}
          empty="No CLI docs indexed yet."
        />

        <ProductSection
          title="Architecture"
          subtitle="System-level architecture and operational internals."
          items={data.sections.architecture}
          empty="No architecture docs indexed yet."
        />

        <ProductSection
          title="Recent Updates"
          subtitle="Most recently updated pages for this product."
          items={data.sections.recent}
          empty="No recently updated docs found."
        />

        <ProductSection
          title="Other References"
          subtitle="Additional indexed docs that do not fit guide/API/CLI/architecture buckets."
          items={data.sections.references}
          empty="No additional reference docs."
        />
      </div>
    </div>
  );
}
