import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CanvasObject {
  id: string;
  type: "rectangle" | "circle" | "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  text?: string;
  fontSize?: number;
  src?: string;
  opacity?: number;
}

interface CanvasStore {
  objects: CanvasObject[];
  selection: string[];
  viewport: { x: number; y: number; zoom: number };
  
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
  clear: () => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      objects: [],
      selection: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      history: { past: [], future: [] },

      addObject: (obj) => {
        const id = Math.random().toString(36).substring(7);
        const newObj = { ...obj, id };
        set((state) => ({
          history: {
            past: [...state.history.past, state.objects],
            future: [],
          },
          objects: [...state.objects, newObj],
        }));
        return id;
      },

      updateObject: (id, patch) => {
        set((state) => ({
          history: {
            past: [...state.history.past, state.objects],
            future: [],
          },
          objects: state.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }));
      },

      deleteObjects: (ids) => {
        set((state) => ({
          history: {
            past: [...state.history.past, state.objects],
            future: [],
          },
          objects: state.objects.filter((o) => !ids.includes(o.id)),
          selection: state.selection.filter((id) => !ids.includes(id)),
        }));
      },

      setSelection: (selection) => set({ selection }),

      setViewport: (viewport) => set({ viewport }),

      undo: () => {
        const { past, future } = get().history;
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        set((state) => ({
          objects: previous,
          history: {
            past: newPast,
            future: [state.objects, ...future],
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
            past: [...past, state.objects],
            future: newFuture,
          },
        }));
      },

      duplicateObjects: (ids) => {
        const { objects } = get();
        const toDuplicate = objects.filter(o => ids.includes(o.id));
        const newObjects = toDuplicate.map(o => ({
          ...o,
          id: Math.random().toString(36).substring(7),
          x: o.x + 20,
          y: o.y + 20
        }));
        
        set((state) => ({
          history: { past: [...state.history.past, state.objects], future: [] },
          objects: [...state.objects, ...newObjects],
          selection: newObjects.map(o => o.id)
        }));
      },

      groupObjects: (ids) => {
        // Implementation for grouping would require a new 'group' object type
        // For now, we'll toast or placeholder
        console.log("Grouping", ids);
      },

      ungroupObjects: (ids) => {
        console.log("Ungrouping", ids);
      },

      clear: () => set({ objects: [], selection: [], history: { past: [], future: [] } }),
    }),
    {
      name: "zoomcanvas-v4-storage",
      partialize: (state) => ({ objects: state.objects, viewport: state.viewport }),
    }
  )
);
