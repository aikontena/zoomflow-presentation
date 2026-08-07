
-- Create template categories table
CREATE TABLE public.template_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.template_categories TO authenticated;
GRANT SELECT ON public.template_categories TO anon;
GRANT ALL ON public.template_categories TO service_role;

-- Create templates table
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category_id UUID REFERENCES public.template_categories(id),
    frame_count INTEGER DEFAULT 0,
    estimated_duration INTEGER DEFAULT 0,
    difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    popularity INTEGER DEFAULT 0,
    data JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.templates TO authenticated;
GRANT SELECT ON public.templates TO anon;
GRANT ALL ON public.templates TO service_role;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by everyone" ON public.templates
    FOR SELECT USING (is_public = true);

-- Create template tags table
CREATE TABLE public.template_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.template_tags TO authenticated;
GRANT SELECT ON public.template_tags TO anon;
GRANT ALL ON public.template_tags TO service_role;

-- Create template favorites table
CREATE TABLE public.template_favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, template_id)
);

GRANT SELECT, INSERT, DELETE ON public.template_favorites TO authenticated;
GRANT ALL ON public.template_favorites TO service_role;
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" ON public.template_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Create template usage table
CREATE TABLE public.template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT ON public.template_usage TO authenticated;
GRANT ALL ON public.template_usage TO service_role;
ALTER TABLE public.template_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" ON public.template_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Seed some categories
INSERT INTO public.template_categories (name) VALUES 
('Business'), ('Education'), ('Academic'), ('Research'), ('Training'), 
('Workshop'), ('Marketing'), ('Startup Pitch'), ('Investor Deck'), 
('Project Proposal'), ('Seminar'), ('Conference'), ('Timeline'), 
('Mind Map'), ('Flowchart'), ('Infographic'), ('Portfolio'), ('Resume'), 
('Financial Report'), ('Government'), ('Technology'), ('Healthcare'), 
('Legal'), ('Creative'), ('Minimal'), ('Modern'), ('Dark Theme');
