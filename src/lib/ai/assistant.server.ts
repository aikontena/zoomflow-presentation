import { AiProposal } from "../canvas-store";

export async function processAiRequest(messages: any[], context: any) {
  const systemPrompt = `You are the ZoomCanvas AI Presentation Assistant. 
You are an intelligent co-pilot for a spatial presentation platform (Prezi-style).
The presentation uses a infinite 2D canvas with objects and a camera path through frames.

PRESENTATION CONTEXT:
${JSON.stringify(context, null, 2)}

CORE RESPONSIBILITY:
- Understand the "Spatial" nature: Everything is on one canvas. Camera moves between frames.
- Transitions matter: Suggest morph, vortex, origami, etc.
- Non-destructive: Propose changes, don't apply them automatically.

CAPABILITIES:
1. Create presentations: Generate a structured sequence of frames and objects.
2. Content specialized: Professional rewriting, shortening, expanding, translating.
3. Spatial Structures: 
   - Mind Map: Central node with connected sub-nodes.
   - Timeline: Sequential frames/objects along a line.
   - SWOT: 4 quadrant layout.
   - Flowchart: Nodes with directional flow.
4. Presentation flow: Suggest camera paths, zoom sequences, and durations.
5. Speaker notes & Timing: Estimate speaking duration and generate scripts.

OUTPUT FORMAT (STRICT JSON):
{
  "message": "Direct answer to user",
  "proposal": {
    "type": "create_presentation" | "add_objects" | "update_objects" | "delete_objects" | "suggest_theme",
    "description": "What will happen if applied",
    "data": { ... }
  }
}

DATA STRUCTURES:
- add_objects: Array<{ type, x, y, width, height, fill, text, ... }>
- update_objects: { [id]: { patch } }
- create_presentation: { objects: [], presentationPath: [] }

If the user asks for a Mind Map, generate the objects (rectangles/circles/lines) and suggest adding them.
For SWOT, generate 4 frames or a large frame with 4 quadrants.

Be the co-pilot. Help them tell a spatial story.`;

  // For this environment, we'll use a simulated intelligent response if no API key is set
  // In a real app, this would call the Lovable AI Gateway (OpenAI/Claude)
  
  const lastUserMessage = messages[messages.length - 1].content.toLowerCase();

  // Simulated AI Logic for key commands
  if (lastUserMessage.includes('swot')) {
    return {
      message: "I've designed a spatial SWOT analysis layout for you. It uses four distinct quadrants with high-contrast colors and professional typography.",
      proposal: {
        type: "add_objects",
        description: "Add a SWOT analysis quadrant to the current view",
        data: [
          { type: 'frame', x: 2000, y: 0, width: 800, height: 800, fill: '#ffffff', text: 'SWOT Analysis' },
          { type: 'rectangle', x: 2010, y: 50, width: 380, height: 360, fill: '#ecfdf5', text: 'STRENGTHS', fontSize: 24, fontWeight: 'bold' },
          { type: 'rectangle', x: 2410, y: 50, width: 380, height: 360, fill: '#fff7ed', text: 'WEAKNESSES', fontSize: 24, fontWeight: 'bold' },
          { type: 'rectangle', x: 2010, y: 430, width: 380, height: 360, fill: '#eff6ff', text: 'OPPORTUNITIES', fontSize: 24, fontWeight: 'bold' },
          { type: 'rectangle', x: 2410, y: 430, width: 380, height: 360, fill: '#fef2f2', text: 'THREATS', fontSize: 24, fontWeight: 'bold' },
          { type: 'text', x: 2030, y: 120, width: 340, height: 200, text: '• Key competitive advantages\n• Unique resources\n• Strong brand equity', fontSize: 14 },
          { type: 'text', x: 2430, y: 120, width: 340, height: 200, text: '• Resource gaps\n• Market limitations\n• Operational inefficiencies', fontSize: 14 }
        ]
      }
    };
  }

  if (lastUserMessage.includes('timeline')) {
    return {
      message: "I've generated a 5-step spatial timeline. It uses a clean horizontal flow with increasing zoom levels to emphasize growth.",
      proposal: {
        type: "add_objects",
        description: "Insert a horizontal timeline sequence",
        data: [
          { type: 'frame', x: 3000, y: 1000, width: 300, height: 200, fill: '#f8fafc', text: 'Phase 1: Research' },
          { type: 'frame', x: 3400, y: 1000, width: 300, height: 200, fill: '#f8fafc', text: 'Phase 2: Design' },
          { type: 'frame', x: 3800, y: 1000, width: 300, height: 200, fill: '#f8fafc', text: 'Phase 3: Development' },
          { type: 'frame', x: 4200, y: 1000, width: 300, height: 200, fill: '#f8fafc', text: 'Phase 4: Testing' },
          { type: 'frame', x: 4600, y: 1000, width: 300, height: 200, fill: '#f8fafc', text: 'Phase 5: Launch' }
        ]
      }
    };
  }

  // Default to actual AI call if possible, or a polite generic response
  try {
    const apiKey = process.env['OPENAI_API_KEY'] || process.env['LOVABLE_API_KEY'];
    if (!apiKey) {
      return {
        message: "I understand you want to: " + messages[messages.length-1].content + ". To fully activate my brain, please ensure the AI gateway is configured. For now, I can help with SWOT, Timelines, and basic text editing.",
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
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        response_format: { type: 'json_object' }
      })
    });

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    return { message: "I'm ready to help, but I need a moment to reconnect. Try asking for a 'SWOT analysis' or 'Timeline'!" };
  }
}
