---
name: mdx-sdk-components
description: How to embed @rickydata/react and @rickydata/chat components in Docusaurus MDX using BrowserOnly. Use when adding interactive SDK components (FreeTierBar, UsageDashboard, AgentChatEmbed, etc.) to documentation pages.
user-invocable: true
paths: apps/docs-site/docs/**/*.mdx
---

# Embedding SDK Components in Docusaurus MDX

**Provenance:** Discovered 2026-03-30 in docs-migration team. Pattern verified in `apps/docs-site/docs/getting-started/installation.mdx`, `docs/getting-started/first-prompt.mdx`, `docs/sdk/react-hooks.mdx`, and `docs/sdk/chat-components.mdx`. Verified working via `npx docusaurus build` (task #11 passed).

## When to Use

- Adding any `@rickydata/react` component (FreeTierBar, UsageDashboard, WalletStatusBadge, ProviderSettingsCard, etc.) to a Docusaurus MDX page
- Adding `@rickydata/chat` components (AgentChatEmbed) to a Docusaurus MDX page
- Embedding any React component that requires browser APIs (window, localStorage, WebSocket, etc.) in static-site-generated documentation

## Why BrowserOnly Is Required

Docusaurus pre-renders pages at build time (SSG). Components that access browser APIs will crash during the Node.js build step. The `BrowserOnly` wrapper from `@docusaurus/BrowserOnly` ensures the component only renders in the browser.

Additionally, `require()` is used instead of `import` because ESM `import` statements are hoisted and executed at module load time (which happens during SSG). `require()` inside the render function defers module loading to runtime.

## The Pattern

### Step 1: Import BrowserOnly

At the point in the MDX file where you want the component (NOT at the top of the file with other imports):

```mdx
import BrowserOnly from '@docusaurus/BrowserOnly';
```

### Step 2: Wrap with BrowserOnly + require

```mdx
<BrowserOnly fallback={<p>Descriptive fallback text</p>}>
  {() => {
    const { ComponentName } = require('@rickydata/react');
    return <ComponentName />;
  }}
</BrowserOnly>
```

### Key Rules

1. **Use `require()`, not `import`** -- `import` is hoisted and runs at build time, crashing SSG
2. **The render function `{() => { ... }}` is required** -- BrowserOnly expects a function child, not a JSX element
3. **Provide a meaningful `fallback`** -- shown during SSG and before hydration; should describe what the user will see
4. **Destructure from `require()`** -- use `const { ComponentName } = require(...)` to get named exports

## Verified Examples

### FreeTierBar from @rickydata/react

Used in: `docs/getting-started/installation.mdx`, `docs/getting-started/first-prompt.mdx`

```mdx
import BrowserOnly from '@docusaurus/BrowserOnly';

<BrowserOnly fallback={<p>Connect wallet to see your free tier usage</p>}>
  {() => {
    const { FreeTierBar } = require('@rickydata/react');
    return <FreeTierBar />;
  }}
</BrowserOnly>
```

### UsageDashboard from @rickydata/react

Used in: `docs/sdk/react-hooks.mdx`

```mdx
import BrowserOnly from '@docusaurus/BrowserOnly';

<BrowserOnly fallback={<p>Connect wallet to see your usage dashboard</p>}>
  {() => {
    const { UsageDashboard } = require('@rickydata/react');
    return <UsageDashboard />;
  }}
</BrowserOnly>
```

### AgentChatEmbed from @rickydata/chat

Used in: `docs/sdk/chat-components.mdx`

```mdx
import BrowserOnly from '@docusaurus/BrowserOnly';

<BrowserOnly fallback={<p>Connect wallet to try the chat</p>}>
  {() => {
    const { AgentChatEmbed } = require('@rickydata/chat');
    return (
      <AgentChatEmbed
        agentId="erc8004-expert"
        gatewayUrl="https://agents.rickydata.org"
      />
    );
  }}
</BrowserOnly>
```

### With Props

Pass props as you normally would inside the render function:

```mdx
<BrowserOnly fallback={<p>Loading wallet status...</p>}>
  {() => {
    const { WalletStatusBadge } = require('@rickydata/react');
    return <WalletStatusBadge showBalance />;
  }}
</BrowserOnly>
```

## Available Components

### From @rickydata/react

| Component | Purpose | Props Interface |
|-----------|---------|-----------------|
| `FreeTierBar` | Daily free-tier usage bar | `FreeTierBarProps` |
| `UsageDashboard` | Full usage overview with charts | `UsageDashboardProps` |
| `WalletStatusBadge` | Connected/disconnected wallet indicator | `WalletStatusBadgeProps` |
| `ProviderSettingsCard` | BYOK provider selection (MiniMax, Anthropic, OpenAI) | `ProviderSettingsCardProps` |
| `WalletChip` | Compact wallet address display | `WalletChipProps` |
| `DepositPanel` | USDC deposit UI with QR code | `DepositPanelProps` |
| `SecretForm` | Form for storing server secrets | `SecretFormProps` |
| `SecretOrchestrator` | Multi-secret setup flow | `SecretOrchestratorProps` |

### From @rickydata/chat

| Component | Purpose | Props Interface |
|-----------|---------|-----------------|
| `AgentChatEmbed` | Inline agent chat with streaming | `AgentChatEmbedProps` |

## Component Design Notes

All SDK components use inline React styles (no CSS framework dependencies). They are self-contained and safe to embed in any context without CSS conflicts.

Components that fetch data (FreeTierBar, UsageDashboard, WalletStatusBadge) handle unauthenticated state gracefully -- they show static fallback content when no wallet is connected.

## Anti-Patterns

- **Do NOT use top-level `import` for SDK components** -- breaks SSG build
  ```mdx
  // WRONG - will crash the build
  import { FreeTierBar } from '@rickydata/react';
  ```
- **Do NOT pass JSX directly to BrowserOnly** -- it expects a function child
  ```mdx
  // WRONG
  <BrowserOnly><FreeTierBar /></BrowserOnly>
  ```
- **Do NOT use empty fallback** -- always provide descriptive text
  ```mdx
  // WRONG
  <BrowserOnly fallback={null}>
  ```
- **Do NOT import BrowserOnly at the top of the MDX file** -- place the import near where it's used for readability (both positions work, but co-location is the established convention)

## File Reference

| File | Pattern Used |
|------|-------------|
| `apps/docs-site/docs/getting-started/installation.mdx` | FreeTierBar |
| `apps/docs-site/docs/getting-started/first-prompt.mdx` | FreeTierBar |
| `apps/docs-site/docs/sdk/react-hooks.mdx` | UsageDashboard |
| `apps/docs-site/docs/sdk/chat-components.mdx` | AgentChatEmbed |

## Known Limitations

- Components require `@rickydata/react` and `@rickydata/chat` as dependencies in `apps/docs-site/package.json`
- RickyDataProvider context is needed for data-fetching hooks to work -- if Root.tsx wraps the app with the provider, components work automatically; otherwise they show unauthenticated state
- Build verification (task #11) is pending -- pattern has been read from source files but not yet confirmed via `npx docusaurus build`
