export type VideoGuideStatus = "live" | "record-needed";

export type VideoGuide = {
  id: string;
  title: string;
  duration: string;
  status: VideoGuideStatus;
  audience: string;
  purpose: string;
  pageAnchor: string;
  videoUrl?: string;
  recordingPrompt: string;
};

/* ── helpers ─────────────────────────────────────────────── */

/** Resolve a video URL: prefer env-var override, fall back to local path in dev only. */
function resolveVideo(envKey: string, localFile: string): string | undefined {
  const env = (import.meta.env[envKey] as string | undefined)?.trim();
  if (env) return env;
  if (import.meta.env.DEV) return `/videos/${localFile}`;
  return undefined;
}

function videoOrUndefined(envKey: string, localFile: string): { status: VideoGuideStatus; videoUrl?: string } {
  const url = resolveVideo(envKey, localFile);
  // Treat the local fallback as "live" only if the file is actually shipped
  // (the .gitkeep / README guard means the file only exists after manual copy).
  return url ? { status: "live", videoUrl: url } : { status: "record-needed" };
}

/* ── prompts ─────────────────────────────────────────────── */

export const QUICKSTART_DEMO_PROMPT =
  'Search the rickydata marketplace for a "brave" search server. Enable it, then call the brave_web_search tool with a query. After that, disable the server and confirm it was removed.';

/* ── video guides ────────────────────────────────────────── */

/** Featured on /quickstart — Claude Code natural-language demo */
export const FEATURED_VIDEO_GUIDE: VideoGuide = {
  id: "mcp-cli-claude-end-to-end",
  title: "CLI + Claude Code: discover, enable, call, and disable an MCP server",
  duration: "3-5 min",
  audience: "New users onboarding to MCP through CLI + Claude Code",
  purpose:
    "Show one complete loop from server discovery to tool execution and cleanup so users trust the workflow immediately.",
  pageAnchor: "/quickstart",
  recordingPrompt: QUICKSTART_DEMO_PROMPT,
  ...videoOrUndefined("VITE_VIDEO_QUICKSTART_DEMO_URL", "mcp-marketplace-usage-demo.mp4")
};

/** CLI step-by-step runtime loop — shown on /playbooks#mcp-runtime */
export const MCP_RUNTIME_LOOP_GUIDE: VideoGuide = {
  id: "cli-mcp-runtime-loop",
  title: "MCP runtime loop: search, enable, call tools, and disable from the CLI",
  duration: "3 min",
  audience: "Developers who prefer explicit CLI commands over natural-language prompts",
  purpose:
    "Walk through every CLI command in the MCP lifecycle so users can reproduce the flow step by step.",
  pageAnchor: "/playbooks#mcp-runtime",
  recordingPrompt:
    'rickydata mcp tools (empty), rickydata mcp search "arxiv", rickydata mcp enable "blazickjp/arxiv-mcp-server", rickydata mcp tools, rickydata mcp call search_papers, rickydata mcp call download_paper, rickydata mcp disable, rickydata mcp tools (empty again).',
  ...videoOrUndefined("VITE_VIDEO_MCP_RUNTIME_URL", "01-cli-mcp-runtime-loop.mp4")
};

/** Init wizard + auth flow — shown on /playbooks#local-mcp-setup */
export const INIT_WIZARD_GUIDE: VideoGuide = {
  id: "auth-login-and-init-wizard",
  title: "Auth login + init wizard walkthrough",
  duration: "2 min",
  audience: "Users installing the CLI for the first time",
  purpose: "Show exactly what rickydata init does: browser login, token handoff, MCP connect, agent proxy setup, and verification.",
  pageAnchor: "/playbooks#local-mcp-setup",
  recordingPrompt:
    "Run npm install -g rickydata, then rickydata init, show 5 steps: browser login, MCP server connect, agent proxy setup, gateway verification, and next steps.",
  ...videoOrUndefined("VITE_VIDEO_INIT_WIZARD_URL", "02-init-wizard-auth-connect.mp4")
};

/** Connect to Claude.ai web chat via custom connector — shown on /playbooks#claude-chat-setup */
export const CLAUDE_CHAT_CONNECTOR_GUIDE: VideoGuide = {
  id: "claude-chat-connector",
  title: "Connect rickydata to Claude.ai web chat",
  duration: "2 min",
  audience: "Users who prefer Claude.ai web chat over Claude Code or CLI",
  purpose:
    "Show how to add rickydata as a custom MCP connector in Claude.ai so marketplace tools and agents work directly in web chat.",
  pageAnchor: "/playbooks#claude-chat-setup",
  recordingPrompt:
    "Go to claude.ai/customize → Connectors → + Add custom connector → name: rickydata, URL: https://connect.rickydata.org/mcp → Connect → complete login.",
  ...videoOrUndefined("VITE_VIDEO_CLAUDE_CHAT_CONNECTOR_URL", "guide-claude-desktop.mp4")
};

/** Wallet funding on Base — shown on /playbooks#wallet-controls */
export const WALLET_FUNDING_GUIDE: VideoGuide = {
  id: "wallet-funding-and-network-safety",
  title: "Wallet funding on Base + wrong-network safety",
  duration: "15 sec",
  audience: "Users funding for MCP tool calls and agent chat",
  purpose:
    "Show the wallet funding flow on Base mainnet so users deposit USDC correctly and avoid wrong-network issues.",
  pageAnchor: "/playbooks#wallet-controls",
  recordingPrompt:
    "Open mcpmarketplace.rickydata.org/wallet, show deposit address, switch wallet network to Base, add USDC token, fund, and explain wrong-network warning + recovery policy.",
  ...videoOrUndefined("VITE_VIDEO_WALLET_FUNDING_URL", "04-wallet-funding.mp4")
};

export const RECORDING_BACKLOG: VideoGuide[] = [
  FEATURED_VIDEO_GUIDE,
  MCP_RUNTIME_LOOP_GUIDE,
  INIT_WIZARD_GUIDE,
  {
    id: "wallet-preferences-retention-autoimprove",
    title: "Wallet preferences: retention, auto-improvement, and scheduling",
    duration: "4-6 min",
    status: "record-needed",
    audience: "Agent power users and teams",
    purpose: "Clarify how conversation retention gates self-improvement and how schedule/scope settings work.",
    pageAnchor: "/playbooks#wallet-controls",
    recordingPrompt:
      "In Wallet settings, toggle Save Conversations, set retention days, enable Self-Improvement, configure schedule/scope, and run a manual self-improvement cycle."
  },
  {
    id: "per-agent-budgets-and-spend-control",
    title: "Per-agent budgets and spend controls",
    duration: "3-4 min",
    status: "record-needed",
    audience: "Ops and cost-sensitive teams",
    purpose: "Show cost guardrails and where to verify spend by agent.",
    pageAnchor: "/playbooks#wallet-controls",
    recordingPrompt:
      "Set a daily budget for one agent, show spending cards and recent transactions, then remove/update the budget."
  },
  {
    id: "byok-agent-chat",
    title: "BYOK chat flow: API key, agent list, and chat session",
    duration: "3-5 min",
    status: "record-needed",
    audience: "Users who want agent chat with their own Anthropic key",
    purpose: "Demonstrate secure API key setup and first successful chat run.",
    pageAnchor: "/playbooks#agent-chat",
    recordingPrompt:
      "Run rickydata apikey set, rickydata agents list, rickydata chat <agent-id>, and explain session persistence vs ephemeral behavior."
  },
  {
    id: "agent-as-mcp-dynamic-proxy",
    title: "Enable agents as MCP tools with zero-restart proxy",
    duration: "3-5 min",
    status: "record-needed",
    audience: "Users turning agents into callable MCP tools",
    purpose: "Show the dynamic agent proxy flow: rickydata init sets up the proxy, then enable/disable agents instantly without restarting Claude Code.",
    pageAnchor: "/playbooks#agent-as-mcp",
    recordingPrompt:
      "Run rickydata init (show proxy setup step), then rickydata mcp agent enable <agent-id>, verify tools appear in Claude Code without restart, call a tool, then rickydata mcp agent disable <agent-id> and verify tools vanish."
  },
  {
    id: "marketplace-web-tool-testing",
    title: "Marketplace UI: browse, inspect server trust data, and try a tool",
    duration: "4-6 min",
    status: "record-needed",
    audience: "Website-first users",
    purpose: "Connect UI trust signals to practical tool testing and secret setup.",
    pageAnchor: "/playbooks#marketplace-ui",
    recordingPrompt:
      "From /browse choose a server, inspect security/isolation panels, configure required secrets, run Try Tool, and interpret payment prompts."
  },
  {
    id: "custom-agent-build-and-publish",
    title: "Build, test, and publish a custom agent",
    duration: "6-8 min",
    status: "record-needed",
    audience: "Builders creating production agents",
    purpose: "Cover end-to-end lifecycle from draft creation to publish and post-publish usage.",
    pageAnchor: "/playbooks#agent-build",
    recordingPrompt:
      "Use /build to create an agent, test chat behavior, configure required MCP secrets, publish, and verify it appears on /my-agents and /agents."
  },
  {
    id: "canvas-workflow-cli-and-ui",
    title: "Canvas workflows from CLI and UI",
    duration: "5-7 min",
    status: "record-needed",
    audience: "Advanced users building automated multi-step flows",
    purpose: "Show how workflows are created, executed, and monitored across interfaces.",
    pageAnchor: "/playbooks#canvas",
    recordingPrompt:
      "List workflows with CLI, execute one run, inspect run logs, then open workspace/canvas UI and show the same run status."
  }
];
