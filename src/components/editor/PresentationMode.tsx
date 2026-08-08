import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { useViewportController } from './ViewportController';
import { IconRenderer } from './IconRenderer';
import PresentationControls from './PresentationControls';
import LaserPointer from './LaserPointer';
import ProgressBar from './ProgressBar';
import PresenterView from './PresenterView';
import { X } from 'lucide-react';

export default function PresentationMode() {
  const { 
    isPresenting, 
    stopPresentation, 
    currentFrameIndex, 
    presentationPath, 
    objects,
    viewport,
    nextFrame,
    prevFrame,
    goToFrame,
    presentationSettings
  } = useCanvasStore();
  
  const { zoomToFrame } = useViewportController();
  const [showControls, setShowControls] = useState(true);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, nextFrame, prevFrame, stopPresentation]);

  useEffect(() => {
    if (isPresenting && presentationPath[currentFrameIndex]) {
      const frameId = presentationPath[currentFrameIndex];
      const frame = objects.find(o => o.id === frameId);
      
      // Use frame-specific duration and easing if available, otherwise fallback to global
      const duration = frame?.settings?.duration ?? presentationSettings.transitionDuration;
      const easing = frame?.settings?.easing ?? 'smooth';
      
      zoomToFrame(frameId, duration, easing);
    }
  }, [currentFrameIndex, isPresenting, presentationPath, zoomToFrame, presentationSettings.transitionDuration, objects]);

  if (!isPresenting) {
    return null;
  }

  const currentFrameId = presentationPath[currentFrameIndex];
  const currentFrame = objects.find(o => o.id === currentFrameId);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col overflow-hidden select-none transition-colors duration-500 ${presentationSettings.darkBackground ? 'bg-neutral-950' : 'bg-white'}`}
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        // Simple click to advance (if not clicking controls)
        if (e.target === e.currentTarget) {
          nextFrame();
        }
      }}
    >
      <div className="flex-1 relative overflow-hidden pointer-events-none">
        {/* Camera Stage (GPU Accelerated Container) */}
        <div
          id="presentation-camera-container"
          className="absolute inset-0 will-change-transform"
          style={{
            transformOrigin: '50% 50%',
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

      {presentationSettings.showProgressBar && (
        <ProgressBar 
          current={currentFrameIndex + 1} 
          total={presentationPath.length} 
          dark={presentationSettings.darkBackground}
        />
      )}

      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 transform pointer-events-auto ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <PresentationControls 
          onToggleNotes={() => setShowPresenterNotes(!showPresenterNotes)}
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
