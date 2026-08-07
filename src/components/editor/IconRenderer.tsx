import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ 
  name, 
  size = 24, 
  color = 'currentColor', 
  className,
  strokeWidth = 2
}) => {
  // Convert kebab-case to PascalCase for Lucide icons
  const pascalName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const IconComponent = (LucideIcons as any)[pascalName] || (LucideIcons as any)[name] || LucideIcons.HelpCircle;

  return <IconComponent size={size} color={color} className={className} strokeWidth={strokeWidth} />;
};
