import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import type { OrganelleType } from '../../types';

interface InteractionControlsProps {
  children: React.ReactNode;
}

export function InteractionControls({ children }: InteractionControlsProps) {
  const { interactionMode, selectedOrganelle } = useGameStore();
  const transformRef = useRef<any>(null);
  
  return (
    <group>
      {children}
      
      {/* Transform controls for selected objects */}
      {selectedOrganelle && interactionMode === 'experiment' && (
        <TransformControls
          ref={transformRef}
          mode="translate"
          size={0.8}
          showX={true}
          showY={true}
          showZ={true}
        />
      )}
      
      {/* Zoom and rotation controls */}
      <ZoomControls />
      <RotationControls />
    </group>
  );
}

function ZoomControls() {
  const { camera } = useThree();
  const { interactionMode } = useGameStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  const minZoom = 0.1;
  const maxZoom = 5;

  const handleZoom = useCallback((delta: number) => {
    if (interactionMode === 'locked') return;
    
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));
    setZoomLevel(newZoom);
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.zoom = newZoom;
      camera.updateProjectionMatrix();
    }
  }, [camera, zoomLevel, interactionMode]);

  // Handle wheel events for zooming
  useFrame(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(delta);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  });

  return null;
}

function RotationControls() {
  const { camera, gl } = useThree();
  const { interactionMode } = useGameStore();
  const [isRotating, setIsRotating] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const rotationSpeed = 0.002;

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (interactionMode === 'locked') return;
    
    setIsRotating(true);
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  }, [interactionMode]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isRotating || interactionMode === 'locked') return;

    const deltaX = event.clientX - lastMousePosition.x;
    const deltaY = event.clientY - lastMousePosition.y;

    // Rotate camera around the target
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);
    
    spherical.theta -= deltaX * rotationSpeed;
    spherical.phi += deltaY * rotationSpeed;
    
    // Limit vertical rotation
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
    
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);

    setLastMousePosition({ x: event.clientX, y: event.clientY });
  }, [isRotating, lastMousePosition, camera, interactionMode]);

  const handleMouseUp = useCallback(() => {
    setIsRotating(false);
  }, []);

  useFrame(() => {
    const canvas = gl.domElement;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return null;
}

interface ManipulableObjectProps {
  type: OrganelleType;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  children: React.ReactNode;
  onTransform?: (position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3) => void;
}

export function ManipulableObject({ 
  type, 
  position, 
  scale, 
  rotation, 
  children, 
  onTransform 
}: ManipulableObjectProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<THREE.Vector3 | null>(null);
  const { selectedOrganelle, interactionMode, setSelectedOrganelle } = useGameStore();
  const { camera, raycaster, pointer } = useThree();
  
  const isSelected = selectedOrganelle === type;
  const canManipulate = interactionMode === 'experiment' && isSelected;

  // Handle object selection
  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    setSelectedOrganelle(isSelected ? null : type);
  }, [isSelected, type, setSelectedOrganelle]);

  // Handle drag start
  const handlePointerDown = useCallback((event: any) => {
    if (!canManipulate) return;
    
    event.stopPropagation();
    setIsDragging(true);
    
    // Calculate intersection point
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current!, true);
    
    if (intersects.length > 0) {
      setDragStart(intersects[0].point);
    }
  }, [canManipulate, camera, raycaster, pointer]);

  // Handle drag end
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Handle dragging
  useFrame(() => {
    if (isDragging && dragStart && meshRef.current && canManipulate) {
      raycaster.setFromCamera(pointer, camera);
      
      // Create a plane for dragging
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        const offset = intersection.sub(dragStart);
        meshRef.current.position.add(offset);
        
        // Call transform callback
        if (onTransform) {
          onTransform(
            meshRef.current.position,
            meshRef.current.rotation,
            meshRef.current.scale
          );
        }
      }
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={rotation}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {children}
      
      {/* Selection indicator */}
      {isSelected && <SelectionIndicator />}
      
      {/* Manipulation gizmos */}
      {canManipulate && <ManipulationGizmos />}
    </group>
  );
}

function SelectionIndicator() {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ringRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <ringGeometry args={[2, 2.2, 32]} />
      <meshBasicMaterial color="#4ecdc4" transparent opacity={0.8} />
    </mesh>
  );
}

function ManipulationGizmos() {
  return (
    <group>
      {/* X-axis arrow */}
      <mesh position={[3, 0, 0]}>
        <coneGeometry args={[0.1, 0.5, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* Y-axis arrow */}
      <mesh position={[0, 3, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.5, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      
      {/* Z-axis arrow */}
      <mesh position={[0, 0, 3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.5, 8]} />
        <meshBasicMaterial color="#0000ff" />
      </mesh>
    </group>
  );
}

// Multi-level zoom system
export function MultiLevelZoom() {
  const { camera } = useThree();
  const { selectedOrganelle } = useGameStore();
  const [zoomLevel, setZoomLevel] = useState<'cellular' | 'organelle' | 'molecular'>('cellular');
  
  const zoomLevels = {
    cellular: { distance: 15, fov: 75 },
    organelle: { distance: 5, fov: 60 },
    molecular: { distance: 2, fov: 45 }
  };

  const zoomToLevel = useCallback((level: typeof zoomLevel) => {
    setZoomLevel(level);
    const config = zoomLevels[level];
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = config.fov;
      camera.updateProjectionMatrix();
      
      // Animate camera position
      const targetPosition = new THREE.Vector3(0, 0, config.distance);
      camera.position.lerp(targetPosition, 0.1);
    }
  }, [camera]);

  // Auto-zoom when organelle is selected
  useFrame(() => {
    if (selectedOrganelle && zoomLevel === 'cellular') {
      zoomToLevel('organelle');
    } else if (!selectedOrganelle && zoomLevel !== 'cellular') {
      zoomToLevel('cellular');
    }
  });

  return null;
}

// Exploded view system
interface ExplodedViewProps {
  organelleType: OrganelleType;
  isExploded: boolean;
}

export function ExplodedView({ organelleType, isExploded }: ExplodedViewProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isExploded ? 2 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Separate components in exploded view
      if (isExploded && organelleType === 'mitochondria') {
        groupRef.current.children.forEach((child, index) => {
          const offset = new THREE.Vector3(
            (index - 1) * 2,
            0,
            0
          );
          child.position.lerp(offset, 0.1);
        });
      } else {
        groupRef.current.children.forEach((child) => {
          child.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        });
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Exploded view components would be rendered here */}
    </group>
  );
}