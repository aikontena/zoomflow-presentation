import React from 'react';
import { CanvasObject } from '@/lib/canvas-store';
import { IconRenderer } from './IconRenderer';

interface FramePreviewProps {
  frame: CanvasObject;
  allObjects: CanvasObject[];
}

export const FramePreview: React.FC<FramePreviewProps> = ({ frame, allObjects }) => {
  // Find objects that are "inside" the frame
  // We consider an object inside if its center is within the frame bounds
  const frameX1 = frame.x;
  const frameY1 = frame.y;
  const frameX2 = frame.x + frame.width;
  const frameY2 = frame.y + frame.height;

  const containedObjects = allObjects.filter(obj => {
    if (obj.id === frame.id) return false;
    if (obj.type === 'frame') return false; // Don't nest frames for preview simplicity

    const objCenterX = obj.x + obj.width / 2;
    const objCenterY = obj.y + obj.height / 2;

    return (
      objCenterX >= frameX1 &&
      objCenterX <= frameX2 &&
      objCenterY >= frameY1 &&
      objCenterY <= frameY2
    );
  });

  // Calculate scaling to fit the frame into the preview container (aspect-video)
  // The container in LeftSidebar is aspect-video, let's assume it's roughly 160x90 or similar
  // We'll use relative positioning for the objects
  
  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none" style={{ backgroundColor: frame.fill }}>
      {containedObjects.map(obj => {
        const relX = ((obj.x - frame.x) / frame.width) * 100;
        const relY = ((obj.y - frame.y) / frame.height) * 100;
        const relWidth = (obj.width / frame.width) * 100;
        const relHeight = (obj.height / frame.height) * 100;

        return (
          <div
            key={obj.id}
            style={{
              position: 'absolute',
              left: `${relX}%`,
              top: `${relY}%`,
              width: `${relWidth}%`,
              height: `${relHeight}%`,
              transform: `rotate(${obj.rotation || 0}deg)`,
              backgroundColor: (obj.type !== 'text' && obj.type !== 'icon') ? obj.fill : 'transparent',
              borderRadius: obj.type === 'circle' ? '50%' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: obj.fill,
              fontSize: `${(obj.fontSize || 16) * (90 / frame.height)}px`, // Roughly scaled font size
              opacity: obj.opacity ?? 1,
            }}
          >
            {obj.type === 'text' && (
              <div className="w-full text-center truncate leading-none" style={{ fontSize: 'inherit' }}>
                {obj.text}
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
          </div>
        );
      })}
    </div>
  );
};
