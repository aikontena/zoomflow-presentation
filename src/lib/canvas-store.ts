import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface FrameSettings {
  duration: number;
  easing: 'smooth' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cinematic' | 'fast' | 'slow' | 'bounce' | 'morph' | 'fade' | 'push' | 'reveal' | 'cut' | 'fall' | 'wind' | 'zoom' | 'pan' | 'orbit' | 'elastic' | 'spring' | 'drape' | 'vortex' | 'origami';
  pathType?: 'linear' | 'curved' | 'spiral' | 'bounce' | 'zoom-out';
  camera: CameraState;
  delay?: number;
  autoNext?: boolean;
}

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
  locked?: boolean;
  shadow?: boolean;
  parentId?: string;
  speakerNotes?: string;
  // Frame-specific settings
  settings?: FrameSettings;
}

export interface PresentationSettings {
  transitionDuration: number;
  autoPlay: boolean;
  autoPlayInterval: number;
  loop: boolean;
  showProgressBar: boolean;
  showFrameTitles: boolean;
  darkBackground: boolean;
  type: 'linear' | 'spatial' | 'spiral' | 'grid';
  zoomPadding: number; // 0 to 1, where 0 is tight fit and 1 is lots of space
  zoomOutBeforeStart?: boolean;
  autoFit?: boolean;
  backgroundColor?: string;
  backgroundImage?: string;
  // Manual camera controls (Prezi-style free navigation)
  zoomSpeed: number; // multiplier for wheel zoom intensity
  smoothness: string; // easing used for camera button moves
  manualZoom: boolean;
  manualPan: boolean;
  showMiniMap: boolean;
}

export interface Bookmark {
  id: string;
  label: string;
  viewport: { x: number; y: number; zoom: number; rotation: number };
}

interface CanvasStore {
  objects: CanvasObject[];
  selection: string[];
  bookmarks: Bookmark[];
  addBookmark: (label: string) => void;
  deleteBookmark: (id: string) => void;
  goToBookmark: (id: string) => void;
  viewport: { x: number; y: number; zoom: number; rotation: number };
  activeOverlay: 'templates' | 'export' | 'settings' | 'presentation' | null;
  isRightSidebarVisible: boolean;
  toggleRightSidebar: () => void;
  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;
  
  isPresenting: boolean;
  currentFrameIndex: number;
  presentationPath: string[];
  presentationSettings: PresentationSettings;
  startPresentation: (startFromFrameId?: string) => void;
  stopPresentation: () => void;
  nextFrame: () => void;
  prevFrame: () => void;
  goToFrame: (index: number) => void;
  setPresentationPath: (path: string[]) => void;
  updatePresentationSettings: (settings: Partial<PresentationSettings>) => void;

  addObject: (obj: Omit<CanvasObject, "id">) => string;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  deleteObjects: (ids: string[]) => void;
  setSelection: (ids: string[]) => void;
  setViewport: (v: { x: number; y: number; zoom: number; rotation?: number }) => void;
  
  history: {
    past: CanvasObject[][];
    future: CanvasObject[][];
  };
  undo: () => void;
  redo: () => void;
  
  duplicateObjects: (ids: string[]) => void;
  groupObjects: (ids: string[]) => void;
  ungroupObjects: (ids: string[]) => void;
  bringForward: (ids: string[]) => void;
  sendBackward: (ids: string[]) => void;

  lastSaved: number | null;
  clear: () => void;
  save: () => void;
  setActiveOverlay: (overlay: 'templates' | 'export' | 'settings' | 'presentation' | null) => void;
  loadDocument: (doc: { objects: CanvasObject[]; viewport: { x: number; y: number; zoom: number; rotation?: number }; presentationPath: string[]; bookmarks?: Bookmark[] }) => void;
  loadTemplate: (template: any) => void;
  pendingTemplate: any | null;
  requestTemplate: (template: any) => void;
  resolveTemplateConflict: (choice: 'keep' | 'new' | 'duplicate') => void;
  randomizeTransitions: () => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      objects: [],
      selection: [],
      bookmarks: [],
      addBookmark: (label) => {
        const id = Math.random().toString(36).substring(7);
        const { viewport } = get();
        set((state) => ({
          bookmarks: [...state.bookmarks, { id, label, viewport: { ...viewport } }]
        }));
        toast.success(`Bookmark "${label}" added`);
      },
      deleteBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter(b => b.id !== id)
      })),
      goToBookmark: (id) => {
        const bookmark = get().bookmarks.find(b => b.id === id);
        if (bookmark) {
          get().setViewport(bookmark.viewport);
        }
      },
      viewport: { x: 0, y: 0, zoom: 1, rotation: 0 },
      activeOverlay: null,
      isRightSidebarVisible: true,
      toggleRightSidebar: () => set((state) => ({ isRightSidebarVisible: !state.isRightSidebarVisible })),
      snapEnabled: true,
      isPresenting: false,
      currentFrameIndex: 0,
      presentationPath: [],
      presentationSettings: {
        transitionDuration: 1200,
        autoPlay: false,
        autoPlayInterval: 5000,
        loop: false,
        showProgressBar: true,
        showFrameTitles: true,
        darkBackground: false,
        type: 'spatial',
        zoomPadding: 0.1,
        zoomSpeed: 1,
        smoothness: 'smooth',
        manualZoom: true,
        manualPan: true,
        showMiniMap: true,
      },
      setSnapEnabled: (snapEnabled) => set({ snapEnabled }),
      history: { past: [], future: [] },
      lastSaved: Date.now(),

      startPresentation: (startFromFrameId) => {
        const { objects, presentationPath } = get();
        let path = presentationPath;
        if (path.length === 0) {
          path = objects
            .filter(o => o.type === 'frame')
            .sort((a, b) => (a.y - b.y) || (a.x - b.x))
            .map(o => o.id);
        }
        if (path.length === 0) return;
        const startIndex = startFromFrameId ? path.indexOf(startFromFrameId) : 0;
        
        // Try to enter fullscreen
        try {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          }
        } catch (e) {
          console.warn("Could not enter fullscreen", e);
        }

        set({ 
          isPresenting: true, 
          currentFrameIndex: startIndex === -1 ? 0 : startIndex,
          presentationPath: path,
          activeOverlay: 'presentation'
        });
      },

      stopPresentation: () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        set({ isPresenting: false, activeOverlay: null });
      },

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
        let newObj = { ...obj, id };
        
        // Default settings for new frames
        if (obj.type === 'frame') {
          newObj = {
            ...newObj,
            settings: {
              duration: 1200,
              easing: 'smooth',
              camera: { x: obj.x, y: obj.y, zoom: 1, rotation: obj.rotation || 0 }
            }
          } as any;
        }

        set((state) => {
          const nextPath = obj.type === 'frame' ? [...state.presentationPath, id] : state.presentationPath;
          return {
            lastSaved: Date.now(),
            history: {
              past: [...state.history.past, state.objects].slice(-50),
              future: [],
            },
            objects: [...state.objects, newObj as CanvasObject],
            presentationPath: nextPath
          };
        });
        return id;
      },

      updateObject: (id, patch) => {
        const currentObjects = get().objects;
        const target = currentObjects.find(o => o.id === id);
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
        const nextX = viewport.x ?? current.x;
        const nextY = viewport.y ?? current.y;
        const nextZoom = viewport.zoom ?? current.zoom;
        const nextRotation = viewport.rotation ?? current.rotation ?? 0;
        
        if (current.x === nextX && current.y === nextY && current.zoom === nextZoom && current.rotation === nextRotation) return;
        set({ viewport: { x: nextX, y: nextY, zoom: nextZoom, rotation: nextRotation } });
      },

      undo: () => {
        const { past, future } = get().history;
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        set((state) => ({
          objects: previous!,
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
          objects: next!,
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

      groupObjects: (ids) => console.log("Grouping", ids),
      ungroupObjects: (ids) => console.log("Ungrouping", ids),

      bringForward: (ids) => {
        if (ids.length === 0) return;
        set((state) => {
          const objects = [...state.objects];
          for (let i = objects.length - 2; i >= 0; i--) {
            if (ids.includes(objects[i]!.id) && !ids.includes(objects[i + 1]!.id)) {
              const tmp = objects[i]!;
              objects[i] = objects[i + 1]!;
              objects[i + 1] = tmp;
            }
          }
          return { objects };
        });
      },

      sendBackward: (ids) => {
        if (ids.length === 0) return;
        set((state) => {
          const objects = [...state.objects];
          for (let i = 1; i < objects.length; i++) {
            if (ids.includes(objects[i]!.id) && !ids.includes(objects[i - 1]!.id)) {
              const tmp = objects[i]!;
              objects[i] = objects[i - 1]!;
              objects[i - 1] = tmp;
            }
          }
          return { objects };
        });
      },

      clear: () => set({ objects: [], selection: [], history: { past: [], future: [] }, lastSaved: null, presentationPath: [] }),
      save: () => set({ lastSaved: Date.now() }),
      setActiveOverlay: (activeOverlay) => set({ activeOverlay }),

      loadDocument: (doc) => {
        const objects = [...doc.objects];
        const presentationPath = [...doc.presentationPath];
        const viewport = { x: doc.viewport.x, y: doc.viewport.y, zoom: doc.viewport.zoom, rotation: doc.viewport.rotation || 0 };
        const bookmarks = doc.bookmarks || [];
        set({
          objects,
          presentationPath,
          viewport,
          bookmarks,
          selection: [],
          history: { past: [], future: [] },
          activeOverlay: null,
          lastSaved: Date.now()
        });
        toast.success("Template applied successfully");
      },

      loadTemplate: (template) => {
        console.log("[Store] loadTemplate triggered for:", template.id);
        import('./template-loader').then(({ TemplateLoader }) => {
          TemplateLoader.load(template).then(doc => {
            get().loadDocument(doc);
          }).catch(err => {
            console.error("[Store] Template loading failed:", err);
            toast.error("Failed to load template");
          });
        });
      },

      randomizeTransitions: () => {
        const { objects, presentationPath } = get();
        if (presentationPath.length === 0) {
          toast.error("Add presentation steps first!");
          return;
        }

        const easings: FrameSettings['easing'][] = [
          'morph', 'smooth', 'cinematic', 'pan', 'orbit', 'spring', 
          'elastic', 'bounce', 'fade', 'push', 'reveal', 'fall', 
          'wind', 'origami', 'vortex'
        ];
        
        const pathTypes: FrameSettings['pathType'][] = [
          'linear', 'curved', 'spiral', 'zoom-out'
        ];

        const durations = [800, 1200, 2000, 2500];

        set((state) => ({
          history: {
            past: [...state.history.past, state.objects].slice(-50),
            future: [],
          },
          objects: state.objects.map((obj) => {
            if (obj.type === 'frame' && presentationPath.includes(obj.id)) {
              const randomEasing = easings[Math.floor(Math.random() * easings.length)]!;
              const randomPath = pathTypes[Math.floor(Math.random() * pathTypes.length)]!;
              const randomDuration = durations[Math.floor(Math.random() * durations.length)]!;
              
              return {
                ...obj,
                settings: {
                  ...obj.settings!,
                  easing: randomEasing,
                  pathType: randomPath,
                  duration: randomDuration
                }
              };
            }
            return obj;
          }),
        }));
        
        toast.success("Randomized all transitions! 🎲");
      },
    }),
    {
      name: "zoomcanvas-v4-storage",
      partialize: (state) => ({ 
        objects: state.objects, 
        viewport: state.viewport,
        presentationPath: state.presentationPath,
        presentationSettings: state.presentationSettings,
        bookmarks: state.bookmarks,
        lastSaved: state.lastSaved
      }),
    }
  )
);