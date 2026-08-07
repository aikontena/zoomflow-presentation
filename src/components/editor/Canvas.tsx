import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { useEditor } from "@/lib/editor-store";
import { useEffect, useCallback } from "react";

export default function Canvas() {
  const { setEditor, background, showGrid } = useEditor();

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    
    // Configure initial editor state
    editor.updateInstanceState({
      isGridMode: showGrid,
    });

    // Handle theme/background
    const container = editor.getContainer();
    if (container) {
      container.style.backgroundColor = background === 'white' ? '#ffffff' : 
                                       background === 'plain' ? '#f8f9fa' :
                                       '#121212';
    }
  }, [setEditor, showGrid, background]);

  return (
    <div className="h-full w-full tl-container overflow-hidden bg-canvas">
      <Tldraw 
        persistenceKey="zoomcanvas-persistence-v3"
        autoFocus
        onMount={handleMount}
      />
    </div>
  );
}
