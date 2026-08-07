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
  Settings
} from 'lucide-react';

const TABS = [
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'assets', label: 'Assets', icon: Image },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'uploads', label: 'Uploads', icon: Upload },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'icons', label: 'Icons', icon: Box },
];

export default function LeftSidebar() {
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
        <div className="mt-auto flex flex-col items-center gap-4">
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
              <div className="space-y-2">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-900 font-medium">Page 1</div>
                <button className="w-full py-2 border-2 border-dashed border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                  + Add Page
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
          </div>
        </div>
      )}
    </div>
  );
}
