import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Icons } from './Icons';

export interface CollapsibleProps {
  icon?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Collapsible({ icon, title, sub, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={'rd-collapsible' + (open ? ' is-open' : '')}>
      <button
        type="button"
        className="rd-collapsible-head"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {icon && <div className="rd-collapsible-ico">{icon}</div>}
        <div style={{ flex: 1 }}>
          <div className="rd-collapsible-title">{title}</div>
          {sub && <div className="rd-collapsible-sub">{sub}</div>}
        </div>
        <span className="rd-collapsible-chev">
          <Icons.chev width="16" height="16" />
        </span>
      </button>
      {open && <div className="rd-collapsible-body">{children}</div>}
    </div>
  );
}

export default Collapsible;
