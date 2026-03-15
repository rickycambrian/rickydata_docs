# Research-Driven Codebase Improvement

## Overview

`/research-improve` is a Claude Code skill available across all rickydata repositories that systematically discovers research-backed improvements for your codebase. It combines deep codebase analysis with academic paper discovery via the Research Paper Analyst MCP agent to produce concrete, prioritized implementation plans.

## Quick Start

### 1. Prerequisites

```bash
# Install the rickydata CLI
npm install -g rickydata

# Run the full setup wizard (includes proxy registration)
rickydata init

# Or just connect the MCP proxy if already set up
rickydata mcp proxy-connect
```

After connecting, restart Claude Code to pick up the MCP server.

### 2. Verify Setup

```bash
# Check the proxy is connected
claude mcp list | grep rickydata-proxy

# Check the research agent is enabled
rickydata mcp agent list
# Should show: research-paper-analyst-geo-uploader
```

If the research agent isn't enabled:

```bash
rickydata mcp agent enable research-paper-analyst-geo-uploader
```

### 3. Run It

Open Claude Code in any rickydata repo and type:

```
/research-improve
```

That's it. The pipeline will auto-detect the best focus areas from your codebase.

## Commands

### `/research-improve [focus]`

Single-agent sequential pipeline. Best for targeted improvements.

```
/research-improve                          # Auto-detect focus area
/research-improve "query optimization"     # Specific focus
/research-improve "SSE streaming"          # Specific focus
/research-improve explore                  # Phase 1 only (no MCP calls)
/research-improve discover                 # Phases 1-2 (exploration + papers)
```

### `/research-improve-team [focus]`

Team-mode with 4 coordinated agents. Best for comprehensive improvement efforts.

```
/research-improve-team "dynamic agent proxy"
```

Spawns 4 teammates with task dependencies:
1. **Explorer** — scans the codebase for gaps
2. **Researcher** — discovers papers via MCP tools
3. **Synthesizer** — produces implementation plan
4. **Documenter** — records verified patterns as new skills

## How It Works

### Phase 1: Codebase Exploration

A lightweight agent (Haiku model) reads your codebase and produces a structured gap report:
- Architecture summary with module map
- TODOs, FIXMEs, unimplemented stubs with `file:line` references
- Test coverage assessment (test files vs source files)
- Technical debt inventory
- Top 3-5 improvement areas ranked by impact

**No external calls needed.** Use `/research-improve explore` to run only this phase.

### Phase 2: Paper Discovery & Extraction

A research specialist agent (Sonnet model) uses the Research Paper Analyst MCP tools:

1. **Sweep 1 — arXiv**: Searches academic papers with `discover_papers` across relevant categories (`cs.DB`, `cs.AI`, `cs.SE`, etc.). Targets 30-50 results per query.
2. **Sweep 2 — Web/Industry**: Uses `exa_search` with `deep_research` mode for engineering blog posts, conference talks, and industry reports.
3. **Sweep 3 — Broadening**: If needed, uses `agent_chat` to explore adjacent research areas.

Results are ranked 1-5 on applicability. The top 3-5 papers (score 4-5) get full content extraction via `extract_paper_content`.

### Phase 3: Synthesis

A synthesis agent (Sonnet model) cross-references the exploration report with paper analyses and produces:
- Prioritized improvements with effort/impact estimates
- Specific target files and implementation steps
- Research evidence and caveats for each recommendation
- Verification strategies

## Example Output

```markdown
## Research-Driven Improvement Plan

**Repository**: rickydata_SDK
**Focus**: dynamic agent proxy
**Date**: 2026-03-15

### Research Sources
| # | Paper | Key Technique | Relevance |
|---|-------|---------------|-----------|
| 1 | OSWorld-MCP (2510.24563) | Tool description structuring | 5/5 |
| 2 | Backoff Protocol Instability (2602.21315) | Jittered reconnect strategies | 4/5 |
| 3 | MCP Security Analysis (Queen's U.) | Tool poisoning detection | 4/5 |

### Recommended Improvements
1. **SSE Reconnection with Jitter** — Small effort, High impact
   - Research: Backoff instability paper — jittered retry avoids correlated storms
   - Target: `packages/core/src/agent/agent-client.ts`
   - Steps: Add reconnection logic, implement jitter, add max retry limit

2. **MCP Tool Schema Validation** — Medium effort, High impact
   - Research: OSWorld-MCP — structured descriptions improve invocation rate by 12%
   - Target: `packages/core/src/mcp/agent-mcp-proxy.ts`
   - Steps: Validate schemas on proxy, normalize descriptions, add error boundaries
```

## Available Repositories

The pipeline is installed in all rickydata repos:

| Repository | Status |
|-----------|--------|
| `rickydata_SDK` | Full setup (4 agents + 2 skills) |
| `knowledgeflow_db` | Standard setup (3 agents + 2 skills) |
| `ai_research` | Standard setup (3 agents + 2 skills) |
| `rickydata_github` | Full setup (4 agents + 2 skills) |

## Troubleshooting

### "rickydata-proxy not connected"

Run `rickydata mcp proxy-connect` and restart Claude Code.

### Phase 2 returns no papers

- Try broader search terms (problem domain instead of exact technique)
- The research agent uses `agent_chat` as a fallback for exploratory search
- Verify the agent is enabled: `rickydata mcp agent list`

### Custom agents not found

Agents load at session start. If you just created or modified agent files, restart Claude Code.

### Team mode doesn't work

Check that `.claude/settings.json` has `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"` and restart the session.

## Architecture

```
User runs /research-improve
    │
    ├── Phase 1: codebase-explorer (Haiku)
    │   └── Read-only codebase scan → gap report
    │
    ├── Phase 2: paper-discoverer (Sonnet)
    │   ├── discover_papers (arXiv)  ─┐
    │   ├── exa_search (web)         ├── via rickydata-proxy MCP
    │   ├── agent_chat (broadening)  │
    │   └── extract_paper_content    ─┘
    │
    └── Phase 3: research-synthesizer (Sonnet)
        └── Gap × Paper cross-reference → implementation plan
```

The `rickydata-proxy` MCP server provides the bridge between Claude Code and the Research Paper Analyst agent hosted on the Agent Gateway. Tools are dynamically loaded — the proxy watches `~/.rickydata/mcp-agents.json` and hot-swaps tools without requiring Claude Code restart.
