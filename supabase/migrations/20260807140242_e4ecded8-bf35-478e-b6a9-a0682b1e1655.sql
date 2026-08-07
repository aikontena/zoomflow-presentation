
-- Fix RLS Policies for AI Generator

-- ai_models: readable by all authenticated users
CREATE POLICY "Authenticated users can view active models" ON public.ai_models FOR SELECT TO authenticated USING (is_active = true);

-- ai_versions: readable by owner of the generation
CREATE POLICY "Users can view their own generation versions" ON public.ai_versions FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.ai_generations g
        JOIN public.ai_prompts p ON g.prompt_id = p.id
        WHERE g.id = generation_id AND p.user_id = auth.uid()
    )
);
