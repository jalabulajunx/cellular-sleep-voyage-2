import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, useProgressStore, useUIStore } from '../../stores/gameStore';
import type { OrganelleType, InteractionContent } from '../../types';

interface HotspotSystemProps {
  organelleType: OrganelleType;
  position: [number, number, number];
  children: React.ReactNode;
}

export function HotspotSystem({ organelleType, position, children }: HotspotSystemProps) {
  const { selectedOrganelle, interactionMode, setSelectedOrganelle } = useGameStore();
  const { addDiscoveryPoints } = useProgressStore();
  const { addNotification } = useUIStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const hotspotRef = useRef<THREE.Mesh>(null);

  const isSelected = selectedOrganelle === organelleType;

  // Handle selection
  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    
    if (selectedOrganelle === organelleType) {
      // Deselect if already selected
      setSelectedOrganelle(null);
      setShowInfo(false);
    } else {
      // Select new organelle
      setSelectedOrganelle(organelleType);
      setShowInfo(true);
      
      // Award discovery points
      addDiscoveryPoints(10);
      
      // Show notification
      addNotification({
        type: 'success',
        title: 'Organelle Discovered!',
        message: `You discovered the ${organelleType.replace('-', ' ')}`,
        duration: 3000
      });
      
      console.log(`Selected ${organelleType}`);
    }
  }, [organelleType, selectedOrganelle, setSelectedOrganelle, addDiscoveryPoints, addNotification]);

  // Handle hover
  const handlePointerOver = useCallback((event: any) => {
    event.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  // Animation for selected/hovered state
  useFrame((state) => {
    if (groupRef.current) {
      if (isSelected) {
        // Pulsing animation for selected organelle
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        groupRef.current.scale.setScalar(scale);
      } else if (isHovered) {
        // Gentle scale up for hovered organelle
        groupRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
      } else {
        // Return to normal scale
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }

    // Animate hotspot indicator
    if (hotspotRef.current) {
      hotspotRef.current.rotation.z += 0.02;
      
      if (isHovered || isSelected) {
        hotspotRef.current.visible = true;
        const opacity = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
        (hotspotRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      } else {
        hotspotRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main organelle content */}
      <group
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {children}
      </group>

      {/* Hotspot indicator ring */}
      <mesh ref={hotspotRef} position={[0, 0, 0.1]} visible={false}>
        <ringGeometry args={[1.5, 1.8, 32]} />
        <meshBasicMaterial 
          color="#4ecdc4" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Selection indicator */}
      {isSelected && <SelectionIndicator />}

      {/* Hover tooltip */}
      {isHovered && !isSelected && (
        <HoverTooltip organelleType={organelleType} />
      )}

      {/* Information panel */}
      {showInfo && isSelected && (
        <InformationPanel 
          organelleType={organelleType} 
          onClose={() => setShowInfo(false)}
        />
      )}

      {/* Proximity detector for guided mode */}
      {interactionMode === 'learn' && (
        <ProximityDetector 
          organelleType={organelleType}
          position={position}
        />
      )}
    </group>
  );
}

function SelectionIndicator() {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.03;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ringRef.current.scale.setScalar(scale);
    }
  });

  return (
    <>
      {/* Outer selection ring */}
      <mesh ref={ringRef} position={[0, 0, 0.2]}>
        <ringGeometry args={[2, 2.3, 32]} />
        <meshBasicMaterial 
          color="#ff6b6b" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner glow ring */}
      <mesh position={[0, 0, 0.15]}>
        <ringGeometry args={[1.8, 2, 32]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

interface HoverTooltipProps {
  organelleType: OrganelleType;
}

function HoverTooltip({ organelleType }: HoverTooltipProps) {
  const tooltipContent = getTooltipContent(organelleType);

  return (
    <Html position={[0, 2, 0]} center>
      <div className="hover-tooltip">
        <div className="tooltip-title">{tooltipContent.title}</div>
        <div className="tooltip-description">{tooltipContent.description}</div>
        <div className="tooltip-hint">Click to learn more</div>
      </div>
    </Html>
  );
}

interface InformationPanelProps {
  organelleType: OrganelleType;
  onClose: () => void;
}

function InformationPanel({ organelleType, onClose }: InformationPanelProps) {
  const { addScientistPoints } = useProgressStore();
  const content = getDetailedContent(organelleType);

  const handleExploreMore = () => {
    addScientistPoints(20);
    console.log(`Exploring more about ${organelleType}`);
  };

  return (
    <Html position={[3, 0, 0]} center>
      <div className="information-panel">
        <div className="panel-header">
          <h3>{content.title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="panel-content">
          <div className="content-section">
            <h4>🏭 What it does</h4>
            <p>{content.function}</p>
          </div>
          
          <div className="content-section">
            <h4>😴 Sleep Connection</h4>
            <p>{content.sleepConnection}</p>
          </div>
          
          <div className="content-section">
            <h4>🔬 Fun Fact</h4>
            <p>{content.funFact}</p>
          </div>
        </div>
        
        <div className="panel-actions">
          <button className="action-button primary" onClick={handleExploreMore}>
            🧪 Explore More
          </button>
          <button className="action-button secondary" onClick={onClose}>
            📚 Got it!
          </button>
        </div>
      </div>
    </Html>
  );
}

interface ProximityDetectorProps {
  organelleType: OrganelleType;
  position: [number, number, number];
}

function ProximityDetector({ organelleType, position }: ProximityDetectorProps) {
  const { camera } = useThree();
  const { addNotification } = useUIStore();
  const [hasTriggered, setHasTriggered] = useState(false);
  
  useFrame(() => {
    if (hasTriggered) return;
    
    const distance = camera.position.distanceTo(new THREE.Vector3(...position));
    
    if (distance < 5) {
      setHasTriggered(true);
      addNotification({
        type: 'info',
        title: 'Organelle Nearby!',
        message: `You're close to the ${organelleType.replace('-', ' ')}. Click to explore!`,
        duration: 4000
      });
    }
  });

  return null;
}

// Content data for different organelles
function getTooltipContent(organelleType: OrganelleType): { title: string; description: string } {
  const content = {
    'mitochondria': {
      title: 'Mitochondria - Power Plant',
      description: 'The cellular powerhouse that makes energy (ATP)'
    },
    'nucleus': {
      title: 'Nucleus - City Hall',
      description: 'The control center containing DNA and managing cell activities'
    },
    'endoplasmic-reticulum': {
      title: 'Endoplasmic Reticulum - Factory',
      description: 'Manufacturing center for proteins and lipids'
    },
    'golgi-apparatus': {
      title: 'Golgi Apparatus - Shipping Center',
      description: 'Packages and ships proteins throughout the cell'
    },
    'ribosomes': {
      title: 'Ribosomes - Protein Factories',
      description: 'Small factories that build proteins from genetic instructions'
    },
    'cell-membrane': {
      title: 'Cell Membrane - City Gates',
      description: 'Controls what enters and exits the cell'
    },
    'cytoskeleton': {
      title: 'Cytoskeleton - Infrastructure',
      description: 'The structural framework that gives the cell its shape'
    }
  };

  return content[organelleType] || { title: 'Unknown Organelle', description: 'Click to learn more' };
}

function getDetailedContent(organelleType: OrganelleType): InteractionContent & { 
  function: string; 
  sleepConnection: string; 
  funFact: string; 
} {
  const content = {
    'mitochondria': {
      title: 'Mitochondria - The Cellular Power Plant',
      description: 'These bean-shaped organelles are the powerhouses of the cell.',
      function: 'Mitochondria convert glucose and oxygen into ATP (energy) through cellular respiration. They work like tiny power plants, burning fuel to create electricity for the cell.',
      sleepConnection: 'When mitochondria work too hard during wake hours, they leak electrons that create toxic sparks (ROS). These sparks build up and signal the brain that it\'s time to sleep for cellular repair.',
      funFact: 'Mitochondria have their own DNA! They were once independent bacteria that joined our cells billions of years ago.'
    },
    'nucleus': {
      title: 'Nucleus - The Cellular City Hall',
      description: 'The control center of the cell containing all genetic information.',
      function: 'The nucleus houses DNA and controls all cellular activities. It\'s like City Hall, making decisions and sending instructions throughout the cellular city.',
      sleepConnection: 'During sleep, the nucleus increases DNA repair processes and manages the production of proteins needed for cellular maintenance.',
      funFact: 'If you stretched out all the DNA in one nucleus, it would be about 6 feet long!'
    },
    'endoplasmic-reticulum': {
      title: 'Endoplasmic Reticulum - The Cellular Factory',
      description: 'A network of membranes that manufactures cellular products.',
      function: 'The ER makes proteins (rough ER) and lipids (smooth ER). It\'s like a factory with different production lines for different cellular products.',
      sleepConnection: 'Sleep helps the ER manage protein folding stress and clear out misfolded proteins that accumulate during wake hours.',
      funFact: 'The ER is connected to the nucleus and extends throughout the entire cell like a highway system!'
    },
    'golgi-apparatus': {
      title: 'Golgi Apparatus - The Shipping Center',
      description: 'The cell\'s packaging and shipping department.',
      function: 'The Golgi receives proteins from the ER, modifies them, packages them, and ships them to their final destinations in the cell.',
      sleepConnection: 'During sleep, the Golgi works overtime to process and ship repair proteins throughout the cell.',
      funFact: 'The Golgi looks like a stack of pancakes and was discovered by Italian scientist Camillo Golgi!'
    },
    'ribosomes': {
      title: 'Ribosomes - The Protein Factories',
      description: 'Tiny molecular machines that build proteins.',
      function: 'Ribosomes read genetic instructions (mRNA) and assemble amino acids into proteins. They\'re like tiny 3D printers for proteins.',
      sleepConnection: 'Sleep enhances ribosome function and helps clear out damaged ribosomes that accumulate during wake periods.',
      funFact: 'A single cell can contain millions of ribosomes, and they can make a protein in just seconds!'
    },
    'cell-membrane': {
      title: 'Cell Membrane - The City Gates',
      description: 'The protective barrier that controls cellular traffic.',
      function: 'The cell membrane controls what enters and exits the cell, maintains cell shape, and communicates with other cells.',
      sleepConnection: 'Sleep helps repair membrane damage and restore proper ion gradients across the membrane.',
      funFact: 'The cell membrane is only 7 nanometers thick - that\'s 10,000 times thinner than a human hair!'
    },
    'cytoskeleton': {
      title: 'Cytoskeleton - The Cellular Infrastructure',
      description: 'The structural framework of the cell.',
      function: 'The cytoskeleton provides structure, maintains cell shape, and helps organize organelles. It\'s like the cell\'s skeleton and highway system combined.',
      sleepConnection: 'During sleep, the cytoskeleton undergoes reorganization and repair, helping maintain cellular structure.',
      funFact: 'The cytoskeleton is dynamic - it constantly builds and rebuilds itself as the cell needs change!'
    }
  };

  return content[organelleType] || {
    title: 'Unknown Organelle',
    description: 'An interesting cellular component.',
    function: 'This organelle has important functions in the cell.',
    sleepConnection: 'This organelle is affected by sleep and wake cycles.',
    funFact: 'Every organelle has fascinating properties!'
  };
}