import React, { useState } from 'react';
import { Layout, Plus, Search } from 'lucide-react';
import { CANVAS_LAYOUTS } from '@/lib/canvas-templates';
import { useCanvasStore } from '@/lib/canvas-store';
import { toast } from 'sonner';

export const CanvasTemplateLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { requestTemplate } = useCanvasStore();

  const filteredLayouts = CANVAS_LAYOUTS.filter(layout => 
    layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    layout.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-white -m-4">
      <div className="p-4 border-b border-neutral-100 space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2 text-neutral-900">
          <Layout className="w-4 h-4 text-primary" />
          Canvas Templates
          <span className="ml-auto text-[10px] font-normal text-neutral-400">{CANVAS_LAYOUTS.length} Layouts</span>
        </h2>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search layouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredLayouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => {
                requestTemplate(layout);
                toast.success(`Applied ${layout.name} layout`);
              }}
              className="group flex flex-col gap-2 p-2 rounded-xl border border-neutral-100 hover:border-primary hover:bg-neutral-50 transition-all text-left"
            >
              <div className="aspect-video bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                   {/* Simplified preview grid */}
                   <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-1 p-1">
                      {Array.from({length: 12}).map((_, i) => (
                        <div key={i} className="bg-primary rounded-sm" />
                      ))}
                   </div>
                </div>
                <Plus className="w-5 h-5 text-neutral-300 group-hover:text-primary transition-colors z-10" />
              </div>
              <div className="px-1">
                <div className="text-[11px] font-bold text-neutral-900 truncate">{layout.name}</div>
                <div className="text-[9px] text-neutral-400 uppercase tracking-tight">{layout.category}</div>
              </div>
            </button>
          ))}
        </div>
        
        {filteredLayouts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xs text-neutral-400">No layouts found matching your search.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
        <p className="text-[10px] text-neutral-400 text-center italic">
          Canvas templates create spatial structures including frames, connectors, and bookmarks.
        </p>
      </div>
    </div>
  );
};

export default CanvasTemplateLibrary;
