import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

/* ── Journey cards — asymmetric grid matching docs.rickydata.org ── */
const JOURNEYS = [
  {
    title: 'Get started',
    description:
      'Two paths: connect via Claude.ai web chat (no CLI) or install the CLI for full local setup. Pick whichever fits.',
    link: '/docs/getting-started/installation',
    featured: true,
  },
  {
    title: 'MCP server runtime',
    description: 'Search, enable, call tools, then disable and audit active servers.',
    link: '/docs/mcp/search-enable-call',
    cta: 'Open journey',
  },
  {
    title: 'Wallet + policy',
    description: 'Funding, Base-network safety, retention, budgets, self-improvement.',
    link: '/docs/wallet-billing/overview',
    cta: 'Open journey',
  },
  {
    title: 'Agents + canvas',
    description: 'BYOK chat, agent-as-MCP, canvas workflows, voice, sessions.',
    link: '/docs/agents/overview',
    cta: 'Open journey',
  },
  {
    title: 'Marketplace',
    description: 'Browse servers, manage tools, chat with agents, control spending.',
    link: '/docs/marketplace/overview',
    cta: 'Open journey',
  },
];

const RESOURCES = [
  { label: 'Changelog', to: '/changelog' },
  { label: 'Status', to: '/status' },
  { label: 'Playground', to: '/playground' },
  { label: 'GitHub', href: 'https://github.com/cambriannetwork' },
];

function Hero() {
  return (
    <section style={{ padding: '2rem 2rem 0', maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          padding: '3rem 2.5rem',
          borderRadius: 14,
          background: 'var(--ifm-background-surface-color)',
          border: '1px solid var(--ifm-color-emphasis-200)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--ifm-heading-font-family)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: 'var(--ifm-color-primary)',
            marginBottom: '1rem',
            display: 'block',
          }}
        >
          Public Docs
        </span>
        <h1
          style={{
            fontSize: 'clamp(1.875rem, 3vw, 2.5rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '0.75rem',
          }}
        >
          Production docs for MCP onboarding, wallet controls, and agent operations
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--ifm-color-emphasis-700)',
            maxWidth: 640,
            marginBottom: '2rem',
          }}
        >
          Install once, authenticate once, then discover and use 5,000+ MCP servers and AI agents.
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
            to="/docs/getting-started/quickstart-cli"
          >
            Browse Playbooks
          </Link>
        </div>
      </div>
    </section>
  );
}

function Quickstart() {
  return (
    <section style={{ padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}
      >
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
          { step: '3', label: 'Discover and enable servers', code: 'rickydata mcp search "brave"' },
        ].map((item) => (
          <div
            key={item.step}
            style={{
              padding: '1.25rem',
              borderRadius: 10,
              background: 'var(--ifm-background-surface-color)',
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
                  color: '#1a1816',
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
                borderRadius: 6,
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

function JourneyGrid() {
  const featured = JOURNEYS.find((j) => j.featured);
  const others = JOURNEYS.filter((j) => !j.featured);

  return (
    <section
      style={{
        padding: '3rem 2rem',
        maxWidth: 1200,
        margin: '0 auto',
        borderTop: '1px solid var(--ifm-color-emphasis-200)',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Choose your journey
      </h2>
      <div
        style={{
          width: '2rem',
          height: 2,
          background: 'var(--ifm-color-primary)',
          marginBottom: '2rem',
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: '1rem',
        }}
      >
        {/* Featured card spans 2 rows */}
        {featured && (
          <Link
            to={featured.link}
            style={{
              gridRow: '1 / 3',
              gridColumn: '1 / 2',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2rem',
              borderRadius: 10,
              background: 'var(--ifm-background-surface-color)',
              border: '1px solid var(--ifm-color-emphasis-300)',
              textDecoration: 'none',
              color: 'inherit',
              minHeight: 200,
              transition: 'border-color 150ms ease-out',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {featured.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)', margin: 0 }}>
              {featured.description}
            </p>
          </Link>
        )}
        {/* Smaller cards */}
        {others.map((journey) => (
          <Link
            key={journey.title}
            to={journey.link}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.25rem',
              borderRadius: 10,
              background: 'var(--ifm-background-surface-color)',
              border: '1px solid var(--ifm-color-emphasis-200)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 150ms ease-out',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {journey.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)', margin: 0 }}>
                {journey.description}
              </p>
            </div>
            {journey.cta && (
              <span
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--ifm-color-primary)',
                  fontWeight: 500,
                }}
              >
                {journey.cta}
              </span>
            )}
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
        maxWidth: 1200,
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
      description="Production docs for MCP onboarding, wallet controls, and agent operations"
    >
      <main>
        <Hero />
        <Quickstart />
        <JourneyGrid />
        <ResourcesStrip />
      </main>
    </Layout>
  );
}
