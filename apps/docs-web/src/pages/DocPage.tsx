import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDoc, type DocResponse } from "../api/docs-api";
import { ApiAndCliPanel } from "../components/ApiAndCliPanel";
import { SourceProvenance } from "../components/SourceProvenance";
import { Toc } from "../components/Toc";

export function DocPage(): JSX.Element {
  const { slug } = useParams();
  const [data, setData] = useState<DocResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getDoc(slug)
      .then((result) => {
        setData(result);
        setError(null);
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

  return (
    <div className="doc-layout">
      <article className="doc-article">
        <h1>{data.doc.title}</h1>
        <p className="muted">{data.doc.summary}</p>

        <SourceProvenance
          sourceRepo={data.doc.sourceRepo}
          sourcePath={data.doc.sourcePath}
          sourceCommit={data.doc.sourceCommit}
          updatedAt={data.doc.updatedAt}
        />

        <div className="markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.doc.bodyMd}</ReactMarkdown>
        </div>

        {data.related.length > 0 && (
          <section>
            <h3>Related Pages</h3>
            <ul>
              {data.related.map((item) => (
                <li key={item.slug}>
                  <Link to={`/docs/${item.slug}`}>{item.title}</Link>
                  <small> · {item.docType}</small>
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
