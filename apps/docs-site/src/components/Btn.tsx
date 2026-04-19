import React from 'react';
import Link from '@docusaurus/Link';
import type { CSSProperties, ReactNode, MouseEventHandler } from 'react';

export interface BtnProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  href?: string;
  to?: string;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  style?: CSSProperties;
  children: ReactNode;
}

export function Btn({ variant = 'primary', icon, href, to, onClick, style, children }: BtnProps) {
  const cls =
    variant === 'primary'
      ? 'rd-btn rd-btn-primary'
      : variant === 'secondary'
      ? 'rd-btn rd-btn-secondary'
      : 'rd-btn rd-btn-ghost';

  const body = (
    <>
      {icon}
      {children}
    </>
  );

  if (to) {
    return (
      <Link className={cls} to={to} style={style} onClick={onClick as MouseEventHandler<HTMLAnchorElement>}>
        {body}
      </Link>
    );
  }
  if (href) {
    return (
      <a className={cls} href={href} style={style} onClick={onClick as MouseEventHandler<HTMLAnchorElement>}>
        {body}
      </a>
    );
  }
  return (
    <button className={cls} style={style} onClick={onClick as MouseEventHandler<HTMLButtonElement>}>
      {body}
    </button>
  );
}

export default Btn;
