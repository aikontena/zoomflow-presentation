import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string(),
  context: z.object({
    presentationTitle: z.string(),
    currentFrame: z.any().optional(),
    selectedObjects: z.array(z.any()).optional(),
    history: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
  }),
});

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((data) => chatSchema.parse(data))
  .handler(async ({ data }) => {
    // Simulated AI response for the chat assistant
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { message } = data;
    
    // Simple logic to mock different responses
    if (message.toLowerCase().includes("rewrite")) {
      return {
        reply: "I've rewritten the content for this frame to be more professional. Would you like to apply these changes?",
        suggestion: { type: 'rewrite', content: "New improved professional content..." }
      };
    }
    
    return {
      reply: `I understand you're asking about "${message}". As an AI assistant for your presentation "${data.context.presentationTitle}", I can help you refine your frames, suggest visuals, or expand on your talking points. What would you like to do next?`
    };
  });
