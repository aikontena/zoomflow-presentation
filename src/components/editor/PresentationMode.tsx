import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { useViewportController } from './ViewportController';
import { IconRenderer } from './IconRenderer';
import PresentationControls from './PresentationControls';
import PresentationMiniMap from './PresentationMiniMap';
import LaserPointer from './LaserPointer';
import PresenterView from './PresenterView';
import { applyCamera, clampZoom, getCamera, normalizedDelta, zoomAtPoint } from '@/lib/camera-utils';
import { X } from 'lucide-react';

export default function PresentationMode() {
  const isPresenting = useCanvasStore(state => state.isPresenting);
  const stopPresentation = useCanvasStore(state => state.stopPresentation);
  const currentFrameIndex = useCanvasStore(state => state.currentFrameIndex);
  const presentationPath = useCanvasStore(state => state.presentationPath);
  const objects = useCanvasStore(state => state.objects);
  const nextFrame = useCanvasStore(state => state.nextFrame);
  const prevFrame = useCanvasStore(state => state.prevFrame);
  const goToFrame = useCanvasStore(state => state.goToFrame);
  const presentationSettings = useCanvasStore(state => state.presentationSettings);

  const { zoomToFrame, fitToScreen, resetZoom, zoomTo } = useViewportController();
  const [showControls, setShowControls] = useState(true);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ startX: number; startY: number; camX: number; camY: number; moved: boolean } | null>(null);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // ---- Manual camera actions -------------------------------------------------
  const focusCurrentFrame = useCallback(() => {
    const frameId = presentationPath[currentFrameIndex];
    if (!frameId) return;
    zoomToFrame(frameId, presentationSettings.transitionDuration, presentationSettings.smoothness);
  }, [presentationPath, currentFrameIndex, zoomToFrame, presentationSettings]);

  const manualZoomBy = useCallback((factor: number) => {
    const cam = getCamera();
    zoomTo(clampZoom(cam.zoom * factor));
  }, [zoomTo]);

  const handleZoomIn = useCallback(() => manualZoomBy(1.25), [manualZoomBy]);
  const handleZoomOut = useCallback(() => manualZoomBy(1 / 1.25), [manualZoomBy]);

  // ---- Keyboard --------------------------------------------------------------
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextFrame();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevFrame();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopPresentation();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === 'Home') {
        e.preventDefault();
        fitToScreen();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        focusCurrentFrame();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, nextFrame, prevFrame, stopPresentation, handleZoomIn, handleZoomOut, fitToScreen, resetZoom, focusCurrentFrame]);

  // ---- Wheel zoom (non-passive so pinch/ctrl-wheel never zooms the page) ------
  const settingsRef = useRef(presentationSettings);
  settingsRef.current = presentationSettings;

  useEffect(() => {
    if (!isPresenting) return;
    const el = rootRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!settingsRef.current.manualZoom) return;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const dy = normalizedDelta(e);
      // Ctrl + wheel = precise (finer) zoom
      const intensity = 0.0015 * settingsRef.current.zoomSpeed * (e.ctrlKey ? 0.3 : 1);
      const cam = getCamera();
      applyCamera(zoomAtPoint(cam.zoom * Math.exp(-dy * intensity), px, py, cam));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isPresenting]);

  // ---- Frame navigation ------------------------------------------------------
  useEffect(() => {
    if (isPresenting && presentationPath[currentFrameIndex]) {
      const frameId = presentationPath[currentFrameIndex];
      const frame = objects.find(o => o.id === frameId);

      const duration = frame?.settings?.duration ?? presentationSettings.transitionDuration;
      const easing = frame?.settings?.easing ?? presentationSettings.smoothness ?? 'smooth';

      zoomToFrame(frameId, duration, easing);
    }
  }, [currentFrameIndex, isPresenting, presentationPath, zoomToFrame, presentationSettings.transitionDuration, presentationSettings.smoothness, objects]);

  if (!isPresenting) {
    return null;
  }

  const currentFrameId = presentationPath[currentFrameIndex];
  const currentFrame = objects.find(o => o.id === currentFrameId);

  // ---- Pan (drag) ------------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    if (!presentationSettings.manualPan) return;
    if (e.button !== 0 && e.button !== 1) return;
    const cam = getCamera();
    panRef.current = { startX: e.clientX, startY: e.clientY, camX: cam.x, camY: cam.y, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    handleMouseMove();
    const pan = panRef.current;
    if (!pan) return;
    const dx = e.clientX - pan.startX;
    const dy = e.clientY - pan.startY;
    if (!pan.moved && Math.hypot(dx, dy) < 3) return;
    pan.moved = true;
    const cam = getCamera();
    applyCamera({ ...cam, x: pan.camX + dx, y: pan.camY + dy }, false);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const pan = panRef.current;
    panRef.current = null;
    if (pan?.moved) {
      const cam = getCamera();
      const dx = e.clientX - pan.startX;
      const dy = e.clientY - pan.startY;
      applyCamera({ ...cam, x: pan.camX + dx, y: pan.camY + dy });
      return;
    }
    // Simple click to advance when clicking empty stage
    if (e.target === e.currentTarget) nextFrame();
  };

  // Double click focuses the frame under the cursor
  const onDoubleClick = (e: React.MouseEvent) => {
    const cam = getCamera();
    const worldX = (e.clientX - cam.x) / cam.zoom;
    const worldY = (e.clientY - cam.y) / cam.zoom;
    const frames = objects.filter(o => o.type === 'frame');
    const hit = [...frames].reverse().find(
      f => worldX >= f.x && worldX <= f.x + f.width && worldY >= f.y && worldY <= f.y + f.height
    );
    if (hit) {
      const idx = presentationPath.indexOf(hit.id);
      if (idx >= 0) goToFrame(idx);
      else zoomToFrame(hit.id, presentationSettings.transitionDuration, presentationSettings.smoothness);
    } else if (presentationSettings.manualZoom) {
      applyCamera(zoomAtPoint(cam.zoom * 1.6, e.clientX, e.clientY, cam));
    }
  };

  return (
    <div
      ref={rootRef}
      className={`fixed inset-0 z-[100] flex flex-col overflow-hidden select-none transition-colors duration-500 ${presentationSettings.darkBackground ? 'bg-neutral-950' : 'bg-white'} ${presentationSettings.manualPan ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex-1 relative overflow-hidden pointer-events-none">
        {/* Camera Stage (GPU Accelerated Container) */}
        <div
          id="presentation-camera-container"
          className="absolute inset-0 will-change-transform"
          style={{
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {objects.map(obj => (
            <div
              key={obj.id}
              className="absolute"
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                transform: `rotate(${obj.rotation || 0}deg)`,
                backgroundColor: (obj.type !== 'text' && obj.type !== 'frame' && obj.type !== 'icon') ? obj.fill : 'transparent',
                background: obj.type === 'frame' ? obj.fill : undefined,
                border: obj.type === 'frame' ? '1px solid rgba(0,0,0,0.1)' : 'none',
                borderRadius: obj.type === 'circle' ? '50%' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: obj.fill || 'black',
                fontSize: obj.fontSize || (obj.type === 'frame' ? 12 : 16),
                pointerEvents: 'none',
                userSelect: 'none',
                filter: obj.shadow ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' : undefined,
                zIndex: obj.type === 'frame' ? -1 : 1,
                opacity: obj.opacity ?? 1,
              }}
            >
              {obj.type === 'text' && obj.text}
              {obj.type === 'icon' && obj.iconName && (
                <div className="w-full h-full p-[10%]">
                  <IconRenderer
                    name={obj.iconName}
                    size="100%"
                    color={obj.fill}
                    strokeWidth={obj.strokeWidth || 2}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <LaserPointer />

        {presentationSettings.showFrameTitles && currentFrame && (
          <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-auto ${presentationSettings.darkBackground ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
            <h2 className="text-lg font-medium">{currentFrame.text || `Frame ${currentFrameIndex + 1}`}</h2>
          </div>
        )}
      </div>


      {presentationSettings.showMiniMap && (
        <div className={`fixed bottom-24 right-6 transition-all duration-300 pointer-events-auto ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <PresentationMiniMap
            dark={presentationSettings.darkBackground}
            onJumpToFrame={(id) => {
              const idx = presentationPath.indexOf(id);
              if (idx >= 0) goToFrame(idx);
              else zoomToFrame(id, presentationSettings.transitionDuration, presentationSettings.smoothness);
            }}
          />
        </div>
      )}

      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 transform pointer-events-auto ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <PresentationControls
          onToggleNotes={() => setShowPresenterNotes(!showPresenterNotes)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitCanvas={fitToScreen}
          onFocusFrame={focusCurrentFrame}
          onResetCamera={resetZoom}
          dark={presentationSettings.darkBackground}
        />
      </div>

      {showPresenterNotes && (
        <PresenterView
          onClose={() => setShowPresenterNotes(false)}
          dark={presentationSettings.darkBackground}
        />
      )}

      <button
        onClick={stopPresentation}
        className={`fixed top-4 right-4 p-2 rounded-full transition-all duration-300 transform pointer-events-auto ${showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} hover:bg-black/10 ${presentationSettings.darkBackground ? 'text-white hover:bg-white/10' : 'text-black'}`}
      >
        <X size={24} />
      </button>
    </div>
  );
}
