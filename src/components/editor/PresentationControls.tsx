import React from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Clock, 
  Settings2,
  X
} from 'lucide-react';

interface PresentationControlsProps {
  onToggleNotes: () => void;
  dark?: boolean;
}

export default function PresentationControls({ onToggleNotes, dark }: PresentationControlsProps) {
  const { 
    currentFrameIndex, 
    presentationPath, 
    nextFrame, 
    prevFrame, 
    stopPresentation,
    presentationSettings,
    updatePresentationSettings
  } = useCanvasStore();

  const isLastFrame = currentFrameIndex === presentationPath.length - 1;
  const isFirstFrame = currentFrameIndex === 0;

  const bgClass = dark ? 'bg-neutral-900/90 text-white' : 'bg-white/90 text-neutral-900';
  const borderClass = dark ? 'border-white/10' : 'border-black/5';
  const hoverClass = dark ? 'hover:bg-white/10' : 'hover:bg-black/5';

  return (
    <div className={`flex items-center gap-1 p-1.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${bgClass} ${borderClass}`}>
      <div className="flex items-center px-2 mr-2">
        <span className="text-xs font-bold tabular-nums">
          {currentFrameIndex + 1} / {presentationPath.length}
        </span>
      </div>

      <div className="w-px h-6 bg-current opacity-10 mx-1" />

      <button
        onClick={prevFrame}
        disabled={isFirstFrame}
        className={`p-2 rounded-xl transition-colors ${hoverClass} disabled:opacity-30`}
        title="Previous (Left Arrow)"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => updatePresentationSettings({ autoPlay: !presentationSettings.autoPlay })}
        className={`p-2 rounded-xl transition-colors ${hoverClass} ${presentationSettings.autoPlay ? 'text-primary' : ''}`}
        title={presentationSettings.autoPlay ? "Pause Auto-play" : "Start Auto-play"}
      >
        {presentationSettings.autoPlay ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <button
        onClick={nextFrame}
        disabled={isLastFrame && !presentationSettings.loop}
        className={`p-2 rounded-xl transition-colors ${hoverClass} disabled:opacity-30`}
        title="Next (Right Arrow / Space)"
      >
        <ChevronRight size={20} />
      </button>

      <div className="w-px h-6 bg-current opacity-10 mx-1" />

      <button
        onClick={onToggleNotes}
        className={`p-2 rounded-xl transition-colors ${hoverClass}`}
        title="Presenter View (Speaker Notes)"
      >
        <FileText size={20} />
      </button>

      <button
        onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }}
        className={`p-2 rounded-xl transition-colors ${hoverClass}`}
        title="Toggle Fullscreen"
      >
        <Maximize2 size={20} />
      </button>

      <div className="w-px h-6 bg-current opacity-10 mx-1" />

      <button
        onClick={stopPresentation}
        className="p-2 rounded-xl transition-colors hover:bg-red-500 hover:text-white"
        title="Exit Presentation (Esc)"
      >
        <X size={20} />
      </button>
    </div>
  );
}
