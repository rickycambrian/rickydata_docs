import { useMemo } from "react";

type TocEntry = {
  id: string;
  label: string;
};

function extractHeadings(markdown: string): TocEntry[] {
  const lines = markdown.split("\n");
  const entries: TocEntry[] = [];

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (!match) continue;
    const label = (match[1] || "").trim();
    if (!label) continue;
    const id = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    entries.push({ id, label });
  }

  return entries;
}

export function Toc({ markdown }: { markdown: string }): JSX.Element | null {
  const entries = useMemo(() => extractHeadings(markdown), [markdown]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <aside className="toc">
      <h4>On This Page</h4>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a href={`#${entry.id}`}>{entry.label}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
