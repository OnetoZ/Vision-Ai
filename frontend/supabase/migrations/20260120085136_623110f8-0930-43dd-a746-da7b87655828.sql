-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create competitors table
CREATE TABLE public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  industry TEXT DEFAULT 'Web Agency',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  metadata JSONB DEFAULT '{}',
  scan_frequency TEXT DEFAULT 'weekly' CHECK (scan_frequency IN ('daily', 'weekly', 'monthly')),
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create competitor_scans table for scan results
CREATE TABLE public.competitor_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  pricing_data JSONB DEFAULT '{}',
  seo_metrics JSONB DEFAULT '{}',
  content_analysis JSONB DEFAULT '{}',
  raw_content TEXT,
  changes_detected JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create seo_gaps table for gap analysis
CREATE TABLE public.seo_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_scan_id UUID NOT NULL REFERENCES public.competitor_scans(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'ignored')),
  impact_score INTEGER DEFAULT 50 CHECK (impact_score >= 0 AND impact_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ai_insights table for AI-generated recommendations
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('opportunity', 'threat', 'trend', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_items JSONB DEFAULT '[]',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user owns a competitor
CREATE OR REPLACE FUNCTION public.is_competitor_owner(competitor_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.competitors
    WHERE id = competitor_id_param AND user_id = auth.uid()
  )
$$;

-- Helper function to check if user owns a scan
CREATE OR REPLACE FUNCTION public.is_scan_owner(scan_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.competitor_scans cs
    JOIN public.competitors c ON cs.competitor_id = c.id
    WHERE cs.id = scan_id_param AND c.user_id = auth.uid()
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for competitors
CREATE POLICY "Users can view their own competitors"
  ON public.competitors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own competitors"
  ON public.competitors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitors"
  ON public.competitors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitors"
  ON public.competitors FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for competitor_scans
CREATE POLICY "Users can view scans of their competitors"
  ON public.competitor_scans FOR SELECT
  USING (public.is_competitor_owner(competitor_id));

CREATE POLICY "Users can create scans for their competitors"
  ON public.competitor_scans FOR INSERT
  WITH CHECK (public.is_competitor_owner(competitor_id));

CREATE POLICY "Users can update scans of their competitors"
  ON public.competitor_scans FOR UPDATE
  USING (public.is_scan_owner(id));

CREATE POLICY "Users can delete scans of their competitors"
  ON public.competitor_scans FOR DELETE
  USING (public.is_scan_owner(id));

-- RLS Policies for seo_gaps
CREATE POLICY "Users can view gaps from their scans"
  ON public.seo_gaps FOR SELECT
  USING (public.is_scan_owner(competitor_scan_id));

CREATE POLICY "Users can create gaps for their scans"
  ON public.seo_gaps FOR INSERT
  WITH CHECK (public.is_scan_owner(competitor_scan_id));

CREATE POLICY "Users can update gaps from their scans"
  ON public.seo_gaps FOR UPDATE
  USING (public.is_scan_owner(competitor_scan_id));

CREATE POLICY "Users can delete gaps from their scans"
  ON public.seo_gaps FOR DELETE
  USING (public.is_scan_owner(competitor_scan_id));

-- RLS Policies for ai_insights
CREATE POLICY "Users can view their own insights"
  ON public.ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
  ON public.ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.ai_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
  ON public.ai_insights FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON public.competitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();