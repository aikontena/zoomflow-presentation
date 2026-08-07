import { create } from "zustand";
import { 
  Editor, 
  TLRecord, 
  TLStore, 
  createTLStore, 
  defaultShapeUtils,
  getSnapshot,
  loadSnapshot,
  TLEditorSnapshot
} from "tldraw";

export type CanvasBackground = "white" | "light-grid" | "dot-grid" | "dark-grid" | "plain" | "custom";

export interface Page {
  id: string;
  name: string;
  frame: { x: number; y: number; width: number; height: number };
  notes: string;
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

  setEditor: (editor: Editor) => void;
  setTitle: (title: string) => void;
  setBackground: (bg: CanvasBackground) => void;
  setCustomBackgroundColor: (color: string) => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSnap: () => void;
  
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
  
  // Data
  exportToJson: () => string;
  importFromJson: (json: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useEditor = create<EditorState>((set, get) => ({
  editor: null,
  store: createTLStore({ shapeUtils: defaultShapeUtils }),
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

  setEditor: (editor) => set({ editor }),
  setTitle: (title) => set({ title, dirty: true }),
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
      activePageId: page.id,
      dirty: true,
    };
  }),

  removePage: (id) => set((s) => {
    if (s.pages.length <= 1) return s;
    const pages = s.pages.filter((p) => p.id !== id);
    return {
      pages,
      activePageId: s.activePageId === id ? pages[0]!.id : s.activePageId,
      dirty: true,
    };
  }),

  renamePage: (id, name) => set((s) => ({
    pages: s.pages.map((p) => (p.id === id ? { ...p, name } : p)),
    dirty: true,
  })),

  setPageNotes: (id, notes) => set((s) => ({
    pages: s.pages.map((p) => (p.id === id ? { ...p, notes } : p)),
    dirty: true,
  })),

  setActivePage: (activePageId) => set({ activePageId }),

  capturePageFrame: (id, frame) => set((s) => ({
    pages: s.pages.map((p) => (p.id === id ? { ...p, frame } : p)),
    dirty: true,
  })),

  undo: () => {
    const s = get();
    if (s.editor) s.editor.undo();
  },

  redo: () => {
    const s = get();
    if (s.editor) s.editor.redo();
  },

  markSaved: () => set({ lastSavedAt: Date.now(), dirty: false }),

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
