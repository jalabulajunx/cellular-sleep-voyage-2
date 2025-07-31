# State Management Documentation

This directory contains Zustand stores that manage global application state, including game state, user progress, UI state, and content management.

## Store Overview

### gameStore.ts
**Purpose**: Centralized state management for the entire application
**Architecture**: Multiple specialized stores using Zustand

## Store Breakdown

### GameStore (useGameStore)
**Purpose**: Core game state and interaction modes
**State Properties**:
- `currentChapter`: Current chapter number (1-5)
- `isPlaying`: Whether the experience is active
- `isPaused`: Pause state for animations
- `selectedOrganelle`: Currently selected organelle ID
- `cameraMode`: Camera control mode ('free' | 'guided' | 'locked')
- `interactionMode`: User interaction mode ('explore' | 'experiment' | 'learn' | 'locked')

**Actions**:
- `setCurrentChapter(chapter)`: Navigate to specific chapter
- `setPlaying(playing)`: Control play/pause state
- `setPaused(paused)`: Control pause state
- `setSelectedOrganelle(id)`: Select/deselect organelles
- `setCameraMode(mode)`: Change camera control behavior
- `setInteractionMode(mode)`: Change interaction behavior

**Usage Example**:
```typescript
const { currentChapter, setCurrentChapter, selectedOrganelle } = useGameStore();
```

### ProgressStore (useProgressStore)
**Purpose**: User progress tracking and persistence
**Persistence**: Automatically saved to localStorage
**State Properties**:
- `userId`: Unique user identifier
- `currentChapter`: Progress tracking
- `completedChapters`: Array of completed chapter IDs
- `discoveryPoints`: Points for finding organelles
- `scientistPoints`: Points for detailed exploration
- `sleepPoints`: Points for sleep-related learning
- `achievements`: Array of unlocked achievements
- `experimentResults`: Saved experiment data
- `lastPlayedDate`: Last session timestamp

**Actions**:
- `addDiscoveryPoints(points)`: Award discovery points
- `addScientistPoints(points)`: Award scientist points
- `addSleepPoints(points)`: Award sleep points
- `completeChapter(id)`: Mark chapter as completed
- `unlockAchievement(id)`: Add new achievement
- `saveExperimentResult(result)`: Store experiment data

**Persistence Configuration**:
- Storage key: 'cellular-sleep-voyage-progress'
- Version: 1 (for migration support)
- Auto-saves on all state changes

### UIStore (useUIStore)
**Purpose**: User interface state and notifications
**State Properties**:
- `showTutorial`: Tutorial overlay visibility
- `showHelp`: Help panel visibility
- `showSettings`: Settings panel visibility
- `showProgress`: Progress panel visibility
- `activeModal`: Currently active modal ID
- `notifications`: Array of active notifications

**Actions**:
- `setShowTutorial(show)`: Control tutorial visibility
- `setShowHelp(show)`: Control help panel
- `setShowSettings(show)`: Control settings panel
- `setShowProgress(show)`: Control progress panel
- `setActiveModal(id)`: Show/hide modals
- `addNotification(notification)`: Add toast notification
- `removeNotification(id)`: Remove specific notification

**Notification System**:
- Auto-generates unique IDs
- Supports multiple types: success, info, warning, error
- Configurable duration and actions

### ContentStore (useContentStore)
**Purpose**: Chapter content and educational material management
**State Properties**:
- `chapters`: Array of all chapter content
- `currentChapterContent`: Active chapter data

**Actions**:
- `loadChapterContent(id)`: Load specific chapter
- `setChapters(chapters)`: Set all chapter data

**Content Structure**:
- Learning objectives per chapter
- Cellular environment configurations
- Interaction points and experiments
- Assessment criteria and unlock requirements

## State Flow Patterns

### Chapter Navigation
1. User selects chapter → `setCurrentChapter()`
2. Content loads → `loadChapterContent()`
3. UI updates → Camera and organelles adjust
4. Progress tracks → Auto-save to localStorage

### Discovery Flow
1. User clicks organelle → `setSelectedOrganelle()`
2. Points awarded → `addDiscoveryPoints()`
3. Notification shown → `addNotification()`
4. Achievement check → `unlockAchievement()` if applicable

### Mode Switching
1. User changes mode → `setInteractionMode()`
2. Camera adjusts → `setCameraMode()` if needed
3. UI updates → Controls and indicators change
4. Behavior changes → Different interaction patterns

## Maintenance Guidelines

### Adding New State
1. Define TypeScript interfaces in types/index.ts
2. Add state properties to appropriate store
3. Create action functions with proper typing
4. Update persistence configuration if needed
5. Add documentation and usage examples

### Performance Considerations
- Use selectors to prevent unnecessary re-renders
- Batch related state updates when possible
- Consider splitting large stores if needed
- Monitor localStorage size for persistence

### Debugging
- Use Zustand devtools for state inspection
- Add console logging for critical state changes
- Implement state validation in development mode
- Track state change patterns for optimization