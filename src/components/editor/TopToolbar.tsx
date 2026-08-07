import React from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { 
  Play, 
  Share2, 
  Download, 
  Settings, 
  History, 
  Save,
  ChevronDown
} from 'lucide-react';

export default function TopToolbar() {
  const { 
    startPresentation, 
    save, 
    lastSaved, 
    setActiveOverlay,
    objects
  } = useCanvasStore();

  const frameCount = objects.filter(o => o.type === 'frame').length;

  return (
    <div className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-4 shrink-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2 py-1 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <span className="font-bold text-lg">Z</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-neutral-900 leading-none">ZoomCanvas AI</h1>
            <span className="text-[10px] text-neutral-500 font-medium">Untitled Project</span>
          </div>
          <ChevronDown size={14} className="text-neutral-400 ml-1" />
        </div>

        <div className="w-px h-6 bg-neutral-200 mx-2" />

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveOverlay('settings')}
            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
            title="Project Settings"
          >
            <Settings size={18} />
          </button>
          <button 
            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
            title="Version History"
          >
            <History size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 mr-2">
          <span className="text-[10px] font-medium text-neutral-400">
            {lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not saved'}
          </span>
          <button 
            onClick={save}
            className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-400 transition-colors"
            title="Save Project (Ctrl+S)"
          >
            <Save size={14} />
          </button>
        </div>

        <button 
          onClick={() => startPresentation()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold text-sm active:scale-95"
          title="Start Presentation (F5)"
        >
          <Play size={16} fill="currentColor" />
          Present
        </button>

        <div className="w-px h-6 bg-neutral-200 mx-1" />

        <button 
          onClick={() => setActiveOverlay('export')}
          className="flex items-center gap-2 border border-neutral-200 px-3 py-2 rounded-xl hover:bg-neutral-50 transition-colors font-bold text-sm"
        >
          <Download size={16} />
          Export
        </button>

        <button className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors font-bold text-sm">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
