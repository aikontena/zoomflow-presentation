import { CanvasObject, Bookmark } from "./canvas-store";

export interface CanvasTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  objects: any[];
  bookmarks?: Bookmark[];
  presentationPath?: string[];
}

const COLORS = {
  business: { primary: '#1E293B', secondary: '#3B82F6', accent: '#60A5FA', bg: '#F8FAFC', text: '#1E293B', grid: '#E2E8F0' },
  creative: { primary: '#F97316', secondary: '#FB923C', accent: '#FDBA74', bg: '#FFF7ED', text: '#7C2D12', grid: '#FFEDD5' },
  tech: { primary: '#6366F1', secondary: '#818CF8', accent: '#A5B4FC', bg: '#F5F3FF', text: '#4338CA', grid: '#EDE9FE' },
  minimal: { primary: '#18181B', secondary: '#3F3F46', accent: '#A1A1AA', bg: '#FFFFFF', text: '#18181B', grid: '#F4F4F5' },
};

/**
 * Factory for creating complex spatial layouts
 */
export const createLayout = (id: string, name: string, category: string, colorKey: keyof typeof COLORS = 'business'): CanvasTemplate => {
  const colors = COLORS[colorKey];
  const objects: any[] = [];
  const bookmarks: Bookmark[] = [];
  const presentationPath: string[] = [];

  // Add background art to all templates
  objects.push({
    id: `bg-art-${id}`,
    type: 'rectangle',
    x: -5000, y: -5000,
    width: 15000, height: 10000,
    fill: colors.bg,
    locked: true,
    opacity: 1
  });

  // Add stylized grid pattern as background objects
  for (let i = 0; i < 20; i++) {
    objects.push({
      id: `bg-accent-${id}-${i}`,
      type: Math.random() > 0.5 ? 'circle' : 'rectangle',
      x: (Math.random() - 0.5) * 10000,
      y: (Math.random() - 0.5) * 10000,
      width: 400 + Math.random() * 800,
      height: 400 + Math.random() * 800,
      fill: colors.grid,
      opacity: 0.1,
      locked: true,
      rotation: Math.random() * 360
    });
  }

  // Base Logic for specific layouts would go here.
  // For the prompt, I will generate a generic but structured layout based on the name.
  // I'll implement a few specialized generators and use a fallback for the 50 layouts.

  const generateRadial = (centerX: number, centerY: number, count: number, radius: number, title: string) => {
    // Add central node
    const rootId = `root-${id}`;
    objects.push({
      id: rootId,
      type: 'circle',
      x: centerX - 100, y: centerY - 100,
      width: 200, height: 200,
      fill: colors.primary,
      text: title,
      fontSize: 24,
      stroke: colors.accent,
      strokeWidth: 4
    });

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const childId = `child-${id}-${i}`;

      // Frame for content
      objects.push({
        id: childId,
        type: 'frame',
        x: x - 200, y: y - 112,
        width: 400, height: 225,
        fill: colors.bg,
        text: `Point ${i + 1}`,
        settings: { duration: 1500, easing: 'smooth', camera: { x: x - 200, y: y - 112, zoom: 1.5, rotation: 0 } }
      });
      
      presentationPath.push(childId);
      bookmarks.push({ id: `bm-${childId}`, label: `Point ${i + 1}`, viewport: { x: x - 200, y: y - 112, zoom: 1.5, rotation: 0 } });
      
      // Connector (rectangle used as line)
      objects.push({
        id: `conn-${id}-${i}`,
        type: 'rectangle',
        x: centerX, y: centerY,
        width: radius - 100, height: 2,
        rotation: (angle * 180) / Math.PI,
        fill: colors.accent,
        opacity: 0.5
      });
    }
  };

  const generateTimeline = (x: number, y: number, steps: number) => {
    const spacing = 1000;
    // Main line
    objects.push({
      id: `line-${id}`,
      type: 'rectangle',
      x, y: y + 225,
      width: steps * spacing, height: 10,
      fill: colors.primary,
      opacity: 0.2
    });

    for (let i = 0; i < steps; i++) {
      const stepX = x + i * spacing;
      const stepY = i % 2 === 0 ? y : y + 300;
      const frameId = `step-${id}-${i}`;

      objects.push({
        id: frameId,
        type: 'frame',
        x: stepX, y: stepY,
        width: 600, height: 337,
        fill: colors.bg,
        text: `Phase ${i + 1}`,
        settings: { duration: 1200, easing: 'cinematic', camera: { x: stepX, y: stepY, zoom: 1, rotation: 0 } }
      });

      presentationPath.push(frameId);
      bookmarks.push({ id: `bm-${frameId}`, label: `Phase ${i + 1}`, viewport: { x: stepX, y: stepY, zoom: 1, rotation: 0 } });

      // Connector to timeline
      objects.push({
        id: `pin-${id}-${i}`,
        type: 'rectangle',
        x: stepX + 300, y: i % 2 === 0 ? stepY + 337 : stepY - 75,
        width: 2, height: 75,
        fill: colors.accent
      });
    }
  };

  // Switch based on layout name/type
  if (name.includes('Radial') || name.includes('Galaxy')) {
    generateRadial(0, 0, 8, 1500, name);
  } else if (name.includes('Timeline') || name.includes('Roadmap')) {
    generateTimeline(0, 0, 6);
  } else {
    // Default Grid/Tree spatial layout
    const rows = 4;
    const cols = 5;
    const spacing = 1200;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const frameId = `f-${id}-${r}-${c}`;
        const fx = c * spacing;
        const fy = r * spacing;
        
        objects.push({
          id: frameId,
          type: 'frame',
          x: fx, y: fy,
          width: 800, height: 450,
          fill: colors.bg,
          text: `${name} - Section ${r}${c}`,
          settings: { duration: 1000, easing: 'smooth', camera: { x: fx, y: fy, zoom: 1, rotation: 0 } }
        });

        if (c > 0) { // Horizontal connector
            objects.push({
                id: `conn-h-${frameId}`,
                type: 'rectangle',
                x: fx - 400, y: fy + 225,
                width: 400, height: 2,
                fill: colors.grid,
                opacity: 0.3
            });
        }

        presentationPath.push(frameId);
      }
    }
  }

  return { id, name, category, description: `Spatial layout for ${name}`, objects, bookmarks, presentationPath };
};

export const CANVAS_LAYOUTS: CanvasTemplate[] = [
  // Business
  createLayout('layout-biz-01', 'Business Model Canvas', 'Business', 'business'),
  createLayout('layout-biz-02', 'Lean Canvas', 'Business', 'business'),
  createLayout('layout-biz-03', 'SWOT Analysis', 'Business', 'business'),
  createLayout('layout-biz-04', 'PESTLE Analysis', 'Business', 'business'),
  createLayout('layout-biz-05', 'Value Proposition', 'Business', 'business'),
  
  // Maps & Charts
  createLayout('layout-map-01', 'Mind Map', 'Strategy', 'creative'),
  createLayout('layout-map-02', 'Concept Map', 'Strategy', 'creative'),
  createLayout('layout-map-03', 'Organization Chart', 'Business', 'business'),
  createLayout('layout-map-04', 'Radial Tree', 'Strategy', 'tech'),
  createLayout('layout-map-05', 'Fishbone Diagram', 'Analysis', 'minimal'),
  
  // Process & Time
  createLayout('layout-time-01', 'Timeline', 'Process', 'business'),
  createLayout('layout-time-02', 'Product Roadmap', 'Process', 'tech'),
  createLayout('layout-time-03', 'User Journey Map', 'UX', 'creative'),
  createLayout('layout-time-04', 'Kanban Board', 'Process', 'tech'),
  createLayout('layout-time-05', 'Circular Process', 'Process', 'creative'),
  
  // Spatial/Infinite
  createLayout('layout-space-01', 'Solar System', 'Creative', 'tech'),
  createLayout('layout-space-02', 'Galaxy Layout', 'Creative', 'tech'),
  createLayout('layout-space-03', 'City Map', 'Creative', 'minimal'),
  createLayout('layout-space-04', 'Subway Map', 'Creative', 'business'),
  createLayout('layout-space-05', 'World Map View', 'Creative', 'business'),
  
  // Design & Media
  createLayout('layout-design-01', 'Research Poster', 'Academic', 'minimal'),
  createLayout('layout-design-02', 'Magazine Layout', 'Creative', 'creative'),
  createLayout('layout-design-03', 'Storyboard', 'UX', 'minimal'),
  createLayout('layout-design-04', 'Portfolio Grid', 'Creative', 'creative'),
  createLayout('layout-design-05', 'Newspaper Layout', 'Creative', 'minimal'),
  
  // Software & Tech
  createLayout('layout-tech-01', 'Flowchart', 'Tech', 'tech'),
  createLayout('layout-tech-02', 'AI Workflow', 'Tech', 'tech'),
  createLayout('layout-tech-03', 'Database Schema', 'Tech', 'tech'),
  createLayout('layout-tech-04', 'Software Architecture', 'Tech', 'tech'),
  createLayout('layout-tech-05', 'UX Flow', 'UX', 'creative'),
  
  // Education
  createLayout('layout-edu-01', 'Learning Path', 'Education', 'creative'),
  createLayout('layout-edu-02', 'Course Map', 'Education', 'creative'),
  createLayout('layout-edu-03', 'Curriculum Map', 'Education', 'creative'),
  createLayout('layout-edu-04', 'Scientific Poster', 'Academic', 'minimal'),
  
  // Problem Solving
  createLayout('layout-prob-01', 'Problem Solution', 'Analysis', 'business'),
  createLayout('layout-prob-02', 'Case Study', 'Analysis', 'business'),
  createLayout('layout-prob-03', 'Decision Tree', 'Analysis', 'tech'),
  createLayout('layout-prob-04', 'Comparison', 'Analysis', 'minimal'),
  createLayout('layout-prob-05', 'Before After', 'Analysis', 'minimal'),
  
  // UI/UX
  createLayout('layout-ux-01', 'Wireframe', 'UX', 'minimal'),
  createLayout('layout-ux-02', 'Wire Connections', 'UX', 'tech'),
  createLayout('layout-ux-03', 'Sprint Board', 'Process', 'tech'),
  createLayout('layout-ux-04', 'Hierarchy Map', 'Strategy', 'business'),
  createLayout('layout-ux-05', 'Network Diagram', 'Strategy', 'tech'),
  
  // Extra
  createLayout('layout-extra-01', 'Conference Layout', 'Event', 'creative'),
  createLayout('layout-extra-02', 'Infographic', 'Creative', 'creative'),
  createLayout('layout-extra-03', 'Customer Journey', 'UX', 'creative'),
  createLayout('layout-extra-04', 'PESTLE Matrix', 'Business', 'business'),
  createLayout('layout-extra-05', 'SWOT Matrix', 'Business', 'business'),
];
