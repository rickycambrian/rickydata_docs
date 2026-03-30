import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
// import BrowserOnly from '@docusaurus/BrowserOnly';

const FEATURES = [
  {
    title: 'SDK',
    description: 'TypeScript SDK for MCP tools, agent chat, canvas workflows, and wallet management.',
    link: '/docs/sdk/overview',
  },
  {
    title: 'MCP',
    description: 'Connect once to thousands of MCP servers. Search, enable, call, disable — all wallet-scoped.',
    link: '/docs/mcp/overview',
  },
  {
    title: 'Agents',
    description: 'BYOK Claude agents with MCP tool access, voice chat, and self-improvement.',
    link: '/docs/agents/overview',
  },
  {
    title: 'Marketplace',
    description: 'Browse servers, manage tools, chat with agents, and control spending.',
    link: '/docs/marketplace/overview',
  },
];

const RESOURCES = [
  { label: 'Changelog', to: '/changelog' },
  { label: 'Status', to: '/status' },
  { label: 'Playground', to: '/playground' },
  { label: 'GitHub', href: 'https://github.com/rickycambrian/rickydata_SDK' },
];

function Hero() {
  return (
    <section
      style={{
        padding: '4rem 2rem 3rem',
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          fontSize: '2.75rem',
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: '1rem',
        }}
      >
        RickyData Docs
      </h1>
      <p
        style={{
          fontSize: '1.25rem',
          color: 'var(--ifm-color-emphasis-700)',
          maxWidth: 600,
          marginBottom: '2rem',
        }}
      >
        Install once, authenticate once, then discover and use thousands of MCP servers and AI agents.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link
          className="button button--primary button--lg"
          to="/docs/getting-started/installation"
        >
          Get Started
        </Link>
        <Link
          className="button button--secondary button--lg"
          to="/playground"
        >
          Try Playground
        </Link>
      </div>
      {/* FreeTierBar will be added back once RickyDataProvider is in the auth chain */}
    </section>
  );
}

function Quickstart() {
  return (
    <section
      style={{
        padding: '2.5rem 2rem',
        maxWidth: 960,
        margin: '0 auto',
        borderTop: '1px solid var(--ifm-color-emphasis-200)',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Three commands to working MCP
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          { step: '1', label: 'Install CLI', code: 'npm install -g rickydata' },
          { step: '2', label: 'Authenticate + connect', code: 'rickydata init' },
          { step: '3', label: 'Discover servers', code: 'rickydata mcp search "brave"' },
        ].map((item) => (
          <div
            key={item.step}
            style={{
              padding: '1.25rem',
              borderRadius: 8,
              background: 'var(--ifm-background-surface-color, var(--ifm-color-emphasis-100))',
              border: '1px solid var(--ifm-color-emphasis-200)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--ifm-color-primary)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {item.step}
              </span>
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </div>
            <code
              style={{
                display: 'block',
                padding: '0.5rem 0.75rem',
                borderRadius: 4,
                background: 'var(--ifm-color-emphasis-100)',
                fontSize: '0.85rem',
                overflowX: 'auto',
              }}
            >
              {item.code}
            </code>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section
      style={{
        padding: '2.5rem 2rem',
        maxWidth: 960,
        margin: '0 auto',
        borderTop: '1px solid var(--ifm-color-emphasis-200)',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Explore the platform
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {FEATURES.map((feature) => (
          <Link
            key={feature.title}
            to={feature.link}
            style={{
              display: 'block',
              padding: '1.25rem',
              borderRadius: 8,
              background: 'var(--ifm-background-surface-color, var(--ifm-color-emphasis-100))',
              border: '1px solid var(--ifm-color-emphasis-200)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.15s ease-out',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {feature.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-700)', margin: 0 }}>
              {feature.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ResourcesStrip() {
  return (
    <section
      style={{
        padding: '2rem',
        maxWidth: 960,
        margin: '0 auto',
        borderTop: '1px solid var(--ifm-color-emphasis-200)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          fontSize: '0.9rem',
        }}
      >
        <span style={{ color: 'var(--ifm-color-emphasis-600)' }}>Also:</span>
        {RESOURCES.map((r) =>
          r.href ? (
            <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer">
              {r.label}
            </a>
          ) : (
            <Link key={r.label} to={r.to}>
              {r.label}
            </Link>
          ),
        )}
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="RickyData Docs"
      description="MCP tools, AI agents, and wallet-powered workflows"
    >
      <main>
        <Hero />
        <Quickstart />
        <FeatureGrid />
        <ResourcesStrip />
      </main>
    </Layout>
  );
}
