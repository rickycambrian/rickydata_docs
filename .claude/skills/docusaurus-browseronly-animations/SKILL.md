---
name: docusaurus-browseronly-animations
description: Wrap animation/timer components (setInterval, setTimeout, requestAnimationFrame) in @docusaurus/BrowserOnly with a static fallback so SSG renders a non-animated snapshot. Use when building vanilla React components that mutate state on a timer — distinct from SDK auth components.
user-invocable: true
paths: apps/docs-site/src/components/*.tsx
---

# BrowserOnly for Animated React Components

**Provenance:** Verified 2026-04-19 in docs-redesign team. Pattern lives in `apps/docs-site/src/components/AnimatedTerminal.tsx` and `apps/docs-site/src/components/X402Flow.tsx`. Build verified via `npx docusaurus build` (task #7 passed, 35 pages rendered, docs-reviewer PASS). This pattern is distinct from the one covered by the `mdx-sdk-components` skill — that skill is for SDK auth components (FreeTierBar, UsageDashboard, AgentChatEmbed), this one is for animated vanilla-React components with no SDK dependency.

## When to Use

- Building any React component that uses `setInterval`, `setTimeout`, or `requestAnimationFrame` in a `useEffect`
- Building any React component whose initial render depends on `window`, `navigator`, or another browser-only global
- Building animated diagrams, typing terminals, pulsing indicators, step-rail progress animations

## When NOT to Use

- Components that only read browser APIs inside event handlers (e.g. an `onClick` that calls `navigator.clipboard`). Event handlers only run after hydration, so SSG does not execute them — no wrapper needed. See `apps/docs-site/src/components/CodeTabs.tsx` for an example: it uses `navigator.clipboard` inside a `useCallback` and does NOT need `BrowserOnly`.
- SDK components pulled via `require('@rickydata/react')` or `require('@rickydata/chat')`. Those use a different pattern — see the `mdx-sdk-components` skill.

## The Problem

Docusaurus statically generates HTML for every page at build time. During SSG, `useEffect` does not run but the component still renders once on the server. A component that tries to call `setInterval` unconditionally, or whose initial render assumes `window` is defined, will either:

1. Crash the build (Node.js has no `window`)
2. Silently produce a janky first-paint (empty content that pops in only after hydration)
3. Hydration-mismatch warning in the browser console (server HTML differs from client initial render)

`BrowserOnly` gates the component to the browser, and the `fallback` prop gives SSG a deterministic static snapshot to render instead.

## The Pattern

### Structure

```tsx
import React, { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

function MyComponentInner() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 5), 1400);
    return () => clearInterval(t);
  }, []);
  return <Rail step={step} />;
}

function MyComponentFallback() {
  // Static snapshot — usually the final frame or a neutral state
  return <Rail step={5} />;
}

export function MyComponent() {
  return (
    <BrowserOnly fallback={<MyComponentFallback />}>
      {() => <MyComponentInner />}
    </BrowserOnly>
  );
}
```

### Key Rules

1. **Split into three exports/components:** the animated inner, the static fallback, and the public wrapper. This keeps the animation logic contained and makes the fallback easy to reason about.
2. **BrowserOnly's child must be a function** (`{() => <Inner />}`), not a JSX element. Passing JSX directly will crash.
3. **The `fallback` must be a JSX element**, not a function. (Opposite of the child.)
4. **The fallback should render the same visual frame** as the component's "settled" or "final" state — same DOM structure, just no animation. This makes SSG output look complete and avoids a visual pop on hydration.
5. **Do not share state or refs between Inner and Fallback.** They render in different execution environments.
6. **Both Inner and Fallback should use the same CSS classes** so the stylesheet cascade looks identical.

## Verified Examples

### AnimatedTerminal — typing + autoplay loop

`apps/docs-site/src/components/AnimatedTerminal.tsx` implements a terminal that types commands character-by-character using `setTimeout` inside `useEffect`. The public wrapper:

```tsx
export function AnimatedTerminal({
  lines = CLI_DEMO,
  restart = 0,
  autoStart = true,
  title = 'rickydata \u2014 ~/your-project',
}: AnimatedTerminalProps) {
  return (
    <BrowserOnly fallback={<StaticFallback lines={lines} title={title} />}>
      {() => (
        <AnimatedTerminalInner
          lines={lines}
          restart={restart}
          autoStart={autoStart}
          title={title}
        />
      )}
    </BrowserOnly>
  );
}
```

The `StaticFallback` renders ALL lines of the terminal at once (the "final frame"), using the same `rd-terminal` / `rd-terminal-body` classes as `AnimatedTerminalInner`. SSG therefore produces a complete, readable terminal snapshot; hydration swaps in the animated version seamlessly.

### X402Flow — step-rail animation

`apps/docs-site/src/components/X402Flow.tsx` animates a 5-node settlement diagram with `setInterval` advancing `step`. The wrapper:

```tsx
function X402FlowInner() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (NODES.length + 1)), 1400);
    return () => clearInterval(t);
  }, []);
  return (<div className="rd-x402"><X402Header /><X402Rail step={step} /></div>);
}

function X402FlowFallback() {
  return (<div className="rd-x402"><X402Header /><X402Rail step={NODES.length + 1} />
  </div>);
}

export function X402Flow() {
  return (
    <BrowserOnly fallback={<X402FlowFallback />}>
      {() => <X402FlowInner />}
    </BrowserOnly>
  );
}
```

The fallback passes `step={NODES.length + 1}` so every node renders as active — the "completed" state. Users without JS or during SSG see the whole flow highlighted; the animation is a progressive reveal on top of that static end-state.

## Comparison With `mdx-sdk-components` Skill

| Concern | `mdx-sdk-components` (this repo's existing skill) | `docusaurus-browseronly-animations` (this skill) |
|---------|--------------------------------------------------|--------------------------------------------------|
| Target | SDK components from `@rickydata/react`, `@rickydata/chat` | Vanilla React components defined in `src/components/` |
| Location of wrapper | Inline in `.mdx` file | Inside the component's own source file |
| Module loading | `require()` inside the render function to defer ESM resolution | Normal `import` at top — we own the source, it is SSG-safe by construction |
| Reason for BrowserOnly | Package uses browser-only globals (Privy, wagmi, WebSocket) | Component uses timers / animation state |
| Fallback content | Descriptive text ("Connect wallet to…") | Static visual frame (same DOM, no animation) |

Both patterns use `@docusaurus/BrowserOnly`, but the problem they solve and how the fallback is written differ. Do not cross-apply them.

## Accessibility — prefers-reduced-motion

The docs-reviewer audit on task #7 flagged that `AnimatedTerminal` does not currently check `prefers-reduced-motion`. This is a minor, non-blocking issue. If you extend this pattern to a new component, consider wrapping the `setInterval` / `setTimeout` start condition in a media-query check:

```tsx
useEffect(() => {
  if (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setStep(NODES.length); // jump to final frame
    return;
  }
  const t = setInterval(...);
  return () => clearInterval(t);
}, []);
```

This is a pattern improvement, not a requirement — currently neither `AnimatedTerminal` nor `X402Flow` ship this.

## Anti-Patterns

- **Do NOT pass JSX as BrowserOnly's child** — it must be a function.
  ```tsx
  // WRONG
  <BrowserOnly fallback={<Fallback />}><Inner /></BrowserOnly>
  ```
- **Do NOT use an empty or `null` fallback for animated components** — SSG output will be empty, causing layout shift on hydration and breaking static snapshot tools. Always render the "final frame" as a static DOM tree.
- **Do NOT wrap in BrowserOnly for components that use browser APIs only in event handlers** — unnecessary and defeats SSG. See `CodeTabs.tsx` for the correct minimal pattern (no wrapper, `navigator.clipboard` only in the copy callback).
- **Do NOT put `typeof window !== 'undefined'` guards around the whole component** as a substitute for BrowserOnly — it works but produces empty SSG output and a worse hydration experience.

## File Reference

| File | Pattern |
|------|---------|
| `apps/docs-site/src/components/AnimatedTerminal.tsx` | Full pattern: Inner + Fallback + BrowserOnly wrapper. Uses `setTimeout` chained on character-typing animation. |
| `apps/docs-site/src/components/X402Flow.tsx` | Same pattern, simpler. Uses `setInterval` for step advancement. |
| `apps/docs-site/src/components/CodeTabs.tsx` | Counter-example: uses `navigator.clipboard` only in event handler, no BrowserOnly needed. |

## Known Limitations

- Both example components currently skip the `prefers-reduced-motion` check. Add it when extending the pattern.
- The fallback duplicates rendering logic from the inner component. Keep them in the same file so drift is visible in code review; do not extract a shared render function if it forces you to pass animation state around.
