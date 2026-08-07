
-- AI Presentation Generator Tables

-- AI Providers / Models configuration
CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- 'openai', 'google', 'anthropic', etc.
    model_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Prompts used for generations
CREATE TABLE IF NOT EXISTS public.ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_text TEXT NOT NULL,
    metadata JSONB, -- Goal, Audience, Language, Style, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Generations history
CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES public.ai_prompts(id) ON DELETE SET NULL,
    presentation_id TEXT, -- Reference to the presentation / project
    model_id UUID REFERENCES public.ai_models(id),
    generated_content JSONB NOT NULL, -- The structured JSON of the presentation
    status TEXT DEFAULT 'completed', -- 'processing', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Versions of generations for restore
CREATE TABLE IF NOT EXISTS public.ai_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation_id UUID REFERENCES public.ai_generations(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_models TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_generations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_versions TO authenticated;

GRANT ALL ON public.ai_models TO service_role;
GRANT ALL ON public.ai_prompts TO service_role;
GRANT ALL ON public.ai_generations TO service_role;
GRANT ALL ON public.ai_versions TO service_role;

-- RLS
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_versions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own prompts" ON public.ai_prompts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own prompts" ON public.ai_prompts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own generations" ON public.ai_generations FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.ai_prompts WHERE id = prompt_id AND user_id = auth.uid())
);

-- Seeding some default models
INSERT INTO public.ai_models (provider, model_name, display_name) VALUES
('openai', 'gpt-4o', 'GPT-4o'),
('openai', 'gpt-4o-mini', 'GPT-4o Mini'),
('google', 'gemini-1.5-pro', 'Gemini 1.5 Pro'),
('google', 'gemini-1.5-flash', 'Gemini 1.5 Flash'),
('anthropic', 'claude-3-5-sonnet-20240620', 'Claude 3.5 Sonnet');
