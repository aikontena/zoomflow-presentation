export type AIProvider = 'openai' | 'google' | 'anthropic' | 'openrouter';

export interface GenerationMetadata {
  title: string;
  goal?: string;
  audience?: string;
  language?: string;
  length?: 'short' | 'medium' | 'long';
  educationLevel?: string;
  presentationStyle?: string;
  visualStyle?: string;
  tone?: string;
  presentationType?: string;
  speakerExperience?: string;
  additionalInstructions?: string;
}

export interface AIGeneratedFrame {
  title: string;
  subtitle?: string;
  description: string;
  visualSuggestions?: string;
  speakerNotes: string;
  suggestedIcons?: string[];
  suggestedImages?: string[];
  suggestedCharts?: string[];
  estimatedTime?: string;
  layoutType?: string;
}

export interface AIGeneratedPresentation {
  title: string;
  subtitle?: string;
  frames: AIGeneratedFrame[];
  summary?: string;
  learningOutcomes?: string[];
  keyTakeaways?: string[];
}
