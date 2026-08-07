import type { EditorDoc } from "./editor-store";

export interface TemplateDef {
  id: string;
  name: string;
  category: string;
  blurb: string;
  build: () => EditorDoc;
}

function doc(title: string, objects: any[], pages: EditorDoc["pages"]): EditorDoc {
  return { title, objects, pages, paths: [], bookmarks: [] };
}

const frame = (x: number, y: number) => ({ x, y, width: 960, height: 540 });

function simple(title: string, headline: string, sub: string, accent: "rect" | "circle"): EditorDoc {
  return doc(title, [], [
    { id: "t1", name: "Cover", frame: frame(60, 60), notes: "Open strong." },
    { id: "t2", name: "Points", frame: frame(120, 440), notes: "Walk the key points." },
    { id: "t3", name: "Data", frame: frame(620, 460), notes: "Land the evidence." },
  ]);
}

export const templates: TemplateDef[] = [
  { id: "business", name: "Business Review", category: "Business", blurb: "Quarterly narrative with metrics", build: () => simple("Business Review", "Q3 in one view", "Revenue, retention and the road ahead.", "rect") },
  { id: "education", name: "Lesson Plan", category: "Education", blurb: "Teach a concept by zooming in", build: () => simple("Lesson Plan", "Photosynthesis", "From sunlight to sugar, one zoom at a time.", "circle") },
  { id: "research", name: "Research Poster", category: "Research", blurb: "Abstract, method, findings", build: () => simple("Research Poster", "Findings", "Method, results and what they imply.", "rect") },
  { id: "pitch", name: "Pitch Deck", category: "Pitch Deck", blurb: "Problem, solution, ask", build: () => simple("Pitch Deck", "We fix the boring part", "A ten million dollar problem hiding in plain sight.", "circle") },
  { id: "mindmap", name: "Mind Map", category: "Mind Map", blurb: "Radial idea cluster", build: () => simple("Mind Map", "Central idea", "Branch outward, then zoom into each branch.", "circle") },
  { id: "infographic", name: "Infographic", category: "Infographic", blurb: "Numbers that carry the story", build: () => simple("Infographic", "By the numbers", "Three statistics, one conclusion.", "rect") },
  { id: "timeline", name: "Timeline", category: "Timeline", blurb: "Pan left to right through time", build: () => simple("Timeline", "How we got here", "Five moments that shaped the product.", "rect") },
  { id: "marketing", name: "Campaign Brief", category: "Marketing", blurb: "Audience, message, channels", build: () => simple("Campaign Brief", "Launch plan", "Who we reach, what we say, where we say it.", "circle") },
  { id: "training", name: "Training Module", category: "Training", blurb: "Step-by-step onboarding", build: () => simple("Training Module", "Day one", "Everything a new hire needs, in order.", "rect") },
  { id: "academic", name: "Academic Talk", category: "Academic", blurb: "Conference-ready structure", build: () => simple("Academic Talk", "Thesis", "Argument, evidence, counterpoint, conclusion.", "circle") },
];
