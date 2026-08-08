import React from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { Timer, Maximize2, Play, Sliders } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function Footer() {
  const { presentationSettings, updatePresentationSettings, startPresentation, isPresenting } = useCanvasStore();

  if (isPresenting) return null;

  return (
    <div className="h-[60px] border-t border-neutral-200 bg-white flex items-center px-4 justify-between select-none">
      <div className="flex items-center gap-6">
        {/* Transition Speed */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Timer size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Transition Speed</span>
          </div>
          <div className="flex items-center gap-3 w-40">
            <Slider
              min={100}
              max={2500}
              step={100}
              value={[presentationSettings.transitionDuration]}
              onValueChange={([v]) => updatePresentationSettings({ transitionDuration: v })}
              className="flex-1"
            />
            <span className="text-[10px] font-mono text-neutral-600 w-10 text-right">
              {presentationSettings.transitionDuration}ms
            </span>
          </div>
        </div>

        <div className="w-px h-6 bg-neutral-200" />

        {/* Presentation Zoom */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Maximize2 size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Presentation Zoom</span>
            </div>
            <div className="flex items-center gap-3 w-40">
              <Slider
                min={0}
                max={0.8}
                step={0.01}
                value={[presentationSettings.zoomPadding ?? 0.1]}
                onValueChange={([v]) => updatePresentationSettings({ zoomPadding: v })}
                className="flex-1"
              />
              <span className="text-[10px] font-mono text-neutral-600 w-10 text-right">
                {Math.round((presentationSettings.zoomPadding ?? 0.1) * 100)}%
              </span>
            </div>
          </div>
          <p className="text-[9px] text-neutral-400 pl-5 leading-none">Increase to zoom OUT more during presentation</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => startPresentation()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full hover:bg-primary/90 transition-all text-xs font-bold shadow-sm active:scale-95"
        >
          <Play size={14} fill="currentColor" />
          PRESENTATION MODE
        </button>
      </div>
    </div>
  );
}
