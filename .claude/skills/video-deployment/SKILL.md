---
name: video-deployment
description: How to add, update, or debug video guides in the docs site. Covers the full pipeline from local file to production — GCS upload, GitHub Secrets, Dockerfile args, deploy workflow, and video-guides.ts config.
user-invokable: true
---

# Video Deployment Guide

## Overview

Videos are NOT committed to git (`.gitignore` excludes `apps/docs-web/public/videos/*.mp4`). They are hosted in a GCS bucket and their URLs are baked into the Docker image at build time via `VITE_VIDEO_*` environment variables.

## Architecture

```
Local file (public/videos/*.mp4)
  → Upload to gs://rickydata-docs-videos/
  → Set GitHub Secret (VITE_VIDEO_*_URL)
  → deploy-docs.yml passes secret as --build-arg
  → Dockerfile ARG + ENV makes it available to Vite
  → resolveVideo() in video-guides.ts reads import.meta.env
  → VideoGuideCard renders <video> with the URL
```

## Adding a New Video — Complete Checklist

### 1. Place the local file

Copy the mp4 to `apps/docs-web/public/videos/` with a kebab-case name:
```bash
cp ~/Downloads/my-video.mp4 apps/docs-web/public/videos/my-video.mp4
```
This enables local dev playback via `resolveVideo()` fallback.

### 2. Upload to GCS bucket

```bash
gcloud storage cp apps/docs-web/public/videos/my-video.mp4 gs://rickydata-docs-videos/
```

Verify public access:
```bash
curl -sI "https://storage.googleapis.com/rickydata-docs-videos/my-video.mp4" | head -3
# Must return HTTP/2 200
```

### 3. Set the GitHub Secret

```bash
gh secret set VITE_VIDEO_MY_VIDEO_URL \
  --body "https://storage.googleapis.com/rickydata-docs-videos/my-video.mp4"
```

### 4. Add the Dockerfile ARG + ENV

In `apps/docs-web/Dockerfile`, add both lines in the builder stage (keep alphabetical with existing args):
```dockerfile
ARG VITE_VIDEO_MY_VIDEO_URL
ENV VITE_VIDEO_MY_VIDEO_URL=$VITE_VIDEO_MY_VIDEO_URL
```

### 5. Add the --build-arg to the deploy workflow

In `.github/workflows/deploy-docs.yml`, in the "Build and push web image" step, add:
```yaml
--build-arg VITE_VIDEO_MY_VIDEO_URL="${{ secrets.VITE_VIDEO_MY_VIDEO_URL }}" \
```

### 6. Register in video-guides.ts

In `apps/docs-web/src/content/video-guides.ts`:
```typescript
export const MY_VIDEO_GUIDE: VideoGuide = {
  id: "my-video",
  title: "...",
  duration: "...",
  audience: "...",
  purpose: "...",
  pageAnchor: "/playbooks#section-id",
  recordingPrompt: "...",
  ...videoOrUndefined("VITE_VIDEO_MY_VIDEO_URL", "my-video.mp4")
};
```

The `videoOrUndefined()` helper handles the env var → status mapping:
- Env var set → `{ status: "live", videoUrl: "https://..." }`
- Env var missing + DEV mode → `{ status: "live", videoUrl: "/videos/my-video.mp4" }`
- Env var missing + production → `{ status: "record-needed" }` (shows placeholder)

### 7. Use in a page

```tsx
import { MY_VIDEO_GUIDE } from "../content/video-guides";
<VideoGuideCard guide={MY_VIDEO_GUIDE} />
```

## Updating an Existing Video

If replacing the file for an existing guide:

1. Upload the new file to GCS (can use same name or new name)
2. If the filename changed, update:
   - The local file reference in `videoOrUndefined()` call in `video-guides.ts`
   - The GitHub Secret URL: `gh secret set VITE_VIDEO_*_URL --body "https://..."`
3. Push to main to trigger deploy

If the filename stays the same, just upload to GCS — the URL in the secret is unchanged.

## Current Video Inventory

| Guide Constant | Env Var | GCS File | Local File |
|---------------|---------|----------|------------|
| `FEATURED_VIDEO_GUIDE` | `VITE_VIDEO_QUICKSTART_DEMO_URL` | `mcp-marketplace-usage-demo.mp4` | same |
| `MCP_RUNTIME_LOOP_GUIDE` | `VITE_VIDEO_MCP_RUNTIME_URL` | `01-cli-mcp-runtime-loop.mp4` | same |
| `INIT_WIZARD_GUIDE` | `VITE_VIDEO_INIT_WIZARD_URL` | `02-init-wizard-auth-connect.mp4` | same |
| `CLAUDE_CHAT_CONNECTOR_GUIDE` | `VITE_VIDEO_CLAUDE_CHAT_CONNECTOR_URL` | `guide-claude-desktop.mp4` | same |
| `WALLET_FUNDING_GUIDE` | `VITE_VIDEO_WALLET_FUNDING_URL` | `04-wallet-funding.mp4` | same |

## Debugging

**Video shows "Recording in progress" placeholder in production:**
1. Check the GitHub Secret exists: `gh secret list | grep VITE_VIDEO`
2. Check the Dockerfile has both `ARG` and `ENV` lines for it
3. Check `deploy-docs.yml` passes it as `--build-arg`
4. All three must be present — missing any one silently falls back to placeholder

**Video works locally but not in production:**
- Local dev uses `resolveVideo()` fallback to `/videos/filename.mp4`
- Production has no local files — it relies entirely on the env var URL
- Verify the secret is set AND the file is uploaded to GCS AND the bucket allows public access

**Video 404 in production:**
- Check the GCS file exists: `gcloud storage ls gs://rickydata-docs-videos/`
- Check public access: `curl -sI "https://storage.googleapis.com/rickydata-docs-videos/filename.mp4"`
- The bucket `rickydata-docs-videos` has `allUsers` read access by default

## Key Files

| File | Role |
|------|------|
| `apps/docs-web/src/content/video-guides.ts` | Video definitions + `resolveVideo()` helper |
| `apps/docs-web/src/components/VideoGuideCard.tsx` | Renders video or placeholder |
| `apps/docs-web/Dockerfile` | ARG + ENV for build-time injection |
| `.github/workflows/deploy-docs.yml` | Passes secrets as --build-arg |
| `apps/docs-web/public/videos/` | Local dev copies (gitignored) |
| `gs://rickydata-docs-videos/` | Production GCS bucket |
