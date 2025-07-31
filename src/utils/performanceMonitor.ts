import * as THREE from 'three';

// Performance monitoring system for 3D assets and rendering
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  loadTime: number;
  cacheHitRate: number;
}

export interface DeviceCapabilities {
  webglVersion: number;
  maxTextureSize: number;
  maxVertexUniforms: number;
  maxFragmentUniforms: number;
  maxVaryingVectors: number;
  maxVertexAttributes: number;
  maxRenderBufferSize: number;
  extensions: string[];
  renderer: string;
  vendor: string;
  isHighPerformance: boolean;
  recommendedQuality: 'low' | 'medium' | 'high';
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private frameCount = 0;
  private lastTime = performance.now();
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private isMonitoring = false;
  private monitoringInterval?: number;
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 0,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      loadTime: 0,
      cacheHitRate: 0
    };
  }

  // Start performance monitoring
  startMonitoring(updateInterval: number = 1000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = window.setInterval(() => {
      this.updateMetrics();
      this.notifyCallbacks();
    }, updateInterval);
  }

  // Stop performance monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  // Record frame for FPS calculation
  recordFrame(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // Update frame time history
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    // Calculate FPS every second
    if (deltaTime >= 1000) {
      const fps = (this.frameCount * 1000) / deltaTime;
      this.fpsHistory.push(fps);
      
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift();
      }

      this.metrics.fps = this.getAverageFPS();
      this.metrics.frameTime = this.getAverageFrameTime();
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  // Update memory usage metrics
  updateMemoryUsage(renderer: THREE.WebGLRenderer): void {
    const info = renderer.info;
    
    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;
    this.metrics.geometries = info.memory.geometries;
    this.metrics.textures = info.memory.textures;

    // Estimate memory usage (rough calculation)
    const textureMemory = this.metrics.textures * 1024 * 1024; // Assume 1MB per texture
    const geometryMemory = this.metrics.geometries * 100 * 1024; // Assume 100KB per geometry
    this.metrics.memoryUsage = textureMemory + geometryMemory;
  }

  // Record asset load time
  recordLoadTime(loadTime: number): void {
    this.metrics.loadTime = loadTime;
  }

  // Update cache hit rate
  updateCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Get performance summary
  getPerformanceSummary(): {
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
    bottlenecks: string[];
  } {
    const { fps, frameTime, memoryUsage, drawCalls } = this.metrics;
    const recommendations: string[] = [];
    const bottlenecks: string[] = [];
    
    let status: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

    // Analyze FPS
    if (fps < 30) {
      status = 'poor';
      bottlenecks.push('Low frame rate');
      recommendations.push('Reduce geometry complexity or texture resolution');
    } else if (fps < 45) {
      status = 'fair';
      recommendations.push('Consider optimizing assets for better performance');
    } else if (fps < 55) {
      status = 'good';
    }

    // Analyze frame time
    if (frameTime > 33) {
      bottlenecks.push('High frame time');
      recommendations.push('Optimize rendering pipeline');
    }

    // Analyze memory usage
    if (memoryUsage > 100 * 1024 * 1024) { // 100MB
      bottlenecks.push('High memory usage');
      recommendations.push('Implement asset streaming or reduce texture sizes');
    }

    // Analyze draw calls
    if (drawCalls > 100) {
      bottlenecks.push('High draw call count');
      recommendations.push('Consider geometry instancing or batching');
    }

    return { status, recommendations, bottlenecks };
  }

  // Subscribe to performance updates
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  private updateMetrics(): void {
    // Update derived metrics
    this.metrics.fps = this.getAverageFPS();
    this.metrics.frameTime = this.getAverageFrameTime();
  }

  private getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
  }

  private getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 16.67;
    return this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length;
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.warn('Performance monitor callback error:', error);
      }
    });
  }
}

// Device capability detection
export class DeviceCapabilityDetector {
  private capabilities?: DeviceCapabilities;

  // Detect device capabilities
  detectCapabilities(): DeviceCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      throw new Error('WebGL not supported');
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';

    this.capabilities = {
      webglVersion: gl instanceof WebGL2RenderingContext ? 2 : 1,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      extensions: gl.getSupportedExtensions() || [],
      renderer: renderer as string,
      vendor: vendor as string,
      isHighPerformance: this.isHighPerformanceDevice(renderer as string, vendor as string),
      recommendedQuality: this.getRecommendedQuality(renderer as string, vendor as string)
    };

    return this.capabilities;
  }

  // Check if device is high performance
  private isHighPerformanceDevice(renderer: string, vendor: string): boolean {
    const highPerformanceIndicators = [
      'nvidia', 'geforce', 'quadro', 'tesla',
      'amd', 'radeon', 'rx ', 'vega',
      'intel iris', 'intel uhd 6', 'intel uhd 7'
    ];

    const rendererLower = renderer.toLowerCase();
    const vendorLower = vendor.toLowerCase();
    
    return highPerformanceIndicators.some(indicator => 
      rendererLower.includes(indicator) || vendorLower.includes(indicator)
    );
  }

  // Get recommended quality level
  private getRecommendedQuality(renderer: string, vendor: string): 'low' | 'medium' | 'high' {
    if (this.isHighPerformanceDevice(renderer, vendor)) {
      return 'high';
    }

    const mediumPerformanceIndicators = [
      'intel', 'integrated', 'uhd', 'iris'
    ];

    const rendererLower = renderer.toLowerCase();
    const vendorLower = vendor.toLowerCase();
    
    const isMediumPerformance = mediumPerformanceIndicators.some(indicator => 
      rendererLower.includes(indicator) || vendorLower.includes(indicator)
    );

    return isMediumPerformance ? 'medium' : 'low';
  }

  // Get memory estimate
  getEstimatedMemory(): number {
    // Rough estimation based on device type
    const capabilities = this.detectCapabilities();
    
    if (capabilities.isHighPerformance) {
      return 2048; // 2GB
    } else if (capabilities.recommendedQuality === 'medium') {
      return 1024; // 1GB
    } else {
      return 512; // 512MB
    }
  }

  // Check for specific features
  hasFeature(feature: string): boolean {
    const capabilities = this.detectCapabilities();
    return capabilities.extensions.includes(feature);
  }
}

// Adaptive quality system
export class AdaptiveQualityManager {
  private performanceMonitor: PerformanceMonitor;
  private deviceDetector: DeviceCapabilityDetector;
  private currentQuality: 'low' | 'medium' | 'high';
  private targetFPS = 30;
  private adjustmentCooldown = 5000; // 5 seconds
  private lastAdjustment = 0;

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor;
    this.deviceDetector = new DeviceCapabilityDetector();
    this.currentQuality = this.deviceDetector.detectCapabilities().recommendedQuality;
  }

  // Start adaptive quality management
  startAdaptiveQuality(): void {
    this.performanceMonitor.subscribe((metrics) => {
      this.adjustQualityBasedOnPerformance(metrics);
    });
  }

  // Get current quality level
  getCurrentQuality(): 'low' | 'medium' | 'high' {
    return this.currentQuality;
  }

  // Set target FPS
  setTargetFPS(fps: number): void {
    this.targetFPS = fps;
  }

  // Manually set quality level
  setQuality(quality: 'low' | 'medium' | 'high'): void {
    this.currentQuality = quality;
    console.log(`Quality manually set to: ${quality}`);
  }

  private adjustQualityBasedOnPerformance(metrics: PerformanceMetrics): void {
    const now = Date.now();
    
    // Respect cooldown period
    if (now - this.lastAdjustment < this.adjustmentCooldown) {
      return;
    }

    const { fps } = metrics;
    let shouldAdjust = false;
    let newQuality = this.currentQuality;

    // Reduce quality if FPS is too low
    if (fps < this.targetFPS - 5) {
      if (this.currentQuality === 'high') {
        newQuality = 'medium';
        shouldAdjust = true;
      } else if (this.currentQuality === 'medium') {
        newQuality = 'low';
        shouldAdjust = true;
      }
    }
    // Increase quality if FPS is consistently high
    else if (fps > this.targetFPS + 15) {
      if (this.currentQuality === 'low') {
        newQuality = 'medium';
        shouldAdjust = true;
      } else if (this.currentQuality === 'medium') {
        newQuality = 'high';
        shouldAdjust = true;
      }
    }

    if (shouldAdjust) {
      this.currentQuality = newQuality;
      this.lastAdjustment = now;
      console.log(`Quality automatically adjusted to: ${newQuality} (FPS: ${fps.toFixed(1)})`);
    }
  }
}

// Global instances
export const performanceMonitor = new PerformanceMonitor();
export const deviceCapabilityDetector = new DeviceCapabilityDetector();
export const adaptiveQualityManager = new AdaptiveQualityManager(performanceMonitor);