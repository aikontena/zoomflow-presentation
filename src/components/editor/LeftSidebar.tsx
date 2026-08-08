import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Image, 
  LayoutTemplate, 
  Upload, 
  Sparkles, 
  Box,
  ChevronLeft,
  Undo2,
  Redo2,
  Settings,
  Clock,
  History,
  Plus
} from 'lucide-react';
import { IconLibrary } from './IconLibrary';
import { AIPanel } from './AIPanel';
import { FramePreview } from './FramePreview';
import { useCanvasStore } from '@/lib/canvas-store';
import { TEMPLATES } from '@/lib/templates';
import { toast } from 'sonner';


const TABS = [
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'assets', label: 'Assets', icon: Image },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'uploads', label: 'Uploads', icon: Upload },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'icons', label: 'Icons', icon: Box },
  { id: 'history', label: 'History', icon: History },
];

export default function LeftSidebar() {
  const { 
    undo, 
    redo, 
    history, 
    lastSaved, 
    save, 
    setActiveOverlay,
    presentationPath,
    objects,
    selection,
    setSelection,
    addObject,
    loadTemplate
  } = useCanvasStore();


  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  return (
    <div className="flex h-full bg-white border-r border-neutral-200">
      {/* Icon Bar */}
      <div className="w-16 flex flex-col items-center py-4 gap-4 border-r border-neutral-100 bg-neutral-50/50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
            className={`p-3 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-primary shadow-sm border border-neutral-200' 
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title={tab.label}
          >
            <tab.icon size={20} />
          </button>
        ))}
        <div className="mt-auto flex flex-col items-center gap-4 mb-4">
          <button 
            onClick={() => undo()}
            className="p-3 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={20} />
          </button>
          <button 
            onClick={() => redo()}
            className="p-3 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={20} />
          </button>
          <button 
            onClick={() => setActiveOverlay('settings')}
            className="p-3 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Expanded Panel */}
      {activeTab && (
        <div className="w-[320px] flex flex-col animate-in slide-in-from-left duration-200 bg-white shadow-xl z-10 border-r border-neutral-100">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900 capitalize">{activeTab}</h2>
            <button 
              onClick={() => setActiveTab(null)}
              className="p-1 hover:bg-neutral-100 rounded-md text-neutral-400"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
          <div className="flex-1 p-4 text-sm text-neutral-500 overflow-y-auto">
            {activeTab === 'pages' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  {presentationPath.length > 0 ? (
                    presentationPath.map((frameId, index) => {
                      const frame = objects.find(o => o.id === frameId);
                      if (!frame) return null;
                      return (
                        <div key={frameId} className="group relative flex flex-col gap-2">
                          <div 
                            onClick={() => {
                              setSelection([frameId]);
                              // Pan viewport to the frame
                              const currentZoom = useCanvasStore.getState().viewport.zoom;
                              const rect = document.getElementById('canvas-container')?.getBoundingClientRect();
                              if (rect && frame) {
                                setViewport({
                                  x: (rect.width / 2) - (frame.x + frame.width / 2) * currentZoom,
                                  y: (rect.height / 2) - (frame.y + frame.height / 2) * currentZoom,
                                  zoom: currentZoom
                                });
                              }
                            }}
                            className={`aspect-video rounded-lg border-2 overflow-hidden relative transition-all cursor-pointer shadow-sm ${
                              selection.includes(frameId) ? 'border-primary ring-2 ring-primary/20' : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <FramePreview frame={frame} allObjects={objects} />
                            <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm p-2 text-[10px] font-medium border-t border-neutral-100 flex justify-between items-center">
                              <span className="truncate max-w-[180px]">{frame.text || `Frame ${index + 1}`}</span>
                              <span className="text-neutral-400 font-mono">#{index + 1}</span>
                            </div>
                          </div>
                          {index < presentationPath.length - 1 && (
                            <div className="flex justify-center text-neutral-200">
                              <div className="w-px h-4 bg-neutral-200" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-neutral-100 rounded-xl">
                      <p className="text-xs text-neutral-400">Add frames to your canvas to create a presentation path.</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    addObject({
                      type: 'frame',
                      x: 100,
                      y: 100,
                      width: 800,
                      height: 450,
                      rotation: 0,
                      fill: '#ffffff',
                      text: `New Frame`
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-neutral-400 font-medium"
                >
                  + Add New Frame
                </button>
              </div>
            )}
            {activeTab === 'layers' && (
              <div className="space-y-2">
                {objects.map(obj => (
                  <div 
                    key={obj.id} 
                    onClick={() => setSelection([obj.id])}
                    className={`p-2 rounded border text-xs cursor-pointer flex justify-between ${selection.includes(obj.id) ? 'bg-primary/5 border-primary/20 text-primary' : 'hover:bg-neutral-50 border-transparent'}`}
                  >
                    <span className="capitalize">{obj.type}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{obj.id.slice(0, 8)}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'assets' && <p>Browse your media assets here.</p>}
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-400">Choose a professional template to start your presentation.</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.slice(0, 4).map((t, i) => (
                    <div 
                      key={t.id} 
                      onClick={() => {
                        loadTemplate(JSON.parse(JSON.stringify(t.objects)));
                        toast.success(`Loaded ${t.name}`);
                      }}
                      className="aspect-video bg-neutral-100 rounded-md border border-neutral-200 hover:border-primary cursor-pointer transition-colors overflow-hidden group relative"
                    >
                      <img src={t.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Plus size={20} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setActiveOverlay('templates')}
                  className="w-full py-2 bg-primary text-white rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <LayoutTemplate size={16} />
                  Browse Library
                </button>
              </div>
            )}
            {activeTab === 'uploads' && (
              <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center flex flex-col items-center gap-2">
                <Upload className="text-neutral-300" size={32} />
                <p>Click or drag to upload</p>
              </div>
            )}
            {activeTab === 'ai' && <AIPanel />}
            {activeTab === 'icons' && <IconLibrary />}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-neutral-900 font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Time Travel</span>
                  </div>
                  {lastSaved && (
                    <span className="text-[10px] text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Auto Saved
                    </span>
                  )}
                </div>

                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="uppercase tracking-widest font-bold">Project Version</span>
                    <span>v1.0.4</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="uppercase tracking-widest font-bold">Recovery Status</span>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">History Stack</p>
                    <button 
                      onClick={() => save()}
                      className="text-[10px] text-primary hover:underline"
                    >
                      Restore Points
                    </button>
                  </div>
                  <div className="space-y-1">
                    {history.past.map((_, i) => (
                      <div key={`past-${i}`} className="p-2 text-xs rounded border border-transparent hover:border-neutral-200 hover:bg-neutral-50 cursor-pointer flex justify-between items-center group">
                        <span>Version {i + 1}</span>
                        <span className="text-[9px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">Restore</span>
                      </div>
                    )).reverse()}
                    <div className="p-2 text-xs rounded bg-primary/5 text-primary border border-primary/20 font-medium flex justify-between items-center">
                      <span>Current State</span>
                      <span className="text-[9px]">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
