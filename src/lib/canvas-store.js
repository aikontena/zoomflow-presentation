import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
export const useCanvasStore = create()(persist((set, get) => ({
    objects: [],
    frames: [],
    selection: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    activeOverlay: null,
    isRightSidebarVisible: true,
    toggleRightSidebar: () => set((state) => ({ isRightSidebarVisible: !state.isRightSidebarVisible })),
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
        type: 'spatial',
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
        if (path.length === 0)
            return;
        const startIndex = startFromFrameId ? path.indexOf(startFromFrameId) : 0;
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
        }
        else if (presentationSettings.loop) {
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
            const nextPath = obj.type === 'frame' ? [...state.presentationPath, id] : state.presentationPath;
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
        if (!target)
            return;
        const hasChanges = Object.keys(patch).some(key => patch[key] !== target[key]);
        if (!hasChanges)
            return;
        set((state) => ({
            history: {
                past: [...state.history.past, state.objects].slice(-50),
                future: [],
            },
            objects: state.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }));
    },
    deleteObjects: (ids) => {
        if (ids.length === 0)
            return;
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
        if (current.length === selection.length && current.every((id, i) => id === selection[i]))
            return;
        set({ selection });
    },
    setViewport: (viewport) => {
        const current = get().viewport;
        if (current.x === viewport.x && current.y === viewport.y && current.zoom === viewport.zoom)
            return;
        set({ viewport });
    },
    undo: () => {
        const { past, future } = get().history;
        if (past.length === 0)
            return;
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
        if (future.length === 0)
            return;
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
        if (ids.length === 0)
            return;
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
        if (ids.length === 0)
            return;
        set((state) => {
            const objects = [...state.objects];
            for (let i = objects.length - 2; i >= 0; i--) {
                if (ids.includes(objects[i].id) && !ids.includes(objects[i + 1].id)) {
                    const tmp = objects[i];
                    objects[i] = objects[i + 1];
                    objects[i + 1] = tmp;
                }
            }
            return { objects };
        });
    },
    sendBackward: (ids) => {
        if (ids.length === 0)
            return;
        set((state) => {
            const objects = [...state.objects];
            for (let i = 1; i < objects.length; i++) {
                if (ids.includes(objects[i].id) && !ids.includes(objects[i - 1].id)) {
                    const tmp = objects[i];
                    objects[i] = objects[i - 1];
                    objects[i - 1] = tmp;
                }
            }
            return { objects };
        });
    },
    clear: () => set({ objects: [], selection: [], history: { past: [], future: [] }, lastSaved: null }),
    save: () => set({ lastSaved: Date.now() }),
    setActiveOverlay: (activeOverlay) => set({ activeOverlay }),
    loadDocument: (doc) => {
        const objects = [...doc.objects];
        const presentationPath = [...doc.presentationPath];
        const viewport = { ...doc.viewport };
        set({
            objects,
            presentationPath,
            viewport,
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
            // Pass the specific template object directly
            TemplateLoader.load(template).then(doc => {
                console.log("[Store] Template processed, loading doc with", doc.objects.length, "objects");
                get().loadDocument(doc);
            }).catch(err => {
                console.error("[Store] Template loading failed:", err);
                toast.error("Failed to load template");
            });
        });
    },
}), {
    name: "zoomcanvas-v4-storage",
    partialize: (state) => ({
        objects: state.objects,
        viewport: state.viewport,
        presentationPath: state.presentationPath,
        presentationSettings: state.presentationSettings,
        lastSaved: state.lastSaved
    }),
}));
