import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '../../stores/gameStore';

export function ZoomLevelIndicator() {
  // This version works inside Canvas with useThree
  const { camera } = useThree();
  const { selectedOrganelle } = useGameStore();
  const [zoomLevel, setZoomLevel] = useState<'cellular' | 'organelle' | 'molecular'>('cellular');
  const [zoomPercentage, setZoomPercentage] = useState(100);

  useEffect(() => {
    const updateZoomLevel = () => {
      if (camera && 'zoom' in camera) {
        const zoom = (camera as any).zoom || 1;
        setZoomPercentage(Math.round(zoom * 100));
        
        // Determine zoom level based on zoom value and selection
        if (selectedOrganelle && zoom > 2) {
          setZoomLevel('molecular');
        } else if (selectedOrganelle || zoom > 1.5) {
          setZoomLevel('organelle');
        } else {
          setZoomLevel('cellular');
        }
      }
    };

    // Update initially
    updateZoomLevel();

    // Update on animation frames
    const interval = setInterval(updateZoomLevel, 100);
    return () => clearInterval(interval);
  }, [camera, selectedOrganelle]);

  const zoomLevels = {
    cellular: {
      name: 'Cellular Overview',
      description: 'Full cell view with all organelles',
      icon: '🔬',
      color: '#4ecdc4'
    },
    organelle: {
      name: 'Organelle Focus',
      description: 'Detailed view of selected organelle',
      icon: '🧬',
      color: '#ff6b6b'
    },
    molecular: {
      name: 'Molecular Detail',
      description: 'Molecular structure and processes',
      icon: '⚛️',
      color: '#f9ca24'
    }
  };

  const currentLevel = zoomLevels[zoomLevel];

  return (
    <div className="zoom-level-indicator">
      <div className="zoom-info">
        <div className="zoom-icon" style={{ color: currentLevel.color }}>
          {currentLevel.icon}
        </div>
        <div className="zoom-details">
          <div className="zoom-name">{currentLevel.name}</div>
          <div className="zoom-description">{currentLevel.description}</div>
          <div className="zoom-percentage">{zoomPercentage}%</div>
        </div>
      </div>
      
      <div className="zoom-scale">
        <div className="scale-track">
          <div 
            className="scale-fill" 
            style={{ 
              width: `${Math.min(zoomPercentage, 500) / 5}%`,
              backgroundColor: currentLevel.color 
            }}
          />
        </div>
        <div className="scale-markers">
          <span className="scale-marker" data-level="cellular">🔬</span>
          <span className="scale-marker" data-level="organelle">🧬</span>
          <span className="scale-marker" data-level="molecular">⚛️</span>
        </div>
      </div>
    </div>
  );
}

// Interaction mode indicator (outside Canvas)
export function InteractionModeIndicator() {
  const { interactionMode, cameraMode } = useGameStore();

  const modes = {
    explore: {
      name: 'Explore Mode',
      description: 'Navigate and discover cellular structures',
      icon: '🔍',
      color: '#4ecdc4'
    },
    experiment: {
      name: 'Experiment Mode',
      description: 'Manipulate and test organelles',
      icon: '🧪',
      color: '#ff6b6b'
    },
    learn: {
      name: 'Learn Mode',
      description: 'Guided educational experience',
      icon: '📚',
      color: '#f9ca24'
    },
    locked: {
      name: 'Locked Mode',
      description: 'Camera movement disabled',
      icon: '🔒',
      color: '#95a5a6'
    }
  };

  const currentMode = modes[interactionMode];
  const currentCamera = cameraMode;

  return (
    <div className="interaction-mode-indicator">
      <div className="mode-info">
        <div className="mode-icon" style={{ color: currentMode.color }}>
          {currentMode.icon}
        </div>
        <div className="mode-details">
          <div className="mode-name">{currentMode.name}</div>
          <div className="mode-description">{currentMode.description}</div>
          <div className="camera-mode">Camera: {currentCamera}</div>
        </div>
      </div>
    </div>
  );
}