import React, { useMemo, useRef } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { applyCamera, getCamera } from '@/lib/camera-utils';
import { Map as MapIcon } from 'lucide-react';

interface Props {
  dark?: boolean;
  onJumpToFrame?: (frameId: string) => void;
}

const MAP_W = 200;
const MAP_H = 130;
const PAD = 10;

export default function PresentationMiniMap({ dark, onJumpToFrame }: Props) {
  const objects = useCanvasStore(s => s.objects);
  const viewport = useCanvasStore(s => s.viewport);
  const presentationPath = useCanvasStore(s => s.presentationPath);
  const currentFrameIndex = useCanvasStore(s => s.currentFrameIndex);
  const mapRef = useRef<HTMLDivElement>(null);

  const bounds = useMemo(() => {
    if (!objects.length) return { minX: -500, minY: -500, maxX: 500, maxY: 500 };
    return {
      minX: Math.min(...objects.map(o => o.x)) - 200,
      minY: Math.min(...objects.map(o => o.y)) - 200,
      maxX: Math.max(...objects.map(o => o.x + (o.width || 0))) + 200,
      maxY: Math.max(...objects.map(o => o.y + (o.height || 0))) + 200,
    };
  }, [objects]);

  const worldW = bounds.maxX - bounds.minX;
  const worldH = bounds.maxY - bounds.minY;
  const scale = Math.min((MAP_W - PAD * 2) / worldW, (MAP_H - PAD * 2) / worldH);
  const offX = PAD + ((MAP_W - PAD * 2) - worldW * scale) / 2;
  const offY = PAD + ((MAP_H - PAD * 2) - worldH * scale) / 2;

  const toMap = (x: number, y: number) => ({
    x: (x - bounds.minX) * scale + offX,
    y: (y - bounds.minY) * scale + offY,
  });

  const frames = objects.filter(o => o.type === 'frame');
  const pathPoints = presentationPath
    .map(id => objects.find(o => o.id === id))
    .filter(Boolean)
    .map(f => toMap(f!.x + f!.width / 2, f!.y + f!.height / 2));

  const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const zoom = viewport.zoom || 1;
  const camTL = toMap(-viewport.x / zoom, -viewport.y / zoom);
  const camSize = { w: (winW / zoom) * scale, h: (winH / zoom) * scale };

  const handleClick = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const worldX = (mx - offX) / scale + bounds.minX;
    const worldY = (my - offY) / scale + bounds.minY;

    // If the click lands on a frame, focus that frame instead of a raw pan.
    const hit = frames.find(
      f => worldX >= f.x && worldX <= f.x + f.width && worldY >= f.y && worldY <= f.y + f.height
    );
    if (hit && onJumpToFrame) {
      onJumpToFrame(hit.id);
      return;
    }

    const cam = getCamera();
    applyCamera({ ...cam, x: winW / 2 - worldX * cam.zoom, y: winH / 2 - worldY * cam.zoom });
  };

  const shell = dark
    ? 'bg-neutral-900/90 border-white/10 text-white'
    : 'bg-white/90 border-black/5 text-neutral-900';

  return (
    <div className={`rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden ${shell}`}>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60">
        <MapIcon size={11} /> Canvas Map
      </div>
      <div
        ref={mapRef}
        onClick={handleClick}
        className={`relative cursor-crosshair ${dark ? 'bg-white/5' : 'bg-black/[0.03]'}`}
        style={{ width: MAP_W, height: MAP_H }}
      >
        {objects.map(obj => {
          const p = toMap(obj.x, obj.y);
          const isFrame = obj.type === 'frame';
          return (
            <div
              key={obj.id}
              className={`absolute rounded-[2px] ${isFrame ? 'border border-current opacity-40' : 'opacity-25'} ${dark ? 'bg-white/40' : 'bg-neutral-500/50'}`}
              style={{
                left: p.x,
                top: p.y,
                width: Math.max(2, (obj.width || 0) * scale),
                height: Math.max(2, (obj.height || 0) * scale),
              }}
            />
          );
        })}

        {/* Presentation path */}
        {pathPoints.length > 1 && (
          <svg className="absolute inset-0 pointer-events-none" width={MAP_W} height={MAP_H}>
            <polyline
              points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={1.2}
              strokeDasharray="3 3"
              opacity={0.8}
            />
          </svg>
        )}

        {pathPoints.map((p, i) => (
          <div
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full text-[7px] font-bold flex items-center justify-center ${
              i === currentFrameIndex ? 'bg-primary text-primary-foreground w-3.5 h-3.5' : 'bg-primary/40 text-white w-3 h-3'
            }`}
            style={{ left: p.x, top: p.y }}
          >
            {i + 1}
          </div>
        ))}

        {/* Current camera */}
        <div
          className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
          style={{ left: camTL.x, top: camTL.y, width: camSize.w, height: camSize.h }}
        />
      </div>
    </div>
  );
}
