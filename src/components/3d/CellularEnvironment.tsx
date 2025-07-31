import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrganelleType } from '../../types';
import { useGameStore } from '../../stores/gameStore';
import { organelleColors, createPlaceholderGeometry } from '../../utils/placeholderAssets';
import { assetLoadingSystem } from '../../utils/enhanced3DAssets';
import type { Enhanced3DAsset } from '../../utils/enhanced3DAssets';
import { textureGenerator } from '../../utils/textureGenerator';
import { globalAssetCache } from '../../utils/assetCache';
import { InteractionControls, ManipulableObject, MultiLevelZoom } from './InteractionControls';
import { TouchControls, TouchUI } from './TouchControls';
import { HotspotSystem } from './HotspotSystem';

interface CellularEnvironmentProps {
  chapterId: number;
}

export function CellularEnvironment({ chapterId }: CellularEnvironmentProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useState(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  });

  return (
    <>
      <TouchControls>
        <InteractionControls>
          <group>
            {/* Cell membrane - outer boundary */}
            <CellMembrane />
            
            {/* Organelles positioned in 3D space */}
            <Organelles chapterId={chapterId} />
            
            {/* Cytoplasm particles for atmosphere */}
            <CytoplasmParticles />
            
            {/* Interactive grid for spatial reference */}
            <SpatialGrid />
            
            {/* Multi-level zoom system */}
            <MultiLevelZoom />
          </group>
        </InteractionControls>
      </TouchControls>
      
      {/* Touch UI overlay for mobile devices */}
      {isTouchDevice && <TouchUI visible={true} />}
    </>
  );
}

function CellMembrane() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[15, 64, 64]} />
      <meshStandardMaterial
        color={organelleColors['cell-membrane']}
        transparent
        opacity={0.1}
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface OrganellesProps {
  chapterId: number;
}

function Organelles({ chapterId }: OrganellesProps) {
  // Different organelle layouts for different chapters
  const organelleLayout = getOrganelleLayout(chapterId);
  
  return (
    <group>
      {organelleLayout.map((organelle, index) => (
        <HotspotSystem
          key={`${organelle.type}-${index}`}
          organelleType={organelle.type}
          position={organelle.position}
        >
          <ManipulableObject
            type={organelle.type}
            position={[0, 0, 0]}
            scale={organelle.scale}
            rotation={organelle.rotation}
            onTransform={(position, rotation, scale) => {
              console.log(`${organelle.type} transformed:`, { position, rotation, scale });
            }}
          >
            <OrganelleComponent
              type={organelle.type}
              position={[0, 0, 0]}
              scale={[1, 1, 1]}
              rotation={[0, 0, 0]}
            />
          </ManipulableObject>
        </HotspotSystem>
      ))}
    </group>
  );
}

interface OrganelleComponentProps {
  type: OrganelleType;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}

function OrganelleComponent({ type, position, scale, rotation }: OrganelleComponentProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [enhancedAsset, setEnhancedAsset] = useState<Enhanced3DAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedOrganelle, selectedOrganelle } = useGameStore();
  
  const geometry = createPlaceholderGeometry(type);
  const isSelected = selectedOrganelle === type;

  // Load enhanced 3D asset
  useEffect(() => {
    const loadAsset = async () => {
      try {
        setIsLoading(true);
        const asset = await globalAssetCache.getAsset(
          `${type}-enhanced`,
          () => assetLoadingSystem.loadAsset(type)
        );
        setEnhancedAsset(asset);
      } catch (error) {
        console.warn(`Failed to load enhanced asset for ${type}:`, error);
        // Fall back to placeholder geometry
      } finally {
        setIsLoading(false);
      }
    };

    loadAsset();
  }, [type]);

  useFrame((state) => {
    if (meshRef.current) {
      // Hover animation
      if (hovered || isSelected) {
        const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(pulseScale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
      
      // Gentle rotation for some organelles
      if (type === 'mitochondria' || type === 'ribosomes') {
        meshRef.current.rotation.y += 0.005;
      }
    }
  });

  const handleClick = () => {
    setClicked(!clicked);
    setSelectedOrganelle(isSelected ? null : type);
    console.log(`Clicked on ${type}`);
  };

  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  // Render enhanced geometry if available, otherwise fallback to placeholder
  const renderGeometry = () => {
    if (enhancedAsset && !isLoading) {
      return <primitive object={enhancedAsset.geometry} />;
    }

    // Fallback to placeholder geometry
    switch (type) {
      case 'mitochondria':
        return <capsuleGeometry args={[0.5, 2, 4, 8]} />;
      case 'nucleus':
        return <sphereGeometry args={[1.5, 32, 32]} />;
      case 'endoplasmic-reticulum':
        return <torusGeometry args={[2, 0.3, 16, 100]} />;
      case 'golgi-apparatus':
        return <boxGeometry args={[1, 0.5, 2]} />;
      case 'ribosomes':
        return <sphereGeometry args={[0.2, 16, 16]} />;
      case 'cytoskeleton':
        return <cylinderGeometry args={[0.05, 0.05, 10, 8]} />;
      default:
        return <sphereGeometry args={[1, 32, 32]} />;
    }
  };

  // Create enhanced material with texture
  const createMaterial = () => {
    if (enhancedAsset && !isLoading) {
      // Use enhanced material from asset
      const material = enhancedAsset.material.clone();
      
      // Add texture if available
      try {
        const texture = textureGenerator.getTexture(type);
        if (material instanceof THREE.MeshStandardMaterial) {
          material.map = texture;
          material.needsUpdate = true;
        }
      } catch (error) {
        console.warn(`Failed to load texture for ${type}:`, error);
      }
      
      // Apply interaction states
      material.transparent = hovered || isSelected;
      material.opacity = hovered || isSelected ? 0.8 : 1;
      
      if (material instanceof THREE.MeshStandardMaterial) {
        material.emissive = isSelected ? new THREE.Color(geometry.color) : new THREE.Color('#000000');
        material.emissiveIntensity = isSelected ? 0.2 : 0;
      }
      
      return <primitive object={material} />;
    }

    // Fallback to basic material
    return (
      <meshStandardMaterial
        color={geometry.color}
        wireframe={type === 'cell-membrane'}
        transparent={hovered || isSelected}
        opacity={hovered || isSelected ? 0.8 : 1}
        emissive={isSelected ? geometry.color : '#000000'}
        emissiveIntensity={isSelected ? 0.2 : 0}
      />
    );
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow
      receiveShadow
    >
      {renderGeometry()}
      {createMaterial()}
      
      {/* Loading indicator */}
      {isLoading && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      )}
    </mesh>
  );
}

function CytoplasmParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 200;
  
  // Create particle positions
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    // Random positions within cell membrane
    const radius = Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  useFrame(() => {
    if (particlesRef.current) {
      // Gentle floating animation
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={particleCount}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#4ecdc4"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function SpatialGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.rotation.x = Math.PI / 2;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[30, 30, '#333333', '#333333']}
      position={[0, -8, 0]}
    />
  );
}

// Helper function to get organelle layout for different chapters
function getOrganelleLayout(chapterId: number) {
  const layouts = {
    1: [ // Chapter 1: Basic cellular overview
      { type: 'nucleus' as OrganelleType, position: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
      { type: 'mitochondria' as OrganelleType, position: [4, 2, 1] as [number, number, number], scale: [1, 1, 1] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
      { type: 'mitochondria' as OrganelleType, position: [-3, -1, 2] as [number, number, number], scale: [1, 1, 1] as [number, number, number], rotation: [0, Math.PI / 4, 0] as [number, number, number] },
      { type: 'endoplasmic-reticulum' as OrganelleType, position: [2, -2, -1] as [number, number, number], scale: [0.8, 0.8, 0.8] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
      { type: 'golgi-apparatus' as OrganelleType, position: [-2, 1, -2] as [number, number, number], scale: [1, 1, 1] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
      { type: 'ribosomes' as OrganelleType, position: [1, 3, 1] as [number, number, number], scale: [1, 1, 1] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
      { type: 'ribosomes' as OrganelleType, position: [-1, -3, -1] as [number, number, number], scale: [1, 1, 1] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    ],
    2: [ // Chapter 2: Focus on mitochondria
      { type: 'mitochondria' as OrganelleType, position: [0, 0, 0] as [number, number, number], scale: [2, 2, 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
      { type: 'mitochondria' as OrganelleType, position: [5, 0, 0] as [number, number, number], scale: [1.5, 1.5, 1.5] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
      { type: 'mitochondria' as OrganelleType, position: [-5, 0, 0] as [number, number, number], scale: [1.5, 1.5, 1.5] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] },
    ]
  };
  
  return layouts[chapterId as keyof typeof layouts] || layouts[1];
}