import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function MiniMap() {
  const { objects, viewport, setViewport } = useCanvasStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Constants for minimap scale
  const MAP_SIZE = 160;
  const PADDING = 20;

  // Calculate content bounds with memoization
  const bounds = useMemo(() => {
    if (!objects || objects.length === 0) {
      return { minX: -500, minY: -500, maxX: 500, maxY: 500 };
    }
    const xCoords = objects.map(o => o.x);
    const yCoords = objects.map(o => o.y);
    const xFarCoords = objects.map(o => o.x + o.width);
    const yFarCoords = objects.map(o => o.y + o.height);

    const minX = Math.min(...xCoords) - 100;
    const minY = Math.min(...yCoords) - 100;
    const maxX = Math.max(...xFarCoords) + 100;
    const maxY = Math.max(...yFarCoords) + 100;
    
    return { minX, minY, maxX, maxY };
  }, [objects]);

  const worldWidth = bounds.maxX - bounds.minX;
  const worldHeight = bounds.maxY - bounds.minY;
  const maxDim = Math.max(worldWidth, worldHeight, 1);
  const scale = (MAP_SIZE - PADDING * 2) / maxDim;

  const toMapCoord = (x: number, y: number) => ({
    x: (x - bounds.minX) * scale + PADDING,
    y: (y - bounds.minY) * scale + PADDING
  });

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const mapX = e.clientX - rect.left;
    const mapY = e.clientY - rect.top;

    const worldX = (mapX - PADDING) / scale + bounds.minX;
    const worldY = (mapY - PADDING) / scale + bounds.minY;

    // Use safe window dimensions
    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    setViewport({
      ...viewport,
      x: winWidth / 2 - worldX * viewport.zoom,
      y: winHeight / 2 - worldY * viewport.zoom
    });
  };

  const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const viewportRect = {
    x: -viewport.x / (viewport.zoom || 1),
    y: -viewport.y / (viewport.zoom || 1),
    width: winWidth / (viewport.zoom || 1),
    height: winHeight / (viewport.zoom || 1)
  };

  const vMap = toMapCoord(viewportRect.x, viewportRect.y);
  const vMapSize = {
    width: viewportRect.width * scale,
    height: viewportRect.height * scale
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border-2 border-red-500 rounded-lg shadow-lg overflow-hidden transition-all duration-300 pointer-events-auto z-[9999]">
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          MAP
          Navigator
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          className="p-1 hover:bg-neutral-200 rounded transition-colors pointer-events-auto"
        >
          {isCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {!isCollapsed && (
        <div 
          ref={mapRef}
          onClick={handleMapClick}
          className="relative cursor-crosshair bg-neutral-50"
          style={{ width: MAP_SIZE, height: MAP_SIZE }}
        >
          {/* Objects */}
          {objects && objects.map(obj => {
            const pos = toMapCoord(obj.x, obj.y);
            return (
              <div 
                key={obj.id}
                className="absolute bg-neutral-300 rounded-sm"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: Math.max(2, obj.width * scale),
                  height: Math.max(2, obj.height * scale),
                }}
              />
            );
          })}

          {/* Viewport Indicator */}
          <div 
            className="absolute border-2 border-primary bg-primary/5 pointer-events-none transition-all duration-75"
            style={{
              left: vMap.x,
              top: vMap.y,
              width: Math.max(4, vMapSize.width),
              height: Math.max(4, vMapSize.height),
            }}
          />
        </div>
      )}
    </div>
  );
}
