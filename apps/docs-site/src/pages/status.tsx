import React from 'react';
import Layout from '@theme/Layout';

export default function StatusPage(): JSX.Element {
  return (
    <Layout title="Status" description="RickyData platform status">
      <main style={{ padding: 0, height: 'calc(100vh - 60px)' }}>
        <iframe
          src="https://rickydata.org/status"
          title="RickyData Platform Status"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </main>
    </Layout>
  );
}
