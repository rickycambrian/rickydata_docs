import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function StatusPage(): JSX.Element {
  useEffect(() => {
    // Auto-redirect after a brief moment so users see where they're going
    const timer = setTimeout(() => {
      window.location.href = 'https://rickydata.org/status';
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout title="Status" description="RickyData platform status">
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Platform Status</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', marginBottom: '2rem', maxWidth: 500 }}>
          Redirecting you to the live status dashboard with uptime history,
          TEE security, traffic breakdown, and usage metrics...
        </p>
        <Link
          className="button button--primary button--lg"
          href="https://rickydata.org/status"
        >
          Go to Status Dashboard
        </Link>
      </main>
    </Layout>
  );
}
