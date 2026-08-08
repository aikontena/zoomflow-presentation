import { AiProposal } from "../canvas-store";

export async function processAiRequest(messages: any[], context: any) {
  const lastUserMessage = messages[messages.length - 1].content.toLowerCase();

  // Optimized System Prompt for better Spatial understanding
  const systemPrompt = `You are the ZoomCanvas AI Presentation Assistant (v4). 
You are an intelligent co-pilot for a spatial presentation platform.
Everything is on one infinite 2D canvas. Camera moves between frames.

PRESENTATION CONTEXT:
${JSON.stringify(context, null, 2)}

CORE MISSION:
- Understand Spatial Narrative: Propose non-linear layouts (Mind Maps, Timelines, Hub-and-Spoke).
- Content Mastery: Rewrite for tone, summarize, or translate while preserving intent.
- Technical Precision: Use transitions like 'morph', 'vortex', 'origami', 'cinematic'.
- SAFETY: NEVER modify directly. Propose via the "proposal" field.

OUTPUT FORMAT (JSON ONLY):
{
  "message": "Direct, professional response to the user.",
  "proposal": {
    "type": "create_presentation" | "add_objects" | "update_objects" | "delete_objects" | "suggest_theme",
    "description": "Short explanation of the proposed changes.",
    "data": { ... }
  }
}

DATA SCHEMAS:
- add_objects: Array of object templates (no id needed).
- update_objects: Map of id to property patches.
- create_presentation: { objects: [], presentationPath: [] }.

OBJECT TYPES: "rectangle" | "circle" | "text" | "image" | "frame" | "icon" | "video".`;

  // 1. High-speed local handlers for core spatial structures
  if (lastUserMessage.includes('swot')) {
    return {
      message: "I've designed a spatial SWOT analysis layout. It uses themed quadrants to visually separate Strengths, Weaknesses, Opportunities, and Threats.",
      proposal: {
        type: "add_objects",
        description: "Add a 4-quadrant SWOT analysis structure",
        data: [
          { type: 'frame', x: 2000, y: 0, width: 850, height: 850, fill: '#ffffff', text: 'SWOT ANALYSIS' },
          { type: 'rectangle', x: 2020, y: 60, width: 400, height: 360, fill: '#f0fdf4', stroke: '#166534', strokeWidth: 1, text: 'STRENGTHS', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
          { type: 'rectangle', x: 2430, y: 60, width: 400, height: 360, fill: '#fff7ed', stroke: '#9a3412', strokeWidth: 1, text: 'WEAKNESSES', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
          { type: 'rectangle', x: 2020, y: 430, width: 400, height: 360, fill: '#eff6ff', stroke: '#1e40af', strokeWidth: 1, text: 'OPPORTUNITIES', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
          { type: 'rectangle', x: 2430, y: 430, width: 400, height: 360, fill: '#fef2f2', stroke: '#991b1b', strokeWidth: 1, text: 'THREATS', fontSize: 28, fontWeight: 'bold', textAlign: 'center' }
        ]
      }
    };
  }

  if (lastUserMessage.includes('mind map')) {
    return {
      message: "I've generated a radial Mind Map structure. It places your core idea in the center with connected satellite topics in a spatial orbit.",
      proposal: {
        type: "add_objects",
        description: "Insert a radial Mind Map layout",
        data: [
          { type: 'circle', x: 2000, y: 2000, width: 300, height: 300, fill: '#3b82f6', text: 'CORE IDEA', fontSize: 24, fontWeight: 'bold' },
          { type: 'circle', x: 1600, y: 1800, width: 200, height: 200, fill: '#60a5fa', text: 'Topic A', fontSize: 18 },
          { type: 'circle', x: 2400, y: 1800, width: 200, height: 200, fill: '#60a5fa', text: 'Topic B', fontSize: 18 },
          { type: 'circle', x: 1600, y: 2200, width: 200, height: 200, fill: '#60a5fa', text: 'Topic C', fontSize: 18 },
          { type: 'circle', x: 2400, y: 2200, width: 200, height: 200, fill: '#60a5fa', text: 'Topic D', fontSize: 18 },
          { type: 'frame', x: 1500, y: 1700, width: 1300, height: 800, fill: '#f8fafc', text: 'MIND MAP OVERVIEW' }
        ]
      }
    };
  }

  // 2. Fallback to API Gateway
  try {
    const apiKey = process.env['OPENAI_API_KEY'] || process.env['LOVABLE_API_KEY'];
    if (!apiKey) {
      return {
        message: "I can help you build presentations, structure SWOT analysis, create mind maps, or refine your text. To unlock my full potential (Google/OpenAI), please connect an AI provider in Settings.",
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        response_format: { type: 'json_object' }
      })
    });

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    return { 
      message: "I'm experiencing a temporary connection issue, but I'm still here! I can currently help with 'SWOT', 'Mind Map', or 'Timeline' structures locally.",
    };
  }
}
