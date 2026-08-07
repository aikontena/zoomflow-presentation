import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useCanvasStore } from "@/lib/canvas-store";
import { X, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";

const Canvas = lazy(() => import("@/components/editor/Canvas"));
const LeftSidebar = lazy(() => import("@/components/editor/LeftSidebar"));
const RightSidebar = lazy(() => import("@/components/editor/RightSidebar"));
const TemplateLibrary = lazy(() => import("@/components/editor/templates/TemplateLibrary"));

export default function EditorPage() {
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
        <Suspense fallback={<div className="w-16 h-full bg-neutral-50 border-r border-neutral-200" />}>
          <LeftSidebar />
        </Suspense>
        
        <div className="flex-1 relative flex overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-neutral-400">Loading Canvas...</div>}>
              <Canvas />
            </Suspense>
          </div>
          
          <Suspense fallback={<div className="w-64 h-full bg-white border-l border-neutral-200" />}>
            <RightSidebar />
          </Suspense>
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveOverlay(null)}
              className="rounded-full hover:bg-neutral-100"
            >
              <X size={20} />
            </Button>
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
