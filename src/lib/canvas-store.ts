import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CanvasObject {
  id: string;
  type: "rectangle" | "circle" | "text" | "image" | "frame" | "icon";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  src?: string;
  iconName?: string;
  opacity?: number;
  parentId?: string;
  speakerNotes?: string;
}

export interface PresentationSettings {
  transitionDuration: number;
  autoPlay: boolean;
  autoPlayInterval: number;
  loop: boolean;
  showProgressBar: boolean;
  showFrameTitles: boolean;
  darkBackground: boolean;
}


interface CanvasStore {
  objects: CanvasObject[];
  frames: { id: string; name: string; order: number }[]; // Keeping legacy frames for now if needed
  selection: string[];
  viewport: { x: number; y: number; zoom: number };
  activeOverlay: 'templates' | 'export' | 'settings' | 'presentation' | null;
  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;
  
  // Presentation State
  isPresenting: boolean;
  currentFrameIndex: number;
  presentationPath: string[]; // List of object IDs that are frames, in order
  presentationSettings: PresentationSettings;
  startPresentation: (startFromFrameId?: string) => void;
  stopPresentation: () => void;
  nextFrame: () => void;
  prevFrame: () => void;
  goToFrame: (index: number) => void;
  setPresentationPath: (path: string[]) => void;
  updatePresentationSettings: (settings: Partial<PresentationSettings>) => void;

  
  // Basic Actions
  addObject: (obj: Omit<CanvasObject, "id">) => string;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  deleteObjects: (ids: string[]) => void;
  
  // Selection
  setSelection: (ids: string[]) => void;
  
  // Viewport
  setViewport: (v: { x: number; y: number; zoom: number }) => void;
  
  // History is handled by a separate mechanism or simplified here
  history: {
    past: CanvasObject[][];
    future: CanvasObject[][];
  };
  undo: () => void;
  redo: () => void;
  
  // Advanced Actions
  duplicateObjects: (ids: string[]) => void;
  groupObjects: (ids: string[]) => void;
  ungroupObjects: (ids: string[]) => void;

  // System
  lastSaved: number | null;
  clear: () => void;
  save: () => void;
  setActiveOverlay: (overlay: 'templates' | 'export' | 'settings' | null) => void;
  loadTemplate: (objects: CanvasObject[]) => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      objects: [],
      frames: [
        { id: 'f1', name: 'Frame 1', order: 0 },
        { id: 'f2', name: 'Frame 2', order: 1 },
        { id: 'f3', name: 'Frame 3', order: 2 },
        { id: 'f4', name: 'Frame 4', order: 3 },
      ],
      selection: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      activeOverlay: null,
      snapEnabled: true,
      isPresenting: false,
      currentFrameIndex: 0,
      presentationPath: [],
      presentationSettings: {
        transitionDuration: 800,
        autoPlay: false,
        autoPlayInterval: 5000,
        loop: false,
        showProgressBar: true,
        showFrameTitles: true,
        darkBackground: false,
      },
      setSnapEnabled: (snapEnabled) => set({ snapEnabled }),
      history: { past: [], future: [] },
      lastSaved: Date.now(),

      startPresentation: (startFromFrameId) => {
        const { objects, presentationPath } = get();
        let path = presentationPath;
        
        // If path is empty, auto-generate from frames sorted by x/y
        if (path.length === 0) {
          path = objects
            .filter(o => o.type === 'frame')
            .sort((a, b) => (a.y - b.y) || (a.x - b.x))
            .map(o => o.id);
        }

        if (path.length === 0) {
          return;
        }

        const startIndex = startFromFrameId 
          ? path.indexOf(startFromFrameId) 
          : 0;

        set({ 
          isPresenting: true, 
          currentFrameIndex: startIndex === -1 ? 0 : startIndex,
          presentationPath: path,
          activeOverlay: 'presentation'
        });
      },

      stopPresentation: () => set({ isPresenting: false, activeOverlay: null }),

      nextFrame: () => {
        const { currentFrameIndex, presentationPath, presentationSettings } = get();
        if (currentFrameIndex < presentationPath.length - 1) {
          set({ currentFrameIndex: currentFrameIndex + 1 });
        } else if (presentationSettings.loop) {
          set({ currentFrameIndex: 0 });
        }
      },

      prevFrame: () => {
        const { currentFrameIndex } = get();
        if (currentFrameIndex > 0) {
          set({ currentFrameIndex: currentFrameIndex - 1 });
        }
      },

      goToFrame: (index) => {
        const { presentationPath } = get();
        if (index >= 0 && index < presentationPath.length) {
          set({ currentFrameIndex: index });
        }
      },

      setPresentationPath: (presentationPath) => set({ presentationPath }),
      
      updatePresentationSettings: (settings) => set((state) => ({
        presentationSettings: { ...state.presentationSettings, ...settings }
      })),


      addObject: (obj) => {
        const id = Math.random().toString(36).substring(7);
        const newObj = { ...obj, id };
        set((state) => {
          const nextPath = obj.type === 'frame' 
            ? [...state.presentationPath, id] 
            : state.presentationPath;
            
          return {
            lastSaved: Date.now(),
            history: {
              past: [...state.history.past, state.objects].slice(-50),
              future: [],
            },
            objects: [...state.objects, newObj],
            presentationPath: nextPath
          };
        });
        return id;
      },


      updateObject: (id, patch) => {
        const currentObjects = get().objects;
        const target = currentObjects.find(o => o.id === id);
        
        // Skip if no changes
        if (!target) return;
        const hasChanges = Object.keys(patch).some(key => (patch as any)[key] !== (target as any)[key]);
        if (!hasChanges) return;

        set((state) => ({
          history: {
            past: [...state.history.past, state.objects].slice(-50),
            future: [],
          },
          objects: state.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }));
      },

      deleteObjects: (ids) => {
        if (ids.length === 0) return;
        set((state) => ({
          history: {
            past: [...state.history.past, state.objects].slice(-50),
            future: [],
          },
          objects: state.objects.filter((o) => !ids.includes(o.id)),
          selection: state.selection.filter((id) => !ids.includes(id)),
          presentationPath: state.presentationPath.filter((id) => !ids.includes(id))
        }));
      },


      setSelection: (selection) => {
        const current = get().selection;
        if (current.length === selection.length && current.every((id, i) => id === selection[i])) return;
        set({ selection });
      },

      setViewport: (viewport) => {
        const current = get().viewport;
        if (current.x === viewport.x && current.y === viewport.y && current.zoom === viewport.zoom) return;
        set({ viewport });
      },

      undo: () => {
        const { past, future } = get().history;
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        set((state) => ({
          objects: previous,
          history: {
            past: newPast,
            future: [state.objects, ...future].slice(0, 50),
          },
        }));
      },

      redo: () => {
        const { past, future } = get().history;
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        set((state) => ({
          objects: next,
          history: {
            past: [...past, state.objects].slice(-50),
            future: newFuture,
          },
        }));
      },

      duplicateObjects: (ids) => {
        if (ids.length === 0) return;
        const { objects } = get();
        const toDuplicate = objects.filter(o => ids.includes(o.id));
        const newObjects = toDuplicate.map(o => ({
          ...o,
          id: Math.random().toString(36).substring(7),
          x: o.x + 20,
          y: o.y + 20
        }));
        
        set((state) => ({
          history: { past: [...state.history.past, state.objects].slice(-50), future: [] },
          objects: [...state.objects, ...newObjects],
          selection: newObjects.map(o => o.id)
        }));
      },

      groupObjects: (ids) => {
        console.log("Grouping", ids);
      },

      ungroupObjects: (ids) => {
        console.log("Ungrouping", ids);
      },

      clear: () => set({ objects: [], selection: [], history: { past: [], future: [] }, lastSaved: null }),
      save: () => set({ lastSaved: Date.now() }),
      setActiveOverlay: (activeOverlay) => set({ activeOverlay }),
      loadTemplate: (templateObjects) => {
        console.log("CanvasStore: loadTemplate called with objects:", templateObjects);
        
        if (!templateObjects || !Array.isArray(templateObjects)) {
          console.error("CanvasStore: Invalid template objects received:", templateObjects);
          return;
        }

        const objectsWithIds = templateObjects.map(obj => ({
          ...obj,
          id: obj.id || Math.random().toString(36).substring(7)
        }));
        
        const presentationPath = objectsWithIds
          .filter(o => o.type === 'frame')
          .map(o => o.id);

        console.log("CanvasStore: Applying new state with objects:", objectsWithIds.length);

        set((state) => ({
          objects: objectsWithIds,
          presentationPath,
          selection: [],
          viewport: { x: 100, y: 100, zoom: 0.8 },
          history: { past: [...state.history.past, state.objects].slice(-50), future: [] },
          activeOverlay: null
        }));
      },
    }),
    {
      name: "zoomcanvas-v4-storage",
      partialize: (state) => ({ 
        objects: state.objects, 
        viewport: state.viewport,
        presentationPath: state.presentationPath,
        presentationSettings: state.presentationSettings
      }),

    }
  )
);
