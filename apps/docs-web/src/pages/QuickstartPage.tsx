import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CommandBlock } from "../components/CommandBlock";
import { VideoGuideCard } from "../components/VideoGuideCard";
import { FEATURED_VIDEO_GUIDE } from "../content/video-guides";

const bootstrapCode = `npm install -g rickydata
rickydata init
# Restart Claude Code when prompted`;

const manualCode = `rickydata auth login
rickydata mcp connect
# Restart Claude Code`;

const mcpWorkflowCode = `rickydata mcp search "brave"
rickydata mcp enable "io.github.brave/brave-search-mcp-server"
rickydata mcp tools
rickydata mcp call io-github-brave-brave-search-mcp-server__brave_web_search '{"query":"transformers","count":3}'`;

const agentsCode = `rickydata apikey set
rickydata agents list
rickydata chat <agent-id>`;

export function QuickstartPage(): JSX.Element {
  useEffect(() => { document.title = "Quickstart — RickyData Docs"; }, []);
  return (
    <div className="page">
      <section className="hero hero-compact">
        <p className="eyebrow">Quickstart</p>
        <h1>Install CLI, authenticate once, unlock MCP + agents</h1>
        <p className="lead">
          This is the fastest path to get <code>rickydata</code> working in local agentic sessions and Claude Code with
          marketplace discovery, tool enablement, and direct tool calls.
        </p>
        <p className="lead">
          Prefer Claude.ai web chat? Skip the CLI — <Link to="/playbooks#claude-chat-setup">add rickydata as a connector</Link> in
          two clicks.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/playbooks">Continue to Playbooks</Link>
        </div>
      </section>

      <VideoGuideCard guide={FEATURED_VIDEO_GUIDE} />

      <section className="quickstart-grid">
        <div className="quickstart-grid-primary">
          <CommandBlock
            title="1) Recommended bootstrap"
            code={bootstrapCode}
            caption="rickydata init runs auth + MCP connect setup and verification."
          />
          <CommandBlock
            title="3) Verify MCP marketplace workflow"
            code={mcpWorkflowCode}
            caption="Search, enable, inspect tools, and call one tool end-to-end from the CLI."
          />
        </div>
        <div className="quickstart-grid-secondary">
          <CommandBlock
            title="2) Manual bootstrap"
            code={manualCode}
            caption="Use this if you want explicit control over each setup step."
          />
          <CommandBlock
            title="4) Agent workflow (BYOK)"
            code={agentsCode}
            caption="Set your Anthropic key, inspect available agents, and start chat."
          />
        </div>
      </section>

      <div className="prompt-callout">
        <p className="muted">Using Claude.ai web chat instead of the CLI?</p>
        <p><Link to="/playbooks#claude-chat-setup">Skip to connector setup</Link> — add rickydata as a connector in two clicks, no CLI required.</p>
      </div>

      <section className="quick-links quick-links-enhanced">
        <h2>Continue your journey</h2>
        <div className="quick-links-grid">
          <Link className="quick-link-item" to="/playbooks#claude-chat-setup">
            <span className="quick-link-title">Connect to Claude.ai</span>
            <span className="quick-link-meta">Use marketplace tools in web chat</span>
          </Link>
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
        </div>
      </section>

      <section className="quick-links quick-links-enhanced">
        <h2>Reference docs</h2>
        <div className="quick-links-grid">
          <Link className="quick-link-item" to="/docs/sdk-readme">
            <span className="quick-link-title">SDK + CLI reference</span>
            <span className="quick-link-meta">Full command reference</span>
          </Link>
          <Link className="quick-link-item" to="/docs/marketplace-readme">
            <span className="quick-link-title">Marketplace architecture</span>
            <span className="quick-link-meta">Gateway and usage patterns</span>
          </Link>
          <Link className="quick-link-item" to="/search?q=agent&section=mcp-server">
            <span className="quick-link-title">Agent-focused docs</span>
            <span className="quick-link-meta">Search results for agent tools</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
