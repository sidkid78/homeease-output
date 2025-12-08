-- Helper function to get the authenticated user's role
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS public.user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if a user is the homeowner of a project (bypasses RLS to prevent recursion)
CREATE OR REPLACE FUNCTION public.is_project_homeowner(p_project_id uuid, p_user_id uuid) RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id AND homeowner_id = p_user_id);
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if a contractor has a lead for a project (bypasses RLS to prevent recursion)
CREATE OR REPLACE FUNCTION public.contractor_has_project_lead(p_project_id uuid, p_contractor_id uuid) RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM public.project_leads WHERE project_id = p_project_id AND contractor_id = p_contractor_id);
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view their own profile
CREATE POLICY "Allow individual read access" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Policy: Allow authenticated users to update their own profile
CREATE POLICY "Allow individual update access" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy: Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (get_user_role() = 'ADMIN');

-- RLS for homeowner_profiles table
ALTER TABLE public.homeowner_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Homeowners can view and update their own profile
CREATE POLICY "Homeowners can manage own profile" ON public.homeowner_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS for contractor_profiles table
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Contractors can view and update their own profile
CREATE POLICY "Contractors can manage own profile" ON public.contractor_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy: All authenticated users can view public contractor profiles
CREATE POLICY "All authenticated users can view contractor profiles" ON public.contractor_profiles FOR SELECT TO authenticated USING (true);

-- RLS for ar_assessments table
ALTER TABLE public.ar_assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Homeowners can manage their own AR assessments
CREATE POLICY "Homeowners can manage own AR assessments" ON public.ar_assessments FOR ALL USING (auth.uid() = homeowner_id) WITH CHECK (auth.uid() = homeowner_id);

-- RLS for projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Homeowners can manage their own projects
CREATE POLICY "Homeowners can manage own projects" ON public.projects FOR ALL USING (auth.uid() = homeowner_id) WITH CHECK (auth.uid() = homeowner_id);

-- Policy: Contractors can view projects they are matched to (uses helper function to avoid RLS recursion)
CREATE POLICY "Contractors can view matched projects" ON public.projects FOR SELECT USING (
    contractor_has_project_lead(id, auth.uid())
);

-- RLS for project_leads table
ALTER TABLE public.project_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Homeowners can view leads for their projects (uses helper function to avoid RLS recursion)
CREATE POLICY "Homeowners can view leads for their projects" ON public.project_leads FOR SELECT USING (
    is_project_homeowner(project_id, auth.uid())
);

-- Policy: Contractors can view and update leads assigned to them
CREATE POLICY "Contractors can manage own leads" ON public.project_leads FOR ALL USING (auth.uid() = contractor_id) WITH CHECK (auth.uid() = contractor_id);

-- RLS for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments (as payer or payee)
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
    auth.uid() = payer_id OR auth.uid() = payee_id
);

-- Policy: Users can insert payments (Stripe webhook)
CREATE POLICY "Allow payment insertion via webhook" ON public.payments FOR INSERT WITH CHECK (true);

-- RLS for reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can create reviews for projects they are involved in (uses helper functions to avoid RLS recursion)
CREATE POLICY "Allow authenticated users to create reviews" ON public.reviews FOR INSERT WITH CHECK (
    (get_user_role() = 'HOMEOWNER' AND is_project_homeowner(project_id, auth.uid()))
    OR
    (get_user_role() = 'CONTRACTOR' AND contractor_has_project_lead(project_id, auth.uid()))
);

-- Policy: Users can view reviews they made or received
CREATE POLICY "Users can view own or received reviews" ON public.reviews FOR SELECT USING (
    auth.uid() = reviewer_id OR auth.uid() = reviewed_id
);

-- RLS for storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view profile_pictures bucket
CREATE POLICY "Allow authenticated to view profile_pictures bucket" ON storage.buckets FOR SELECT USING (name = 'profile_pictures' AND auth.role() = 'authenticated');

-- RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload their own profile pictures
CREATE POLICY "Allow authenticated users to upload own profile pics" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'profile_pictures' AND auth.uid()::text = owner
);

-- Policy: Allow authenticated users to view their own profile pictures
CREATE POLICY "Allow authenticated users to view own profile pics" ON storage.objects FOR SELECT USING (
    bucket_id = 'profile_pictures' AND auth.uid()::text = owner
);

-- Policy: Allow authenticated users to update their own profile pictures
CREATE POLICY "Allow authenticated users to update own profile pics" ON storage.objects FOR UPDATE USING (
    bucket_id = 'profile_pictures' AND auth.uid()::text = owner
);

-- Policy: Allow authenticated users to delete their own profile pictures
CREATE POLICY "Allow authenticated users to delete own profile pics" ON storage.objects FOR DELETE USING (
    bucket_id = 'profile_pictures' AND auth.uid()::text = owner
);
