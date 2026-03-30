import React, { Component, type ReactNode } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

/**
 * ErrorBoundary that catches SDK hook failures (e.g., useRickyData not in provider)
 * and shows a graceful fallback instead of crashing the page.
 */
class SDKErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return this.props.children;
  }
}

/**
 * Wrapper for embedding SDK components in MDX docs.
 *
 * Handles: SSR safety (BrowserOnly), missing provider (ErrorBoundary),
 * and loading state (fallback).
 *
 * Usage in MDX:
 * ```
 * import SDKWidget from '@site/src/components/SDKWidget';
 *
 * <SDKWidget
 *   fallback="Connect wallet to see your usage"
 *   render={() => {
 *     const { FreeTierBar } = require('@rickydata/react');
 *     return <FreeTierBar />;
 *   }}
 * />
 * ```
 */
export default function SDKWidget({
  render,
  fallback = 'Loading...',
}: {
  render: () => ReactNode;
  fallback?: ReactNode;
}) {
  const fallbackEl = typeof fallback === 'string' ? (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: 8,
        border: '1px solid var(--ifm-color-emphasis-200)',
        background: 'var(--ifm-background-surface-color)',
        color: 'var(--ifm-color-emphasis-600)',
        fontSize: '0.9rem',
      }}
    >
      {fallback}
    </div>
  ) : (
    fallback
  );

  return (
    <BrowserOnly fallback={fallbackEl}>
      {() => (
        <SDKErrorBoundary fallback={fallbackEl}>
          {render()}
        </SDKErrorBoundary>
      )}
    </BrowserOnly>
  );
}
