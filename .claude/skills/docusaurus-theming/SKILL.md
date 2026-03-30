---
name: docusaurus-theming
description: OKLCH design system mapped to Docusaurus Infima framework — token definitions, font loading via headTags, dark mode, warm-chroma overrides, and webpack config for SDK packages. Use when modifying theme in apps/docs-site/.
user-invocable: true
paths: apps/docs-site/src/css/*, apps/docs-site/docusaurus.config.ts
---

# Docusaurus Theming — OKLCH Design System

**Provenance:** Discovered 2026-03-30 in docs-migration team. Patterns read from `apps/docs-site/src/css/custom.css` and `apps/docs-site/docusaurus.config.ts`. Verified working via `npx docusaurus build` (task #11 passed).

## When to Use

- Modifying theme colors, typography, or spacing in the Docusaurus docs site
- Adding new design tokens or component-level overrides
- Debugging dark/light mode issues
- Adding new CSS files to the theme
- Configuring webpack for SDK package resolution

## Architecture Overview

The design system bridges two layers:

1. **Infima variables** (`--ifm-*`) -- Docusaurus's built-in CSS framework, overridden with OKLCH values
2. **RickyData tokens** (`--rd-*`) -- project-specific tokens for custom components and pages

Both are defined in `apps/docs-site/src/css/custom.css` with light mode in `:root` and dark mode in `[data-theme='dark']`.

## Pattern 1: OKLCH Infima Primary Scale

Infima requires a 7-shade primary color scale. Unlike hex-based scales, the OKLCH scale uses perceptual lightness adjustments.

**File:** `apps/docs-site/src/css/custom.css`

### Light Mode

```css
:root {
  --ifm-color-primary: oklch(62% 0.155 70);
  --ifm-color-primary-dark: oklch(56% 0.155 70);
  --ifm-color-primary-darker: oklch(52% 0.155 70);
  --ifm-color-primary-darkest: oklch(44% 0.155 70);
  --ifm-color-primary-light: oklch(68% 0.14 70);
  --ifm-color-primary-lighter: oklch(72% 0.14 70);
  --ifm-color-primary-lightest: oklch(78% 0.12 70);
}
```

### Dark Mode

```css
[data-theme='dark'] {
  --ifm-color-primary: oklch(72% 0.14 70);
  --ifm-color-primary-dark: oklch(66% 0.14 70);
  --ifm-color-primary-darker: oklch(62% 0.155 70);
  --ifm-color-primary-darkest: oklch(54% 0.155 70);
  --ifm-color-primary-light: oklch(78% 0.12 70);
  --ifm-color-primary-lighter: oklch(82% 0.10 70);
  --ifm-color-primary-lightest: oklch(88% 0.08 70);

  --ifm-background-color: oklch(13% 0.008 60);
  --ifm-background-surface-color: oklch(17% 0.008 60);
}
```

### Scale Construction Rules

- Hue 70 (warm amber/ochre) for all primary shades
- Light mode: base at 62% lightness, darker shades decrease by 6-8% lightness
- Dark mode: base at 72% lightness, lighter shades increase by 6-8% lightness
- Chroma decreases slightly toward lighter shades (0.155 -> 0.12 -> 0.08)
- Dark backgrounds use hue 60 with very low chroma (0.008) for warm tint

## Pattern 2: RickyData Design Tokens (`--rd-*`)

Custom tokens for use in pages and components. Defined alongside Infima overrides.

### Surfaces and Text (Dark Mode)

```css
[data-theme='dark'] {
  --rd-bg: oklch(13% 0.008 60);
  --rd-surface-0: oklch(17% 0.008 60);
  --rd-surface-1: oklch(20% 0.007 60);
  --rd-surface-2: oklch(23% 0.007 60);
  --rd-text: oklch(90% 0.005 60);
  --rd-text-secondary: oklch(68% 0.01 60);
  --rd-muted: oklch(55% 0.01 60);
}
```

### Accent and Semantic

```css
  --rd-accent: oklch(72% 0.14 70);
  --rd-accent-hover: oklch(78% 0.12 70);
  --rd-accent-subtle: oklch(72% 0.14 70 / 0.08);
  --rd-accent-2: oklch(70% 0.12 250);
  --rd-danger: oklch(65% 0.2 25);
  --rd-border: oklch(30% 0.005 60);
  --rd-border-active: oklch(38% 0.008 60);
  --rd-ring: oklch(72% 0.14 70 / 0.3);
```

### Spacing

```css
  --rd-space-xs: 0.25rem;   /* 4px */
  --rd-space-sm: 0.5rem;    /* 8px */
  --rd-space-md: 0.75rem;   /* 12px */
  --rd-space-lg: 1rem;      /* 16px */
  --rd-space-xl: 1.5rem;    /* 24px */
  --rd-space-2xl: 2rem;     /* 32px */
  --rd-space-3xl: 3rem;     /* 48px */
  --rd-space-4xl: 4.5rem;   /* 72px */
```

### Radii and Motion

```css
  --rd-radius-sm: 6px;
  --rd-radius-md: 10px;
  --rd-radius-lg: 14px;
  --rd-ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --rd-ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --rd-duration-fast: 150ms;
  --rd-duration-normal: 250ms;
  --rd-duration-slow: 400ms;
```

## Pattern 3: Font Loading via headTags

**File:** `apps/docs-site/docusaurus.config.ts`

Fonts are loaded via `headTags` (not `index.html`), with preconnect hints:

```typescript
headTags: [
  { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
  { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' } },
  { tagName: 'link', attributes: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400;1,9..40,500&family=IBM+Plex+Mono:wght@400;500&display=swap' } },
],
```

Font variable mapping in CSS:

```css
:root {
  --ifm-font-family-base: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ifm-heading-font-family: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ifm-font-family-monospace: "IBM Plex Mono", Menlo, Consolas, monospace;
  --ifm-font-size-base: 15px;
}

/* Required: Infima does NOT apply --ifm-heading-font-family to headings */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--ifm-heading-font-family);
  letter-spacing: -0.02em;
}
```

## Pattern 4: Component-Level Dark Mode Overrides

Infima components need explicit dark-mode styling for warm chroma:

```css
/* Navbar */
[data-theme='dark'] .navbar {
  background: oklch(15% 0.008 60);
  border-bottom: 1px solid oklch(25% 0.005 60);
}

/* Footer */
[data-theme='dark'] .footer {
  background: oklch(11% 0.008 60);
  border-top: 1px solid oklch(25% 0.005 60);
}

/* Code blocks */
[data-theme='dark'] .prism-code,
[data-theme='dark'] pre {
  background-color: oklch(10% 0.005 60) !important;
}

/* Sidebar */
[data-theme='dark'] .theme-doc-sidebar-container {
  border-right-color: oklch(25% 0.005 60);
}

[data-theme='dark'] .menu__link:hover {
  background: oklch(20% 0.007 60);
}

[data-theme='dark'] .menu__link--active {
  color: oklch(72% 0.14 70);
}
```

## Pattern 5: Dark Mode Default

```typescript
themeConfig: {
  colorMode: {
    defaultMode: 'dark',
    respectPrefersColorScheme: false,
  },
}
```

## Pattern 6: Webpack Config for SDK Packages

The `rickydata` core SDK uses Node.js subpath exports that webpack 5 doesn't resolve in browser builds. A custom plugin handles this:

```typescript
plugins: [
  function resolveRickydataSubpaths() {
    return {
      name: 'resolve-rickydata-subpaths',
      configureWebpack(_config, isServer) {
        return {
          resolve: {
            alias: {
              'rickydata/agent': path.join(actualRoot, 'dist/agent/index.js'),
              'rickydata/wallet': path.join(actualRoot, 'dist/wallet/index.js'),
              // ... other subpaths
            },
            fallback: isServer ? {} : {
              fs: false, os: false, path: false, crypto: false,
              stream: false, http: false, https: false, net: false,
              tls: false, child_process: false,
            },
          },
        };
      },
    };
  },
],
```

## Pattern 7: Multiple CSS Files

Multiple CSS files are included via array syntax:

```typescript
theme: {
  customCss: [
    './src/css/custom.css',       // Design tokens + Infima overrides
    './src/css/markdown-extras.css', // MDX content styling
  ],
},
```

## Pattern 8: Reduced Motion

Always include at the end of `custom.css`:

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

## Anti-Patterns

- **No hex colors in primary scale** -- use OKLCH for perceptual uniformity
- **No pure gray backgrounds** -- always add warm chroma (0.005-0.008) at hue 60
- **No `index.html` edits** -- Docusaurus generates HTML; use `headTags` for `<head>` content
- **No Inter font** -- use Space Grotesk (headings), DM Sans (body), IBM Plex Mono (code)
- **No emerald/teal accent** -- accent is warm amber/ochre at hue 70
- **No `respectPrefersColorScheme: true`** -- dark mode is forced
- **No `rgba()` transparency** -- use OKLCH alpha syntax `oklch(... / 0.08)`

## File Reference

| File | Contains |
|------|----------|
| `apps/docs-site/src/css/custom.css` | All design tokens, Infima overrides, component dark-mode rules, reduced motion |
| `apps/docs-site/src/css/markdown-extras.css` | MDX content styling (tables, blockquotes, admonitions) |
| `apps/docs-site/docusaurus.config.ts` | headTags (fonts), colorMode, customFields, webpack plugin, navbar/footer config |

## Known Limitations

- Root.tsx Privy auth wrapper exists (`src/theme/Root.tsx` wraps app in `BrowserOnly` + `AuthProvider` with Privy/wagmi), but requires `PRIVY_APP_ID` env var -- gracefully falls through to bare children when unset
- Sidebar uses `autogenerated` mode -- specific ordering via `_category_.json` and frontmatter `sidebar_position`
