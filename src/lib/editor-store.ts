import { create } from "zustand";

export type ObjectType =
  | "text"
  | "heading"
  | "rect"
  | "circle"
  | "arrow"
  | "image"
  | "icon"
  | "video"
  | "pdf"
  | "sticky"
  | "code"
  | "table"
  | "chart";

export type AnimationName = "none" | "fade" | "pop" | "slide";

export interface CanvasObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z: number;
  locked: boolean;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
  shadow: number;
  animation: AnimationName;
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  src?: string;
  icon?: string;
  href?: string;
  notes?: string;
}

export interface Page {
  id: string;
  name: string;
  /** camera frame this page zooms to in presentation mode */
  frame: { x: number; y: number; width: number; height: number };
  notes: string;
}

export interface EditorDoc {
  title: string;
  pages: Page[];
  objects: CanvasObject[];
}

interface HistoryState {
  past: EditorDoc[];
  future: EditorDoc[];
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface EditorState extends HistoryState {
  doc: EditorDoc;
  viewport: Viewport;
  selectedIds: string[];
  activePageId: string;
  tool: ObjectType | "select";
  showGrid: boolean;
  snapToGrid: boolean;
  lastSavedAt: number | null;
  dirty: boolean;

  setViewport: (v: Viewport | ((v: Viewport) => Viewport)) => void;
  setTool: (t: ObjectType | "select") => void;
  select: (ids: string[]) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;

  addObject: (type: ObjectType, at?: { x: number; y: number }) => string;
  updateObject: (id: string, patch: Partial<CanvasObject>, commit?: boolean) => void;
  updateSelected: (patch: Partial<CanvasObject>) => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  reorder: (id: string, dir: "forward" | "backward") => void;
  commit: () => void;

  setTitle: (t: string) => void;
  addPage: () => void;
  removePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  setPageNotes: (id: string, notes: string) => void;
  setActivePage: (id: string) => void;
  capturePageFrame: (id: string, frame: Page["frame"]) => void;

  undo: () => void;
  redo: () => void;
  markSaved: () => void;
  loadTemplate: (doc: EditorDoc) => void;
}

const GRID = 20;
export const gridSize = GRID;

const uid = () => Math.random().toString(36).slice(2, 10);

const palette = {
  fill: "var(--surface-2)",
  stroke: "var(--border)",
  color: "var(--foreground)",
};

function defaults(type: ObjectType, x: number, y: number): CanvasObject {
  const base: CanvasObject = {
    id: uid(),
    type,
    x,
    y,
    width: 240,
    height: 140,
    rotation: 0,
    z: Date.now() % 100000,
    locked: false,
    opacity: 1,
    fill: palette.fill,
    stroke: palette.stroke,
    strokeWidth: 1,
    radius: 16,
    shadow: 12,
    animation: "fade",
    text: "",
    fontSize: 18,
    fontWeight: 400,
    color: palette.color,
    align: "left",
  };

  switch (type) {
    case "heading":
      return { ...base, text: "Your big idea", width: 480, height: 90, fontSize: 52, fontWeight: 700, fill: "transparent", strokeWidth: 0, shadow: 0 };
    case "text":
      return { ...base, text: "Describe the idea in a sentence or two.", width: 360, height: 90, fontSize: 18, fill: "transparent", strokeWidth: 0, shadow: 0 };
    case "rect":
      return { ...base, fill: "var(--primary)", opacity: 0.85 };
    case "circle":
      return { ...base, width: 180, height: 180, radius: 999, fill: "var(--accent)", opacity: 0.85 };
    case "arrow":
      return { ...base, width: 220, height: 40, fill: "transparent", stroke: "var(--accent)", strokeWidth: 2, shadow: 0 };
    case "sticky":
      return { ...base, width: 200, height: 200, text: "Sticky note", fill: "var(--chart-4)", color: "var(--primary-foreground)", radius: 8, fontSize: 16 };
    case "code":
      return { ...base, width: 360, height: 180, text: "const zoom = (k) => k * 1.2;", fill: "var(--canvas)", radius: 12, fontSize: 14 };
    case "image":
      return { ...base, width: 320, height: 200, text: "Image" };
    case "video":
      return { ...base, width: 360, height: 200, text: "Video" };
    case "pdf":
      return { ...base, width: 260, height: 320, text: "Document.pdf" };
    case "icon":
      return { ...base, width: 96, height: 96, text: "Sparkles", icon: "Sparkles", fill: "transparent", strokeWidth: 0, color: "var(--accent)" };
    case "table":
      return { ...base, width: 380, height: 200, text: "Table" };
    case "chart":
      return { ...base, width: 340, height: 220, text: "Chart" };
    default:
      return base;
  }
}

function starterDoc(): EditorDoc {
  const heading = { ...defaults("heading", 120, 120), text: "ZoomCanvas AI" };
  const sub = { ...defaults("text", 122, 230), text: "Present on an infinite canvas. Zoom between ideas instead of flipping slides.", width: 460 };
  const circle = { ...defaults("circle", 720, 140), width: 220, height: 220 };
  const sticky = { ...defaults("sticky", 200, 420) };
  const rect = { ...defaults("rect", 640, 440), width: 320, height: 180 };
  return {
    title: "Untitled presentation",
    pages: [
      { id: "p1", name: "Opening", frame: { x: 60, y: 60, width: 960, height: 540 }, notes: "Welcome the room. Set the frame." },
      { id: "p2", name: "The idea", frame: { x: 560, y: 340, width: 960, height: 540 }, notes: "Zoom into the core concept." },
    ],
    objects: [heading, sub, circle, sticky, rect],
  };
}

const clone = (d: EditorDoc): EditorDoc => JSON.parse(JSON.stringify(d));

export const useEditor = create<EditorState>((set, get) => ({
  doc: starterDoc(),
  past: [],
  future: [],
  viewport: { x: 0, y: 0, zoom: 0.8 },
  selectedIds: [],
  activePageId: "p1",
  tool: "select",
  showGrid: true,
  snapToGrid: true,
  lastSavedAt: null,
  dirty: false,

  setViewport: (v) => set((s) => ({ viewport: typeof v === "function" ? v(s.viewport) : v })),
  setTool: (tool) => set({ tool }),
  select: (selectedIds) => set({ selectedIds }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  commit: () =>
    set((s) => ({ past: [...s.past.slice(-49), clone(s.doc)], future: [], dirty: true })),

  addObject: (type, at) => {
    const s = get();
    const vp = s.viewport;
    const cx = at?.x ?? (-vp.x + 500) / vp.zoom;
    const cy = at?.y ?? (-vp.y + 300) / vp.zoom;
    const obj = defaults(type, Math.round(cx), Math.round(cy));
    set({
      past: [...s.past.slice(-49), clone(s.doc)],
      future: [],
      doc: { ...s.doc, objects: [...s.doc.objects, obj] },
      selectedIds: [obj.id],
      tool: "select",
      dirty: true,
    });
    return obj.id;
  },

  updateObject: (id, patch, commitFirst) =>
    set((s) => ({
      past: commitFirst ? [...s.past.slice(-49), clone(s.doc)] : s.past,
      future: commitFirst ? [] : s.future,
      dirty: true,
      doc: {
        ...s.doc,
        objects: s.doc.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      },
    })),

  updateSelected: (patch) =>
    set((s) => ({
      past: [...s.past.slice(-49), clone(s.doc)],
      future: [],
      dirty: true,
      doc: {
        ...s.doc,
        objects: s.doc.objects.map((o) => (s.selectedIds.includes(o.id) ? { ...o, ...patch } : o)),
      },
    })),

  duplicateSelected: () =>
    set((s) => {
      const copies = s.doc.objects
        .filter((o) => s.selectedIds.includes(o.id))
        .map((o) => ({ ...o, id: uid(), x: o.x + 32, y: o.y + 32, z: o.z + 1 }));
      if (!copies.length) return s;
      return {
        ...s,
        past: [...s.past.slice(-49), clone(s.doc)],
        future: [],
        dirty: true,
        doc: { ...s.doc, objects: [...s.doc.objects, ...copies] },
        selectedIds: copies.map((c) => c.id),
      };
    }),

  deleteSelected: () =>
    set((s) => {
      const removable = s.doc.objects.filter((o) => s.selectedIds.includes(o.id) && !o.locked);
      if (!removable.length) return s;
      const ids = new Set(removable.map((o) => o.id));
      return {
        ...s,
        past: [...s.past.slice(-49), clone(s.doc)],
        future: [],
        dirty: true,
        doc: { ...s.doc, objects: s.doc.objects.filter((o) => !ids.has(o.id)) },
        selectedIds: [],
      };
    }),

  reorder: (id, dir) =>
    set((s) => {
      const sorted = [...s.doc.objects].sort((a, b) => a.z - b.z);
      const i = sorted.findIndex((o) => o.id === id);
      const j = dir === "forward" ? i + 1 : i - 1;
      if (i < 0 || j < 0 || j >= sorted.length) return s;
      const zi = sorted[i]!.z;
      sorted[i] = { ...sorted[i]!, z: sorted[j]!.z };
      sorted[j] = { ...sorted[j]!, z: zi };
      return {
        ...s,
        past: [...s.past.slice(-49), clone(s.doc)],
        future: [],
        dirty: true,
        doc: { ...s.doc, objects: sorted },
      };
    }),

  setTitle: (title) => set((s) => ({ doc: { ...s.doc, title }, dirty: true })),

  addPage: () =>
    set((s) => {
      const vp = s.viewport;
      const page: Page = {
        id: uid(),
        name: `Page ${s.doc.pages.length + 1}`,
        frame: {
          x: Math.round(-vp.x / vp.zoom),
          y: Math.round(-vp.y / vp.zoom),
          width: 960,
          height: 540,
        },
        notes: "",
      };
      return {
        ...s,
        past: [...s.past.slice(-49), clone(s.doc)],
        future: [],
        dirty: true,
        doc: { ...s.doc, pages: [...s.doc.pages, page] },
        activePageId: page.id,
      };
    }),

  removePage: (id) =>
    set((s) => {
      if (s.doc.pages.length <= 1) return s;
      const pages = s.doc.pages.filter((p) => p.id !== id);
      return {
        ...s,
        past: [...s.past.slice(-49), clone(s.doc)],
        future: [],
        dirty: true,
        doc: { ...s.doc, pages },
        activePageId: s.activePageId === id ? pages[0]!.id : s.activePageId,
      };
    }),

  renamePage: (id, name) =>
    set((s) => ({
      dirty: true,
      doc: { ...s.doc, pages: s.doc.pages.map((p) => (p.id === id ? { ...p, name } : p)) },
    })),

  setPageNotes: (id, notes) =>
    set((s) => ({
      dirty: true,
      doc: { ...s.doc, pages: s.doc.pages.map((p) => (p.id === id ? { ...p, notes } : p)) },
    })),

  setActivePage: (activePageId) => set({ activePageId }),

  capturePageFrame: (id, frame) =>
    set((s) => ({
      dirty: true,
      past: [...s.past.slice(-49), clone(s.doc)],
      future: [],
      doc: { ...s.doc, pages: s.doc.pages.map((p) => (p.id === id ? { ...p, frame } : p)) },
    })),

  undo: () =>
    set((s) => {
      const prev = s.past[s.past.length - 1];
      if (!prev) return s;
      return {
        ...s,
        doc: prev,
        past: s.past.slice(0, -1),
        future: [clone(s.doc), ...s.future].slice(0, 50),
        selectedIds: [],
        dirty: true,
      };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return s;
      return {
        ...s,
        doc: next,
        past: [...s.past, clone(s.doc)],
        future: s.future.slice(1),
        selectedIds: [],
        dirty: true,
      };
    }),

  markSaved: () => set({ lastSavedAt: Date.now(), dirty: false }),

  loadTemplate: (doc) =>
    set((s) => ({
      past: [...s.past.slice(-49), clone(s.doc)],
      future: [],
      doc: clone(doc),
      activePageId: doc.pages[0]?.id ?? "p1",
      selectedIds: [],
      dirty: true,
    })),
}));

export function makeObject(type: ObjectType, x: number, y: number) {
  return defaults(type, x, y);
}
