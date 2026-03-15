type PathToggleProps = {
  active: "web" | "local";
  onChange: (path: "web" | "local") => void;
};

export function PathToggle({ active, onChange }: PathToggleProps): JSX.Element {
  return (
    <div className="path-toggle" role="group" aria-label="Onboarding path">
      <div className="path-toggle-track">
        <button
          type="button"
          className={`path-toggle-btn${active === "web" ? " path-toggle-btn--active" : ""}`}
          aria-pressed={active === "web"}
          onClick={() => onChange("web")}
        >
          <span className="path-toggle-label">Claude.ai Web Chat</span>
          <span className="path-toggle-sub">No CLI required</span>
        </button>
        <button
          type="button"
          className={`path-toggle-btn${active === "local" ? " path-toggle-btn--active" : ""}`}
          aria-pressed={active === "local"}
          onClick={() => onChange("local")}
        >
          <span className="path-toggle-label">Claude Code (Local)</span>
          <span className="path-toggle-sub">Full local setup</span>
        </button>
      </div>
    </div>
  );
}
