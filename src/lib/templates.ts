export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  framesCount: number;
  estimatedDuration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  popularity: number;
  tags: string[];
  thumbnail: string;
  objects: any[];
}

const COLORS: Record<string, any> = {
  business: { primary: '#1E293B', secondary: '#3B82F6', accent: '#60A5FA', bg: '#F8FAFC', text: '#1E293B', shapes: ['#E2E8F0', '#CBD5E1'] },
  startup: { primary: '#10B981', secondary: '#059669', accent: '#34D399', bg: '#F0FDF4', text: '#064E3B', shapes: ['#DCFCE7', '#BBF7D0'] },
  marketing: { primary: '#EC4899', secondary: '#DB2777', accent: '#F472B6', bg: '#FDF2F8', text: '#831843', shapes: ['#FCE7F3', '#FBCFE8'] },
  minimal: { primary: '#18181B', secondary: '#3F3F46', accent: '#A1A1AA', bg: '#FFFFFF', text: '#18181B', shapes: ['#F4F4F5', '#E4E4E7'] },
  dark: { primary: '#FFFFFF', secondary: '#94A3B8', accent: '#3B82F6', bg: '#0F172A', text: '#F8FAFC', shapes: ['#1E293B', '#334155'] },
  academic: { primary: '#4338CA', secondary: '#6366F1', accent: '#818CF8', bg: '#EEF2FF', text: '#312E81', shapes: ['#E0E7FF', '#C7D2FE'] },
  creative: { primary: '#F97316', secondary: '#FB923C', accent: '#FDBA74', bg: '#FFF7ED', text: '#7C2D12', shapes: ['#FFEDD5', '#FED7AA'] },
  modern: { primary: '#6366F1', secondary: '#818CF8', accent: '#A5B4FC', bg: '#F5F3FF', text: '#4338CA', shapes: ['#EDE9FE', '#DDD6FE'] }
};

const ICONS = ['Briefcase', 'TrendingUp', 'Target', 'Users', 'Zap', 'Shield', 'Globe', 'Cpu', 'Layers', 'PieChart', 'Rocket', 'Activity', 'Award', 'BookOpen', 'Camera', 'Compass', 'Database', 'Eye', 'Gift', 'Heart'];

const createProfessionalFrame = (
  templateId: string, 
  frameIndex: number, 
  title: string, 
  content: string, 
  type: 'title' | 'content' | 'chart' | 'image' | 'closing' | 'grid' | 'feature' | 'quote' | 'team', 
  colors: { primary: string; secondary: string; accent: string; bg: string; text: string; shapes: string[] },
  x: number,
  y: number
) => {
  const frameId = `f-${templateId}-${frameIndex}`;
  const width = 800;
  const height = 450;
  
  const objects: any[] = [
    {
      id: frameId,
      type: 'frame',
      x, y, width, height,
      rotation: 0,
      fill: colors.bg,
      text: title,
      speakerNotes: `Frame ${frameIndex + 1}: ${title}\n\nKey talking points:\n• Focus on the ${type} aspect.\n• Mention the strategic importance of this data.\n• Engage the audience with a relevant question.\n\nTransition: "Moving forward to our next key point..."`
    }
  ];

  // Background Design Elements
  objects.push({
    id: `bg-accent-${frameId}-1`,
    type: 'rectangle',
    x: x + (frameIndex % 2 === 0 ? 0 : 600), y: y,
    width: 200, height: 450,
    fill: colors.shapes[0],
    opacity: 0.2,
    parentId: frameId
  });

  objects.push({
    id: `bg-circle-${frameId}`,
    type: 'circle',
    x: x + 700, y: y - 50,
    width: 150, height: 150,
    fill: colors.accent,
    opacity: 0.1,
    parentId: frameId
  });

  // Footer branding
  objects.push({
    id: `footer-line-${frameId}`,
    type: 'rectangle',
    x: x + 40, y: y + 410,
    width: 720, height: 1,
    fill: colors.secondary,
    opacity: 0.1,
    parentId: frameId
  });

  objects.push({
    id: `footer-tag-${frameId}`,
    type: 'text',
    x: x + 40, y: y + 418,
    width: 300, height: 20,
    text: `PRO PRESENTATION | © 2026 | ${title.toUpperCase()}`,
    fontSize: 8,
    fill: colors.secondary,
    opacity: 0.5,
    parentId: frameId
  });

  // Main Content Types
  if (type === 'title') {
    objects.push({
      id: `hero-icon-${frameId}`,
      type: 'icon',
      x: x + 350, y: y + 80,
      width: 100, height: 100,
      iconName: ICONS[frameIndex % ICONS.length],
      fill: colors.primary,
      parentId: frameId
    });

    objects.push({
      id: `main-title-${frameId}`,
      type: 'text',
      x: x + 100, y: y + 200,
      width: 600, height: 80,
      text: title,
      fontSize: 52,
      fill: colors.primary,
      parentId: frameId
    });

    objects.push({
      id: `sub-title-${frameId}`,
      type: 'text',
      x: x + 100, y: y + 300,
      width: 600, height: 40,
      text: content,
      fontSize: 20,
      fill: colors.secondary,
      parentId: frameId
    });
  } else if (type === 'content') {
    objects.push({
      id: `head-${frameId}`,
      type: 'text',
      x: x + 50, y: y + 40,
      width: 500, height: 40,
      text: title,
      fontSize: 32,
      fill: colors.primary,
      parentId: frameId
    });

    const lines = content.split('\n');
    lines.forEach((line, i) => {
      objects.push({
        id: `bullet-${frameId}-${i}`,
        type: 'icon',
        x: x + 60, y: y + 110 + (i * 50),
        width: 20, height: 20,
        iconName: 'CheckCircle',
        fill: colors.accent,
        parentId: frameId
      });
      objects.push({
        id: `text-${frameId}-${i}`,
        type: 'text',
        x: x + 100, y: y + 110 + (i * 50),
        width: 450, height: 40,
        text: line,
        fontSize: 18,
        fill: colors.text,
        parentId: frameId
      });
    });

    objects.push({
      id: `side-card-${frameId}`,
      type: 'rectangle',
      x: x + 580, y: y + 80,
      width: 180, height: 280,
      fill: colors.shapes[1],
      opacity: 0.4,
      parentId: frameId
    });
  } else if (type === 'grid') {
    objects.push({
      id: `head-${frameId}`,
      type: 'text',
      x: x + 50, y: y + 40,
      width: 500, height: 40,
      text: title,
      fontSize: 32,
      fill: colors.primary,
      parentId: frameId
    });

    for (let i = 0; i < 4; i++) {
      const gx = x + 70 + (i % 2) * 350;
      const gy = y + 120 + Math.floor(i / 2) * 140;
      
      objects.push({
        id: `grid-item-${frameId}-${i}`,
        type: 'rectangle',
        x: gx, y: gy,
        width: 310, height: 110,
        fill: colors.shapes[0],
        opacity: 0.5,
        parentId: frameId
      });

      objects.push({
        id: `grid-icon-${frameId}-${i}`,
        type: 'icon',
        x: gx + 20, y: gy + 35,
        width: 40, height: 40,
        iconName: ICONS[(frameIndex + i) % ICONS.length],
        fill: colors.primary,
        parentId: frameId
      });

      objects.push({
        id: `grid-label-${frameId}-${i}`,
        type: 'text',
        x: gx + 80, y: gy + 45,
        width: 210, height: 30,
        text: `Key Metric ${i + 1}`,
        fontSize: 18,
        fill: colors.primary,
        parentId: frameId
      });
    }
  } else if (type === 'quote') {
    objects.push({
      id: `quote-mark-${frameId}`,
      type: 'text',
      x: x + 50, y: y + 100,
      width: 100, height: 100,
      text: '"',
      fontSize: 120,
      fill: colors.accent,
      opacity: 0.2,
      parentId: frameId
    });

    objects.push({
      id: `quote-text-${frameId}`,
      type: 'text',
      x: x + 100, y: y + 160,
      width: 600, height: 120,
      text: content,
      fontSize: 28,
      fill: colors.primary,
      parentId: frameId
    });

    objects.push({
      id: `quote-author-${frameId}`,
      type: 'text',
      x: x + 100, y: y + 300,
      width: 600, height: 30,
      text: `— ${title}`,
      fontSize: 20,
      fill: colors.secondary,
      parentId: frameId
    });
  } else if (type === 'feature') {
    objects.push({
      id: `feat-rect-${frameId}`,
      type: 'rectangle',
      x: x, y: y,
      width: 400, height: 450,
      fill: colors.primary,
      opacity: 0.05,
      parentId: frameId
    });

    objects.push({
      id: `feat-title-${frameId}`,
      type: 'text',
      x: x + 50, y: y + 150,
      width: 300, height: 60,
      text: title,
      fontSize: 36,
      fill: colors.primary,
      parentId: frameId
    });

    objects.push({
      id: `feat-icon-${frameId}`,
      type: 'icon',
      x: x + 450, y: y + 100,
      width: 250, height: 250,
      iconName: 'Zap',
      fill: colors.accent,
      opacity: 0.1,
      parentId: frameId
    });

    objects.push({
      id: `feat-desc-${frameId}`,
      type: 'text',
      x: x + 450, y: y + 150,
      width: 300, height: 100,
      text: content,
      fontSize: 22,
      fill: colors.text,
      parentId: frameId
    });
  }

  return objects;
};

export const generateTemplate = (id: string, name: string, category: string, colorKey: string, layout: 'linear' | 'spiral' | 'grid' | 'random' = 'spiral'): Template => {
  const colors = COLORS[colorKey] || COLORS['business'];
  const objects: any[] = [];
  const spacing = 1200;
  
  const frameConfigs = [
    { title: name, content: "Innovation & Excellence in Design\nPresented by Creative Team", type: 'title' as const },
    { title: "The Vision", content: "To redefine how teams collaborate spatially.\nBreaking linear boundaries.\nCreating immersive narratives.", type: 'content' as const },
    { title: "Market Growth", content: "Explosive growth in digital workspace tools.", type: 'grid' as const },
    { title: "Core Strategy", content: "User-Centric Discovery\nRapid Iterative Prototyping\nScalable Architecture\nGlobal Distribution", type: 'content' as const },
    { title: "Steve Jobs", content: "Innovation distinguishes between a leader and a follower.", type: 'quote' as const },
    { title: "Unique Advantage", content: "Our proprietary zoom engine allows for infinite detail without losing context.", type: 'feature' as const },
    { title: "Performance Data", content: "Efficiency increased by 40%.\nCost reduced by 25%.\nUser satisfaction at 98%.", type: 'grid' as const },
    { title: "Implementation", content: "Week 1: Audit\nWeek 2: Design\nWeek 3: Build\nWeek 4: Launch", type: 'content' as const },
    { title: "Next Chapter", content: "Join us in shaping the future of presentation.", type: 'title' as const },
    { title: "Q&A Session", content: "Open floor for discussions and feedback.", type: 'content' as const }
  ];

  frameConfigs.forEach((cfg, i) => {
    let x, y;
    if (layout === 'linear') {
      x = i * spacing;
      y = 0;
    } else if (layout === 'spiral') {
      x = Math.cos(i * 0.9) * i * spacing * 0.8;
      y = Math.sin(i * 0.9) * i * spacing * 0.8;
    } else if (layout === 'grid') {
      x = (i % 3) * spacing;
      y = Math.floor(i / 3) * spacing;
    } else {
      x = (Math.random() - 0.5) * spacing * 4;
      y = (Math.random() - 0.5) * spacing * 4;
    }
    
    objects.push(...createProfessionalFrame(id, i, cfg.title, cfg.content, cfg.type, colors, x, y));
  });

  return {
    id,
    name,
    category,
    description: `A professionally crafted ${name} template with ${frameConfigs.length} frames, premium typography, and non-linear spatial layout.`,
    framesCount: frameConfigs.length,
    estimatedDuration: 15,
    difficulty: 'Intermediate',
    popularity: 800 + Math.floor(Math.random() * 200),
    tags: [category.toLowerCase(), 'premium', 'high-impact', 'spatial'],
    thumbnail: '',
    objects
  };
};

export const TEMPLATES: Template[] = [
  // Business Category
  generateTemplate("biz-pro-01", "Corporate Strategy 2026", "Business", "business", "spiral"),
  generateTemplate("biz-pro-02", "Annual Executive Review", "Business", "minimal", "linear"),
  generateTemplate("biz-pro-03", "Global Expansion Roadmap", "Business", "dark", "grid"),
  generateTemplate("biz-pro-04", "Enterprise Sales Deck", "Business", "business", "spiral"),
  generateTemplate("biz-pro-05", "Management Consulting", "Business", "minimal", "spiral"),
  
  // Startup Category
  generateTemplate("start-pitch-01", "Unicorn Pitch Deck", "Startup", "startup", "random"),
  generateTemplate("start-pitch-02", "Series A Vision", "Startup", "modern", "spiral"),
  generateTemplate("start-pitch-03", "Product Hunt Launch", "Startup", "creative", "grid"),
  generateTemplate("start-pitch-04", "Growth Hacking Guide", "Startup", "marketing", "linear"),
  
  // Marketing Category
  generateTemplate("mkt-brand-01", "Brand Identity System", "Marketing", "creative", "spiral"),
  generateTemplate("mkt-brand-02", "Social Media Strategy", "Marketing", "marketing", "grid"),
  generateTemplate("mkt-brand-03", "Influencer Campaign", "Marketing", "modern", "random"),
  generateTemplate("mkt-brand-04", "Content Calendar 2026", "Marketing", "minimal", "linear"),
  
  // Creative Category
  generateTemplate("cre-port-01", "Visual Artist Portfolio", "Creative", "creative", "random"),
  generateTemplate("cre-port-02", "Agency Showreel", "Creative", "dark", "spiral"),
  generateTemplate("cre-port-03", "Design Sprint Workshop", "Creative", "modern", "grid"),
  generateTemplate("cre-port-04", "Future of NFT / Web3", "Creative", "dark", "random"),
  
  // Technology Category
  generateTemplate("tech-arch-01", "Cloud Infrastructure", "Technology", "dark", "grid"),
  generateTemplate("tech-arch-02", "AI Ethics & Future", "Technology", "modern", "spiral"),
  generateTemplate("tech-arch-03", "Cybersecurity Audit", "Technology", "business", "linear"),
  generateTemplate("tech-arch-04", "Mobile First Design", "Technology", "minimal", "spiral"),
  
  // Academic & Research
  generateTemplate("edu-res-01", "Thesis Presentation", "Education", "academic", "linear"),
  generateTemplate("edu-res-02", "Scientific Discovery", "Education", "academic", "grid"),
  generateTemplate("edu-res-03", "History Reimagined", "Education", "creative", "spiral"),
  generateTemplate("edu-res-04", "Psychology Insights", "Education", "minimal", "random"),
  
  // Lifestyle & Others
  generateTemplate("life-travel-01", "Digital Nomad Guide", "Lifestyle", "creative", "spiral"),
  generateTemplate("life-travel-02", "Health & Wellness", "Lifestyle", "startup", "grid"),
  generateTemplate("life-travel-03", "Culinary Arts Journey", "Lifestyle", "creative", "random"),
  generateTemplate("life-travel-04", "Sustainability Action", "Lifestyle", "startup", "linear"),
  generateTemplate("life-travel-05", "Architecture Trends", "Lifestyle", "minimal", "spiral")
];