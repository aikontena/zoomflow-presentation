import { useEditor } from "@/lib/editor-store";

const W = 200;
const H = 130;

export function MiniMap() {
  const { doc, viewport, setViewport } = useEditor();
  const objs = doc.objects;
  if (!objs.length) return null;

  const minX = Math.min(...objs.map((o) => o.x)) - 100;
  const minY = Math.min(...objs.map((o) => o.y)) - 100;
  const maxX = Math.max(...objs.map((o) => o.x + o.width)) + 100;
  const maxY = Math.max(...objs.map((o) => o.y + o.height)) + 100;
  const scale = Math.min(W / (maxX - minX), H / (maxY - minY));

  return (
    <div className="glass overflow-hidden rounded-xl p-2 shadow-lg" style={{ width: W + 16 }}>
      <div className="relative" style={{ width: W, height: H }}>
        {objs.map((o) => (
          <div
            key={o.id}
            className="absolute rounded-[2px] bg-primary/60"
            style={{
              left: (o.x - minX) * scale,
              top: (o.y - minY) * scale,
              width: Math.max(2, o.width * scale),
              height: Math.max(2, o.height * scale),
            }}
          />
        ))}
        {doc.pages.map((p, i) => (
          <button
            key={p.id}
            title={p.name}
            onClick={() =>
              setViewport({ x: -p.frame.x * 0.8 + 80, y: -p.frame.y * 0.8 + 60, zoom: 0.8 })
            }
            className="absolute rounded border border-accent/70 text-[8px] text-accent"
            style={{
              left: (p.frame.x - minX) * scale,
              top: (p.frame.y - minY) * scale,
              width: p.frame.width * scale,
              height: p.frame.height * scale,
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">
        {Math.round(viewport.zoom * 100)}% · minimap
      </p>
    </div>
  );
}
