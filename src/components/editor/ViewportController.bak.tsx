import { useCanvasStore } from "@/lib/canvas-store";
import { useCallback } from "react";

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
  rotation?: number;
}

export function useViewportController() {
  const { viewport, setViewport, objects, selection } = useCanvasStore();

  const animateViewport = useCallback((target: Viewport, duration: number = 300, easing: string = 'smooth') => {
    const start = { ...viewport };
    const startTime = performance.now();
    const targetRotation = target.rotation ?? 0;
    const startRotation = start.rotation ?? 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      let ease = 0;
      switch (easing) {
        case 'ease-in':
          ease = progress * progress * progress;
          break;
        case 'ease-out':
          ease = 1 - Math.pow(1 - progress, 3);
          break;
        case 'ease-in-out':
          ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          break;
        case 'cinematic':
          ease = 1 - Math.pow(1 - progress, 4); // Quartic ease out
          break;
        case 'fast':
          ease = 1 - Math.pow(1 - progress, 5);
          break;
        case 'slow':
          ease = 1 - Math.pow(1 - progress, 2);
          break;
        default: // 'smooth' / 'ease'
          ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      }

      const current = {
        x: start.x + (target.x - start.x) * ease,
        y: start.y + (target.y - start.y) * ease,
        zoom: start.zoom + (target.zoom - start.zoom) * ease,
        rotation: startRotation + (targetRotation - startRotation) * ease,
      };

      setViewport(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [viewport, setViewport]);

  const zoomTo = useCallback((newZoom: number, center?: { x: number, y: number }) => {
    const clampedZoom = Math.min(Math.max(newZoom, 0.05), 10);
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const cx = center?.x ?? viewportWidth / 2;
    const cy = center?.y ?? viewportHeight / 2;

    const worldX = (cx - viewport.x) / viewport.zoom;
    const worldY = (cy - viewport.y) / viewport.zoom;

    const target = {
      zoom: clampedZoom,
      x: cx - worldX * clampedZoom,
      y: cy - worldY * clampedZoom,
      rotation: viewport.rotation || 0
    };

    animateViewport(target);
  }, [viewport, animateViewport]);

  const fitToScreen = useCallback(() => {
    if (objects.length === 0) {
      animateViewport({ x: 0, y: 0, zoom: 1, rotation: 0 });
      return;
    }

    const minX = Math.min(...objects.map(o => o.x));
    const minY = Math.min(...objects.map(o => o.y));
    const maxX = Math.max(...objects.map(o => o.x + o.width));
    const maxY = Math.max(...objects.map(o => o.y + o.height));

    const width = maxX - minX;
    const height = maxY - minY;

    const padding = 100;
    const availableWidth = window.innerWidth - 400;
    const availableHeight = window.innerHeight - 100;

    const zoomX = availableWidth / (width + padding);
    const zoomY = availableHeight / (height + padding);
    const zoom = Math.min(zoomX, zoomY, 1);

    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    const target = {
      zoom,
      x: window.innerWidth / 2 - centerX * zoom,
      y: window.innerHeight / 2 - centerY * zoom,
      rotation: 0
    };

    animateViewport(target);
  }, [objects, animateViewport]);

  const zoomToSelection = useCallback(() => {
    if (selection.length === 0) return;

    const selectedObjects = objects.filter(o => selection.includes(o.id));
    if (selectedObjects.length === 0) return;

    const minX = Math.min(...selectedObjects.map(o => o.x));
    const minY = Math.min(...selectedObjects.map(o => o.y));
    const maxX = Math.max(...selectedObjects.map(o => o.x + o.width));
    const maxY = Math.max(...selectedObjects.map(o => o.y + o.height));

    const width = maxX - minX;
    const height = maxY - minY;

    const padding = 200;
    const availableWidth = window.innerWidth - 400;
    const availableHeight = window.innerHeight - 100;

    const zoomX = availableWidth / (width + padding);
    const zoomY = availableHeight / (height + padding);
    const zoom = Math.min(zoomX, zoomY, 2);

    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    const target = {
      zoom,
      x: window.innerWidth / 2 - centerX * zoom,
      y: window.innerHeight / 2 - centerY * zoom,
      rotation: 0
    };

    animateViewport(target);
  }, [objects, selection, animateViewport]);

  const zoomToFrame = useCallback((frameId: string, duration?: number, easingOverride?: string) => {
    const frame = objects.find(o => o.id === frameId);
    if (!frame) return;

    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;

    const zoomX = availableWidth / frame.width;
    const zoomY = availableHeight / frame.height;
    const zoom = Math.min(zoomX, zoomY);

    const centerX = frame.x + frame.width / 2;
    const centerY = frame.y + frame.height / 2;

    const target = {
      zoom,
      x: window.innerWidth / 2 - centerX * zoom,
      y: window.innerHeight / 2 - centerY * zoom,
      rotation: frame.rotation || 0
    };

    const finalDuration = duration ?? frame.settings?.duration ?? 800;
    const finalEasing = easingOverride ?? frame.settings?.easing ?? 'smooth';

    animateViewport(target, finalDuration, finalEasing);
  }, [objects, animateViewport]);

  const resetZoom = useCallback(() => {
    animateViewport({ x: 0, y: 0, zoom: 1, rotation: 0 });
  }, [animateViewport]);

  return { zoomTo, fitToScreen, zoomToSelection, resetZoom, zoomToFrame };
}
