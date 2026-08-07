import { useEditor } from "@/lib/editor-store";
import { useEffect, useState } from "react";

export function MiniMap() {
  const { editor } = useEditor();
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!editor) return;
    const updateZoom = () => {
      setZoom(Math.round(editor.getZoomLevel() * 100));
    };
    editor.on("tick", updateZoom);
    return () => {
      editor.off("tick", updateZoom);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="glass overflow-hidden rounded-xl p-3 shadow-lg flex flex-col items-center gap-2 border border-border bg-sidebar/70 backdrop-blur-xl">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
        Navigation
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => editor.zoomOut()}
          className="h-6 w-6 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
        >
          -
        </button>
        <span className="text-[11px] font-medium min-w-[32px] text-center">{zoom}%</span>
        <button 
          onClick={() => editor.zoomIn()}
          className="h-6 w-6 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"
        >
          +
        </button>
      </div>
      <button 
        onClick={() => editor.zoomToFit()}
        className="text-[9px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        Zoom to Fit
      </button>
    </div>
  );
}
