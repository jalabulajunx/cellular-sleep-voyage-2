import { useState, useEffect } from 'react';
import { useGameStore, useUIStore } from '../../stores/gameStore';
import { DraggableHUD, HUDLayoutManager } from './DraggableHUD';
import * as THREE from 'three';
import '../3d/VesselControls.css';
import './DraggableHUD.css';

interface VesselUIProps {
  vesselPosition: THREE.Vector3;
  vesselSpeed: number;
  chapterId: number;
  enabled?: boolean;
}

export function VesselUI({ vesselPosition, vesselSpeed, chapterId, enabled = true }: VesselUIProps) {
  const { cameraMode, setCameraMode } = useGameStore();
  const { addNotification } = useUIStore();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  
  // Detect touch device
  useEffect(() => {
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchDevice);
    
    // Show keyboard hints for desktop users initially
    if (!touchDevice && enabled) {
      setShowKeyboardHints(true);
      setTimeout(() => setShowKeyboardHints(false), 10000); // Hide after 10 seconds
    }
  }, [enabled]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!enabled) return;
      
      switch (event.key.toLowerCase()) {
        case 'h':
          setShowKeyboardHints(!showKeyboardHints);
          break;
        case 'r':
          // Reset vessel position notification
          addNotification({
            type: 'info',
            title: 'Vessel Reset',
            message: 'Vessel returned to starting position',
            duration: 2000
          });
          break;
        case 'c':
          // Toggle camera mode
          const newMode = cameraMode === 'free' ? 'guided' : 'free';
          setCameraMode(newMode);
          addNotification({
            type: 'info',
            title: 'Camera Mode',
            message: `Switched to ${newMode} mode`,
            duration: 2000
          });
          break;
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [enabled, showKeyboardHints, cameraMode, setCameraMode, addNotification]);
  
  const handleVesselMovement = (direction: string, active: boolean) => {
    // This would integrate with the vessel's movement system
    console.log(`Vessel movement: ${direction} - ${active ? 'start' : 'stop'}`);
  };
  
  if (!enabled) return null;
  
  return (
    <HUDLayoutManager>
      {/* Touch Controls for Mobile */}
      {isTouchDevice && (
        <VesselTouchControls onMovement={handleVesselMovement} />
      )}
      
      {/* Desktop Keyboard Hints */}
      {!isTouchDevice && showKeyboardHints && (
        <DraggableHUD
          id="keyboard-hints"
          title="Vessel Controls"
          defaultPosition={{ x: window.innerWidth - 320, y: 20 }}
          canCollapse={true}
          zIndex={1100}
        >
          <KeyboardHintsContent onClose={() => setShowKeyboardHints(false)} />
        </DraggableHUD>
      )}
      
      {/* Vessel HUD */}
      {cameraMode === 'free' && (
        <DraggableHUD
          id="vessel-status"
          title="Vessel Status"
          defaultPosition={{ x: 20, y: 20 }}
          canCollapse={true}
          zIndex={1000}
        >
          <VesselHUDContent 
            position={vesselPosition}
            speed={vesselSpeed}
            chapterId={chapterId}
          />
        </DraggableHUD>
      )}
      
      {/* Navigation Compass */}
      <DraggableHUD
        id="navigation-compass"
        title="Navigation"
        defaultPosition={{ x: window.innerWidth - 120, y: 20 }}
        canCollapse={true}
        zIndex={1000}
      >
        <NavigationCompassContent vesselPosition={vesselPosition} />
      </DraggableHUD>
    </HUDLayoutManager>
  );
}

function KeyboardHintsContent({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <div className="hint-group">
        <span className="key">W</span><span className="key">A</span><span className="key">S</span><span className="key">D</span> Move
      </div>
      <div className="hint-group">
        <span className="key">Q</span><span className="key">E</span> Up/Down
      </div>
      <div className="hint-group">
        <span className="key">Z</span><span className="key">X</span> Rotate
      </div>
      <div className="hint-group">
        <span className="key">H</span> Toggle Help
      </div>
      <div className="hint-group">
        <span className="key">R</span> Reset Position
      </div>
      <div className="hint-group">
        <span className="key">C</span> Camera Mode
      </div>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: '1px solid #4ecdc4',
          color: '#4ecdc4',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          marginTop: '10px',
          width: '100%'
        }}
      >
        Close
      </button>
    </div>
  );
}

function VesselHUDContent({ 
  position, 
  speed, 
  chapterId 
}: { 
  position: THREE.Vector3; 
  speed: number; 
  chapterId: number;
}) {
  const boundaries = getCellularBoundaries(chapterId);
  const distanceFromCenter = position.length();
  const isNearBoundary = distanceFromCenter > (boundaries.max.x * 0.8);
  
  return (
    <div>
      <div className="hud-item">
        <span className="hud-label">Speed:</span>
        <span className="hud-value">{(speed * 100).toFixed(1)} u/s</span>
      </div>
      <div className="hud-item">
        <span className="hud-label">X:</span>
        <span className="hud-value">{position.x.toFixed(1)}</span>
      </div>
      <div className="hud-item">
        <span className="hud-label">Y:</span>
        <span className="hud-value">{position.y.toFixed(1)}</span>
      </div>
      <div className="hud-item">
        <span className="hud-label">Z:</span>
        <span className="hud-value">{position.z.toFixed(1)}</span>
      </div>
      <div className="hud-item">
        <span className="hud-label">Distance:</span>
        <span className={isNearBoundary ? "hud-warning" : "hud-value"}>
          {distanceFromCenter.toFixed(1)}
        </span>
      </div>
      <div className="hud-item">
        <span className="hud-label">Chapter:</span>
        <span className="hud-value">{chapterId}</span>
      </div>
      {isNearBoundary && (
        <div className="hud-item">
          <span className="hud-warning">⚠ Near Boundary</span>
        </div>
      )}
    </div>
  );
}

function NavigationCompassContent({ vesselPosition }: { vesselPosition: THREE.Vector3 }) {
  // Calculate angle from center (nucleus)
  const angle = Math.atan2(vesselPosition.x, vesselPosition.z) * (180 / Math.PI);
  
  return (
    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
      <div style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Compass directions */}
        <div style={{ position: 'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#4ecdc4' }}>N</div>
        <div style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#4ecdc4' }}>E</div>
        <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#4ecdc4' }}>S</div>
        <div style={{ position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#4ecdc4' }}>W</div>
        
        {/* Compass needle */}
        <div 
          style={{
            width: '2px',
            height: '30px',
            background: '#ff6b6b',
            position: 'absolute',
            transformOrigin: 'bottom center',
            transform: `rotate(${angle}deg)`,
            transition: 'transform 0.3s ease'
          }}
        />
      </div>
    </div>
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

// Helper function
function getCellularBoundaries(chapterId: number) {
  const boundaries = {
    1: { min: { x: -16, y: -10, z: -16 }, max: { x: 16, y: 12, z: 16 } },
    2: { min: { x: -12, y: -8, z: -12 }, max: { x: 12, y: 10, z: 12 } },
    3: { min: { x: -10, y: -6, z: -10 }, max: { x: 10, y: 8, z: 10 } }
  };
  
  return boundaries[chapterId as keyof typeof boundaries] || boundaries[1];
}