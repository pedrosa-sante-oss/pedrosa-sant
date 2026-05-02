
-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialty TEXT NOT NULL,
  room_interest TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'novo'
);

-- Create site_content table
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for leads: anon can insert, authenticated can do everything
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (true);

-- RLS for site_content: anyone can read, authenticated can update
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
  ON public.site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update site content"
  ON public.site_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert site content"
  ON public.site_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert initial site content
INSERT INTO public.site_content (section, key, value) VALUES
  ('home', 'hero_title', 'O padrão não é um diferencial, é o nosso padrão'),
  ('home', 'hero_subtitle', 'Espaço premium para profissionais de saúde autônomos. Fase final de construção.'),
  ('home', 'conceito_text', 'A Pedrosa Santé nasceu do compromisso de oferecer um espaço que transcende o convencional. Aqui, cada detalhe foi pensado para que o profissional de saúde autônomo tenha à disposição um ambiente que reflete excelência, humanização e sofisticação. Não somos mercadoria — somos marca.');
