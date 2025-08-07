import { useState, useEffect, useCallback } from "react";
import "./index.css";
import SceneCanvas from "./components/SceneCanvas";
import VideoPlayer from "./components/VideoPlayer";
import UploadButton from "./components/UploadButton";

export default function App() {
  const [videoFileUrl, setVideoFileUrl] = useState<string | null>(null);
  const [videoElementForScene, setVideoElementForScene] = useState<HTMLVideoElement | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [exrFileUrl, setExrFileUrl] = useState<string | null>(null);
  const [exrError, setExrError] = useState<string | null>(null);
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

  const handleModelFileSelected = useCallback((file: File | null) => {
    setModelError(null);
    if (file) {
      if (file.name.endsWith('.gltf') || file.name.endsWith('.glb')) {
        const url = URL.createObjectURL(file);
        setModelUrl(url);
      } else {
        setModelError('Invalid file type. Please select a .gltf or .glb file.');
        setModelUrl(null);
      }
    } else {
      setModelUrl(null);
    }
  }, []);

  const handleExrFileSelected = useCallback((file: File | null) => {
    setExrError(null);
    if (file) {
      if (file.name.endsWith('.exr')) {
        const url = URL.createObjectURL(file);
        setExrFileUrl(url);
      } else {
        setExrError('Invalid file type. Please select a .exr file.');
        setExrFileUrl(null);
      }
    } else {
      setExrFileUrl(null);
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

  useEffect(() => {
    const currentModelUrl = modelUrl;
    return () => {
      if (currentModelUrl && currentModelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentModelUrl);
      }
    };
  }, [modelUrl]);

  useEffect(() => {
    const currentExrUrl = exrFileUrl;
    return () => {
      if (currentExrUrl && currentExrUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentExrUrl);
      }
    };
  }, [exrFileUrl]);

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

        {videoElementForScene && modelUrl && (
          <div style={sceneCanvasStyle}>
            <SceneCanvas
              videoElement={videoElementForScene}
              modelUrl={modelUrl}
              exrFileUrl={exrFileUrl}
            />
          </div>
        )}
      </div>
      
      <div className="action-buttons-panel">
        <UploadButton
          id="video-upload-app"
          labelContent="[Vid Icon]"
          accept="video/*"
          onFileSelected={handleNewVideoFile}
        />
        <UploadButton
          id="model-upload-app"
          labelContent="[3D Icon]"
          accept=".gltf,.glb"
          onFileSelected={handleModelFileSelected}
        />
        <UploadButton
          id="exr-upload-app"
          labelContent="[EXR Icon]"
          accept=".exr"
          onFileSelected={handleExrFileSelected}
        />
      </div>
      
      {modelError && (
        <p
          style={{
            color: '#ff6b6b',
            fontSize: '0.9em',
            marginTop: '10px',
            textAlign: 'center',
          }}
        >
          {modelError}
        </p>
      )}
      {exrError && (
        <p
          style={{
            color: '#ff6b6b',
            fontSize: '0.9em',
            marginTop: '10px',
            textAlign: 'center',
          }}
        >
          {exrError}
        </p>
      )}
    </div>
  );
}
