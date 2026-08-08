import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useCanvasStore } from "@/lib/canvas-store";
import { X, LayoutTemplate } from "lucide-react";

import Canvas from "./Canvas";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import TopToolbar from "./TopToolbar";
import MenuBar from "./MenuBar";
import PresentationMode from "./PresentationMode";

const TemplateLibrary = lazy(() => import("./templates/TemplateLibrary"));

export default function EditorLayout() {
  const { activeOverlay, setActiveOverlay, isPresenting, isRightSidebarVisible } = useCanvasStore();

  useEffect(() => {
    (window as any).useCanvasStore = useCanvasStore;
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden bg-white flex flex-col relative">
      {!isPresenting && (
        <>
          <MenuBar />
          <TopToolbar />
        </>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {!isPresenting && <LeftSidebar />}
        
        <div className="flex-1 relative flex overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <Canvas />
          </div>
          {!isPresenting && isRightSidebarVisible && <RightSidebar />}
        </div>
      </div>

      <PresentationMode />


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
