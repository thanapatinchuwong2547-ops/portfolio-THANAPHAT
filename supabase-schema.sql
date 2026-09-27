-- =========================================================================
-- Supabase Schema for Thanaphat Portfolio (นายธนภัทร อินทร์ชูวงศ์)
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================================

-- 1. Create table for portfolio JSON document
CREATE TABLE IF NOT EXISTS public.portfolio_data (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for visitors)
DROP POLICY IF EXISTS "Allow public read" ON public.portfolio_data;
CREATE POLICY "Allow public read" 
ON public.portfolio_data 
FOR SELECT 
USING (true);

-- Allow public write / upsert for portfolio owner
DROP POLICY IF EXISTS "Allow public upsert" ON public.portfolio_data;
CREATE POLICY "Allow public upsert" 
ON public.portfolio_data 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Enable Supabase Realtime for instant multi-device syncing
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_data;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Optional: Create storage bucket for media assets (images, videos, fonts, docs)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio_assets', 'portfolio_assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public asset upload" ON storage.objects;
CREATE POLICY "Allow public asset upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolio_assets');

DROP POLICY IF EXISTS "Allow public asset select" ON storage.objects;
CREATE POLICY "Allow public asset select" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio_assets');

DROP POLICY IF EXISTS "Allow public asset update" ON storage.objects;
CREATE POLICY "Allow public asset update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'portfolio_assets');

DROP POLICY IF EXISTS "Allow public asset delete" ON storage.objects;
CREATE POLICY "Allow public asset delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'portfolio_assets');