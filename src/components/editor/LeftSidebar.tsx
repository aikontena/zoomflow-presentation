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
  ChevronRight,
  Settings,
  Undo2,
  Redo2,
  History,
  Clock
} from 'lucide-react';

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

import { useCanvasStore } from '@/lib/canvas-store';

export default function LeftSidebar() {
  const { undo, redo, history, lastSaved, save, setActiveOverlay } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          <button className="p-3 text-neutral-500 hover:text-neutral-900 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Expanded Panel */}
      {activeTab && !isCollapsed && (
        <div className="w-64 flex flex-col animate-in slide-in-from-left duration-200">
          <div className="p-4 border-bottom border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900 capitalize">{activeTab}</h2>
            <button 
              onClick={() => setActiveTab(null)}
              className="p-1 hover:bg-neutral-100 rounded-md text-neutral-400"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
          <div className="flex-1 p-4 text-sm text-neutral-500">
            {activeTab === 'pages' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <React.Fragment key={i}>
                      <div className="group relative flex flex-col gap-2">
                        <div className="aspect-video bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden relative group-hover:border-primary transition-colors cursor-pointer shadow-sm">
                          <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                            <span className="text-2xl font-thin">□</span>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm p-2 text-[10px] font-medium border-t border-neutral-100 flex justify-between items-center">
                            <span>Frame {i}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                          </div>
                        </div>
                        {i < 4 && (
                          <div className="flex justify-center text-neutral-200">
                            <div className="w-px h-4 bg-neutral-200" />
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <button className="w-full py-2 border-2 border-dashed border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-neutral-400 font-medium">
                  + Add New Frame
                </button>
              </div>
            )}
            {activeTab === 'layers' && <p>No layers yet. Create some objects!</p>}
            {activeTab === 'assets' && <p>Browse your media assets here.</p>}
            {activeTab === 'templates' && (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-video bg-neutral-100 rounded-md border border-neutral-200 hover:border-primary cursor-pointer transition-colors" />
                ))}
              </div>
            )}
            {activeTab === 'uploads' && (
              <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center flex flex-col items-center gap-2">
                <Upload className="text-neutral-300" size={32} />
                <p>Click or drag to upload</p>
              </div>
            )}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <textarea 
                  className="w-full p-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary outline-none text-neutral-900"
                  placeholder="Describe what you want to generate..."
                  rows={4}
                />
                <button className="w-full bg-primary text-white py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all">
                  Generate
                </button>
              </div>
            )}
            {activeTab === 'icons' && <p>Search thousands of icons.</p>}
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
