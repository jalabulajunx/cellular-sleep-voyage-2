import { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

interface CameraControlsExternalProps {
  visible?: boolean;
  cameraRef?: React.MutableRefObject<THREE.Camera | null>;
}

export function CameraControlsExternal({ visible = true, cameraRef }: CameraControlsExternalProps) {
  const { cameraMode } = useGameStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get camera from global reference or create a dummy one
  const getCamera = useCallback(() => {
    return cameraRef?.current || null;
  }, [cameraRef]);

  // Camera control functions
  const zoomIn = useCallback(() => {
    if (cameraMode === 'locked' || isAnimating) return;
    
    const camera = getCamera();
    if (!camera) return;
    
    setIsAnimating(true);
    const newZoom = Math.min(zoomLevel * 1.2, 5);
    setZoomLevel(newZoom);
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.zoom = newZoom;
      camera.updateProjectionMatrix();
    }
    
    setTimeout(() => setIsAnimating(false), 200);
  }, [getCamera, zoomLevel, cameraMode, isAnimating]);

  const zoomOut = useCallback(() => {
    if (cameraMode === 'locked' || isAnimating) return;
    
    const camera = getCamera();
    if (!camera) return;
    
    setIsAnimating(true);
    const newZoom = Math.max(zoomLevel * 0.8, 0.1);
    setZoomLevel(newZoom);
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.zoom = newZoom;
      camera.updateProjectionMatrix();
    }
    
    setTimeout(() => setIsAnimating(false), 200);
  }, [getCamera, zoomLevel, cameraMode, isAnimating]);

  const rotateLeft = useCallback(() => {
    if (cameraMode === 'locked' || isAnimating) return;
    
    const camera = getCamera();
    if (!camera) return;
    
    setIsAnimating(true);
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);
    spherical.theta += Math.PI / 8;
    
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);
    
    setTimeout(() => setIsAnimating(false), 300);
  }, [getCamera, cameraMode, isAnimating]);

  const rotateRight = useCallback(() => {
    if (cameraMode === 'locked' || isAnimating) return;
    
    const camera = getCamera();
    if (!camera) return;
    
    setIsAnimating(true);
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);
    spherical.theta -= Math.PI / 8;
    
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);
    
    setTimeout(() => setIsAnimating(false), 300);
  }, [getCamera, cameraMode, isAnimating]);

  const rotateUp = useCallback(() => {
    if (cameraMode === 'locked' || isAnimating) return;
    
    const camera = getCamera();
    if (!camera) return;
    
    setIsAnimating(true);
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);
    spherical.phi = Math.max(0.1, spherical.phi - Math.PI / 8);
    
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);
    
    setTimeout(() => setIsAnimating(false), 300);
  }, [getCamera, cameraMode, isAnimating]);

  const rotateDown = useCallback(() => {
    if (cameraMode === 'locked' || isAnimating) return;
    
    const camera = getCamera();
    if (!camera) return;
    
    setIsAnimating(true);
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);
    spherical.phi = Math.min(Math.PI - 0.1, spherical.phi + Math.PI / 8);
    
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);
    
    setTimeout(() => setIsAnimating(false), 300);
  }, [getCamera, cameraMode, isAnimating]);

  const resetView = useCallback(() => {
    if (isAnimating) return;
    
    const camera = getCamera();
    if (!camera) return;
    
    setIsAnimating(true);
    setZoomLevel(1);
    
    // Animate back to default position
    const targetPosition = new THREE.Vector3(0, 0, 10);
    const startPosition = camera.position.clone();
    const startTime = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      camera.position.lerpVectors(startPosition, targetPosition, eased);
      camera.lookAt(0, 0, 0);
      
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.zoom = 1;
        camera.updateProjectionMatrix();
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animate();
  }, [getCamera, isAnimating]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (cameraMode === 'locked') return;
      
      switch (event.key.toLowerCase()) {
        case '=':
        case '+':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
        case '_':
          event.preventDefault();
          zoomOut();
          break;
        case 'arrowleft':
        case 'a':
          event.preventDefault();
          rotateLeft();
          break;
        case 'arrowright':
        case 'd':
          event.preventDefault();
          rotateRight();
          break;
        case 'arrowup':
        case 'w':
          event.preventDefault();
          rotateUp();
          break;
        case 'arrowdown':
        case 's':
          event.preventDefault();
          rotateDown();
          break;
        case 'r':
          event.preventDefault();
          resetView();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, rotateLeft, rotateRight, rotateUp, rotateDown, resetView, cameraMode]);

  if (!visible || cameraMode === 'locked') return null;

  return (
    <div className="camera-controls">
      {/* Zoom Controls */}
      <div className="control-group zoom-controls">
        <div className="control-label">Zoom</div>
        <button 
          className="control-button zoom-in"
          onClick={zoomIn}
          disabled={isAnimating || zoomLevel >= 5}
          title="Zoom In (+)"
        >
          🔍+
        </button>
        <div className="zoom-indicator">
          {Math.round(zoomLevel * 100)}%
        </div>
        <button 
          className="control-button zoom-out"
          onClick={zoomOut}
          disabled={isAnimating || zoomLevel <= 0.1}
          title="Zoom Out (-)"
        >
          🔍-
        </button>
      </div>

      {/* Rotation Controls */}
      <div className="control-group rotation-controls">
        <div className="control-label">Rotate</div>
        <div className="rotation-grid">
          <div></div>
          <button 
            className="control-button rotate-up"
            onClick={rotateUp}
            disabled={isAnimating}
            title="Rotate Up (↑ or W)"
          >
            ⬆️
          </button>
          <div></div>
          
          <button 
            className="control-button rotate-left"
            onClick={rotateLeft}
            disabled={isAnimating}
            title="Rotate Left (← or A)"
          >
            ⬅️
          </button>
          <button 
            className="control-button reset-view"
            onClick={resetView}
            disabled={isAnimating}
            title="Reset View (R)"
          >
            🎯
          </button>
          <button 
            className="control-button rotate-right"
            onClick={rotateRight}
            disabled={isAnimating}
            title="Rotate Right (→ or D)"
          >
            ➡️
          </button>
          
          <div></div>
          <button 
            className="control-button rotate-down"
            onClick={rotateDown}
            disabled={isAnimating}
            title="Rotate Down (↓ or S)"
          >
            ⬇️
          </button>
          <div></div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcuts />
    </div>
  );
}

function KeyboardShortcuts() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <div className="keyboard-shortcuts">
      <button 
        className="shortcuts-toggle"
        onClick={() => setShowShortcuts(!showShortcuts)}
        title="Show Keyboard Shortcuts"
      >
        ⌨️
      </button>
      
      {showShortcuts && (
        <div className="shortcuts-panel">
          <h4>Keyboard Shortcuts</h4>
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <span className="key">+/-</span>
              <span className="action">Zoom In/Out</span>
            </div>
            <div className="shortcut-item">
              <span className="key">Arrow Keys</span>
              <span className="action">Rotate Camera</span>
            </div>
            <div className="shortcut-item">
              <span className="key">WASD</span>
              <span className="action">Rotate Camera</span>
            </div>
            <div className="shortcut-item">
              <span className="key">R</span>
              <span className="action">Reset View</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick action buttons for common camera positions
export function QuickViewButtonsExternal({ cameraRef }: { cameraRef?: React.MutableRefObject<THREE.Camera | null> }) {
  const { cameraMode } = useGameStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const getCamera = useCallback(() => {
    return cameraRef?.current || null;
  }, [cameraRef]);

  const animateToPosition = useCallback((position: THREE.Vector3, name: string) => {
    if (cameraMode === 'locked' || isAnimating) return;
    
    const camera = getCamera();
    if (!camera) return;
    
    setIsAnimating(true);
    const startPosition = camera.position.clone();
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPosition, position, eased);
      camera.lookAt(0, 0, 0);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        console.log(`Moved to ${name} view`);
      }
    };
    
    animate();
  }, [getCamera, cameraMode, isAnimating]);

  const viewPositions = [
    { name: 'Front', position: new THREE.Vector3(0, 0, 15), icon: '👁️' },
    { name: 'Top', position: new THREE.Vector3(0, 15, 0), icon: '⬆️' },
    { name: 'Side', position: new THREE.Vector3(15, 0, 0), icon: '↗️' },
    { name: 'Isometric', position: new THREE.Vector3(10, 10, 10), icon: '📐' }
  ];

  if (cameraMode === 'locked') return null;

  return (
    <div className="quick-view-buttons">
      <div className="control-label">Quick Views</div>
      <div className="view-buttons">
        {viewPositions.map((view) => (
          <button
            key={view.name}
            className="view-button"
            onClick={() => animateToPosition(view.position, view.name)}
            disabled={isAnimating}
            title={`${view.name} View`}
          >
            <span className="view-icon">{view.icon}</span>
            <span className="view-name">{view.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}