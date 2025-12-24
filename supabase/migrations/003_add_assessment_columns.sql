-- Migration: Add new columns to ar_assessments table
-- Description: Adds columns for image storage, AI analysis, and visualization

-- Add image_url column for storing original assessment images
ALTER TABLE public.ar_assessments 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add ai_analysis column for structured AI analysis results (separate from ai_analysis_result)
ALTER TABLE public.ar_assessments 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- Add analyzed_at timestamp for when AI analysis was completed
ALTER TABLE public.ar_assessments 
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;

-- Add visualization_url for AI-generated visualization images
ALTER TABLE public.ar_assessments 
ADD COLUMN IF NOT EXISTS visualization_url TEXT;

-- Add visualization_description for describing the generated visualization
ALTER TABLE public.ar_assessments 
ADD COLUMN IF NOT EXISTS visualization_description TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.ar_assessments.image_url IS 'URL to the original uploaded assessment image';
COMMENT ON COLUMN public.ar_assessments.ai_analysis IS 'Structured AI analysis results including room type, modifications, etc.';
COMMENT ON COLUMN public.ar_assessments.analyzed_at IS 'Timestamp when AI analysis was completed';
COMMENT ON COLUMN public.ar_assessments.visualization_url IS 'URL to the AI-generated visualization image';
COMMENT ON COLUMN public.ar_assessments.visualization_description IS 'Description of the AI-generated visualization';
