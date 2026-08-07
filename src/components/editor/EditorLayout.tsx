import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useCanvasStore } from "@/lib/canvas-store";
import { X, LayoutTemplate } from "lucide-react";

// Using relative imports directly
import Canvas from "./Canvas";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

// Move the lazy import inside the component or use standard if small
const TemplateLibrary = lazy(() => import("./templates/TemplateLibrary"));

export default function EditorLayout() {
  const { activeOverlay, setActiveOverlay } = useCanvasStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 font-medium">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        
        <div className="flex-1 relative flex overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <Canvas />
          </div>
          <RightSidebar />
        </div>
      </div>

      {activeOverlay === 'templates' && (
        <div className="fixed inset-0 z-50 bg-white animate-in fade-in zoom-in duration-200 flex flex-col">
          <div className="h-16 border-b border-neutral-200 flex items-center justify-between px-6 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <LayoutTemplate size={18} />
              </div>
              <h1 className="text-xl font-bold text-neutral-900">Template Library</h1>
            </div>
            <button 
              onClick={() => setActiveOverlay(null)}
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading Library...</div>}>
              <TemplateLibrary />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
