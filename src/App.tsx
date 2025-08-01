import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, useUIStore, useProgressStore } from './stores/gameStore';
import { placeholderAssetManager } from './utils/placeholderAssets';
import { assetLoadingSystem } from './utils/enhanced3DAssets';
import { SceneManager } from './components/3d/SceneManager';
import { CellularEnvironment } from './components/3d/CellularEnvironment';
import { InteractionModeIndicator } from './components/ui/ZoomLevelIndicator';
import { CameraControlsExternal, QuickViewButtonsExternal } from './components/ui/CameraControlsExternal';
import { NotificationSystem } from './components/ui/NotificationSystem';
import { VesselUI } from './components/ui/VesselUI';
import { DraggableHUD } from './components/ui/DraggableHUD';
import { useVesselSystem } from './hooks/useVesselSystem';
import './App.css';

// Import components (we'll create these next)
// import { CellularEnvironment } from './components/3d/CellularEnvironment';
// import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
// import { UIOverlay } from './components/ui/UIOverlay';

function App() {
  const { currentChapter, isPlaying, interactionMode } = useGameStore();
  const { showTutorial } = useUIStore();
  const { discoveryPoints, scientistPoints, sleepPoints } = useProgressStore();
  const cameraRef = useRef<THREE.Camera | null>(null);
  
  // Vessel system hook
  const vesselSystem = useVesselSystem(
    currentChapter, 
    interactionMode === 'explore'
  );

  useEffect(() => {
    // Initialize placeholder assets for development
    placeholderAssetManager.createPlaceholderAssets();
    
    // Preload enhanced 3D assets
    const preloadAssets = async () => {
      try {
        console.log('Preloading enhanced 3D assets...');
        await assetLoadingSystem.preloadAllAssets();
        console.log('Enhanced 3D assets preloaded successfully');
      } catch (error) {
        console.warn('Failed to preload some enhanced assets:', error);
      }
    };
    
    preloadAssets();
    console.log('Cellular Sleep Voyage initialized');
  }, []);

  return (
    <div className="app">
      {/* Header with progress indicators */}
      <header className="app-header">
        <h1>Cellular Sleep Voyage</h1>
        <div className="progress-indicators">
          <div className="points-display">
            <span>🔬 Discovery: {discoveryPoints}</span>
            <span>🧪 Scientist: {scientistPoints}</span>
            <span>😴 Sleep: {sleepPoints}</span>
          </div>
          <div className="chapter-indicator">
            Chapter {currentChapter}
          </div>
        </div>
      </header>

      {/* Main 3D Canvas */}
      <main className="app-main">
        <Canvas
          style={{ width: '100%', height: '100%' }}
          shadows
          gl={{ 
            antialias: true, 
            alpha: false,
            powerPreference: "high-performance"
          }}
        >
          <SceneManager cameraRef={cameraRef}>
            <CellularEnvironment chapterId={currentChapter} />
          </SceneManager>
        </Canvas>
        
        {/* External Camera Controls - Now Draggable */}
        {!showTutorial && (
          <>
            <DraggableHUD
              id="camera-controls"
              title="Camera Controls"
              defaultPosition={{ x: window.innerWidth - 220, y: window.innerHeight / 2 - 100 }}
              canCollapse={true}
              zIndex={300}
            >
              <CameraControlsExternal visible={true} cameraRef={cameraRef} />
            </DraggableHUD>
            
            <DraggableHUD
              id="quick-view-buttons"
              title="Quick Views"
              defaultPosition={{ x: 20, y: window.innerHeight / 2 - 100 }}
              canCollapse={true}
              zIndex={300}
            >
              <QuickViewButtonsExternal cameraRef={cameraRef} />
            </DraggableHUD>
          </>
        )}

        {/* Tutorial overlay */}
        {showTutorial && (
          <div className="tutorial-overlay">
            <div className="tutorial-content">
              <h2>Welcome to the Cellular Sleep Voyage!</h2>
              <p>You're about to embark on a microscopic journey through a living cell.</p>
              <p>Use your mouse to look around and click on objects to explore.</p>
              <button 
                onClick={() => useUIStore.getState().setShowTutorial(false)}
                className="tutorial-button"
              >
                Start Exploring
              </button>
            </div>
          </div>
        )}

        {/* Development info overlay */}
        {/* UI Indicators - Outside Canvas */}
        {!showTutorial && (
          <>
            <DraggableHUD
              id="interaction-mode"
              title="Interaction Mode"
              defaultPosition={{ x: window.innerWidth / 2 - 100, y: 20 }}
              canCollapse={true}
              zIndex={200}
            >
              <InteractionModeIndicator />
            </DraggableHUD>
            
            {/* Vessel UI - Outside Canvas */}
            <VesselUI 
              vesselPosition={vesselSystem.vesselPosition}
              vesselSpeed={vesselSystem.vesselSpeed}
              chapterId={currentChapter}
              enabled={vesselSystem.enabled}
            />
          </>
        )}

        <div className="dev-info">
          <p>🚧 Development Mode - Using Placeholder Assets</p>
          <p>Status: {isPlaying ? 'Playing' : 'Paused'}</p>
          <p>Use camera controls on the right or keyboard shortcuts</p>
        </div>
      </main>

      {/* Notification System */}
      <NotificationSystem />

      {/* Footer with controls */}
      <footer className="app-footer">
        <div className="controls">
          <button 
            onClick={() => useGameStore.getState().setPlaying(!isPlaying)}
            className="control-button"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button 
            onClick={() => useUIStore.getState().setShowHelp(true)}
            className="control-button"
          >
            ❓ Help
          </button>
          <button 
            onClick={() => useUIStore.getState().setShowSettings(true)}
            className="control-button"
          >
            ⚙️ Settings
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
