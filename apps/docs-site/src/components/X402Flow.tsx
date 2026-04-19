import React, { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const NODES = [
  { key: 'request', label: 'Step 1', title: 'Client \u2192 Server', sub: 'Tool call, no payment' },
  { key: 'challenge', label: 'Step 2', title: '402 Payment Required', sub: 'Server quotes $0.003' },
  { key: 'sign', label: 'Step 3', title: 'Sign transfer', sub: 'Wallet signs USDC perm.' },
  { key: 'settle', label: 'Step 4', title: 'Gateway settles', sub: 'On Base L2 \u00b7 400ms' },
  { key: 'response', label: 'Step 5', title: 'Tool result', sub: 'Signed receipt attached' },
];

function X402Rail({ step }: { step: number }) {
  return (
    <div className="rd-x402-rail">
      {NODES.map((n, i) => (
        <React.Fragment key={n.key}>
          <div className={'rd-x402-node' + (step > i ? ' is-active' : '')}>
            <div className="rd-x402-node-label">{n.label}</div>
            <div className="rd-x402-node-title">{n.title}</div>
            <div className="rd-x402-node-sub">{n.sub}</div>
          </div>
          {i < NODES.length - 1 && (
            <span className={'rd-x402-arrow' + (step > i + 1 ? ' is-active' : '')}>
              {'\u2192'}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function X402Header() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--ifm-heading-font-family)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--rd-text)',
        }}
      >
        <span className="rd-pulse-dot" />
        x402 Settlement · per-call
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--rd-muted)',
          fontFamily: 'var(--ifm-font-family-monospace)',
        }}
      >
        ~600ms end-to-end
      </div>
    </div>
  );
}

function X402FlowInner() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (NODES.length + 1)), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rd-x402">
      <X402Header />
      <X402Rail step={step} />
    </div>
  );
}

function X402FlowFallback() {
  return (
    <div className="rd-x402">
      <X402Header />
      <X402Rail step={NODES.length + 1} />
    </div>
  );
}

export function X402Flow() {
  return (
    <BrowserOnly fallback={<X402FlowFallback />}>
      {() => <X402FlowInner />}
    </BrowserOnly>
  );
}

export default X402Flow;
