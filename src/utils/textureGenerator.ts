import * as THREE from 'three';
import type { OrganelleType } from '../types';
import { organelleColors } from './placeholderAssets';

// Procedural texture generation for organelles
export class TextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private textureCache = new Map<string, THREE.Texture>();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Generate mitochondria texture with cristae pattern
  generateMitochondriaTexture(): THREE.Texture {
    const cacheKey = 'mitochondria-texture';
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const { canvas, ctx } = this;
    const size = canvas.width;

    // Clear canvas
    ctx.fillStyle = organelleColors.mitochondria;
    ctx.fillRect(0, 0, size, size);

    // Add cristae pattern (folded inner membrane)
    ctx.strokeStyle = '#cc4444';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;

    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const y = (i + 1) * (size / 9);
      const amplitude = 20 + Math.sin(i * 0.5) * 10;
      
      ctx.moveTo(0, y);
      for (let x = 0; x <= size; x += 10) {
        const waveY = y + Math.sin(x * 0.02 + i) * amplitude;
        ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }

    // Add membrane texture
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Generate nucleus texture with chromatin pattern
  generateNucleusTexture(): THREE.Texture {
    const cacheKey = 'nucleus-texture';
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const { canvas, ctx } = this;
    const size = canvas.width;

    // Base color
    ctx.fillStyle = organelleColors.nucleus;
    ctx.fillRect(0, 0, size, size);

    // Add chromatin (DNA) pattern
    ctx.strokeStyle = '#2a9d8f';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;

    // Create tangled DNA-like patterns
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      const startX = Math.random() * size;
      const startY = Math.random() * size;
      ctx.moveTo(startX, startY);

      let currentX = startX;
      let currentY = startY;

      for (let j = 0; j < 20; j++) {
        currentX += (Math.random() - 0.5) * 30;
        currentY += (Math.random() - 0.5) * 30;
        currentX = Math.max(0, Math.min(size, currentX));
        currentY = Math.max(0, Math.min(size, currentY));
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }

    // Add nuclear pores
    ctx.fillStyle = '#1a6b5c';
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = size * 0.35;
      const x = size / 2 + Math.cos(angle) * radius;
      const y = size / 2 + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Generate ER texture with ribosome dots
  generateERTexture(): THREE.Texture {
    const cacheKey = 'er-texture';
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const { canvas, ctx } = this;
    const size = canvas.width;

    // Base ER color
    ctx.fillStyle = organelleColors['endoplasmic-reticulum'];
    ctx.fillRect(0, 0, size, size);

    // Add membrane texture
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    // Create membrane network pattern
    const gridSize = 40;
    for (let x = 0; x <= size; x += gridSize) {
      for (let y = 0; y <= size; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + gridSize * 0.8, y + gridSize * 0.2);
        ctx.lineTo(x + gridSize * 0.2, y + gridSize * 0.8);
        ctx.stroke();
      }
    }

    // Add ribosomes (rough ER)
    ctx.fillStyle = organelleColors.ribosomes;
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Generate Golgi texture with stacked appearance
  generateGolgiTexture(): THREE.Texture {
    const cacheKey = 'golgi-texture';
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const { canvas, ctx } = this;
    const size = canvas.width;

    // Base Golgi color
    ctx.fillStyle = organelleColors['golgi-apparatus'];
    ctx.fillRect(0, 0, size, size);

    // Add stacked cisternae pattern
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.7;

    const stackCount = 6;
    for (let i = 0; i < stackCount; i++) {
      const y = (i + 1) * (size / (stackCount + 1));
      ctx.beginPath();
      ctx.moveTo(size * 0.1, y);
      ctx.quadraticCurveTo(size * 0.5, y - 10, size * 0.9, y);
      ctx.stroke();
    }

    // Add vesicles
    ctx.fillStyle = '#d35400';
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 8 + 4;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Generate ribosome texture with subunit detail
  generateRibosomeTexture(): THREE.Texture {
    const cacheKey = 'ribosome-texture';
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const { canvas, ctx } = this;
    const size = canvas.width;

    // Base ribosome color
    ctx.fillStyle = organelleColors.ribosomes;
    ctx.fillRect(0, 0, size, size);

    // Add subunit pattern
    ctx.fillStyle = '#5a4fcf';
    ctx.globalAlpha = 0.8;

    // Large subunit
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.4, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Small subunit
    ctx.fillStyle = '#7b68ee';
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.6, size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Add RNA detail
    ctx.strokeStyle = '#4a3f9f';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const innerRadius = size * 0.1;
      const outerRadius = size * 0.35;
      const x1 = size * 0.5 + Math.cos(angle) * innerRadius;
      const y1 = size * 0.5 + Math.sin(angle) * innerRadius;
      const x2 = size * 0.5 + Math.cos(angle) * outerRadius;
      const y2 = size * 0.5 + Math.sin(angle) * outerRadius;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Generate cell membrane texture with phospholipid pattern
  generateMembraneTexture(): THREE.Texture {
    const cacheKey = 'membrane-texture';
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const { canvas, ctx } = this;
    const size = canvas.width;

    // Base membrane color
    ctx.fillStyle = organelleColors['cell-membrane'];
    ctx.fillRect(0, 0, size, size);

    // Add phospholipid bilayer pattern
    ctx.strokeStyle = '#8e7cc3';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;

    // Draw phospholipid heads and tails
    const lipidSpacing = 20;
    for (let x = 0; x < size; x += lipidSpacing) {
      for (let y = 0; y < size; y += lipidSpacing) {
        // Phospholipid head
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.stroke();

        // Phospholipid tails
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 10 - 5, y + 15);
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 10 - 5, y + 15);
        ctx.stroke();
      }
    }

    // Add membrane proteins
    ctx.fillStyle = '#6c63b5';
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const width = Math.random() * 20 + 10;
      const height = Math.random() * 30 + 20;
      
      ctx.fillRect(x - width/2, y - height/2, width, height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Generate cytoskeleton texture with filament pattern
  generateCytoskeletonTexture(): THREE.Texture {
    const cacheKey = 'cytoskeleton-texture';
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const { canvas, ctx } = this;
    const size = canvas.width;

    // Base cytoskeleton color
    ctx.fillStyle = organelleColors.cytoskeleton;
    ctx.fillRect(0, 0, size, size);

    // Add microtubule pattern
    ctx.strokeStyle = '#e84393';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;

    // Draw microtubules as parallel lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI;
      const length = size * 0.8;
      const centerX = size / 2;
      const centerY = size / 2;
      
      const startX = centerX - Math.cos(angle) * length / 2;
      const startY = centerY - Math.sin(angle) * length / 2;
      const endX = centerX + Math.cos(angle) * length / 2;
      const endY = centerY + Math.sin(angle) * length / 2;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Add microfilaments (thinner)
    ctx.strokeStyle = '#fd79a8';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;

    for (let i = 0; i < 20; i++) {
      const startX = Math.random() * size;
      const startY = Math.random() * size;
      const angle = Math.random() * Math.PI * 2;
      const length = Math.random() * 100 + 50;
      
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Get texture for specific organelle type
  getTexture(organelleType: OrganelleType): THREE.Texture {
    switch (organelleType) {
      case 'mitochondria':
        return this.generateMitochondriaTexture();
      case 'nucleus':
        return this.generateNucleusTexture();
      case 'endoplasmic-reticulum':
        return this.generateERTexture();
      case 'golgi-apparatus':
        return this.generateGolgiTexture();
      case 'ribosomes':
        return this.generateRibosomeTexture();
      case 'cell-membrane':
        return this.generateMembraneTexture();
      case 'cytoskeleton':
        return this.generateCytoskeletonTexture();
      default:
        return this.generateMitochondriaTexture();
    }
  }

  // Generate normal map for enhanced 3D appearance
  generateNormalMap(organelleType: OrganelleType): THREE.Texture {
    const cacheKey = `${organelleType}-normal`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const { canvas, ctx } = this;
    const size = canvas.width;

    // Create height map first
    ctx.fillStyle = '#808080'; // Neutral gray
    ctx.fillRect(0, 0, size, size);

    // Add surface details based on organelle type
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 10 + 5;
      const brightness = Math.random() * 100 + 100;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgb(${brightness}, ${brightness}, ${brightness})`);
      gradient.addColorStop(1, '#808080');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.format = THREE.RGBFormat;
    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Cleanup resources
  dispose(): void {
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
  }
}

// Global texture generator instance
export const textureGenerator = new TextureGenerator();