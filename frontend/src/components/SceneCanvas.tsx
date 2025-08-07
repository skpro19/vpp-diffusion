import React from 'react';

interface SceneCanvasProps {
  videoElement: HTMLVideoElement;
  modelUrl: string | null;
  exrFileUrl?: string | null;
  style?: React.CSSProperties;
}

export default function SceneCanvas({
  videoElement,
  modelUrl,
  exrFileUrl,
  style,
}: SceneCanvasProps) {
  return (
    <div
      style={{
        ...style,
        backgroundColor: '#000',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.2em',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p>3D Scene Canvas</p>
        <p style={{ fontSize: '0.8em', color: '#ccc' }}>
          Video: {videoElement ? 'Loaded' : 'Not loaded'}
        </p>
        <p style={{ fontSize: '0.8em', color: '#ccc' }}>
          Model: {modelUrl ? 'Loaded' : 'Not loaded'}
        </p>
        <p style={{ fontSize: '0.8em', color: '#ccc' }}>
          EXR: {exrFileUrl ? 'Loaded' : 'Not loaded'}
        </p>
      </div>
    </div>
  );
}
