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
  // lucide computes strokeWidth * 24 / Number(size) when absoluteStrokeWidth is on,
  // which yields NaN for non-numeric sizes like "100%".
  const numericSize = typeof size === 'number' || !Number.isNaN(Number(size));

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      strokeWidth={Number.isFinite(strokeWidth) ? strokeWidth : 2}
      absoluteStrokeWidth={numericSize ? absoluteStrokeWidth : false}
    />
  );

};

export default IconRenderer;
