export function SourceProvenance(props: {
  sourceRepo: string;
  sourcePath: string;
  sourceCommit: string;
  updatedAt: string;
}): JSX.Element {
  return (
    <section className="provenance">
      <h4>Source Provenance</h4>
      <ul>
        <li>Repo: <code>{props.sourceRepo}</code></li>
        <li>Path: <code>{props.sourcePath}</code></li>
        <li>Commit: <code>{props.sourceCommit.slice(0, 12)}</code></li>
        <li>Updated: {new Date(props.updatedAt).toLocaleString()}</li>
      </ul>
    </section>
  );
}
