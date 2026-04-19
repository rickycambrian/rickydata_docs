import React from 'react';
import Link from '@docusaurus/Link';
import type { ReactNode } from 'react';
import { Icons } from './Icons';

export interface FeatureCardProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  cta?: ReactNode;
  href?: string;
  to?: string;
  children?: ReactNode;
}

export function FeatureCard({ icon, title, description, cta, href, to, children }: FeatureCardProps) {
  const content = (
    <>
      {icon && <div className="rd-ico-box">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
      {cta && (
        <span className="rd-arrow">
          {cta} <Icons.arrow width="12" height="12" />
        </span>
      )}
    </>
  );
  const cls = 'rd-card rd-hoverable rd-feature-card';
  if (to) {
    return (
      <Link className={cls} to={to}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a className={cls} href={href}>
        {content}
      </a>
    );
  }
  return <div className={cls}>{content}</div>;
}

export interface FeatureGridProps {
  children: ReactNode;
}

export function FeatureGrid({ children }: FeatureGridProps) {
  return <div className="rd-card-grid">{children}</div>;
}

export default FeatureGrid;
