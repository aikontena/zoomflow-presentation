import { useCanvasStore } from "@/lib/canvas-store";
import { useCallback } from "react";

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export function useViewportController() {
  const { viewport, setViewport, objects, selection } = useCanvasStore();

  const animateViewport = useCallback((target: Viewport, duration: number = 300) => {
    const start = { ...viewport };
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const current = {
        x: start.x + (target.x - start.x) * ease,
        y: start.y + (target.y - start.y) * ease,
        zoom: start.zoom + (target.zoom - start.zoom) * ease,
      };

      setViewport(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [viewport, setViewport]);

  const zoomTo = useCallback((newZoom: number, center?: { x: number, y: number }) => {
    const clampedZoom = Math.min(Math.max(newZoom, 0.05), 10); // 5% to 1000%
    
    // If center is not provided, use the center of the viewport
    const viewportWidth = window.innerWidth; // Approximate, should ideally be the container width
    const viewportHeight = window.innerHeight;

    const cx = center?.x ?? viewportWidth / 2;
    const cy = center?.y ?? viewportHeight / 2;

    const worldX = (cx - viewport.x) / viewport.zoom;
    const worldY = (cy - viewport.y) / viewport.zoom;

    const target = {
      zoom: clampedZoom,
      x: cx - worldX * clampedZoom,
      y: cy - worldY * clampedZoom,
    };

    animateViewport(target);
  }, [viewport, animateViewport]);

  const fitToScreen = useCallback(() => {
    if (objects.length === 0) {
      animateViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }

    // Calculate bounds of all objects
    const minX = Math.min(...objects.map(o => o.x));
    const minY = Math.min(...objects.map(o => o.y));
    const maxX = Math.max(...objects.map(o => o.x + o.width));
    const maxY = Math.max(...objects.map(o => o.y + o.height));

    const width = maxX - minX;
    const height = maxY - minY;

    const padding = 100;
    const availableWidth = window.innerWidth - 400; // Account for sidebars
    const availableHeight = window.innerHeight - 100;

    const zoomX = availableWidth / (width + padding);
    const zoomY = availableHeight / (height + padding);
    const zoom = Math.min(zoomX, zoomY, 1); // Don't zoom in more than 100%

    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    const target = {
      zoom,
      x: window.innerWidth / 2 - centerX * zoom,
      y: window.innerHeight / 2 - centerY * zoom,
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
    const zoom = Math.min(zoomX, zoomY, 2); // Allow up to 200% zoom for selection

    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    const target = {
      zoom,
      x: window.innerWidth / 2 - centerX * zoom,
      y: window.innerHeight / 2 - centerY * zoom,
    };

    animateViewport(target);
  }, [objects, selection, animateViewport]);

  const resetZoom = useCallback(() => {
    animateViewport({ x: 0, y: 0, zoom: 1 });
  }, [animateViewport]);

  return { zoomTo, fitToScreen, zoomToSelection, resetZoom };
}
