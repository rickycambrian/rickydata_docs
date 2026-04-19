import React from 'react';
import type { ReactNode } from 'react';
import { Icons } from './Icons';

export interface CalloutProps {
  tone?: 'info' | 'accent';
  icon?: ReactNode;
  children: ReactNode;
}

export function Callout({ tone = 'info', icon, children }: CalloutProps) {
  const cls = 'rd-callout' + (tone === 'accent' ? ' rd-callout-accent' : '');
  const defaultIcon =
    tone === 'accent' ? <Icons.sparkle width="16" height="16" /> : <Icons.info width="16" height="16" />;
  return (
    <div className={cls}>
      <span className="rd-callout-icon">{icon ?? defaultIcon}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export default Callout;
