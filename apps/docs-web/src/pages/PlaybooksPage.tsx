import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CommandBlock } from "../components/CommandBlock";
import { CollapsibleSection } from "../components/CollapsibleSection";
import { VideoGuideCard } from "../components/VideoGuideCard";
import { FEATURED_VIDEO_GUIDE, INIT_WIZARD_GUIDE, MCP_RUNTIME_LOOP_GUIDE, CLAUDE_CHAT_CONNECTOR_GUIDE, WALLET_FUNDING_GUIDE, QUICKSTART_DEMO_PROMPT } from "../content/video-guides";

const installAndConnect = `npm install -g rickydata
rickydata init
# restart Claude Code when prompted`;

const manualConnect = `rickydata auth login
rickydata mcp connect
# restart Claude Code`;

const cliSearch = `rickydata mcp call blazickjp-arxiv-mcp-server__search_papers \\
  '{"query":"multi-agent LLM systems","max_results":3}'`;

const cliDownload = `rickydata mcp call blazickjp-arxiv-mcp-server__download_paper \\
  '{"paper_id":"2203.08975v2"}'`;

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
  useEffect(() => { document.title = "Playbooks — RickyData Docs"; }, []);
  return (
    <div className="page playbooks-page">
      <section className="hero hero-compact">
        <p className="eyebrow">Operational Playbooks</p>
        <h1>Journey-first docs for install, usage, wallet controls, and agent operations</h1>
        <p className="lead">
          Canonical order for real users: local MCP setup, tool execution, wallet controls, then agent workflows.
        </p>
      </section>

      <CollapsibleSection
        id="local-mcp-setup"
        title="1) Local MCP setup in Claude Code"
        subtitle="Goal: authenticated MCP gateway connection in under 5 minutes."
      >
        <VideoGuideCard guide={INIT_WIZARD_GUIDE} />

        <h3>Reproduce step by step</h3>

        <CommandBlock title="1. Install the CLI" code={`npm install -g rickydata`} caption="Installs the rickydata CLI globally. Provides both 'rickydata' and 'mcpg' commands." />
        <CommandBlock title="2. Run the init wizard" code={`rickydata init`} caption="Opens your browser for login, exchanges the token, connects the MCP gateway to Claude Code, and verifies the connection. One command does everything." />
        <CommandBlock title="3. Verify auth status" code={`rickydata auth status`} caption="Shows your wallet address, token type (mcpwt_), expiry (30 days), and balance." />
        <CommandBlock title="4. Verify MCP connection" code={`rickydata mcp tools`} caption="Should show 'No server tools enabled' — gateway is connected, ready to search and enable servers." />

        <h3>Manual path (if you prefer explicit control)</h3>

        <div className="quickstart-grid">
          <CommandBlock title="Auth only" code={manualConnect} caption="Login and connect as separate steps." />
          <CommandBlock title="Verify" code={`rickydata auth status\nrickydata mcp tools`} caption="Confirm auth and MCP gateway independently." />
        </div>

        <VideoGuideCard guide={FEATURED_VIDEO_GUIDE} />

        <ul className="playbook-links">
          <li><Link to="/quickstart">Quickstart page</Link></li>
          <li><Link to="/docs/sdk-readme">SDK + CLI reference</Link> · <a href="/docs/sdk-readme/llms.txt">llms.txt</a></li>
          <li><Link to="/docs/sdk-cli-login">CLI auth login command</Link></li>
          <li><Link to="/docs/sdk-cli-connect">CLI mcp connect command</Link></li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        id="claude-chat-setup"
        title="2) Connect to Claude.ai web chat"
        subtitle="Goal: use rickydata marketplace tools directly in Claude.ai — no CLI required."
      >
        <VideoGuideCard guide={CLAUDE_CHAT_CONNECTOR_GUIDE} />

        <h3>Steps</h3>

        <ol className="numbered-steps">
          <li>
            Go to <a href="https://claude.ai/customize" target="_blank" rel="noreferrer">claude.ai/customize</a> and
            click <strong>Connectors</strong>.
          </li>
          <li>
            Click <strong>+ Add custom connector</strong>. Enter a name (e.g. <code>rickydata</code>) and the
            URL: <code>https://connect.rickydata.org/mcp</code>.
          </li>
          <li>
            Click <strong>Connect</strong>. Complete the login flow in the popup — the same auth you use with the CLI.
          </li>
          <li>
            Done. Start a new Claude.ai chat and your marketplace MCP tools are available. Search, enable, and call
            tools the same way you would in Claude Code.
          </li>
        </ol>

        <ul className="playbook-links">
          <li><a href="https://claude.ai/customize" target="_blank" rel="noreferrer">Claude.ai Customize page</a></li>
          <li><Link to="/quickstart">Quickstart (CLI path)</Link></li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        id="mcp-runtime"
        title="3) Discover, enable, call, and disable MCP servers"
        subtitle="Goal: complete one full MCP lifecycle loop and prove tool execution works."
      >
        <VideoGuideCard guide={MCP_RUNTIME_LOOP_GUIDE} />

        <h3>Reproduce step by step</h3>

        <CommandBlock title="1. Confirm clean state" code={`rickydata mcp tools`} caption="Should show no tools enabled." />
        <CommandBlock title="2. Search for a server" code={`rickydata mcp search "arxiv"`} caption="Browse the marketplace. The top result (blazickjp/arxiv-mcp-server) has 4 tools and a 95 trust score." />
        <CommandBlock title="3. Enable the server" code={`rickydata mcp enable "blazickjp/arxiv-mcp-server"`} caption="Enables the server and registers its tools with your session." />
        <CommandBlock title="4. List available tools" code={`rickydata mcp tools`} caption="Now shows 4 arxiv tools: search_papers, download_paper, list_papers, read_paper." />
        <CommandBlock title="5. Call a tool" code={cliSearch} caption="Search arxiv for papers. Returns titles, authors, abstracts, and paper IDs." />
        <CommandBlock title="6. Download a paper" code={cliDownload} caption="Downloads the PDF and converts to markdown. Use a paper_id from step 5." />
        <CommandBlock title="7. Disable the server" code={`rickydata mcp disable "blazickjp/arxiv-mcp-server"`} caption="Removes the server and all its tools from your session." />
        <CommandBlock title="8. Confirm removal" code={`rickydata mcp tools`} caption="Back to empty — clean slate." />

        <div className="prompt-callout">
          <p className="muted">Or run the same flow in Claude Code with one prompt</p>
          <pre>{QUICKSTART_DEMO_PROMPT}</pre>
        </div>

        <ul className="playbook-links">
          <li><Link to="/docs/sdk-cli-search-query">CLI mcp search</Link></li>
          <li><Link to="/docs/sdk-cli-enable-name-or-id">CLI mcp enable</Link></li>
          <li><Link to="/docs/sdk-cli-call-tool-name-args-json">CLI mcp call</Link></li>
          <li><Link to="/docs/sdk-cli-disable-name-or-id">CLI mcp disable</Link></li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        id="wallet-controls"
        title="4) Wallet funding, budgets, retention, and self-improvement controls"
        subtitle="Goal: prevent payment failures and set safe defaults before team rollout."
      >
        <VideoGuideCard guide={WALLET_FUNDING_GUIDE} />

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
      </CollapsibleSection>

      <CollapsibleSection
        id="agent-chat"
        title="5) Agent chat with BYOK and session controls"
        subtitle="Goal: enable reliable agent usage with cost visibility and session continuity."
      >
        <p>
          Store your Anthropic API key (<code>sk-ant-...</code>) to use agents at a 10% platform markup instead of per-message wallet charges.
          Sessions persist across restarts when conversation retention is enabled, and you can resume any previous session by ID.
          Use <code>/model</code>, <code>/cost</code>, and <code>/session</code> as REPL commands during chat.
        </p>

        <div className="quickstart-grid">
          <CommandBlock title="BYOK + first chat" code={byokFlow} caption="Use your own Anthropic key, then run and resume sessions." />
          <CommandBlock title="Session management" code={sessionMgmt} caption="List, inspect, and resume past sessions by agent." />
        </div>

        <h3>How it works</h3>
        <p>
          Agent chat uses a Bring Your Own Key (BYOK) model — your Anthropic API key with a 10% platform markup covers inference costs.
          Sessions persist across CLI restarts when conversation retention is enabled in your <a href="#wallet-controls">wallet settings</a>, so you can pick up any conversation where you left off.
        </p>

        <ul className="playbook-links">
          <li><Link to="/search?q=apikey+set&section=sdk&type=cli">CLI apikey set</Link></li>
          <li><Link to="/search?q=agents+list&section=sdk&type=cli">CLI agents list</Link></li>
          <li><Link to="/docs/sdk-cli-list-agent-id">CLI sessions list</Link></li>
          <li><Link to="/docs/marketplace-docs-agent-gateway">Agent gateway architecture</Link></li>
          <li><a href="#wallet-controls">Wallet funding and preferences</a> — fund your wallet before starting agent chat</li>
          <li><a href="#agent-as-mcp">Use agents as MCP endpoints</a> — consume agent skills as tools in any MCP client</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        id="agent-as-mcp"
        title="6) Use agents as MCP endpoints"
        subtitle="Goal: connect an agent endpoint to any MCP-compatible client."
      >
        <p>
          Every agent exposes a standard MCP endpoint at <code>/agents/:id/mcp</code>. Mount it in Claude Code or any MCP client
          to use agent skills as regular tools. You can also call agent tools directly from the CLI without mounting.
          This means any agent on the marketplace — including ones you build — can be consumed as a set of callable tools in your existing workflows.
        </p>

        <div className="quickstart-grid">
          <CommandBlock title="Mount agent MCP endpoint" code={agentAsMcp} caption="Connect agent skills as callable MCP tools in Claude Code." />
          <CommandBlock title="Direct agent tool calls" code={agentMcpTools} caption="List and call agent tools from the CLI without mounting." />
        </div>

        <ul className="playbook-links">
          <li><a href="https://mcpmarketplace.rickydata.org/getting-started" target="_blank" rel="noreferrer">Marketplace getting started</a></li>
          <li><a href="https://mcpmarketplace.rickydata.org/agents" target="_blank" rel="noreferrer">Browse agents</a></li>
          <li><a href="#agent-chat">Agent chat with BYOK</a> — authenticate and start a chat session before mounting endpoints</li>
          <li><a href="#canvas">Canvas workflows</a> — chain agent endpoints into automated multi-step pipelines</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        id="canvas"
        title="7) Canvas workflows"
        subtitle="Goal: execute and monitor multi-step workflows via CLI and workspace UI."
      >
        <p>
          Canvas workflows chain agents, MCP tools, approval gates, and GitHub actions into automated multi-step pipelines.
          Build visually in the workspace UI or define as JSON and execute from the CLI.
          Workflows support 14+ node types including agent teams, browser verification, and GitHub PR automation.
        </p>

        <CommandBlock title="Canvas CLI loop" code={canvasFlow} caption="List, run, inspect, and iterate on workflows." />

        <h3>Supported node types</h3>
        <ul className="meta-list">
          <li><strong>Agent</strong> — run an agent with a prompt and collect its output</li>
          <li><strong>Tool call</strong> — invoke any enabled MCP tool directly</li>
          <li><strong>Approval gate</strong> — pause execution until a human approves the next step</li>
          <li><strong>GitHub action</strong> — trigger CI/CD workflows or create PRs</li>
          <li><strong>Browser verification</strong> — validate web page state with automated checks</li>
          <li><strong>Agent team</strong> — fan out to multiple agents in parallel</li>
        </ul>

        <ul className="playbook-links">
          <li><Link to="/docs/sdk-cli-execute-workflow-id-or-file">CLI canvas execute</Link></li>
          <li><Link to="/docs/sdk-cli-runs">CLI canvas runs</Link></li>
          <li><a href="https://mcpmarketplace.rickydata.org/workspace" target="_blank" rel="noreferrer">Workspace UI</a></li>
          <li><a href="#agent-as-mcp">Use agents as MCP endpoints</a> — agents used in canvas nodes are the same MCP endpoints</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        id="marketplace-ui"
        title="Marketplace web app operations"
        subtitle="Goal: document all high-impact website flows users run in production."
      >
        <p>
          The marketplace website at <a href="https://mcpmarketplace.rickydata.org" target="_blank" rel="noreferrer">mcpmarketplace.rickydata.org</a> is
          the web interface for browsing 5,000+ MCP servers, managing your wallet, chatting with agents, and building custom agents.
          Each server page shows security scores, isolation profiles, tool lists, and a Try Tool panel for testing before you enable.
        </p>

        <ul className="playbook-links">
          <li><a href="https://mcpmarketplace.rickydata.org/browse" target="_blank" rel="noreferrer">Server browse + filtering</a> — search 5,000+ servers by category, inspect security scores, trust data, and tool lists before enabling</li>
          <li><a href="https://mcpmarketplace.rickydata.org/wallet" target="_blank" rel="noreferrer">Wallet funding + settings + self-improvement</a> — deposit USDC on Base, set model defaults, toggle conversation retention, and schedule agent improvement cycles</li>
          <li><a href="https://mcpmarketplace.rickydata.org/agents" target="_blank" rel="noreferrer">Agent discovery + chat</a> — browse published agents, start BYOK chat sessions, and track per-session costs</li>
          <li><a href="https://mcpmarketplace.rickydata.org/build" target="_blank" rel="noreferrer">Custom agent builder</a> — describe what your agent should do and auto-generate config, or use the detailed form for full control over prompts, tools, and secrets</li>
          <li><a href="https://mcpmarketplace.rickydata.org/my-agents" target="_blank" rel="noreferrer">My agents and publishing lifecycle</a> — edit drafts, test via chat, publish to marketplace, and monitor usage metrics</li>
        </ul>

        <p>
          The CLI provides equivalent functionality for all marketplace operations.
          Use <a href="#local-mcp-setup">local MCP setup</a> to get started with CLI-based server management, or <a href="#wallet-controls">wallet controls</a> to configure funding and budgets.
        </p>
      </CollapsibleSection>

      <CollapsibleSection
        id="agent-build"
        title="Custom agent build + publish lifecycle"
        subtitle="Goal: move from draft agent to published, testable, and budget-controlled production usage."
      >
        <p>
          Build custom agents from the marketplace website. Describe what your agent should do and the builder auto-generates
          configuration, or use the detailed form for full control over system prompts, MCP tool access, and required secrets.
          After testing via chat, publish to make the agent available on the marketplace and as an MCP endpoint.
        </p>

        <h3>Build lifecycle</h3>
        <ol className="numbered-steps">
          <li><strong>Create draft</strong> — describe your agent or use the detailed builder form</li>
          <li><strong>Configure tools and prompts</strong> — select MCP tools, set system prompts, define required secrets</li>
          <li><strong>Test via chat</strong> — run BYOK chat sessions against the draft to verify behavior</li>
          <li><strong>Publish</strong> — make the agent available on the marketplace and as an MCP endpoint</li>
          <li><strong>Monitor usage</strong> — track sessions, costs, and improvement cycles from the My Agents dashboard</li>
        </ol>

        <ul className="playbook-links">
          <li><a href="https://mcpmarketplace.rickydata.org/build" target="_blank" rel="noreferrer">Build new custom agent</a> — auto-generate or manually configure</li>
          <li><a href="https://mcpmarketplace.rickydata.org/my-agents" target="_blank" rel="noreferrer">Review + manage my agents</a> — edit, test, publish, or delete drafts</li>
          <li><a href="https://mcpmarketplace.rickydata.org/feed" target="_blank" rel="noreferrer">Validate feed visibility after publish</a> — confirm your agent appears publicly</li>
          <li><Link to="/docs/marketplace-docs-agent-gateway">Agent gateway architecture and lifecycle internals</Link></li>
          <li><a href="#agent-as-mcp">Use agents as MCP endpoints</a> — consume your published agent as MCP tools</li>
          <li><a href="#agent-chat">Agent chat</a> — test your agent via BYOK chat before and after publishing</li>
        </ul>
      </CollapsibleSection>
    </div>
  );
}
