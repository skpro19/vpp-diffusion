import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface SceneCanvasProps {
  videoElement: HTMLVideoElement;
  modelUrl: string | null;
  exrFileUrl?: string | null;
  style?: React.CSSProperties;
}

// Simplified RenderOrchestrator that only handles video playback
function RenderOrchestrator({ videoElement }: { videoElement: HTMLVideoElement | null }) {
  const { gl: renderer, scene, camera } = useThree();
  const bgSceneRef = useRef<THREE.Scene | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);

  useEffect(() => {
    if (!videoElement) return;

    // Create background scene for video
    const bgScene = new THREE.Scene();
    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create video texture
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    // Create video quad
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    const videoQuad = new THREE.Mesh(quadGeometry, videoMaterial);
    videoQuad.frustumCulled = false;
    bgScene.add(videoQuad);

    bgSceneRef.current = bgScene;
    orthoCameraRef.current = orthoCamera;

    return () => {
      // Cleanup
      quadGeometry.dispose();
      videoMaterial.dispose();
      videoTexture.dispose();
    };
  }, [videoElement]);

  // Multi-pass render orchestration
  useFrame(() => {
    if (!videoElement || !bgSceneRef.current || !orthoCameraRef.current) {
      // No video background - let R3F handle normal rendering
      return;
    }

    // Disable auto-clear to control render passes manually
    renderer.autoClear = false;

    // Pass 1: Render video background
    renderer.clear();
    renderer.render(bgSceneRef.current, orthoCameraRef.current);

    // Pass 2: Render normal 3D scene on top
    renderer.clearDepth();
    renderer.render(scene, camera);
  }, 1); // Priority 1 to override default rendering

  return null;
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
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#000',
        borderRadius: '12px',
      }}
    >
      <Canvas>
        {/* Render orchestrator manages video background */}
        <RenderOrchestrator videoElement={videoElement} />

        {/* Simple camera setup */}
        <PerspectiveCamera
          makeDefault
          fov={45}
          near={0.1}
          far={1000}
          position={[0, 0, 5]}
        />

        {/* Optional: Add a simple cube to show 3D scene is working */}
        {modelUrl && (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
          </mesh>
        )}

        {/* Add lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
      </Canvas>

      {/* Status overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: '10px 20px',
        borderRadius: '5px',
        fontSize: '0.9em',
        pointerEvents: 'none'
      }}>
        <div>Video: {videoElement ? 'Playing' : 'Not loaded'}</div>
        <div>Model: {modelUrl ? 'Loaded' : 'Not loaded'}</div>
        <div>EXR: {exrFileUrl ? 'Loaded' : 'Not loaded'}</div>
      </div>
    </div>
  );
}
