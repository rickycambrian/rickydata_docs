import React, { useEffect, useState, useCallback, CSSProperties } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

/* ── Types ── */

interface Bucket {
  timestamp: string;
  status: 'up' | 'degraded' | 'down' | 'no_data';
  uptime: number;
  requests: number;
  avgLatencyMs: number;
}

interface ServiceData {
  uptime: number;
  buckets: Bucket[];
}

interface UptimeResponse {
  summary: {
    overallUptime: number;
    totalRequests: number;
    period: string;
  };
  services: Record<string, ServiceData>;
}

/* ── Constants ── */

const API_URL =
  'https://agents.rickydata.org/api/uptime/history?period=24h&granularity=hour';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const FULL_DASHBOARD_URL = 'https://rickydata.org/status';

const STATUS_COLORS: Record<Bucket['status'], string> = {
  up: 'oklch(72% 0.17 145)',
  degraded: 'oklch(78% 0.16 85)',
  down: 'oklch(62% 0.22 25)',
  no_data: 'var(--ifm-color-emphasis-300)',
};

/* ── Shared styles ── */

const cardStyle: CSSProperties = {
  padding: '1.25rem',
  borderRadius: 10,
  background: 'var(--ifm-background-surface-color)',
  border: '1px solid var(--ifm-color-emphasis-200)',
};

/* ── Helpers ── */

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatUptime(pct: number): string {
  return `${pct.toFixed(2)}%`;
}

function uptimeColor(pct: number): string {
  if (pct >= 99.5) return STATUS_COLORS.up;
  if (pct >= 95) return STATUS_COLORS.degraded;
  return STATUS_COLORS.down;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function prettifyServiceName(raw: string): string {
  return raw
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Components ── */

function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '3px solid var(--ifm-color-emphasis-200)',
          borderTopColor: 'var(--ifm-color-primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: 'var(--ifm-color-emphasis-700)', fontSize: '0.95rem' }}>
        Loading status data...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '2rem',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 0 }}>
        Unable to load status
      </h2>
      <p
        style={{
          color: 'var(--ifm-color-emphasis-700)',
          maxWidth: 480,
          fontSize: '0.95rem',
          marginBottom: '0.5rem',
        }}
      >
        {message}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={onRetry}
          className="button button--primary"
          style={{ cursor: 'pointer' }}
        >
          Retry
        </button>
        <Link className="button button--secondary" href={FULL_DASHBOARD_URL}>
          View full dashboard
        </Link>
      </div>
    </div>
  );
}

function SummaryHeader({
  overallUptime,
  totalRequests,
  period,
}: UptimeResponse['summary']) {
  return (
    <section style={{ padding: '2rem 2rem 0', maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          ...cardStyle,
          padding: '2.5rem',
          borderRadius: 14,
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
          Platform Status
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: 0,
              color: uptimeColor(overallUptime),
            }}
          >
            {formatUptime(overallUptime)}
          </h1>
          <span
            style={{
              fontSize: '1.1rem',
              color: 'var(--ifm-color-emphasis-700)',
              fontWeight: 500,
            }}
          >
            overall uptime
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
            fontSize: '0.9rem',
            color: 'var(--ifm-color-emphasis-700)',
          }}
        >
          <span>
            <strong style={{ color: 'var(--ifm-font-color-base)' }}>
              {formatNumber(totalRequests)}
            </strong>{' '}
            requests
          </span>
          <span>
            Period:{' '}
            <strong style={{ color: 'var(--ifm-font-color-base)' }}>{period}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

function BucketBar({ buckets }: { buckets: Bucket[] }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        marginTop: '0.75rem',
      }}
    >
      {buckets.map((bucket, i) => (
        <div
          key={i}
          title={`${formatTime(bucket.timestamp)} — ${bucket.status} (${bucket.uptime.toFixed(1)}%, ${bucket.requests} req, ${Math.round(bucket.avgLatencyMs)}ms)`}
          style={{
            flex: 1,
            height: 24,
            borderRadius: 3,
            background: STATUS_COLORS[bucket.status],
            cursor: 'default',
            transition: 'opacity 150ms ease-out',
            minWidth: 4,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        />
      ))}
    </div>
  );
}

function ServiceCard({ name, data }: { name: string; data: ServiceData }) {
  const latestBucket = data.buckets[data.buckets.length - 1];
  const latency = latestBucket ? Math.round(latestBucket.avgLatencyMs) : null;

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.25rem',
        }}
      >
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            margin: 0,
          }}
        >
          {prettifyServiceName(name)}
        </h3>
        <span
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            fontFamily: 'var(--ifm-font-family-monospace)',
            color: uptimeColor(data.uptime),
          }}
        >
          {formatUptime(data.uptime)}
        </span>
      </div>
      {latency !== null && (
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--ifm-color-emphasis-700)',
          }}
        >
          Latest avg latency: {latency}ms
        </span>
      )}
      <BucketBar buckets={data.buckets} />
      {data.buckets.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.35rem',
            fontSize: '0.7rem',
            color: 'var(--ifm-color-emphasis-500)',
          }}
        >
          <span>{formatTime(data.buckets[0].timestamp)}</span>
          <span>{formatTime(data.buckets[data.buckets.length - 1].timestamp)}</span>
        </div>
      )}
    </div>
  );
}

function Legend() {
  const items: { label: string; color: string }[] = [
    { label: 'Up', color: STATUS_COLORS.up },
    { label: 'Degraded', color: STATUS_COLORS.degraded },
    { label: 'Down', color: STATUS_COLORS.down },
    { label: 'No data', color: STATUS_COLORS.no_data },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '1.25rem',
        flexWrap: 'wrap',
        fontSize: '0.8rem',
        color: 'var(--ifm-color-emphasis-700)',
      }}
    >
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: item.color,
              flexShrink: 0,
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function Footer({ lastRefresh }: { lastRefresh: Date | null }) {
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
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.9rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link
            href={FULL_DASHBOARD_URL}
            style={{
              color: 'var(--ifm-color-primary)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            View full dashboard &rarr;
          </Link>
          <Legend />
        </div>
        {lastRefresh && (
          <span style={{ color: 'var(--ifm-color-emphasis-500)', fontSize: '0.8rem' }}>
            Last refreshed:{' '}
            {lastRefresh.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        )}
      </div>
    </section>
  );
}

/* ── Main page ── */

export default function StatusPage(): JSX.Element {
  const [data, setData] = useState<UptimeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json: UptimeResponse = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch status data. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleRetry = () => {
    setLoading(true);
    fetchStatus();
  };

  return (
    <Layout title="Status" description="RickyData platform status and uptime history">
      <main>
        {loading && !data ? (
          <LoadingState />
        ) : error && !data ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : data ? (
          <>
            <SummaryHeader {...data.summary} />

            {/* Service grid */}
            <section style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                Services
              </h2>
              <div
                style={{
                  width: '2rem',
                  height: 2,
                  background: 'var(--ifm-color-primary)',
                  marginBottom: '1.5rem',
                }}
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '1rem',
                }}
              >
                {Object.entries(data.services).map(([name, serviceData]) => (
                  <ServiceCard key={name} name={name} data={serviceData} />
                ))}
              </div>
            </section>

            <Footer lastRefresh={lastRefresh} />
          </>
        ) : null}
      </main>
    </Layout>
  );
}
