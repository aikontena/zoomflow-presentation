import React, { useEffect, useState } from 'react';
import { CanvasObject } from '@/lib/canvas-store';
import { IconRenderer } from '../IconRenderer';

interface DynamicTemplateThumbnailProps {
  objects: CanvasObject[];
  name: string;
  className?: string;
}

export const DynamicTemplateThumbnail: React.FC<DynamicTemplateThumbnailProps> = ({ objects, name, className }) => {
  const frame = objects.find(obj => obj.type === 'frame');
  
  if (!frame) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 text-neutral-400 ${className}`}>
        <span className="text-xs font-medium">{name}</span>
      </div>
    );
  }

  // Find objects inside the first frame for the thumbnail
  const frameX1 = frame.x;
  const frameY1 = frame.y;
  const frameX2 = frame.x + frame.width;
  const frameY2 = frame.y + frame.height;

  const containedObjects = objects.filter(obj => {
    if (obj.id === frame.id) return false;
    if (obj.type === 'frame') return false;
    const objCenterX = obj.x + obj.width / 2;
    const objCenterY = obj.y + obj.height / 2;
    return (
      objCenterX >= frameX1 &&
      objCenterX <= frameX2 &&
      objCenterY >= frameY1 &&
      objCenterY <= frameY2
    );
  });

  const safeFrameWidth = Math.max(frame.width, 1);
  const safeFrameHeight = Math.max(frame.height, 1);

  return (
    <div 
      className={`relative overflow-hidden pointer-events-none border border-neutral-100 ${className}`} 
      style={{ backgroundColor: frame.fill }}
    >
      {containedObjects.map(obj => {
        const relX = ((obj.x - frame.x) / safeFrameWidth) * 100;
        const relY = ((obj.y - frame.y) / safeFrameHeight) * 100;
        const relWidth = (obj.width / safeFrameWidth) * 100;
        const relHeight = (obj.height / safeFrameHeight) * 100;

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
              fontSize: `${(obj.fontSize || 16) * (180 / frame.height)}px`, 
              opacity: obj.opacity ?? 1,
              overflow: 'hidden'
            }}
          >
            {obj.type === 'text' && (
              <div className="w-full text-center truncate leading-none font-bold" style={{ fontSize: 'inherit' }}>
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