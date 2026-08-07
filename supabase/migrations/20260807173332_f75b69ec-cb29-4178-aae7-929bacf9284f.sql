
-- Enable RLS for template_categories
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Template categories are viewable by everyone" ON public.template_categories
    FOR SELECT USING (true);

-- Enable RLS for template_tags
ALTER TABLE public.template_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Template tags are viewable by everyone" ON public.template_tags
    FOR SELECT USING (true);
