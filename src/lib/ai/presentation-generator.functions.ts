import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AIGeneratedPresentation, GenerationMetadata } from "./ai-types";

// Schema for the generation input
const generateSchema = z.object({
  prompt: z.string(),
  metadata: z.any(), // GenerationMetadata
  model: z.string().optional(),
});

export const generatePresentation = createServerFn({ method: "POST" })
  .inputValidator((data) => generateSchema.parse(data))
  .handler(async ({ data }) => {
    // In a real implementation, we would call the AI provider here.
    // For now, we simulate a response with a structured presentation.
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { prompt, metadata } = data;
    
    // Mock response following the requirements
    const result: AIGeneratedPresentation = {
      title: metadata.title || "AI Generated Presentation",
      subtitle: "Created by ZoomCanvas AI",
      frames: [
        {
          title: "Introduction",
          subtitle: "Overview of the topic",
          description: `An introduction to ${prompt}. This section covers the core objectives and what the audience will learn.`,
          speakerNotes: "Start by greeting the audience and introducing yourself. Hook them with a surprising fact related to the topic.",
          suggestedIcons: ["presentation", "lightbulb"],
          estimatedTime: "2 minutes"
        },
        {
          title: "Key Concepts",
          subtitle: "The foundations",
          description: "This frame explores the primary pillars of the subject matter, providing clear definitions and context.",
          speakerNotes: "Walk through each concept slowly. Use the visual placeholders to point out relationships between ideas.",
          suggestedIcons: ["database", "cpu"],
          estimatedTime: "5 minutes"
        },
        {
          title: "Deep Dive",
          subtitle: "Analyzing the details",
          description: "Technical details, data points, and specific examples that illustrate the concepts in action.",
          speakerNotes: "This is the most technical part. Encourage the audience to ask questions if they need clarification.",
          suggestedCharts: ["bar-chart", "pie-chart"],
          estimatedTime: "10 minutes"
        },
        {
          title: "Conclusion",
          subtitle: "Wrapping up",
          description: "A summary of the main points covered and the final takeaway for the audience.",
          speakerNotes: "Summarize the 3 most important things they should remember. End with a strong call to action.",
          suggestedIcons: ["check-circle"],
          estimatedTime: "3 minutes"
        }
      ],
      summary: "This presentation provides a comprehensive overview of the requested topic.",
      keyTakeaways: ["Understanding core pillars", "Practical applications", "Future outlook"]
    };
    
    return result;
  });
