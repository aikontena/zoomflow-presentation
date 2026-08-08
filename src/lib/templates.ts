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
  creative: { primary: '#F97316', secondary: '#FB923C', accent: '#FDBA74', bg: '#FFF7ED', text: '#7C2D12', shapes: ['#FFEDD5', '#FED7AA'] }
};

const ICONS = ['Briefcase', 'TrendingUp', 'Target', 'Users', 'Zap', 'Shield', 'Globe', 'Cpu', 'Layers', 'PieChart'];

const createProfessionalFrame = (
  templateId: string, 
  frameIndex: number, 
  title: string, 
  content: string, 
  type: 'title' | 'content' | 'chart' | 'image' | 'closing' | 'grid' | 'feature', 
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
      speakerNotes: `Key points for ${title}:\n1. Highlight the primary objective.\n2. Address potential questions about scalability.\n3. Transition to the next section smoothly.`
    }
  ];

  // 1. Background Accents (2-4 objects)
  objects.push({
    id: `acc-bg-${frameId}-1`,
    type: 'rectangle',
    x: x + 600, y: y,
    width: 200, height: 450,
    fill: colors.shapes[0],
    opacity: 0.3,
    parentId: frameId
  });

  objects.push({
    id: `acc-bg-${frameId}-2`,
    type: 'circle',
    x: x - 50, y: y - 50,
    width: 200, height: 200,
    fill: colors.accent,
    opacity: 0.05,
    parentId: frameId
  });

  // 2. Header/Footer Branding (2 objects)
  objects.push({
    id: `brand-line-${frameId}`,
    type: 'rectangle',
    x: x + 50, y: y + (type === 'title' ? 420 : 35),
    width: 700, height: 1,
    fill: colors.secondary,
    opacity: 0.2,
    parentId: frameId
  });

  objects.push({
    id: `footer-text-${frameId}`,
    type: 'text',
    x: x + 50, y: y + 425,
    width: 400, height: 20,
    text: `CONFIDENTIAL | ZOOMCANVAS PROFESSIONAL | PAGE ${frameIndex + 1}`,
    fontSize: 9,
    fill: colors.secondary,
    opacity: 0.6,
    parentId: frameId
  });

  // 3. Main Content
  if (type === 'title') {
    // Title Slide Graphics (Large Icon + Text)
    objects.push({
      id: `hero-icon-${frameId}`,
      type: 'icon',
      x: x + 550, y: y + 100,
      width: 200, height: 200,
      iconName: ICONS[frameIndex % ICONS.length],
      fill: colors.primary,
      opacity: 0.1,
      parentId: frameId
    });

    objects.push({
      id: `main-title-${frameId}`,
      type: 'text',
      x: x + 80, y: y + 140,
      width: 600, height: 100,
      text: title.toUpperCase(),
      fontSize: 56,
      fill: colors.primary,
      parentId: frameId
    });

    objects.push({
      id: `sub-title-${frameId}`,
      type: 'text',
      x: x + 80, y: y + 260,
      width: 500, height: 60,
      text: content,
      fontSize: 22,
      fill: colors.secondary,
      parentId: frameId
    });

    // Accent bars
    for (let i = 0; i < 3; i++) {
      objects.push({
        id: `accent-bar-${frameId}-${i}`,
        type: 'rectangle',
        x: x + 80 + (i * 120), y: y + 245,
        width: 100, height: 4,
        fill: colors.accent,
        opacity: 1 - (i * 0.3),
        parentId: frameId
      });
    }
  } else if (type === 'content') {
    // Content Slide Layout
    objects.push({
      id: `slide-head-${frameId}`,
      type: 'text',
      x: x + 50, y: y + 50,
      width: 600, height: 40,
      text: title,
      fontSize: 32,
      fill: colors.primary,
      parentId: frameId
    });

    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Bullet point icon
      objects.push({
        id: `bullet-${frameId}-${idx}`,
        type: 'icon',
        x: x + 50, y: y + 110 + (idx * 45),
        width: 16, height: 16,
        iconName: 'ChevronRight',
        fill: colors.accent,
        parentId: frameId
      });

      objects.push({
        id: `bullet-text-${frameId}-${idx}`,
        type: 'text',
        x: x + 80, y: y + 108 + (idx * 45),
        width: 400, height: 40,
        text: line,
        fontSize: 18,
        fill: colors.text,
        parentId: frameId
      });
    });

    // Side graphic for content slides
    objects.push({
      id: `side-box-${frameId}`,
      type: 'rectangle',
      x: x + 520, y: y + 100,
      width: 240, height: 280,
      fill: colors.shapes[1],
      opacity: 0.5,
      parentId: frameId
    });

    objects.push({
      id: `side-icon-${frameId}`,
      type: 'icon',
      x: x + 600, y: y + 140,
      width: 80, height: 80,
      iconName: ICONS[(frameIndex + 2) % ICONS.length],
      fill: colors.primary,
      parentId: frameId
    });

    objects.push({
      id: `side-caption-${frameId}`,
      type: 'text',
      x: x + 540, y: y + 240,
      width: 200, height: 100,
      text: "KEY INSIGHT: Data driven decisions lead to 25% better resource allocation.",
      fontSize: 14,
      fill: colors.primary,
      parentId: frameId
    });
  } else if (type === 'grid') {
    // 2x2 Grid Layout
    objects.push({
      id: `slide-head-${frameId}`,
      type: 'text',
      x: x + 50, y: y + 40,
      width: 600, height: 40,
      text: title,
      fontSize: 32,
      fill: colors.primary,
      parentId: frameId
    });

    const gridItems = [
      { label: "Market Growth", icon: "TrendingUp" },
      { label: "Team Synergy", icon: "Users" },
      { label: "Quick Delivery", icon: "Zap" },
      { label: "Global Reach", icon: "Globe" }
    ];

    gridItems.forEach((item, idx) => {
      const gx = x + 80 + (idx % 2) * 350;
      const gy = y + 120 + Math.floor(idx / 2) * 150;

      objects.push({
        id: `grid-bg-${frameId}-${idx}`,
        type: 'rectangle',
        x: gx, y: gy,
        width: 280, height: 120,
        fill: colors.shapes[0],
        opacity: 0.5,
        parentId: frameId
      });

      objects.push({
        id: `grid-icon-${frameId}-${idx}`,
        type: 'icon',
        x: gx + 20, y: gy + 30,
        width: 40, height: 40,
        iconName: item.icon,
        fill: colors.primary,
        parentId: frameId
      });

      objects.push({
        id: `grid-text-${frameId}-${idx}`,
        type: 'text',
        x: gx + 80, y: gy + 40,
        width: 180, height: 40,
        text: item.label,
        fontSize: 18,
        fill: colors.text,
        parentId: frameId
      });
    });
  } else if (type === 'feature') {
    // Large Feature Slide
    objects.push({
      id: `feat-rect-${frameId}`,
      type: 'rectangle',
      x: x + 50, y: y + 80,
      width: 700, height: 300,
      fill: colors.primary,
      opacity: 0.05,
      parentId: frameId
    });

    objects.push({
      id: `feat-icon-${frameId}`,
      type: 'icon',
      x: x + 350, y: y + 120,
      width: 100, height: 100,
      iconName: "Sparkles",
      fill: colors.accent,
      parentId: frameId
    });

    objects.push({
      id: `feat-title-${frameId}`,
      type: 'text',
      x: x + 100, y: y + 240,
      width: 600, height: 60,
      text: title,
      fontSize: 42,
      fill: colors.primary,
      parentId: frameId
    });

    objects.push({
      id: `feat-desc-${frameId}`,
      type: 'text',
      x: x + 150, y: y + 310,
      width: 500, height: 40,
      text: content,
      fontSize: 20,
      fill: colors.secondary,
      parentId: frameId
    });
  }

  return objects;
};

export const generateTemplate = (id: string, name: string, category: string, colorKey: keyof typeof COLORS): Template => {
  const colors = COLORS[colorKey];
  const objects: any[] = [];
  const spacing = 1200;
  
  const sections = [
    { title: name, content: "Strategic Analysis & 2026 Roadmap\nPresented by Creative Team", type: 'title' as const },
    { title: "Core Features", content: "AI Integration\nReal-time Collaboration\nZooming Engine\nCloud Persistence", type: 'grid' as const },
    { title: "Market Landscape", content: "Competitor analysis indicates gap in GenAI\nUser adoption increased by 200%\nMobile-first strategy is mandatory\nGlobal reach expanded to 45 countries", type: 'content' as const },
    { title: "Strategic Pillars", content: "Scalable Cloud Infrastructure\nHuman-Centric AI Design\nSustainable Growth Model\nSecurity by Design Principles", type: 'content' as const },
    { title: "Key Innovation", content: "Breaking boundaries with spatial presentation layouts.", type: 'feature' as const },
    { title: "Execution Plan", content: "Phase 1: Research & Discovery\nPhase 2: Rapid Prototyping\nPhase 3: Beta Launch & Feedback\nPhase 4: Global Scale Out", type: 'content' as const },
    { title: "Financial Summary", content: "Revenue Growth: +45% YoY\nCustomer LTV: $1,200\nAcquisition Cost: -$250\nNet Retention: 112%", type: 'content' as const },
    { title: "Next Steps", content: "Schedule Follow-up Meeting\nReview Q3 Objectives\nFinalize Budget Allocation\nApprove Technology Stack", type: 'content' as const }
  ];

  sections.forEach((sec, i) => {
    // Spiral layout for spatial effect
    const x = Math.cos(i * 0.8) * i * spacing;
    const y = Math.sin(i * 0.8) * i * spacing;
    objects.push(...createProfessionalFrame(id, i, sec.title, sec.content, sec.type, colors, x, y));
  });

  return {
    id,
    name,
    category,
    description: `A professionally designed ${name} presentation. Features custom brand colors, icons, and 30+ editable elements across a non-linear canvas.`,
    framesCount: sections.length,
    estimatedDuration: 18,
    difficulty: 'Intermediate',
    popularity: 900 + Math.floor(Math.random() * 100),
    tags: [category.toLowerCase(), 'professional', 'high-quality', 'presentation-ready'],
    thumbnail: '', // Thumbnail is now generated dynamically in the UI
    objects
  };
};

export const TEMPLATES: Template[] = [
  generateTemplate("business-proposal", "Business Proposal", "Business", "business"),
  generateTemplate("startup-pitch", "Startup Pitch Deck", "Startup Pitch", "startup"),
  generateTemplate("marketing-strategy", "Marketing Strategy", "Marketing", "marketing"),
  generateTemplate("company-profile", "Company Profile", "Business", "minimal"),
  generateTemplate("annual-report", "Annual Report 2026", "Financial Report", "business"),
  generateTemplate("research-presentation", "Research Findings", "Research", "academic"),
  generateTemplate("academic-conference", "Academic Conference", "Academic", "academic"),
  generateTemplate("lecture-template", "University Lecture", "Education", "academic"),
  generateTemplate("workshop-guide", "Innovation Workshop", "Workshop", "startup"),
  generateTemplate("training-module", "Employee Training", "Training", "business"),
  generateTemplate("project-timeline", "Project Roadmap", "Timeline", "minimal"),
  generateTemplate("financial-dashboard", "Financial Dashboard", "Financial Report", "dark"),
  generateTemplate("case-study", "Customer Case Study", "Marketing", "marketing"),
  generateTemplate("swot-analysis", "SWOT Analysis", "Business", "business"),
  generateTemplate("pestle-analysis", "PESTLE Framework", "Business", "business"),
  generateTemplate("modern-dark", "Executive Dark Theme", "Dark Theme", "dark"),
  generateTemplate("minimalist-white", "Clean Minimalist", "Minimal", "minimal"),
  generateTemplate("tech-overview", "Technology Stack", "Technology", "dark"),
  generateTemplate("product-launch", "Product Launch GTM", "Marketing", "marketing"),
  generateTemplate("sales-deck", "Enterprise Sales Deck", "Business", "business"),
  generateTemplate("hr-onboarding", "HR Onboarding", "Training", "minimal"),
  generateTemplate("strategy-roadmap", "2027 Strategy Roadmap", "Timeline", "startup"),
  generateTemplate("ux-research", "UX Research Insights", "Research", "minimal"),
  generateTemplate("data-analytics", "Data Analytics Review", "Research", "academic"),
  generateTemplate("investor-update", "Investor Monthly Update", "Investor Deck", "business"),
  generateTemplate("seminar-deck", "Expert Seminar Series", "Seminar", "academic"),
  generateTemplate("consulting-deck", "Management Consulting", "Business", "minimal"),
  generateTemplate("agency-pitch", "Creative Agency Pitch", "Creative", "marketing"),
  generateTemplate("software-arch", "Software Architecture", "Technology", "dark"),
  generateTemplate("digital-transform", "Digital Transformation", "Technology", "business")
];
