import { type PropsWithChildren, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type CollapsibleSectionProps = PropsWithChildren<{
  id: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
}>;

export function CollapsibleSection({
  id,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps): JSX.Element {
  const location = useLocation();
  const hashMatch = location.hash === `#${id}`;
  const [open, setOpen] = useState(defaultOpen || hashMatch);

  useEffect(() => {
    if (location.hash === `#${id}`) {
      setOpen(true);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash, id]);

  return (
    <section id={id} className="playbook-section">
      <button
        type="button"
        className="playbook-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="playbook-header">
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        <span className={`toggle-chevron ${open ? "toggle-open" : ""}`}>&#9656;</span>
      </button>
      {open && <div className="playbook-body">{children}</div>}
    </section>
  );
}
