
-- Create ENUM for user roles
CREATE TYPE public.user_role AS ENUM ('HOMEOWNER', 'CONTRACTOR', 'ADMIN');

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    role public.user_role DEFAULT 'HOMEOWNER'::public.user_role NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX profiles_email_idx ON public.profiles USING btree (email);
COMMENT ON TABLE public.profiles IS 'User profiles for HOMEase | AI. Stores basic user info and role.';

-- Create homeowner_profiles table
CREATE TABLE public.homeowner_profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    address text,
    city text,
    state text,
    zip_code text,
    phone_number text
);
ALTER TABLE public.homeowner_profiles ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.homeowner_profiles IS 'Specific profiles for homeowners.';

-- Create contractor_profiles table
CREATE TABLE public.contractor_profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    company_name text,
    license_number text UNIQUE,
    service_areas text[],
    specialties text[],
    is_verified boolean DEFAULT FALSE NOT NULL,
    rating numeric DEFAULT 0.0 NOT NULL,
    phone_number text,
    stripe_account_id text -- For Stripe Connect
);
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.contractor_profiles IS 'Specific profiles and vetting information for contractors.';

-- Create ar_assessments table
CREATE TABLE public.ar_assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    homeowner_id uuid NOT NULL REFERENCES public.homeowner_profiles (id) ON DELETE CASCADE,
    assessment_data jsonb, -- Raw AR scan data
    ai_analysis_result jsonb, -- Gemini AI analysis
    fal_ai_visualization_url text, -- URL to Fal.ai generated visualization
    status text DEFAULT 'pending' NOT NULL -- e.g., 'pending', 'analyzed', 'completed'
);
ALTER TABLE public.ar_assessments ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.ar_assessments IS 'Stores AR assessment data, AI analysis, and Fal.ai visualizations.';

-- Create projects table
CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    homeowner_id uuid NOT NULL REFERENCES public.homeowner_profiles (id) ON DELETE CASCADE,
    ar_assessment_id uuid REFERENCES public.ar_assessments (id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'open' NOT NULL, -- e.g., 'open', 'matched', 'in_progress', 'completed', 'cancelled'
    budget_estimate numeric,
    start_date date,
    end_date date
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.projects IS 'Core project records, created from AR assessments or directly by homeowners.';

-- Create project_leads table (junction table for contractor matching)
CREATE TABLE public.project_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    contractor_id uuid NOT NULL REFERENCES public.contractor_profiles (id) ON DELETE CASCADE,
    status text DEFAULT 'available' NOT NULL, -- e.g., 'available', 'purchased', 'contacted', 'rejected'
    lead_cost numeric NOT NULL,
    purchased_at timestamp with time zone,
    UNIQUE (project_id, contractor_id) -- A contractor can only be matched to a project once
);
ALTER TABLE public.project_leads ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.project_leads IS 'Junction table to manage project leads for contractors.';

-- Create payments table
CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    payer_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE, -- Homeowner
    payee_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE, -- Contractor
    amount numeric NOT NULL,
    currency text DEFAULT 'usd' NOT NULL,
    stripe_charge_id text UNIQUE,
    status text DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'succeeded', 'failed', 'refunded'
    payment_type text -- e.g., 'lead_purchase', 'project_payment'
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.payments IS 'Records all Stripe transactions for lead purchases and project payments.';

-- Create reviews table
CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    reviewer_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE, -- Either homeowner or contractor
    reviewed_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE, -- The profile being reviewed
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    UNIQUE (project_id, reviewer_id, reviewed_id) -- Only one review per project/reviewer/reviewed pair
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.reviews IS 'Stores homeowner feedback on contractors and vice-versa.';

-- Set up Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles, homeowner_profiles, contractor_profiles, ar_assessments, projects, project_leads, payments, reviews;

-- Storage: profiles bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pictures', 'profile_pictures', true)
ON CONFLICT (id) DO NOTHING;
