---
name: rd-component-library
description: Dual-layer convention for RickyData docs primitives — React component emits `rd-*` class names, CSS rules live in markdown-extras.css using `--rd-*` design tokens. Use when adding a new shared primitive (pill, callout, card, collapsible, etc.) to apps/docs-site/.
user-invocable: true
paths: apps/docs-site/src/components/*.tsx, apps/docs-site/src/css/markdown-extras.css
---

# rd-* Component Library Convention

**Provenance:** Verified 2026-04-19 in docs-redesign team. Pattern lives across `apps/docs-site/src/components/*.tsx` and `apps/docs-site/src/css/markdown-extras.css`. Build verified via `npx docusaurus build` (task #7 passed, 35 pages, docs-reviewer PASS). The rd-* class layer in `markdown-extras.css` has 75+ matches for known primitives.

## When to Use

- Adding a new shared primitive to `apps/docs-site/src/components/` that will be registered in the MDX swizzle
- Adding variant styling (hover, active, tone variants) to an existing primitive
- Keeping inline styles out of React component bodies when CSS tokens are sufficient

## The Convention

Primitives are defined in two layers:

1. **React layer** (`src/components/<Name>.tsx`) — handles structure, props, state, ARIA. Emits BEM-ish `rd-*` class names. Inline `style` is allowed only for values that depend on props or runtime state.
2. **CSS layer** (`src/css/markdown-extras.css`) — handles colors, spacing, typography, hover/active transitions. Uses `--rd-*` and `--ifm-*` custom properties defined in `src/css/custom.css` (see the `docusaurus-theming` skill).

### Naming Rules

- Block: `rd-<name>` (e.g. `rd-pill`, `rd-callout`, `rd-card`, `rd-collapsible`)
- Element: `rd-<name>-<part>` (e.g. `rd-callout-icon`, `rd-collapsible-head`, `rd-collapsible-title`, `rd-card-grid`)
- Modifier: `rd-<name>-<modifier>` OR `.is-<state>` on the block (e.g. `rd-pill-accent`, `rd-pill-success`, `.rd-collapsible.is-open`, `.rd-code-tab.is-active`)
- Utility: `rd-<utility>` when orthogonal to any specific block (e.g. `rd-hoverable`, `rd-arrow`, `rd-pulse-dot`, `rd-ico-box`)

### Inline Style — When Allowed

Inline `style` is appropriate for:
- Values bound to props (e.g. a width from a prop)
- Values bound to hover/hovered state (React can flip class or inline style)
- Small one-off tweaks that would be wasteful to add as CSS classes

Inline style is NOT appropriate for:
- Color, font-family, font-size that could use a token
- Hover/focus/active transitions (use CSS for these — state toggling via class, styling via CSS)
- Anything that should be themeable by changing a CSS variable

### Always Use Tokens

- Colors: `var(--rd-text)`, `var(--rd-text-secondary)`, `var(--rd-muted)`, `var(--rd-bg)`, `var(--rd-surface-0)`, `var(--rd-surface-1)`, `var(--rd-surface-2)`, `var(--rd-border)`, `var(--rd-border-active)`, `var(--rd-accent)`, `var(--rd-accent-hover)`, `var(--rd-accent-subtle)`, `var(--rd-danger)`
- Primary (Infima): `var(--ifm-color-primary)`, etc.
- Typography: `var(--ifm-heading-font-family)`, `var(--ifm-font-family-monospace)`, `var(--ifm-font-family-base)`
- Radius / motion: `var(--rd-radius-md)`, `var(--rd-ease-out-quart)`, `var(--rd-duration-fast)`, etc.

See the `docusaurus-theming` skill for the full token catalogue.

## Verified Examples

### Pill — tone variants via modifier classes

`apps/docs-site/src/components/Pill.tsx`:

```tsx
export function Pill({ tone = 'default', pulse, style, children }: PillProps) {
  const cls =
    tone === 'success' ? 'rd-pill rd-pill-success'
    : tone === 'accent' ? 'rd-pill rd-pill-accent'
    : 'rd-pill';
  return (
    <span className={cls} style={style}>
      {pulse && <span className="rd-pulse-dot" />}
      {children}
    </span>
  );
}
```

Matching CSS in `markdown-extras.css`:

```css
.rd-pill { /* base pill */ }
.rd-pill-accent { /* accent tone */ }
.rd-pill-success { /* success tone */ }
.rd-pulse-dot { /* animated pulse indicator */ }
```

### Callout — composed with Icons helper, uses `rd-callout-icon` element

`apps/docs-site/src/components/Callout.tsx`:

```tsx
export function Callout({ tone = 'info', icon, children }: CalloutProps) {
  const cls = 'rd-callout' + (tone === 'accent' ? ' rd-callout-accent' : '');
  const defaultIcon =
    tone === 'accent' ? <Icons.sparkle width="16" height="16" />
                      : <Icons.info width="16" height="16" />;
  return (
    <div className={cls}>
      <span className="rd-callout-icon">{icon ?? defaultIcon}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
```

Matching CSS in `markdown-extras.css`:

```css
.rd-callout { /* base */ }
.rd-callout-accent { /* accent tone */ }
.rd-callout-icon { /* icon slot */ }
.rd-callout p { margin: 0; color: inherit; }
.rd-callout p + p { margin-top: 8px; }
```

Note the nested selectors: `.rd-callout p` styles any `<p>` descendant of the callout, which lets MDX authors write natural paragraph content inside `<Callout>`.

### Collapsible — state on the block, not the parts

`apps/docs-site/src/components/Collapsible.tsx`:

```tsx
return (
  <div className={'rd-collapsible' + (open ? ' is-open' : '')}>
    <button type="button" className="rd-collapsible-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
      {icon && <div className="rd-collapsible-ico">{icon}</div>}
      <div style={{ flex: 1 }}>
        <div className="rd-collapsible-title">{title}</div>
        {sub && <div className="rd-collapsible-sub">{sub}</div>}
      </div>
      <span className="rd-collapsible-chev"><Icons.chev width="16" height="16" /></span>
    </button>
    {open && <div className="rd-collapsible-body">{children}</div>}
  </div>
);
```

Matching CSS uses state on the block to style descendants:

```css
.rd-collapsible { /* base */ }
.rd-collapsible-head { /* button */ }
.rd-collapsible-head:hover { /* hover on button */ }
.rd-collapsible-chev { transition: transform 200ms; }
.rd-collapsible.is-open .rd-collapsible-chev { transform: rotate(90deg); }
.rd-collapsible-body { /* body */ }
.rd-collapsible-body p { margin: 0 0 8px; color: inherit; }
```

### FeatureCard — utility class composition

`apps/docs-site/src/components/FeatureGrid.tsx` composes three class roles on a single element:

```tsx
const cls = 'rd-card rd-hoverable rd-feature-card';
```

- `rd-card` — base card surface
- `rd-hoverable` — utility adding cursor pointer + hover lift
- `rd-feature-card` — specific variant (icon box, heading style, arrow)

This composition pattern lets you build new card-like components by reusing `rd-card rd-hoverable` as a base.

## Adding a New Primitive

1. Create `src/components/MyThing.tsx` with named export + props interface. Default `tone`/`variant` props; emit `rd-my-thing` base + optional `rd-my-thing-<variant>` class.
2. Add styles to `src/css/markdown-extras.css` using `--rd-*` tokens. Scope nested rules (`.rd-my-thing p { … }`) to handle MDX children.
3. Register in `src/theme/MDXComponents.tsx` (see `docusaurus-mdx-components` skill) if the primitive is meant for MDX use.
4. Run `cd apps/docs-site && npx docusaurus build` to verify.
5. Use in MDX: `<MyThing tone="accent">…</MyThing>`.

## Anti-Patterns

- **Do NOT use Tailwind, CSS Modules, or CSS-in-JS.** The project uses pure CSS custom properties. Adding another styling system breaks Docusaurus layout (learned from KFDB — see root `CLAUDE.md`).
- **Do NOT hardcode colors or sizes.** Always use `--rd-*` or `--ifm-*` tokens. Hex and `rgba()` are banned; use `oklch(…)` when you need a literal color.
- **Do NOT put hover/focus styles inline.** React re-renders on hover would fight the CSS transition; put state-dependent styling in the CSS layer, toggle classes from React.
- **Do NOT break the naming convention.** `rd-pill-tone-success` or `pill--success` will not match existing CSS rules. Stick to `rd-<block>-<modifier>` and `.is-<state>` for state.
- **Do NOT add styles for the new primitive to `custom.css`.** `custom.css` is for tokens and Infima overrides (see `docusaurus-theming` skill). Component-specific rules belong in `markdown-extras.css`.
- **Do NOT register a new primitive globally via MDXComponents if it is only used on one page.** Import it per-page instead.

## File Reference

| File | Role |
|------|------|
| `apps/docs-site/src/components/Pill.tsx` | Tone variants via modifier classes |
| `apps/docs-site/src/components/Callout.tsx` | Composed element with icon slot + MDX-friendly nested selectors |
| `apps/docs-site/src/components/Collapsible.tsx` | State on block, `is-open` class controls descendant transforms |
| `apps/docs-site/src/components/FeatureGrid.tsx` | Utility composition (`rd-card rd-hoverable rd-feature-card`) |
| `apps/docs-site/src/components/Btn.tsx` | Button primitive with `rd-btn-primary`/`rd-btn-secondary`/`rd-btn-ghost` variants |
| `apps/docs-site/src/components/KVTable.tsx` | `rd-kv-table` / `rd-kv-row` / `rd-kv-key` / `rd-kv-val` element structure |
| `apps/docs-site/src/components/CodeTabs.tsx` | `rd-code-tab.is-active` state pattern |
| `apps/docs-site/src/css/markdown-extras.css` | All `rd-*` CSS rules (75+ selectors covering all primitives above) |
| `apps/docs-site/src/css/custom.css` | Token definitions (`--rd-*`, `--ifm-*`) — do not add component rules here |

## Known Limitations

- `markdown-extras.css` is a single flat file. As the primitive count grows, consider splitting into per-component CSS files imported from `custom.css` array syntax (already supports multiple files — see `docusaurus-theming` skill Pattern 7). Not done yet.
- Some diagrams (McpFlowDiagram, X402Flow) currently mix inline styles with `rd-*` classes more heavily than the strict convention above. That is because they render interactive state (hover highlights, step progression) that is awkward to toggle via class alone. Treat those as justified exceptions, not patterns to copy.
