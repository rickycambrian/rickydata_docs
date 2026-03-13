---
name: design-system
description: RickyData docs design system — verified OKLCH tokens, typography, spacing, motion, and component patterns. Use when building or modifying pages in apps/docs-web.
user-invokable: true
---

# RickyData Docs Design System

## Overview

Dark, warm-neutral aesthetic with OKLCH color throughout. Asymmetric, left-aligned layouts with varied card sizes — never centered heroes or uniform grids. Space Grotesk for headings, DM Sans for body, IBM Plex Mono for code. All motion respects `prefers-reduced-motion`.

## Color Tokens

All colors use OKLCH. Defined in `:root` in `apps/docs-web/src/styles/global.css`.

### Backgrounds

| Token | Value |
|-------|-------|
| `--bg` | `oklch(13% 0.008 60)` |
| `--surface-0` | `oklch(17% 0.008 60)` |
| `--surface-1` | `oklch(20% 0.007 60)` |
| `--surface-2` | `oklch(23% 0.007 60)` |

### Text

| Token | Value |
|-------|-------|
| `--text` | `oklch(90% 0.005 60)` |
| `--text-secondary` | `oklch(68% 0.01 60)` |
| `--muted` | `oklch(55% 0.01 60)` |

### Accent

| Token | Value |
|-------|-------|
| `--accent` | `oklch(72% 0.14 70)` |
| `--accent-hover` | `oklch(78% 0.12 70)` |
| `--accent-subtle` | `oklch(72% 0.14 70 / 0.08)` |
| `--accent-2` | `oklch(70% 0.12 250)` |

### Semantic

| Token | Value |
|-------|-------|
| `--danger` | `oklch(65% 0.2 25)` |

### Border

| Token | Value |
|-------|-------|
| `--border` | `oklch(30% 0.005 60)` |
| `--border-active` | `oklch(38% 0.008 60)` |
| `--ring` | `oklch(72% 0.14 70 / 0.3)` |

### Inline Color Literals

These OKLCH values appear inline in CSS rules (not as tokens):

- Button primary text: `oklch(18% 0.02 70)`
- Link hover: `oklch(78% 0.1 250)`
- Code block backgrounds: `oklch(10% 0.005 60)`
- Video frame background: `oklch(5% 0 0)`
- Status live badge: text `oklch(78% 0.12 160)`, bg `oklch(55% 0.1 160 / 0.12)`
- Status pending badge: text `oklch(78% 0.12 85)`, bg `oklch(70% 0.12 85 / 0.12)`

## Typography

### Font Families

| Token | Stack |
|-------|-------|
| `--font-heading` | `"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| `--font-body` | `"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| `--font-mono` | `"IBM Plex Mono", Menlo, Consolas, monospace` |

### Type Scale

| Token | Value |
|-------|-------|
| `--text-xs` | `0.75rem` |
| `--text-sm` | `0.875rem` |
| `--text-base` | `1rem` |
| `--text-lg` | `1.25rem` |
| `--text-xl` | `1.5rem` |
| `--text-2xl` | `2rem` |
| `--text-3xl` | `2.5rem` |

### Font Loading

Fonts loaded via Google Fonts `<link>` in `index.html` with `display=swap`:
- Space Grotesk: weights 500, 600, 700
- DM Sans: weights 400, 500 (normal + italic), optical size 9-40

Preconnect hints for `fonts.googleapis.com` and `fonts.gstatic.com`.

Body base: `font-size: 0.9375rem; line-height: 1.6; font-kerning: normal`.

## Spacing

4px base unit. Defined in `:root`.

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-xs` | `0.25rem` | 4px |
| `--space-sm` | `0.5rem` | 8px |
| `--space-md` | `0.75rem` | 12px |
| `--space-lg` | `1rem` | 16px |
| `--space-xl` | `1.5rem` | 24px |
| `--space-2xl` | `2rem` | 32px |
| `--space-3xl` | `3rem` | 48px |

## Motion

### Easing Curves

| Token | Value |
|-------|-------|
| `--ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` |

### Duration Tiers

| Token | Value |
|-------|-------|
| `--duration-fast` | `150ms` |
| `--duration-normal` | `250ms` |
| `--duration-slow` | `400ms` |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

All new CSS must include reduced-motion handling when adding animations or transitions.

## Border Radii

| Token | Value |
|-------|-------|
| `--radius-sm` | `6px` |
| `--radius-md` | `10px` |
| `--radius-lg` | `14px` |

Inline `border-radius: 3px` used for small inline code elements (`.markdown code`, `.provenance-grid dd code`).

## Component Patterns

### Layout Shell

File: `Layout.tsx` + `global.css`

- `.layout-shell` wraps everything, `min-height: 100vh`.
- `.topbar` is `position: sticky; top: 0; z-index: 30` with `background: var(--bg)` (solid, no blur/glass). Border bottom uses `--border-active`.
- `.topbar-inner` is a 3-column grid (`auto auto 1fr`) at `max-width: 1440px` centered.
- `.content-shell` is a 2-column grid (`240px minmax(0, 1fr)`) at `max-width: 1440px`, collapses to single column at 1200px.
- `.sidebar` is sticky (`top: 64px`), transparent background, right border only, no box-shadow.
- Skip-to-content link is included for accessibility.

### Hero Sections

Left-aligned composition. Never centered.

- `.hero` — base hero: `text-align: left`, `padding: var(--space-3xl) var(--space-2xl)`, `background: var(--surface-0)`, `border-radius: var(--radius-lg)`.
- `.hero-home` — home variant: removes max-width, adjusts bottom padding.
- `.hero-compact` — compact variant for inner pages: adds bottom margin.
- `.eyebrow` — uppercase label above title: `font-family: var(--font-heading)`, `font-size: 0.6875rem`, `letter-spacing: 0.08em`, `color: var(--accent)`.
- `h1` uses `clamp(1.875rem, 3vw, 2.5rem)`, `letter-spacing: -0.03em`, `font-weight: 700`.
- `.lead` — subtitle paragraph: `max-width: 640px`, `color: var(--text-secondary)`.

### Card Grids

#### Journey Cards (HomePage)

- `.journey-grid` — 3-column grid with 2 rows.
- `.journey-card-featured` — spans `grid-row: 1 / 3`, `grid-column: 1 / 2`. Uses `--surface-0` background with `--border-active` border.
- Regular `.journey-card` — `--surface-1` background, transparent border, hover reveals `--border-active`.

#### Product Cards (HomePage)

- `.card-grid` — asymmetric `2fr 1fr 1fr` columns.
- `.card-featured` — first card, larger with `--surface-0` bg and `--border-active` border.
- Regular `.card` — same hover pattern as journey cards.

Both grids collapse to single column at 920px.

### Collapsible Sections

File: `CollapsibleSection.tsx` + `global.css`

Uses `grid-template-rows` animation (NOT `display:none` or `max-height`).

**React pattern:**
```tsx
<div className={`playbook-body-wrapper ${open ? "playbook-body-open" : ""}`}>
  <div className="playbook-body-inner">
    <div className="playbook-body">{children}</div>
  </div>
</div>
```

**CSS pattern:**
```css
.playbook-body-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-slow) var(--ease-out-quart);
}
.playbook-body-wrapper.playbook-body-open {
  grid-template-rows: 1fr;
}
.playbook-body-inner {
  overflow: hidden;
}
```

Toggle button (`.playbook-toggle`) is a full-width flex button with chevron. Chevron rotates 90deg when open via `.toggle-open` class.

Supports hash-based auto-open: if `location.hash === #${id}`, section opens and scrolls into view.

### Command Blocks

File: `CommandBlock.tsx` + `global.css`

- `.command-block` — panel with `--surface-0` bg, `--border` border, `--radius-md`.
- `.command-block-head` — flex row with title + copy button.
- `.command-block-step` — title: `--font-heading`, `0.8125rem`, `font-weight: 600`.
- `pre` inside uses `oklch(10% 0.005 60)` background.
- Copy button is `.ghost-btn`.
- Optional `.command-block-caption` below.

### Doc Layout

File: `DocPage.tsx` + `global.css`

- `.doc-layout` — 2-column grid: `minmax(0, 1fr) 260px`. Collapses at 1200px.
- `.doc-article` — left column, transparent background, no border.
- `.doc-right-column` — sticky (`top: 72px`), `max-height: calc(100vh - 80px)`, `overflow-y: auto`. Contains TOC and API/CLI panel.
- `.doc-header` — title, summary, action buttons (copy markdown, open llms.txt).
- `.breadcrumb` — flex nav with `>` separators: `Home > Product > docType > title`. Uses `getProductLabel()` for product names. Links use `--accent` color.
- `.markdown` class — full markdown styling including tables, blockquotes, code blocks, lists, images, horizontal rules.
- `.doc-related` — related pages section at bottom with top border separator.

### Panels (TOC, API/CLI, Provenance)

Shared base: `background: var(--surface-0); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.875rem`.

Applied to: `.toc`, `.aux-panel`, `.provenance`, `.callout`, `.command-block`.

Panel headings: `font-family: var(--font-heading); font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted)`.

### Product Page Sections

File: `ProductPage.tsx` + `global.css`

Section variants applied via CSS class `product-section--{variant}`:
- `prominent` — "Start Here": rounded with bg, accent heading.
- `reference` — API/CLI: mono font heading.
- `recent` — timestamps emphasized.
- `subdued` — "Other References": reduced opacity, hover restores.

`.product-cross-nav` — "Other Product Hubs" section at bottom of each product page. Pill-styled links (`.product-cross-nav-links a`) exclude the current product. Uses `--border-active` border, `--text-secondary` color, hover brightens.

### Video Guide Card

File: `VideoGuideCard.tsx` + `global.css`

- `.video-guide-card` — border panel with eyebrow, title, purpose, meta pills, and video/placeholder.
- Status badges: `.status-live` (green tones), `.status-pending` (yellow tones).
- `.video-placeholder` — dashed border, centered text, shown when video URL is absent or fails.
- `.video-prompt` — collapsible `<details>` with recording script.

### Search Page Groups

File: `SearchPage.tsx` + `global.css`

Results grouped by doc type with visual weight:
- `search-group--primary` — guides/architecture: accent-colored bottom border on heading.
- `search-group--reference` — cli/api: mono font heading.
- Default — standard heading.
- `.search-group-count` — pill showing count.

### Buttons

Three variants:
- `.btn-primary` — `background: var(--accent)`, dark text.
- `.btn-secondary` — `background: var(--surface-1)`, `border-color: var(--border-active)`.
- `.btn-ghost` — transparent bg, `border-color: var(--border-active)`.
- `.ghost-btn` — small inline action button (copy, open llms.txt).

### Badges and Pills

- `.pill` — small label: `--surface-2` bg, `--text-secondary` color, `0.6875rem`.
- `.pill-link` — interactive pill with border, hover state.
- `.filter-pill` — accent-colored filter pill for search.
- `.status-badge` — uppercase status indicator with semantic OKLCH colors.

### See Also / Backlink Sections

Reusable pattern for cross-linking at page bottom:

- `.see-also` — top border separator with `margin-top: var(--space-3xl)`. Contains `h3` (heading-font, small, secondary color) and `.see-also-links` (flex-wrap pill-styled links with `--border-active`).
- Used on ChangelogPage and VersionMatrixPage to prevent dead-end pages.
- For ProductPage, use `.product-cross-nav` (same visual pattern, different class for semantic clarity).

## Anti-Patterns (Lessons Learned)

- **No Inter font** — use Space Grotesk for headings, DM Sans for body
- **No emerald/teal accent** — accent is warm amber/ochre at hue 70, not green
- **No centered hero layouts** — always `text-align: left`
- **No uniform card grids** — use asymmetric column ratios (`2fr 1fr 1fr`, featured spanning rows)
- **No glassmorphism on topbar** — solid `var(--bg)` background, no blur
- **No `display:none` for collapsibles** — use `grid-template-rows: 0fr/1fr` animation
- **No pure hex colors** — use OKLCH throughout
- **No `rgba()` transparency** — use OKLCH alpha syntax (`oklch(... / 0.08)`)
- **Always include `prefers-reduced-motion`** — blanket `transition-duration: 0.01ms !important` for all elements
- **No box-shadow on sidebar or page containers** — flat, border-only separation

## File Reference

| File | Contains |
|------|----------|
| `apps/docs-web/src/styles/global.css` | All design tokens, all component CSS, responsive breakpoints, reduced-motion |
| `apps/docs-web/index.html` | Font loading (`<link>` to Google Fonts), preconnect hints |
| `apps/docs-web/src/components/Layout.tsx` | Topbar, sidebar (Navigate + Reference Hubs + Search + Version Matrix), content shell, skip-to-content, search form |
| `apps/docs-web/src/pages/HomePage.tsx` | Hero-home, quickstart strip, journey grid, product card grid |
| `apps/docs-web/src/pages/QuickstartPage.tsx` | Hero-compact, command blocks grid, quick-links-enhanced grid |
| `apps/docs-web/src/pages/ProductPage.tsx` | Product hero, section variants (prominent/reference/recent/subdued), cross-product nav |
| `apps/docs-web/src/pages/SearchPage.tsx` | Search groups (primary/reference/default), filter pills, empty state |
| `apps/docs-web/src/pages/PlaybooksPage.tsx` | Collapsible sections, command blocks, numbered steps, video guides |
| `apps/docs-web/src/pages/DocPage.tsx` | Doc layout (2-col), breadcrumb nav, markdown rendering, related pages |
| `apps/docs-web/src/components/CollapsibleSection.tsx` | grid-template-rows expand/collapse, hash-based auto-open |
| `apps/docs-web/src/components/CommandBlock.tsx` | Code panel with copy button |
| `apps/docs-web/src/components/VideoGuideCard.tsx` | Video embed with fallback placeholder, status badges |
| `apps/docs-web/src/components/Toc.tsx` | Table of contents extracted from markdown headings |
| `apps/docs-web/src/components/ApiAndCliPanel.tsx` | Endpoint + command sidebar panel |
| `apps/docs-web/src/components/SourceProvenance.tsx` | Source repo/path/commit metadata grid |
