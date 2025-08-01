# 3D Environment Setup Guide

## Overview

This guide provides comprehensive instructions for setting up and configuring the Cellular Sleep Voyage 3D environment. The system uses React Three Fiber, Three.js, and custom components to create an immersive cellular biology experience.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn equivalent)
- **Browser**: Modern browser with WebGL 2.0 support
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Graphics**: Dedicated GPU recommended for optimal performance

### Browser Compatibility
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

### WebGL Support Check
```javascript
// Check WebGL support
function checkWebGLSupport() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  return !!gl;
}

if (!checkWebGLSupport()) {
  console.error('WebGL not supported');
}
```

## Installation

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/jalabulajunx/cellular-sleep-voyage.git
cd cellular-sleep-voyage

# Install dependencies
npm install

# Verify installation
npm run build
```

### 2. Development Environment
```bash
# Start development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

### 3. Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Core Architecture

### Component Hierarchy
```
App.tsx
├── Canvas (React Three Fiber)
│   ├── SceneManager
│   │   └── CellularEnvironment
│   │       ├── CameraController
│   │       ├── EnvironmentalLighting
│   │       ├── TouchControls
│   │       │   └── InteractionControls
│   │       │       └── group
│   │       │           ├── CellMembrane
│   │       │           ├── CellularCityDistricts
│   │       │           ├── AtmosphericEffects
│   │       │           ├── CityInfrastructure
│   │       │           ├── NavigationAids
│   │       │           ├── MultiLevelZoom
│   │       │           └── VesselControlSystem
│   │       └── TouchUI
│   └── VesselUI (Outside Canvas)
└── UI Overlays (Outside Canvas)
    ├── DraggableHUD Components
    ├── NotificationSystem
    └── Tutorial/Help Systems
```

### Key Technologies
- **React Three Fiber**: React renderer for Three.js
- **Three.js**: 3D graphics library
- **Zustand**: State management
- **React Spring**: Animation library
- **TypeScript**: Type safety and development experience

## Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
# Development settings
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG=true
VITE_PERFORMANCE_MONITORING=true

# Asset settings
VITE_ASSET_BASE_URL=/assets
VITE_ENABLE_ASSET_CACHING=true

# Feature flags
VITE_ENABLE_VESSEL_NAVIGATION=true
VITE_ENABLE_ADVANCED_LIGHTING=true
VITE_ENABLE_PARTICLE_EFFECTS=true
```

### Performance Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'three': ['three'],
          'vendor': ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  }
});
```

## 3D Scene Setup

### 1. Basic Scene Configuration
```typescript
// SceneManager.tsx
import { Canvas } from '@react-three/fiber';

<Canvas
  style={{ width: '100%', height: '100%' }}
  shadows
  gl={{ 
    antialias: true, 
    alpha: false,
    powerPreference: "high-performance"
  }}
  camera={{
    position: [12, 8, 12],
    fov: 75,
    near: 0.1,
    far: 1000
  }}
>
  <SceneManager cameraRef={cameraRef}>
    <CellularEnvironment chapterId={currentChapter} />
  </SceneManager>
</Canvas>
```

### 2. Lighting Setup
```typescript
// EnvironmentalLighting.tsx
function EnvironmentalLighting({ chapterId }: { chapterId: number }) {
  const lightingConfig = getLightingConfig(chapterId);
  
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight 
        color={lightingConfig.ambient.color} 
        intensity={lightingConfig.ambient.intensity} 
      />
      
      {/* Directional light with shadows */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Point lights for atmosphere */}
      <pointLight position={[0, 0, 0]} intensity={0.5} distance={10} />
    </>
  );
}
```

### 3. Asset Loading System
```typescript
// Asset loading configuration
const assetConfig = {
  formats: ['gltf', 'glb', 'obj'],
  textureFormats: ['webp', 'png', 'jpg'],
  compressionEnabled: true,
  lazyLoading: true,
  cacheEnabled: true
};

// Preload critical assets
const preloadAssets = async () => {
  const criticalAssets = [
    'mitochondria-model.glb',
    'nucleus-model.glb',
    'cell-membrane-texture.webp'
  ];
  
  await Promise.all(
    criticalAssets.map(asset => assetLoadingSystem.loadAsset(asset))
  );
};
```

## Chapter Configuration

### Chapter-Specific Settings
```typescript
// Chapter configuration
const chapterConfigs = {
  1: {
    name: "Cellular City Overview",
    camera: { position: [12, 8, 12], target: [0, 0, 0] },
    lighting: { ambient: 0.6, directional: 0.8 },
    organelles: ['all'],
    vesselEnabled: true,
    boundaries: { radius: 16 }
  },
  2: {
    name: "Mitochondria Power Plants",
    camera: { position: [8, 6, 8], target: [0, 0, 0] },
    lighting: { ambient: 0.4, directional: 1.0 },
    organelles: ['mitochondria', 'nucleus', 'er'],
    vesselEnabled: true,
    boundaries: { radius: 12 }
  },
  3: {
    name: "Sleep and Cellular Damage",
    camera: { position: [10, 5, 10], target: [0, 0, 0] },
    lighting: { ambient: 0.3, directional: 0.6 },
    organelles: ['mitochondria', 'nucleus'],
    vesselEnabled: true,
    boundaries: { radius: 10 }
  }
};
```

### Dynamic Chapter Loading
```typescript
// Chapter management
export function useChapterManager(chapterId: number) {
  const [chapterConfig, setChapterConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadChapter = async () => {
      setIsLoading(true);
      
      // Load chapter configuration
      const config = chapterConfigs[chapterId];
      
      // Preload chapter-specific assets
      await preloadChapterAssets(chapterId);
      
      setChapterConfig(config);
      setIsLoading(false);
    };
    
    loadChapter();
  }, [chapterId]);
  
  return { chapterConfig, isLoading };
}
```

## Performance Optimization

### 1. Level of Detail (LOD)
```typescript
// LOD implementation
function OptimizedOrganelle({ distance, type, ...props }) {
  const geometry = useMemo(() => {
    if (distance < 5) return highDetailGeometry;
    if (distance < 15) return mediumDetailGeometry;
    return lowDetailGeometry;
  }, [distance]);
  
  return (
    <mesh geometry={geometry} {...props}>
      <meshStandardMaterial />
    </mesh>
  );
}
```

### 2. Frustum Culling
```typescript
// Automatic frustum culling
function CulledObject({ position, children }) {
  const meshRef = useRef();
  const [visible, setVisible] = useState(true);
  
  useFrame(({ camera }) => {
    if (meshRef.current) {
      const frustum = new THREE.Frustum();
      frustum.setFromProjectionMatrix(
        new THREE.Matrix4().multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse
        )
      );
      
      setVisible(frustum.containsPoint(position));
    }
  });
  
  return visible ? <group ref={meshRef}>{children}</group> : null;
}
```

### 3. Memory Management
```typescript
// Asset disposal
export function useAssetCleanup() {
  useEffect(() => {
    return () => {
      // Dispose of geometries
      geometryCache.forEach(geometry => geometry.dispose());
      
      // Dispose of materials
      materialCache.forEach(material => material.dispose());
      
      // Dispose of textures
      textureCache.forEach(texture => texture.dispose());
      
      // Clear caches
      geometryCache.clear();
      materialCache.clear();
      textureCache.clear();
    };
  }, []);
}
```

## Testing Setup

### 1. Unit Tests
```typescript
// Component testing
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { CellularEnvironment } from '../CellularEnvironment';

describe('CellularEnvironment', () => {
  test('renders without crashing', () => {
    render(
      <Canvas>
        <CellularEnvironment chapterId={1} />
      </Canvas>
    );
  });
  
  test('loads correct chapter configuration', () => {
    const { getByTestId } = render(
      <Canvas>
        <CellularEnvironment chapterId={2} />
      </Canvas>
    );
    
    expect(getByTestId('chapter-indicator')).toHaveTextContent('2');
  });
});
```

### 2. Performance Testing
```typescript
// Performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    drawCalls: 0
  });
  
  useFrame(() => {
    const info = renderer.info;
    setMetrics({
      fps: Math.round(1000 / deltaTime),
      memory: performance.memory?.usedJSHeapSize || 0,
      drawCalls: info.render.calls
    });
  });
  
  return metrics;
}
```

### 3. Visual Regression Testing
```typescript
// Screenshot comparison
import { takeScreenshot } from './test-utils';

describe('Visual Regression', () => {
  test('cellular environment renders correctly', async () => {
    const screenshot = await takeScreenshot('cellular-environment');
    expect(screenshot).toMatchImageSnapshot();
  });
});
```

## Deployment

### 1. Production Build
```bash
# Optimize for production
npm run build

# Analyze bundle size
npm run analyze

# Deploy to static hosting
npm run deploy
```

### 2. CDN Configuration
```javascript
// Asset optimization
const assetConfig = {
  images: {
    formats: ['webp', 'avif', 'png'],
    sizes: [256, 512, 1024, 2048],
    quality: 85
  },
  models: {
    compression: 'draco',
    optimization: 'aggressive'
  }
};
```

### 3. Monitoring
```typescript
// Error tracking
import { captureException } from '@sentry/react';

function ErrorBoundary({ children }) {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === 'measure') {
      analytics.track('performance', {
        name: entry.name,
        duration: entry.duration
      });
    }
  });
});
```

## Troubleshooting

### Common Issues

#### WebGL Context Lost
```typescript
// Handle context loss
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  console.warn('WebGL context lost');
  // Attempt to restore
  setTimeout(() => {
    canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false });
  }, 1000);
});
```

#### Memory Leaks
```typescript
// Proper cleanup
useEffect(() => {
  return () => {
    // Dispose Three.js objects
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  };
}, []);
```

#### Performance Issues
```typescript
// Performance debugging
const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();
  
  // Render scene
  renderer.render(scene, camera);
  
  stats.end();
  requestAnimationFrame(animate);
}
```

## Best Practices

### 1. Component Organization
- Keep components focused and single-purpose
- Use custom hooks for complex logic
- Implement proper error boundaries
- Follow React Three Fiber conventions

### 2. Performance Guidelines
- Use `useMemo` for expensive calculations
- Implement LOD for complex models
- Enable frustum culling for large scenes
- Monitor memory usage and dispose resources

### 3. Accessibility
- Provide keyboard navigation alternatives
- Include screen reader support
- Implement high contrast mode
- Support reduced motion preferences

### 4. Testing Strategy
- Unit test individual components
- Integration test user interactions
- Performance test on target devices
- Visual regression test critical views

## Resources

### Documentation
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Specification](https://www.khronos.org/webgl/)

### Tools
- [Three.js Editor](https://threejs.org/editor/)
- [Blender](https://www.blender.org/) - 3D modeling
- [Draco Compression](https://github.com/google/draco) - Model optimization

### Community
- [React Three Fiber Discord](https://discord.gg/ZZjjNvJ)
- [Three.js Forum](https://discourse.threejs.org/)
- [WebGL Community](https://www.khronos.org/webgl/wiki/)