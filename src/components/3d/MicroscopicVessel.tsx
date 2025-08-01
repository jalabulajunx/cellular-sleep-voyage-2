import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { useUIStore } from '../../stores/gameStore';

interface MicroscopicVesselProps {
  chapterId: number;
  onPositionChange?: (position: THREE.Vector3) => void;
}

export function MicroscopicVessel({ chapterId, onPositionChange }: MicroscopicVesselProps) {
  const vesselRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { cameraMode } = useGameStore();
  const { addNotification } = useUIStore();
  
  // Vessel state
  const [vesselPosition, setVesselPosition] = useState(new THREE.Vector3(0, 0, 8));
  // Vessel rotation state (for future use)
  // const [vesselRotation] = useState(new THREE.Euler(0, 0, 0));
  const [isMoving, setIsMoving] = useState(false);
  const [speed, setSpeed] = useState(0);
  
  // Navigation boundaries for cellular space
  const boundaries = getCellularBoundaries(chapterId);
  
  // Movement controls
  const movement = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    rotateLeft: false,
    rotateRight: false
  });
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (cameraMode !== 'free') return;
      
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          movement.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          movement.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          movement.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          movement.current.right = true;
          break;
        case 'KeyQ':
          movement.current.up = true;
          break;
        case 'KeyE':
          movement.current.down = true;
          break;
        case 'KeyZ':
          movement.current.rotateLeft = true;
          break;
        case 'KeyX':
          movement.current.rotateRight = true;
          break;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          movement.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          movement.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          movement.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          movement.current.right = false;
          break;
        case 'KeyQ':
          movement.current.up = false;
          break;
        case 'KeyE':
          movement.current.down = false;
          break;
        case 'KeyZ':
          movement.current.rotateLeft = false;
          break;
        case 'KeyX':
          movement.current.rotateRight = false;
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [cameraMode]);
  
  // Movement and boundary checking
  useFrame((state, delta) => {
    if (!vesselRef.current || cameraMode !== 'free') return;
    
    const vessel = vesselRef.current;
    let moved = false;
    let currentSpeed = 0;
    
    // Calculate movement vector
    const moveVector = new THREE.Vector3();
    const rotationSpeed = 2 * delta;
    const moveSpeed = 5 * delta;
    
    // Forward/backward movement
    if (movement.current.forward) {
      moveVector.z -= moveSpeed;
      currentSpeed += moveSpeed;
      moved = true;
    }
    if (movement.current.backward) {
      moveVector.z += moveSpeed;
      currentSpeed += moveSpeed;
      moved = true;
    }
    
    // Left/right movement
    if (movement.current.left) {
      moveVector.x -= moveSpeed;
      currentSpeed += moveSpeed;
      moved = true;
    }
    if (movement.current.right) {
      moveVector.x += moveSpeed;
      currentSpeed += moveSpeed;
      moved = true;
    }
    
    // Up/down movement
    if (movement.current.up) {
      moveVector.y += moveSpeed;
      currentSpeed += moveSpeed;
      moved = true;
    }
    if (movement.current.down) {
      moveVector.y -= moveSpeed;
      currentSpeed += moveSpeed;
      moved = true;
    }
    
    // Rotation
    if (movement.current.rotateLeft) {
      vessel.rotation.y += rotationSpeed;
      moved = true;
    }
    if (movement.current.rotateRight) {
      vessel.rotation.y -= rotationSpeed;
      moved = true;
    }
    
    // Apply movement relative to vessel's rotation
    if (moveVector.length() > 0) {
      moveVector.applyQuaternion(vessel.quaternion);
      const newPosition = vessel.position.clone().add(moveVector);
      
      // Check boundaries
      if (isWithinBoundaries(newPosition, boundaries)) {
        vessel.position.copy(newPosition);
        setVesselPosition(newPosition);
        
        // Update camera to follow vessel
        const cameraOffset = new THREE.Vector3(0, 2, 5);
        cameraOffset.applyQuaternion(vessel.quaternion);
        camera.position.copy(vessel.position).add(cameraOffset);
        camera.lookAt(vessel.position);
        
        if (onPositionChange) {
          onPositionChange(newPosition);
        }
      } else {
        // Hit boundary - show warning
        showBoundaryWarning();
      }
    }
    
    // Update movement state
    setIsMoving(moved);
    setSpeed(currentSpeed);
    
    // Vessel animations
    if (moved) {
      // Engine glow animation
      const engineGlow = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5;
      vessel.children.forEach(child => {
        if (child.name === 'engine') {
          const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = engineGlow * 0.5;
        }
      });
      
      // Subtle vessel vibration
      vessel.position.y += Math.sin(state.clock.elapsedTime * 20) * 0.01;
    }
  });
  
  const showBoundaryWarning = () => {
    addNotification({
      type: 'warning',
      title: 'Cellular Boundary',
      message: 'You\'ve reached the edge of the cellular space. Turn around to continue exploring!',
      duration: 3000
    });
  };
  
  return (
    <group ref={vesselRef} position={vesselPosition}>
      {/* Main vessel body */}
      <VesselBody isMoving={isMoving} speed={speed} />
      
      {/* Navigation lights */}
      <NavigationLights />
      
      {/* Engine effects */}
      <EngineEffects isMoving={isMoving} />
      
      {/* Vessel UI indicators */}
      {cameraMode === 'free' && <VesselHUD position={vesselPosition} speed={speed} />}
    </group>
  );
}

function VesselBody({ isMoving, speed }: { isMoving: boolean; speed: number }) {
  const bodyRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (bodyRef.current && isMoving) {
      // Subtle forward lean when moving
      bodyRef.current.rotation.x = -speed * 0.1;
    }
  });
  
  return (
    <group>
      {/* Main hull */}
      <mesh ref={bodyRef}>
        <capsuleGeometry args={[0.3, 1.5, 4, 8]} />
        <meshStandardMaterial 
          color="#4a90e2"
          metalness={0.7}
          roughness={0.3}
          emissive="#1a4480"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Cockpit */}
      <mesh position={[0, 0.2, 0.5]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color="#87ceeb"
          transparent
          opacity={0.7}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Wings/stabilizers */}
      <mesh position={[-0.6, 0, -0.3]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.8, 0.1, 0.4]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      <mesh position={[0.6, 0, -0.3]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.8, 0.1, 0.4]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
    </group>
  );
}

function NavigationLights() {
  const leftLightRef = useRef<THREE.PointLight>(null);
  const rightLightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    // Blinking navigation lights
    const blink = Math.sin(state.clock.elapsedTime * 3) > 0;
    
    if (leftLightRef.current) {
      leftLightRef.current.intensity = blink ? 0.5 : 0.1;
    }
    if (rightLightRef.current) {
      rightLightRef.current.intensity = !blink ? 0.5 : 0.1;
    }
  });
  
  return (
    <group>
      {/* Left navigation light (red) */}
      <pointLight
        ref={leftLightRef}
        position={[-0.6, 0, 0.3]}
        color="#ff0000"
        intensity={0.3}
        distance={2}
      />
      <mesh position={[-0.6, 0, 0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* Right navigation light (green) */}
      <pointLight
        ref={rightLightRef}
        position={[0.6, 0, 0.3]}
        color="#00ff00"
        intensity={0.3}
        distance={2}
      />
      <mesh position={[0.6, 0, 0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      
      {/* Forward spotlight */}
      <spotLight
        position={[0, 0, 0.8]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={0.8}
        distance={10}
        color="#ffffff"
        castShadow
      />
    </group>
  );
}

function EngineEffects({ isMoving }: { isMoving: boolean }) {
  const engineRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (engineRef.current) {
      // Engine glow intensity based on movement
      const material = engineRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = isMoving ? 
        0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.3 : 0.1;
    }
    
    if (particlesRef.current && isMoving) {
      // Engine particle trail
      particlesRef.current.rotation.z += 0.1;
    }
  });
  
  // Engine particle system
  const particleCount = 20;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
    positions[i * 3 + 2] = -1 - Math.random() * 2;
  }
  
  return (
    <group>
      {/* Engine nozzles */}
      <mesh ref={engineRef} name="engine" position={[0, 0, -0.8]}>
        <cylinderGeometry args={[0.15, 0.1, 0.3, 8]} />
        <meshStandardMaterial 
          color="#ff6b35"
          emissive="#ff6b35"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Engine particles */}
      {isMoving && (
        <points ref={particlesRef} position={[0, 0, -1.2]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
              count={particleCount}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            color="#ff6b35"
            transparent
            opacity={0.8}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  );
}

function VesselHUD({ position, speed }: { position: THREE.Vector3; speed: number }) {
  // This would be rendered as HTML overlay in a real implementation
  // For now, we'll use 3D elements as placeholders
  console.log(`Vessel HUD - Position: ${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}, Speed: ${speed.toFixed(2)}`);
  
  return (
    <group position={[0, 1.5, 0]}>
      {/* Speed indicator */}
      <mesh position={[-1, 0, 0]}>
        <planeGeometry args={[0.5, 0.2]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* Position indicator */}
      <mesh position={[1, 0, 0]}>
        <planeGeometry args={[0.5, 0.2]} />
        <meshBasicMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// Touch controls for mobile devices
export function VesselTouchControls({ onMovement }: { 
  onMovement: (direction: string, active: boolean) => void 
}) {
  return (
    <div className="vessel-touch-controls">
      {/* Movement joystick */}
      <div className="movement-joystick">
        <TouchJoystick onMove={(x, y) => {
          onMovement('forward', y > 0.5);
          onMovement('backward', y < -0.5);
          onMovement('left', x < -0.5);
          onMovement('right', x > 0.5);
        }} />
      </div>
      
      {/* Vertical controls */}
      <div className="vertical-controls">
        <button 
          onTouchStart={() => onMovement('up', true)}
          onTouchEnd={() => onMovement('up', false)}
          className="control-button up-button"
        >
          ↑
        </button>
        <button 
          onTouchStart={() => onMovement('down', true)}
          onTouchEnd={() => onMovement('down', false)}
          className="control-button down-button"
        >
          ↓
        </button>
      </div>
      
      {/* Rotation controls */}
      <div className="rotation-controls">
        <button 
          onTouchStart={() => onMovement('rotateLeft', true)}
          onTouchEnd={() => onMovement('rotateLeft', false)}
          className="control-button rotate-left"
        >
          ↺
        </button>
        <button 
          onTouchStart={() => onMovement('rotateRight', true)}
          onTouchEnd={() => onMovement('rotateRight', false)}
          className="control-button rotate-right"
        >
          ↻
        </button>
      </div>
    </div>
  );
}

function TouchJoystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (touch.clientX - centerX) / (rect.width / 2);
    const y = (centerY - touch.clientY) / (rect.height / 2);
    
    // Clamp to circle
    const distance = Math.sqrt(x * x + y * y);
    const clampedX = distance > 1 ? x / distance : x;
    const clampedY = distance > 1 ? y / distance : y;
    
    setPosition({ x: clampedX, y: clampedY });
    onMove(clampedX, clampedY);
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };
  
  return (
    <div 
      className="touch-joystick"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        position: 'relative',
        touchAction: 'none'
      }}
    >
      <div 
        className="joystick-handle"
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(${position.x * 35 - 15}px, ${-position.y * 35 - 15}px)`
        }}
      />
    </div>
  );
}

// Helper functions
function getCellularBoundaries(chapterId: number) {
  const boundaries = {
    1: { // Chapter 1: Full cellular exploration
      min: { x: -16, y: -10, z: -16 },
      max: { x: 16, y: 12, z: 16 }
    },
    2: { // Chapter 2: Mitochondria focus
      min: { x: -12, y: -8, z: -12 },
      max: { x: 12, y: 10, z: 12 }
    },
    3: { // Chapter 3: Sleep focus
      min: { x: -10, y: -6, z: -10 },
      max: { x: 10, y: 8, z: 10 }
    }
  };
  
  return boundaries[chapterId as keyof typeof boundaries] || boundaries[1];
}

function isWithinBoundaries(position: THREE.Vector3, boundaries: any): boolean {
  return position.x >= boundaries.min.x && position.x <= boundaries.max.x &&
         position.y >= boundaries.min.y && position.y <= boundaries.max.y &&
         position.z >= boundaries.min.z && position.z <= boundaries.max.z;
}

// Navigation assistance system
export function NavigationAssistance({ vesselPosition, chapterId }: {
  vesselPosition: THREE.Vector3;
  chapterId: number;
}) {
  const { addNotification } = useUIStore();
  const [lastHintTime, setLastHintTime] = useState(0);
  
  useFrame((state) => {
    // Provide contextual hints based on position and chapter
    const currentTime = state.clock.elapsedTime;
    
    if (currentTime - lastHintTime > 10) { // Hint every 10 seconds max
      const hint = getContextualHint(vesselPosition, chapterId);
      
      if (hint) {
        addNotification({
          type: 'info',
          title: 'Navigation Hint',
          message: hint,
          duration: 5000
        });
        setLastHintTime(currentTime);
      }
    }
  });
  
  return null;
}

function getContextualHint(position: THREE.Vector3, chapterId: number): string | null {
  const distance = position.length();
  
  // Near center (nucleus)
  if (distance < 2) {
    return "You're near the nucleus - the cell's control center! Try exploring the mitochondria to learn about cellular energy.";
  }
  
  // Near boundary
  if (distance > 12) {
    return "You're approaching the cell membrane. This is the boundary of our cellular city!";
  }
  
  // Chapter-specific hints
  if (chapterId === 2 && position.x > 4) {
    return "You're in the power plant district! These mitochondria generate ATP energy for the cell.";
  }
  
  return null;
}