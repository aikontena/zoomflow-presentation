import { useCallback, useEffect, useRef, useState } from "react";
import { gridSize, useEditor, type CanvasObject } from "@/lib/editor-store";
import { ObjectView } from "./ObjectView";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Drag =
  | { mode: "pan"; startX: number; startY: number; vx: number; vy: number }
  | { mode: "move"; startX: number; startY: number; origins: Record<string, { x: number; y: number }> }
  | { mode: "resize"; id: string; startX: number; startY: number; w: number; h: number }
  | { mode: "rotate"; id: string; cx: number; cy: number }
  | null;

export function Canvas() {
  const ref = useRef<HTMLDivElement>(null);
  const {
    doc,
    viewport,
    setViewport,
    selectedIds,
    select,
    showGrid,
    snapToGrid,
    tool,
    addObject,
    updateObject,
    commit,
    deleteSelected,
    duplicateSelected,
    undo,
    redo,
    activePageId,
  } = useEditor();
  const [drag, setDrag] = useState<Drag>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const stateRef = useRef({ viewport, snapToGrid });
  stateRef.current = { viewport, snapToGrid };

  const activeFrame = doc.pages.find((p) => p.id === activePageId)?.frame;

  // Non-passive wheel: zoom anchored at cursor, pan on plain scroll.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
      const dx = e.deltaX * scale;
      const dy = e.deltaY * scale;

      setViewport((vp) => {
        if (e.ctrlKey || e.metaKey || !e.shiftKey) {
          if (e.ctrlKey || e.metaKey) {
            const next = clamp(vp.zoom * Math.exp(-dy * 0.0018), MIN_ZOOM, MAX_ZOOM);
            const k = next / vp.zoom;
            return { zoom: next, x: px - (px - vp.x) * k, y: py - (py - vp.y) * k };
          }
        }
        return { ...vp, x: vp.x - dx, y: vp.y - dy };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setViewport]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        deleteSelected();
      } else if (e.key === "Escape") {
        select([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, duplicateSelected, deleteSelected, select]);

  const toWorld = useCallback((clientX: number, clientY: number) => {
    const rect = ref.current!.getBoundingClientRect();
    const vp = stateRef.current.viewport;
    return { x: (clientX - rect.left - vp.x) / vp.zoom, y: (clientY - rect.top - vp.y) / vp.zoom };
  }, []);

  const onBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.button === 2 || tool === "select") {
      if (e.currentTarget === e.target || e.button === 1) {
        if (tool !== "select" && e.button === 0) return;
        select([]);
        setEditingId(null);
        setDrag({ mode: "pan", startX: e.clientX, startY: e.clientY, vx: viewport.x, vy: viewport.y });
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
      return;
    }
    if (tool !== "select") {
      const p = toWorld(e.clientX, e.clientY);
      addObject(tool, p);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const snap = (n: number) => (stateRef.current.snapToGrid ? Math.round(n / gridSize) * gridSize : Math.round(n));
    if (drag.mode === "pan") {
      setViewport({ ...viewport, x: drag.vx + (e.clientX - drag.startX), y: drag.vy + (e.clientY - drag.startY) });
    } else if (drag.mode === "move") {
      const dx = (e.clientX - drag.startX) / viewport.zoom;
      const dy = (e.clientY - drag.startY) / viewport.zoom;
      Object.entries(drag.origins).forEach(([id, o]) => {
        updateObject(id, { x: snap(o.x + dx), y: snap(o.y + dy) });
      });
    } else if (drag.mode === "resize") {
      const dx = (e.clientX - drag.startX) / viewport.zoom;
      const dy = (e.clientY - drag.startY) / viewport.zoom;
      updateObject(drag.id, { width: Math.max(24, snap(drag.w + dx)), height: Math.max(24, snap(drag.h + dy)) });
    } else if (drag.mode === "rotate") {
      const angle = (Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180) / Math.PI + 90;
      updateObject(drag.id, { rotation: Math.round(angle) });
    }
  };

  const endDrag = () => {
    if (drag && drag.mode !== "pan") commit();
    setDrag(null);
  };

  const startObjectDrag = (e: React.PointerEvent, obj: CanvasObject) => {
    e.stopPropagation();
    if (obj.locked) {
      select([obj.id]);
      return;
    }
    const ids = e.shiftKey
      ? selectedIds.includes(obj.id)
        ? selectedIds
        : [...selectedIds, obj.id]
      : selectedIds.includes(obj.id)
        ? selectedIds
        : [obj.id];
    select(ids);
    const origins: Record<string, { x: number; y: number }> = {};
    doc.objects.filter((o) => ids.includes(o.id) && !o.locked).forEach((o) => (origins[o.id] = { x: o.x, y: o.y }));
    setDrag({ mode: "move", startX: e.clientX, startY: e.clientY, origins });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const sorted = [...doc.objects].sort((a, b) => a.z - b.z);

  return (
    <div
      ref={ref}
      className="relative h-full w-full touch-none overflow-hidden bg-canvas"
      style={{ cursor: drag?.mode === "pan" ? "grabbing" : tool === "select" ? "default" : "crosshair" }}
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onContextMenu={(e) => e.preventDefault()}
    >
      {showGrid && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle, var(--grid) 1px, transparent 1px)`,
            backgroundSize: `${gridSize * viewport.zoom}px ${gridSize * viewport.zoom}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          }}
        />
      )}

      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}
      >
        {activeFrame && (
          <div
            className="pointer-events-none absolute rounded-2xl border-2 border-dashed border-primary/40"
            style={{ left: activeFrame.x, top: activeFrame.y, width: activeFrame.width, height: activeFrame.height }}
          />
        )}

        {sorted.map((obj) => {
          const selected = selectedIds.includes(obj.id);
          return (
            <div
              key={obj.id}
              className="absolute"
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                transform: `rotate(${obj.rotation}deg)`,
                opacity: obj.opacity,
                cursor: obj.locked ? "not-allowed" : "move",
              }}
              onPointerDown={(e) => startObjectDrag(e, obj)}
              onDoubleClick={() => !obj.locked && setEditingId(obj.id)}
            >
              {editingId === obj.id ? (
                <textarea
                  autoFocus
                  className="h-full w-full resize-none rounded-md bg-surface/80 p-2 text-foreground outline-none ring-2 ring-primary"
                  style={{ fontSize: obj.fontSize, fontWeight: obj.fontWeight }}
                  value={obj.text}
                  onChange={(e) => updateObject(obj.id, { text: e.target.value })}
                  onBlur={() => {
                    commit();
                    setEditingId(null);
                  }}
                />
              ) : (
                <ObjectView obj={obj} />
              )}

              {selected && (
                <>
                  <div className="pointer-events-none absolute -inset-1 rounded-lg ring-2 ring-primary" />
                  {!obj.locked && (
                    <>
                      <div
                        className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-se-resize rounded-sm border border-primary bg-background"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setDrag({ mode: "resize", id: obj.id, startX: e.clientX, startY: e.clientY, w: obj.width, h: obj.height });
                          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                        }}
                      />
                      <div
                        className="absolute -top-7 left-1/2 h-3.5 w-3.5 -translate-x-1/2 cursor-grab rounded-full border border-primary bg-background"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          const r = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                          setDrag({ mode: "rotate", id: obj.id, cx: r.left + r.width / 2, cy: r.top + r.height / 2 });
                          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
