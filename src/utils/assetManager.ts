import * as THREE from 'three';
import type { OrganelleType, ScientificAsset } from '../types';
import { assetIntegrationPipeline } from './assetPipeline';
import { globalAssetCache } from './assetCache';
import { textureGenerator } from './textureGenerator';
import { assetLoadingSystem } from './enhanced3DAssets';
import { placeholderAssetManager } from './placeholderAssets';

// Main asset manager that orchestrates all asset systems
export class AssetManager {
  private isInitialized = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private currentChapter = 1; // Track current chapter for optimization
  private loadingProgress = 0;
  private onProgressCallbacks: ((progress: number) => void)[] = [];

  // Initialize the asset system
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing Asset Manager...');
    
    // Create placeholder assets for development
    placeholderAssetManager.createPlaceholderAssets();
    
    // Preload enhanced 3D assets
    await assetLoadingSystem.preloadAllAssets();
    
    this.isInitialized = true;
    console.log('Asset Manager initialized successfully');
  }

  // Load assets for a specific chapter
  async loadChapterAssets(
    chapterId: number,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.currentChapter = chapterId;
    console.log(`Loading assets for chapter ${this.currentChapter}`);
    
    if (onProgress) {
      this.onProgressCallbacks.push(onProgress);
    }

    const chapterAssets = this.getChapterAssets(chapterId);
    
    try {
      await assetIntegrationPipeline.optimizeForChapter(
        chapterId,
        chapterAssets
      );
      
      console.log(`Chapter ${chapterId} assets loaded successfully`);
      this.notifyProgress(100);
    } catch (error) {
      console.error(`Failed to load chapter ${chapterId} assets:`, error);
      throw error;
    }
  }

  // Get texture for organelle with automatic quality selection
  async getOrganelleTexture(
    organelleType: OrganelleType,
    zoomLevel: number = 1
  ): Promise<THREE.Texture> {
    const cacheKey = `texture-${organelleType}-${zoomLevel}`;
    
    return globalAssetCache.getAsset(cacheKey, async () => {
      // Try to get enhanced texture first
      const enhanced3DAsset = assetLoadingSystem.getLoadedAsset(organelleType);
      if (enhanced3DAsset && enhanced3DAsset.material instanceof THREE.MeshStandardMaterial) {
        const material = enhanced3DAsset.material as THREE.MeshStandardMaterial;
        if (material.map) {
          return material.map;
        }
      }

      // Fall back to procedural texture
      return textureGenerator.getTexture(organelleType);
    });
  }

  // Get 3D model for organelle
  async getOrganelleModel(organelleType: OrganelleType): Promise<THREE.Mesh> {
    const cacheKey = `model-${organelleType}`;
    
    return globalAssetCache.getAsset(cacheKey, async () => {
      const enhanced3DAsset = await assetLoadingSystem.loadAsset(organelleType);
      return new THREE.Mesh(enhanced3DAsset.geometry, enhanced3DAsset.material);
    });
  }

  // Get scientific asset (SVG/PNG illustrations)
  async getScientificAsset(assetId: string): Promise<THREE.Texture> {
    const cacheKey = `scientific-${assetId}`;
    
    return globalAssetCache.getAsset(cacheKey, async () => {
      const asset = placeholderAssetManager.getAsset(assetId);
      if (!asset) {
        throw new Error(`Scientific asset not found: ${assetId}`);
      }

      if (asset.format === 'svg') {
        const svgContent = await this.loadSVGContent(asset);
        return assetIntegrationPipeline['assetPipeline'].svgToTexture(svgContent);
      } else {
        return assetIntegrationPipeline['assetPipeline'].imageToTexture(asset.filePath);
      }
    });
  }

  // Get multiple resolution versions of an asset
  async getMultiResolutionAsset(
    assetId: string,
    resolutions: number[] = [256, 512, 1024, 2048]
  ): Promise<Map<number, THREE.Texture>> {
    const cacheKey = `multi-res-${assetId}`;
    
    return globalAssetCache.getAsset(cacheKey, async () => {
      const asset = placeholderAssetManager.getAsset(assetId);
      if (!asset) {
        throw new Error(`Asset not found: ${assetId}`);
      }

      const pipeline = assetIntegrationPipeline['assetPipeline'];

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
      const resolutionMap = await pipeline.generateMipLevels(baseTexture, resolutions);
      return resolutionMap;
    });
  }

  // Preload critical assets for better performance
  async preloadCriticalAssets(organelleTypes: OrganelleType[]): Promise<void> {
    const loadingPromises = organelleTypes.map(async (type) => {
      try {
        await this.getOrganelleTexture(type);
        await this.getOrganelleModel(type);
      } catch (error) {
        console.warn(`Failed to preload ${type}:`, error);
      }
    });

    await Promise.all(loadingPromises);
    console.log('Critical assets preloaded');
  }

  // Get assets specific to a chapter
  private getChapterAssets(chapterId: number): ScientificAsset[] {
    const chapterAssetMap: Record<number, string[]> = {
      1: ['cell-overview', 'mitochondria-external', 'nucleus'],
      2: ['mitochondria-internal', 'electron-transport-chain', 'atp-molecule'],
      3: ['ros-particles', 'damaged-cell', 'sleep-cycle'],
      4: ['repair-mechanisms', 'healthy-cell', 'sleep-stages'],
      5: ['fruit-fly', 'human-cell', 'evolutionary-timeline']
    };

    const assetIds = chapterAssetMap[chapterId] || [];
    return assetIds.map(id => placeholderAssetManager.getAsset(id)).filter(Boolean) as ScientificAsset[];
  }

  // Load SVG content (placeholder implementation)
  private async loadSVGContent(asset: ScientificAsset): Promise<string> {
    // In a real implementation, this would fetch the actual SVG file
    // For now, return placeholder SVG based on asset ID
    const organelleType = this.extractOrganelleType(asset.id);
    if (organelleType) {
      return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="#4ecdc4"/>
        <text x="50" y="55" text-anchor="middle" font-size="12">${organelleType}</text>
      </svg>`;
    }
    
    return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#4ecdc4"/>
      <text x="50" y="55" text-anchor="middle" font-size="12">${asset.id}</text>
    </svg>`;
  }

  // Extract organelle type from asset ID
  private extractOrganelleType(assetId: string): OrganelleType | null {
    const organelleTypes: OrganelleType[] = [
      'mitochondria', 'nucleus', 'endoplasmic-reticulum', 
      'golgi-apparatus', 'ribosomes', 'cell-membrane', 'cytoskeleton'
    ];

    return organelleTypes.find(type => assetId.includes(type)) || null;
  }

  // Notify progress callbacks
  private notifyProgress(progress: number): void {
    this.loadingProgress = progress;
    this.onProgressCallbacks.forEach(callback => callback(progress));
  }

  // Get current loading progress
  getLoadingProgress(): number {
    return this.loadingProgress;
  }

  // Get cache status for debugging
  getCacheStatus() {
    return globalAssetCache.getCacheStatus();
  }

  // Clear cache to free memory
  clearCache(): void {
    globalAssetCache.clear();
  }

  // Dispose of all resources
  dispose(): void {
    assetIntegrationPipeline.dispose();
    globalAssetCache.dispose();
    textureGenerator.dispose();
    assetLoadingSystem.dispose();
    this.onProgressCallbacks = [];
    this.isInitialized = false;
  }
}

// Asset preloader for specific scenarios
export class AssetPreloader {
  private assetManager: AssetManager;

  constructor(assetManager: AssetManager) {
    this.assetManager = assetManager;
  }

  // Preload assets for tutorial
  async preloadTutorialAssets(): Promise<void> {
    const tutorialAssets: OrganelleType[] = ['mitochondria', 'nucleus', 'cell-membrane'];
    await this.assetManager.preloadCriticalAssets(tutorialAssets);
  }

  // Preload assets for specific chapter
  async preloadChapterAssets(chapterId: number): Promise<void> {
    await this.assetManager.loadChapterAssets(chapterId);
  }

  // Preload all organelle models
  async preloadAllOrganelles(): Promise<void> {
    const allOrganelles: OrganelleType[] = [
      'mitochondria', 'nucleus', 'endoplasmic-reticulum',
      'golgi-apparatus', 'ribosomes', 'cell-membrane', 'cytoskeleton'
    ];
    await this.assetManager.preloadCriticalAssets(allOrganelles);
  }
}

// Asset quality manager for adaptive quality
export class AssetQualityManager {
  private currentQuality: 'low' | 'medium' | 'high' = 'medium';
  private assetManager: AssetManager;

  constructor(assetManager: AssetManager) {
    this.assetManager = assetManager;
    this.detectOptimalQuality();
  }

  private detectOptimalQuality(): void {
    // Simple device detection
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
      this.currentQuality = 'low';
      return;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    
    if (/Mali|Adreno [0-9][0-9][0-9]|PowerVR/.test(renderer)) {
      this.currentQuality = 'low';
    } else if (/RTX|GTX|Radeon|Intel Iris/.test(renderer)) {
      this.currentQuality = 'high';
    } else {
      this.currentQuality = 'medium';
    }

    console.log(`Detected quality level: ${this.currentQuality}`);
  }

  getCurrentQuality(): 'low' | 'medium' | 'high' {
    return this.currentQuality;
  }

  setQuality(quality: 'low' | 'medium' | 'high'): void {
    if (this.currentQuality !== quality) {
      this.currentQuality = quality;
      // Clear cache to reload assets with new quality
      this.assetManager.clearCache();
      console.log(`Quality changed to: ${quality}`);
    }
  }
}

// Global asset manager instance
export const assetManager = new AssetManager();
export const assetPreloader = new AssetPreloader(assetManager);
export const assetQualityManager = new AssetQualityManager(assetManager);

// Convenience functions for common operations
export const getOrganelleTexture = (type: OrganelleType, zoomLevel?: number) => 
  assetManager.getOrganelleTexture(type, zoomLevel);

export const getOrganelleModel = (type: OrganelleType) => 
  assetManager.getOrganelleModel(type);

export const getScientificAsset = (assetId: string) => 
  assetManager.getScientificAsset(assetId);

export const preloadChapterAssets = (chapterId: number, onProgress?: (progress: number) => void) =>
  assetManager.loadChapterAssets(chapterId, onProgress);