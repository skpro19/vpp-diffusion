import { useState, useEffect, useCallback } from "react";
import "./index.css";
import SceneCanvas from "./components/SceneCanvas";
import VideoPlayer from "./components/VideoPlayer";
import UploadButton from "./components/UploadButton";

export default function App() {
  const [videoFileUrl, setVideoFileUrl] = useState<string | null>(null);
  const [videoElementForScene, setVideoElementForScene] = useState<HTMLVideoElement | null>(null);
  const [playerAspectRatio, setPlayerAspectRatio] = useState<string | number>('16 / 9');

  const handleNewVideoFile = useCallback((file: File | null) => {
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setVideoFileUrl(newUrl);
      setVideoElementForScene(null);
    } else {
      setVideoFileUrl(null);
      setVideoElementForScene(null);
      setPlayerAspectRatio('1 / 1');
    }
  }, []);

  const handleMediaPlayerLoaded = useCallback((videoEl: HTMLVideoElement) => {
    setVideoElementForScene(videoEl);
    if (videoEl.videoHeight > 0) {
      setPlayerAspectRatio(videoEl.videoWidth / videoEl.videoHeight);
    }
  }, []);

  useEffect(() => {
    const currentVideoUrl = videoFileUrl;
    return () => {
      if (currentVideoUrl && currentVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentVideoUrl);
      }
    };
  }, [videoFileUrl]);

  const mediaWrapperStyle = {
    width: 'clamp(400px, 60vw, 800px)',
    aspectRatio: playerAspectRatio,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'aspect-ratio 0.3s ease-in-out',
  };

  const sceneCanvasStyle = {
    ...mediaWrapperStyle,
    width: '80vw',
    maxWidth: '90vw',
  };

  return (
    <div className="app-container">
      <div className="scene-container">
        <div style={mediaWrapperStyle}>
          <VideoPlayer
            srcToPlay={videoFileUrl}
            onVideoLoad={handleMediaPlayerLoaded}
            showVideoPreview={true}
          />
        </div>

        {videoElementForScene && (
          <div style={sceneCanvasStyle}>
            <SceneCanvas
              videoElement={videoElementForScene}
            />
          </div>
        )}
      </div>
      
      <div className="action-buttons-panel">
        <UploadButton
          id="video-upload-app"
          labelContent="[Upload Video]"
          accept="video/*"
          onFileSelected={handleNewVideoFile}
        />
      </div>
    </div>
  );
}
