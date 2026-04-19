---
name: docusaurus-mdx-components
description: Globally register React components for MDX via the MDXComponents swizzle, so docs authors can use `<Pill>`, `<Callout>`, `<FeatureGrid>`, etc. in .mdx files without per-file imports. Use when adding a new project-wide primitive for use across docs pages.
user-invocable: true
paths: apps/docs-site/src/theme/MDXComponents.tsx, apps/docs-site/docs/**/*.mdx
---

# Globally-Registered MDX Components (Swizzle Pattern)

**Provenance:** Verified 2026-04-19 in docs-redesign team. Pattern lives in `apps/docs-site/src/theme/MDXComponents.tsx`. Build verified via `npx docusaurus build` (task #7 passed, 35 pages rendered; docs-reviewer agent PASS). Consumed with zero imports in `docs/mcp/overview.mdx`, `docs/getting-started/quickstart-cli.mdx`, `docs/wallet-billing/overview.mdx`.

## When to Use

- Adding a new React component that should be usable as `<MyThing>` in any `.mdx` file without an `import` statement
- Building a shared docs primitive (pill, callout, collapsible, feature card, etc.) that many pages will use
- Deciding whether a component belongs in this swizzle (globally-registered) vs imported per-page (one-offs, page-specific widgets)

## The Pattern

Docusaurus's MDX renderer resolves component references against a `MDXComponents` object at the theme level. Swizzling that object lets you spread the Docusaurus defaults and add your own components, which then become available by bare name in every MDX file.

### File: `apps/docs-site/src/theme/MDXComponents.tsx`

```tsx
import MDXComponents from '@theme-original/MDXComponents';
import { Pill } from '@site/src/components/Pill';
import { Btn } from '@site/src/components/Btn';
import { Callout } from '@site/src/components/Callout';
import { Collapsible } from '@site/src/components/Collapsible';
import { KVTable } from '@site/src/components/KVTable';
import { FeatureGrid, FeatureCard } from '@site/src/components/FeatureGrid';
import { CodeTabs } from '@site/src/components/CodeTabs';
import { AnimatedTerminal, CLI_DEMO } from '@site/src/components/AnimatedTerminal';
import { McpFlowDiagram } from '@site/src/components/McpFlowDiagram';
import { X402Flow } from '@site/src/components/X402Flow';
import { Icons } from '@site/src/components/Icons';

export default {
  ...MDXComponents,
  Pill,
  Btn,
  Callout,
  Collapsible,
  KVTable,
  FeatureGrid,
  FeatureCard,
  CodeTabs,
  AnimatedTerminal,
  CLI_DEMO,
  McpFlowDiagram,
  X402Flow,
  Icons,
};
```

### Key Rules

1. **Import `@theme-original/MDXComponents` and spread it first.** Omitting the spread breaks all of Docusaurus's built-in MDX behaviour (headings, code blocks, admonitions).
2. **The file must be at `src/theme/MDXComponents.tsx` (or `.jsx`).** That is the swizzle target Docusaurus resolves. Do not rename or relocate.
3. **Register by bare export name.** `<Pill>` in MDX resolves to the `Pill` key on the default export. Named and default exports from the component file both work, as long as the key matches the tag name.
4. **You can register non-component values too.** `CLI_DEMO` is a const array used as `{CLI_DEMO}` in MDX expressions. Any value on the object becomes usable in MDX.
5. **Prefer `@site/src/components/...` import paths.** The `@site` alias is configured by Docusaurus and works in both dev and build.

## Adding a New Component

1. Create the component in `apps/docs-site/src/components/MyThing.tsx` with a named export:
   ```tsx
   export function MyThing(props: MyThingProps) { ... }
   ```
2. Add the import and registration to `MDXComponents.tsx`:
   ```tsx
   import { MyThing } from '@site/src/components/MyThing';
   export default { ...MDXComponents, /* existing, */ MyThing };
   ```
3. Use directly in MDX with no import:
   ```mdx
   <MyThing prop="value" />
   ```
4. Run `cd apps/docs-site && npx docusaurus build` to verify.

## Consumption: Zero-Import MDX Usage

Verified in `apps/docs-site/docs/mcp/overview.mdx`:

```mdx
---
title: MCP Overview
sidebar_position: 1
---

# MCP Overview

<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <Pill>5,000+ tools</Pill>
  <Pill tone="accent">x402 native</Pill>
  <Pill tone="success">TEE-attested</Pill>
</div>

<McpFlowDiagram />
```

No `import { Pill }` — the swizzle makes it resolve.

## When to Swizzle vs. Import Per-Page

**Swizzle (global registration) — use for:**
- Primitives (`Pill`, `Btn`, `Callout`, `Collapsible`, `KVTable`)
- Layout helpers (`FeatureGrid`, `FeatureCard`, `CodeTabs`)
- Interactive diagrams shared across several pages (`McpFlowDiagram`, `X402Flow`)
- Shared data constants (`CLI_DEMO`)

**Per-page `import` — use for:**
- Components with external auth/context requirements (e.g. `SDKWidget` from `@site/src/components/SDKWidget`, imported explicitly in `docs/wallet-billing/overview.mdx`)
- One-off widgets used on a single page
- Components wrapping `@rickydata/react` or `@rickydata/chat` (see the `mdx-sdk-components` skill for the `BrowserOnly` + `require()` pattern)

## Anti-Patterns

- **Do NOT omit the `...MDXComponents` spread** — it will break Docusaurus defaults (headings, `<pre>`, admonitions, links, images).
- **Do NOT rename the file to `MDXProvider.tsx` or place it anywhere other than `src/theme/MDXComponents.tsx`.** Docusaurus swizzle paths are fixed.
- **Do NOT add components that rely on main-conversation context (Privy, wagmi, wallet hooks) here without the `BrowserOnly` wrapper** — they will break SSG. See `mdx-sdk-components` skill.
- **Do NOT register a component here if it is only used on one page.** Register globally only when it is a reusable primitive or diagram; one-off widgets should be imported locally to keep this file signal-dense.

## File Reference

| File | Role |
|------|------|
| `apps/docs-site/src/theme/MDXComponents.tsx` | The swizzle — spreads defaults and registers project components |
| `apps/docs-site/src/components/` | Source for every registered component (Pill, Btn, Callout, Collapsible, KVTable, FeatureGrid, CodeTabs, AnimatedTerminal, McpFlowDiagram, X402Flow, Icons) |
| `apps/docs-site/docs/mcp/overview.mdx` | Verified consumer using `<Pill>` and `<McpFlowDiagram>` with no imports |
| `apps/docs-site/docs/getting-started/quickstart-cli.mdx` | Verified consumer |
| `apps/docs-site/docs/wallet-billing/overview.mdx` | Verified consumer (also imports `SDKWidget` explicitly — shows the mixed pattern) |

## Known Limitations

- Globally-registered names occupy a flat namespace. Avoid generic names (`Card`, `Link`) that conflict with Docusaurus defaults.
- Components added here are loaded on every MDX page even if not used. For heavy components (e.g. large interactive diagrams), consider per-page import instead.
- When registering animated/timer-based components here (AnimatedTerminal, X402Flow), the components themselves must wrap their implementation in `BrowserOnly` — see the `docusaurus-browseronly-animations` skill.
