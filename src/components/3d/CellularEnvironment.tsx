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
import { CameraController } from './CameraController';
import { VesselControlSystem } from './VesselControlSystem';

interface CellularEnvironmentProps {
  chapterId: number;
}

export function CellularEnvironment({ chapterId }: CellularEnvironmentProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { cameraMode, interactionMode } = useGameStore();
  const [vesselEnabled] = useState(true);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Get vessel system components
  const vesselSystem = VesselControlSystem({ 
    chapterId, 
    enabled: vesselEnabled && interactionMode === 'explore'
  });

  return (
    <>
      {/* Camera control system for smooth navigation */}
      <CameraController chapterId={chapterId} />
      
      {/* Environmental lighting setup */}
      <EnvironmentalLighting chapterId={chapterId} />
      
      <TouchControls>
        <InteractionControls>
          <group>
            {/* Cell membrane - outer boundary styled as city walls */}
            <CellMembrane />
            
            {/* Cellular city districts - organelles positioned as neighborhoods */}
            <CellularCityDistricts chapterId={chapterId} />
            
            {/* Atmospheric effects - cytoplasm and molecular traffic */}
            <AtmosphericEffects />
            
            {/* City infrastructure - pathways and connections */}
            <CityInfrastructure />
            
            {/* Interactive navigation aids */}
            <NavigationAids visible={cameraMode === 'guided'} />
            
            {/* Multi-level zoom system */}
            <MultiLevelZoom />
            
            {/* 3D Vessel Components (inside Canvas) */}
            {vesselSystem.vessel3D}
          </group>
        </InteractionControls>
      </TouchControls>
      
      {/* Touch UI overlay for mobile devices */}
      {isTouchDevice && <TouchUI visible={true} />}
    </>
  );
}

// Environmental lighting system for different chapters
function EnvironmentalLighting({ chapterId }: { chapterId: number }) {
  const lightingConfig = getLightingConfig(chapterId);
  
  return (
    <>
      {/* Ambient lighting - simulates cellular environment */}
      <ambientLight 
        color={lightingConfig.ambient.color} 
        intensity={lightingConfig.ambient.intensity} 
      />
      
      {/* Main directional light - simulates microscope illumination */}
      <directionalLight
        position={[lightingConfig.directional.position.x, lightingConfig.directional.position.y, lightingConfig.directional.position.z]}
        intensity={lightingConfig.directional.intensity}
        color={lightingConfig.directional.color}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Rim lighting for depth */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#4ecdc4"
      />
      
      {/* Point lights for organelle highlights */}
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" distance={10} />
      <pointLight position={[8, 4, 2]} intensity={0.3} color="#ff6b6b" distance={8} />
      <pointLight position={[-6, -2, 4]} intensity={0.3} color="#4ecdc4" distance={8} />
    </>
  );
}

function CellMembrane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectedOrganelle } = useGameStore();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation - like city walls expanding and contracting
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
      meshRef.current.scale.setScalar(scale);
      
      // Gentle rotation to show it's alive
      meshRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      {/* Main membrane structure */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[18, 64, 64]} />
        <meshStandardMaterial
          color={selectedOrganelle === 'cell-membrane' ? '#4ecdc4' : organelleColors['cell-membrane']}
          transparent
          opacity={0.08}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* City gates - membrane proteins as entry points */}
      <CityGates />
    </group>
  );
}

function CityGates() {
  const gatePositions = [
    [15, 0, 0], [-15, 0, 0], [0, 15, 0], [0, -15, 0], [0, 0, 15], [0, 0, -15]
  ];
  
  return (
    <group>
      {gatePositions.map((position, index) => (
        <mesh key={index} position={position as [number, number, number]}>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial 
            color="#45b7d1" 
            emissive="#45b7d1" 
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

interface CellularCityDistrictsProps {
  chapterId: number;
}

function CellularCityDistricts({ chapterId }: CellularCityDistrictsProps) {
  const cityLayout = getCityDistrictLayout(chapterId);
  
  return (
    <group>
      {/* City center - Nucleus as City Hall */}
      <CityDistrict
        name="City Hall"
        organelleType="nucleus"
        position={cityLayout.nucleus.position}
        scale={cityLayout.nucleus.scale}
        rotation={cityLayout.nucleus.rotation}
        description="The control center of our cellular city"
      />
      
      {/* Power plant district - Mitochondria */}
      {cityLayout.mitochondria.map((mito, index) => (
        <CityDistrict
          key={`powerplant-${index}`}
          name={`Power Plant ${index + 1}`}
          organelleType="mitochondria"
          position={mito.position}
          scale={mito.scale}
          rotation={mito.rotation}
          description="Cellular power plants generating ATP energy"
        />
      ))}
      
      {/* Manufacturing district - Endoplasmic Reticulum */}
      <CityDistrict
        name="Manufacturing District"
        organelleType="endoplasmic-reticulum"
        position={cityLayout.endoplasmicReticulum.position}
        scale={cityLayout.endoplasmicReticulum.scale}
        rotation={cityLayout.endoplasmicReticulum.rotation}
        description="Protein and lipid manufacturing center"
      />
      
      {/* Shipping district - Golgi Apparatus */}
      <CityDistrict
        name="Shipping & Processing"
        organelleType="golgi-apparatus"
        position={cityLayout.golgiApparatus.position}
        scale={cityLayout.golgiApparatus.scale}
        rotation={cityLayout.golgiApparatus.rotation}
        description="Package and ship cellular products"
      />
      
      {/* Worker housing - Ribosomes */}
      {cityLayout.ribosomes.map((ribo, index) => (
        <CityDistrict
          key={`workers-${index}`}
          name={`Worker Housing ${index + 1}`}
          organelleType="ribosomes"
          position={ribo.position}
          scale={ribo.scale}
          rotation={ribo.rotation}
          description="Protein synthesis workshops"
        />
      ))}
      
      {/* City infrastructure - Cytoskeleton */}
      <CityInfrastructureNetwork />
    </group>
  );
}

interface CityDistrictProps {
  name: string;
  organelleType: OrganelleType;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  description: string;
}

function CityDistrict({ name, organelleType, position, scale, rotation, description }: CityDistrictProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* District label */}
      {hovered && (
        <DistrictLabel 
          name={name} 
          description={description}
          position={[0, scale[1] + 1, 0]}
        />
      )}
      
      {/* Main organelle with hotspot system */}
      <HotspotSystem
        organelleType={organelleType}
        position={[0, 0, 0]}
      >
        <ManipulableObject
          type={organelleType}
          position={[0, 0, 0]}
          scale={scale}
          rotation={rotation}
          onTransform={(pos, rot, scl) => {
            console.log(`${name} transformed:`, { position: pos, rotation: rot, scale: scl });
          }}
        >
          <group
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          >
            <OrganelleComponent
              type={organelleType}
              position={[0, 0, 0]}
              scale={[1, 1, 1]}
              rotation={[0, 0, 0]}
            />
            
            {/* District boundary indicator */}
            <DistrictBoundary 
              size={Math.max(...scale) * 2} 
              visible={hovered}
            />
          </group>
        </ManipulableObject>
      </HotspotSystem>
    </group>
  );
}

function DistrictLabel({ name, description, position }: { 
  name: string; 
  description: string; 
  position: [number, number, number] 
}) {
  // For now, just show a simple placeholder
  // In a real implementation, this would render actual text
  console.log(`District: ${name} - ${description}`);
  
  return (
    <group position={position}>
      {/* This would be replaced with actual text rendering in a real implementation */}
      <mesh>
        <planeGeometry args={[3, 1]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function DistrictBoundary({ size, visible }: { size: number; visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && visible) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  if (!visible) return null;
  
  return (
    <mesh ref={meshRef} position={[0, -0.5, 0]}>
      <ringGeometry args={[size * 0.8, size, 32]} />
      <meshBasicMaterial 
        color="#4ecdc4" 
        transparent 
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function CityInfrastructureNetwork() {
  // Create pathways between major organelles
  const pathways = [
    { from: [0, 0, 0], to: [4, 2, 1] }, // Nucleus to Mitochondria
    { from: [0, 0, 0], to: [2, -2, -1] }, // Nucleus to ER
    { from: [2, -2, -1], to: [-2, 1, -2] }, // ER to Golgi
  ];
  
  return (
    <group>
      {pathways.map((pathway, index) => (
        <CellularPathway 
          key={index}
          from={pathway.from as [number, number, number]}
          to={pathway.to as [number, number, number]}
        />
      ))}
    </group>
  );
}

function CellularPathway({ from, to }: { 
  from: [number, number, number]; 
  to: [number, number, number] 
}) {
  const pathRef = useRef<THREE.Mesh>(null);
  
  // Calculate pathway direction and length
  const direction = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const length = direction.length();
  const midpoint: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2
  ];
  
  useFrame((state) => {
    if (pathRef.current && pathRef.current.material) {
      // Animated flow along pathway
      const flow = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      const material = pathRef.current.material as THREE.MeshBasicMaterial;
      if (material.opacity !== undefined) {
        material.opacity = 0.3 + flow;
      }
    }
  });
  
  return (
    <mesh ref={pathRef} position={midpoint}>
      <cylinderGeometry args={[0.05, 0.05, length, 8]} />
      <meshBasicMaterial 
        color="#45b7d1" 
        transparent 
        opacity={0.3}
      />
    </mesh>
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

function AtmosphericEffects() {
  return (
    <group>
      <CytoplasmParticles />
      <MolecularTraffic />
      <CellularFog />
    </group>
  );
}

function CytoplasmParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 300;
  
  // Create particle positions with more realistic distribution
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    // More particles near organelles, fewer at edges
    const radius = Math.pow(Math.random(), 0.7) * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    // Vary particle colors to represent different molecules
    const colorVariant = Math.random();
    if (colorVariant < 0.4) {
      // ATP molecules - golden
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.2;
    } else if (colorVariant < 0.7) {
      // Proteins - blue-green
      colors[i * 3] = 0.3; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.8;
    } else {
      // Other molecules - white
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0;
    }
  }

  useFrame((state) => {
    if (particlesRef.current) {
      // Brownian motion simulation
      particlesRef.current.rotation.y += 0.0008;
      particlesRef.current.rotation.x += 0.0003;
      
      // Gentle pulsing to show molecular activity
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      particlesRef.current.scale.setScalar(pulse);
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
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={particleCount}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

function MolecularTraffic() {
  // Simulate molecular transport between organelles
  const trafficRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (trafficRef.current) {
      trafficRef.current.rotation.y += 0.002;
    }
  });
  
  return (
    <group ref={trafficRef}>
      {/* ATP molecules moving from mitochondria */}
      <MovingMolecules 
        from={[4, 2, 1]} 
        to={[0, 0, 0]} 
        color="#ffd700" 
        count={5}
        speed={0.5}
      />
      
      {/* Proteins moving from ER to Golgi */}
      <MovingMolecules 
        from={[2, -2, -1]} 
        to={[-2, 1, -2]} 
        color="#4ecdc4" 
        count={3}
        speed={0.3}
      />
    </group>
  );
}

function MovingMolecules({ 
  from, to, color, count, speed 
}: { 
  from: [number, number, number]; 
  to: [number, number, number]; 
  color: string; 
  count: number; 
  speed: number;
}) {
  const moleculesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (moleculesRef.current) {
      moleculesRef.current.children.forEach((child, index) => {
        const progress = (Math.sin(state.clock.elapsedTime * speed + index) + 1) / 2;
        child.position.lerpVectors(
          new THREE.Vector3(...from),
          new THREE.Vector3(...to),
          progress
        );
      });
    }
  });
  
  return (
    <group ref={moleculesRef}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function CellularFog() {
  // Add subtle fog effect to enhance depth
  return (
    <fog attach="fog" args={['#f0f8ff', 10, 25]} />
  );
}

function CityInfrastructure() {
  return (
    <group>
      <CellularRoads />
      <UtilityLines />
      <CityFoundation />
    </group>
  );
}

function CellularRoads() {
  // Main transportation routes in the cellular city
  const roadPositions = [
    { start: [-8, -6, 0], end: [8, -6, 0] }, // Main street
    { start: [0, -6, -8], end: [0, -6, 8] }, // Cross street
  ];
  
  return (
    <group>
      {roadPositions.map((road, index) => (
        <mesh key={index} position={[
          (road.start[0] + road.end[0]) / 2,
          (road.start[1] + road.end[1]) / 2,
          (road.start[2] + road.end[2]) / 2
        ]}>
          <boxGeometry args={[
            Math.abs(road.end[0] - road.start[0]) || 0.2,
            0.1,
            Math.abs(road.end[2] - road.start[2]) || 0.2
          ]} />
          <meshStandardMaterial 
            color="#666666" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function UtilityLines() {
  // Represent cytoskeleton as city utility lines
  return (
    <group>
      {/* Microtubules - main utility lines */}
      <mesh position={[0, -7, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 16, 8]} />
        <meshStandardMaterial color="#45b7d1" />
      </mesh>
      
      <mesh position={[0, -7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 16, 8]} />
        <meshStandardMaterial color="#45b7d1" />
      </mesh>
    </group>
  );
}

function CityFoundation() {
  // Subtle foundation to ground the cellular city
  return (
    <mesh position={[0, -8, 0]} receiveShadow>
      <cylinderGeometry args={[18, 18, 0.5, 64]} />
      <meshStandardMaterial 
        color="#2c3e50" 
        transparent 
        opacity={0.1}
      />
    </mesh>
  );
}

function NavigationAids({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  return (
    <group>
      <CompassRose />
      <DistanceMarkers />
      <ViewportIndicators />
    </group>
  );
}

function CompassRose() {
  return (
    <group position={[12, 8, 0]}>
      <mesh>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      
      {/* Cardinal directions */}
      {['N', 'E', 'S', 'W'].map((direction, index) => (
        <mesh key={direction} position={[
          Math.cos(index * Math.PI / 2) * 1.2,
          Math.sin(index * Math.PI / 2) * 1.2,
          0
        ]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

function DistanceMarkers() {
  // Scale reference markers
  const markers = [5, 10, 15];
  
  return (
    <group>
      {markers.map((distance, index) => (
        <mesh key={index} position={[distance, -7.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function ViewportIndicators() {
  // Show current zoom level and viewing angle
  return (
    <group position={[-12, 8, 0]}>
      <mesh>
        <boxGeometry args={[2, 0.5, 0.1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// Helper function to get lighting configuration for different chapters
function getLightingConfig(chapterId: number) {
  const configs = {
    1: { // Chapter 1: Bright overview lighting
      ambient: { color: '#f0f8ff', intensity: 0.6 },
      directional: { 
        color: '#ffffff', 
        intensity: 0.8, 
        position: { x: 5, y: 10, z: 5 } 
      }
    },
    2: { // Chapter 2: Focused mitochondria lighting
      ambient: { color: '#fff5e6', intensity: 0.4 },
      directional: { 
        color: '#ffd700', 
        intensity: 1.0, 
        position: { x: 3, y: 8, z: 3 } 
      }
    },
    3: { // Chapter 3: Sleep/damage lighting
      ambient: { color: '#e6f3ff', intensity: 0.3 },
      directional: { 
        color: '#87ceeb', 
        intensity: 0.6, 
        position: { x: -2, y: 6, z: 4 } 
      }
    }
  };
  
  return configs[chapterId as keyof typeof configs] || configs[1];
}

// Helper function to get city district layout for different chapters
function getCityDistrictLayout(chapterId: number) {
  const layouts = {
    1: { // Chapter 1: Complete cellular city overview
      nucleus: {
        position: [0, 0, 0] as [number, number, number],
        scale: [1.5, 1.5, 1.5] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      },
      mitochondria: [
        {
          position: [6, 1, 2] as [number, number, number],
          scale: [1.2, 1.2, 1.2] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        },
        {
          position: [-4, -2, 3] as [number, number, number],
          scale: [1.0, 1.0, 1.0] as [number, number, number],
          rotation: [0, Math.PI / 4, 0] as [number, number, number]
        },
        {
          position: [2, 4, -2] as [number, number, number],
          scale: [0.8, 0.8, 0.8] as [number, number, number],
          rotation: [0, -Math.PI / 3, 0] as [number, number, number]
        }
      ],
      endoplasmicReticulum: {
        position: [3, -3, -1] as [number, number, number],
        scale: [1.5, 1.0, 1.5] as [number, number, number],
        rotation: [0, Math.PI / 6, 0] as [number, number, number]
      },
      golgiApparatus: {
        position: [-3, 2, -3] as [number, number, number],
        scale: [1.0, 1.2, 1.0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      },
      ribosomes: [
        {
          position: [1, 3, 1] as [number, number, number],
          scale: [0.6, 0.6, 0.6] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        },
        {
          position: [-2, -4, -1] as [number, number, number],
          scale: [0.5, 0.5, 0.5] as [number, number, number],
          rotation: [0, Math.PI / 2, 0] as [number, number, number]
        },
        {
          position: [4, -1, 3] as [number, number, number],
          scale: [0.7, 0.7, 0.7] as [number, number, number],
          rotation: [0, -Math.PI / 4, 0] as [number, number, number]
        }
      ]
    },
    2: { // Chapter 2: Mitochondria-focused power plant district
      nucleus: {
        position: [-8, 0, 0] as [number, number, number],
        scale: [1.0, 1.0, 1.0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      },
      mitochondria: [
        {
          position: [0, 0, 0] as [number, number, number],
          scale: [2.5, 2.5, 2.5] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        },
        {
          position: [8, 0, 0] as [number, number, number],
          scale: [2.0, 2.0, 2.0] as [number, number, number],
          rotation: [0, Math.PI / 2, 0] as [number, number, number]
        },
        {
          position: [-4, 6, 0] as [number, number, number],
          scale: [1.8, 1.8, 1.8] as [number, number, number],
          rotation: [0, -Math.PI / 4, 0] as [number, number, number]
        }
      ],
      endoplasmicReticulum: {
        position: [0, -8, 0] as [number, number, number],
        scale: [0.8, 0.8, 0.8] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      },
      golgiApparatus: {
        position: [0, 8, 0] as [number, number, number],
        scale: [0.8, 0.8, 0.8] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      },
      ribosomes: [
        {
          position: [4, 4, 4] as [number, number, number],
          scale: [0.4, 0.4, 0.4] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        }
      ]
    },
    3: { // Chapter 3: Sleep and damage focus
      nucleus: {
        position: [0, 0, 0] as [number, number, number],
        scale: [1.2, 1.2, 1.2] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      },
      mitochondria: [
        {
          position: [5, 0, 0] as [number, number, number],
          scale: [1.5, 1.5, 1.5] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        },
        {
          position: [-5, 0, 0] as [number, number, number],
          scale: [1.5, 1.5, 1.5] as [number, number, number],
          rotation: [0, Math.PI, 0] as [number, number, number]
        }
      ],
      endoplasmicReticulum: {
        position: [0, 5, 0] as [number, number, number],
        scale: [1.0, 1.0, 1.0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      },
      golgiApparatus: {
        position: [0, -5, 0] as [number, number, number],
        scale: [1.0, 1.0, 1.0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      },
      ribosomes: [
        {
          position: [3, 3, 0] as [number, number, number],
          scale: [0.5, 0.5, 0.5] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        },
        {
          position: [-3, -3, 0] as [number, number, number],
          scale: [0.5, 0.5, 0.5] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        }
      ]
    }
  };
  
  return layouts[chapterId as keyof typeof layouts] || layouts[1];
}