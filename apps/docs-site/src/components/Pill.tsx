import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

export interface PillProps {
  tone?: 'default' | 'accent' | 'success';
  pulse?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}

export function Pill({ tone = 'default', pulse, style, children }: PillProps) {
  const cls =
    tone === 'success'
      ? 'rd-pill rd-pill-success'
      : tone === 'accent'
      ? 'rd-pill rd-pill-accent'
      : 'rd-pill';
  return (
    <span className={cls} style={style}>
      {pulse && <span className="rd-pulse-dot" />}
      {children}
    </span>
  );
}

export default Pill;
