import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { MousePointer2, Layers, Zap, ZapOff } from 'lucide-react';

export default function StatusBar() {
  const { viewport, selection, snapEnabled, setSnapEnabled } = useCanvasStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Convert screen mouse pos to canvas coords
  const canvasX = Math.round((mousePos.x - viewport.x) / viewport.zoom);
  const canvasY = Math.round((mousePos.y - viewport.y) / viewport.zoom);

  return (
    <div className="flex items-center gap-4 text-[10px] text-neutral-500 font-medium h-full">
      <div className="flex items-center gap-1.5">
        <MousePointer2 size={12} className="text-neutral-400" />
        <span className="tabular-nums">X: {canvasX} Y: {canvasY}</span>
      </div>
      
      <div className="w-px h-3 bg-neutral-200" />

      <div className="flex items-center gap-1.5">
        <Layers size={12} className="text-neutral-400" />
        <span>{selection.length} selected</span>
      </div>

      <div className="w-px h-3 bg-neutral-200" />

      <button 
        onClick={() => setSnapEnabled(!snapEnabled)}
        className={`flex items-center gap-1.5 transition-colors ${snapEnabled ? 'text-primary' : 'text-neutral-400'}`}
        title="Toggle Snapping"
      >
        {snapEnabled ? <Zap size={12} /> : <ZapOff size={12} />}
        <span>{snapEnabled ? 'Snap ON' : 'Snap OFF'}</span>
      </button>

      <div className="w-px h-3 bg-neutral-200" />

      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="uppercase tracking-wider font-bold opacity-60">Ready</span>
      </div>
    </div>
  );
}
