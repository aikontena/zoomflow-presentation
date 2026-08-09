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

  const animateViewport = useCallback((target: Viewport, duration: number = 300, easing: string = 'smooth', pathType: string = 'linear') => {
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
      let currentX = start.x + (target.x - start.x) * progress; // Default linear
      let currentY = start.y + (target.y - start.y) * progress;
      let currentZoom = start.zoom + (target.zoom - start.zoom) * progress;
      let currentRotation = startRotation + (targetRotation - startRotation) * progress;

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
          ease = 1 - Math.pow(1 - progress, 4);
          break;
        case 'fast':
          ease = 1 - Math.pow(1 - progress, 5);
          break;
        case 'slow':
          ease = 1 - Math.pow(1 - progress, 2);
          break;
        case 'elastic':
          const c4 = (2 * Math.PI) / 3;
          ease = progress === 0 ? 0 : progress === 1 ? 1 : -Math.pow(2, 10 * progress - 10) * Math.sin((progress * 10 - 10.75) * c4);
          break;
        case 'spring':
          const c1 = 1.70158;
          const c3 = c1 + 1;
          ease = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
          break;
        case 'bounce':
          const n1 = 7.5625;
          const d1 = 2.75;
          let p = progress;
          if (p < 1 / d1) {
            ease = n1 * p * p;
          } else if (p < 2 / d1) {
            ease = n1 * (p -= 1.5 / d1) * p + 0.75;
          } else if (p < 2.5 / d1) {
            ease = n1 * (p -= 2.25 / d1) * p + 0.9375;
          } else {
            ease = n1 * (p -= 2.625 / d1) * p + 0.984375;
          }
          break;
        case 'morph':
          ease = progress < 0.5 ? 8 * progress * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 4) / 2;
          break;
        case 'pan':
          ease = progress;
          break;
        default: // 'smooth'
          ease = 1 - Math.pow(1 - progress, 3);
      }

      // Default interpolation using the ease
      currentX = start.x + (target.x - start.x) * ease;
      currentY = start.y + (target.y - start.y) * ease;
      currentZoom = start.zoom + (target.zoom - start.zoom) * ease;
      currentRotation = startRotation + (targetRotation - startRotation) * ease;

      // Specialized visual overrides
      if (easing === 'vortex') {
        currentRotation += Math.sin(progress * Math.PI) * 45;
      } else if (easing === 'origami') {
        currentZoom *= (1 + Math.sin(progress * Math.PI) * 0.2);
      } else if (easing === 'orbit') {
        const orbitOffset = Math.sin(progress * Math.PI) * 200;
        currentX += orbitOffset;
      }

      if (pathType === 'curved' || pathType === 'spiral') {
        const angle = progress * Math.PI;
        const curveIntensity = pathType === 'spiral' ? 200 : 100;
        const offset = Math.sin(angle) * curveIntensity * (1 - ease);
        currentX += offset;
        currentY += offset;
      } else if (pathType === 'zoom-out') {
        const zoomDip = Math.sin(progress * Math.PI) * (start.zoom * 0.5);
        currentZoom -= zoomDip * (1 - progress);
      }

      const current = {
        x: currentX,
        y: currentY,
        zoom: currentZoom,
        rotation: currentRotation,
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

  const zoomToFrame = useCallback((frameId: string, duration?: number, easingOverride?: string, pathTypeOverride?: string) => {
    const state = useCanvasStore.getState();
    const currentObjects = state.objects;
    const presentationSettings = state.presentationSettings;
    const frame = currentObjects.find(o => o.id === frameId);
    if (!frame) return;

    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;

    // Apply zoom padding from settings
    // A padding of 0 means the frame takes 100% of the screen.
    // A padding of 0.8 means the frame takes only 20% of the screen (zoomed out more).
    const paddingMultiplier = 1 - (presentationSettings.zoomPadding ?? 0.1);
    
    // Use the effective viewport area for the calculation
    const effectiveWidth = availableWidth * paddingMultiplier;
    const effectiveHeight = availableHeight * paddingMultiplier;

    const zoomX = effectiveWidth / frame.width;
    const zoomY = effectiveHeight / frame.height;
    
    // We take the minimum to ensure the whole frame fits within the effective area
    let zoom = Math.min(zoomX, zoomY);

    // Limit extreme zoom-in for very small frames
    zoom = Math.min(zoom, 10); 

    const centerX = frame.x + frame.width / 2;
    const centerY = frame.y + frame.height / 2;

    const target = {
      zoom,
      x: availableWidth / 2 - centerX * zoom,
      y: availableHeight / 2 - centerY * zoom,
      rotation: frame.rotation || 0
    };

    const finalDuration = duration ?? frame.settings?.duration ?? 800;
    const finalEasing = easingOverride ?? frame.settings?.easing ?? 'smooth';
    const finalPathType = pathTypeOverride ?? frame.settings?.pathType ?? 'linear';

    animateViewport(target, finalDuration, finalEasing, finalPathType);
  }, [animateViewport]);

  const resetZoom = useCallback(() => {
    animateViewport({ x: 0, y: 0, zoom: 1, rotation: 0 });
  }, [animateViewport]);

  return { zoomTo, fitToScreen, zoomToSelection, resetZoom, zoomToFrame, animateViewport };
}
