export function ApiAndCliPanel(props: {
  endpoints: Array<{ service: string; method: string; path: string; authMode: string; examples: string[] }>;
  commands: Array<{ command: string; description: string; examples: string[] }>;
}): JSX.Element {
  return (
    <aside className="aux-panel">
      <section>
        <h4>API Endpoints</h4>
        {props.endpoints.length === 0 && <p className="muted">No endpoint inventory for this product.</p>}
        <ul className="endpoint-list">
          {props.endpoints.slice(0, 30).map((endpoint) => (
            <li key={`${endpoint.service}-${endpoint.method}-${endpoint.path}`}>
              <div><strong>{endpoint.method}</strong> <code>{endpoint.path}</code></div>
              <small>{endpoint.service} · {endpoint.authMode}</small>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4>CLI Commands</h4>
        {props.commands.length === 0 && <p className="muted">No CLI inventory for this product.</p>}
        <ul className="command-list">
          {props.commands.slice(0, 30).map((command) => (
            <li key={command.command}>
              <div><code>rickydata {command.command}</code></div>
              <small>{command.description}</small>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
