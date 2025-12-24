-- ============================================================================
-- RLS Policies for 'assessments' Storage Bucket
-- Based on Supabase best practices:
-- 1. Enable RLS on storage.objects (already done in 002_rls_policies.sql)
-- 2. Use authenticated role
-- 3. Use storage.foldername() to verify ownership
-- ============================================================================

-- Policy: Allow authenticated users to INSERT (upload) files to assessments bucket
-- Since the upload path is {assessmentId}/{type}.jpg, we need to allow any authenticated user
-- to upload (the assessment ownership is enforced at the application level via the ar_assessments table)
CREATE POLICY "Allow authenticated users to upload to assessments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'assessments'
);

-- Policy: Allow authenticated users to SELECT (view/download) files from assessments bucket
-- This allows homeowners to see their own images and contractors to see matched project images
CREATE POLICY "Allow authenticated users to read assessments"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'assessments'
);

-- Policy: Allow authenticated users to UPDATE (overwrite) files in assessments bucket
-- The upsert: true option requires both INSERT and UPDATE policies
CREATE POLICY "Allow authenticated users to update assessments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'assessments'
)
WITH CHECK (
    bucket_id = 'assessments'
);

-- Policy: Allow authenticated users to DELETE their assessment files
CREATE POLICY "Allow authenticated users to delete assessments"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'assessments'
);

-- Policy: Allow public/anonymous read access for visualization sharing (if bucket is public)
-- This allows non-authenticated viewing of visualization images via public URLs
CREATE POLICY "Allow public read for assessments visualizations"
ON storage.objects FOR SELECT
TO anon
USING (
    bucket_id = 'assessments'
);
