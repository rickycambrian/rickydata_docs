import { type ReactNode, isValidElement, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDoc, type DocResponse } from "../api/docs-api";
import { ApiAndCliPanel } from "../components/ApiAndCliPanel";
import { SourceProvenance } from "../components/SourceProvenance";
import { Toc } from "../components/Toc";
import { getProductLabel } from "../content/product-meta";

function toHeadingId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map((entry) => nodeText(entry)).join(" ");
  }
  if (isValidElement(node)) {
    return nodeText(node.props.children as ReactNode);
  }
  return "";
}

export function DocPage(): JSX.Element {
  const { slug } = useParams();
  const [data, setData] = useState<DocResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getDoc(slug)
      .then((result) => {
        setData(result);
        setError(null);
        document.title = `${result.doc.title} — RickyData Docs`;
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load document");
      });
  }, [slug]);

  if (error) {
    return <div className="page"><p className="error">{error}</p></div>;
  }

  if (!data) {
    return <div className="page"><p>Loading document...</p></div>;
  }

  async function copyMarkdown(): Promise<void> {
    try {
      await navigator.clipboard.writeText(data?.doc.bodyMd ?? "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="doc-layout">
      <article className="doc-article">
        <header className="doc-header">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <Link to={`/products/${data.doc.product}`}>{getProductLabel(data.doc.product)}</Link>
            <span>{data.doc.docType}</span>
            <span>{data.doc.title}</span>
          </nav>
          <h1>{data.doc.title}</h1>
          <p className="doc-summary">{data.doc.summary}</p>
          <div className="doc-actions">
            <button type="button" className="ghost-btn" onClick={copyMarkdown}>
              {copied ? "Markdown Copied" : "Copy Full Markdown"}
            </button>
            <a className="ghost-btn" href={`/docs/${data.doc.slug}/llms.txt`}>Open llms.txt</a>
          </div>
        </header>

        <SourceProvenance
          sourceRepo={data.doc.sourceRepo}
          sourcePath={data.doc.sourcePath}
          sourceCommit={data.doc.sourceCommit}
          updatedAt={data.doc.updatedAt}
        />

        <div className="markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => {
                const label = nodeText(children);
                return <h2 id={toHeadingId(label)}>{children}</h2>;
              },
              h3: ({ children }) => {
                const label = nodeText(children);
                return <h3 id={toHeadingId(label)}>{children}</h3>;
              },
              h4: ({ children }) => {
                const label = nodeText(children);
                return <h4 id={toHeadingId(label)}>{children}</h4>;
              }
            }}
          >
            {data.doc.bodyMd}
          </ReactMarkdown>
        </div>

        {data.related.length > 0 && (
          <section className="doc-related">
            <h3>Related Pages</h3>
            <ul className="doc-related-list">
              {data.related.map((item) => (
                <li key={item.slug}>
                  <Link to={`/docs/${item.slug}`}>{item.title}</Link>
                  <span className="doc-related-meta">
                    {item.docType}
                    <a href={`/docs/${item.slug}/llms.txt`}>llms.txt</a>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <div className="doc-right-column">
        <Toc markdown={data.doc.bodyMd} />
        <ApiAndCliPanel endpoints={data.endpoints} commands={data.commands} />
      </div>
    </div>
  );
}
