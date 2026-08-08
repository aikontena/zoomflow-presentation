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

const CATEGORIES = [
  'Business', 'Education', 'Academic', 'Research', 'Training', 'Workshop', 
  'Marketing', 'Startup Pitch', 'Investor Deck', 'Project Proposal', 
  'Seminar', 'Conference', 'Timeline', 'Mind Map', 'Flowchart', 
  'Infographic', 'Portfolio', 'Resume', 'Financial Report', 'Government', 
  'Technology', 'Healthcare', 'Legal', 'Creative', 'Minimal', 'Modern', 'Dark Theme'
];

export const TEMPLATES: Template[] = Array.from({ length: 40 }).map((_, i) => {
  const diffs: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];
  return {
    id: `template-${i}`,
    name: [
      "Business Proposal", "Startup Pitch", "Sales Presentation", "Company Profile", 
      "Annual Report", "Marketing Strategy", "Project Timeline", "Research Presentation",
      "Journal Article", "Thesis Defense", "Seminar", "Workshop", "Lecture Notes",
      "Training Course", "SWOT Analysis", "PESTLE Analysis", "Business Model Canvas",
      "Project Charter", "Product Launch", "Roadmap", "Case Study", "Meeting Presentation",
      "Portfolio", "Resume", "Academic Poster", "Mind Map", "Timeline", "Flowchart",
      "Infographic", "Process Diagram", "Healthcare Report", "Government Briefing",
      "Financial Dashboard", "Technology Overview", "Software Architecture",
      "Educational Lesson", "Course Outline", "Data Analysis", "AI Presentation",
      "Digital Transformation"
    ][i] || `Template ${i + 1}`,
    category: CATEGORIES[i % CATEGORIES.length]!,
    description: 'Professional layout for your next presentation with high impact visuals and structured content placeholders.',
    framesCount: 5 + (i % 8),
    estimatedDuration: 10 + (i % 15),
    difficulty: diffs[i % 3]!,
    popularity: Math.floor(Math.random() * 1000),
    tags: ['modern', 'presentation', CATEGORIES[i % CATEGORIES.length]!.toLowerCase()],
    thumbnail: `https://picsum.photos/seed/${i + 100}/800/450`,
    objects: [
      {
        id: `f-${i}-1`,
        type: 'frame',
        x: 0,
        y: 0,
        width: 800,
        height: 450,
        rotation: 0,
        fill: '#ffffff',
        text: 'Title Slide'
      },
      {
        id: `t-${i}-1`,
        type: 'text',
        x: 200,
        y: 150,
        width: 400,
        height: 80,
        rotation: 0,
        fill: '#1E293B',
        text: i === 0 ? "BUSINESS PROPOSAL" : "TEMPLATE TITLE",
        fontSize: 48,
        parentId: `f-${i}-1`
      },
      {
        id: `r-${i}-1`,
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 600,
        height: 250,
        rotation: 0,
        fill: '#3B82F6',
        opacity: 0.1,
        parentId: `f-${i}-1`
      }
    ]
  };
});
