import { useEditor } from "@/lib/editor-store";

export function RightSidebar() {
  const { editor, background, setBackground, customBackgroundColor, setCustomBackgroundColor } = useEditor();
  
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
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
              <span className="text-xl text-muted-foreground/30">?</span>
            </div>
            <p className="text-xs text-muted-foreground">Select an object to inspect properties</p>
          </div>
        ) : (
          <div className="space-y-4">
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Object Inspector</h3>
             <p className="text-[11px] text-muted-foreground">Tldraw handles properties via context menu and floating bars. Custom inspector properties coming soon.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
