# TypeScript Types Documentation

This directory contains all TypeScript type definitions, interfaces, and type utilities used throughout the application.

## File Overview

### index.ts
**Purpose**: Central type definitions for the entire application
**Organization**: Grouped by functional area for maintainability

## Type Categories

### Core Application Types

#### Vector3
```typescript
interface Vector3 {
  x: number;
  y: number;
  z: number;
}
```
**Purpose**: 3D coordinate representation
**Usage**: Position, rotation, scale values for 3D objects
**Compatibility**: Matches Three.js Vector3 structure

### User Progress Types

#### UserProgress
**Purpose**: Complete user progress tracking
**Properties**:
- `userId`: Unique identifier for user sessions
- `currentChapter`: Current progress position
- `completedChapters`: Array of finished chapters
- `discoveryPoints`, `scientistPoints`, `sleepPoints`: Point totals
- `achievements`: Array of Achievement objects
- `experimentResults`: Array of ExperimentResult objects
- `lastPlayedDate`: Session tracking

#### Achievement
**Purpose**: Individual achievement representation
**Properties**:
- `id`: Unique achievement identifier
- `title`: Display name
- `description`: Achievement description
- `type`: Category ('discovery' | 'scientist' | 'sleep')
- `unlockedAt`: Timestamp of unlock
- `icon`: Display icon identifier

#### ExperimentResult
**Purpose**: Saved experiment data
**Properties**:
- `id`: Unique result identifier
- `experimentType`: Type of experiment performed
- `results`: Flexible data storage
- `completedAt`: Completion timestamp

### Content Management Types

#### ChapterContent
**Purpose**: Complete chapter definition
**Properties**:
- `id`: Chapter number
- `title`: Chapter display name
- `learningObjectives`: Array of educational goals
- `cellularEnvironment`: 3D scene configuration
- `interactions`: Available interaction points
- `experiments`: Chapter-specific experiments
- `assessments`: Learning assessments
- `nextChapterUnlockCriteria`: Requirements for progression

#### EnvironmentConfig
**Purpose**: 3D scene setup configuration
**Properties**:
- `cameraPosition`: Default camera location
- `lighting`: Scene lighting configuration
- `organelles`: Array of organelle configurations
- `backgroundMusic`: Optional audio file

#### OrganelleConfig
**Purpose**: Individual organelle setup
**Properties**:
- `id`: Unique organelle identifier
- `type`: OrganelleType enum value
- `position`, `scale`, `rotation`: 3D transform data
- `model3D`: Asset file reference
- `animations`: Available animation clips
- `interactionZones`: Clickable areas
- `scientificInfo`: Educational content

### 3D Scene Types

#### OrganelleType
```typescript
type OrganelleType = 
  | 'mitochondria' 
  | 'nucleus' 
  | 'endoplasmic-reticulum' 
  | 'golgi-apparatus' 
  | 'ribosomes' 
  | 'cell-membrane'
  | 'cytoskeleton';
```
**Purpose**: Standardized organelle identification
**Usage**: Type safety for organelle-related functions
**Extensibility**: Add new organelles by extending this union type

#### InteractionZone
**Purpose**: Clickable area definition
**Properties**:
- `id`: Unique zone identifier
- `position`: 3D location
- `radius`: Interaction area size
- `type`: Interaction method ('click' | 'hover' | 'proximity')
- `action`: Action to perform

#### ScientificContent
**Purpose**: Layered educational content
**Structure**: Three levels of detail:
- `basicExplanation`: Simple analogies for young learners
- `intermediateExplanation`: More detailed biological processes
- `advancedExplanation`: Complex molecular mechanisms

### Game State Types

#### GameState
**Purpose**: Core game state representation
**Properties**:
- `currentChapter`: Active chapter number
- `isPlaying`: Play/pause state
- `isPaused`: Pause state
- `selectedOrganelle`: Currently selected organelle
- `cameraMode`: Camera control mode
- `interactionMode`: User interaction mode

#### UIState
**Purpose**: User interface state
**Properties**:
- `showTutorial`: Tutorial visibility
- `showHelp`, `showSettings`, `showProgress`: Panel visibility
- `activeModal`: Current modal identifier
- `notifications`: Active notification array

### Asset Management Types

#### ScientificAsset
**Purpose**: Asset metadata and management
**Properties**:
- `id`: Unique asset identifier
- `category`: Asset type classification
- `filePath`: File location
- `format`: File format ('svg' | 'png' | 'webp')
- `scientificAccuracy`: Validation level
- `ageAppropriate`: Suitability flag
- `license`: Usage rights

### Experiment Types

#### ExperimentType
```typescript
type ExperimentType = 'atp-measurement' | 'ros-observation' | 'sleep-comparison';
```
**Purpose**: Standardized experiment identification
**Extensibility**: Add new experiment types as needed

#### Experiment
**Purpose**: Experiment definition
**Properties**:
- `id`: Unique experiment identifier
- `title`: Display name
- `description`: Experiment overview
- `type`: ExperimentType value
- `instructions`: Step-by-step guide
- `expectedResults`: Learning outcomes
- `tools`: Required experiment tools

## Type Usage Patterns

### Component Props
```typescript
interface ComponentProps {
  organelleType: OrganelleType;
  position: Vector3;
  onInteraction?: (data: InteractionData) => void;
}
```

### Store Integration
```typescript
const { selectedOrganelle, setSelectedOrganelle } = useGameStore();
// selectedOrganelle is typed as OrganelleType | null
```

### Asset Loading
```typescript
const asset: ScientificAsset = await loadAsset(assetId);
// Full type safety for asset properties
```

## Maintenance Guidelines

### Adding New Types
1. Define interface in appropriate section
2. Export from index.ts
3. Update related components
4. Add documentation and examples
5. Consider backward compatibility

### Type Evolution
- Use union types for extensible enums
- Provide optional properties for gradual adoption
- Version interfaces for breaking changes
- Maintain type compatibility across stores

### Best Practices
- Use descriptive property names
- Provide JSDoc comments for complex types
- Group related types together
- Use generic types for reusable patterns
- Maintain consistency with existing patterns