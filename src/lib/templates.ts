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

export const TEMPLATES: Template[] = Array.from({ length: 40 }).map((_, i) => ({
  id: `template-${i}`,
  name: i === 0 ? "Business Proposal" : i === 1 ? "Startup Pitch" : i === 2 ? "Academic Poster" : `Template ${i + 1}`,
  category: ['Business', 'Education', 'Creative', 'Research', 'Marketing'][i % 5],
  description: 'Professional layout for your next presentation with high impact visuals.',
  framesCount: 5 + (i % 5),
  estimatedDuration: 10 + (i % 20),
  difficulty: i % 3 === 0 ? 'Beginner' : i % 3 === 1 ? 'Intermediate' : 'Advanced',
  popularity: Math.floor(Math.random() * 100),
  tags: ['modern', 'dark', 'business'],
  thumbnail: `https://picsum.photos/seed/${i}/400/225`,
  objects: []
}));
