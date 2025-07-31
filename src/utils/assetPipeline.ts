import * as THREE from 'three';
import type { ScientificAsset } from '../types';

// Asset conversion and optimization pipeline
export class AssetPipeline {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private conversionCache = new Map<string, THREE.Texture>();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Convert SVG to WebGL texture
  async svgToTexture(
    svgContent: string, 
    size: number = 512,
    options: {
      generateMipmaps?: boolean;
      wrapS?: THREE.Wrapping;
      wrapT?: THREE.Wrapping;
      magFilter?: THREE.TextureFilter;
      minFilter?: THREE.TextureFilter;
    } = {}
  ): Promise<THREE.Texture> {
    const cacheKey = `svg-${this.hashString(svgContent)}-${size}`;
    
    if (this.conversionCache.has(cacheKey)) {
      return this.conversionCache.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      // Create SVG blob
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      // Create image element
      const img = new Image();
      img.onload = () => {
        try {
          // Set canvas size
          this.canvas.width = size;
          this.canvas.height = size;
          
          // Clear canvas
          this.ctx.clearRect(0, 0, size, size);
          
          // Draw SVG to canvas
          this.ctx.drawImage(img, 0, 0, size, size);
          
          // Create texture from canvas
          const texture = new THREE.CanvasTexture(this.canvas);
          
          // Apply options
          texture.generateMipmaps = options.generateMipmaps ?? true;
          texture.wrapS = options.wrapS ?? THREE.RepeatWrapping;
          texture.wrapT = options.wrapT ?? THREE.RepeatWrapping;
          texture.magFilter = (options.magFilter ?? THREE.LinearFilter) as THREE.MagnificationTextureFilter;
          texture.minFilter = options.minFilter ?? THREE.LinearMipmapLinearFilter;
          
          // Cache and cleanup
          this.conversionCache.set(cacheKey, texture);
          URL.revokeObjectURL(url);
          
          resolve(texture);
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };
      
      img.src = url;
    });
  }

  // Convert PNG/WebP to optimized texture
  async imageToTexture(
    imageUrl: string,
    options: {
      maxSize?: number;
      generateMipmaps?: boolean;
      compressionQuality?: number;
    } = {}
  ): Promise<THREE.Texture> {
    const cacheKey = `img-${imageUrl}-${JSON.stringify(options)}`;
    
    if (this.conversionCache.has(cacheKey)) {
      return this.conversionCache.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const maxSize = options.maxSize ?? 1024;
          let { width, height } = img;
          
          // Resize if necessary
          if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height);
            width *= scale;
            height *= scale;
          }
          
          // Set canvas size
          this.canvas.width = width;
          this.canvas.height = height;
          
          // Clear and draw
          this.ctx.clearRect(0, 0, width, height);
          this.ctx.drawImage(img, 0, 0, width, height);
          
          // Apply compression if specified
          if (options.compressionQuality && options.compressionQuality < 1) {
            const imageData = this.ctx.getImageData(0, 0, width, height);
            this.applyCompression(imageData, options.compressionQuality);
            this.ctx.putImageData(imageData, 0, 0);
          }
          
          // Create texture
          const texture = new THREE.CanvasTexture(this.canvas);
          texture.generateMipmaps = options.generateMipmaps ?? true;
          
          this.conversionCache.set(cacheKey, texture);
          resolve(texture);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = imageUrl;
    });
  }

  // Create texture atlas from multiple images
  async createTextureAtlas(
    images: { id: string; content: string | HTMLImageElement }[],
    atlasSize: number = 1024
  ): Promise<{
    texture: THREE.Texture;
    uvMappings: Map<string, { u: number; v: number; width: number; height: number }>;
  }> {
    const uvMappings = new Map();
    
    // Set canvas size
    this.canvas.width = atlasSize;
    this.canvas.height = atlasSize;
    this.ctx.clearRect(0, 0, atlasSize, atlasSize);
    
    // Simple grid packing (can be improved with better packing algorithms)
    const gridSize = Math.ceil(Math.sqrt(images.length));
    const cellSize = atlasSize / gridSize;
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const x = col * cellSize;
      const y = row * cellSize;
      
      try {
        let imgElement: HTMLImageElement;
        
        if (typeof image.content === 'string') {
          // Convert SVG string to image
          imgElement = await this.svgStringToImage(image.content);
        } else {
          imgElement = image.content;
        }
        
        // Draw to atlas
        this.ctx.drawImage(imgElement, x, y, cellSize, cellSize);
        
        // Store UV mapping
        uvMappings.set(image.id, {
          u: x / atlasSize,
          v: y / atlasSize,
          width: cellSize / atlasSize,
          height: cellSize / atlasSize
        });
      } catch (error) {
        console.warn(`Failed to add ${image.id} to atlas:`, error);
      }
    }
    
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.generateMipmaps = true;
    
    return { texture, uvMappings };
  }

  // Generate multiple resolution versions
  async generateMipLevels(
    baseTexture: THREE.Texture,
    levels: number[] = [512, 256, 128, 64]
  ): Promise<Map<number, THREE.Texture>> {
    const mipLevels = new Map<number, THREE.Texture>();
    
    if (!baseTexture.image) {
      throw new Error('Base texture has no image data');
    }
    
    for (const size of levels) {
      this.canvas.width = size;
      this.canvas.height = size;
      this.ctx.clearRect(0, 0, size, size);
      this.ctx.drawImage(baseTexture.image, 0, 0, size, size);
      
      const mipTexture = new THREE.CanvasTexture(this.canvas);
      mipTexture.generateMipmaps = false; // We're manually creating mips
      mipLevels.set(size, mipTexture);
    }
    
    return mipLevels;
  }

  // Optimize texture for different quality levels
  optimizeTexture(
    texture: THREE.Texture,
    qualityLevel: 'low' | 'medium' | 'high'
  ): THREE.Texture {
    const optimized = texture.clone();
    
    switch (qualityLevel) {
      case 'low':
        optimized.minFilter = THREE.LinearFilter;
        optimized.magFilter = THREE.LinearFilter;
        optimized.generateMipmaps = false;
        break;
      case 'medium':
        optimized.minFilter = THREE.LinearMipmapLinearFilter;
        optimized.magFilter = THREE.LinearFilter;
        optimized.generateMipmaps = true;
        break;
      case 'high':
        optimized.minFilter = THREE.LinearMipmapLinearFilter;
        optimized.magFilter = THREE.LinearFilter;
        optimized.generateMipmaps = true;
        optimized.anisotropy = 4;
        break;
    }
    
    return optimized;
  }

  // Batch process multiple assets
  async batchProcess(
    assets: ScientificAsset[],
    options: {
      targetSize?: number;
      qualityLevel?: 'low' | 'medium' | 'high';
      createAtlas?: boolean;
      onProgress?: (processed: number, total: number) => void;
    } = {}
  ): Promise<Map<string, THREE.Texture>> {
    const results = new Map<string, THREE.Texture>();
    const { targetSize = 512, qualityLevel = 'medium', onProgress } = options;
    
    if (options.createAtlas) {
      // Create texture atlas
      const atlasImages = await Promise.all(
        assets.map(async (asset) => ({
          id: asset.id,
          content: await this.loadAssetContent(asset)
        }))
      );
      
      const { texture, uvMappings } = await this.createTextureAtlas(atlasImages);
      const optimized = this.optimizeTexture(texture, qualityLevel);
      
      // Store atlas texture for each asset with UV mapping info
      for (const asset of assets) {
        const uvMapping = uvMappings.get(asset.id);
        if (uvMapping) {
          const atlasTexture = optimized.clone();
          // Store UV mapping in texture userData for later use
          atlasTexture.userData = { uvMapping };
          results.set(asset.id, atlasTexture);
        }
      }
    } else {
      // Process individually
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        
        try {
          let texture: THREE.Texture;
          
          if (asset.format === 'svg') {
            const svgContent = await this.loadAssetContent(asset);
            texture = await this.svgToTexture(svgContent, targetSize);
          } else {
            texture = await this.imageToTexture(asset.filePath);
          }
          
          const optimized = this.optimizeTexture(texture, qualityLevel);
          results.set(asset.id, optimized);
          
          if (onProgress) {
            onProgress(i + 1, assets.length);
          }
        } catch (error) {
          console.warn(`Failed to process asset ${asset.id}:`, error);
        }
      }
    }
    
    return results;
  }

  // Load asset content (SVG string or image URL)
  private async loadAssetContent(asset: ScientificAsset): Promise<string> {
    if (asset.format === 'svg') {
      // For SVG, we might need to fetch the content
      // For now, return a placeholder SVG
      return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="#4ecdc4"/>
        <text x="50" y="55" text-anchor="middle" font-size="12">${asset.id}</text>
      </svg>`;
    } else {
      return asset.filePath;
    }
  }

  // Convert SVG string to HTMLImageElement
  private svgStringToImage(svgContent: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to convert SVG to image'));
      };
      
      img.src = url;
    });
  }

  // Apply compression to image data
  private applyCompression(imageData: ImageData, quality: number): void {
    const data = imageData.data;
    const compressionFactor = Math.max(0.1, quality);
    
    // Simple compression by reducing color precision
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.floor(data[i] * compressionFactor) / compressionFactor * 255;     // R
      data[i + 1] = Math.floor(data[i + 1] * compressionFactor) / compressionFactor * 255; // G
      data[i + 2] = Math.floor(data[i + 2] * compressionFactor) / compressionFactor * 255; // B
      // Alpha channel remains unchanged
    }
  }

  // Simple string hash function
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Cleanup resources
  dispose(): void {
    this.conversionCache.forEach(texture => texture.dispose());
    this.conversionCache.clear();
  }
}

// Lazy loading system for assets
export class LazyAssetLoader {
  private loadedAssets = new Map<string, THREE.Texture>();
  private loadingPromises = new Map<string, Promise<THREE.Texture>>();
  private pipeline = new AssetPipeline();
  private intersectionObserver?: IntersectionObserver;

  constructor() {
    this.setupIntersectionObserver();
  }

  // Load asset when it comes into view
  async loadAssetOnDemand(
    assetId: string,
    asset: ScientificAsset,
    element?: HTMLElement
  ): Promise<THREE.Texture> {
    // Return cached if available
    if (this.loadedAssets.has(assetId)) {
      return this.loadedAssets.get(assetId)!;
    }

    // Return existing promise if loading
    if (this.loadingPromises.has(assetId)) {
      return this.loadingPromises.get(assetId)!;
    }

    // Start loading
    const loadingPromise = this.loadAsset(asset);
    this.loadingPromises.set(assetId, loadingPromise);

    try {
      const texture = await loadingPromise;
      this.loadedAssets.set(assetId, texture);
      this.loadingPromises.delete(assetId);
      
      // Set up lazy loading for element if provided
      if (element && this.intersectionObserver) {
        element.dataset.assetId = assetId;
        this.intersectionObserver.observe(element);
      }
      
      return texture;
    } catch (error) {
      this.loadingPromises.delete(assetId);
      throw error;
    }
  }

  // Preload critical assets
  async preloadCriticalAssets(assets: ScientificAsset[]): Promise<void> {
    const criticalAssets = assets.filter(asset => 
      asset.category === 'organelle' || asset.id.includes('mitochondria')
    );

    const loadingPromises = criticalAssets.map(asset =>
      this.loadAssetOnDemand(asset.id, asset)
    );

    await Promise.all(loadingPromises);
  }

  private async loadAsset(asset: ScientificAsset): Promise<THREE.Texture> {
    if (asset.format === 'svg') {
      const svgContent = await this.loadSVGContent(asset);
      return this.pipeline.svgToTexture(svgContent);
    } else {
      return this.pipeline.imageToTexture(asset.filePath);
    }
  }

  private async loadSVGContent(asset: ScientificAsset): Promise<string> {
    // In a real implementation, this would fetch from the actual file
    // For now, return placeholder content
    return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#4ecdc4"/>
      <text x="50" y="55" text-anchor="middle" font-size="8">${asset.id}</text>
    </svg>`;
  }

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const assetId = entry.target.getAttribute('data-asset-id');
              if (assetId && !this.loadedAssets.has(assetId)) {
                // Asset is now visible, prioritize loading
                console.log(`Asset ${assetId} is now visible, prioritizing load`);
              }
            }
          });
        },
        { threshold: 0.1 }
      );
    }
  }

  dispose(): void {
    this.loadedAssets.forEach(texture => texture.dispose());
    this.loadedAssets.clear();
    this.loadingPromises.clear();
    this.pipeline.dispose();
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}

// Asset Integration Pipeline - Main orchestrator
export class AssetIntegrationPipeline {
  private assetPipeline: AssetPipeline;
  private lazyLoader: LazyAssetLoader;
  private resolutionManager: MultiResolutionManager;
  private qualityController: QualityController;
  private loadingQueue: LoadingQueue;

  constructor() {
    this.assetPipeline = new AssetPipeline();
    this.lazyLoader = new LazyAssetLoader();
    this.resolutionManager = new MultiResolutionManager();
    this.qualityController = new QualityController();
    this.loadingQueue = new LoadingQueue();
  }

  // Main integration method - processes assets for different zoom levels and quality settings
  async integrateAssets(
    assets: ScientificAsset[],
    options: {
      generateMultipleResolutions?: boolean;
      qualityLevels?: ('low' | 'medium' | 'high')[];
      enableLazyLoading?: boolean;
      createAtlas?: boolean;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<IntegratedAssetCollection> {
    const {
      generateMultipleResolutions = true,
      qualityLevels = ['low', 'medium', 'high'],
      enableLazyLoading = true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createAtlas = false, // Currently unused but reserved for future atlas functionality
      onProgress
    } = options;

    const collection = new IntegratedAssetCollection();
    const totalSteps = assets.length * qualityLevels.length * (generateMultipleResolutions ? 4 : 1);
    let completedSteps = 0;

    // Process each asset
    for (const asset of assets) {
      for (const quality of qualityLevels) {
        if (generateMultipleResolutions) {
          // Generate multiple resolution versions
          const resolutions = await this.resolutionManager.generateMultipleResolutions(
            asset,
            quality,
            [2048, 1024, 512, 256] // Different zoom levels
          );
          
          collection.addMultiResolutionAsset(asset.id, quality, resolutions);
          completedSteps += 4;
        } else {
          // Single resolution
          const texture = await this.assetPipeline.batchProcess([asset], {
            qualityLevel: quality,
            targetSize: 1024
          });
          
          collection.addSingleAsset(asset.id, quality, texture.get(asset.id)!);
          completedSteps += 1;
        }

        if (onProgress) {
          onProgress(completedSteps / totalSteps);
        }
      }
    }

    // Set up lazy loading if enabled
    if (enableLazyLoading) {
      collection.enableLazyLoading(this.lazyLoader);
    }
    
    // Use createAtlas parameter for future functionality
    if (createAtlas) {
      console.log('Atlas creation requested but not yet implemented');
    }

    return collection;
  }

  // Optimize assets for specific chapter requirements
  async optimizeForChapter(
    chapterId: number,
    assets: ScientificAsset[]
  ): Promise<ChapterAssetBundle> {
    const bundle = new ChapterAssetBundle(chapterId);
    
    // Determine critical assets for this chapter
    const criticalAssets = this.identifyCriticalAssets(chapterId, assets);
    const backgroundAssets = assets.filter(a => !criticalAssets.includes(a));

    // Preload critical assets at high quality
    const criticalTextures = await this.assetPipeline.batchProcess(criticalAssets, {
      qualityLevel: 'high',
      targetSize: 1024,
      onProgress: (processed, total) => {
        console.log(`Preloading critical assets: ${processed}/${total}`);
      }
    });

    // Prepare background assets for lazy loading
    const backgroundTextures = await this.assetPipeline.batchProcess(backgroundAssets, {
      qualityLevel: 'medium',
      targetSize: 512
    });

    bundle.setCriticalAssets(criticalTextures);
    bundle.setBackgroundAssets(backgroundTextures);

    return bundle;
  }

  private identifyCriticalAssets(chapterId: number, assets: ScientificAsset[]): ScientificAsset[] {
    // Chapter-specific critical asset identification
    const criticalByChapter: Record<number, string[]> = {
      1: ['cell-overview', 'mitochondria-external', 'nucleus'],
      2: ['mitochondria-internal', 'electron-transport-chain', 'atp-molecule'],
      3: ['ros-particles', 'damaged-cell', 'sleep-cycle'],
      4: ['repair-mechanisms', 'healthy-cell', 'sleep-stages'],
      5: ['fruit-fly', 'human-cell', 'evolutionary-timeline']
    };

    const criticalIds = criticalByChapter[chapterId] || [];
    return assets.filter(asset => criticalIds.includes(asset.id));
  }

  dispose(): void {
    this.assetPipeline.dispose();
    this.lazyLoader.dispose();
    this.resolutionManager.dispose();
    this.qualityController.dispose();
    this.loadingQueue.dispose();
  }
}

// Multi-resolution asset manager for different zoom levels
class MultiResolutionManager {
  private resolutionCache = new Map<string, Map<number, THREE.Texture>>();

  async generateMultipleResolutions(
    asset: ScientificAsset,
    quality: 'low' | 'medium' | 'high',
    resolutions: number[]
  ): Promise<Map<number, THREE.Texture>> {
    const cacheKey = `${asset.id}-${quality}`;
    
    if (this.resolutionCache.has(cacheKey)) {
      return this.resolutionCache.get(cacheKey)!;
    }

    const pipeline = new AssetPipeline();
    const resolutionMap = new Map<number, THREE.Texture>();

    // Generate base texture at highest resolution
    let baseTexture: THREE.Texture;
    if (asset.format === 'svg') {
      const svgContent = await this.loadSVGContent(asset);
      baseTexture = await pipeline.svgToTexture(svgContent, Math.max(...resolutions));
    } else {
      baseTexture = await pipeline.imageToTexture(asset.filePath, {
        maxSize: Math.max(...resolutions)
      });
    }

    // Generate different resolution versions
    for (const resolution of resolutions) {
      if (resolution === Math.max(...resolutions)) {
        // Use base texture for highest resolution
        resolutionMap.set(resolution, pipeline.optimizeTexture(baseTexture, quality));
      } else {
        // Generate downscaled version
        const scaledTexture = await this.scaleTexture(baseTexture, resolution);
        resolutionMap.set(resolution, pipeline.optimizeTexture(scaledTexture, quality));
      }
    }

    this.resolutionCache.set(cacheKey, resolutionMap);
    return resolutionMap;
  }

  private async scaleTexture(baseTexture: THREE.Texture, targetSize: number): Promise<THREE.Texture> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = targetSize;
    canvas.height = targetSize;
    
    if (baseTexture.image) {
      ctx.drawImage(baseTexture.image, 0, 0, targetSize, targetSize);
    }
    
    return new THREE.CanvasTexture(canvas);
  }

  private async loadSVGContent(asset: ScientificAsset): Promise<string> {
    // In a real implementation, this would fetch the actual SVG content
    // For now, return placeholder content
    return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#4ecdc4"/>
      <text x="50" y="55" text-anchor="middle" font-size="12">${asset.id}</text>
    </svg>`;
  }

  dispose(): void {
    this.resolutionCache.forEach(resMap => {
      resMap.forEach(texture => texture.dispose());
    });
    this.resolutionCache.clear();
  }
}

// Quality controller for adaptive quality based on device performance
class QualityController {
  private currentQuality: 'low' | 'medium' | 'high' = 'medium';
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.detectOptimalQuality();
  }

  private detectOptimalQuality(): void {
    const deviceInfo = this.getDeviceInfo();
    
    if (deviceInfo.isLowEnd) {
      this.currentQuality = 'low';
    } else if (deviceInfo.isHighEnd) {
      this.currentQuality = 'high';
    } else {
      this.currentQuality = 'medium';
    }
  }

  private getDeviceInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      return { isLowEnd: true, isHighEnd: false };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    
    // Simple device classification based on renderer string
    const isLowEnd = /Mali|Adreno [0-9][0-9][0-9]|PowerVR/.test(renderer);
    const isHighEnd = /RTX|GTX|Radeon|Intel Iris/.test(renderer);
    
    return { isLowEnd, isHighEnd };
  }

  getCurrentQuality(): 'low' | 'medium' | 'high' {
    return this.currentQuality;
  }

  adjustQualityBasedOnPerformance(): void {
    const fps = this.performanceMonitor.getAverageFPS();
    
    if (fps < 30 && this.currentQuality !== 'low') {
      this.currentQuality = this.currentQuality === 'high' ? 'medium' : 'low';
      console.log(`Quality reduced to ${this.currentQuality} due to low FPS: ${fps}`);
    } else if (fps > 55 && this.currentQuality !== 'high') {
      this.currentQuality = this.currentQuality === 'low' ? 'medium' : 'high';
      console.log(`Quality increased to ${this.currentQuality} due to good FPS: ${fps}`);
    }
  }

  dispose(): void {
    this.performanceMonitor.dispose();
  }
}

// Performance monitoring for quality adjustment
class PerformanceMonitor {
  private fpsHistory: number[] = [];
  private lastFrameTime = performance.now();
  private isMonitoring = false;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorFrame();
  }

  private monitorFrame(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    const fps = 1000 / deltaTime;
    
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 60) { // Keep last 60 frames
      this.fpsHistory.shift();
    }
    
    this.lastFrameTime = currentTime;
    requestAnimationFrame(() => this.monitorFrame());
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  dispose(): void {
    this.stopMonitoring();
    this.fpsHistory = [];
  }
}

// Loading queue for managing asset loading priority
class LoadingQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private activeLoads = 0;

  addToQueue(item: QueueItem): void {
    this.queue.push(item);
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.activeLoads >= this.maxConcurrent) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0 && this.activeLoads < this.maxConcurrent) {
      const item = this.queue.shift()!;
      this.activeLoads++;
      
      this.processItem(item).finally(() => {
        this.activeLoads--;
        this.processQueue();
      });
    }
    
    this.isProcessing = false;
  }

  private async processItem(item: QueueItem): Promise<void> {
    try {
      await item.loader();
      if (item.onComplete) item.onComplete();
    } catch (error) {
      if (item.onError) item.onError(error);
    }
  }

  dispose(): void {
    this.queue = [];
    this.isProcessing = false;
    this.activeLoads = 0;
  }
}

interface QueueItem {
  id: string;
  priority: number;
  loader: () => Promise<any>;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

// Integrated asset collection for managing processed assets
class IntegratedAssetCollection {
  private assets = new Map<string, Map<string, any>>();
  // @ts-ignore - Reserved for future lazy loading integration
  private lazyLoader?: LazyAssetLoader;

  addMultiResolutionAsset(
    assetId: string, 
    quality: string, 
    resolutions: Map<number, THREE.Texture>
  ): void {
    if (!this.assets.has(assetId)) {
      this.assets.set(assetId, new Map());
    }
    
    this.assets.get(assetId)!.set(quality, resolutions);
  }

  addSingleAsset(assetId: string, quality: string, texture: THREE.Texture): void {
    if (!this.assets.has(assetId)) {
      this.assets.set(assetId, new Map());
    }
    
    this.assets.get(assetId)!.set(quality, texture);
  }

  getAsset(
    assetId: string, 
    quality: string = 'medium', 
    resolution?: number
  ): THREE.Texture | Map<number, THREE.Texture> | null {
    const assetQualities = this.assets.get(assetId);
    if (!assetQualities) return null;
    
    const qualityAsset = assetQualities.get(quality);
    if (!qualityAsset) return null;
    
    if (resolution && qualityAsset instanceof Map) {
      return qualityAsset.get(resolution) || null;
    }
    
    return qualityAsset;
  }

  enableLazyLoading(lazyLoader: LazyAssetLoader): void {
    this.lazyLoader = lazyLoader;
    console.log('Lazy loading enabled for asset collection');
  }

  dispose(): void {
    this.assets.forEach(qualityMap => {
      qualityMap.forEach(asset => {
        if (asset instanceof Map) {
          asset.forEach((texture: THREE.Texture) => texture.dispose());
        } else if (asset.dispose) {
          asset.dispose();
        }
      });
    });
    this.assets.clear();
  }
}

// Chapter-specific asset bundle
class ChapterAssetBundle {
  private chapterId: number;
  private criticalAssets = new Map<string, THREE.Texture>();
  private backgroundAssets = new Map<string, THREE.Texture>();

  constructor(chapterId: number) {
    this.chapterId = chapterId;
  }

  setCriticalAssets(assets: Map<string, THREE.Texture>): void {
    this.criticalAssets = assets;
  }

  setBackgroundAssets(assets: Map<string, THREE.Texture>): void {
    this.backgroundAssets = assets;
  }

  getCriticalAsset(assetId: string): THREE.Texture | null {
    return this.criticalAssets.get(assetId) || null;
  }

  getBackgroundAsset(assetId: string): THREE.Texture | null {
    return this.backgroundAssets.get(assetId) || null;
  }

  getChapterId(): number {
    return this.chapterId;
  }

  dispose(): void {
    this.criticalAssets.forEach(texture => texture.dispose());
    this.backgroundAssets.forEach(texture => texture.dispose());
    this.criticalAssets.clear();
    this.backgroundAssets.clear();
  }
}

// Global instances
export const assetPipeline = new AssetPipeline();
export const lazyAssetLoader = new LazyAssetLoader();
export const assetIntegrationPipeline = new AssetIntegrationPipeline();