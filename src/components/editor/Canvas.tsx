import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvasStore, CanvasObject } from '@/lib/canvas-store';
import { IconRenderer } from './IconRenderer';
import { toast } from 'sonner';
import ZoomControls from './ZoomControls';
import MiniMap from './MiniMap';
import StatusBar from './StatusBar';
import { useViewportController } from './ViewportController';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    objects, viewport, setViewport, selection, setSelection, 
    updateObject, deleteObjects, addObject, undo, redo,
    duplicateObjects
  } = useCanvasStore();
  
  const { zoomTo, resetZoom } = useViewportController();
  
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<'select' | 'rect' | 'circle' | 'text' | 'frame'>('select');
  const [clipboard, setClipboard] = useState<string[]>([]);

  const getPointerPos = (e: React.MouseEvent | MouseEvent | Touch) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - viewport.x) / (viewport.zoom || 1),
      y: (e.clientY - rect.top - viewport.y) / (viewport.zoom || 1)
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const factor = Math.pow(1.1, delta / 100);
        const newZoom = Math.min(Math.max(viewport.zoom * factor, 0.05), 10);
        
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
    const pos = getPointerPos(e);

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (activeTool !== 'select') {
      const type = activeTool === 'rect' ? 'rectangle' : activeTool === 'circle' ? 'circle' : activeTool === 'text' ? 'text' : 'frame';
      addObject({
        type: type as any,
        x: pos.x - (type === 'frame' ? 200 : 50),
        y: pos.y - (type === 'frame' ? 150 : 50),
        width: type === 'frame' ? 400 : 100,
        height: type === 'frame' ? 300 : 100,
        rotation: 0,
        fill: type === 'frame' ? '#ffffff' : '#3b82f6',
        text: type === 'text' ? 'New Text' : (type === 'frame' ? 'Frame Title' : undefined)
      });
      setActiveTool('select');
      return;
    }

    const clickedObj = [...objects].reverse().find(obj => 
      pos.x >= obj.x && pos.x <= obj.x + obj.width &&
      pos.y >= obj.y && pos.y <= obj.y + obj.height
    );

    if (clickedObj) {
      if (e.shiftKey) {
        setSelection(selection.includes(clickedObj.id) 
          ? selection.filter(id => id !== clickedObj.id) 
          : [...selection, clickedObj.id]
        );
      } else {
        if (!selection.includes(clickedObj.id)) {
          setSelection([clickedObj.id]);
        }
      }
      setIsDragging(true);
      setDragStart(pos);
    } else {
      if (!e.shiftKey) setSelection([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setViewport({ ...viewport, x: viewport.x + dx, y: viewport.y + dy });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging && selection.length > 0) {
      const pos = getPointerPos(e);
      let dx = pos.x - dragStart.x;
      let dy = pos.y - dragStart.y;
      
      selection.forEach(id => {
        const target = objects.find(o => o.id === id);
        if (target) {
          updateObject(id, {
            x: target.x + dx,
            y: target.y + dy
          });
        }
      });
      setDragStart(pos);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space' && !isPanning) {
      setIsPanning(true);
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      deleteObjects(selection);
    } else if (e.key === '=' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      zoomTo(viewport.zoom * 1.2);
    } else if (e.key === '-' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      zoomTo(viewport.zoom / 1.2);
    } else if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      resetZoom();
    } else if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
      if (e.shiftKey) redo();
      else undo();
    } else if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
      setClipboard(selection);
    } else if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
      if (clipboard.length > 0) duplicateObjects(clipboard);
    } else if (e.key === 'x' && (e.metaKey || e.ctrlKey)) {
      setClipboard(selection);
      deleteObjects(selection);
    } else if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      duplicateObjects(selection);
    } else if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setSelection(objects.map(o => o.id));
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') {
      setIsPanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const iconName = e.dataTransfer.getData('iconName');
    if (iconName) {
      const pos = getPointerPos(e as any);
      addObject({
        type: 'icon',
        iconName,
        x: pos.x - 24,
        y: pos.y - 24,
        width: 48,
        height: 48,
        rotation: 0,
        fill: '#3b82f6',
        opacity: 1
      });
      toast.success('Icon dropped onto canvas');
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f8f9fa] outline-none" 
         tabIndex={0}
         onKeyDown={handleKeyDown}
         onKeyUp={handleKeyUp}
         onDragOver={(e) => e.preventDefault()}
         onDrop={handleDrop}>
      
      {/* Floating UI Elements */}
      <div className="absolute bottom-4 left-4 z-50 flex flex-col gap-3 items-start pointer-events-none">
        <div className="pointer-events-auto">
          <StatusBar />
        </div>
        <div className="pointer-events-auto">
          <ZoomControls />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-50 pointer-events-auto">
        <div className="bg-red-500 text-white p-2">MiniMap Placeholder</div>
        <MiniMap />

      </div>

      {/* Main Toolbar */}
      <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-2 rounded-xl bg-white p-1 shadow-lg border border-neutral-200">
        {(['select', 'rect', 'circle', 'text', 'frame'] as const).map(t => (
          <button 
            key={t}
            onClick={() => setActiveTool(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTool === t ? 'bg-primary text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="w-px h-4 bg-neutral-200 self-center mx-1" />
        <button onClick={undo} className="px-2 py-1.5 hover:bg-neutral-100 rounded-lg text-xs" title="Undo (Ctrl+Z)">Undo</button>
        <button onClick={redo} className="px-2 py-1.5 hover:bg-neutral-100 rounded-lg text-xs" title="Redo (Ctrl+Shift+Z)">Redo</button>
      </div>

      <div 
        ref={containerRef}
        className="h-full w-full touch-none"
        style={{ cursor: isPanning ? 'grabbing' : activeTool === 'select' ? 'default' : 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0'
        }}>
          {/* Grid Background */}
          <div className="absolute top-[-10000px] left-[-10000px] w-[20000px] h-[20000px]"
               style={{
                 backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 0)',
                 backgroundSize: '40px 40px',
                 pointerEvents: 'none',
                 opacity: 0.5
               }} />

          {objects.map(obj => {
            const isSelected = selection.includes(obj.id);
            return (
              <div 
                key={obj.id}
                style={{
                  position: 'absolute',
                  left: obj.x,
                  top: obj.y,
                  width: obj.width,
                  height: obj.height,
                  transform: `rotate(${obj.rotation || 0}deg)`,
                  backgroundColor: (obj.type !== 'text' && obj.type !== 'frame' && obj.type !== 'icon') ? obj.fill : (obj.type === 'frame' ? '#ffffff' : 'transparent'),
                  border: obj.type === 'frame' ? '1px solid #e2e8f0' : 'none',
                  borderRadius: obj.type === 'circle' ? '50%' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: obj.fill || 'black',
                  fontSize: obj.fontSize || (obj.type === 'frame' ? 12 : 16),
                  pointerEvents: 'none',
                  userSelect: 'none',
                  boxShadow: isSelected ? '0 0 0 2px #3b82f6' : (obj.type === 'frame' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none'),
                  zIndex: obj.type === 'frame' ? -1 : 0,
                  opacity: obj.opacity ?? 1,
                }}>
                {obj.type === 'frame' && (
                  <div className="absolute -top-6 left-0 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {obj.text || 'Frame Title'}
                  </div>
                )}
                {obj.type === 'text' && obj.text}
                {obj.type === 'icon' && obj.iconName && (
                  <IconRenderer 
                    name={obj.iconName} 
                    size="100%" 
                    color={obj.fill} 
                    strokeWidth={obj.strokeWidth || 2}
                  />
                )}
                
                {isSelected && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500 rounded-full" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-500 rounded-full" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-500 rounded-full" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500 rounded-full" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
