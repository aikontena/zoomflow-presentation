import React from 'react';
import { getIconComponent } from '@/lib/icon-registry';

interface IconRendererProps {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  className,
  strokeWidth = 2,
  absoluteStrokeWidth = true,
}) => {
  const IconComponent = getIconComponent(name);

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={absoluteStrokeWidth}
    />
  );
};

export default IconRenderer;
