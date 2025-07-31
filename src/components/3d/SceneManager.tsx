import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

interface SceneManagerProps {
  children: React.ReactNode;
  cameraRef?: React.MutableRefObject<THREE.Camera | null>;
}

export function SceneManager({ children, cameraRef }: SceneManagerProps) {
  const { gl, scene, camera } = useThree();
  const controlsRef = useRef<any>(null);
  const { cameraMode, isPlaying } = useGameStore();
  
  // Update camera ref for external controls
  useEffect(() => {
    if (cameraRef) {
      cameraRef.current = camera;
    }
  }, [camera, cameraRef]);
  
  // Performance monitoring
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const fpsRef = useRef(60);

  useEffect(() => {
    // Configure renderer for optimal performance
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;
    
    // Antialiasing is configured in Canvas props
    
    // Set background color with gradient effect
    scene.background = new THREE.Color(0x1a1a2e);
    
    // Add fog for depth perception
    scene.fog = new THREE.Fog(0x1a1a2e, 50, 200);
    
    console.log('Scene initialized with WebGL renderer');
  }, [gl, scene]);

  useEffect(() => {
    // Adjust controls based on camera mode
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      switch (cameraMode) {
        case 'free':
          controls.enabled = true;
          controls.enablePan = true;
          controls.enableRotate = true;
          controls.enableZoom = true;
          controls.maxDistance = 50;
          controls.minDistance = 2;
          controls.rotateSpeed = 0.3;
          controls.zoomSpeed = 0.5;
          controls.panSpeed = 0.5;
          break;
        case 'guided':
          controls.enabled = true;
          controls.enablePan = false;
          controls.enableRotate = true;
          controls.enableZoom = true;
          controls.maxDistance = 20;
          controls.minDistance = 5;
          controls.rotateSpeed = 0.2;
          controls.zoomSpeed = 0.3;
          break;
        case 'locked':
          controls.enabled = false;
          break;
      }
    }
  }, [cameraMode]);

  // Performance monitoring and optimization
  useFrame(() => {
    frameCount.current++;
    const now = Date.now();
    
    // Calculate FPS every second
    if (now - lastTime.current >= 1000) {
      fpsRef.current = frameCount.current;
      frameCount.current = 0;
      lastTime.current = now;
      
      // Automatic quality adjustment based on performance
      if (fpsRef.current < 30) {
        // Reduce quality for better performance
        gl.setPixelRatio(1);
        scene.fog = new THREE.Fog(0x1a1a2e, 30, 100);
      } else if (fpsRef.current > 55) {
        // Increase quality if performance allows
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        scene.fog = new THREE.Fog(0x1a1a2e, 50, 200);
      }
    }

    // Update controls if playing
    if (isPlaying && controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 10]}
        fov={75}
        near={0.1}
        far={1000}
      />
      
      {/* Orbit controls for camera movement */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.3}
        zoomSpeed={0.5}
        panSpeed={0.5}
        screenSpacePanning={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
        target={[0, 0, 0]}
        autoRotate={false}
        autoRotateSpeed={0}
      />
      
      {/* Lighting setup */}
      <SceneLighting />
      
      {/* Children components */}
      {children}
      
      {/* Removed UI controls from here - they're now external */}
      
      {/* Performance monitor (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor fps={fpsRef.current} />
      )}
    </>
  );
}

function SceneLighting() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* Main directional light (sun-like) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light to reduce harsh shadows */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#4ecdc4"
      />
      
      {/* Rim light for edge definition */}
      <directionalLight
        position={[0, -10, -5]}
        intensity={0.2}
        color="#ff6b6b"
      />
      
      {/* Point lights for cellular atmosphere */}
      <pointLight
        position={[5, 0, 5]}
        intensity={0.5}
        color="#667eea"
        distance={20}
        decay={2}
      />
      
      <pointLight
        position={[-5, 0, -5]}
        intensity={0.3}
        color="#764ba2"
        distance={15}
        decay={2}
      />
    </>
  );
}

interface PerformanceMonitorProps {
  fps: number;
}

function PerformanceMonitor({ fps }: PerformanceMonitorProps) {
  return (
    <mesh position={[8, 6, 0]}>
      <planeGeometry args={[2, 0.5]} />
      <meshBasicMaterial color={fps < 30 ? 'red' : fps < 50 ? 'yellow' : 'green'} />
    </mesh>
  );
}