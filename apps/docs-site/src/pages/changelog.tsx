import type { CSSProperties } from 'react';
import Layout from '@theme/Layout';

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
  empty: {
    border: '1px dashed var(--ifm-color-emphasis-300)',
    borderRadius: 10,
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--ifm-color-emphasis-700)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  code: {
    fontFamily: 'var(--ifm-font-family-monospace)',
    fontSize: '0.85em',
    background: 'var(--ifm-color-emphasis-100)',
    padding: '0.15em 0.35em',
    borderRadius: 3,
  },
};

export default function Changelog(): JSX.Element {
  return (
    <Layout title="Changelog" description="RickyData release notes and version history">
      <main style={styles.main}>
        <h1 style={styles.heading}>Changelog</h1>
        <p style={styles.subtitle}>
          Release notes for the RickyData SDK, component libraries, and docs site.
        </p>
        <div style={styles.empty}>
          No release notes published yet. Track package versions directly on npm:{' '}
          <a href="https://www.npmjs.com/package/rickydata">
            <code style={styles.code}>rickydata</code>
          </a>
          ,{' '}
          <a href="https://www.npmjs.com/package/@rickydata/react">
            <code style={styles.code}>@rickydata/react</code>
          </a>
          ,{' '}
          <a href="https://www.npmjs.com/package/@rickydata/chat">
            <code style={styles.code}>@rickydata/chat</code>
          </a>
          .
        </div>
      </main>
    </Layout>
  );
}
