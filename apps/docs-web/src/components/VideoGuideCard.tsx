import { useState } from "react";
import type { VideoGuide } from "../content/video-guides";

type VideoGuideCardProps = {
  guide: VideoGuide;
  showPrompt?: boolean;
};

export function VideoGuideCard({ guide, showPrompt = true }: VideoGuideCardProps): JSX.Element {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section className="video-guide-card">
      <div className="video-guide-head">
        <div>
          <p className="eyebrow">Video Guide</p>
          <h3>{guide.title}</h3>
        </div>
        {guide.status === "live" && !videoFailed && (
          <span className="status-badge status-live">Live</span>
        )}
      </div>

      <p className="muted">{guide.purpose}</p>

      <div className="video-guide-meta">
        <span className="pill">Duration: {guide.duration}</span>
        <span className="pill">Audience: {guide.audience}</span>
      </div>

      {guide.videoUrl && !videoFailed ? (
        <div className="video-frame-wrap">
          <video
            className="video-frame"
            controls
            preload="metadata"
            onError={() => setVideoFailed(true)}
          >
            <source src={guide.videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div className="video-placeholder">
          <p>Video coming soon.</p>
          <small>This walkthrough is being recorded and will appear here shortly.</small>
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
