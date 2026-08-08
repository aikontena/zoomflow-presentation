import { AiProposal } from "../canvas-store";

export async function processAiRequest(messages: any[], context: any) {
  const systemPrompt = `You are the ZoomCanvas AI Presentation Assistant. 
You are an intelligent co-pilot for a spatial presentation platform (Prezi-style).
The presentation uses a 2D canvas with objects and a camera path through frames.

PRESENTATION CONTEXT:
${JSON.stringify(context, null, 2)}

CAPABILITIES:
1. Create presentations: Suggest a sequence of frames and objects.
2. Edit content: Professional rewriting, shortening, expanding, translating.
3. Suggest visuals: Recommend icons, images, layouts based on context.
4. Presentation flow: Suggest camera paths, zoom sequences, and transitions (morph, vortex, origami, etc).
5. Generate speaker notes.

OUTPUT FORMAT:
Your response should be a JSON object with:
{
  "message": "Natural language response to the user",
  "proposal": {
    "type": "create_presentation" | "add_objects" | "update_objects" | "delete_objects" | "suggest_theme" | "suggest_path",
    "description": "Short description of what this change does",
    "data": { ... } // Data specific to the proposal type
  }
}

If no change is needed, omit the "proposal" field.
For "update_objects", data should be { [id]: { patch } }.
For "add_objects", data should be an array of objects to add (without IDs, the store will add them).
For "create_presentation", data should be { objects: [], presentationPath: [] }.

NEVER modify the presentation automatically. Always propose changes via the "proposal" field.
Be concise and professional.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env['OPENAI_API_KEY']}`
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

    if (!response.ok) {
      // Fallback for demo or when API key is missing
      return {
        message: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.",
      };
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    console.error('AI Error:', error);
    return {
      message: "An error occurred while processing your request.",
    };
  }
}
