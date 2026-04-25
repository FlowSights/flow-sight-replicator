-- Create ads_campaigns table
CREATE TABLE IF NOT EXISTS public.ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'meta', 'tiktok', 'linkedin')),
  type TEXT NOT NULL CHECK (type IN ('search', 'visual')),
  ads JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for user_id for faster queries
CREATE INDEX idx_ads_campaigns_user_id ON public.ads_campaigns(user_id);
CREATE INDEX idx_ads_campaigns_created_at ON public.ads_campaigns(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ads_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON public.ads_campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own campaigns
CREATE POLICY "Users can insert own campaigns"
  ON public.ads_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own campaigns
CREATE POLICY "Users can update own campaigns"
  ON public.ads_campaigns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns"
  ON public.ads_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER ads_campaigns_set_updated_at
  BEFORE UPDATE ON public.ads_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
