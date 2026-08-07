import React from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { 
  Minus, 
  Plus, 
  Maximize, 
  RefreshCw,
  ChevronDown,
  Maximize2
} from 'lucide-react';
import { useViewportController } from './ViewportController';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ZOOM_LEVELS = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 8, 10];

export default function ZoomControls() {
  const { viewport } = useCanvasStore();
  const { zoomTo, fitToScreen, resetZoom } = useViewportController();

  const handleZoomIn = () => zoomTo((viewport.zoom || 1) * 1.2);
  const handleZoomOut = () => zoomTo((viewport.zoom || 1) / 1.2);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-1">
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-600"
          title="Zoom Out (Ctrl -)"
        >
          <Minus size={16} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 hover:bg-neutral-100 rounded-md transition-colors text-sm font-medium text-neutral-700 min-w-[60px] justify-center outline-none">
            {Math.round((viewport.zoom || 1) * 100)}%
            <ChevronDown size={12} className="text-neutral-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[100px]">
            {ZOOM_LEVELS.map((level) => (
              <DropdownMenuItem 
                key={level}
                onClick={() => zoomTo(level)}
                className="text-xs"
              >
                {Math.round(level * 100)}%
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-600"
          title="Zoom In (Ctrl +)"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="w-px h-5 bg-neutral-200" />

      <div className="flex items-center gap-1">
        <button
          onClick={fitToScreen}
          className="flex items-center gap-1.5 px-2 py-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-600 text-xs font-medium"
          title="Fit to Screen"
        >
          <Maximize size={14} />
          <span>Fit</span>
        </button>

        <button
          onClick={resetZoom}
          className="flex items-center gap-1.5 px-2 py-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-600 text-xs font-medium"
          title="Reset to 100% (Ctrl 0)"
        >
          <RefreshCw size={14} />
          <span>Reset</span>
        </button>

        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-2 py-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-600 text-xs font-medium"
          title="Toggle Fullscreen"
        >
          <Maximize2 size={14} />
          <span>Fullscreen</span>
        </button>
      </div>
    </div>
  );
}
