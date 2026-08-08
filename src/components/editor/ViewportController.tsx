import { useCanvasStore } from "@/lib/canvas-store";
import { useCallback, useRef } from "react";

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
  rotation?: number;
}

export function useViewportController() {
  const { viewport, setViewport, objects, selection } = useCanvasStore();
  const animationFrameRef = useRef<number | null>(null);

  const animateViewport = useCallback((target: Viewport, duration: number = 300, easing: string = 'smooth') => {
    const start = { ...useCanvasStore.getState().viewport };
    const startTime = performance.now();
    const targetRotation = target.rotation ?? 0;
    const startRotation = start.rotation ?? 0;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

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

      // 1. Direct DOM manipulation for maximum performance during presentation
      const editorStage = document.getElementById('editor-stage');
      const presStage = document.getElementById('presentation-camera-container');
      
      const transform = `translate3d(${current.x}px, ${current.y}px, 0) scale(${current.zoom}) rotate(${current.rotation}deg)`;
      
      if (editorStage) editorStage.style.transform = transform;
      if (presStage) presStage.style.transform = transform;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Only update the store at the very end of the animation to sync state
        // This avoids N React renders during the animation
        setViewport(current);
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [setViewport]);

  const zoomTo = useCallback((newZoom: number, center?: { x: number, y: number }) => {
    const currentViewport = useCanvasStore.getState().viewport;
    const clampedZoom = Math.min(Math.max(newZoom, 0.05), 10);
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const cx = center?.x ?? viewportWidth / 2;
    const cy = center?.y ?? viewportHeight / 2;

    const worldX = (cx - currentViewport.x) / currentViewport.zoom;
    const worldY = (cy - currentViewport.y) / currentViewport.zoom;

    const target = {
      zoom: clampedZoom,
      x: cx - worldX * clampedZoom,
      y: cy - worldY * clampedZoom,
      rotation: currentViewport.rotation || 0
    };

    animateViewport(target);
  }, [animateViewport]);

  const fitToScreen = useCallback(() => {
    const currentObjects = useCanvasStore.getState().objects;
    if (currentObjects.length === 0) {
      animateViewport({ x: 0, y: 0, zoom: 1, rotation: 0 });
      return;
    }

    const minX = Math.min(...currentObjects.map(o => o.x));
    const minY = Math.min(...currentObjects.map(o => o.y));
    const maxX = Math.max(...currentObjects.map(o => o.x + o.width));
    const maxY = Math.max(...currentObjects.map(o => o.y + o.height));

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
  }, [animateViewport]);

  const zoomToSelection = useCallback(() => {
    const state = useCanvasStore.getState();
    const currentSelection = state.selection;
    const currentObjects = state.objects;
    
    if (currentSelection.length === 0) return;

    const selectedObjects = currentObjects.filter(o => currentSelection.includes(o.id));
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
  }, [animateViewport]);

  const zoomToFrame = useCallback((frameId: string, duration?: number, easingOverride?: string) => {
    const currentObjects = useCanvasStore.getState().objects;
    const frame = currentObjects.find(o => o.id === frameId);
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
  }, [animateViewport]);

  const resetZoom = useCallback(() => {
    animateViewport({ x: 0, y: 0, zoom: 1, rotation: 0 });
  }, [animateViewport]);

  return { zoomTo, fitToScreen, zoomToSelection, resetZoom, zoomToFrame };
}
