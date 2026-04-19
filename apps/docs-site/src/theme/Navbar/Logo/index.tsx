import React from 'react';
import Link from '@docusaurus/Link';

export default function Logo() {
  return (
    <Link
      to="/"
      className="navbar__brand"
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        textDecoration: 'none',
        padding: 0,
        margin: 0,
      }}
      aria-label="rickydata docs"
    >
      <span
        style={{
          fontFamily: 'var(--ifm-heading-font-family)',
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: '-0.02em',
          color: 'var(--rd-text)',
          lineHeight: 1,
        }}
      >
        rickydata
      </span>
      <span
        style={{
          fontFamily: 'var(--ifm-font-family-monospace)',
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--rd-muted)',
          marginLeft: 8,
          paddingLeft: 10,
          borderLeft: '1px solid var(--rd-border-active)',
          letterSpacing: 0,
          lineHeight: 1,
        }}
      >
        docs
      </span>
    </Link>
  );
}
