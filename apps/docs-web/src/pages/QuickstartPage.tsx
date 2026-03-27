import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CommandBlock } from "../components/CommandBlock";
import { PathToggle } from "../components/PathToggle";
import { VideoGuideCard } from "../components/VideoGuideCard";
import { CLAUDE_CHAT_CONNECTOR_GUIDE, INIT_WIZARD_GUIDE } from "../content/video-guides";

const bootstrapCode = `npm install -g rickydata && rickydata init`;

const manualCode = `rickydata auth login
rickydata mcp connect
# Restart Claude Code`;

const verifyCode = `rickydata auth status && rickydata mcp tools`;

export function QuickstartPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const activePath = searchParams.get("path") === "local" ? "local" : "web";

  useEffect(() => { document.title = "Quickstart — RickyData Docs"; }, []);

  function handlePathChange(path: "web" | "local"): void {
    setSearchParams({ path }, { replace: true });
  }

  return (
    <div className="page">
      <section className="hero hero-compact">
        <p className="eyebrow">Quickstart</p>
        <h1>Two paths to MCP tools and AI agents</h1>
        <p className="lead">
          Use rickydata marketplace tools in Claude.ai web chat with zero install, or set up the full CLI for local development in Claude Code.
        </p>
      </section>

      <PathToggle active={activePath} onChange={handlePathChange} />

      {activePath === "web" ? (
        <section className="quickstart-path">
          <VideoGuideCard guide={CLAUDE_CHAT_CONNECTOR_GUIDE} />

          <h3>Connect in 4 steps</h3>
          <ol className="numbered-steps">
            <li>
              Go to <a href="https://claude.ai/customize" target="_blank" rel="noreferrer">claude.ai/customize</a> and
              click <strong>Connectors</strong>.
            </li>
            <li>
              Click <strong>+ Add custom connector</strong>. Enter name: <code>rickydata</code> and
              URL: <code>https://connect.rickydata.org/mcp</code>.
            </li>
            <li>
              Click <strong>Connect</strong>. Complete the login flow in the popup.
            </li>
            <li>
              Done. Start a new Claude.ai chat — your marketplace MCP tools are available immediately.
            </li>
          </ol>

          <div className="prompt-callout">
            <h2>Try your first prompt</h2>
            <pre>Search the rickydata marketplace for a "brave" search server and enable it so I can use it.</pre>
          </div>

          <p className="quickstart-path-crosslink">
            Prefer local CLI setup? <button type="button" className="btn btn-ghost" onClick={() => handlePathChange("local")}>Switch to Claude Code path</button>
          </p>
        </section>
      ) : (
        <section className="quickstart-path">
          <VideoGuideCard guide={INIT_WIZARD_GUIDE} />

          <CommandBlock
            title="1. Install + initialize"
            code={bootstrapCode}
            caption="Installs the CLI globally, then runs auth, MCP gateway connect, agent proxy setup, and verification in one command."
          />

          <details className="manual-bootstrap-details">
            <summary>Manual bootstrap (explicit control)</summary>
            <CommandBlock
              title="Manual steps"
              code={manualCode}
              caption="Login and connect as separate steps if you prefer explicit control."
            />
          </details>

          <CommandBlock
            title="2. Verify everything works"
            code={verifyCode}
            caption="Confirms your auth token and that the MCP gateway is connected and ready."
          />

          <p className="quickstart-path-crosslink">
            No CLI needed? <button type="button" className="btn btn-ghost" onClick={() => handlePathChange("web")}>Switch to Claude.ai web chat path</button>
          </p>
        </section>
      )}

      <section className="quick-links quick-links-enhanced">
        <h2>Next steps</h2>
        <div className="quick-links-grid">
          <Link className="quick-link-item" to="/playbooks#mcp-runtime">
            <span className="quick-link-title">MCP server lifecycle</span>
            <span className="quick-link-meta">Search, enable, call, disable tools</span>
          </Link>
          <Link className="quick-link-item" to="/playbooks#wallet-controls">
            <span className="quick-link-title">Wallet + billing setup</span>
            <span className="quick-link-meta">Fund wallet and set safe defaults</span>
          </Link>
          <Link className="quick-link-item" to="/playbooks#agent-chat">
            <span className="quick-link-title">Agent chat with BYOK</span>
            <span className="quick-link-meta">Use your own API key for agents</span>
          </Link>
          <Link className="quick-link-item" to="/docs/sdk-docs-kfdb-getting-started">
            <span className="quick-link-title">KFDB global/private scopes</span>
            <span className="quick-link-meta">Default global reads, switch to private when needed</span>
          </Link>
          <Link className="quick-link-item" to="/docs/sdk-readme">
            <span className="quick-link-title">SDK + CLI reference</span>
            <span className="quick-link-meta">Full command reference</span>
          </Link>
          <Link className="quick-link-item" to="/playbooks">
            <span className="quick-link-title">All playbooks</span>
            <span className="quick-link-meta">Complete operational guides</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
