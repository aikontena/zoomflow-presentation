import { useEditor } from "@/lib/editor-store";
import { Trash2, Plus } from "lucide-react";

export function RightSidebar() {
  const { 
    editor, 
    background, 
    setBackground, 
    customBackgroundColor, 
    setCustomBackgroundColor,
    bookmarks,
    addBookmark,
    removeBookmark,
    applyBookmark,
    focusMode,
    setFocusMode
  } = useEditor();

  
  const hasSelection = editor ? editor.getSelectedShapeIds().length > 0 : false;

  return (
    <aside className="h-full w-[280px] shrink-0 border-l border-border bg-sidebar/70 p-4 backdrop-blur-xl flex flex-col gap-6">
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Canvas Settings</h3>
        
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-muted-foreground">Background Style</label>
          <select 
            value={background} 
            onChange={(e) => setBackground(e.target.value as any)}
            className="w-full bg-background/50 border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 ring-primary/50"
          >
            <option value="dark-grid">Dark Grid</option>
            <option value="light-grid">Light Grid</option>
            <option value="dot-grid">Dot Grid</option>
            <option value="white">White</option>
            <option value="plain">Plain</option>
            <option value="custom">Custom Color</option>
          </select>
        </div>

        {background === "custom" && (
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground">Custom Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={customBackgroundColor} 
                onChange={(e) => setCustomBackgroundColor(e.target.value)}
                className="h-8 w-8 rounded border-0 p-0 bg-transparent cursor-pointer"
              />
              <input 
                type="text" 
                value={customBackgroundColor} 
                onChange={(e) => setCustomBackgroundColor(e.target.value)}
                className="flex-1 bg-background/50 border border-border rounded-lg px-2 text-xs outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasSelection ? (
          <div className="space-y-6">
            <div className="h-40 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-background/20 rounded-2xl border border-dashed border-border">
              <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                <span className="text-lg text-muted-foreground/30">?</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Select an object or frame to inspect properties</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Bookmarks</h3>
              <div className="space-y-2">
                {bookmarks.map(b => (
                  <div key={b.id} className="group flex items-center justify-between glass p-2 rounded-lg hover:bg-secondary/50 cursor-pointer" onClick={() => applyBookmark(b.id)}>
                    <span className="text-[11px] font-medium truncate">{b.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeBookmark(b.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const name = prompt("Bookmark Name:");
                    if (name) addBookmark(name);
                  }}
                  className="w-full flex items-center justify-center gap-2 glass p-2 rounded-lg text-[10px] hover:bg-secondary transition-all"
                >
                  <Plus size={12} /> Add Bookmark
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-zc-fade-up">
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Object Inspector</h3>
             
             <div className="space-y-4">
               {/* Metadata / Content */}
               <div className="space-y-2">
                 <label className="text-[11px] font-medium text-muted-foreground">Name / Label</label>
                 <input 
                   type="text"
                   className="w-full bg-background/50 border border-border rounded-lg px-2 py-1.5 text-xs outline-none"
                   placeholder="Object name..."
                 />
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground">Opacity</label>
                    <input type="range" className="w-full accent-primary" min="0" max="100" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground">Rotation</label>
                    <input type="number" className="w-full bg-background/50 border border-border rounded-lg px-2 py-1 text-xs" />
                 </div>
               </div>
             </div>

             <div className="pt-4 border-t border-border">
               <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Focus Settings</h3>
               <div className="flex items-center justify-between">
                 <span className="text-[11px] text-muted-foreground">Dim Surroundings</span>
                 <input 
                  type="checkbox" 
                  className="accent-primary"
                  checked={focusMode}
                  onChange={(e) => setFocusMode(e.target.checked)}
                 />
               </div>
             </div>
          </div>
        )}
      </div>
    </aside>
  );
}
