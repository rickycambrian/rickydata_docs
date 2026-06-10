import React from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const primaryLinks = [
  { label: 'CLI quickstart', to: '/docs/getting-started/quickstart-cli' },
  { label: 'SDK overview', to: '/docs/sdk/overview' },
  { label: 'MCP gateway', to: '/docs/mcp/overview' },
  { label: 'Agent runtime', to: '/docs/agents/overview' },
];

const productAreas = [
  {
    title: 'MCP Gateway',
    body: 'Connect any MCP client to one hosted Streamable HTTP endpoint, search the server catalog, enable selected tools, and call them without maintaining local server installs.',
    to: '/docs/mcp/search-enable-call',
  },
  {
    title: 'Agent Gateway',
    body: 'Run hosted chat, voice, screenshare, and workflow agents that can use MCP tools while keeping model access, wallet identity, and tool secrets separated.',
    to: '/docs/agents/overview',
  },
  {
    title: 'Wallet and Billing',
    body: 'Use wallet tokens, scoped secrets, spending policies, and x402 payment boundaries so agents can execute tools without exposing credentials.',
    to: '/docs/wallet-billing/overview',
  },
  {
    title: 'SDK and React Components',
    body: 'Embed RickyData capabilities in your own product using typed SDK clients, React hooks, and chat components for wallet-aware agent experiences.',
    to: '/docs/sdk/overview',
  },
];

export default function Home(): JSX.Element {
  return (
    <Layout
      title="RickyData Docs - MCP, Agents, SDK, Wallets, and Gateway Operations"
      description="Documentation for RickyData MCP Gateway, Agent Gateway, SDKs, wallet billing, marketplace workflows, and secure agent tool execution."
    >
      <Head>
        <link rel="canonical" href="https://docs.rickydata.org/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="RickyData Docs" />
        <meta property="og:title" content="RickyData Docs - MCP, Agents, SDK, Wallets, and Gateway Operations" />
        <meta property="og:description" content="Start here for RickyData MCP Gateway, Agent Gateway, SDKs, wallet billing, marketplace workflows, and secure agent tool execution." />
        <meta property="og:url" content="https://docs.rickydata.org/" />
        <meta property="og:image" content="https://docs.rickydata.org/img/rickydata-social-card.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://rickydata.org/#organization',
                name: 'RickyData',
                url: 'https://rickydata.org/',
              },
              {
                '@type': 'WebSite',
                '@id': 'https://docs.rickydata.org/#website',
                name: 'RickyData Docs',
                url: 'https://docs.rickydata.org/',
                description: 'Documentation for RickyData MCP Gateway, Agent Gateway, SDKs, wallets, billing, and marketplace workflows.',
                publisher: { '@id': 'https://rickydata.org/#organization' },
              },
              {
                '@type': 'TechArticle',
                '@id': 'https://docs.rickydata.org/#docs-home',
                headline: 'RickyData Docs',
                description: 'Start page for building with RickyData MCP Gateway, Agent Gateway, SDKs, and wallet-scoped tool execution.',
                url: 'https://docs.rickydata.org/',
              },
            ],
          })}
        </script>
      </Head>

      <main>
        <section className="container margin-vert--xl">
          <p className="text--primary text--bold">RickyData product documentation</p>
          <h1>Build AI agents with hosted MCP tools, scoped secrets, and wallet-aware execution.</h1>
          <p className="hero__subtitle">
            RickyData gives developers a hosted MCP Gateway, Agent Gateway, SDK, marketplace, and wallet billing model for production agent workflows. These docs explain how to connect clients, enable tools, store secrets safely, run agents, and verify live gateway behavior.
          </p>
          <div className="margin-top--lg">
            {primaryLinks.map(link => (
              <Link key={link.to} className="button button--primary margin-right--sm margin-bottom--sm" to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="container margin-vert--xl">
          <h2>Choose the product surface you need</h2>
          <div className="row">
            {productAreas.map(area => (
              <div key={area.title} className="col col--6 margin-bottom--lg">
                <article className="padding--lg" style={{ border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 8, height: '100%' }}>
                  <h3>{area.title}</h3>
                  <p>{area.body}</p>
                  <Link to={area.to}>Read the guide</Link>
                </article>
              </div>
            ))}
          </div>
        </section>

        <section className="container margin-vert--xl">
          <h2>What agents should understand before using RickyData</h2>
          <p>
            RickyData separates free discovery, bearer authentication, wallet-scoped server secrets, model access, and paid x402 tool execution. An agent should not describe a payment as settled without response evidence, should not expose provider keys or wallet tokens, and should verify current gateway health before diagnosing client configuration.
          </p>
          <p>
            For machine-readable guidance, start with <a href="https://docs.rickydata.org/llms.txt">llms.txt</a>, <a href="https://docs.rickydata.org/llms-full.txt">llms-full.txt</a>, and the public <a href="https://docs.rickydata.org/skill.md">skill file</a>. For human implementation work, begin with the CLI quickstart, then move to the SDK, MCP, wallet billing, and architecture guides as your product needs become more specific.
          </p>
        </section>
      </main>
    </Layout>
  );
}
