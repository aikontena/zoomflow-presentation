import { useEditor } from "@/lib/editor-store";
import { useMemo } from "react";

export function PathEditor() {
  const { pages, activePathId, paths, editor } = useEditor();

  const activePath = useMemo(() => 
    paths.find(p => p.id === activePathId),
    [paths, activePathId]
  );

  if (!activePath || activePath.keyframes.length < 2) return null;

  // We need to transform canvas coordinates to screen coordinates if we render this as an overlay
  // OR we can render it inside tldraw as shapes, but overlay is easier for temporary visual guides.
  // Actually, tldraw's coordinate system is what we use for pages.frame.
  
  return (
    <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-40">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="0"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary)" />
        </marker>
      </defs>
      {activePath.keyframes.map((kf, i) => {
        if (i === 0) return null;
        const prevKf = activePath.keyframes[i - 1];
        const fromPage = pages.find(p => p.id === prevKf.frameId);
        const toPage = pages.find(p => p.id === kf.frameId);

        if (!fromPage || !toPage) return null;

        const x1 = fromPage.frame.x + fromPage.frame.width / 2;
        const y1 = fromPage.frame.y + fromPage.frame.height / 2;
        const x2 = toPage.frame.x + toPage.frame.width / 2;
        const y2 = toPage.frame.y + toPage.frame.height / 2;

        return (
          <g key={kf.id}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="4 4"
              markerEnd="url(#arrowhead)"
            />
            <circle
              cx={x2}
              cy={y2}
              r="12"
              fill="var(--primary)"
            />
            <text
              x={x2}
              y={y2}
              dy=".3em"
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
            >
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
