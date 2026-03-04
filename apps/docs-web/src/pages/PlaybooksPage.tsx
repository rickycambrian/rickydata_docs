import { Link } from "react-router-dom";
import { CommandBlock } from "../components/CommandBlock";
import { VideoGuideCard } from "../components/VideoGuideCard";
import { FEATURED_VIDEO_GUIDE, QUICKSTART_DEMO_PROMPT, RECORDING_BACKLOG } from "../content/video-guides";

const installAndConnect = `npm install -g rickydata
rickydata init
# restart Claude Code when prompted`;

const manualConnect = `rickydata auth login
rickydata mcp connect
# restart Claude Code`;

const cliLoop = `rickydata mcp search "arxiv"
rickydata mcp enable "blazickjp/arxiv-mcp-server"
rickydata mcp tools
rickydata mcp call blazickjp-arxiv-mcp-server__search_papers '{"query":"multi-agent LLM systems","max_results":5}'
rickydata mcp disable "blazickjp/arxiv-mcp-server"
rickydata mcp tools`;

const byokFlow = `rickydata apikey set
rickydata agents list
rickydata chat <agent-id>
rickydata sessions list <agent-id>`;

const agentAsMcp = `# token via CLI auth login, then:
claude mcp add --transport http \
  --header "Authorization:Bearer $TOKEN" \
  research-agent https://agents.rickydata.org/agents/<agent-id>/mcp`;

const walletFunding = `rickydata wallet balance
rickydata wallet settings show
rickydata wallet settings set defaultModel sonnet
rickydata wallet settings set persistConversations true
rickydata wallet settings set conversationRetentionDays 30
rickydata wallet transactions`;

const walletBudgets = `rickydata wallet settings set autoImprove true
rickydata wallet settings set selfImprovementSchedule daily
rickydata wallet settings set agentAutoImprove <agent-id>=true`;

const sessionMgmt = `rickydata sessions list <agent-id>
rickydata sessions get <agent-id> <session-id>
rickydata sessions resume <session-id> <agent-id>`;

const agentMcpTools = `rickydata mcp agent tools <agent-id>
rickydata mcp agent call <agent-id> <tool-name> '{"param":"value"}'`;

const canvasFlow = `rickydata canvas list
rickydata canvas execute <workflow-id>
rickydata canvas runs
rickydata canvas run <run-id>`;

export function PlaybooksPage(): JSX.Element {
  return (
    <div className="page playbooks-page">
      <section className="hero hero-compact">
        <p className="eyebrow">Operational Playbooks</p>
        <h1>Journey-first docs for install, usage, wallet controls, and agent operations</h1>
        <p className="lead">
          Use these playbooks as the canonical order for onboarding real users: first local MCP connectivity, then
          reliable tool execution, then wallet + agent controls, and finally advanced agent/canvas workflows.
        </p>
      </section>

      <section id="local-mcp-setup" className="playbook-section">
        <div className="playbook-header">
          <h2>1) Local MCP setup in Claude Code</h2>
          <p className="muted">Goal: authenticated MCP gateway connection in under 5 minutes.</p>
        </div>

        <VideoGuideCard guide={FEATURED_VIDEO_GUIDE} />

        <div className="quickstart-grid">
          <CommandBlock title="Recommended path" code={installAndConnect} caption="Wizard does auth + connect + verification." />
          <CommandBlock title="Manual path" code={manualConnect} caption="Use this if you want explicit control." />
        </div>

        <ul className="playbook-links">
          <li><Link to="/quickstart">Quickstart page</Link></li>
          <li><Link to="/docs/sdk-readme">SDK + CLI reference</Link> · <a href="/docs/sdk-readme/llms.txt">llms.txt</a></li>
          <li><Link to="/docs/sdk-cli-login">CLI auth login command</Link></li>
          <li><Link to="/docs/sdk-cli-connect">CLI mcp connect command</Link></li>
        </ul>
      </section>

      <section id="mcp-runtime" className="playbook-section">
        <div className="playbook-header">
          <h2>2) Discover, enable, call, and disable MCP servers</h2>
          <p className="muted">Goal: complete one full MCP lifecycle loop and prove tool execution works.</p>
        </div>

        <CommandBlock title="End-to-end CLI loop" code={cliLoop} caption="Exact command loop shown in the featured demo." />

        <div className="prompt-callout">
          <p className="muted">Claude Code prompt for the same flow</p>
          <pre>{QUICKSTART_DEMO_PROMPT}</pre>
        </div>

        <ul className="playbook-links">
          <li><Link to="/docs/sdk-cli-search-query">CLI mcp search</Link></li>
          <li><Link to="/docs/sdk-cli-enable-name-or-id">CLI mcp enable</Link></li>
          <li><Link to="/docs/sdk-cli-call-tool-name-args-json">CLI mcp call</Link></li>
          <li><Link to="/docs/sdk-cli-disable-name-or-id">CLI mcp disable</Link></li>
        </ul>
      </section>

      <section id="wallet-controls" className="playbook-section">
        <div className="playbook-header">
          <h2>3) Wallet funding, budgets, retention, and self-improvement controls</h2>
          <p className="muted">Goal: prevent payment failures and set safe defaults before team rollout.</p>
        </div>

        <p>
          MCP tool calls cost $0.0005 USDC each on Base mainnet. Agent chat uses your BYOK Anthropic key at a 10% platform markup.
          Fund your wallet before enabling servers, then configure conversation retention and self-improvement to get the most from agent sessions.
        </p>

        <div className="quickstart-grid">
          <CommandBlock title="Wallet balance + preferences" code={walletFunding} caption="Check balance, configure model defaults, enable conversation persistence, and view transaction history." />
          <CommandBlock title="Self-improvement + budgets" code={walletBudgets} caption="Enable auto-improvement so agents learn from past conversations. Set per-agent overrides." />
        </div>

        <h3>Wallet preferences reference</h3>
        <ul className="meta-list">
          <li><code>defaultModel</code> — Default Claude model for agent chat (haiku, sonnet, opus)</li>
          <li><code>persistConversations</code> — Save chat history across sessions (required for self-improvement)</li>
          <li><code>conversationRetentionDays</code> — How long to keep conversations (1-365 days)</li>
          <li><code>autoImprove</code> — Enable self-improvement: agents analyze past conversations to extract learnings</li>
          <li><code>selfImprovementSchedule</code> — Run frequency: after_each, daily, weekly, biweekly</li>
          <li><code>selfImprovementScope</code> — Which agents to include in improvement cycles</li>
          <li><code>agentAutoImprove</code> — Per-agent toggle for self-improvement</li>
          <li><code>postToKnowledgeBook</code> — Post learnings to the shared knowledge book</li>
        </ul>

        <h3>Funding your wallet</h3>
        <p>
          Deposit USDC on <strong>Base mainnet only</strong> to the address shown in your{" "}
          <a href="https://mcpmarketplace.rickydata.org/wallet" target="_blank" rel="noreferrer">wallet panel</a>.
          Deposits on other networks (Ethereum mainnet, Arbitrum, etc.) trigger the wrong-network recovery process and may take up to 30 days to recover.
        </p>

        <ul className="playbook-links">
          <li><a href="https://mcpmarketplace.rickydata.org/wallet" target="_blank" rel="noreferrer">Open wallet panel</a></li>
          <li><Link to="/docs/sdk-cli-balance">CLI wallet balance</Link></li>
          <li><Link to="/search?q=wallet+settings+show&section=sdk&type=cli">CLI wallet settings show</Link></li>
          <li><Link to="/search?q=wallet+settings+set&section=sdk&type=cli">CLI wallet settings set</Link></li>
          <li><Link to="/docs/marketplace-docs-wrong-network-recovery-policy">Wrong-network deposit recovery policy</Link></li>
        </ul>
      </section>

      <section id="agent-chat" className="playbook-section">
        <div className="playbook-header">
          <h2>4) Agent chat with BYOK and session controls</h2>
          <p className="muted">Goal: enable reliable agent usage with cost visibility and session continuity.</p>
        </div>

        <p>
          Store your Anthropic API key (<code>sk-ant-...</code>) to use agents at a 10% platform markup instead of per-message wallet charges.
          Sessions persist across restarts when conversation retention is enabled, and you can resume any previous session by ID.
          Use <code>/model</code>, <code>/cost</code>, and <code>/session</code> as REPL commands during chat.
        </p>

        <div className="quickstart-grid">
          <CommandBlock title="BYOK + first chat" code={byokFlow} caption="Use your own Anthropic key, then run and resume sessions." />
          <CommandBlock title="Session management" code={sessionMgmt} caption="List, inspect, and resume past sessions by agent." />
        </div>

        <ul className="playbook-links">
          <li><Link to="/search?q=apikey+set&section=sdk&type=cli">CLI apikey set</Link></li>
          <li><Link to="/search?q=agents+list&section=sdk&type=cli">CLI agents list</Link></li>
          <li><Link to="/docs/sdk-cli-list-agent-id">CLI sessions list</Link></li>
          <li><Link to="/docs/marketplace-docs-agent-gateway">Agent gateway architecture</Link></li>
        </ul>
      </section>

      <section id="agent-as-mcp" className="playbook-section">
        <div className="playbook-header">
          <h2>5) Use agents as MCP endpoints</h2>
          <p className="muted">Goal: connect an agent endpoint to any MCP-compatible client.</p>
        </div>

        <p>
          Every agent exposes a standard MCP endpoint at <code>/agents/:id/mcp</code>. Mount it in Claude Code or any MCP client
          to use agent skills as regular tools. You can also call agent tools directly from the CLI without mounting.
        </p>

        <div className="quickstart-grid">
          <CommandBlock title="Mount agent MCP endpoint" code={agentAsMcp} caption="Connect agent skills as callable MCP tools in Claude Code." />
          <CommandBlock title="Direct agent tool calls" code={agentMcpTools} caption="List and call agent tools from the CLI without mounting." />
        </div>

        <ul className="playbook-links">
          <li><a href="https://mcpmarketplace.rickydata.org/getting-started" target="_blank" rel="noreferrer">Marketplace getting started</a></li>
          <li><a href="https://mcpmarketplace.rickydata.org/agents" target="_blank" rel="noreferrer">Browse agents</a></li>
        </ul>
      </section>

      <section id="canvas" className="playbook-section">
        <div className="playbook-header">
          <h2>6) Canvas workflows</h2>
          <p className="muted">Goal: execute and monitor multi-step workflows via CLI and workspace UI.</p>
        </div>

        <p>
          Canvas workflows chain agents, MCP tools, approval gates, and GitHub actions into automated multi-step pipelines.
          Build visually in the workspace UI or define as JSON and execute from the CLI.
          Workflows support 14+ node types including agent teams, browser verification, and GitHub PR automation.
        </p>

        <CommandBlock title="Canvas CLI loop" code={canvasFlow} caption="List, run, inspect, and iterate on workflows." />

        <ul className="playbook-links">
          <li><Link to="/docs/sdk-cli-execute-workflow-id-or-file">CLI canvas execute</Link></li>
          <li><Link to="/docs/sdk-cli-runs">CLI canvas runs</Link></li>
          <li><a href="https://mcpmarketplace.rickydata.org/workspace" target="_blank" rel="noreferrer">Workspace UI</a></li>
        </ul>
      </section>

      <section id="video-backlog" className="playbook-section">
        <div className="playbook-header">
          <h2>Video backlog for docs polish</h2>
          <p className="muted">Record these in order to maximize onboarding quality for new customers.</p>
        </div>

        <ul className="video-backlog-list">
          {RECORDING_BACKLOG.map((guide) => (
            <li key={guide.id}>
              <div className="result-head">
                <strong>{guide.title}</strong>
                <span className={`status-badge ${guide.status === "live" ? "status-live" : "status-pending"}`}>
                  {guide.status === "live" ? "Live" : "Record Needed"}
                </span>
              </div>
              <p>{guide.purpose}</p>
              <small>{guide.duration} · {guide.audience} · target: {guide.pageAnchor}</small>
            </li>
          ))}
        </ul>
      </section>

      <section id="marketplace-ui" className="playbook-section">
        <div className="playbook-header">
          <h2>Marketplace web app operations</h2>
          <p className="muted">Goal: document all high-impact website flows users run in production.</p>
        </div>

        <p>
          The marketplace website at <a href="https://mcpmarketplace.rickydata.org" target="_blank" rel="noreferrer">mcpmarketplace.rickydata.org</a> is
          the web interface for browsing 5,000+ MCP servers, managing your wallet, chatting with agents, and building custom agents.
          Each server page shows security scores, isolation profiles, tool lists, and a Try Tool panel for testing before you enable.
        </p>

        <ul className="playbook-links">
          <li><a href="https://mcpmarketplace.rickydata.org/browse" target="_blank" rel="noreferrer">Server browse + filtering</a> — search, filter by category, inspect security and trust data</li>
          <li><a href="https://mcpmarketplace.rickydata.org/wallet" target="_blank" rel="noreferrer">Wallet funding + settings + self-improvement</a> — deposit USDC, configure preferences, run improvement cycles</li>
          <li><a href="https://mcpmarketplace.rickydata.org/agents" target="_blank" rel="noreferrer">Agent discovery + chat</a> — browse agents, start chat sessions, track costs</li>
          <li><a href="https://mcpmarketplace.rickydata.org/build" target="_blank" rel="noreferrer">Custom agent builder</a> — create agents from a description or detailed form</li>
          <li><a href="https://mcpmarketplace.rickydata.org/my-agents" target="_blank" rel="noreferrer">My agents and publishing lifecycle</a> — manage, test, and publish your agents</li>
        </ul>
      </section>

      <section id="agent-build" className="playbook-section">
        <div className="playbook-header">
          <h2>Custom agent build + publish lifecycle</h2>
          <p className="muted">Goal: move from draft agent to published, testable, and budget-controlled production usage.</p>
        </div>

        <p>
          Build custom agents from the marketplace website. Describe what your agent should do and the builder auto-generates
          configuration, or use the detailed form for full control over system prompts, MCP tool access, and required secrets.
          After testing via chat, publish to make the agent available on the marketplace and as an MCP endpoint.
        </p>

        <ul className="playbook-links">
          <li><a href="https://mcpmarketplace.rickydata.org/build" target="_blank" rel="noreferrer">Build new custom agent</a> — auto-generate or manually configure</li>
          <li><a href="https://mcpmarketplace.rickydata.org/my-agents" target="_blank" rel="noreferrer">Review + manage my agents</a> — edit, test, publish, or delete drafts</li>
          <li><a href="https://mcpmarketplace.rickydata.org/feed" target="_blank" rel="noreferrer">Validate feed visibility after publish</a> — confirm your agent appears publicly</li>
          <li><Link to="/docs/marketplace-docs-agent-gateway">Agent gateway architecture and lifecycle internals</Link></li>
        </ul>
      </section>
    </div>
  );
}
