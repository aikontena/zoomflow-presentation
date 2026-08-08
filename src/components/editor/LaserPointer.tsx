import React, { useEffect, useState, useRef } from 'react';

export default function LaserPointer() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'laser' | 'spotlight' | 'highlight'>('laser');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      // Always keep active while moving to show the pointer
      setIsActive(true);
    };

    const handleMouseLeave = () => setIsActive(false);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'l') setMode('laser');
      if (e.key === 's') setMode('spotlight');
      if (e.key === 'h') setMode('highlight');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[110]">
      {mode === 'laser' && (
        <div 
          className="absolute w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
          style={{ left: position.x, top: position.y }}
        >
          <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75"></div>
        </div>
      )}

      {mode === 'spotlight' && (
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 150px at ${position.x}px ${position.y}px, transparent 0%, rgba(0,0,0,0.7) 100%)`
          }}
        />
      )}

      {mode === 'highlight' && (
        <div 
          className="absolute w-24 h-24 rounded-full border-4 border-yellow-400 bg-yellow-400/20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
          style={{ left: position.x, top: position.y }}
        />
      )}
    </div>
  );
}
