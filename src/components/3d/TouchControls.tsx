import { useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

interface TouchControlsProps {
  children: React.ReactNode;
}

export function TouchControls({ children }: TouchControlsProps) {
  const { gl } = useThree();
  const { interactionMode } = useGameStore();
  const [touchState, setTouchState] = useState<{
    touches: Touch[];
    lastDistance: number;
    lastCenter: { x: number; y: number };
    isRotating: boolean;
    isPinching: boolean;
  }>({
    touches: [],
    lastDistance: 0,
    lastCenter: { x: 0, y: 0 },
    isRotating: false,
    isPinching: false
  });

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (interactionMode === 'locked') return;
    
    event.preventDefault();
    const touches = Array.from(event.touches);
    
    if (touches.length === 1) {
      // Single touch - rotation
      setTouchState(prev => ({
        ...prev,
        touches,
        isRotating: true,
        lastCenter: { x: touches[0].clientX, y: touches[0].clientY }
      }));
    } else if (touches.length === 2) {
      // Two touches - pinch to zoom
      const distance = getTouchDistance(touches[0], touches[1]);
      const center = getTouchCenter(touches[0], touches[1]);
      
      setTouchState(prev => ({
        ...prev,
        touches,
        isPinching: true,
        isRotating: false,
        lastDistance: distance,
        lastCenter: center
      }));
    }
  }, [interactionMode]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (interactionMode === 'locked') return;
    
    event.preventDefault();
    const touches = Array.from(event.touches);
    
    if (touches.length === 1 && touchState.isRotating) {
      // Handle rotation
      const deltaX = touches[0].clientX - touchState.lastCenter.x;
      const deltaY = touches[0].clientY - touchState.lastCenter.y;
      
      // Emit rotation event
      window.dispatchEvent(new CustomEvent('touch-rotate', {
        detail: { deltaX, deltaY }
      }));
      
      setTouchState(prev => ({
        ...prev,
        lastCenter: { x: touches[0].clientX, y: touches[0].clientY }
      }));
    } else if (touches.length === 2 && touchState.isPinching) {
      // Handle pinch zoom
      const distance = getTouchDistance(touches[0], touches[1]);
      const center = getTouchCenter(touches[0], touches[1]);
      const deltaDistance = distance - touchState.lastDistance;
      
      // Emit zoom event
      window.dispatchEvent(new CustomEvent('touch-zoom', {
        detail: { delta: deltaDistance * 0.01 }
      }));
      
      setTouchState(prev => ({
        ...prev,
        lastDistance: distance,
        lastCenter: center
      }));
    }
  }, [touchState, interactionMode]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    event.preventDefault();
    
    setTouchState({
      touches: [],
      lastDistance: 0,
      lastCenter: { x: 0, y: 0 },
      isRotating: false,
      isPinching: false
    });
  }, []);

  // Set up touch event listeners
  useFrame(() => {
    const canvas = gl.domElement;
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  });

  return (
    <group>
      {children}
      <TouchRotationHandler />
      <TouchZoomHandler />
    </group>
  );
}

function TouchRotationHandler() {
  const { camera } = useThree();
  const rotationSpeed = 0.002;

  useFrame(() => {
    const handleRotation = (event: CustomEvent) => {
      const { deltaX, deltaY } = event.detail;
      
      // Rotate camera around the target
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      
      spherical.theta -= deltaX * rotationSpeed;
      spherical.phi += deltaY * rotationSpeed;
      
      // Limit vertical rotation
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    };

    window.addEventListener('touch-rotate', handleRotation as EventListener);
    return () => window.removeEventListener('touch-rotate', handleRotation as EventListener);
  });

  return null;
}

function TouchZoomHandler() {
  const { camera } = useThree();
  const [zoomLevel, setZoomLevel] = useState(1);
  const minZoom = 0.1;
  const maxZoom = 5;

  useFrame(() => {
    const handleZoom = (event: CustomEvent) => {
      const { delta } = event.detail;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));
      
      setZoomLevel(newZoom);
      
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.zoom = newZoom;
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener('touch-zoom', handleZoom as EventListener);
    return () => window.removeEventListener('touch-zoom', handleZoom as EventListener);
  });

  return null;
}

// Gesture recognition for advanced interactions
export function GestureRecognition() {
  // Gesture recognition logic would be implemented here
  // Currently placeholder for future implementation
  return null;
}

// Haptic feedback for touch interactions
export function HapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  useFrame(() => {
    const handleTap = () => triggerHaptic('light');
    const handleSelection = () => triggerHaptic('medium');
    const handleError = () => triggerHaptic('heavy');

    window.addEventListener('gesture-tap', handleTap);
    window.addEventListener('organelle-selected', handleSelection);
    window.addEventListener('interaction-error', handleError);

    return () => {
      window.removeEventListener('gesture-tap', handleTap);
      window.removeEventListener('organelle-selected', handleSelection);
      window.removeEventListener('interaction-error', handleError);
    };
  });

  return null;
}

// Utility functions
function getTouchDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTouchCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  };
}

// Touch-friendly UI overlay
interface TouchUIProps {
  visible: boolean;
}

export function TouchUI({ visible }: TouchUIProps) {
  const { selectedOrganelle, setInteractionMode, interactionMode } = useGameStore();

  if (!visible) return null;

  return (
    <div className="touch-ui-overlay">
      <div className="touch-controls">
        <button
          className="touch-button"
          onClick={() => setInteractionMode('explore')}
          data-active={interactionMode === 'explore'}
        >
          🔍 Explore
        </button>
        
        <button
          className="touch-button"
          onClick={() => setInteractionMode('experiment')}
          data-active={interactionMode === 'experiment'}
        >
          🧪 Experiment
        </button>
        
        {selectedOrganelle && (
          <button
            className="touch-button explode-button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('toggle-exploded-view'));
            }}
          >
            💥 Explode View
          </button>
        )}
      </div>
      
      <div className="touch-hints">
        <p>👆 Tap to select • 🤏 Pinch to zoom • 🔄 Drag to rotate</p>
      </div>
    </div>
  );
}