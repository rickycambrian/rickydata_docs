import type { VideoGuide } from "../content/video-guides";

type VideoGuideCardProps = {
  guide: VideoGuide;
  showPrompt?: boolean;
};

export function VideoGuideCard({ guide, showPrompt = true }: VideoGuideCardProps): JSX.Element {
  return (
    <section className="video-guide-card">
      <div className="video-guide-head">
        <div>
          <p className="eyebrow">Video Guide</p>
          <h3>{guide.title}</h3>
        </div>
        <span className={`status-badge ${guide.status === "live" ? "status-live" : "status-pending"}`}>
          {guide.status === "live" ? "Live" : "Record Needed"}
        </span>
      </div>

      <p className="muted">{guide.purpose}</p>

      <div className="video-guide-meta">
        <span className="pill">Duration: {guide.duration}</span>
        <span className="pill">Audience: {guide.audience}</span>
      </div>

      {guide.videoUrl ? (
        <div className="video-frame-wrap">
          <video className="video-frame" controls preload="metadata">
            <source src={guide.videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div className="video-placeholder">
          <p>No published video URL configured yet.</p>
          <small>
            Set build env var <code>VITE_VIDEO_QUICKSTART_DEMO_URL</code> or host the mp4 at
            <code> apps/docs-web/public/videos/mcp-marketplace-usage-demo.mp4</code> during local preview.
          </small>
        </div>
      )}

      {showPrompt && (
        <div className="video-prompt">
          <p className="muted">Recommended demo prompt/script</p>
          <pre>{guide.recordingPrompt}</pre>
        </div>
      )}
    </section>
  );
}
