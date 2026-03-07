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
        <CommandBlock
          title="1) Recommended bootstrap"
          code={bootstrapCode}
          caption="rickydata init runs auth + MCP connect setup and verification."
        />
        <CommandBlock
          title="2) Manual bootstrap"
          code={manualCode}
          caption="Use this if you want explicit control over each setup step."
        />
        <CommandBlock
          title="3) Verify MCP marketplace workflow"
          code={mcpWorkflowCode}
          caption="Search, enable, inspect tools, and call one tool end-to-end from the CLI."
        />
        <CommandBlock
          title="4) Agent workflow (BYOK)"
          code={agentsCode}
          caption="Set your Anthropic key, inspect available agents, and start chat."
        />
      </section>

      <section className="quick-links">
        <h2>Next docs to read</h2>
        <ul>
          <li><Link to="/docs/sdk-readme">SDK + CLI reference</Link> · <a href="/docs/sdk-readme/llms.txt">llms.txt</a></li>
          <li><Link to="/docs/marketplace-readme">Marketplace architecture + usage</Link> · <a href="/docs/marketplace-readme/llms.txt">llms.txt</a></li>
          <li><Link to="/search?q=agent&section=mcp-server">Agent-focused docs</Link></li>
        </ul>
      </section>
    </div>
  );
}
