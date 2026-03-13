import { useState } from "react";
import type { VideoGuide } from "../content/video-guides";

type VideoGuideCardProps = {
  guide: VideoGuide;
  showPrompt?: boolean;
};

export function VideoGuideCard({ guide, showPrompt = true }: VideoGuideCardProps): JSX.Element {
  const [videoFailed, setVideoFailed] = useState(false);
  const hasVideo = guide.videoUrl && !videoFailed;

  return (
    <section className="video-guide-card">
      <div className="video-guide-head">
        <div>
          <p className="eyebrow">Video Guide</p>
          <h3>{guide.title}</h3>
          <p className="video-guide-purpose">{guide.purpose}</p>
        </div>
        {guide.status === "live" && !videoFailed && (
          <span className="status-badge status-live">Live</span>
        )}
        {guide.status !== "live" && (
          <span className="status-badge status-pending">Pending</span>
        )}
      </div>

      <div className="video-guide-meta">
        <span className="pill">{guide.duration}</span>
        <span className="pill">{guide.audience}</span>
      </div>

      {hasVideo ? (
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
          <div className="video-placeholder-icon">&#9654;</div>
          <p>Recording in progress</p>
          <small>This walkthrough is being recorded and will appear here when ready.</small>
        </div>
      )}

      {showPrompt && (
        <details className="video-prompt">
          <summary>Demo prompt / script</summary>
          <pre>{guide.recordingPrompt}</pre>
        </details>
      )}
    </section>
  );
}
