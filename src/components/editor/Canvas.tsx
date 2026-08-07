import React, { useRef, useEffect, useState } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { objects, viewport, setViewport, selection, setSelection, updateObject, deleteObjects, addObject, undo, redo } = useCanvasStore();
  
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<'select' | 'rect' | 'circle' | 'text'>('select');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const factor = Math.pow(1.1, delta / 100);
        const newZoom = Math.min(Math.max(viewport.zoom * factor, 0.05), 20);
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX - viewport.x) / viewport.zoom;
        const worldY = (mouseY - viewport.y) / viewport.zoom;
        
        setViewport({
          zoom: newZoom,
          x: mouseX - worldX * newZoom,
          y: mouseY - worldY * newZoom
        });
      } else {
        setViewport({
          ...viewport,
          x: viewport.x - e.deltaX,
          y: viewport.y - e.deltaY
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [viewport, setViewport]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;

    if (e.button === 1) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (activeTool !== 'select') {
      const type = activeTool === 'rect' ? 'rectangle' : activeTool === 'circle' ? 'circle' : 'text';
      addObject({
        type: type as any,
        x,
        y,
        width: 100,
        height: 100,
        fill: '#3b82f6',
        text: type === 'text' ? 'New Text' : undefined
      });
      setActiveTool('select');
      return;
    }

    const clickedObj = [...objects].reverse().find(obj => 
      x >= obj.x && x <= obj.x + obj.width &&
      y >= obj.y && y <= obj.y + obj.height
    );

    if (clickedObj) {
      setSelection([clickedObj.id]);
      setIsDragging(true);
      setDragStart({ x, y });
    } else {
      setSelection([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setViewport({
        ...viewport,
        x: viewport.x + dx,
        y: viewport.y + dy
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging && selection.length > 0) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
      
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      const target = objects.find(o => o.id === selection[0]);
      if (target) {
        updateObject(selection[0], {
          x: target.x + dx,
          y: target.y + dy
        });
      }
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      deleteObjects(selection);
    } else if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
      if (e.shiftKey) redo();
      else undo();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-white outline-none" 
         tabIndex={0}
         onKeyDown={handleKeyDown}>
      <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-2 rounded-xl bg-white p-1 shadow-xl border border-neutral-200">
        {(['select', 'rect', 'circle', 'text'] as const).map(t => (
          <button 
            key={t}
            onClick={() => setActiveTool(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTool === t ? 'bg-primary text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="w-px h-4 bg-neutral-200 self-center mx-1" />
        <button onClick={undo} className="px-2 py-1.5 hover:bg-neutral-100 rounded-lg text-xs">Undo</button>
        <button onClick={redo} className="px-2 py-1.5 hover:bg-neutral-100 rounded-lg text-xs">Redo</button>
      </div>

      <div 
        ref={containerRef}
        className="h-full w-full touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0'
        }}>
          {objects.map(obj => (
            <div 
              key={obj.id}
              style={{
                position: 'absolute',
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                backgroundColor: obj.type !== 'text' ? obj.fill : 'transparent',
                borderRadius: obj.type === 'circle' ? '50%' : '0',
                border: selection.includes(obj.id) ? '2px solid #3b82f6' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontSize: obj.fontSize || 16,
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
              {obj.type === 'text' && obj.text}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur rounded-lg px-2 py-1 text-[10px] text-neutral-500 border border-neutral-200">
        Zoom: {Math.round(viewport.zoom * 100)}% · X: {Math.round(viewport.x)} Y: {Math.round(viewport.y)}
      </div>
    </div>
  );
}
