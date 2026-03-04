# Local Video Staging

Use this directory for local preview of docs videos.

- Expected quickstart demo filename: `mcp-marketplace-usage-demo.mp4`
- Local URL when running web app: `/videos/mcp-marketplace-usage-demo.mp4`

Do not commit large binary media files directly to git for production.
For deployed environments, host videos in object storage/CDN and set
`VITE_VIDEO_QUICKSTART_DEMO_URL` in CI.
