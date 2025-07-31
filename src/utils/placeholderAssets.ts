import type { OrganelleType, ScientificAsset } from '../types';

// Placeholder asset system for development
export const placeholderAssets: Record<string, ScientificAsset> = {
  'cell-overview': {
    id: 'cell-overview',
    category: 'organelle',
    filePath: '/placeholders/cell-overview.svg',
    format: 'svg',
    scientificAccuracy: 'validated',
    ageAppropriate: true,
    license: 'creative-commons'
  },
  'mitochondria-external': {
    id: 'mitochondria-external',
    category: 'organelle',
    filePath: '/placeholders/mitochondria-external.svg',
    format: 'svg',
    scientificAccuracy: 'validated',
    ageAppropriate: true,
    license: 'creative-commons'
  },
  'nucleus': {
    id: 'nucleus',
    category: 'organelle',
    filePath: '/placeholders/nucleus.svg',
    format: 'svg',
    scientificAccuracy: 'validated',
    ageAppropriate: true,
    license: 'creative-commons'
  },
  'atp-molecule': {
    id: 'atp-molecule',
    category: 'molecule',
    filePath: '/placeholders/atp-molecule.svg',
    format: 'svg',
    scientificAccuracy: 'validated',
    ageAppropriate: true,
    license: 'creative-commons'
  }
};

// Color scheme for placeholder organelles
export const organelleColors: Record<OrganelleType, string> = {
  'mitochondria': '#ff6b6b',        // Red for power plants
  'nucleus': '#4ecdc4',             // Teal for city hall
  'endoplasmic-reticulum': '#45b7d1', // Blue for manufacturing
  'golgi-apparatus': '#f9ca24',     // Yellow for shipping
  'ribosomes': '#6c5ce7',           // Purple for factories
  'cell-membrane': '#a29bfe',       // Light purple for gates
  'cytoskeleton': '#fd79a8'         // Pink for infrastructure
};

// Generate placeholder 3D geometry for organelles
export const createPlaceholderGeometry = (type: OrganelleType) => {
  const geometries = {
    'mitochondria': {
      type: 'capsule',
      args: [0.5, 2, 4, 8],
      color: organelleColors.mitochondria
    },
    'nucleus': {
      type: 'sphere',
      args: [1.5, 32, 32],
      color: organelleColors.nucleus
    },
    'endoplasmic-reticulum': {
      type: 'torus',
      args: [2, 0.3, 16, 100],
      color: organelleColors['endoplasmic-reticulum']
    },
    'golgi-apparatus': {
      type: 'box',
      args: [1, 0.5, 2],
      color: organelleColors['golgi-apparatus']
    },
    'ribosomes': {
      type: 'sphere',
      args: [0.2, 16, 16],
      color: organelleColors.ribosomes
    },
    'cell-membrane': {
      type: 'sphere',
      args: [8, 32, 32],
      color: organelleColors['cell-membrane'],
      wireframe: true
    },
    'cytoskeleton': {
      type: 'cylinder',
      args: [0.05, 0.05, 10, 8],
      color: organelleColors.cytoskeleton
    }
  };

  return geometries[type] || geometries.mitochondria;
};

// Placeholder scientific content
export const placeholderScientificContent = {
  mitochondria: {
    basicExplanation: {
      analogy: "Mitochondria are like power plants in the cellular city",
      visualMetaphor: "Imagine tiny factories with smokestacks producing electricity",
      keyFunction: "They make energy (ATP) for the cell to use"
    },
    intermediateExplanation: {
      biologicalProcess: "Cellular respiration converts glucose and oxygen into ATP energy",
      cellularRole: "The powerhouse organelle that produces most cellular energy",
      sleepConnection: "When overworked, they leak electrons that create toxic sparks"
    },
    advancedExplanation: {
      molecularMechanism: "Electron transport chain complexes pump protons to drive ATP synthase",
      researchFindings: "2025 research shows electron leaks create ROS that signal sleep pressure",
      evolutionaryContext: "Ancient bacterial endosymbionts that became cellular power plants"
    }
  },
  nucleus: {
    basicExplanation: {
      analogy: "The nucleus is like City Hall - it controls everything in the cell",
      visualMetaphor: "A big building with important documents and control centers",
      keyFunction: "It contains DNA and controls what the cell does"
    },
    intermediateExplanation: {
      biologicalProcess: "Gene expression and DNA replication occur in the nucleus",
      cellularRole: "Control center that regulates all cellular activities",
      sleepConnection: "DNA repair processes are enhanced during sleep"
    },
    advancedExplanation: {
      molecularMechanism: "Transcription factors regulate gene expression patterns",
      researchFindings: "Sleep affects circadian gene expression cycles",
      evolutionaryContext: "Nuclear compartmentalization allowed complex gene regulation"
    }
  }
};

// Create placeholder SVG assets programmatically
export const generatePlaceholderSVG = (type: OrganelleType, size: number = 100): string => {
  const color = organelleColors[type];
  
  const svgTemplates: Record<OrganelleType, string> = {
    'mitochondria': `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="50" rx="40" ry="20" fill="${color}" stroke="#333" stroke-width="2"/>
        <path d="M20 50 Q30 40 40 50 Q50 60 60 50 Q70 40 80 50" 
              fill="none" stroke="#333" stroke-width="1"/>
        <text x="50" y="55" text-anchor="middle" font-size="8" fill="#333">Power Plant</text>
      </svg>
    `,
    'nucleus': `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="35" fill="${color}" stroke="#333" stroke-width="2"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#333" stroke-width="1"/>
        <circle cx="45" cy="45" r="3" fill="#333"/>
        <circle cx="55" cy="55" r="3" fill="#333"/>
        <text x="50" y="75" text-anchor="middle" font-size="8" fill="#333">City Hall</text>
      </svg>
    `,
    'endoplasmic-reticulum': `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 30 Q30 20 50 30 Q70 40 90 30 Q70 50 50 60 Q30 70 10 60 Q30 50 50 40 Q70 30 90 40" 
              fill="none" stroke="${color}" stroke-width="4"/>
        <circle cx="25" cy="35" r="2" fill="#333"/>
        <circle cx="45" cy="45" r="2" fill="#333"/>
        <circle cx="65" cy="35" r="2" fill="#333"/>
        <text x="50" y="85" text-anchor="middle" font-size="8" fill="#333">Factory</text>
      </svg>
    `,
    'golgi-apparatus': `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="60" height="10" fill="${color}" stroke="#333" stroke-width="1"/>
        <rect x="25" y="40" width="50" height="10" fill="${color}" stroke="#333" stroke-width="1"/>
        <rect x="30" y="50" width="40" height="10" fill="${color}" stroke="#333" stroke-width="1"/>
        <text x="50" y="75" text-anchor="middle" font-size="8" fill="#333">Shipping</text>
      </svg>
    `,
    'ribosomes': `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="15" fill="${color}" stroke="#333" stroke-width="2"/>
        <circle cx="50" cy="45" r="8" fill="#333"/>
        <text x="50" y="75" text-anchor="middle" font-size="8" fill="#333">Factory</text>
      </svg>
    `,
    'cell-membrane': `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="5,5"/>
        <text x="50" y="55" text-anchor="middle" font-size="8" fill="#333">Gates</text>
      </svg>
    `,
    'cytoskeleton': `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="10" y1="10" x2="90" y2="90" stroke="${color}" stroke-width="2"/>
        <line x1="90" y1="10" x2="10" y2="90" stroke="${color}" stroke-width="2"/>
        <line x1="50" y1="10" x2="50" y2="90" stroke="${color}" stroke-width="2"/>
        <text x="50" y="95" text-anchor="middle" font-size="8" fill="#333">Structure</text>
      </svg>
    `
  };

  return svgTemplates[type] || svgTemplates.mitochondria;
};

// Asset management utilities
export const placeholderAssetManager = {
  getAsset: (assetId: string): ScientificAsset | null => {
    return placeholderAssets[assetId] || null;
  },
  
  generatePlaceholderTexture: (type: OrganelleType): string => {
    const svg = generatePlaceholderSVG(type);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  },
  
  createPlaceholderAssets: (): void => {
    // This would generate all placeholder assets needed for development
    console.log('Creating placeholder assets for development...');
    
    Object.keys(organelleColors).forEach(type => {
      generatePlaceholderSVG(type as OrganelleType);
      console.log(`Generated placeholder for ${type}`);
    });
  }
};