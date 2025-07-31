# 3D Components Documentation

This directory contains all Three.js and React Three Fiber components that handle the 3D scene, interactions, and visual effects.

## Component Overview

### SceneManager.tsx
**Purpose**: Core 3D scene setup and management
**Responsibilities**:
- WebGL renderer configuration
- Lighting setup (ambient, directional, point lights)
- Camera management and reference passing
- OrbitControls configuration with sensitivity settings
- Performance monitoring and optimization
- Scene background and fog effects

**Key Props**:
- `children`: React nodes to render in the scene
- `cameraRef`: Mutable ref for external camera control

**Configuration**:
- Rotation speed: 0.3 (free mode), 0.2 (guided mode)
- Damping factor: 0.1 for smooth deceleration
- Zoom/pan speeds: 0.5/0.3 respectively

**Maintenance Notes**:
- Adjust `rotateSpeed` to change mouse sensitivity
- Modify `dampingFactor` for smoother/snappier controls
- Update lighting positions for different visual effects

### CellularEnvironment.tsx
**Purpose**: Main cellular scene with organelles and environment
**Responsibilities**:
- Organelle layout management for different chapters
- Cell membrane boundary visualization
- Cytoplasm particle effects
- Spatial grid for reference
- Touch device detection and UI adaptation

**Key Features**:
- Chapter-specific organelle layouts
- Breathing animation for cell membrane
- Floating particle system for atmosphere
- Integration with interaction systems

**Maintenance Notes**:
- Add new organelle layouts in `getOrganelleLayout()`
- Adjust particle count in `CytoplasmParticles` for performance
- Modify cell membrane scale animation in `CellMembrane`

### HotspotSystem.tsx
**Purpose**: Interactive hotspots and information panels
**Responsibilities**:
- Click/hover detection on organelles
- Selection visual feedback (rings, scaling)
- Tooltip and information panel display
- Discovery point rewards
- Proximity detection for guided mode

**Key Components**:
- `HotspotSystem`: Main wrapper with interaction logic
- `SelectionIndicator`: Animated selection rings
- `HoverTooltip`: Quick info on hover
- `InformationPanel`: Detailed educational content
- `ProximityDetector`: Automatic notifications

**Content Management**:
- `getTooltipContent()`: Basic organelle information
- `getDetailedContent()`: Comprehensive educational content
- Update content for new organelles or scientific accuracy

**Maintenance Notes**:
- Add new organelle content in content functions
- Adjust animation speeds in `useFrame` callbacks
- Modify point rewards in click handlers

### InteractionControls.tsx
**Purpose**: 3D object manipulation and camera controls
**Responsibilities**:
- Manual camera rotation with mouse
- Zoom level management
- Object selection and manipulation
- Transform controls for experiment mode
- Multi-level zoom system

**Key Features**:
- `InteractionControls`: Main wrapper component
- `ZoomControls`: Mouse wheel zoom handling
- `RotationControls`: Manual camera rotation
- `ManipulableObject`: Draggable 3D objects
- `MultiLevelZoom`: Automatic zoom levels

**Configuration**:
- Rotation speed: 0.002 (reduced for smoother control)
- Zoom limits: 0.1 to 5.0
- Manipulation bounds: Within cell membrane

**Maintenance Notes**:
- Adjust `rotationSpeed` for sensitivity changes
- Modify zoom limits in `handleZoom` functions
- Update manipulation constraints in drag handlers

### TouchControls.tsx
**Purpose**: Touch-specific interactions for mobile devices
**Responsibilities**:
- Touch gesture recognition (tap, pinch, drag)
- Pinch-to-zoom functionality
- Touch rotation handling
- Haptic feedback integration
- Mobile UI overlay

**Key Components**:
- `TouchControls`: Main touch event handler
- `TouchRotationHandler`: Touch-based camera rotation
- `TouchZoomHandler`: Pinch-to-zoom implementation
- `GestureRecognition`: Advanced gesture detection
- `HapticFeedback`: Vibration feedback
- `TouchUI`: Mobile-specific UI overlay

**Configuration**:
- Touch rotation speed: 0.002
- Gesture thresholds: Tap (300ms, 10px), Swipe (500ms, 50px)
- Haptic patterns: Light (10ms), Medium (20ms), Heavy (50ms)

**Maintenance Notes**:
- Adjust gesture thresholds in `GestureRecognition`
- Modify haptic patterns for different feedback
- Update touch sensitivity in rotation handlers