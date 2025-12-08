-- Fix for infinite RLS recursion in projects/project_leads policies
-- Run this in your Supabase Dashboard SQL Editor

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Contractors can view matched projects" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can view leads for their projects" ON public.project_leads;
DROP POLICY IF EXISTS "Allow authenticated users to create reviews" ON public.reviews;

-- Step 2: Create helper functions with SECURITY DEFINER to bypass RLS during checks
CREATE OR REPLACE FUNCTION public.is_project_homeowner(p_project_id uuid, p_user_id uuid) RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id AND homeowner_id = p_user_id);
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.contractor_has_project_lead(p_project_id uuid, p_contractor_id uuid) RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM public.project_leads WHERE project_id = p_project_id AND contractor_id = p_contractor_id);
$$ LANGUAGE sql SECURITY DEFINER;

-- Step 3: Recreate policies using the helper functions (breaks the circular dependency)
CREATE POLICY "Contractors can view matched projects" ON public.projects FOR SELECT USING (
    contractor_has_project_lead(id, auth.uid())
);

CREATE POLICY "Homeowners can view leads for their projects" ON public.project_leads FOR SELECT USING (
    is_project_homeowner(project_id, auth.uid())
);

CREATE POLICY "Allow authenticated users to create reviews" ON public.reviews FOR INSERT WITH CHECK (
    (public.get_user_role() = 'HOMEOWNER' AND is_project_homeowner(project_id, auth.uid()))
    OR
    (public.get_user_role() = 'CONTRACTOR' AND contractor_has_project_lead(project_id, auth.uid()))
);
