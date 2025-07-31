# Cellular Sleep Voyage - Source Code Documentation

## Project Overview

The Cellular Sleep Voyage is an interactive 3D web application that teaches 10-year-old STEM enthusiasts about mitochondrial sleep science through a "Fantastic Voyage" style experience. Users pilot a microscopic vessel through a living cell to discover how overworked mitochondrial power plants create toxic sparks that signal the need for sleep.

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: Zustand
- **Animation**: React Spring
- **Build System**: Vite
- **Styling**: CSS3 with custom properties

## Project Structure

```
cellular-sleep-voyage/
├── src/
│   ├── components/
│   │   ├── 3d/           # 3D scene components
│   │   ├── ui/           # User interface components
│   │   └── tutorial/     # Tutorial system (planned)
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions and helpers
│   ├── assets/           # Static assets and placeholders
│   ├── App.tsx           # Main application component
│   ├── App.css           # Global styles
│   ├── index.css         # Base CSS and design system
│   └── main.tsx          # Application entry point
├── docs/                 # Documentation
├── .kiro/specs/          # Project specifications
└── public/               # Static public assets
```

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow React functional component patterns
- Use custom hooks for reusable logic
- Implement proper error boundaries
- Add comprehensive JSDoc comments

### Performance Considerations
- Lazy load 3D assets
- Use React.memo for expensive components
- Implement proper cleanup in useEffect
- Monitor frame rates and optimize accordingly

### Accessibility
- Provide keyboard navigation
- Include ARIA labels and descriptions
- Support high contrast mode
- Ensure touch-friendly interactions

## Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview production build: `npm run preview`

## Architecture Patterns

### State Management
- Global state managed by Zustand stores
- Component-specific state using useState
- Persistent state for user progress

### 3D Scene Management
- Scene components wrapped in Canvas
- Camera controls outside Canvas using refs
- Asset management with placeholder system

### Component Communication
- Props for parent-child communication
- Global stores for cross-component state
- Custom events for 3D interactions

## Asset System

The application features a comprehensive asset management system designed for educational 3D content with scientific accuracy and performance optimization.

### Key Features
- **Multi-Resolution Support**: Automatic generation of 4 resolution levels (256px to 2048px)
- **Quality Adaptation**: Dynamic quality adjustment based on device performance
- **Lazy Loading**: On-demand asset loading with priority management
- **Memory Management**: Intelligent caching with automatic cleanup
- **Scientific Accuracy**: Integration with BioRender-style scientific illustrations

### Documentation
- **[Complete Asset System Guide](./AssetSystemGuide.md)**: Comprehensive documentation covering architecture, processes, and maintenance
- **[Quick Reference](./AssetSystemQuickReference.md)**: Essential commands and common operations
- **[Placeholder Assets](./utils/placeholderAssets.md)**: Development asset system and scientific content

### Basic Usage
```typescript
import { assetManager, assetQualityManager } from './utils';

// Initialize and load chapter assets
await assetManager.initialize();
await assetManager.loadChapterAssets(1);

// Get 3D models and textures
const model = await assetManager.getOrganelleModel('mitochondria');
const texture = await assetManager.getOrganelleTexture('nucleus');
```