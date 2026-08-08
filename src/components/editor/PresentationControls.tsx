import React from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Frame,
  Scan,
  RotateCcw,
  FileText,
  Map as MapIcon,
  Settings2,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface PresentationControlsProps {
  onToggleNotes: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitCanvas: () => void;
  onFocusFrame: () => void;
  onResetCamera: () => void;
  dark?: boolean;
}

export default function PresentationControls({
  onToggleNotes,
  onZoomIn,
  onZoomOut,
  onFitCanvas,
  onFocusFrame,
  onResetCamera,
  dark,
}: PresentationControlsProps) {
  const {
    currentFrameIndex,
    presentationPath,
    nextFrame,
    prevFrame,
    stopPresentation,
    presentationSettings,
    updatePresentationSettings,
    viewport,
  } = useCanvasStore();

  const isLastFrame = currentFrameIndex === presentationPath.length - 1;
  const isFirstFrame = currentFrameIndex === 0;
  const total = Math.max(presentationPath.length, 1);
  const progress = ((currentFrameIndex + 1) / total) * 100;

  const bgClass = dark ? 'bg-neutral-900/90 text-white' : 'bg-white/90 text-neutral-900';
  const borderClass = dark ? 'border-white/10' : 'border-black/5';
  const hoverClass = dark ? 'hover:bg-white/10' : 'hover:bg-black/5';
  const btn = `p-2 rounded-xl transition-colors ${hoverClass} disabled:opacity-30`;

  return (
    <div className={`rounded-2xl border backdrop-blur-xl shadow-2xl ${bgClass} ${borderClass}`}>
      {/* Progress */}
      <div className={`h-1 rounded-t-2xl overflow-hidden ${dark ? 'bg-white/10' : 'bg-black/5'}`}>
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-1 p-1.5">
        <div className="flex items-center px-2 mr-1">
          <span className="text-xs font-bold tabular-nums">
            {currentFrameIndex + 1} / {presentationPath.length}
          </span>
        </div>

        <div className="w-px h-6 bg-current opacity-10 mx-1" />

        <button onClick={prevFrame} disabled={isFirstFrame} className={btn} title="Previous (←)">
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => updatePresentationSettings({ autoPlay: !presentationSettings.autoPlay })}
          className={`${btn} ${presentationSettings.autoPlay ? 'text-primary' : ''}`}
          title={presentationSettings.autoPlay ? 'Pause Auto-play' : 'Start Auto-play'}
        >
          {presentationSettings.autoPlay ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          onClick={nextFrame}
          disabled={isLastFrame && !presentationSettings.loop}
          className={btn}
          title="Next (→ / Space)"
        >
          <ChevronRight size={20} />
        </button>

        <div className="w-px h-6 bg-current opacity-10 mx-1" />

        {/* Camera controls */}
        <button onClick={onZoomOut} className={btn} title="Zoom Out (−)">
          <ZoomOut size={18} />
        </button>
        <span className="text-[11px] font-semibold tabular-nums w-11 text-center opacity-70">
          {Math.round((viewport.zoom || 1) * 100)}%
        </span>
        <button onClick={onZoomIn} className={btn} title="Zoom In (+)">
          <ZoomIn size={18} />
        </button>
        <button onClick={onFitCanvas} className={btn} title="Fit Entire Canvas (Home)">
          <Scan size={18} />
        </button>
        <button onClick={onFocusFrame} className={btn} title="Focus Current Frame (F)">
          <Frame size={18} />
        </button>
        <button onClick={onResetCamera} className={btn} title="Reset Camera (R)">
          <RotateCcw size={18} />
        </button>

        <div className="w-px h-6 bg-current opacity-10 mx-1" />

        <button
          onClick={() => updatePresentationSettings({ showMiniMap: !presentationSettings.showMiniMap })}
          className={`${btn} ${presentationSettings.showMiniMap ? 'text-primary' : ''}`}
          title="Toggle Mini Map (M)"
        >
          <MapIcon size={18} />
        </button>

        <button onClick={onToggleNotes} className={btn} title="Presenter View (Speaker Notes)">
          <FileText size={18} />
        </button>

        {/* Camera settings */}
        <DropdownMenu>
          <DropdownMenuTrigger className={btn} title="Camera Settings">
            <Settings2 size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="w-72 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Camera Settings</p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Zoom Speed</span>
                <span className="font-mono">{presentationSettings.zoomSpeed.toFixed(1)}x</span>
              </div>
              <Slider
                min={0.2}
                max={3}
                step={0.1}
                value={[presentationSettings.zoomSpeed]}
                onValueChange={([v]) => updatePresentationSettings({ zoomSpeed: v })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Transition Duration</span>
                <span className="font-mono">{(presentationSettings.transitionDuration / 1000).toFixed(1)}s</span>
              </div>
              <Slider
                min={200}
                max={4000}
                step={100}
                value={[presentationSettings.transitionDuration]}
                onValueChange={([v]) => updatePresentationSettings({ transitionDuration: v })}
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs">Smoothness</span>
              <select
                value={presentationSettings.smoothness}
                onChange={e => updatePresentationSettings({ smoothness: e.target.value })}
                className="w-full text-xs border rounded-md px-2 py-1.5 bg-background"
              >
                <option value="smooth">Smooth</option>
                <option value="cinematic">Cinematic</option>
                <option value="ease-in-out">Ease In Out</option>
                <option value="fast">Fast</option>
                <option value="slow">Slow</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs">Enable Manual Zoom</span>
              <Switch
                checked={presentationSettings.manualZoom}
                onCheckedChange={v => updatePresentationSettings({ manualZoom: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs">Enable Manual Pan</span>
              <Switch
                checked={presentationSettings.manualPan}
                onCheckedChange={v => updatePresentationSettings({ manualPan: v })}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className={btn}
          title="Toggle Fullscreen"
        >
          <Maximize2 size={18} />
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
    </div>
  );
}
