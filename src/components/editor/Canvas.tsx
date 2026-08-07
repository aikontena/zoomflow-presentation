import { useCallback, useEffect } from "react";
import { Tldraw, Editor } from "tldraw";
import { useEditor } from "@/lib/editor-store";
import { PathEditor } from "./PathEditor";


export function Canvas() {
  const { 
    editor,
    setEditor, 
    showGrid, 
    activePageId, 
    pages, 
    background, 
    customBackgroundColor 
  } = useEditor();

  useEffect(() => {
    if (!editor) return;
    editor.updateInstanceState({ isGridMode: showGrid });
  }, [editor, showGrid]);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    editor.updateInstanceState({ isGridMode: showGrid });
    
    // Focus on initial page if exists
    const activePage = pages.find(p => p.id === activePageId);
    if (activePage) {
      editor.zoomToFit();
    }
  }, [setEditor, showGrid, pages, activePageId]);

  const bgStyle = background === "custom" 
    ? { backgroundColor: customBackgroundColor }
    : background === "white"
    ? { backgroundColor: "var(--canvas-light)" }
    : background === "plain"
    ? { backgroundColor: "var(--canvas)" }
    : {};

  const backgroundClass =
    background === "dark-grid"
      ? "canvas-grid canvas-grid-dark"
      : background === "light-grid"
        ? "canvas-grid canvas-grid-light"
        : background === "dot-grid"
          ? "canvas-dots"
          : "";

  return (
    <div className={`relative h-full w-full overflow-hidden ${backgroundClass}`} style={bgStyle}>
      <Tldraw 
        persistenceKey="zoomcanvas-editor-v2"
        onMount={handleMount}
        autoFocus
      />
      
      <PathEditor />
      
      {/* Overlay frames for pages/sections */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`absolute rounded-2xl border-2 border-dashed transition-colors ${
              page.id === activePageId ? "border-primary/60 bg-primary/5" : "border-muted/20"
            }`}
            style={{
              left: page.frame.x,
              top: page.frame.y,
              width: page.frame.width,
              height: page.frame.height,
            }}
          >
            <div className="absolute -top-6 left-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              {page.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
