import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../stores/gameStore';
import * as THREE from 'three';

interface CameraControllerProps {
  chapterId: number;
}

export function CameraController({ chapterId }: CameraControllerProps) {
  const { camera } = useThree();
  const { cameraMode, selectedOrganelle } = useGameStore();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  
  // Get camera configuration for current chapter
  const cameraConfig = getCameraConfig(chapterId);
  
  useEffect(() => {
    // Set initial camera position
    camera.position.set(
      cameraConfig.initial.position.x,
      cameraConfig.initial.position.y,
      cameraConfig.initial.position.z
    );
    
    currentLookAt.current.set(
      cameraConfig.initial.lookAt.x,
      cameraConfig.initial.lookAt.y,
      cameraConfig.initial.lookAt.z
    );
    
    camera.lookAt(currentLookAt.current);
  }, [camera, cameraConfig, chapterId]);
  
  useEffect(() => {
    // Update camera target based on selected organelle
    if (selectedOrganelle && cameraMode === 'guided') {
      const organellePosition = getOrganellePosition(selectedOrganelle, chapterId);
      if (organellePosition) {
        // Position camera to focus on selected organelle
        targetPosition.current.set(
          organellePosition.x + 5,
          organellePosition.y + 3,
          organellePosition.z + 5
        );
        targetLookAt.current.set(
          organellePosition.x,
          organellePosition.y,
          organellePosition.z
        );
      }
    } else {
      // Return to default position
      targetPosition.current.set(
        cameraConfig.initial.position.x,
        cameraConfig.initial.position.y,
        cameraConfig.initial.position.z
      );
      targetLookAt.current.set(
        cameraConfig.initial.lookAt.x,
        cameraConfig.initial.lookAt.y,
        cameraConfig.initial.lookAt.z
      );
    }
  }, [selectedOrganelle, cameraMode, chapterId, cameraConfig]);
  
  useFrame((state, delta) => {
    if (cameraMode === 'guided' || cameraMode === 'locked') {
      // Smooth camera movement
      camera.position.lerp(targetPosition.current, delta * 2);
      currentLookAt.current.lerp(targetLookAt.current, delta * 2);
      camera.lookAt(currentLookAt.current);
    }
    
    // Add subtle camera breathing for immersion
    if (cameraMode !== 'locked') {
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      camera.position.y += breathe * delta;
    }
  });
  
  return null;
}

// Camera configuration for different chapters
function getCameraConfig(chapterId: number) {
  const configs = {
    1: { // Chapter 1: Overview of cellular city
      initial: {
        position: { x: 12, y: 8, z: 12 },
        lookAt: { x: 0, y: 0, z: 0 }
      },
      bounds: {
        min: { x: -20, y: 2, z: -20 },
        max: { x: 20, y: 15, z: 20 }
      }
    },
    2: { // Chapter 2: Mitochondria focus
      initial: {
        position: { x: 8, y: 6, z: 8 },
        lookAt: { x: 0, y: 0, z: 0 }
      },
      bounds: {
        min: { x: -15, y: 1, z: -15 },
        max: { x: 15, y: 12, z: 15 }
      }
    },
    3: { // Chapter 3: Sleep and damage
      initial: {
        position: { x: 10, y: 5, z: 10 },
        lookAt: { x: 0, y: 0, z: 0 }
      },
      bounds: {
        min: { x: -12, y: 1, z: -12 },
        max: { x: 12, y: 10, z: 12 }
      }
    }
  };
  
  return configs[chapterId as keyof typeof configs] || configs[1];
}

// Get position of specific organelle for camera focusing
function getOrganellePosition(organelleType: string, chapterId: number) {
  // This would typically come from the city layout data
  // For now, using chapter 1 positions, but could be expanded to use chapterId
  const positions: Record<string, { x: number; y: number; z: number }> = {
    'nucleus': { x: 0, y: 0, z: 0 },
    'mitochondria': chapterId === 2 ? { x: 0, y: 0, z: 0 } : { x: 6, y: 1, z: 2 },
    'endoplasmic-reticulum': { x: 3, y: -3, z: -1 },
    'golgi-apparatus': { x: -3, y: 2, z: -3 },
    'ribosomes': { x: 1, y: 3, z: 1 },
    'cell-membrane': { x: 0, y: 0, z: 15 }
  };
  
  return positions[organelleType];
}

// Smooth camera transition component
export function CameraTransition({ 
  to, 
  lookAt, 
  duration = 2000,
  onComplete 
}: {
  to: [number, number, number];
  lookAt: [number, number, number];
  duration?: number;
  onComplete?: () => void;
}) {
  const { camera } = useThree();
  const startTime = useRef<number | undefined>(undefined);
  const startPosition = useRef(new THREE.Vector3());
  const startLookAt = useRef(new THREE.Vector3());
  const targetPosition = useRef(new THREE.Vector3(...to));
  const targetLookAt = useRef(new THREE.Vector3(...lookAt));
  
  useEffect(() => {
    startTime.current = Date.now();
    startPosition.current.copy(camera.position);
    // Get current look-at direction (approximate)
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    startLookAt.current.copy(camera.position).add(direction.multiplyScalar(10));
  }, [camera, to, lookAt]);
  
  useFrame(() => {
    if (!startTime.current) return;
    
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth easing function
    const eased = 1 - Math.pow(1 - progress, 3);
    
    // Interpolate camera position
    camera.position.lerpVectors(startPosition.current, targetPosition.current, eased);
    
    // Interpolate look-at target
    const currentLookAt = new THREE.Vector3();
    currentLookAt.lerpVectors(startLookAt.current, targetLookAt.current, eased);
    camera.lookAt(currentLookAt);
    
    if (progress >= 1 && onComplete) {
      onComplete();
    }
  });
  
  return null;
}

// Cinematic camera paths for guided tours
export function CinematicCameraPath({ 
  waypoints, 
  duration = 5000,
  loop = false,
  onComplete 
}: {
  waypoints: Array<{ position: [number, number, number]; lookAt: [number, number, number] }>;
  duration?: number;
  loop?: boolean;
  onComplete?: () => void;
}) {
  const { camera } = useThree();
  const startTime = useRef<number | undefined>(undefined);
  const currentWaypoint = useRef(0);
  
  useEffect(() => {
    startTime.current = Date.now();
    currentWaypoint.current = 0;
  }, [waypoints]);
  
  useFrame(() => {
    if (!startTime.current || waypoints.length < 2) return;
    
    const elapsed = Date.now() - startTime.current;
    const totalProgress = (elapsed % duration) / duration;
    
    if (!loop && elapsed >= duration) {
      if (onComplete) onComplete();
      return;
    }
    
    // Calculate which waypoint segment we're in
    const segmentProgress = totalProgress * (waypoints.length - 1);
    const segmentIndex = Math.floor(segmentProgress);
    const segmentT = segmentProgress - segmentIndex;
    
    const currentWP = waypoints[segmentIndex];
    const nextWP = waypoints[Math.min(segmentIndex + 1, waypoints.length - 1)];
    
    // Smooth interpolation between waypoints
    const eased = 1 - Math.pow(1 - segmentT, 2);
    
    // Position interpolation
    camera.position.lerpVectors(
      new THREE.Vector3(...currentWP.position),
      new THREE.Vector3(...nextWP.position),
      eased
    );
    
    // Look-at interpolation
    const currentLookAt = new THREE.Vector3();
    currentLookAt.lerpVectors(
      new THREE.Vector3(...currentWP.lookAt),
      new THREE.Vector3(...nextWP.lookAt),
      eased
    );
    camera.lookAt(currentLookAt);
  });
  
  return null;
}