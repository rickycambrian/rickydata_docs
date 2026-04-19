import React from 'react';
import Layout from '@theme/Layout';
import { Icons } from '@site/src/components/Icons';
import Pill from '@site/src/components/Pill';
import Btn from '@site/src/components/Btn';
import Collapsible from '@site/src/components/Collapsible';
import KVTable from '@site/src/components/KVTable';
import FeatureGrid, { FeatureCard } from '@site/src/components/FeatureGrid';

export default function Home(): JSX.Element {
  return (
    <Layout
      title="The docs for agents that use tools"
      description="rickydata is a marketplace and runtime for Claude Code agents with MCP tools. Browse 5,000+ tools, pay per call with x402, and build trustless agents on ERC-8004."
    >
      <main>
        <div className="rd-doc rd-doc-wide">
          <div
            style={{
              display: 'flex',
              gap: 8,
              fontSize: '0.75rem',
              color: 'var(--rd-muted, var(--ifm-color-emphasis-600))',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 500,
            }}
          >
            <span>Docs</span>
            <span>/</span>
            <span style={{ color: 'var(--rd-text, var(--ifm-color-emphasis-900))' }}>Introduction</span>
          </div>

          <h1>
            The docs for <span className="rd-accent">agents that use tools</span>
          </h1>
          <p className="lede">
            rickydata is a marketplace and runtime for Claude Code agents with MCP tools.
            Browse 5,000+ tools, pay per call with x402, and build trustless agents on ERC-8004.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 18, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
            <Btn variant="primary" to="/docs/getting-started/installation" icon={<Icons.rocket width={14} height={14} />}>
              Start building
            </Btn>
            <Btn variant="secondary" to="/docs/marketplace/overview" icon={<Icons.bot width={14} height={14} />}>
              Browse agents
            </Btn>
            <span style={{ alignSelf: 'center' }}>
              <Pill tone="success" pulse>All systems normal</Pill>
            </span>
          </div>

          <h2 id="what">What is rickydata?</h2>
          <p>
            rickydata sits between your client and the <code>5,284 tools</code> in the marketplace.
            It authenticates calls, routes them to the right MCP server, settles micropayments on-chain,
            and attaches signed attestations to every response.
          </p>
          <p>You use it three ways:</p>
          <ul>
            <li><strong>Chat with agents</strong> — pre-built agents have curated tool access and example prompts.</li>
            <li><strong>Connect your own client</strong> — Claude Code, Cursor, Zed, and anything else that speaks MCP.</li>
            <li><strong>Build</strong> — publish a skill, ship an agent, or run an MCP server of your own.</li>
          </ul>

          <h2 id="paths">Pick a path</h2>
          <FeatureGrid>
            <FeatureCard
              icon={<Icons.plug width={16} height={16} />}
              title="Connect a client"
              description="One command. Works with Claude Code, Cursor, Zed, Continue, and any MCP client."
              cta="Quickstart"
              to="/docs/getting-started/installation"
            />
            <FeatureCard
              icon={<Icons.bot width={16} height={16} />}
              title="Chat with an agent"
              description="Browse agents with purpose-built skills. Start a text or voice conversation."
              cta="Browse agents"
              to="/playground"
            />
            <FeatureCard
              icon={<Icons.node width={16} height={16} />}
              title="TypeScript SDK"
              description="A typed client for building apps. Handles auth, streaming, and payment."
              cta="Install SDK"
              to="/docs/sdk/overview"
            />
            <FeatureCard
              icon={<Icons.terminal width={16} height={16} />}
              title="HTTP API"
              description="Full control over routing, sessions, and x402 settlement with raw HTTP."
              cta="API reference"
              to="/docs/sdk/overview"
            />
            <FeatureCard
              icon={<Icons.rocket width={16} height={16} />}
              title="Build an agent"
              description="Wrap your skills into a published agent with example prompts and tool permissions."
              cta="Start building"
              to="/docs/agents/overview"
            />
            <FeatureCard
              icon={<Icons.shield width={16} height={16} />}
              title="Security model"
              description="Understand the TEE trust chain, attestations, and what the gateway does with your data."
              cta="Read the model"
              to="/docs/architecture/security-model"
            />
          </FeatureGrid>

          <h2 id="concepts">Core concepts</h2>
          <Collapsible
            icon={<Icons.bot width={16} height={16} />}
            title="Agent"
            sub="A curated bundle of skills, tools, and example prompts."
            defaultOpen
          >
            <p>
              Agents are the unit of use. Each one is a <code>Claude Code-compatible</code> package:
              a system prompt, a skill definition, the tools it's allowed to call, and a set of example prompts.
            </p>
            <p>Anyone can publish an agent. Agents can be free, paid per call via x402, or token-gated.</p>
          </Collapsible>
          <Collapsible
            icon={<Icons.plug width={16} height={16} />}
            title="MCP server"
            sub="A typed bag of tools an agent can call."
          >
            <p>
              MCP servers expose tool definitions over JSON-RPC. rickydata routes calls to the right server,
              handles auth, and attaches a signed receipt to every response.
            </p>
          </Collapsible>
          <Collapsible
            icon={<Icons.coin width={16} height={16} />}
            title="x402 payments"
            sub="HTTP-native micropayments. Per call. On-chain."
          >
            <p>
              When a tool call exceeds your free tier, the server returns <code>402 Payment Required</code> with a quote.
              Your wallet signs a USDC transfer permission, the gateway settles on Base L2, and the tool runs.
            </p>
            <p>End-to-end latency is about 600ms, dominated by the EVM RPC round-trip.</p>
          </Collapsible>
          <Collapsible
            icon={<Icons.chain width={16} height={16} />}
            title="ERC-8004 trustless agents"
            sub="On-chain identity, reputation, and attestations across 45+ chains."
          >
            <p>
              Agents registered under ERC-8004 get a canonical on-chain identity NFT, cross-chain
              reputation aggregation, and verifiable attestations signed by the gateway's TEE.
            </p>
          </Collapsible>

          <h2 id="stack">The stack</h2>
          <KVTable
            rows={[
              ['Gateway', <>Fastify + custom router. Authenticates, routes, settles x402, attaches attestations.</>],
              ['Execution', <>Per-agent isolation via <code>gVisor</code> sandboxes. Signed at boot by a TEE trust chain.</>],
              ['Payments', <>USDC on Base L2. x402 settlement averages 400ms; full request adds ~200ms.</>],
              ['Identity', <>ERC-8004 on 45+ EVM chains via <code>8004scan</code>. Per-agent NFTs, per-call attestations.</>],
              ['SDK', <>TypeScript SDK <code>@rickydata/sdk</code> ships typed tool definitions and MCP transport.</>],
            ]}
          />
        </div>
      </main>
    </Layout>
  );
}
