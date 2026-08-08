import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { processAiRequest } from "./assistant.server";

export const askAiAssistant = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    messages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string()
    })),
    context: z.object({
      presentationTitle: z.string().optional(),
      objects: z.array(z.any()),
      presentationPath: z.array(z.string()),
      selectedObjectIds: z.array(z.string()),
      theme: z.any().optional()
    })
  }).parse(data))
  .handler(async ({ data }) => {
    return processAiRequest(data.messages, data.context);
  });
