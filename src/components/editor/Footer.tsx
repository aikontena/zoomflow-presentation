import React from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { Timer, Maximize2, Play, Sliders, Layout, MonitorPlay, Dices, ZoomOut } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Footer() {
  const { presentationSettings, updatePresentationSettings, startPresentation, isPresenting } = useCanvasStore();

  if (isPresenting) return null;

  return (
    <div className="h-[60px] border-t border-neutral-200 bg-white flex items-center px-4 justify-between select-none">
      <div className="flex items-center gap-6">
        {/* Transition Speed */}
        <div className="flex flex-col gap-0.5">
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
          <p className="text-[9px] text-neutral-400 pl-5 leading-none">Global duration for all transition steps</p>
        </div>

        <div className="w-px h-8 bg-neutral-200" />

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

        <div className="w-px h-8 bg-neutral-200" />

        {/* Zoom Out Transition Toggle */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <ZoomOut size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Spatial Zoom Out</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => updatePresentationSettings({ zoomOutBeforeNext: !presentationSettings.zoomOutBeforeNext })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${presentationSettings.zoomOutBeforeNext ? 'bg-primary' : 'bg-neutral-200'}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${presentationSettings.zoomOutBeforeNext ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
          <p className="text-[9px] text-neutral-400 pl-5 leading-none">Zoom to overview between slides</p>
        </div>

        <div className="w-px h-8 bg-neutral-200" />

        {/* Quick Transition Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => {
                    const store = useCanvasStore.getState();
                    const path = store.presentationPath;
                    path.forEach(id => store.updateObject(id, { settings: { ...store.objects.find(o => o.id === id)?.settings, easing: 'morph' } as any }));
                    import('sonner').then(({ toast }) => toast.success("Morph transition applied to all steps"));
                  }}
                  className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors border border-neutral-100"
                >
                  <MonitorPlay size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Apply Morph to All</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => {
                    useCanvasStore.getState().randomizeTransitions();
                  }}
                  className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors border border-neutral-100"
                >
                  <Dices size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Randomize All Transitions</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            const hasPath = useCanvasStore.getState().presentationPath.length > 0;
            if (!hasPath) {
              import('sonner').then(({ toast }) => toast.error("Please add at least one frame to the presentation path first."));
              return;
            }
            startPresentation();
          }}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 group"
        >
          <Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" />
          PRESENTATION MODE
        </button>
      </div>
    </div>
  );
}
