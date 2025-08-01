import { useState } from 'react';
import { MicroscopicVessel, NavigationAssistance } from './MicroscopicVessel';
import * as THREE from 'three';

interface VesselControlSystemProps {
  chapterId: number;
  enabled?: boolean;
}

export function VesselControlSystem({ chapterId, enabled = true }: VesselControlSystemProps) {
  const [vesselPosition, setVesselPosition] = useState(new THREE.Vector3(0, 0, 8));
  
  const handlePositionChange = (newPosition: THREE.Vector3) => {
    setVesselPosition(newPosition);
  };
  
  if (!enabled) return { vessel3D: null };
  
  const vessel3D = (
    <>
      {/* 3D Vessel Component */}
      <MicroscopicVessel 
        chapterId={chapterId}
        onPositionChange={handlePositionChange}
      />
      
      {/* Navigation Assistance */}
      <NavigationAssistance 
        vesselPosition={vesselPosition}
        chapterId={chapterId}
      />
    </>
  );
  
  return { vessel3D };
}

// UI components moved to VesselUI.tsx to avoid Three.js context conflicts

// Tutorial system moved to separate component to avoid import issues