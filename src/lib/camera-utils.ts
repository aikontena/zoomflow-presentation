import { useCanvasStore } from '@/lib/canvas-store';

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 20;

export function clampZoom(z: number) {
  return Math.min(Math.max(z, MIN_ZOOM), MAX_ZOOM);
}

export function getCamera(): Camera {
  const v = useCanvasStore.getState().viewport;
  return { x: v.x, y: v.y, zoom: v.zoom || 1, rotation: v.rotation || 0 };
}

/** Writes the camera transform straight to the DOM (no React render) and syncs the store. */
export function applyCamera(cam: Camera, commit = true) {
  const transform = `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.zoom}) rotate(${cam.rotation}deg)`;
  const editorStage = document.getElementById('editor-stage');
  const presStage = document.getElementById('presentation-camera-container');
  if (editorStage) editorStage.style.transform = transform;
  if (presStage) presStage.style.transform = transform;
  if (commit) useCanvasStore.getState().setViewport(cam);
}

/** Zoom anchored at a screen point, keeping the world point under the cursor fixed. */
export function zoomAtPoint(nextZoom: number, px: number, py: number, base?: Camera): Camera {
  const cam = base ?? getCamera();
  const z = clampZoom(nextZoom);
  const k = z / cam.zoom;
  return {
    ...cam,
    zoom: z,
    x: px - (px - cam.x) * k,
    y: py - (py - cam.y) * k,
  };
}

/** Normalizes wheel delta across browsers / deltaMode. */
export function normalizedDelta(e: WheelEvent) {
  return e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
}
