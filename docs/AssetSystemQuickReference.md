# Asset System Quick Reference

## Essential Commands

### Basic Setup
```typescript
import { assetManager, assetPreloader, assetQualityManager } from './utils';

// Initialize system
await assetManager.initialize();

// Load chapter assets
await assetManager.loadChapterAssets(1);
```

### Getting Assets
```typescript
// 3D Models
const model = await assetManager.getOrganelleModel('mitochondria');
scene.add(model);

// Textures
const texture = await assetManager.getOrganelleTexture('nucleus');
material.map = texture;

// Scientific Illustrations
const diagram = await assetManager.getScientificAsset('cell-overview');
```

### Quality Management
```typescript
// Check current quality
const quality = assetQualityManager.getCurrentQuality(); // 'low' | 'medium' | 'high'

// Set quality manually
assetQualityManager.setQuality('high');

// Set target performance
assetQualityManager.setTargetFPS(30);
```

### Performance Monitoring
```typescript
// Get performance metrics
const metrics = performanceMonitor.getMetrics();
console.log('FPS:', metrics.fps);
console.log('Memory:', metrics.memoryUsage);

// Get performance summary
const summary = performanceMonitor.getPerformanceSummary();
console.log('Status:', summary.status); // 'excellent' | 'good' | 'fair' | 'poor'
```

### Cache Management
```typescript
// Check cache status
const status = assetManager.getCacheStatus();
console.log('Memory Usage:', status.memoryUsageMB);
console.log('Asset Count:', status.size);

// Clear cache
assetManager.clearCache();
```

## Debug Console Commands

Add to browser console for debugging:

```javascript
// Asset debugging
window.debug = {
  // Asset status
  assets: () => assetManager.getCacheStatus(),
  
  // Performance metrics
  perf: () => performanceMonitor.getMetrics(),
  
  // Quality info
  quality: () => assetQualityManager.getCurrentQuality(),
  
  // Clear cache
  clear: () => assetManager.clearCache(),
  
  // Force quality
  setQuality: (level) => assetQualityManager.setQuality(level)
};
```

## Common Issues & Quick Fixes

### Assets Not Loading
```typescript
// Check if system is initialized
if (!assetManager.isInitialized()) {
  await assetManager.initialize();
}

// Clear cache and reload
assetManager.clearCache();
await assetManager.loadChapterAssets(chapterId);
```

### Poor Performance
```typescript
// Reduce quality
assetQualityManager.setQuality('low');

// Clear unused assets
assetManager.clearCache();

// Check performance bottlenecks
const summary = performanceMonitor.getPerformanceSummary();
console.log('Bottlenecks:', summary.bottlenecks);
```

### High Memory Usage
```typescript
// Check memory status
const status = assetManager.getCacheStatus();
if (status.utilizationPercent > 80) {
  assetManager.clearCache();
}

// Force garbage collection (if available)
if (window.gc) window.gc();
```

## Asset Types & IDs

### Organelle Types
- `'mitochondria'` - Power plants
- `'nucleus'` - Control center
- `'endoplasmic-reticulum'` - Manufacturing
- `'golgi-apparatus'` - Shipping
- `'ribosomes'` - Protein factories
- `'cell-membrane'` - Cell boundary
- `'cytoskeleton'` - Structure

### Scientific Asset IDs
- `'cell-overview'` - Complete cell diagram
- `'mitochondria-external'` - External mitochondria view
- `'mitochondria-internal'` - Internal structure
- `'electron-transport-chain'` - Energy production
- `'atp-molecule'` - Energy currency
- `'ros-particles'` - Toxic sparks
- `'damaged-cell'` - Cellular damage
- `'repair-mechanisms'` - Sleep repair

## Quality Levels

### Low Quality (30+ FPS)
- 256px textures
- <1000 triangles
- Basic materials
- Minimal effects

### Medium Quality (45+ FPS)
- 512px textures
- 1000-5000 triangles
- Standard materials
- Moderate effects

### High Quality (60+ FPS)
- 1024px+ textures
- 5000+ triangles
- Advanced materials
- Full effects

## Chapter Asset Loading

### Chapter 1: Cell Overview
```typescript
await assetManager.loadChapterAssets(1);
// Loads: cell-overview, mitochondria-external, nucleus
```

### Chapter 2: Energy Production
```typescript
await assetManager.loadChapterAssets(2);
// Loads: mitochondria-internal, electron-transport-chain, atp-molecule
```

### Chapter 3: Sleep Science
```typescript
await assetManager.loadChapterAssets(3);
// Loads: ros-particles, damaged-cell, sleep-cycle
```

## Error Handling

```typescript
try {
  await assetManager.loadChapterAssets(chapterId);
} catch (error) {
  console.error('Asset loading failed:', error);
  
  // Fallback to placeholder assets
  await assetManager.loadPlaceholderAssets();
}
```

## Performance Tips

1. **Preload Critical Assets**: Use `assetPreloader.preloadTutorialAssets()`
2. **Monitor Performance**: Subscribe to performance updates
3. **Use Appropriate Quality**: Don't force high quality on low-end devices
4. **Clear Unused Assets**: Regular cache cleanup
5. **Lazy Load**: Let the system load assets on demand

## Memory Management

```typescript
// Monitor memory usage
const checkMemory = () => {
  const status = assetManager.getCacheStatus();
  if (status.utilizationPercent > 90) {
    console.warn('High memory usage:', status.memoryUsageMB, 'MB');
    assetManager.clearCache();
  }
};

// Check every 30 seconds
setInterval(checkMemory, 30000);
```

This quick reference covers the most common operations and troubleshooting steps for the asset system.