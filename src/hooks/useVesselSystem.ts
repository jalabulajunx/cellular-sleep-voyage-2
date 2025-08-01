import { useState, useEffect } from 'react';
import { useGameStore, useUIStore } from '../stores/gameStore';
import * as THREE from 'three';

export function useVesselSystem(chapterId: number, enabled: boolean = true) {
  const { cameraMode, setCameraMode } = useGameStore();
  const { addNotification } = useUIStore();
  const [vesselPosition, setVesselPosition] = useState(new THREE.Vector3(0, 0, 8));
  const [vesselSpeed, setVesselSpeed] = useState(0);
  
  // Initialize vessel mode
  useEffect(() => {
    if (enabled && cameraMode !== 'free') {
      setCameraMode('free');
      addNotification({
        type: 'info',
        title: 'Vessel Control Active',
        message: `Chapter ${chapterId}: Use WASD keys to pilot your microscopic vessel. Press H for help.`,
        duration: 5000
      });
    }
  }, [enabled, cameraMode, setCameraMode, addNotification, chapterId]);
  
  const handlePositionChange = (newPosition: THREE.Vector3) => {
    setVesselPosition(newPosition);
    
    // Calculate speed for HUD
    const speed = newPosition.distanceTo(vesselPosition);
    setVesselSpeed(speed);
  };
  
  return {
    vesselPosition,
    vesselSpeed,
    handlePositionChange,
    enabled
  };
}