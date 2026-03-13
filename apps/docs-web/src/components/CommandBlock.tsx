import { useState } from "react";

type CommandBlockProps = {
  title: string;
  code: string;
  caption?: string;
};

export function CommandBlock({ title, code, caption }: CommandBlockProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  async function onCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="command-block">
      <div className="command-block-head">
        <span className="command-block-step">{title}</span>
        <button type="button" className="ghost-btn" onClick={onCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      {caption && <p className="command-block-caption">{caption}</p>}
    </section>
  );
}
