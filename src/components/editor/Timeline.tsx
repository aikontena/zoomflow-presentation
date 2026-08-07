import { useEditor, CameraKeyframe, AnimationPreset, TransitionEffect } from "@/lib/editor-store";
import { ChevronUp, ChevronDown, Play, Plus, Trash2, GripVertical, Clock, Settings2 } from "lucide-react";
import { useState, useMemo } from "react";

export function Timeline() {
  const { 
    pages, 
    paths, 
    activePathId, 
    setActivePath, 
    addPath, 
    removePath, 
    addKeyframe, 
    removeKeyframe,
    reorderKeyframe,
    goToFrame
  } = useEditor();

  const [isOpen, setIsOpen] = useState(false);

  const activePath = useMemo(() => 
    paths.find(p => p.id === activePathId),
    [paths, activePathId]
  );

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="glass absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium hover:bg-secondary/80 transition-all z-20"
      >
        <Clock size={14} className="text-primary" />
        Presentation Timeline
        <ChevronUp size={14} />
      </button>
    );
  }

  return (
    <div className="glass-strong absolute bottom-0 left-0 right-0 h-64 border-t border-border flex flex-col z-30 animate-zc-slide-up">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-sidebar/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Timeline</span>
          </div>
          
          <select 
            value={activePathId || ""} 
            onChange={(e) => setActivePath(e.target.value || null)}
            className="bg-background/50 border border-border rounded-lg px-2 py-1 text-[11px] outline-none"
          >
            <option value="">Select a path...</option>
            {paths.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          
          <button 
            onClick={() => addPath("New Presentation")}
            className="p-1 hover:bg-secondary rounded"
            title="Add Path"
          >
            <Plus size={14} />
          </button>
        </div>

        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary rounded">
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-x-auto flex items-center gap-4 p-4 scrollbar-hide">
        {activePath ? (
          <>
            {activePath.keyframes.map((kf, i) => {
              const page = pages.find(p => p.id === kf.frameId);
              return (
                <div 
                  key={kf.id}
                  className="group relative h-40 w-48 shrink-0 rounded-xl border border-border bg-background/30 overflow-hidden flex flex-col hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => goToFrame(kf.frameId)}
                >
                  <div className="absolute top-2 left-2 z-10 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {i + 1}
                  </div>
                  
                  <div className="flex-1 bg-muted/20 flex items-center justify-center p-4">
                    <span className="text-[10px] font-medium text-center line-clamp-2">{page?.name || "Missing Frame"}</span>
                  </div>

                  <div className="p-2 border-t border-border bg-sidebar/50 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground uppercase font-semibold">Transition</span>
                      <Settings2 size={10} className="text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span>{kf.transitionDuration}ms</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeKeyframe(activePath.id, kf.id);
                        }}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <button 
              onClick={() => {
                const lastFrameId = pages[pages.length - 1]?.id;
                if (lastFrameId) addKeyframe(activePath.id, lastFrameId);
              }}
              className="h-40 w-12 shrink-0 rounded-xl border border-dashed border-border flex items-center justify-center hover:bg-secondary/50 transition-colors"
            >
              <Plus size={18} className="text-muted-foreground" />
            </button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-2">
            <p className="text-sm italic">No presentation path selected</p>
            <button 
              onClick={() => addPath("Main Presentation")}
              className="text-xs text-primary underline"
            >
              Create your first path
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
