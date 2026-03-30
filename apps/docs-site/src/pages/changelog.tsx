import type { CSSProperties } from 'react';
import Layout from '@theme/Layout';

interface ChangelogEntry {
  package: string;
  version: string;
  date: string;
  changes: string[];
}

const entries: ChangelogEntry[] = [
  {
    package: '@rickydata/chat',
    version: 'v0.1.1',
    date: '2026-03-30',
    changes: [
      'Initial public release of AgentChatEmbed component',
      'Inline chat widget with useAgentChat hook',
      'ChatMessageList and ChatInputBar sub-components',
      'Supports BYOK (Bring Your Own Key) and free-tier modes',
      'Designed for docs embedding via BrowserOnly pattern',
    ],
  },
  {
    package: '@rickydata/react',
    version: 'v0.1.5',
    date: '2026-03-30',
    changes: [
      'Added FreeTierBar component (daily usage visualization)',
      'Added ProviderSettingsCard (provider config display)',
      'Added WalletStatusBadge (wallet connection status)',
      'Added UsageDashboard (comprehensive usage metrics)',
      'All components use --rd-* CSS custom properties',
      'Graceful unauthenticated fallbacks',
    ],
  },
  {
    package: 'rickydata',
    version: 'v1.2.5',
    date: '2026-03-29',
    changes: [
      'Added `default` export condition to all subpath exports',
      'Fixed webpack resolution for `rickydata/agent`, `rickydata/wallet` etc.',
      '40+ CLI commands for MCP server management',
      'TypeScript SDK with full type definitions',
    ],
  },
  {
    package: 'rickydata',
    version: 'v1.2.0',
    date: '2026-03-15',
    changes: [
      '`rickydata init` setup wizard',
      '`rickydata mcp search` — discover 5,000+ MCP servers',
      '`rickydata mcp enable/disable` — manage active servers',
      '`rickydata auth login` — wallet-based authentication via Privy',
      'Self-verifying `mcpwt_` wallet tokens (30-day expiry)',
    ],
  },
  {
    package: 'RickyData Docs Site',
    version: 'v1.0.0',
    date: '2026-03-30',
    changes: [
      'Migrated from custom Vite/React SPA to Docusaurus 3.9',
      '31 MDX docs across 8 categories',
      'OKLCH design system with warm amber/ochre palette',
      'Interactive SDK components embedded in docs',
      'Privy wallet auth integration',
      'Dark theme default',
    ],
  },
];

const styles: Record<string, CSSProperties> = {
  main: {
    padding: '3rem 1.5rem',
    maxWidth: 800,
    margin: '0 auto',
  },
  heading: {
    fontFamily: 'var(--ifm-heading-font-family)',
    fontSize: '2.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--ifm-color-emphasis-600)',
    fontSize: '1.05rem',
    marginBottom: '2.5rem',
    lineHeight: 1.6,
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  card: {
    background: 'var(--ifm-background-surface-color)',
    border: '1px solid var(--ifm-color-emphasis-200)',
    borderRadius: 10,
    padding: '1.5rem',
    transition: 'border-color 250ms cubic-bezier(0.25, 1, 0.5, 1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.625rem',
    marginBottom: '1rem',
  },
  badge: {
    display: 'inline-block',
    background: 'var(--ifm-color-primary)',
    color: 'oklch(20% 0.005 60)',
    fontFamily: 'var(--ifm-font-family-monospace)',
    fontSize: '0.8rem',
    fontWeight: 600,
    padding: '0.2rem 0.6rem',
    borderRadius: 5,
    lineHeight: 1.4,
  },
  packageName: {
    fontFamily: 'var(--ifm-font-family-monospace)',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'var(--ifm-color-emphasis-800)',
  },
  date: {
    color: 'var(--ifm-color-emphasis-600)',
    fontSize: '0.85rem',
    marginLeft: 'auto',
  },
  list: {
    margin: 0,
    paddingLeft: '1.25rem',
    listStyle: 'disc',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  listItem: {
    fontSize: '0.925rem',
    lineHeight: 1.55,
    color: 'var(--ifm-color-emphasis-800)',
  },
  code: {
    fontFamily: 'var(--ifm-font-family-monospace)',
    fontSize: '0.85em',
    background: 'var(--ifm-color-emphasis-100)',
    padding: '0.15em 0.35em',
    borderRadius: 3,
  },
};

function renderText(text: string): (string | JSX.Element)[] {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} style={styles.code}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function Changelog(): JSX.Element {
  return (
    <Layout title="Changelog" description="RickyData release notes and version history">
      <main style={styles.main}>
        <h1 style={styles.heading}>Changelog</h1>
        <p style={styles.subtitle}>
          Release notes for the RickyData SDK, component libraries, and docs site.
        </p>
        <div style={styles.timeline}>
          {entries.map((entry) => (
            <article key={`${entry.package}-${entry.version}`} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.badge}>{entry.version}</span>
                <span style={styles.packageName}>{entry.package}</span>
                <time style={styles.date} dateTime={entry.date}>
                  {entry.date}
                </time>
              </div>
              <ul style={styles.list}>
                {entry.changes.map((change, i) => (
                  <li key={i} style={styles.listItem}>
                    {renderText(change)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </Layout>
  );
}
