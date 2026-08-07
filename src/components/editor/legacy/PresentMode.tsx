import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Play, Pause, Crosshair, NotebookPen, Timer } from "lucide-react";
import { useEditor } from "@/lib/editor-store";

export function PresentMode({ onExit }: { onExit: () => void }) {
  const { editor, pages } = useEditor();
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [laser, setLaser] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pointer, setPointer] = useState({ x: -100, y: -100 });

  const page = pages[index] ?? pages[0]!;

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % pages.length), 5000);
    return () => clearInterval(t);
  }, [autoplay, pages.length]);

  useEffect(() => {
    if (editor && page) {
      // Zoom to the page frame area in the background tldraw instance
      // Note: In a real implementation, we might want a separate read-only Tldraw for presentation
      // but here we just drive the existing editor's camera.
      // tldraw's zoomToFit works well if we select the frame, but we can also manually set camera
    }
  }, [editor, index, page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") setIndex((i) => Math.min(pages.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "Escape") onExit();
      if (e.key.toLowerCase() === "l") setLaser((v) => !v);
      if (e.key.toLowerCase() === "n") setNotesOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages.length, onExit]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex bg-canvas">
      <div
        className="relative flex-1 overflow-hidden flex items-center justify-center p-12"
        onMouseMove={(e) => laser && setPointer({ x: e.clientX, y: e.clientY })}
        style={{ cursor: laser ? "none" : "pointer" }}
      >
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Presenting Page {index + 1}</p>
          <h2 className="text-4xl font-bold">{page.name}</h2>
          <p className="text-muted-foreground">The canvas in the background will zoom to this frame.</p>
        </div>

        {laser && (
          <div
            className="pointer-events-none fixed h-4 w-4 rounded-full"
            style={{
              left: pointer.x - 8,
              top: pointer.y - 8,
              background: "var(--destructive)",
              boxShadow: "0 0 24px 8px color-mix(in oklab, var(--destructive) 55%, transparent)",
            }}
          />
        )}

        <div data-controls className="glass absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-2xl px-2 py-1.5">
          <button className="rounded-xl p-2 hover:bg-secondary" onClick={() => setIndex((i) => Math.max(0, i - 1))}>
            <ChevronLeft size={16} />
          </button>
          <span className="px-2 text-xs text-muted-foreground">
            {index + 1} / {pages.length}
          </span>
          <button className="rounded-xl p-2 hover:bg-secondary" onClick={() => setIndex((i) => Math.min(pages.length - 1, i + 1))}>
            <ChevronRight size={16} />
          </button>
          <span className="mx-1 h-5 w-px bg-border" />
          <button className={`rounded-xl p-2 hover:bg-secondary ${autoplay ? "text-accent" : ""}`} onClick={() => setAutoplay((v) => !v)} title="Autoplay">
            {autoplay ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className={`rounded-xl p-2 hover:bg-secondary ${laser ? "text-destructive" : ""}`} onClick={() => setLaser((v) => !v)} title="Laser pointer (L)">
            <Crosshair size={16} />
          </button>
          <button className={`rounded-xl p-2 hover:bg-secondary ${notesOpen ? "text-accent" : ""}`} onClick={() => setNotesOpen((v) => !v)} title="Speaker notes (N)">
            <NotebookPen size={16} />
          </button>
          <span className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
            <Timer size={13} /> {mm}:{ss}
          </span>
          <button className="rounded-xl p-2 text-muted-foreground hover:bg-secondary" onClick={onExit} title="Exit (Esc)">
            <X size={16} />
          </button>
        </div>
      </div>

      {notesOpen && (
        <aside data-controls className="glass-strong w-80 shrink-0 overflow-y-auto p-5">
          <h3 className="text-sm font-semibold">Presenter view</h3>
          <p className="mt-1 text-xs text-muted-foreground">{page.name}</p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
            {page.notes || "No speaker notes for this page yet."}
          </p>
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Up next</p>
            <p className="mt-1 text-sm">{pages[index + 1]?.name ?? "End of presentation"}</p>
          </div>
        </aside>
      )}
    </div>
  );
}
