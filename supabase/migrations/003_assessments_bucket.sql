-- Create assessments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assessments', 'assessments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for assessments bucket
-- Policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated users to upload assessments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assessments'
);

-- Policy: Allow authenticated users to read all assessments (for sharing with contractors)
CREATE POLICY "Allow authenticated users to read assessments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'assessments'
);

-- Policy: Allow authenticated users to update their own assessments
CREATE POLICY "Allow authenticated users to update own assessments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assessments' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow public read access for visualization sharing
CREATE POLICY "Allow public read for assessments"
ON storage.objects FOR SELECT
TO anon
USING (
  bucket_id = 'assessments'
);
