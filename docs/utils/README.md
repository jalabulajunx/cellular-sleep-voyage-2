# Utilities Documentation

This directory contains utility functions, helpers, and shared functionality used throughout the application.

## File Overview

### index.ts
**Purpose**: Core utility functions for math, assets, performance, education, and accessibility
**Organization**: Grouped by functional area with clear separation of concerns

## Utility Categories

### Math Utilities (vector3)
**Purpose**: 3D vector mathematics for Three.js integration

#### vector3.create(x, y, z)
- **Purpose**: Create Vector3 objects with default values
- **Parameters**: x, y, z coordinates (default: 0)
- **Returns**: Vector3 object
- **Usage**: `const pos = vector3.create(1, 2, 3);`

#### vector3.distance(a, b)
- **Purpose**: Calculate Euclidean distance between two points
- **Parameters**: Two Vector3 objects
- **Returns**: Distance as number
- **Usage**: Proximity detection, collision detection

#### vector3.normalize(v)
- **Purpose**: Convert vector to unit length
- **Parameters**: Vector3 object
- **Returns**: Normalized Vector3
- **Usage**: Direction calculations, camera movements

#### vector3.add(a, b) / vector3.multiply(v, scalar)
- **Purpose**: Basic vector arithmetic
- **Usage**: Position calculations, transformations

**Maintenance Notes**:
- All functions handle zero-length vectors safely
- Compatible with Three.js Vector3 objects
- Immutable operations (don't modify input vectors)

### Asset Loading Utilities (assetLoader)
**Purpose**: Asset management and loading system

#### assetLoader.loadTexture(path)
- **Purpose**: Load texture assets asynchronously
- **Parameters**: Asset file path
- **Returns**: Promise<string> (currently returns path)
- **Future**: Will implement actual texture loading

#### assetLoader.loadModel(path)
- **Purpose**: Load 3D model assets
- **Parameters**: Model file path
- **Returns**: Promise<any>
- **Status**: Placeholder for future implementation

#### assetLoader.preloadAssets(paths)
- **Purpose**: Batch preload assets for performance
- **Parameters**: Array of asset paths
- **Usage**: Chapter initialization, performance optimization

**Maintenance Notes**:
- Currently returns placeholders
- Ready for integration with actual asset loading
- Supports batch operations for efficiency

### Performance Utilities (performance)
**Purpose**: Performance monitoring and device optimization

#### performance.measureFPS()
- **Purpose**: Monitor frame rate performance
- **Returns**: Current FPS (placeholder: 60)
- **Usage**: Performance debugging, quality adjustment

#### performance.optimizeForDevice()
- **Purpose**: Detect device capabilities and recommend quality level
- **Returns**: 'high' | 'medium' | 'low'
- **Logic**: 
  - Checks WebGL support
  - Analyzes GPU vendor/renderer
  - Intel graphics → 'medium'
  - Other/unknown → 'high'
  - No WebGL → 'low'

**Maintenance Notes**:
- Extend device detection logic as needed
- Add more sophisticated GPU benchmarking
- Consider memory and CPU detection

### Educational Utilities (education)
**Purpose**: Learning-focused helper functions

#### education.calculateLearningProgress(discovery, scientist, sleep)
- **Purpose**: Calculate overall learning progress percentage
- **Parameters**: Point totals for each category
- **Returns**: Progress ratio (0-1)
- **Configuration**: Max points = 1000 (adjustable)

#### education.getAgeAppropriateExplanation(content, age)
- **Purpose**: Select appropriate explanation level
- **Parameters**: Content object, user age (default: 10)
- **Logic**:
  - Age ≤ 8: Basic analogies
  - Age ≤ 12: Intermediate biological processes
  - Age > 12: Advanced molecular mechanisms
- **Returns**: Age-appropriate explanation string

#### education.formatScientificTerm(term, simplified)
- **Purpose**: Convert scientific terms to kid-friendly language
- **Parameters**: Scientific term, simplification flag
- **Mappings**:
  - 'mitochondria' → 'power plants'
  - 'electron transport chain' → 'assembly line'
  - 'reactive oxygen species' → 'toxic sparks'
  - 'adenosine triphosphate' → 'energy batteries'

**Maintenance Notes**:
- Add new term mappings as content expands
- Adjust age thresholds based on user testing
- Consider localization for different languages

### Animation Utilities (animation)
**Purpose**: Smooth animation and interpolation functions

#### animation.easeInOut(t)
- **Purpose**: Smooth easing function for animations
- **Parameters**: Time parameter (0-1)
- **Returns**: Eased value
- **Formula**: Quadratic ease-in-out curve

#### animation.lerp(start, end, t)
- **Purpose**: Linear interpolation between values
- **Parameters**: Start value, end value, interpolation factor
- **Usage**: Smooth transitions, camera movements

#### animation.lerpVector3(start, end, t)
- **Purpose**: Vector3 linear interpolation
- **Parameters**: Start Vector3, end Vector3, interpolation factor
- **Usage**: 3D object animations, camera paths

**Maintenance Notes**:
- Add more easing functions as needed (cubic, elastic, etc.)
- Consider performance for high-frequency animations
- Maintain consistency with Three.js animation patterns

### Storage Utilities (storage)
**Purpose**: Local storage management with error handling

#### storage.save(key, data)
- **Purpose**: Save data to localStorage with error handling
- **Parameters**: Storage key, data object
- **Features**: JSON serialization, error catching

#### storage.load(key, defaultValue)
- **Purpose**: Load data from localStorage with fallback
- **Parameters**: Storage key, default value
- **Returns**: Parsed data or default value
- **Features**: Error handling, type preservation

#### storage.remove(key)
- **Purpose**: Remove item from localStorage safely
- **Parameters**: Storage key
- **Features**: Error handling

**Maintenance Notes**:
- All functions handle localStorage unavailability
- Consider storage quota limits
- Add data validation for loaded content

### Accessibility Utilities (accessibility)
**Purpose**: Accessibility and inclusive design helpers

#### accessibility.announceToScreenReader(message)
- **Purpose**: Announce messages to screen readers
- **Parameters**: Message string
- **Implementation**: Creates temporary ARIA live region
- **Usage**: Dynamic content changes, notifications

#### accessibility.addKeyboardNavigation(element, onActivate)
- **Purpose**: Add keyboard navigation to elements
- **Parameters**: HTML element, activation callback
- **Features**: 
  - Adds tabindex for focus
  - Handles Enter and Space key activation
  - Prevents default browser behavior

**Maintenance Notes**:
- Test with actual screen readers
- Follow WCAG 2.1 AA guidelines
- Consider different keyboard navigation patterns

## Integration Patterns

### Component Usage
```typescript
import { vector3, education, animation } from '../utils';

// Vector math
const distance = vector3.distance(pos1, pos2);

// Educational content
const explanation = education.getAgeAppropriateExplanation(content, 10);

// Smooth animations
const eased = animation.easeInOut(progress);
```

### Store Integration
```typescript
// Progress calculation
const progress = education.calculateLearningProgress(
  discoveryPoints, 
  scientistPoints, 
  sleepPoints
);

// Persistent storage
storage.save('user-preferences', preferences);
const saved = storage.load('user-preferences', defaultPrefs);
```

## Future Enhancements

### Planned Additions
- Advanced GPU benchmarking
- More sophisticated asset loading
- Additional easing functions
- Localization utilities
- Performance profiling tools

### Optimization Opportunities
- Memoize expensive calculations
- Add caching for repeated operations
- Implement lazy loading for utilities
- Consider Web Workers for heavy computations
## Asset
 Integration Pipeline

The asset integration pipeline is a comprehensive system for loading, optimizing, and managing all visual assets including 3D models, textures, and scientific illustrations.

### Architecture Overview

```
AssetManager (Main Interface)
├── AssetIntegrationPipeline (Orchestrator)
│   ├── AssetPipeline (SVG/Image Processing)
│   ├── LazyAssetLoader (On-demand Loading)
│   ├── MultiResolutionManager (Zoom Level Support)
│   ├── QualityController (Performance Adaptation)
│   └── LoadingQueue (Priority Management)
├── AssetCache (Memory Management)
├── TextureGenerator (Procedural Textures)
├── Enhanced3DAssetGenerator (3D Models)
└── PlaceholderAssetManager (Development Assets)
```

### Key Features

- **SVG to WebGL Conversion**: Converts scientific SVG illustrations to optimized WebGL textures
- **Multi-Resolution Support**: Generates multiple resolution versions for different zoom levels (256px to 2048px)
- **Lazy Loading**: Assets are loaded on-demand to improve initial loading performance
- **Memory Management**: Intelligent caching with automatic cleanup based on usage patterns
- **Quality Adaptation**: Automatically adjusts asset quality based on device performance
- **Chapter Optimization**: Preloads critical assets for each chapter while lazy-loading others
- **Asset Compression**: Reduces file sizes while maintaining visual quality
- **Performance Monitoring**: Tracks FPS and adjusts quality dynamically

### Core Components

#### AssetManager
**Purpose**: Main interface for all asset operations
**Key Methods**:
- `initialize()`: Initialize the asset system
- `loadChapterAssets(chapterId, onProgress)`: Load chapter-specific assets
- `getOrganelleTexture(type, zoomLevel)`: Get texture with quality selection
- `getOrganelleModel(type)`: Get 3D model for organelle
- `getScientificAsset(assetId)`: Get scientific illustration
- `getCacheStatus()`: Monitor memory usage

#### AssetIntegrationPipeline
**Purpose**: Orchestrates the entire asset processing workflow
**Key Methods**:
- `integrateAssets(assets, options)`: Process assets with multiple resolutions and quality levels
- `optimizeForChapter(chapterId, assets)`: Chapter-specific optimization

#### MultiResolutionManager
**Purpose**: Generates and manages multiple resolution versions of assets
**Features**:
- Automatic resolution selection based on zoom level
- Smooth transitions between resolution levels
- Memory-efficient mipmap generation

#### QualityController
**Purpose**: Adapts asset quality based on device performance
**Features**:
- Automatic device capability detection
- Dynamic quality adjustment based on FPS
- Three quality levels: low, medium, high

### Usage Examples

```typescript
import { 
  assetManager, 
  assetPreloader,
  assetQualityManager,
  getOrganelleModel, 
  getOrganelleTexture 
} from '../utils';

// Initialize the asset system
await assetManager.initialize();

// Load assets for a specific chapter with progress tracking
await assetManager.loadChapterAssets(1, (progress) => {
  console.log(`Loading progress: ${progress}%`);
});

// Preload critical assets for better performance
await assetPreloader.preloadTutorialAssets();

// Get a 3D model for an organelle
const mitochondriaModel = await getOrganelleModel('mitochondria');
scene.add(mitochondriaModel);

// Get a texture with automatic quality selection
const nucleusTexture = await getOrganelleTexture('nucleus', zoomLevel);

// Get multi-resolution versions for different zoom levels
const multiResTextures = await assetManager.getMultiResolutionAsset(
  'mitochondria-external',
  [256, 512, 1024, 2048]
);

// Adjust quality based on performance
assetQualityManager.setQuality('high'); // 'low', 'medium', 'high'

// Monitor cache usage
const cacheStatus = assetManager.getCacheStatus();
console.log(`Memory usage: ${cacheStatus.memoryUsageMB}MB`);
```

### Chapter-Specific Asset Optimization

Each chapter has optimized asset loading patterns:

```typescript
// Chapter 1: Cell Overview - Basic cellular structures
const chapter1Assets = [
  'cell-overview', 'mitochondria-external', 'nucleus'
];

// Chapter 2: Mitochondrial Details - Energy production
const chapter2Assets = [
  'mitochondria-internal', 'electron-transport-chain', 'atp-molecule'
];

// Chapter 3: Sleep Science - ROS and damage
const chapter3Assets = [
  'ros-particles', 'damaged-cell', 'sleep-cycle'
];

// Chapter 4: Repair Mechanisms - Sleep benefits
const chapter4Assets = [
  'repair-mechanisms', 'healthy-cell', 'sleep-stages'
];

// Chapter 5: Evolution - Species comparison
const chapter5Assets = [
  'fruit-fly', 'human-cell', 'evolutionary-timeline'
];
```

### Performance Optimization Features

#### Asset Compression
- Reduces texture sizes by up to 60%
- Maintains visual quality through smart compression
- Supports multiple compression levels

#### Batch Processing
- Loads multiple assets simultaneously
- Reduces network overhead
- Optimizes memory allocation

#### Texture Atlasing
- Combines small textures into single atlas
- Reduces draw calls
- Improves GPU performance

#### Memory Management
- LRU (Least Recently Used) cache eviction
- Memory usage monitoring and limits
- Automatic asset disposal
- Cache size optimization

### Quality Levels

#### Low Quality
- 256px textures
- Reduced geometry complexity
- Basic materials
- Target: 30+ FPS on low-end devices

#### Medium Quality
- 512px textures
- Standard geometry
- Enhanced materials with basic lighting
- Target: 45+ FPS on mid-range devices

#### High Quality
- 1024px+ textures
- Full geometry detail
- Advanced materials with multiple maps
- Target: 60+ FPS on high-end devices

### Error Handling and Fallbacks

- **Graceful Fallback**: Falls back to placeholder assets if loading fails
- **Retry Mechanism**: Automatically retries failed loads with exponential backoff
- **Memory Pressure**: Handles low memory situations by reducing quality
- **Network Recovery**: Recovers from network errors and continues loading

### Development Tools

```typescript
// Asset debugging
console.log(assetManager.getCacheStatus());

// Performance monitoring
const fps = performanceMonitor.getAverageFPS();

// Quality testing
assetQualityManager.setQuality('low'); // Test low-end devices

// Cache management
assetManager.clearCache(); // Free memory
```

### Integration with React Components

```typescript
// Example React component using the asset system
const OrganelleViewer: React.FC<{ type: OrganelleType }> = ({ type }) => {
  const [model, setModel] = useState<THREE.Mesh | null>(null);
  
  useEffect(() => {
    const loadModel = async () => {
      const organelleModel = await getOrganelleModel(type);
      setModel(organelleModel);
    };
    loadModel();
  }, [type]);
  
  return model ? <primitive object={model} /> : null;
};
```

### Maintenance Guidelines

#### Adding New Assets
1. Add asset definition to `placeholderAssets` or scientific asset registry
2. Update chapter asset mappings if needed
3. Test loading and rendering
4. Verify memory usage and performance impact

#### Performance Monitoring
- Monitor cache hit rates and memory usage
- Track loading times across different network conditions
- Test on various device capabilities
- Adjust quality thresholds based on user feedback

#### Quality Optimization
- Profile asset loading performance regularly
- Update compression algorithms as needed
- Optimize texture atlasing for new assets
- Balance quality vs. performance trade-offs

This asset integration pipeline provides a robust foundation for managing all visual assets in the Cellular Sleep Voyage application, ensuring optimal performance across different devices while maintaining high visual quality.