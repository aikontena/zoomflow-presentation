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

export interface Page {
  id: string;
  name: string;
  frame: { x: number; y: number; width: number; height: number };
  notes: string;
}

// Temporary types to satisfy existing components while migrating
export type ObjectType = any;
export type CanvasObject = any;
export type AnimationName = any;
export interface EditorDoc {
  title: string;
  pages: Page[];
  objects: any[];
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
  
  // Legacy compatibility props
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
  
  // Page management
  addPage: () => void;
  removePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  setPageNotes: (id: string, notes: string) => void;
  setActivePage: (id: string) => void;
  capturePageFrame: (id: string, frame: Page["frame"]) => void;

  // History & Actions
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
  
  // Data
  exportToJson: () => string;
  importFromJson: (json: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const gridSize = 20;

export const useEditor = create<EditorState>((set, get) => ({
  editor: null,
  store: createTLStore({ shapeUtils: [...defaultShapeUtils] }),
  activePageId: "p1",
  pages: [
    { id: "p1", name: "Opening", frame: { x: 0, y: 0, width: 960, height: 540 }, notes: "Welcome the room." },
  ],
  title: "Untitled presentation",
  background: "dark-grid",
  customBackgroundColor: "#121212",
  showGrid: true,
  gridSize: 20,
  snapToGrid: true,
  lastSavedAt: null,
  dirty: false,

  // Legacy state mocks
  doc: { title: "Untitled presentation", pages: [], objects: [] },
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
    // Simplified mapping for now
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
