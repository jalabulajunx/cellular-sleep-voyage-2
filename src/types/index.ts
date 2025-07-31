// Core application types
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface UserProgress {
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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'discovery' | 'scientist' | 'sleep';
  unlockedAt: Date;
  icon: string;
}

export interface ExperimentResult {
  id: string;
  experimentType: ExperimentType;
  results: Record<string, any>;
  completedAt: Date;
}

export type ExperimentType = 'atp-measurement' | 'ros-observation' | 'sleep-comparison';

export interface ChapterContent {
  id: number;
  title: string;
  learningObjectives: string[];
  cellularEnvironment: EnvironmentConfig;
  interactions: InteractionPoint[];
  experiments: Experiment[];
  assessments: Assessment[];
  nextChapterUnlockCriteria: UnlockCriteria;
}

export interface EnvironmentConfig {
  cameraPosition: Vector3;
  lighting: LightingConfig;
  organelles: OrganelleConfig[];
  backgroundMusic?: string;
}

export interface LightingConfig {
  ambient: {
    color: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    position: Vector3;
  };
}

export interface OrganelleConfig {
  id: string;
  type: OrganelleType;
  position: Vector3;
  scale: Vector3;
  rotation: Vector3;
  model3D: string;
  animations: AnimationClip[];
  interactionZones: InteractionZone[];
  scientificInfo: ScientificContent;
}

export type OrganelleType = 
  | 'mitochondria' 
  | 'nucleus' 
  | 'endoplasmic-reticulum' 
  | 'golgi-apparatus' 
  | 'ribosomes' 
  | 'cell-membrane'
  | 'cytoskeleton';

export interface AnimationClip {
  name: string;
  duration: number;
  loop: boolean;
  autoPlay: boolean;
}

export interface InteractionZone {
  id: string;
  position: Vector3;
  radius: number;
  type: 'click' | 'hover' | 'proximity';
  action: InteractionAction;
}

export interface InteractionAction {
  type: 'zoom' | 'rotate' | 'explode' | 'info' | 'experiment';
  parameters: Record<string, any>;
}

export interface InteractionPoint {
  id: string;
  organelleId: string;
  position: Vector3;
  type: 'hotspot' | 'clickable' | 'draggable';
  content: InteractionContent;
}

export interface InteractionContent {
  title: string;
  description: string;
  media?: string;
  nextAction?: string;
}

export interface Experiment {
  id: string;
  title: string;
  description: string;
  type: ExperimentType;
  instructions: string[];
  expectedResults: string[];
  tools: ExperimentTool[];
}

export interface ExperimentTool {
  id: string;
  name: string;
  type: 'microscope' | 'meter' | 'timer' | 'comparison';
  icon: string;
}

export interface Assessment {
  id: string;
  type: 'embedded' | 'quiz' | 'reflection';
  questions: AssessmentQuestion[];
  passingScore: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'drag-drop' | 'interaction';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

export interface UnlockCriteria {
  requiredPoints: {
    discovery?: number;
    scientist?: number;
    sleep?: number;
  };
  requiredExperiments: string[];
  requiredInteractions: string[];
}

export interface ScientificContent {
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

// Asset types
export interface ScientificAsset {
  id: string;
  category: 'organelle' | 'molecule' | 'process' | 'diagram';
  filePath: string;
  format: 'svg' | 'png' | 'webp';
  scientificAccuracy: 'peer-reviewed' | 'validated';
  ageAppropriate: boolean;
  license: 'biorender-educational' | 'creative-commons' | 'public-domain';
}

// Game state types
export interface GameState {
  currentChapter: number;
  isPlaying: boolean;
  isPaused: boolean;
  selectedOrganelle: string | null;
  cameraMode: 'free' | 'guided' | 'locked';
  interactionMode: 'explore' | 'experiment' | 'learn' | 'locked';
}

// UI types
export interface UIState {
  showTutorial: boolean;
  showHelp: boolean;
  showSettings: boolean;
  showProgress: boolean;
  activeModal: string | null;
  notifications: AppNotification[];
}

export interface AppNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}