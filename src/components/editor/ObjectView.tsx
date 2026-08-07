import * as Icons from "lucide-react";
import type { CanvasObject } from "@/lib/editor-store";

const animClass: Record<string, string> = {
  none: "",
  fade: "anim-fade-up",
  pop: "anim-pop",
  slide: "anim-slide-left",
};

export function ObjectView({ obj, animate }: { obj: CanvasObject; animate?: boolean }) {
  const anim = animate ? (animClass[obj.animation] ?? "") : "";
  const boxStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background: obj.fill,
    borderRadius: obj.radius,
    border: obj.strokeWidth ? `${obj.strokeWidth}px solid ${obj.stroke}` : undefined,
    boxShadow: obj.shadow ? `0 ${obj.shadow}px ${obj.shadow * 2.4}px oklch(0 0 0 / 0.45)` : undefined,
    color: obj.color,
  };

  const label = (
    <span
      className="pointer-events-none block w-full px-4"
      style={{
        fontSize: obj.fontSize,
        fontWeight: obj.fontWeight,
        color: obj.color,
        textAlign: obj.align,
        lineHeight: 1.25,
      }}
    >
      {obj.text}
    </span>
  );

  switch (obj.type) {
    case "heading":
    case "text":
      return (
        <div className={`flex h-full w-full items-center ${anim}`} style={{ textAlign: obj.align }}>
          {label}
        </div>
      );

    case "arrow":
      return (
        <svg className={`h-full w-full ${anim}`} viewBox="0 0 100 20" preserveAspectRatio="none">
          <line x1="2" y1="10" x2="88" y2="10" stroke={obj.stroke} strokeWidth={obj.strokeWidth || 2} vectorEffect="non-scaling-stroke" />
          <polygon points="88,3 99,10 88,17" fill={obj.stroke} />
        </svg>
      );

    case "sticky":
      return (
        <div className={`flex h-full w-full items-start p-4 ${anim}`} style={boxStyle}>
          {label}
        </div>
      );

    case "code":
      return (
        <div className={`h-full w-full overflow-hidden p-4 font-mono ${anim}`} style={boxStyle}>
          <pre className="whitespace-pre-wrap" style={{ fontSize: obj.fontSize, color: obj.color }}>
            {obj.text}
          </pre>
        </div>
      );

    case "icon": {
      const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[obj.icon ?? "Sparkles"] ?? Icons.Sparkles;
      return (
        <div className={`flex h-full w-full items-center justify-center ${anim}`}>
          <Cmp size={Math.min(obj.width, obj.height) * 0.8} color={obj.color} />
        </div>
      );
    }

    case "image":
      return (
        <div className={`flex h-full w-full items-center justify-center overflow-hidden ${anim}`} style={boxStyle}>
          {obj.src ? (
            <img src={obj.src} alt={obj.text || "Canvas image"} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Icons.Image size={28} />
              <span className="text-xs">{obj.text || "Image"}</span>
            </div>
          )}
        </div>
      );

    case "video":
      return (
        <div className={`flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground ${anim}`} style={boxStyle}>
          <Icons.PlayCircle size={30} />
          <span className="text-xs">{obj.text || "Video"}</span>
        </div>
      );

    case "pdf":
      return (
        <div className={`flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground ${anim}`} style={boxStyle}>
          <Icons.FileText size={30} />
          <span className="text-xs">{obj.text || "Document"}</span>
        </div>
      );

    case "table":
      return (
        <div className={`h-full w-full overflow-hidden p-3 ${anim}`} style={boxStyle}>
          <div className="grid h-full grid-cols-3 gap-px overflow-hidden rounded-md bg-border">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex items-center bg-card px-2 text-[11px] text-muted-foreground">
                {i < 3 ? `Col ${i + 1}` : "—"}
              </div>
            ))}
          </div>
        </div>
      );

    case "chart":
      return (
        <div className={`flex h-full w-full items-end gap-2 p-4 ${anim}`} style={boxStyle}>
          {[0.4, 0.75, 0.55, 0.95, 0.65].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${h * 100}%`, background: `var(--chart-${(i % 5) + 1})`, opacity: 0.9 }}
            />
          ))}
        </div>
      );

    default:
      return <div className={`h-full w-full ${anim}`} style={boxStyle} />;
  }
}
