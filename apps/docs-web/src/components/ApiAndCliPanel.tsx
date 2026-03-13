export function ApiAndCliPanel(props: {
  endpoints: Array<{ service: string; method: string; path: string; authMode: string; examples: string[] }>;
  commands: Array<{ command: string; description: string; examples: string[] }>;
}): JSX.Element {
  const hasEndpoints = props.endpoints.length > 0;
  const hasCommands = props.commands.length > 0;

  if (!hasEndpoints && !hasCommands) {
    return (
      <aside className="aux-panel aux-panel-empty">
        <p className="muted">No API or CLI inventory for this document.</p>
      </aside>
    );
  }

  return (
    <aside className="aux-panel">
      {hasEndpoints && (
        <section className="aux-panel-section">
          <h4>API Endpoints <span className="aux-panel-count">{props.endpoints.length}</span></h4>
          <ul className="endpoint-list">
            {props.endpoints.slice(0, 30).map((endpoint) => (
              <li key={`${endpoint.service}-${endpoint.method}-${endpoint.path}`}>
                <div className="endpoint-title">
                  <span className="endpoint-method">{endpoint.method}</span>
                  <code>{endpoint.path}</code>
                </div>
                <small>{endpoint.service} · {endpoint.authMode}</small>
              </li>
            ))}
          </ul>
          {props.endpoints.length > 30 && (
            <p className="aux-panel-overflow">+ {props.endpoints.length - 30} more endpoints</p>
          )}
        </section>
      )}

      {hasCommands && (
        <section className="aux-panel-section">
          <h4>CLI Commands <span className="aux-panel-count">{props.commands.length}</span></h4>
          <ul className="command-list">
            {props.commands.slice(0, 30).map((command) => (
              <li key={command.command}>
                <div className="endpoint-title"><code>rickydata {command.command}</code></div>
                <small>{command.description}</small>
              </li>
            ))}
          </ul>
          {props.commands.length > 30 && (
            <p className="aux-panel-overflow">+ {props.commands.length - 30} more commands</p>
          )}
        </section>
      )}
    </aside>
  );
}
