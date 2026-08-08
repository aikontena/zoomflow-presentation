import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvasStore, CanvasObject } from '@/lib/canvas-store';
import { IconRenderer } from './IconRenderer';
import { getIconMeta } from '@/lib/icon-registry';
import { toast } from 'sonner';
import ZoomControls from './ZoomControls';
import MiniMap from './MiniMap';
import StatusBar from './StatusBar';
import { useViewportController } from './ViewportController';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const objects = useCanvasStore(state => state.objects);
  const viewport = useCanvasStore(state => state.viewport);
  const selection = useCanvasStore(state => state.selection);
  const setViewport = useCanvasStore(state => state.setViewport);
  const setSelection = useCanvasStore(state => state.setSelection);
  const updateObject = useCanvasStore(state => state.updateObject);
  const deleteObjects = useCanvasStore(state => state.deleteObjects);
  const addObject = useCanvasStore(state => state.addObject);
  const undo = useCanvasStore(state => state.undo);
  const redo = useCanvasStore(state => state.redo);
  const duplicateObjects = useCanvasStore(state => state.duplicateObjects);
  
  const { zoomTo, resetZoom } = useViewportController();
  
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<'select' | 'rect' | 'circle' | 'text' | 'frame'>('select');
  const [clipboard, setClipboard] = useState<string[]>([]);

  const getPointerPos = (e: React.MouseEvent | MouseEvent | Touch) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const zoom = viewport.zoom || 1;
    return {
      x: (e.clientX - rect.left - viewport.x) / zoom,
      y: (e.clientY - rect.top - viewport.y) / zoom
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
        const currentZoom = viewport.zoom || 1;
        const newZoom = Math.min(Math.max(currentZoom * factor, 0.05), 10);
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX - viewport.x) / currentZoom;
        const worldY = (mouseY - viewport.y) / currentZoom;
        
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
      pos.x >= obj.x && pos.x <= obj.x + (obj.width || 0) &&
      pos.y >= obj.y && pos.y <= obj.y + (obj.height || 0)
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
      zoomTo((viewport.zoom || 1) * 1.2);
    } else if (e.key === '-' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      zoomTo((viewport.zoom || 1) / 1.2);
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
    const iconName = e.dataTransfer.getData('iconName') || e.dataTransfer.getData('text/plain');
    if (!iconName) return;
    if (!getIconMeta(iconName)) {
      toast.error('Unknown icon');
      return;
    }
    const pos = getPointerPos(e as any);
    const id = addObject({
      type: 'icon',
      iconName,
      x: Math.round(pos.x - 24),
      y: Math.round(pos.y - 24),
      width: 48,
      height: 48,
      rotation: 0,
      fill: '#3b82f6',
      strokeWidth: 2,
      opacity: 1
    });
    if (typeof id === 'string') setSelection([id]);
    toast.success('Icon dropped onto canvas');
  };


  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f8f9fa] outline-none flex flex-col" 
         tabIndex={0}
         onKeyDown={handleKeyDown}
         onKeyUp={handleKeyUp}
         onDragOver={(e) => e.preventDefault()}
         onDrop={handleDrop}>
      
      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="relative flex-1 touch-none overflow-hidden"
        style={{ cursor: isPanning ? 'grabbing' : activeTool === 'select' ? 'default' : 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom || 1})`,
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
                  transform: `translate3d(0, 0, 0) rotate(${obj.rotation || 0}deg)`,
                  backgroundColor: (obj.type !== 'text' && obj.type !== 'frame' && obj.type !== 'icon') ? obj.fill : 'transparent',
                  background: obj.type === 'frame' ? obj.fill : undefined,
                  border: obj.type === 'frame' ? '1px solid rgba(0,0,0,0.1)' : 'none',
                  borderRadius: obj.type === 'circle' ? '50%' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: obj.fill || 'black',
                  fontSize: obj.fontSize || (obj.type === 'frame' ? 12 : 16),
                  pointerEvents: obj.locked ? 'none' : 'auto',
                  userSelect: 'none',
                  filter: obj.shadow ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' : undefined,
                  boxShadow: isSelected ? '0 0 0 2px #3b82f6' : (obj.type === 'frame' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none'),
                  zIndex: obj.type === 'frame' ? -1 : 1,
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

        {/* Floating Overlays inside Canvas Area */}
        <div className="absolute bottom-4 right-4 z-50 pointer-events-auto">
          <MiniMap />
        </div>

        {/* Main Tool Selector */}
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
      </div>

      {/* Footer Bar */}
      <div className="flex items-center justify-between px-4 bg-white border-t border-neutral-200 h-10 shrink-0">
        <div className="flex items-center">
          <StatusBar />
        </div>
        <div className="flex-1 flex justify-center">
          <ZoomControls />
        </div>
        <div className="w-[120px]" /> {/* Spacer to balance status bar */}
      </div>
    </div>
  );
}
