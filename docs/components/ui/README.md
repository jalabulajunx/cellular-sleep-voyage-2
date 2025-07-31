# UI Components Documentation

This directory contains all user interface components that exist outside the 3D Canvas, including controls, indicators, and overlays.

## Component Overview

### CameraControlsExternal.tsx
**Purpose**: Camera control buttons and keyboard shortcuts outside Canvas
**Responsibilities**:
- Zoom in/out buttons with visual feedback
- 8-directional rotation controls
- Reset view functionality
- Keyboard shortcut handling
- Quick view preset positions

**Key Components**:
- `CameraControlsExternal`: Main control panel
- `KeyboardShortcuts`: Help panel with shortcut reference
- `QuickViewButtonsExternal`: Preset camera positions

**Camera Reference System**:
- Uses `cameraRef` prop to access Three.js camera
- Imperative camera manipulation (no hooks)
- Smooth animations with easing functions

**Keyboard Shortcuts**:
- `+/-`: Zoom in/out
- `Arrow Keys` or `WASD`: Rotate camera
- `R`: Reset to default view
- `⌨️` button: Show/hide shortcuts panel

**Maintenance Notes**:
- Add new preset views in `viewPositions` array
- Modify animation duration in camera movement functions
- Update keyboard shortcuts in `handleKeyDown` event handler
- Adjust zoom limits and rotation angles as needed

### ZoomLevelIndicator.tsx
**Purpose**: Real-time zoom and interaction mode indicators
**Responsibilities**:
- Display current zoom level and percentage
- Show interaction mode status
- Visual zoom scale with markers
- Camera mode indication

**Key Components**:
- `ZoomLevelIndicator`: Zoom status display (Canvas-dependent)
- `InteractionModeIndicator`: Mode status display (Canvas-independent)

**Zoom Levels**:
- **Cellular** (100%): Full cell overview
- **Organelle** (150%+): Focused organelle view
- **Molecular** (200%+): Detailed molecular structures

**Mode Indicators**:
- **Explore**: Navigation and discovery (🔍)
- **Experiment**: Manipulation and testing (🧪)
- **Learn**: Guided educational experience (📚)
- **Locked**: Camera movement disabled (🔒)

**Maintenance Notes**:
- Update zoom thresholds in `updateZoomLevel` function
- Add new interaction modes in `modes` object
- Modify visual indicators and colors as needed
- Adjust update frequency (currently 100ms interval)

### NotificationSystem.tsx
**Purpose**: Toast notification system for user feedback
**Responsibilities**:
- Display achievement notifications
- Show discovery and learning feedback
- Auto-dismiss with configurable duration
- Manual close functionality

**Key Features**:
- Multiple notification types: success, info, warning, error
- Slide-in animation from right
- Auto-dismiss timers
- Click-to-close functionality
- Stacked notification display

**Notification Types**:
- **Success**: Discoveries, achievements, completions
- **Info**: Hints, proximity alerts, general information
- **Warning**: Cautions, limitations, guidance
- **Error**: Problems, failures, restrictions

**Usage Pattern**:
```typescript
const { addNotification } = useUIStore();
addNotification({
  type: 'success',
  title: 'Discovery Made!',
  message: 'You found the mitochondria!',
  duration: 3000
});
```

**Maintenance Notes**:
- Adjust animation duration in CSS `@keyframes slideInRight`
- Modify auto-dismiss timing per notification type
- Update notification styling in App.css
- Add new notification types as needed

### CameraControls.tsx (Legacy)
**Purpose**: Original camera controls (deprecated)
**Status**: Replaced by CameraControlsExternal.tsx
**Issue**: Used Three.js hooks outside Canvas context
**Resolution**: Migrated to external reference-based system

**Migration Notes**:
- All functionality moved to CameraControlsExternal.tsx
- Uses camera reference instead of useThree hook
- Maintains same UI and functionality
- Can be safely removed after verification