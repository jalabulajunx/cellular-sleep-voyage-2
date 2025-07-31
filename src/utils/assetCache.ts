import * as THREE from 'three';
import type { OrganelleType, ScientificAsset } from '../types';
import type { Enhanced3DAsset } from './enhanced3DAssets';

// Asset cache configuration
interface CacheConfig {
  maxMemoryMB: number;
  maxAssets: number;
  preloadPriority: OrganelleType[];
  compressionLevel: 'low' | 'medium' | 'high';
}

// Asset metadata for cache management
interface CachedAsset {
  asset: Enhanced3DAsset | ScientificAsset;
  lastAccessed: number;
  accessCount: number;
  memorySize: number;
  priority: number;
}

// Performance metrics
interface CacheMetrics {
  hitRate: number;
  missRate: number;
  memoryUsage: number;
  totalRequests: number;
  averageLoadTime: number;
}

export class AssetCache {
  private cache = new Map<string, CachedAsset>();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private loadingPromises = new Map<string, Promise<any>>();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxMemoryMB: 100,
      maxAssets: 50,
      preloadPriority: ['mitochondria', 'nucleus', 'cell-membrane'],
      compressionLevel: 'medium',
      ...config
    };

    this.metrics = {
      hitRate: 0,
      missRate: 0,
      memoryUsage: 0,
      totalRequests: 0,
      averageLoadTime: 0
    };
  }

  // Get asset from cache or load if not present
  async getAsset<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    // Check cache first
    if (this.cache.has(key)) {
      const cached = this.cache.get(key)!;
      cached.lastAccessed = Date.now();
      cached.accessCount++;
      this.metrics.hitRate = this.calculateHitRate();
      return cached.asset as T;
    }

    // Check if already loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)! as Promise<T>;
    }

    // Load asset
    const loadingPromise = this.loadAsset(key, loader);
    this.loadingPromises.set(key, loadingPromise);

    try {
      const asset = await loadingPromise;
      const loadTime = performance.now() - startTime;
      this.updateAverageLoadTime(loadTime);
      
      this.loadingPromises.delete(key);
      this.metrics.missRate = this.calculateMissRate();
      
      return asset;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  // Load and cache asset
  private async loadAsset<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const asset = await loader();
    const memorySize = this.estimateMemorySize(asset);
    const priority = this.calculatePriority(key);

    // Check if we need to free up space
    await this.ensureCapacity(memorySize);

    // Cache the asset
    this.cache.set(key, {
      asset: asset as any,
      lastAccessed: Date.now(),
      accessCount: 1,
      memorySize,
      priority
    });

    this.updateMemoryUsage();
    return asset;
  }

  // Preload high-priority assets
  async preloadAssets(loaders: Map<string, () => Promise<any>>): Promise<void> {
    const priorityKeys = Array.from(loaders.keys()).sort((a, b) => {
      const aPriority = this.calculatePriority(a);
      const bPriority = this.calculatePriority(b);
      return bPriority - aPriority;
    });

    // Load assets in batches to avoid overwhelming the system
    const batchSize = 3;
    for (let i = 0; i < priorityKeys.length; i += batchSize) {
      const batch = priorityKeys.slice(i, i + batchSize);
      const batchPromises = batch.map(key => 
        this.getAsset(key, loaders.get(key)!)
      );
      
      await Promise.all(batchPromises);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Ensure cache has enough capacity
  private async ensureCapacity(requiredSize: number): Promise<void> {
    const maxMemoryBytes = this.config.maxMemoryMB * 1024 * 1024;
    
    while (
      (this.metrics.memoryUsage + requiredSize > maxMemoryBytes) ||
      (this.cache.size >= this.config.maxAssets)
    ) {
      const evicted = this.evictLeastUseful();
      if (!evicted) break; // No more assets to evict
    }
  }

  // Evict least useful asset based on LRU + priority
  private evictLeastUseful(): boolean {
    if (this.cache.size === 0) return false;

    let leastUsefulKey = '';
    let leastUsefulScore = Infinity;

    for (const [key, cached] of this.cache.entries()) {
      // Score based on recency, frequency, and priority
      const recencyScore = Date.now() - cached.lastAccessed;
      const frequencyScore = 1 / (cached.accessCount + 1);
      const priorityScore = 1 / (cached.priority + 1);
      
      const totalScore = recencyScore * frequencyScore * priorityScore;
      
      if (totalScore < leastUsefulScore) {
        leastUsefulScore = totalScore;
        leastUsefulKey = key;
      }
    }

    if (leastUsefulKey) {
      const evicted = this.cache.get(leastUsefulKey)!;
      this.disposeAsset(evicted.asset);
      this.cache.delete(leastUsefulKey);
      this.updateMemoryUsage();
      return true;
    }

    return false;
  }

  // Estimate memory usage of an asset
  private estimateMemorySize(asset: any): number {
    if (asset && typeof asset === 'object') {
      if (asset.geometry && asset.material) {
        // Enhanced3DAsset
        const geometrySize = this.estimateGeometrySize(asset.geometry);
        const materialSize = this.estimateMaterialSize(asset.material);
        return geometrySize + materialSize;
      } else if (asset.filePath) {
        // ScientificAsset - estimate based on format
        switch (asset.format) {
          case 'svg': return 50 * 1024; // 50KB
          case 'png': return 500 * 1024; // 500KB
          case 'webp': return 200 * 1024; // 200KB
          default: return 100 * 1024; // 100KB
        }
      }
    }
    
    return 10 * 1024; // Default 10KB
  }

  // Estimate Three.js geometry memory usage
  private estimateGeometrySize(geometry: THREE.BufferGeometry): number {
    let size = 0;
    
    const attributes = geometry.attributes;
    for (const name in attributes) {
      const attribute = attributes[name];
      size += attribute.array.byteLength;
    }
    
    if (geometry.index) {
      size += geometry.index.array.byteLength;
    }
    
    return size;
  }

  // Estimate Three.js material memory usage
  private estimateMaterialSize(material: THREE.Material): number {
    let size = 1024; // Base material size
    
    if (material instanceof THREE.MeshStandardMaterial) {
      if (material.map) size += this.estimateTextureSize(material.map);
      if (material.normalMap) size += this.estimateTextureSize(material.normalMap);
      if (material.roughnessMap) size += this.estimateTextureSize(material.roughnessMap);
      if (material.metalnessMap) size += this.estimateTextureSize(material.metalnessMap);
    }
    
    return size;
  }

  // Estimate texture memory usage
  private estimateTextureSize(texture: THREE.Texture): number {
    if (texture.image) {
      const width = texture.image.width || 512;
      const height = texture.image.height || 512;
      const channels = 4; // RGBA
      return width * height * channels;
    }
    return 512 * 512 * 4; // Default 512x512 RGBA
  }

  // Calculate asset priority based on type and usage patterns
  private calculatePriority(key: string): number {
    let priority = 1;
    
    // Higher priority for organelles in preload list
    for (const organelleType of this.config.preloadPriority) {
      if (key.includes(organelleType)) {
        priority += 10;
        break;
      }
    }
    
    // Higher priority for enhanced assets
    if (key.includes('enhanced')) {
      priority += 5;
    }
    
    // Higher priority for textures
    if (key.includes('texture')) {
      priority += 3;
    }
    
    return priority;
  }

  // Dispose of asset resources
  private disposeAsset(asset: any): void {
    if (asset && typeof asset === 'object') {
      if (asset.geometry && typeof asset.geometry.dispose === 'function') {
        asset.geometry.dispose();
      }
      if (asset.material && typeof asset.material.dispose === 'function') {
        asset.material.dispose();
      }
      if (asset.texture && typeof asset.texture.dispose === 'function') {
        asset.texture.dispose();
      }
    }
  }

  // Update memory usage metrics
  private updateMemoryUsage(): void {
    let totalMemory = 0;
    for (const cached of this.cache.values()) {
      totalMemory += cached.memorySize;
    }
    this.metrics.memoryUsage = totalMemory;
  }

  // Calculate hit rate
  private calculateHitRate(): number {
    const hits = this.metrics.totalRequests - this.loadingPromises.size;
    return this.metrics.totalRequests > 0 ? hits / this.metrics.totalRequests : 0;
  }

  // Calculate miss rate
  private calculateMissRate(): number {
    return 1 - this.calculateHitRate();
  }

  // Update average load time
  private updateAverageLoadTime(newLoadTime: number): void {
    const alpha = 0.1; // Exponential moving average factor
    this.metrics.averageLoadTime = 
      this.metrics.averageLoadTime * (1 - alpha) + newLoadTime * alpha;
  }

  // Get cache metrics
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  // Get cache status
  getCacheStatus(): {
    size: number;
    memoryUsageMB: number;
    memoryLimitMB: number;
    utilizationPercent: number;
  } {
    return {
      size: this.cache.size,
      memoryUsageMB: this.metrics.memoryUsage / (1024 * 1024),
      memoryLimitMB: this.config.maxMemoryMB,
      utilizationPercent: (this.metrics.memoryUsage / (this.config.maxMemoryMB * 1024 * 1024)) * 100
    };
  }

  // Clear cache
  clear(): void {
    for (const cached of this.cache.values()) {
      this.disposeAsset(cached.asset);
    }
    this.cache.clear();
    this.loadingPromises.clear();
    this.updateMemoryUsage();
  }

  // Dispose of cache and all resources
  dispose(): void {
    this.clear();
  }
}

// Asset compression utilities
export class AssetCompressor {
  // Compress geometry by reducing vertex count
  static compressGeometry(
    geometry: THREE.BufferGeometry, 
    compressionLevel: 'low' | 'medium' | 'high'
  ): THREE.BufferGeometry {
    const reductionFactors = {
      low: 0.9,    // 10% reduction
      medium: 0.7, // 30% reduction
      high: 0.5    // 50% reduction
    };
    
    const factor = reductionFactors[compressionLevel];
    
    // Simple vertex reduction (in a real implementation, use proper mesh simplification)
    const positions = geometry.attributes.position;
    if (positions) {
      const originalCount = positions.count;
      const newCount = Math.floor(originalCount * factor);
      
      if (newCount < originalCount) {
        const newPositions = new Float32Array(newCount * 3);
        const step = originalCount / newCount;
        
        for (let i = 0; i < newCount; i++) {
          const sourceIndex = Math.floor(i * step) * 3;
          newPositions[i * 3] = positions.array[sourceIndex];
          newPositions[i * 3 + 1] = positions.array[sourceIndex + 1];
          newPositions[i * 3 + 2] = positions.array[sourceIndex + 2];
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
      }
    }
    
    return geometry;
  }

  // Compress texture by reducing resolution
  static compressTexture(
    texture: THREE.Texture, 
    compressionLevel: 'low' | 'medium' | 'high'
  ): THREE.Texture {
    const scalingFactors = {
      low: 0.8,    // 20% reduction
      medium: 0.6, // 40% reduction
      high: 0.4    // 60% reduction
    };
    
    const factor = scalingFactors[compressionLevel];
    
    if (texture.image && texture.image.width && texture.image.height) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      const newWidth = Math.floor(texture.image.width * factor);
      const newHeight = Math.floor(texture.image.height * factor);
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.drawImage(texture.image, 0, 0, newWidth, newHeight);
      
      const compressedTexture = new THREE.CanvasTexture(canvas);
      compressedTexture.wrapS = texture.wrapS;
      compressedTexture.wrapT = texture.wrapT;
      compressedTexture.repeat.copy(texture.repeat);
      
      return compressedTexture;
    }
    
    return texture;
  }
}

// Global asset cache instance
export const globalAssetCache = new AssetCache();