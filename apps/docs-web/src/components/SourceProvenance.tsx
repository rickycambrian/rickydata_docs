export function SourceProvenance(props: {
  sourceRepo: string;
  sourcePath: string;
  sourceCommit: string;
  updatedAt: string;
}): JSX.Element {
  return (
    <section className="provenance">
      <h4>Source Provenance</h4>
      <dl className="provenance-grid">
        <dt>Repo</dt>
        <dd><code>{props.sourceRepo}</code></dd>
        <dt>Path</dt>
        <dd><code>{props.sourcePath}</code></dd>
        <dt>Commit</dt>
        <dd><code>{props.sourceCommit.slice(0, 12)}</code></dd>
        <dt>Updated</dt>
        <dd>{new Date(props.updatedAt).toLocaleString()}</dd>
      </dl>
    </section>
  );
}
