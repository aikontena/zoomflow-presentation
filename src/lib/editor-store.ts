import { create } from "zustand";
import { 
  Editor, 
  TLStore, 
  createTLStore, 
  defaultShapeUtils,
  getSnapshot,
  loadSnapshot,
} from "tldraw";

export type CanvasBackground = "white" | "light-grid" | "dot-grid" | "dark-grid" | "plain" | "custom";
export type AnimationPreset = 'smooth' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic' | 'fast' | 'slow' | 'cinematic';
export type TransitionEffect = 'zoom' | 'fade' | 'cross-fade' | 'slide' | 'rotate' | 'scale' | 'morph';

export interface Page {
  id: string;
  name: string;
  frame: { x: number; y: number; width: number; height: number };
  notes: string;
  transition?: TransitionEffect;
  duration?: number;
  preset?: AnimationPreset;
}

export interface CameraPath {
  id: string;
  name: string;
  description?: string;
  keyframes: CameraKeyframe[];
  isLooping: boolean;
  isReverse: boolean;
}

export interface CameraKeyframe {
  id: string;
  frameId: string;
  orderIndex: number;
  transitionDuration: number;
  transitionType: TransitionEffect;
  animationPreset: AnimationPreset;
  stayDuration: number;
  isSkipped: boolean;
  notes?: string;
}

export interface CameraBookmark {
  id: string;
  name: string;
  x: number;
  y: number;
  zoom: number;
  rotation: number;
  targetFrameId?: string;
}

export type ObjectType = any;
export type CanvasObject = any;
export type AnimationName = any;
export interface EditorDoc {
  title: string;
  pages: Page[];
  objects: any[];
  paths: CameraPath[];
  bookmarks: CameraBookmark[];
}

interface EditorState {
  editor: Editor | null;
  store: TLStore;
  activePageId: string;
  pages: Page[];
  title: string;
  background: CanvasBackground;
  customBackgroundColor: string;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  lastSavedAt: number | null;
  dirty: boolean;
  
  paths: CameraPath[];
  bookmarks: CameraBookmark[];
  activePathId: string | null;
  currentKeyframeIndex: number;
  focusMode: boolean;
  spotlightId: string | null;

  doc: EditorDoc;
  viewport: { x: number, y: number, zoom: number };
  tool: string;
  past: any[];
  future: any[];
  selectedIds: string[];

  setEditor: (editor: Editor) => void;
  setTitle: (title: string) => void;
  setBackground: (bg: CanvasBackground) => void;
  setCustomBackgroundColor: (color: string) => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSnap: () => void;
  setTool: (tool: string) => void;
  setViewport: (v: any) => void;
  select: (ids: string[]) => void;
  
  addPage: () => void;
  removePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  setPageNotes: (id: string, notes: string) => void;
  setActivePage: (id: string) => void;
  capturePageFrame: (id: string, frame: Page["frame"]) => void;

  addPath: (name: string) => void;
  removePath: (id: string) => void;
  addKeyframe: (pathId: string, frameId: string) => void;
  removeKeyframe: (pathId: string, keyframeId: string) => void;
  reorderKeyframe: (pathId: string, fromIndex: number, toIndex: number) => void;
  setActivePath: (id: string | null) => void;
  
  addBookmark: (name: string) => void;
  removeBookmark: (id: string) => void;
  applyBookmark: (id: string) => void;
  
  setFocusMode: (enabled: boolean) => void;
  setSpotlight: (id: string | null) => void;
  goToFrame: (frameId: string, options?: { duration?: number, preset?: AnimationPreset, instant?: boolean }) => void;

  undo: () => void;
  redo: () => void;
  markSaved: () => void;
  commit: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  reorder: (id: string, dir: string) => void;
  addObject: (type: string, at?: any) => string;
  updateObject: (id: string, patch: any) => void;
  updateSelected: (patch: any) => void;
  loadTemplate: (doc: any) => void;
  
  exportToJson: () => string;
  importFromJson: (json: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const gridSize = 20;

export const useEditor = create<EditorState>((set, get) => ({
  editor: null,
  store: createTLStore({ shapeUtils: [...defaultShapeUtils] as any }),
  activePageId: "p1",
  pages: [
    { id: "p1", name: "Opening", frame: { x: 0, y: 0, width: 960, height: 540 }, notes: "Welcome the room.", preset: 'cinematic', transition: 'zoom', duration: 1000 },
  ],
  title: "Untitled presentation",
  background: "dark-grid",
  customBackgroundColor: "#121212",
  showGrid: true,
  gridSize: 20,
  snapToGrid: true,
  lastSavedAt: null,
  dirty: false,
  
  paths: [],
  bookmarks: [],
  activePathId: null,
  currentKeyframeIndex: 0,
  focusMode: false,
  spotlightId: null,

  doc: { title: "Untitled presentation", pages: [], objects: [], paths: [], bookmarks: [] },
  viewport: { x: 0, y: 0, zoom: 1 },
  tool: "select",
  past: [],
  future: [],
  selectedIds: [],

  setEditor: (editor) => set({ editor }),
  setTitle: (title) => set((s) => ({ title, doc: { ...s.doc, title }, dirty: true })),
  setBackground: (background) => set({ background, dirty: true }),
  setCustomBackgroundColor: (customBackgroundColor) => set({ customBackgroundColor, dirty: true }),
  
  toggleGrid: () => {
    const s = get();
    const showGrid = !s.showGrid;
    set({ showGrid, dirty: true });
    if (s.editor) {
      s.editor.updateInstanceState({ isGridMode: showGrid });
    }
  },
  
  setGridSize: (gridSize) => set({ gridSize, dirty: true }),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid, dirty: true })),
  setTool: (tool) => set({ tool }),
  setViewport: (v) => set((s) => ({ viewport: typeof v === "function" ? v(s.viewport) : v })),
  select: (selectedIds) => set({ selectedIds }),

  addPage: () => set((s) => {
    const page: Page = {
      id: uid(),
      name: `Page ${s.pages.length + 1}`,
      frame: s.editor 
        ? { 
            x: s.editor.getViewportScreenCenter().x - 480, 
            y: s.editor.getViewportScreenCenter().y - 270, 
            width: 960, 
            height: 540 
          }
        : { x: 0, y: 0, width: 960, height: 540 },
      notes: "",
    };
    return {
      pages: [...s.pages, page],
      doc: { ...s.doc, pages: [...s.pages, page] },
      activePageId: page.id,
      dirty: true,
    };
  }),

  removePage: (id) => set((s) => {
    if (s.pages.length <= 1) return s;
    const pages = s.pages.filter((p) => p.id !== id);
    return {
      pages,
      doc: { ...s.doc, pages },
      activePageId: s.activePageId === id ? pages[0]!.id : s.activePageId,
      dirty: true,
    };
  }),

  renamePage: (id, name) => set((s) => {
    const pages = s.pages.map((p) => (p.id === id ? { ...p, name } : p));
    return {
      pages,
      doc: { ...s.doc, pages },
      dirty: true,
    };
  }),

  setPageNotes: (id, notes) => set((s) => {
    const pages = s.pages.map((p) => (p.id === id ? { ...p, notes } : p));
    return {
      pages,
      doc: { ...s.doc, pages },
      dirty: true,
    };
  }),

  setActivePage: (activePageId) => set({ activePageId }),

  capturePageFrame: (id, frame) => set((s) => {
    const pages = s.pages.map((p) => (p.id === id ? { ...p, frame } : p));
    return {
      pages,
      doc: { ...s.doc, pages },
      dirty: true,
    };
  }),

  addPath: (name) => set((s) => ({
    paths: [...s.paths, { id: uid(), name, keyframes: [], isLooping: false, isReverse: false }],
    dirty: true
  })),

  removePath: (id) => set((s) => ({
    paths: s.paths.filter(p => p.id !== id),
    activePathId: s.activePathId === id ? null : s.activePathId,
    dirty: true
  })),

  addKeyframe: (pathId, frameId) => set((s) => {
    const paths = s.paths.map(p => {
      if (p.id !== pathId) return p;
      const kf: CameraKeyframe = {
        id: uid(),
        frameId,
        orderIndex: p.keyframes.length,
        transitionDuration: 1000,
        transitionType: 'zoom',
        animationPreset: 'cinematic',
        stayDuration: 0,
        isSkipped: false
      };
      return { ...p, keyframes: [...p.keyframes, kf] };
    });
    return { paths, dirty: true };
  }),

  removeKeyframe: (pathId, keyframeId) => set((s) => {
    const paths = s.paths.map(p => {
      if (p.id !== pathId) return p;
      return { ...p, keyframes: p.keyframes.filter(k => k.id !== keyframeId) };
    });
    return { paths, dirty: true };
  }),

  reorderKeyframe: (pathId, fromIndex, toIndex) => set((s) => {
    const paths = s.paths.map(p => {
      if (p.id !== pathId) return p;
      const keyframes = [...p.keyframes];
      const [moved] = keyframes.splice(fromIndex, 1);
      if (moved) keyframes.splice(toIndex, 0, moved);
      return { ...p, keyframes: keyframes.map((k, i) => ({ ...k, orderIndex: i })) };
    });
    return { paths, dirty: true };
  }),

  setActivePath: (activePathId) => set({ activePathId, currentKeyframeIndex: 0 }),

  addBookmark: (name) => set((s) => {
    if (!s.editor) return s;
    const camera = s.editor.getCamera();
    const bookmark: CameraBookmark = {
      id: uid(),
      name,
      x: camera.x,
      y: camera.y,
      zoom: camera.z,
      rotation: 0,
    };
    return { bookmarks: [...s.bookmarks, bookmark], dirty: true };
  }),

  removeBookmark: (id) => set((s) => ({
    bookmarks: s.bookmarks.filter(b => b.id !== id),
    dirty: true
  })),

  applyBookmark: (id) => {
    const s = get();
    const b = s.bookmarks.find(x => x.id === id);
    if (b && s.editor) {
      s.editor.setCamera({ x: b.x, y: b.y, z: b.zoom });
    }
  },

  setFocusMode: (focusMode) => set({ focusMode }),
  setSpotlight: (spotlightId) => set({ spotlightId }),

  goToFrame: (frameId, options) => {
    const s = get();
    const page = s.pages.find(p => p.id === frameId);
    if (page && s.editor) {
      const { x, y, width, height } = page.frame;
      const margin = 100;
      
      if (options?.instant) {
        s.editor.zoomToFit(); // Fallback for simple zoom to fit if needed
        // Or manual:
        s.editor.setCamera({ x: -x + margin, y: -y + margin, z: 1 });
      } else {
        // Use tldraw's built in camera easing if possible, or manual easing
        s.editor.animateCamera({
          x: -x + (s.editor.getContainer().clientWidth - width) / 2,
          y: -y + (s.editor.getContainer().clientHeight - height) / 2,
          z: Math.min(
            (s.editor.getContainer().clientWidth - margin) / width,
            (s.editor.getContainer().clientHeight - margin) / height
          )
        }, {
          duration: options?.duration || 1000,
        });
      }
    }
  },

  undo: () => {
    const s = get();
    if (s.editor) s.editor.undo();
  },

  redo: () => {
    const s = get();
    if (s.editor) s.editor.redo();
  },

  markSaved: () => set({ lastSavedAt: Date.now(), dirty: false }),
  commit: () => set({ dirty: true }),
  deleteSelected: () => {
    const s = get();
    if (s.editor) s.editor.deleteShapes(s.editor.getSelectedShapeIds());
  },
  duplicateSelected: () => {
    const s = get();
    if (s.editor) s.editor.duplicateShapes(s.editor.getSelectedShapeIds());
  },
  reorder: (id, dir) => {
    const s = get();
    if (s.editor) {
      if (dir === "forward") s.editor.bringForward([id as any]);
      else s.editor.sendBackward([id as any]);
    }
  },
  addObject: (type, at) => {
    const s = get();
    if (!s.editor) return "";
    const id = uid();
    return id;
  },
  updateObject: (id, patch) => set({ dirty: true }),
  updateSelected: (patch) => set({ dirty: true }),
  loadTemplate: (doc) => set({ dirty: true }),

  exportToJson: () => {
    const s = get();
    if (!s.editor) return "";
    const snapshot = getSnapshot(s.editor.store);
    return JSON.stringify({
      title: s.title,
      pages: s.pages,
      background: s.background,
      customBackgroundColor: s.customBackgroundColor,
      snapshot
    });
  },

  importFromJson: (json: string) => {
    try {
      const data = JSON.parse(json);
      const s = get();
      if (data.snapshot && s.editor) {
        loadSnapshot(s.editor.store, data.snapshot);
      }
      set({
        title: data.title || s.title,
        pages: data.pages || s.pages,
        background: data.background || s.background,
        customBackgroundColor: data.customBackgroundColor || s.customBackgroundColor,
        dirty: false
      });
    } catch (e) {
      console.error("Failed to import canvas data", e);
    }
  }
}));

export const makeObject = (type: any, x: number, y: number) => ({});
