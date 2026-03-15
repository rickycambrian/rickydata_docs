# RickyData Docs — Project Context

## Stack
- **Frontend**: React SPA at `apps/docs-web/` (Vite + TypeScript + React Router)
- **Backend**: Express API at `apps/docs-api/`
- **Packages**: `packages/content-parsers`, `packages/shared-types`

## Build Command
```bash
cd apps/docs-web && npx vite build
```

## Design Direction (Redesign Branch)

**IMPORTANT**: `apps/docs-web/DESIGN_DIRECTION.md` is OUTDATED and should NOT be followed.

The current redesign uses:
- **Typography**: Space Grotesk (headings, 600-700 weight) + DM Sans (body, 400-500 weight). NO Inter.
- **Color**: OKLCH palette throughout. Warm-tinted neutrals (chroma 0.005-0.01, hue ~50-70). Accent is warm amber/ochre (NOT emerald #34d399).
- **Layout**: Asymmetric, left-aligned, varied card sizes. No uniform grids.
- **Motion**: ease-out-quart/expo curves, 150-400ms durations, prefers-reduced-motion support.
- **Dark theme**: Preserved, but with warm chroma instead of pure gray.
- **Content**: 1-sentence hero leads, no duplicate link grids (use `.resources-strip` for secondary nav).
- **Spacing**: `--space-4xl` (72px) for section separation, `border-top` dividers between major sections.

## File Ownership (Redesign)

| Owner | Files |
|-------|-------|
| css-architect | `global.css`, `index.html`, `Layout.tsx` |
| homepage-designer | `HomePage.tsx`, `QuickstartPage.tsx` |
| catalog-designer | `ProductPage.tsx`, `SearchPage.tsx`, `PlaybooksPage.tsx`, `DocPage.tsx`, all `components/*.tsx` |
| docs-expert | `.claude/skills/design-system/` |

## Skills & Sub-agents

- **`/design-system`** — Invoke when building or modifying pages in `apps/docs-web/`. Provides all verified OKLCH tokens, typography, spacing, motion, and component patterns. Source: `.claude/skills/design-system/SKILL.md`.
- **`/video-deployment`** — Invoke when adding, updating, or debugging video guides. Covers the full pipeline: local file, GCS upload, GitHub Secrets, Dockerfile args, deploy workflow, and `video-guides.ts` config. Source: `.claude/skills/video-deployment/SKILL.md`.
- **`docs-reviewer`** sub-agent — Use after content or navigation changes to verify backlink completeness, navigation integrity, design consistency, and build success. Defined at `.claude/agents/docs-reviewer.md`.

## Key Paths
- Global CSS: `apps/docs-web/src/styles/global.css`
- Pages: `apps/docs-web/src/pages/`
- Components: `apps/docs-web/src/components/`
- HTML template: `apps/docs-web/index.html`
