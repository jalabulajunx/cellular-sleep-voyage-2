import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, UserProgress, UIState, ChapterContent } from '../types';

interface GameStore extends GameState {
  // Game state actions
  setCurrentChapter: (chapter: number) => void;
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setSelectedOrganelle: (organelleId: string | null) => void;
  setCameraMode: (mode: 'free' | 'guided' | 'locked') => void;
  setInteractionMode: (mode: 'explore' | 'experiment' | 'learn') => void;
}

interface ProgressStore extends UserProgress {
  // Progress actions
  addDiscoveryPoints: (points: number) => void;
  addScientistPoints: (points: number) => void;
  addSleepPoints: (points: number) => void;
  completeChapter: (chapterId: number) => void;
  unlockAchievement: (achievementId: string) => void;
  saveExperimentResult: (result: any) => void;
}

interface UIStore extends UIState {
  // UI actions
  setShowTutorial: (show: boolean) => void;
  setShowHelp: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowProgress: (show: boolean) => void;
  setActiveModal: (modalId: string | null) => void;
  addNotification: (notification: Omit<import('../types').AppNotification, 'id'>) => void;
  removeNotification: (notificationId: string) => void;
}

interface ContentStore {
  chapters: ChapterContent[];
  currentChapterContent: ChapterContent | null;
  loadChapterContent: (chapterId: number) => Promise<void>;
  setChapters: (chapters: ChapterContent[]) => void;
}

// Game state store
export const useGameStore = create<GameStore>((set) => ({
  currentChapter: 1,
  isPlaying: false,
  isPaused: false,
  selectedOrganelle: null,
  cameraMode: 'free',
  interactionMode: 'explore',

  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPaused: (paused) => set({ isPaused: paused }),
  setSelectedOrganelle: (organelleId) => set({ selectedOrganelle: organelleId }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setInteractionMode: (mode) => set({ interactionMode: mode }),
}));

// Progress store with persistence
export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      userId: crypto.randomUUID(),
      currentChapter: 1,
      completedChapters: [],
      discoveryPoints: 0,
      scientistPoints: 0,
      sleepPoints: 0,
      achievements: [],
      experimentResults: [],
      lastPlayedDate: new Date(),

      addDiscoveryPoints: (points) => 
        set((state) => ({ 
          discoveryPoints: state.discoveryPoints + points,
          lastPlayedDate: new Date()
        })),
      
      addScientistPoints: (points) => 
        set((state) => ({ 
          scientistPoints: state.scientistPoints + points,
          lastPlayedDate: new Date()
        })),
      
      addSleepPoints: (points) => 
        set((state) => ({ 
          sleepPoints: state.sleepPoints + points,
          lastPlayedDate: new Date()
        })),
      
      completeChapter: (chapterId) => 
        set((state) => ({
          completedChapters: [...state.completedChapters, chapterId],
          currentChapter: Math.max(state.currentChapter, chapterId + 1),
          lastPlayedDate: new Date()
        })),
      
      unlockAchievement: (achievementId) => 
        set((state) => ({
          achievements: [
            ...state.achievements,
            {
              id: achievementId,
              title: `Achievement ${achievementId}`,
              description: 'Achievement unlocked!',
              type: 'discovery' as const,
              unlockedAt: new Date(),
              icon: 'star'
            }
          ],
          lastPlayedDate: new Date()
        })),
      
      saveExperimentResult: (result) => 
        set((state) => ({
          experimentResults: [...state.experimentResults, {
            id: crypto.randomUUID(),
            experimentType: result.type,
            results: result.data,
            completedAt: new Date()
          }],
          lastPlayedDate: new Date()
        })),
    }),
    {
      name: 'cellular-sleep-voyage-progress',
      version: 1,
    }
  )
);

// UI state store
export const useUIStore = create<UIStore>((set) => ({
  showTutorial: true,
  showHelp: false,
  showSettings: false,
  showProgress: false,
  activeModal: null,
  notifications: [],

  setShowTutorial: (show) => set({ showTutorial: show }),
  setShowHelp: (show) => set({ showHelp: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowProgress: (show) => set({ showProgress: show }),
  setActiveModal: (modalId) => set({ activeModal: modalId }),
  
  addNotification: (notification) => 
    set((state) => ({
      notifications: [...state.notifications, {
        id: crypto.randomUUID(),
        ...notification
      }]
    })),
  
  removeNotification: (notificationId) => 
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== notificationId)
    })),
}));

// Content store
export const useContentStore = create<ContentStore>((set) => ({
  chapters: [],
  currentChapterContent: null,

  loadChapterContent: async (chapterId: number) => {
    // For now, we'll create placeholder content
    // Later this will load from actual content files
    const placeholderContent: ChapterContent = {
      id: chapterId,
      title: `Chapter ${chapterId}: Cellular Adventure`,
      learningObjectives: [
        'Understand cellular structure',
        'Explore organelle functions',
        'Connect to sleep science'
      ],
      cellularEnvironment: {
        cameraPosition: { x: 0, y: 0, z: 10 },
        lighting: {
          ambient: { color: '#ffffff', intensity: 0.6 },
          directional: { color: '#ffffff', intensity: 0.8, position: { x: 1, y: 1, z: 1 } }
        },
        organelles: []
      },
      interactions: [],
      experiments: [],
      assessments: [],
      nextChapterUnlockCriteria: {
        requiredPoints: { discovery: 100 },
        requiredExperiments: [],
        requiredInteractions: []
      }
    };

    set({ currentChapterContent: placeholderContent });
  },

  setChapters: (chapters) => set({ chapters }),
}));