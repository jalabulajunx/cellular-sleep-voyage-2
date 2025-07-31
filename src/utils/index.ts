import type { Vector3 } from '../types';

// Math utilities for 3D calculations
export const vector3 = {
  create: (x: number = 0, y: number = 0, z: number = 0): Vector3 => ({ x, y, z }),
  
  distance: (a: Vector3, b: Vector3): number => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  
  normalize: (v: Vector3): Vector3 => {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length === 0) return { x: 0, y: 0, z: 0 };
    return {
      x: v.x / length,
      y: v.y / length,
      z: v.z / length
    };
  },
  
  add: (a: Vector3, b: Vector3): Vector3 => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  }),
  
  multiply: (v: Vector3, scalar: number): Vector3 => ({
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar
  })
};

// Export asset management system
export {
  assetManager,
  assetPreloader,
  assetQualityManager,
  getOrganelleTexture,
  getOrganelleModel,
  getScientificAsset,
  preloadChapterAssets
} from './assetManager';

export {
  assetPipeline,
  lazyAssetLoader,
  assetIntegrationPipeline
} from './assetPipeline';

export {
  globalAssetCache,
  AssetCompressor
} from './assetCache';

export {
  textureGenerator
} from './textureGenerator';

export {
  assetLoadingSystem
} from './enhanced3DAssets';

export {
  placeholderAssetManager,
  organelleColors,
  createPlaceholderGeometry
} from './placeholderAssets';

// Performance utilities
export const performance = {
  measureFPS: (): number => {
    // Simple FPS counter implementation
    return 60; // Placeholder
  },
  
  optimizeForDevice: (): 'high' | 'medium' | 'low' => {
    // Detect device capabilities and return quality level
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    
    if (!gl) return 'low';
    
    const renderer = gl.getParameter(gl.RENDERER) as string;
    const vendor = gl.getParameter(gl.VENDOR) as string;
    
    // Simple heuristic - in production this would be more sophisticated
    if (renderer.includes('Intel') || vendor.includes('Intel')) {
      return 'medium';
    }
    
    return 'high';
  }
};

// Educational utilities
export const education = {
  calculateLearningProgress: (
    discoveryPoints: number,
    scientistPoints: number,
    sleepPoints: number
  ): number => {
    const totalPoints = discoveryPoints + scientistPoints + sleepPoints;
    const maxPoints = 1000; // Adjust based on game design
    return Math.min(totalPoints / maxPoints, 1);
  },
  
  getAgeAppropriateExplanation: (
    content: any,
    userAge: number = 10
  ): string => {
    // Return age-appropriate explanation
    if (userAge <= 8) return content.basicExplanation?.analogy || '';
    if (userAge <= 12) return content.intermediateExplanation?.biologicalProcess || '';
    return content.advancedExplanation?.molecularMechanism || '';
  },
  
  formatScientificTerm: (term: string, simplified: boolean = true): string => {
    const simplifications: Record<string, string> = {
      'mitochondria': simplified ? 'power plants' : 'mitochondria',
      'electron transport chain': simplified ? 'assembly line' : 'electron transport chain',
      'reactive oxygen species': simplified ? 'toxic sparks' : 'reactive oxygen species',
      'adenosine triphosphate': simplified ? 'energy batteries' : 'ATP'
    };
    
    return simplifications[term.toLowerCase()] || term;
  }
};

// Animation utilities
export const animation = {
  easeInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  
  lerp: (start: number, end: number, t: number): number => {
    return start + (end - start) * t;
  },
  
  lerpVector3: (start: Vector3, end: Vector3, t: number): Vector3 => ({
    x: animation.lerp(start.x, end.x, t),
    y: animation.lerp(start.y, end.y, t),
    z: animation.lerp(start.z, end.z, t)
  })
};

// Local storage utilities
export const storage = {
  save: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  
  load: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
};

// Accessibility utilities
export const accessibility = {
  announceToScreenReader: (message: string): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
  
  addKeyboardNavigation: (element: HTMLElement, onActivate: () => void): void => {
    element.setAttribute('tabindex', '0');
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onActivate();
      }
    });
  }
};