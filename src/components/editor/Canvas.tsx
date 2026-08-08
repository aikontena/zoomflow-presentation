import React, { useRef, useEffect, useState } from 'react';
import { useCanvasStore, CanvasObject } from '@/lib/canvas-store';
import { IconRenderer } from './IconRenderer';
import { getIconMeta } from '@/lib/icon-registry';
import { toast } from 'sonner';
import ZoomControls from './ZoomControls';
import MiniMap from './MiniMap';
import StatusBar from './StatusBar';
import { useViewportController } from './ViewportController';

// Memoized individual object renderer
export const CanvasObjectItem = React.memo(({ 
  obj, 
  selection, 
  editingId, 
  onStartEditing 
}: { 
  obj: CanvasObject, 
  selection: string[],
  editingId: string | null,
  onStartEditing: (id: string) => void
}) => {
  const isSelected = selection.includes(obj.id);
  const isEditing = editingId === obj.id;
  const updateObject = useCanvasStore(state => state.updateObject);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, [isEditing]);
  
  const getFilter = () => {
    if (obj.type !== 'image' && obj.type !== 'video') return undefined;
    const brightness = obj.brightness ?? 1;
    const contrast = obj.contrast ?? 1;
    const saturation = obj.saturation ?? 1;
    const blur = obj.blur ?? 0;
    return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`;
  };

  const getTextStyle = (): React.CSSProperties => {
    if (obj.type !== 'text') return {};
    return {
      fontFamily: obj.fontFamily || 'Inter',
      fontWeight: obj.fontWeight || 'normal',
      fontStyle: obj.fontStyle || 'normal',
      textDecoration: obj.textDecoration || 'none',
      textAlign: obj.textAlign || 'left',
      letterSpacing: `${obj.letterSpacing || 0}px`,
      lineHeight: obj.lineHeight || 1.2,
      backgroundColor: obj.highlight || 'transparent',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: obj.textAlign === 'center' ? 'center' : 'flex-start',
      justifyContent: obj.textAlign === 'center' ? 'center' : (obj.textAlign === 'right' ? 'flex-end' : 'flex-start'),
      color: obj.fill || 'black',
      fontSize: obj.fontSize || 16,
      padding: '4px',
      outline: 'none',
    };
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (obj.type === 'text') {
      e.stopPropagation();
      onStartEditing(obj.id);
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height,
        transform: `translate3d(0, 0, 0) rotate(${obj.rotation || 0}deg)`,
        backgroundColor: (obj.type !== 'text' && obj.type !== 'frame' && obj.type !== 'icon' && obj.type !== 'video') ? obj.fill : 'transparent',
        background: obj.type === 'frame' ? obj.fill : undefined,
        border: obj.type === 'frame' ? '1px solid rgba(0,0,0,0.1)' : (obj.strokeWidth ? `${obj.strokeWidth}px solid ${obj.stroke || 'black'}` : 'none'),
        borderRadius: obj.type === 'circle' ? '50%' : `${obj.borderRadius || 0}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: obj.fill || 'black',
        fontSize: obj.fontSize || (obj.type === 'frame' ? 12 : 16),
        pointerEvents: obj.locked ? 'none' : 'auto',
        userSelect: isEditing ? 'text' : 'none',
        filter: obj.shadow ? `drop-shadow(${obj.shadowOffsetX || 0}px ${obj.shadowOffsetY || 4}px ${obj.shadowBlur || 6}px ${obj.shadowColor || 'rgba(0,0,0,0.25)'})` : undefined,
        boxShadow: isEditing ? '0 0 0 2px #3b82f6' : (isSelected ? '0 0 0 2px #3b82f6' : (obj.type === 'frame' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none')),
        zIndex: obj.type === 'frame' ? 0 : 1,
        opacity: obj.opacity ?? 1,
        overflow: 'hidden',
      }}>

      {obj.type === 'frame' && (
        <div className="absolute -top-6 left-0 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          {obj.text || 'Frame Title'}
        </div>
      )}
      {obj.type === 'text' && (
        isEditing ? (
          <textarea
            ref={textAreaRef}
            value={obj.text}
            onChange={(e) => updateObject(obj.id, { text: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              ...getTextStyle(),
              background: 'transparent',
              border: 'none',
              resize: 'none',
              overflow: 'hidden',
              cursor: 'text',
            }}
          />
        ) : (
          <div style={getTextStyle()}>
            {obj.text}
          </div>
        )
      )}
      {obj.type === 'image' && obj.src && (
        <img 
          src={obj.src} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: obj.objectFit || 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            filter: getFilter()
          }} 
          draggable={false}
        />
      )}
      {obj.type === 'video' && obj.src && (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {obj.videoType === 'youtube' || obj.src.includes('youtube.com') || obj.src.includes('youtu.be') ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${obj.src.split('v=')[1]?.split('&')[0] || obj.src.split('/').pop()}?autoplay=${obj.autoplay ? 1 : 0}&loop=${obj.loop ? 1 : 0}&mute=${obj.muted ? 1 : 0}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video
              src={obj.src}
              poster={obj.poster}
              autoPlay={obj.autoplay}
              loop={obj.loop}
              muted={obj.muted}
              style={{ width: '100%', height: '100%', objectFit: obj.objectFit || 'contain', filter: getFilter() }}
            />
          )}
        </div>
      )}
      {obj.type === 'icon' && obj.iconName && (
        <IconRenderer
          name={obj.iconName}
          size="100%"
          color={obj.fill}
          strokeWidth={obj.strokeWidth || 2}
        />
      )}

      {(obj.type === 'audio' || obj.type === 'pdf' || obj.type === 'qr' || obj.type === 'chart' || obj.type === 'table' || obj.type === 'equation') && (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <div className="text-4xl">
            {obj.type === 'audio' ? '🎵' : obj.type === 'pdf' ? '📄' : obj.type === 'qr' ? '📱' : obj.type === 'chart' ? '📊' : obj.type === 'table' ? '📋' : 'Σ'}
          </div>
          <div className="text-[10px] font-bold uppercase truncate max-w-full">
            {obj.text || obj.type}
          </div>
          {obj.type === 'audio' && obj.src && (
            <audio src={obj.src} controls className="h-6 w-full max-w-[200px]" />
          )}
        </div>
      )}

      {isSelected && !isEditing && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500 rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500 rounded-full" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-blue-500 rounded-full flex items-center justify-center cursor-ns-resize">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </div>
        </>
      )}
    </div>
  );
}, (prev, next) => {
  return prev.obj === next.obj && 
         prev.editingId === next.editingId &&
         (prev.selection.includes(prev.obj.id) === next.selection.includes(next.obj.id));
});

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
  const [editingId, setEditingId] = useState<string | null>(null);

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
      setEditingId(null);
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
    if (editingId && e.key !== 'Escape') return; // Let textarea handle typing unless Escape

    if (e.code === 'Space' && !isPanning) {
      setIsPanning(true);
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      deleteObjects(selection);
    } else if (e.key === '=' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      zoomTo((viewport.zoom || 1) * 1.2);
    } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      useCanvasStore.getState().save();
      toast.success('Project saved');
    } else if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if(confirm('Clear current canvas and start new?')) useCanvasStore.getState().clear();
    } else if (e.key === 'f5') {
      e.preventDefault();
      useCanvasStore.getState().startPresentation();
    } else if (e.key === '-' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      zoomTo((viewport.zoom || 1) / 1.2);
    } else if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      resetZoom();
    } else if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
      if (editingId) return; // Don't trigger undo while typing
      if (e.shiftKey) redo();
      else undo();
    } else if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
      if (selection.length > 0) {
        const obj = objects.find(o => o.id === selection[0]);
        if (obj?.type === 'text') {
          e.preventDefault();
          updateObject(obj.id, { fontWeight: obj.fontWeight === 'bold' ? 'normal' : 'bold' });
        }
      }
    } else if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
      if (selection.length > 0) {
        const obj = objects.find(o => o.id === selection[0]);
        if (obj?.type === 'text') {
          e.preventDefault();
          updateObject(obj.id, { fontStyle: obj.fontStyle === 'italic' ? 'normal' : 'italic' });
        }
      }
    } else if (e.key === 'u' && (e.metaKey || e.ctrlKey)) {
      if (selection.length > 0) {
        const obj = objects.find(o => o.id === selection[0]);
        if (obj?.type === 'text') {
          e.preventDefault();
          updateObject(obj.id, { textDecoration: obj.textDecoration === 'underline' ? 'none' : 'underline' });
        }
      }
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
    
    // Check for files first
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const pos = getPointerPos(e as any);
      
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          const type = file.type.startsWith('video/') ? 'video' : 
                       file.type.startsWith('audio/') ? 'audio' :
                       file.type === 'application/pdf' ? 'pdf' : 'image';
          
          const id = addObject({
            type: type as any,
            x: Math.round(pos.x - 100 + (index * 20)),
            y: Math.round(pos.y - 100 + (index * 20)),
            width: type === 'image' ? 300 : type === 'video' ? 480 : 200,
            height: type === 'image' ? 200 : type === 'video' ? 270 : 50,
            rotation: 0,
            fill: type === 'image' || type === 'video' ? 'transparent' : '#3b82f6',
            src,
            text: type === 'audio' ? file.name : undefined
          });
          if (typeof id === 'string') setSelection([id]);
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    const iconName = e.dataTransfer.getData('iconName') || e.dataTransfer.getData('text/plain');
    if (!iconName) return;
    if (!getIconMeta(iconName)) {
      // It might be just text if not an icon name
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
    <div className={`relative h-full w-full overflow-hidden outline-none flex flex-col`} 
         style={{ 
           backgroundColor: viewport.zoom < 0.2 ? (useCanvasStore.getState().presentationSettings.backgroundColor || '#f8f9fa') : (useCanvasStore.getState().presentationSettings.backgroundColor || '#f8f9fa'),
           backgroundImage: useCanvasStore.getState().presentationSettings.backgroundImage ? `url(${useCanvasStore.getState().presentationSettings.backgroundImage})` : 'none',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}
         tabIndex={0}
         onKeyDown={handleKeyDown}
         onKeyUp={handleKeyUp}
         onDragOver={(e) => e.preventDefault()}
         onDrop={handleDrop}>
      
      {/* Canvas Area */}
      <div 
        ref={containerRef}
        id="canvas-container"
        className="relative flex-1 touch-none overflow-hidden"
        style={{ cursor: isPanning ? 'grabbing' : activeTool === 'select' ? 'default' : 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          id="editor-stage"
          className="will-change-transform"
          style={{
            transform: `translate3d(${viewport.x || 0}px, ${viewport.y || 0}px, 0) scale(${viewport.zoom || 1}) rotate(${viewport.rotation || 0}deg)`,
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

          {objects.map(obj => (
            <CanvasObjectItem 
              key={obj.id} 
              obj={obj} 
              selection={selection}
              editingId={editingId}
              onStartEditing={(id) => setEditingId(id)}
            />
          ))}
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
