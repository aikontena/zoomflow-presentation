import { createShapeId, toRichText, type TLEditorSnapshot } from "tldraw";
import type { Page, CanvasBackground } from "./editor-store";

export interface TemplateDef {
  id: string;
  name: string;
  category: string;
  blurb: string;
  build: () => {
    title: string;
    pages: Page[];
    background: CanvasBackground;
    snapshot: TLEditorSnapshot;
  };
}

const frame = (id: string, name: string, x: number, y: number): Page => ({
  id,
  name,
  frame: { x, y, width: 960, height: 540 },
  notes: "",
  transition: 'zoom',
  duration: 1000,
  preset: 'cinematic'
});

function createColorfulSnapshot(title: string, headline: string, sub: string, color: string): TLEditorSnapshot {
  const titleId = createShapeId();
  const subId = createShapeId();
  const rectId = createShapeId();
  
  return {
    store: {
      ['page:page']: {
        id: 'page:page',
        typeName: 'page',
        name: 'Page 1',
        index: 'a1',
        meta: {},
      },
      [titleId]: {
        id: titleId,
        typeName: 'shape',
        type: 'text',
        x: 100,
        y: 100,
        props: { text: headline, font: 'draw', size: 'l', color: 'black' },
        index: 'a1',
        parentId: 'page:page' as any,
      },
      [subId]: {
        id: subId,
        typeName: 'shape',
        type: 'text',
        x: 100,
        y: 200,
        props: { text: sub, font: 'sans', size: 'm', color: 'grey' },
        index: 'a2',
        parentId: 'page:page' as any,
      },
      [rectId]: {
        id: rectId,
        typeName: 'shape',
        type: 'geo',
        x: 80,
        y: 80,
        props: { geo: 'rectangle', w: 800, h: 400, color: color as any, fill: 'semi' as any },
        index: 'a0',
        parentId: 'page:page' as any,
      }
    } as any,
    schema: { schemaVersion: 2, sequences: {}, storeVersions: {} } as any
  } as unknown as TLEditorSnapshot;
}

export const templates: TemplateDef[] = [
  { 
    id: "business", 
    name: "Business Review", 
    category: "Business", 
    blurb: "Colorful quarterly metrics", 
    build: () => ({
      title: "Business Review",
      background: "light-grid",
      pages: [frame("p1", "Cover", 0, 0)],
      snapshot: createColorfulSnapshot("Business", "Quarterly Review", "Revenue is up 20% YoY. Key metrics are looking strong.", "blue")
    })
  },
  { 
    id: "pitch", 
    name: "Pitch Deck", 
    category: "Pitch Deck", 
    blurb: "Vibrant startup story", 
    build: () => ({
      title: "Pitch Deck",
      background: "white",
      pages: [frame("p1", "The Problem", 0, 0)],
      snapshot: createColorfulSnapshot("Pitch", "Solving the Gap", "A $10B market opportunity hiding in plain sight.", "orange")
    })
  },
  { 
    id: "marketing", 
    name: "Campaign Brief", 
    category: "Marketing", 
    blurb: "Creative launch strategy", 
    build: () => ({
      title: "Campaign Brief",
      background: "plain",
      pages: [frame("p1", "Campaign Goal", 0, 0)],
      snapshot: createColorfulSnapshot("Marketing", "Summer Launch 2026", "Reaching 1M new users through viral loops.", "violet")
    })
  }
];
