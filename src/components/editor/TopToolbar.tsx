import { useEffect, useState } from "react";
import {
  Save,
  Undo2,
  Redo2,
  Play,
  Download,
  Share2,
  History,
  Settings,
  Grid3x3,
  Magnet,
  MousePointer2,
  Type,
  Square,
  Circle,
  ArrowRight,
  StickyNote,
  Code2,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { useEditor, type ObjectType } from "@/lib/editor-store";

const TOOLS: { id: ObjectType | "select"; icon: typeof MousePointer2; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "heading", icon: Type, label: "Heading" },
  { id: "rect", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "arrow", icon: ArrowRight, label: "Arrow" },
  { id: "sticky", icon: StickyNote, label: "Sticky" },
  { id: "code", icon: Code2, label: "Code" },
  { id: "image", icon: ImageIcon, label: "Image" },
];

export function TopToolbar({ onPresent }: { onPresent: () => void }) {
  const {
    doc,
    setTitle,
    undo,
    redo,
    past,
    future,
    tool,
    setTool,
    showGrid,
    toggleGrid,
    snapToGrid,
    toggleSnap,
    markSaved,
    lastSavedAt,
    dirty,
    setViewport,
    viewport,
  } = useEditor();
  const [savedLabel, setSavedLabel] = useState("Not saved yet");

  // Auto save every 10 seconds when there are unsaved changes.
  useEffect(() => {
    const t = setInterval(() => {
      if (useEditor.getState().dirty) {
        useEditor.getState().markSaved();
      }
    }, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setSavedLabel(
      dirty ? "Unsaved changes" : lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : "All changes saved",
    );
  }, [dirty, lastSavedAt]);

  const zoomBy = (k: number) =>
    setViewport({ ...viewport, zoom: Math.min(5, Math.max(0.1, viewport.zoom * k)) });

  const iconBtn = "flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-35";

  return (
    <header className="glass z-20 flex h-16 shrink-0 items-center gap-2 border-b px-3">
      <div className="flex items-center gap-2 pr-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <ZoomIn size={18} />
        </div>
        <div className="hidden sm:block">
          <input
            value={doc.title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-44 bg-transparent text-sm font-semibold outline-none"
          />
          <p className="text-[10px] text-muted-foreground">{savedLabel}</p>
        </div>
      </div>

      <div className="mx-1 flex items-center gap-0.5 rounded-2xl border border-border bg-background/40 p-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setTool(t.id)}
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              tool === t.id ? "bg-primary/25 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <t.icon size={16} />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-0.5">
        <button className={iconBtn} title="Undo" onClick={undo} disabled={!past.length}>
          <Undo2 size={16} />
        </button>
        <button className={iconBtn} title="Redo" onClick={redo} disabled={!future.length}>
          <Redo2 size={16} />
        </button>
        <button className={`${iconBtn} ${showGrid ? "text-accent" : ""}`} title="Grid" onClick={toggleGrid}>
          <Grid3x3 size={16} />
        </button>
        <button className={`${iconBtn} ${snapToGrid ? "text-accent" : ""}`} title="Snap to grid" onClick={toggleSnap}>
          <Magnet size={16} />
        </button>
        <button className={iconBtn} title="Zoom out" onClick={() => zoomBy(1 / 1.2)}>
          <ZoomOut size={16} />
        </button>
        <button className={iconBtn} title="Zoom in" onClick={() => zoomBy(1.2)}>
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <button className={iconBtn} title="Version history" onClick={() => toast("Version history lands with the backend phase.")}>
          <History size={16} />
        </button>
        <button className={iconBtn} title="Settings" onClick={() => toast("Editor settings coming soon.")}>
          <Settings size={16} />
        </button>
        <button
          className={iconBtn}
          title="Export"
          onClick={() => {
            const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${doc.title.replace(/\s+/g, "-").toLowerCase()}.json`;
            a.click();
            toast.success("Exported canvas as JSON");
          }}
        >
          <Download size={16} />
        </button>
        <button
          className={iconBtn}
          title="Share"
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href);
            toast.success("Link copied to clipboard");
          }}
        >
          <Share2 size={16} />
        </button>
        <button
          className={iconBtn}
          title="Save"
          onClick={() => {
            markSaved();
            toast.success("Saved locally");
          }}
        >
          <Save size={16} />
        </button>
        <button
          onClick={onPresent}
          className="ml-1 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
        >
          <Play size={15} /> Present
        </button>
      </div>
    </header>
  );
}
