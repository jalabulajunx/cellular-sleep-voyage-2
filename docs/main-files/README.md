# Main Application Files Documentation

This directory documents the core application files that bootstrap and configure the entire Cellular Sleep Voyage application.

## File Overview

### main.tsx
**Purpose**: Application entry point and React root setup
**Responsibilities**:
- React 18 root creation and rendering
- StrictMode wrapper for development checks
- CSS imports and global styling
- Application bootstrap

**Code Structure**:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Key Features**:
- Uses React 18's `createRoot` API for concurrent features
- StrictMode enabled for development warnings
- Global CSS imported before App component
- Type-safe root element access

**Maintenance Notes**:
- Keep imports minimal for fast startup
- StrictMode should remain enabled in development
- Consider adding error boundaries at this level
- Monitor bundle size impact of global imports

### App.tsx
**Purpose**: Main application component and layout orchestration
**Responsibilities**:
- Overall application layout and structure
- 3D Canvas setup and configuration
- State management integration
- UI component coordination
- Camera reference management

**Key Components Integration**:
- **Canvas**: React Three Fiber 3D context
- **SceneManager**: 3D scene setup and management
- **CellularEnvironment**: Main 3D content
- **CameraControlsExternal**: UI controls outside Canvas
- **NotificationSystem**: Toast notifications
- **InteractionModeIndicator**: Status displays

**State Management**:
```typescript
const { currentChapter, isPlaying } = useGameStore();
const { showTutorial } = useUIStore();
const { discoveryPoints, scientistPoints, sleepPoints } = useProgressStore();
const cameraRef = useRef<THREE.Camera | null>(null);
```

**Canvas Configuration**:
- WebGL renderer with high performance settings
- Shadow mapping enabled
- Antialiasing and alpha blending configured
- Responsive sizing (100% width/height)

**Layout Structure**:
1. **Header**: Progress indicators and chapter info
2. **Main**: 3D Canvas with scene content
3. **Overlays**: UI controls and indicators
4. **Footer**: Control buttons and status
5. **Notifications**: Toast notification system

**Maintenance Notes**:
- Camera ref system enables external controls
- All UI components positioned absolutely for overlay
- Tutorial system controls initial visibility
- Progress tracking integrated throughout

### App.css
**Purpose**: Global application styles and design system
**Responsibilities**:
- Application layout and positioning
- Glass morphism design system
- Component-specific styling
- Responsive design patterns
- Accessibility features

**Design System**:
- **Glass Morphism**: Translucent backgrounds with blur effects
- **Color Palette**: Gradient-based with accent colors
- **Typography**: Segoe UI font stack with size hierarchy
- **Spacing**: Consistent rem-based spacing system
- **Animations**: Smooth transitions and hover effects

**Key Style Categories**:

#### Layout Styles
- `.app`: Full viewport layout with flex column
- `.app-header`: Fixed header with glass background
- `.app-main`: Flexible main content area
- `.app-footer`: Fixed footer with controls

#### Glass Morphism System
```css
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: blur(10px);
```

#### Component Styles
- **Camera Controls**: Right-side control panel
- **Touch UI**: Mobile-specific overlays
- **Hotspot System**: Interactive tooltips and panels
- **Notification System**: Toast notification styling

#### Responsive Design
- Mobile-first approach with progressive enhancement
- Touch-friendly sizing and spacing
- Flexible layouts for different screen sizes
- Accessibility considerations throughout

**Maintenance Notes**:
- CSS custom properties enable consistent theming
- All interactive elements have focus styles
- High contrast mode support included
- Performance optimized with efficient selectors

### index.css
**Purpose**: Base CSS reset and design system foundation
**Responsibilities**:
- CSS reset and normalization
- Design system variables
- Base typography and element styling
- Utility classes
- Accessibility foundations

**Design System Variables**:
```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-color: #4ecdc4;
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: blur(10px);
}
```

**Base Styles**:
- Box-sizing reset to border-box
- Full viewport sizing (100vw/100vh)
- Overflow hidden for immersive experience
- Smooth font rendering optimizations

**Typography System**:
- Heading hierarchy (h1-h6) with consistent spacing
- Body text with optimal line height
- Font weight variations for emphasis
- Responsive font sizing

**Utility Classes**:
- `.glass`: Glass morphism effect
- `.gradient-primary/secondary`: Background gradients
- `.flex`, `.flex-column`: Layout utilities
- `.text-center`: Text alignment
- `.gap-1/2/3`: Spacing utilities

**Animation System**:
- `.fade-in`: Entrance animation
- `.slide-up`: Upward slide animation
- Smooth transitions on interactive elements
- Reduced motion support for accessibility

**Accessibility Features**:
- High contrast mode support
- Focus visible styles for keyboard navigation
- Screen reader friendly markup
- Reduced motion preferences respected

**Maintenance Notes**:
- Design tokens centralized in CSS custom properties
- Utility classes follow consistent naming convention
- All animations respect user motion preferences
- Color contrast meets WCAG AA standards

## Integration Patterns

### State Flow
1. **Initialization**: main.tsx → App.tsx → Store initialization
2. **Rendering**: App.tsx coordinates all major components
3. **Updates**: State changes trigger re-renders throughout tree
4. **Persistence**: Progress automatically saved via Zustand middleware

### Style Architecture
1. **Base**: index.css provides foundation
2. **Layout**: App.css handles application structure
3. **Components**: Individual component styles in App.css
4. **Utilities**: Shared utility classes in index.css

### Performance Considerations
- CSS-in-JS avoided for better performance
- Styles loaded synchronously for immediate rendering
- Minimal JavaScript in main.tsx for fast startup
- Efficient CSS selectors throughout

## Development Guidelines

### Adding New Features
1. Update App.tsx for new major components
2. Add styles to appropriate CSS file
3. Consider responsive design implications
4. Test accessibility features
5. Update documentation

### Performance Optimization
- Monitor bundle size impact of new imports
- Use CSS custom properties for dynamic values
- Minimize layout thrashing with efficient CSS
- Consider lazy loading for non-critical features

### Accessibility Maintenance
- Test with keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Ensure focus management works properly