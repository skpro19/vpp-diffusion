import { useState, useRef, useEffect, useCallback } from 'react';

interface VideoPlayerProps {
  onVideoLoad: (videoElement: HTMLVideoElement) => void;
  showVideoPreview?: boolean;
  srcToPlay: string | null;
}

export default function VideoPlayer({
  onVideoLoad,
  showVideoPreview = true,
  srcToPlay
}: VideoPlayerProps) {
  const [internalVideoSrc, setInternalVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (srcToPlay) {
      setInternalVideoSrc(srcToPlay);
    } else {
      setInternalVideoSrc(null);
    }
  }, [srcToPlay]);

  const handleVideoElementLoaded = useCallback(() => {
    if (onVideoLoad && videoRef.current) {
      onVideoLoad(videoRef.current);
    }
  }, [onVideoLoad]);

  return (
    <div
      className="video-player-wrapper"
      style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}
    >
      {internalVideoSrc && showVideoPreview && (
        <video
          ref={videoRef}
          src={internalVideoSrc}
          onLoadedData={handleVideoElementLoaded}
          controls
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
          playsInline
        />
      )}

      {!internalVideoSrc && showVideoPreview && (
        <div
          className="video-placeholder-main"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            color: '#ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2em',
            textAlign: 'center',
          }}
        >
          <p>Upload a video to begin.</p>
        </div>
      )}
    </div>
  );
}
