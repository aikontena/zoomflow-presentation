import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { useViewportController } from './ViewportController';
import PresentationControls from './PresentationControls';
import LaserPointer from './LaserPointer';
import ProgressBar from './ProgressBar';
import PresenterView from './PresenterView';
import { Maximize2, Minimize2, X } from 'lucide-react';

export default function PresentationMode() {
  const { 
    isPresenting, 
    stopPresentation, 
    currentFrameIndex, 
    presentationPath, 
    objects,
    nextFrame,
    prevFrame,
    goToFrame,
    presentationSettings
  } = useCanvasStore();
  
  const { zoomToFrame } = useViewportController();
  const [showControls, setShowControls] = useState(true);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle navigation keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresenting) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextFrame();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevFrame();
          break;
        case 'Home':
          e.preventDefault();
          goToFrame(0);
          break;
        case 'End':
          e.preventDefault();
          goToFrame(presentationPath.length - 1);
          break;
        case 'Escape':
          e.preventDefault();
          stopPresentation();
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, nextFrame, prevFrame, goToFrame, stopPresentation, presentationPath.length]);

  // Animate camera when frame changes
  useEffect(() => {
    if (isPresenting && presentationPath[currentFrameIndex]) {
      zoomToFrame(presentationPath[currentFrameIndex], presentationSettings.transitionDuration);
    }
  }, [currentFrameIndex, isPresenting, presentationPath, zoomToFrame, presentationSettings.transitionDuration]);

  // Auto-play logic
  useEffect(() => {
    if (isPresenting && presentationSettings.autoPlay) {
      const interval = setInterval(() => {
        nextFrame();
      }, presentationSettings.autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPresenting, presentationSettings.autoPlay, presentationSettings.autoPlayInterval, nextFrame]);

  // Hide controls after inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (!isPresenting) return null;


  const currentFrameId = presentationPath[currentFrameIndex];
  const currentFrame = objects.find(o => o.id === currentFrameId);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col overflow-hidden select-none transition-colors duration-500 ${presentationSettings.darkBackground ? 'bg-neutral-950' : 'bg-white'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Background/Audience View Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* The canvas content is rendered by the main Canvas component, 
            but we might want to overlay a laser pointer or special UI here */}
        <LaserPointer />
        
        {/* Frame Title Overlay (if enabled) */}
        {presentationSettings.showFrameTitles && currentFrame && (
          <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-500 ${presentationSettings.darkBackground ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
            <h2 className="text-lg font-medium">{currentFrame.text || `Frame ${currentFrameIndex + 1}`}</h2>
          </div>
        )}
      </div>

      {/* Progress Bar (if enabled) */}
      {presentationSettings.showProgressBar && (
        <ProgressBar 
          current={currentFrameIndex + 1} 
          total={presentationPath.length} 
          dark={presentationSettings.darkBackground}
        />
      )}

      {/* Floating Controls */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 transform ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <PresentationControls 
          onToggleNotes={() => setShowPresenterNotes(!showPresenterNotes)}
          dark={presentationSettings.darkBackground}
        />
      </div>

      {/* Presenter View Modal/Overlay */}
      {showPresenterNotes && (
        <PresenterView 
          onClose={() => setShowPresenterNotes(false)}
          dark={presentationSettings.darkBackground}
        />
      )}

      {/* Quick Exit Button (Top Right) */}
      <button 
        onClick={stopPresentation}
        className={`fixed top-4 right-4 p-2 rounded-full transition-all duration-300 transform ${showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} hover:bg-black/10 ${presentationSettings.darkBackground ? 'text-white hover:bg-white/10' : 'text-black'}`}
        title="Exit Presentation (Esc)"
      >
        <X size={24} />
      </button>
    </div>
  );
}
