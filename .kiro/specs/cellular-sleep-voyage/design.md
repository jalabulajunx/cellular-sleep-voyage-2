# Design Document: Cellular Sleep Voyage

## Overview

The Cellular Sleep Voyage is an immersive 3D web application that transforms complex mitochondrial sleep science into an engaging "Fantastic Voyage" style adventure for 10-year-old STEM enthusiasts. Users pilot a microscopic vessel through a living cell, discovering how overworked mitochondrial power plants create toxic sparks that signal the need for sleep.

The application combines cutting-edge WebGL 3D graphics with scientifically accurate content, progressive learning mechanics, and gamification elements to create an educational experience that maintains scientific rigor while captivating young learners through familiar analogies and hands-on exploration.

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  React Components  │  Three.js 3D Engine  │  UI Components  │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Game Engine  │  Progress Tracker  │  Content Manager      │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Local Storage  │  Content Assets  │  User Progress        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend Framework**: React 18 with TypeScript for component architecture and type safety
**3D Graphics**: Three.js with WebGL renderer for immersive cellular environments
**Scientific Visuals**: BioRender API integration for scientifically accurate cellular components, organelles, and biological process illustrations
**Animation**: React Spring for UI animations, Three.js built-in animation system for 3D
**State Management**: Zustand for lightweight, scalable state management
**Audio**: Web Audio API for spatial audio and narration
**Build System**: Vite for fast development and optimized production builds
**Styling**: Tailwind CSS for responsive design and consistent theming

### Deployment Architecture

**Static Hosting**: Deployed as a Progressive Web App (PWA) on CDN
**Asset Delivery**: 3D models, textures, and audio files served from optimized CDN
**Offline Support**: Service worker for offline access to completed chapters
**Performance**: Code splitting by chapter, lazy loading of 3D assets

## Visual Asset Integration

### Scientific Visual Asset Strategy

**Scientific Accuracy**: Create scientifically accurate biological illustrations using BioRender-style visual standards to ensure all cellular components, organelles, and molecular processes are consistent with professional scientific publications.

**Asset Acquisition Approaches**:

1. **BioRender Subscription License**: Purchase BioRender Pro/Team subscription for educational use, allowing export of custom illustrations as SVG/PNG files for integration into our web application.

2. **Custom Asset Creation**: Use BioRender's web-based editor to create project-specific illustrations, then export and optimize for web use:
   - Create cellular organelle illustrations with consistent styling
   - Design molecular process diagrams with age-appropriate simplification
   - Export as high-resolution SVG for scalability in 3D environments

3. **Open Scientific Resources**: Supplement with open-access scientific illustrations from:
   - NIH/NCBI image galleries
   - Creative Commons licensed scientific diagrams
   - Educational institution open courseware

**Required Asset Categories**:

**Priority 1 - Core Cellular Components (Chapter 1)**:
- Animal cell overview (eukaryotic cell cross-section)
- Mitochondria (multiple views: external, internal structure, cristae)
- Nucleus with nuclear envelope and chromatin
- Endoplasmic reticulum (rough and smooth)
- Golgi apparatus with vesicles
- Ribosomes (free and bound)
- Cell membrane with phospholipid bilayer
- Cytoskeleton (microtubules, microfilaments)

**Priority 2 - Mitochondrial Details (Chapter 2)**:
- Mitochondrial electron transport chain complexes (I, II, III, IV)
- ATP synthase complex (detailed structure)
- ATP molecules (various states)
- NADH and FADH2 molecules
- Oxygen molecules (O2)
- Electron flow arrows and pathways
- Inner and outer mitochondrial membranes
- Mitochondrial matrix components

**Priority 3 - Sleep Science Components (Chapter 3)**:
- Reactive oxygen species (ROS) particles/sparks
- Damaged cellular components (oxidized proteins, lipids)
- Sleep-wake cycle timeline diagram
- Neuron with dendrites and axon
- Fruit fly brain (dFBN neurons highlighted)
- Cellular repair mechanisms (antioxidants, cleanup crews)
- Before/after cellular health comparisons

**Priority 4 - Evolutionary Context (Chapter 5)**:
- Fruit fly (Drosophila) illustration
- Human cell vs fruit fly cell comparison
- Evolutionary timeline (600 million years)
- Various species silhouettes (jellyfish, mouse, elephant, human)
- Phylogenetic tree showing sleep evolution
- Comparative mitochondria across species

**Priority 5 - Interactive Elements**:
- Navigation arrows and UI icons
- Progress indicators and achievement badges
- Laboratory equipment (microscope, petri dishes)
- Game interface elements (buttons, meters, timers)
- Educational callout boxes and speech bubbles

**Implementation Approach**:
```typescript
interface ScientificAsset {
  id: string;
  category: 'organelle' | 'molecule' | 'process' | 'diagram';
  filePath: string; // Local asset path after export from BioRender
  format: 'svg' | 'png' | 'webp';
  scientificAccuracy: 'peer-reviewed' | 'validated';
  ageAppropriate: boolean;
  license: 'biorender-educational' | 'creative-commons' | 'public-domain';
}

class ScientificAssetManager {
  async loadAsset(assetId: string): Promise<ScientificAsset> {
    // Load pre-exported assets from local storage/CDN
    return await this.assetLoader.load(assetId);
  }
  
  convertTo3DTexture(asset: ScientificAsset): Three.Texture {
    // Convert SVG/PNG assets to WebGL-compatible textures
    return this.textureConverter.process(asset);
  }
  
  optimizeForWeb(asset: ScientificAsset): Promise<OptimizedAsset> {
    // Compress and optimize assets for web delivery
    return this.optimizer.process(asset);
  }
}
```

**Detailed Asset Specifications**:

**Mitochondria (Most Critical)**:
- External view: Bean-shaped organelle with double membrane
- Internal view: Cristae (folded inner membrane), matrix space
- Cross-section showing electron transport chain location
- "Power plant" styling with industrial elements for analogy
- Animated states: normal, overworked, damaged, repairing
- Color scheme: Traditional scientific (purple/pink) + kid-friendly variations

**Electron Transport Chain**:
- Complex I (NADH dehydrogenase) - first assembly line station
- Complex II (Succinate dehydrogenase) - second station  
- Complex III (Cytochrome bc1) - third station
- Complex IV (Cytochrome oxidase) - final station
- ATP synthase - the "generator" at the end
- Electron flow visualization (moving particles/arrows)
- Assembly line metaphor styling

**ATP Molecules**:
- Standard biochemical representation (adenine + ribose + 3 phosphates)
- Simplified "battery" version for younger audience
- Energy release animation (phosphate bond breaking)
- Multiple sizes for different zoom levels

**ROS/Toxic Sparks**:
- Scientifically accurate: superoxide, hydrogen peroxide, hydroxyl radicals
- Kid-friendly: electrical sparks, lightning bolts, danger symbols
- Animation: escaping from electron transport chain
- Damage effects: rust-like oxidation on cellular components

**Cell Overview**:
- Cutaway view showing all major organelles
- "Cellular city" styling with districts and neighborhoods
- Clear labels and connection lines
- Zoom-friendly scalable design
- Bright, engaging colors while maintaining scientific accuracy

**Licensing and Usage**:
- BioRender Educational License allows use of created illustrations in educational products
- All exported assets stored locally to avoid runtime API dependencies
- Proper attribution maintained for all scientific illustrations used
- SVG format preferred for scalability, PNG fallbacks for complex illustrations

**Quality Benefits**:
- Professional-grade scientific illustrations eliminate the need for custom biological artwork
- Consistent visual language across all cellular components
- Scientifically validated representations prevent misconceptions
- Scalable vector graphics maintain quality at all zoom levels
- Color schemes optimized for educational clarity

## Components and Interfaces

### Core Application Components

#### 1. App Shell Component
```typescript
interface AppShellProps {
  currentChapter: ChapterType;
  userProgress: UserProgress;
  onChapterChange: (chapter: ChapterType) => void;
}
```
- Manages overall application state and routing
- Handles chapter transitions and progress persistence
- Provides global UI elements (navigation, settings, help)

#### 2. Tutorial System Component
```typescript
interface TutorialSystemProps {
  isFirstTime: boolean;
  onTutorialComplete: () => void;
  onSkipTutorial: () => void;
}
```
- Interactive introduction to navigation controls
- Concept explanation with visual demonstrations
- Knowledge check before main journey begins

#### 3. 3D Cellular Environment Component
```typescript
interface CellularEnvironmentProps {
  chapterData: ChapterData;
  vesselPosition: Vector3;
  onInteraction: (organelle: OrganelleType) => void;
  showHints: boolean;
}
```
- Renders the main 3D cellular city using Three.js
- Manages camera controls and vessel navigation
- Handles organelle interactions and hotspot detection

#### 4. Chapter Manager Component
```typescript
interface ChapterManagerProps {
  currentChapter: number;
  chapterContent: ChapterContent[];
  onChapterComplete: (chapterData: CompletionData) => void;
}
```
- Orchestrates chapter progression and content delivery
- Manages learning objectives and success criteria
- Provides chapter summaries and transition animations

#### 5. Virtual Laboratory Component
```typescript
interface VirtualLabProps {
  experimentType: ExperimentType;
  specimens: SpecimenData[];
  onExperimentComplete: (results: ExperimentResults) => void;
}
```
- Simulates microscopy and experimental tools
- Manages specimen comparison and data collection
- Provides real-time feedback on experimental results

### Data Models

#### User Progress Model
```typescript
interface UserProgress {
  userId: string;
  currentChapter: number;
  completedChapters: number[];
  discoveryPoints: number;
  scientistPoints: number;
  sleepPoints: number;
  achievements: Achievement[];
  experimentResults: ExperimentResult[];
  lastPlayedDate: Date;
}
```

#### Chapter Content Model
```typescript
interface ChapterContent {
  id: number;
  title: string;
  learningObjectives: string[];
  cellularEnvironment: EnvironmentConfig;
  interactions: InteractionPoint[];
  experiments: Experiment[];
  assessments: Assessment[];
  nextChapterUnlockCriteria: UnlockCriteria;
}
```

#### Organelle Model
```typescript
interface Organelle {
  id: string;
  type: OrganelleType;
  position: Vector3;
  scale: Vector3;
  model3D: string;
  bioRenderAssets: BioRenderAsset[];
  animations: AnimationClip[];
  interactionZones: InteractionZone[];
  scientificInfo: ScientificContent;
}
```

#### Scientific Asset Integration Model
```typescript
interface ScientificAssetManager {
  loadOrganelleTextures(organelleType: OrganelleType): Promise<Texture[]>;
  getMolecularDiagrams(processType: BiologicalProcess): Promise<SVGElement[]>;
  getSpeciesComparisons(species: Species[]): Promise<ComparisonAsset[]>;
  optimizeForWebGL(asset: ScientificAsset): Promise<WebGLTexture>;
  
  // Asset pipeline management
  preloadChapterAssets(chapterId: number): Promise<void>;
  cacheOptimizedAssets(assets: ScientificAsset[]): Promise<void>;
  validateScientificAccuracy(asset: ScientificAsset): boolean;
}
```

## Data Models

### Cellular Environment Data Structure

The cellular environment is modeled as a hierarchical city structure:

```typescript
interface CellularCity {
  districts: {
    nucleus: CityHall;
    mitochondria: PowerPlant[];
    endoplasmicReticulum: ManufacturingDistrict;
    golgiApparatus: ShippingDistrict;
    ribosomes: Factory[];
    cellMembrane: CityGates;
  };
  infrastructure: {
    cytoskeleton: TransportNetwork;
    vesicles: DeliveryVehicles[];
    cytoplasm: CityAtmosphere;
  };
  dynamicSystems: {
    electronTransportChains: AssemblyLine[];
    atpProduction: EnergyGrid;
    rosGeneration: ToxicSparks[];
    sleepPressure: DamageAccumulator;
  };
}
```

### Scientific Content Model

Each organelle and process contains layered scientific information:

```typescript
interface ScientificContent {
  basicExplanation: {
    analogy: string;
    visualMetaphor: string;
    keyFunction: string;
  };
  intermediateExplanation: {
    biologicalProcess: string;
    cellularRole: string;
    sleepConnection: string;
  };
  advancedExplanation: {
    molecularMechanism: string;
    researchFindings: string;
    evolutionaryContext: string;
  };
}
```

## Error Handling

### 3D Rendering Error Handling

**WebGL Compatibility**: Graceful fallback to 2D canvas rendering for unsupported devices
**Memory Management**: Automatic disposal of 3D assets when switching chapters
**Performance Monitoring**: FPS tracking with automatic quality reduction on low-end devices

```typescript
class RenderingErrorHandler {
  handleWebGLError(error: WebGLError): void {
    // Log error and switch to 2D fallback mode
    this.enableFallbackMode();
    this.notifyUser("Switching to compatibility mode");
  }
  
  handleMemoryPressure(): void {
    // Reduce texture quality and dispose unused assets
    this.optimizeMemoryUsage();
  }
}
```

### Content Loading Error Handling

**Asset Loading**: Retry mechanism with exponential backoff for failed asset loads
**Progress Recovery**: Automatic save/restore of user progress with corruption detection
**Network Issues**: Offline mode with cached content for completed chapters

```typescript
class ContentErrorHandler {
  async loadChapterContent(chapterId: number): Promise<ChapterContent> {
    try {
      return await this.contentLoader.load(chapterId);
    } catch (error) {
      if (error instanceof NetworkError) {
        return this.loadCachedContent(chapterId);
      }
      throw new ContentLoadError(`Failed to load chapter ${chapterId}`);
    }
  }
}
```

### User Input Error Handling

**Navigation Bounds**: Prevent vessel from leaving cellular boundaries
**Interaction Validation**: Ensure interactions are contextually appropriate
**Progress Validation**: Verify chapter completion criteria before advancement

## Testing Strategy

### Unit Testing Strategy

**Component Testing**: Jest and React Testing Library for UI components
**3D Scene Testing**: Custom test utilities for Three.js scene validation
**Game Logic Testing**: Comprehensive test coverage for progress tracking and scoring

```typescript
// Example test structure
describe('MitochondriaComponent', () => {
  it('should display power plant analogy correctly', () => {
    render(<MitochondriaComponent showAnalogy={true} />);
    expect(screen.getByText(/power plant/i)).toBeInTheDocument();
  });
  
  it('should animate electron leaks when overworked', () => {
    const { container } = render(
      <MitochondriaComponent isOverworked={true} />
    );
    expect(container.querySelector('.toxic-sparks')).toHaveClass('animated');
  });
});
```

### Integration Testing Strategy

**Chapter Flow Testing**: End-to-end testing of chapter progression and content delivery
**3D Interaction Testing**: Automated testing of vessel navigation and organelle interactions
**Progress Persistence Testing**: Validation of save/load functionality across sessions

### Performance Testing Strategy

**3D Rendering Performance**: Frame rate monitoring across different device capabilities
**Memory Usage Testing**: Memory leak detection and asset loading optimization
**Load Time Testing**: Chapter loading performance across different network conditions

### Accessibility Testing Strategy

**Screen Reader Compatibility**: ARIA labels and descriptions for all interactive elements
**Keyboard Navigation**: Full keyboard accessibility for users unable to use mouse/touch
**Color Contrast Testing**: WCAG 2.1 AA compliance for all visual elements
**Audio Description Testing**: Comprehensive audio descriptions for visual content

### Educational Effectiveness Testing

**Learning Outcome Assessment**: Pre/post knowledge assessments to measure learning gains
**Engagement Metrics**: Time-on-task and interaction frequency analysis
**Concept Retention Testing**: Delayed recall assessments for key scientific concepts

## Chapter-Specific Design Details

### Chapter 1: Welcome to the Cellular City
**Environment**: Bright, colorful cellular overview with clearly labeled districts
**Key Interactions**: Basic navigation, organelle identification, city analogy introduction
**Learning Goals**: Understand cellular organization and power plant metaphor
**3D Assets**: Stylized organelles with cartoon-like appearance, friendly animations

### Chapter 2: Inside the Power Plants
**Environment**: Detailed mitochondrial interior with assembly line visualizations
**Key Interactions**: Electron transport chain game, ATP production simulation
**Learning Goals**: Understand energy production and electron flow
**3D Assets**: Mechanical assembly lines, electron particles, ATP molecules

### Chapter 3: When Power Plants Overwork
**Environment**: Stressed mitochondria with visible sparks and damage
**Key Interactions**: Manage workload, observe ROS generation, trigger repair systems
**Learning Goals**: Connect cellular stress to sleep pressure
**3D Assets**: Damaged infrastructure, toxic spark effects, repair crew animations

### Chapter 4: The Sleep Solution
**Environment**: Time-lapse cellular repair during sleep cycles
**Key Interactions**: Control sleep-wake cycles, monitor cellular health
**Learning Goals**: Understand sleep as cellular maintenance time
**3D Assets**: Repair animations, health meters, before/after comparisons

### Chapter 5: The 600-Million-Year Story
**Environment**: Evolutionary timeline with species comparisons
**Key Interactions**: Compare cellular structures across species, timeline navigation
**Learning Goals**: Understand evolutionary conservation of sleep mechanisms
**3D Assets**: Species models, timeline interface, comparative cellular structures

## User Experience Flow

### Onboarding Experience
1. **Animated Introduction**: "Fantastic Voyage" style shrinking sequence
2. **Control Tutorial**: Practice vessel navigation in safe environment
3. **Concept Introduction**: Basic cellular city analogy with visual tour
4. **Readiness Check**: Simple quiz to confirm understanding before main journey

### Chapter Progression Flow
1. **Chapter Introduction**: Learning objectives and preview of discoveries
2. **Guided Exploration**: Structured interactions with contextual hints
3. **Hands-on Experiments**: Virtual laboratory activities with real-time feedback
4. **Concept Explanation**: Scientific significance and real-world connections
5. **Chapter Summary**: Key discoveries and preview of next chapter

### Assessment and Feedback System
- **Embedded Assessments**: Natural interactions that reveal understanding
- **Real-time Feedback**: Immediate visual and audio responses to actions
- **Progress Visualization**: Clear indicators of learning advancement
- **Reflection Tools**: Opportunities to connect learning to personal experiences