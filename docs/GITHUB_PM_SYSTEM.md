# GitHub Project Management System

rickydata GitHub is a project management interface for AI-assisted software development. It connects to your GitHub repositories via a GitHub App installation and uses MiniMax-M2.7 to autonomously resolve issues at ~$0.02 per issue.

Available at [github.rickydata.org](https://github.rickydata.org).

## Architecture Overview

```
GitHub Repos (via GitHub App)
     │
     ▼
┌──────────────────────┐
│  rickydata GitHub     │  React frontend (Vite + TailwindCSS)
│  github.rickydata.org │  Privy auth, cross-repo dashboard
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Agent Gateway        │  Express API (agents.rickydata.org)
│  - Issue intelligence │  Auto-triage, labels, relationships
│  - MiniMax runner     │  6 tools, 20-turn agent sessions
│  - Sprint management  │  Milestones, velocity, AI planning
│  - PR review queue    │  Structured agentic reviews
└──────────────────────┘
```

---

## Getting Started

### 1. Sign in

Navigate to [github.rickydata.org](https://github.rickydata.org) and connect your wallet using Privy. Supported login methods:

- Google
- GitHub
- Email
- Wallet (MetaMask, WalletConnect, etc.)

### 2. Connect a GitHub repository

Go to **Settings** and claim a GitHub App installation. The rickydata GitHub App must be installed on the repository's organization or user account. Once claimed, the system begins syncing issues, PRs, and milestones.

### 3. Configure trust tier

Each installation has a **trust tier** that controls what the AI agent is allowed to do:

| Tier | Permissions |
|------|-------------|
| `read_only` | Agent can analyze issues and suggest fixes but cannot open PRs |
| `pr_contributor` | Agent can create branches and open PRs autonomously |

### 4. Select AI provider

Set the default AI provider in Settings. **MiniMax** is the recommended provider -- it delivers autonomous issue resolution at ~$0.02 per issue. Per-repo overrides are available if you need a different provider for specific repositories.

---

## Dashboard

The dashboard is the default landing page. It provides a cross-repo overview of all connected repositories.

### Needs Attention

A prioritized list of items requiring action:

- **Open PRs** awaiting review
- **Untriaged issues** not yet labeled or classified
- **Sprint items** in progress or overdue
- **Agent questions** where the AI needs human input

### Repository Cards

Each connected repo appears as a card showing:

- Open issue and PR counts
- Active sprint progress (if a sprint is running)
- Quick links to issues, PRs, and sprint board

### Recent Activity

A chronological feed of recent events across all repos -- merged PRs, resolved issues, new agent runs.

---

## Issues

Browse and manage GitHub issues across all connected repositories.

### Browsing

- View all issues or filter by repository using the repo selector
- Filter by **state** (open, closed) and **difficulty** (simple, medium, complex)
- Issues display title, labels, assignee, and difficulty classification

### Issue Detail Panel

Click any issue to open the detail panel, which shows:

- Full issue description and body
- Applied labels and relationships to other issues
- Intelligence comment (auto-triage results, commit links, active areas)

### Resolve with AI

Click **Resolve with AI** on any open issue to trigger the MiniMax agent. The agent:

1. Reads the issue and gathers repository context
2. Generates a fix using up to 20 tool-assisted turns
3. Creates a PR if confidence is high enough, or queues for review

Resolution typically costs ~$0.02 and completes in under 2 minutes.

---

## Sprint Management

Sprints map to GitHub milestones and provide structured iteration planning.

### Creating a Sprint

Create a sprint by selecting a milestone from any connected repository. The system imports all issues assigned to that milestone.

### AI Plan

Click **AI Plan** to get an AI-generated sprint suggestion. The planner analyzes:

- Historical velocity (issues completed per sprint)
- Issue difficulty estimates
- Current team capacity

It recommends which issues to include and flags potential overcommitment.

### Kanban Board

The sprint board organizes issues into columns:

| Column | Meaning |
|--------|---------|
| **To Do** | Assigned to sprint, not yet started |
| **In Progress** | Work has begun (linked PR or assignee active) |
| **Done** | Issue closed or PR merged |

### Backlog

Issues not assigned to any sprint appear in the backlog section. Drag issues from the backlog into the sprint, or use AI Plan to populate automatically.

### Velocity and Retrospective

After a sprint closes, view stats including:

- Issues completed vs. planned
- Average cycle time
- Difficulty distribution of completed work

---

## Pull Requests and Review

### Cross-Repo PR List

View all open PRs across connected repositories. PRs created by the AI agent are marked with a **Pending Human Review** badge when they were routed to the review queue (confidence between 0.40 and 0.70).

### PR Detail Panel

Click a PR to see:

- CI check status (pass/fail/pending)
- Diff preview
- Agent reasoning and confidence score (for AI-generated PRs)

### Review Queue

The review queue surfaces AI-generated PRs that need human approval before merge. Each entry shows the agent's confidence score, the diff summary, and test results.

---

## Agent Monitor

The Agent Monitor lets you trigger and observe AI issue resolution in real time.

### Triggering a Resolution

1. Select a **repository** from the dropdown
2. Enter the **issue number**
3. Click **Execute**

### Live Streaming

Once triggered, the monitor streams agent activity via SSE (Server-Sent Events):

- **Tool call timeline** -- Each tool the agent invokes (file reads, grep, edits) appears in sequence
- **Diff preview** -- See the code changes as they are generated
- **Cost tracker** -- Running total of inference cost for the current run

The stream updates in real time until the agent completes or times out.

---

## Settings

### GitHub App Installations

Manage which GitHub App installations are connected to your account. Each installation covers one GitHub organization or user account and all repositories the App has access to.

### Trust Tiers

Control the autonomy level per installation:

| Setting | Effect |
|---------|--------|
| `read_only` | Agent analyzes but cannot modify repos |
| `pr_contributor` | Agent can create branches and open PRs |

### AI Provider

Set the default AI provider for issue resolution. MiniMax-M2.7 is recommended for cost efficiency. Override at the per-repo level if needed.

### Kill Switch

The kill switch immediately pauses all automation -- no new agent runs will start and pending runs are cancelled. Use this if you need to halt AI activity across all repos.

### Skill Automation

View the status of automated skill improvements. When PRs merge, the system can automatically update resolution skills based on what worked.

---

## Related Documentation

- [Issue Management](/docs/ISSUE_MANAGEMENT.md) -- Auto-triage, labels, relationships API
- [Autonomous Pipeline](/docs/AUTONOMOUS_PIPELINE.md) -- Pipeline architecture and routing
- [SDK Quick Start](/docs/SDK_QUICKSTART.md) -- TypeScript SDK for programmatic access
- [Pipeline Client API](/docs/PIPELINE_CLIENT_API.md) -- REST API for issue resolution
