
```

## 🎯 Workflow Selection

- **Selected Workflow:** orchestrator_workers
- **Confidence Score:** 0.95
- **Reasoning:** The user is requesting a comprehensive technical architecture plan, which is a highly complex task. It requires analyzing a detailed briefing document, decomposing the existing architecture (GCP/Firebase) into functional components (Auth, Database, Serverless, Async Messaging), and then redesigning and integrating these components using a completely new stack (Next.js App Router and Supabase). This process requires specialized knowledge in multiple domains (frontend, database, serverless migration) and careful coordination to ensure all business requirements are met in the new system. The Orchestrator-Workers pattern is ideal for delegating these specialized subtasks (e.g., Database Schema Design, Auth Migration Plan, Serverless Function Replacement) to expert workers and then having an Orchestrator synthesize the results into a single, coherent, and integrated final plan.

## 📊 Performance Metrics

- **Processing Time:** 196.74 seconds
- **Total Steps:** 11
- **Final Response Length:** 12,362 characters
- **Total Content Generated:** 112,469 characters
- **Quality Assessment:** excellent

## 🔄 Execution Steps

### Step 1: Task Orchestrator

**Metadata:**

```json
- task_plan: 
{
    'task_understanding': "The user requires a complete technical architecture pivot for the HOMEase | AI lead generation platform. The original stack relied heavily on Google Cloud Platform (GCP) components: Next.js on Cloud Run, Google Cloud Functions, Firebase Firestore, Firebase Auth, and Google Cloud Pub/Sub. The new architecture must exclusively use **Next.js App Router** and **Supabase** as the core technology stack. This pivot necessitates a fundamental redesign of the data layer (NoSQL to Relational SQL), the backend logic (Cloud Functions to Edge Functions/Server Actions), and the event-driven system (Pub/Sub to Postgres Triggers/Realtime). The platform's core functions—AR assessment processing (Gemini/Fal.ai integration), contractor matching, and Stripe payments—must be maintained and securely integrated into the new serverless, event-driven Supabase ecosystem. The goal is to produce a strategic, detailed plan for this migration.", 
    'subtasks': [
        {
            'output_format': 'Detailed SQL Schema (DDL) and Entity-Relationship Diagram (ERD).', 
            'dependencies': [], 
            'title': 'Data Model Redesign (NoSQL to SQL)', 
            'estimated_complexity': 'high', 
            'description': 'Design the complete relational schema for Supabase Postgres, replacing the original Firebase Firestore (NoSQL) model. This involves defining tables for Homeowners, Contractors, Leads/Projects, AR Assessments, and Reviews. Focus on normalization, defining primary/foreign keys, and establishing an effective indexing strategy for performance.', 
            'id': 'A1_Data_Model', 
            'required_expertise': 'Database Architecture, SQL', 
            'priority': 1
        }, 
{
    'description': 'Define the authentication flow using Supabase Auth (replacing Firebase Auth). Implement robust Row-Level Security (RLS) policies on all critical tables based on user roles (Homeowner, Contractor, Admin). Detail the strategy for managing user metadata and roles within Supabase (replacing Firebase Custom Claims).', 
    'output_format': 'RLS policy definitions, Auth flow documentation, and user role management strategy.', 
    'estimated_complexity': 'medium', 
    'dependencies': ['A1_Data_Model'], 
    'priority': 1, 
    'id': 'A2_Auth_RLS', 
    'title': 'Core Supabase Setup & Authentication Strategy', 
    'required_expertise': 'Security Engineering, Supabase'
}, 
{
    'description': 'Design the new asynchronous workflow system to replace Google Cloud Pub/Sub. This will utilize Postgres Triggers/Functions to capture data changes (e.g., a new lead is created) and publish events, which are then consumed via Supabase Realtime or Webhooks to trigger external processing (e.g., lead matching algorithm, AI analysis initiation).', 'dependencies': ['A1_Data_Model', 'A2_Auth_RLS'], 
    'output_format': 'Architecture diagram and detailed plan for event handling (Triggers, Realtime, Webhooks).', 
    'priority': 2, 
    'required_expertise': 'Serverless Architecture, Event Streaming', 
    'id': 'B1_Event_System', 
    'title': 'Event-Driven Architecture Replacement (Pub/Sub to Supabase)', 
    'estimated_complexity': 'high'
}, 
{
    'output_format': 'API endpoint mapping, function allocation strategy, and pseudocode for key logic flows.', 'dependencies': ['B1_Event_System'], 
    'priority': 2, 
    'title': 'Backend Services Implementation Plan (Cloud Functions Replacement)', 
    'id': 'B2_Backend_Logic', 
    'required_expertise': 'Full-Stack Development, Serverless', 
    'description': 'Plan the migration of all Google Cloud Functions business logic to a combination of Next.js Server Actions and Supabase Edge Functions (Deno). Define clear criteria for allocation: simple CRUD and form submissions via Server Actions; heavy, long-running, or external API-dependent tasks (like AI calls) via Edge Functions.', 
    'estimated_complexity': 'medium'
}, 
{
    'dependencies': ['B2_Backend_Logic'], 
    'output_format': 'Secure integration flow diagram and API key management strategy.', 
    'id': 'C1_AI_Integration', 
    'title': 'AI Service Integration & Security Strategy (Gemini/Fal.ai)', 
    'priority': 3, 
    'description': 'Define the secure integration strategy for the external AI services (Google Gemini, Fal.ai). Ensure all API calls are proxied through a secure backend (Edge Function or Server Action) to protect API keys. Detail the key management strategy using Supabase Vault or secure environment variables.', 'estimated_complexity': 'medium', 
    'required_expertise': 'API Integration, Security Engineering'
}, 
{
    'required_expertise': 'Frontend Architecture, Next.js', 
    'id': 'C2_Frontend_Structure', 
    'title': 'Next.js App Router Structure & Data Fetching Strategy', 
    'description': 'Define the file structure, component architecture, and data fetching strategy for the Next.js App Router frontend. Focus on maximizing the use of Server Components for initial rendering and Server Actions for data mutations, leveraging the Supabase client library for efficient data access.', 
    'estimated_complexity': 'medium', 
    'priority': 3, 
    'dependencies': ['A2_Auth_RLS'], 
    'output_format': 'Component map, file structure definition, and data fetching pattern documentation.'
}, 
{
    'estimated_complexity': 'low', 
    'priority': 4, 
    'description': 'Define the strategy for storing AR assessment images and documents using Supabase Storage (replacing Google Cloud Storage). Detail the bucket structure, implement file access control using RLS, and define the process for generating signed URLs for secure, temporary access by the client.', 
    'output_format': 'Storage bucket structure and access control policy documentation.', 
    'required_expertise': 'Cloud Storage, Security Engineering', 
    'title': 'Storage and File Management Strategy (Supabase Storage)', 
    'dependencies': ['A2_Auth_RLS'], 
    'id': 'D1_Storage_Plan'
}, 
{
    'priority': 4, 
    'dependencies': ['C2_Frontend_Structure', 'B2_Backend_Logic'], 
    'output_format': 'CI/CD workflow definition and deployment environment setup guide.', 
    'id': 'D2_DevOps_CI_CD', 
    'title': 'Deployment & CI/CD Pipeline Definition', 
    'required_expertise': 'DevOps, CI/CD', 
    'estimated_complexity': 'medium', 
    'description': 'Define the deployment strategy (e.g., Vercel, self-hosted) for the Next.js application and the deployment/migration strategy for the Supabase project. Establish a CI/CD pipeline using GitHub Actions for automated testing, building, and deployment, including secure secret management for environment variables.'
}, 
{
    'dependencies': ['C1_AI_Integration', 'C2_Frontend_Structure', 'D1_Storage_Plan', 'D2_DevOps_CI_CD'], 
    'title': 'Final Architecture Synthesis and Documentation', 
    'description': 'Consolidate all preceding subtasks into a single, cohesive technical architecture document. Create a final, high-level diagram illustrating the data flow, component interactions, and security boundaries of the new Next.js/Supabase stack. Verify that all original functional requirements (lead matching, Stripe integration, AR workflow) are fully addressed.', 
    'estimated_complexity': 'low', 
    'priority': 5, 
    'id': 'E1_Synthesis', 
    'output_format': 'Comprehensive Technical Architecture Plan and Final Diagram.', 
    'required_expertise': 'Master Coordination, Technical Writing'
}
], 
'execution_strategy': 'The execution will follow a Phased and Parallelized strategy. Phase 1 focuses on establishing the foundational data model and security (Supabase Postgres and RLS), which are critical dependencies for all subsequent work. Phase 2 and 3 run in parallel, tackling the core backend logic (event system, serverless functions replacement) and the Next.js App Router structure/integration. Phase 4 focuses on operationalizing the plan (Storage, DevOps). The final phase is dedicated to synthesizing all components into a single, comprehensive architecture document. This approach minimizes blocking time and ensures a robust, secure foundation is built first.', 
'success_metrics': ['The architecture plan must successfully replace all Firebase/GCP components (Firestore, Cloud Functions, Pub/Sub, Auth, Storage) with robust, scalable equivalents using Next.js App Router and Supabase.', 'A detailed, normalized relational data model (ERD/DDL) for Supabase Postgres must be provided, clearly defining tables for Homeowners, Contractors, and Leads.', 
'The plan must explicitly define how the event-driven architecture (replacing Pub/Sub) is implemented using Supabase features (e.g., Postgres Triggers, Realtime, Webhooks).', 'Security measures, including Row-Level Security (RLS) policies and secure API key management for Gemini, must be clearly detailed and integrated into the plan.', 'The final output must be a comprehensive, actionable technical architecture document suitable for immediate implementation by development teams.']}
```

- subtask_count: 9
- execution_strategy: The execution will follow a Phased and Parallelized strategy. Phase 1 focuses on establishing the foundational data model and security (Supabase Postgres and RLS), which are critical dependencies for all subsequent work. Phase 2 and 3 run in parallel, tackling the core backend logic (event system, serverless functions replacement) and the Next.js App Router structure/integration. Phase 4 focuses on operationalizing the plan (Storage, DevOps). The final phase is dedicated to synthesizing all components into a single, comprehensive architecture document. This approach minimizes blocking time and ensures a robust, secure foundation is built first.

**Content (4,971 characters):**

**Task Understanding:**
The user requires a complete technical architecture pivot for the HOMEase | AI lead generation platform. The original stack relied heavily on Google Cloud Platform (GCP) components: Next.js on Cloud Run, Google Cloud Functions, Firebase Firestore, Firebase Auth, and Google Cloud Pub/Sub. The new architecture must exclusively use **Next.js App Router** and **Supabase** as the core technology stack. This pivot necessitates a fundamental redesign of the data layer (NoSQL to Relational SQL), the backend logic (Cloud Functions to Edge Functions/Server Actions), and the event-driven system (Pub/Sub to Postgres Triggers/Realtime). The platform's core functions—AR assessment processing (Gemini/Fal.ai integration), contractor matching, and Stripe payments—must be maintained and securely integrated into the new serverless, event-driven Supabase ecosystem. The goal is to produce a strategic, detailed plan for this migration.

**Execution Strategy:**
The execution will follow a Phased and Parallelized strategy. Phase 1 focuses on establishing the foundational data model and security (Supabase Postgres and RLS), which are critical dependencies for all subsequent work. Phase 2 and 3 run in parallel, tackling the core backend logic (event system, serverless functions replacement) and the Next.js App Router structure/integration. Phase 4 focuses on operationalizing the plan (Storage, DevOps). The final phase is dedicated to synthesizing all components into a single, comprehensive architecture document. This approach minimizes blocking time and ensures a robust, secure foundation is built first.

**Success Metrics:**
• The architecture plan must successfully replace all Firebase/GCP components (Firestore, Cloud Functions, Pub/Sub, Auth, Storage) with robust, scalable equivalents using Next.js App Router and Supabase.
• A detailed, normalized relational data model (ERD/DDL) for Supabase Postgres must be provided, clearly defining tables for Homeowners, Contractors, and Leads.
• The plan must explicitly define how the event-driven architecture (replacing Pub/Sub) is implemented using Supabase features (e.g., Postgres Triggers, Realtime, Webhooks).
• Security measures, including Row-Level Security (RLS) policies and secure API key management for Gemini/Fal.ai, must be clearly detailed and integrated into the plan.
• The final output must be a comprehensive, actionable technical architecture document suitable for immediate implementation by development teams.

**Planned Subtasks:**

1. **Data Model Redesign (NoSQL to SQL)** (Priority: 1, Complexity: high)
   • Expertise: Database Architecture, SQL
   • Dependencies: None
   • Output: Detailed SQL Schema (DDL) and Entity-Relationship Diagram (ERD).

2. **Core Supabase Setup & Authentication Strategy** (Priority: 1, Complexity: medium)
   • Expertise: Security Engineering, Supabase
   • Dependencies: A1_Data_Model
   • Output: RLS policy definitions, Auth flow documentation, and user role management strategy.

3. **Event-Driven Architecture Replacement (Pub/Sub to Supabase)** (Priority: 2, Complexity: high)
   • Expertise: Serverless Architecture, Event Streaming
   • Dependencies: A1_Data_Model, A2_Auth_RLS
   • Output: Architecture diagram and detailed plan for event handling (Triggers, Realtime, Webhooks).

4. **Backend Services Implementation Plan (Cloud Functions Replacement)** (Priority: 2, Complexity: medium)
   • Expertise: Full-Stack Development, Serverless
   • Dependencies: B1_Event_System
   • Output: API endpoint mapping, function allocation strategy, and pseudocode for key logic flows.

5. **AI Service Integration & Security Strategy (Gemini/Fal.ai)** (Priority: 3, Complexity: medium)
   • Expertise: API Integration, Security Engineering
   • Dependencies: B2_Backend_Logic
   • Output: Secure integration flow diagram and API key management strategy.

6. **Next.js App Router Structure & Data Fetching Strategy** (Priority: 3, Complexity: medium)
   • Expertise: Frontend Architecture, Next.js
   • Dependencies: A2_Auth_RLS
   • Output: Component map, file structure definition, and data fetching pattern documentation.

7. **Storage and File Management Strategy (Supabase Storage)** (Priority: 4, Complexity: low)
   • Expertise: Cloud Storage, Security Engineering
   • Dependencies: A2_Auth_RLS
   • Output: Storage bucket structure and access control policy documentation.

8. **Deployment & CI/CD Pipeline Definition** (Priority: 4, Complexity: medium)
   • Expertise: DevOps, CI/CD
   • Dependencies: C2_Frontend_Structure, B2_Backend_Logic
   • Output: CI/CD workflow definition and deployment environment setup guide.

9. **Final Architecture Synthesis and Documentation** (Priority: 5, Complexity: low)
   • Expertise: Master Coordination, Technical Writing
   • Dependencies: C1_AI_Integration, C2_Frontend_Structure, D1_Storage_Plan, D2_DevOps_CI_CD
   • Output: Comprehensive Technical Architecture Plan and Final Diagram.

---

### Step 2: Database Architecture, SQL Specialist

**Metadata:**

```json
- subtask_id: A1_Data_Model
- title: Data Model Redesign (NoSQL to SQL)
- expertise: Database Architecture, SQL
- complexity: high
- output_format: Detailed SQL Schema (DDL) and Entity-Relationship Diagram (ERD).
```

**Content (12,396 characters):**

This technical architecture pivot requires a robust, normalized relational schema to leverage the strengths of PostgreSQL within the Supabase ecosystem. This design replaces the flexible but less structured Firebase Firestore model with explicit relationships, ensuring data integrity, optimized querying for matching algorithms, and streamlined security via Row-Level Security (RLS).

## Data Model Redesign (NoSQL to SQL)

### 1. Entity-Relationship Diagram (ERD) Conceptual Overview

The core entities are structured around the user roles and the lead generation lifecycle (Assessment $\rightarrow$ Project $\rightarrow$ Lead Matching $\rightarrow$ Payment/Review).

| Entity | Primary Relationships | Key Fields & Purpose |
| :--- | :--- | :--- |
| **`profiles`** | 1:1 `auth.users` | Base user data, role, contact info. |
| **`contractor_profiles`** | 1:1 `profiles` | Specialized contractor data (Vetting, Certs). |
| **`homeowner_profiles`** | 1:1 `profiles` | Homeowner location/demographic details. |
| **`ar_assessments`** | N:1 `homeowner_profiles` | Raw scan data, Gemini analysis, Fal.ai visualization links. |
| **`projects`** | 1:1 `ar_assessments`, N:1 `homeowner_profiles` | The core lead record (scope, urgency, budget, final contractor). |
| **`project_leads`** | N:M `projects` $\leftrightarrow$ `contractor_profiles` | Tracks which leads were offered to which contractors and their status (accepted/rejected). |
| **`contractor_service_areas`** | N:M `contractor_profiles` $\leftrightarrow$ `service_areas` | Defines contractor reach for matching. |
| **`payments`** | N:1 `projects` | Stripe transaction records (Lead fees, project payments). |
| **`reviews`** | N:1 `projects`, N:1 `contractor_profiles` | Homeowner feedback loop. |

### 2. Detailed SQL Schema (DDL)

The following DDL defines the necessary tables, columns, constraints, and initial indexing strategy for a high-performance Supabase PostgreSQL database.

```sql
-- =================================================================
-- 1. ENUM Definitions (Ensuring Data Integrity for Statuses & Roles)
-- =================================================================

-- User Role Definitions
CREATE TYPE user_role AS ENUM ('HOMEOWNER', 'CONTRACTOR', 'ADMIN');

-- Project Status Definitions
CREATE TYPE project_status AS ENUM (
    'ASSESSMENT_PENDING', 
    'LEAD_GENERATED', 
    'MATCHING_IN_PROGRESS', 
    'CONTRACTOR_SELECTED', 
    'PROJECT_IN_PROGRESS', 
    'COMPLETED', 
    'CANCELLED'
);

-- Lead Urgency Definitions
CREATE TYPE lead_urgency AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Lead Status Definitions (Contractor perspective)
CREATE TYPE lead_status AS ENUM ('OFFERED', 'VIEWED', 'ACCEPTED', 'REJECTED', 'PURCHASED');

-- =================================================================
-- 2. CORE USER TABLES (Integrated with Supabase Auth)
-- =================================================================

-- 2.1. profiles
-- Stores common data for all users, linked to the built-in auth.users table.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    role user_role NOT NULL DEFAULT 'HOMEOWNER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast role filtering and lookups
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_email ON public.profiles (email);

-- 2.2. homeowner_profiles
-- Specific data for homeowners.
CREATE TABLE public.homeowner_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    home_address_line1 TEXT,
    home_city TEXT,
    home_state TEXT,
    home_zip_code TEXT,
    is_senior BOOLEAN DEFAULT FALSE, -- Relevant for HUD/Grant opportunities
    last_login TIMESTAMPTZ
);

-- Indexing on geographic data for localized services
CREATE INDEX idx_homeowner_zip ON public.homeowner_profiles (home_zip_code);

-- 2.3. contractor_profiles
-- Specific data for contractors, including vetting status.
CREATE TABLE public.contractor_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    license_number TEXT UNIQUE,
    insurance_verified BOOLEAN DEFAULT FALSE,
    background_check_status TEXT DEFAULT 'PENDING', -- PENDING, PASSED, FAILED
    caps_certified BOOLEAN DEFAULT FALSE, -- Certified Aging-in-Place Specialist
    vetting_status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    service_radius_miles INTEGER DEFAULT 50,
    average_rating NUMERIC(2, 1) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0
);

-- Indexing for vetting and certification status for matching and admin views
CREATE INDEX idx_contractor_vetting ON public.contractor_profiles (vetting_status);
CREATE INDEX idx_contractor_caps ON public.contractor_profiles (caps_certified);

-- =================================================================
-- 3. GEOGRAPHIC & SERVICE AREA TABLES
-- =================================================================

-- 3.1. service_areas
-- Defines the specific regions (e.g., state/zip code groups) the platform operates in.
CREATE TABLE public.service_areas (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL, -- e.g., "Texas DFW Metroplex"
    state_code CHAR(2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3.2. contractor_service_areas (Junction Table for M:N relationship)
-- Links contractors to the areas they serve.
CREATE TABLE public.contractor_service_areas (
    contractor_id UUID REFERENCES public.contractor_profiles(profile_id) ON DELETE CASCADE,
    area_id INTEGER REFERENCES public.service_areas(id) ON DELETE CASCADE,
    PRIMARY KEY (contractor_id, area_id)
);

-- Indexing for rapid lookup of contractors by area
CREATE INDEX idx_csa_area_id ON public.contractor_service_areas (area_id);


-- =================================================================
-- 4. LEAD GENERATION & PROJECT MANAGEMENT TABLES
-- =================================================================

-- 4.1. ar_assessments
-- Stores the technical output of the AR scan and AI processing.
CREATE TABLE public.ar_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homeowner_id UUID REFERENCES public.homeowner_profiles(profile_id) ON DELETE CASCADE,
    
    -- Input Data
    raw_scan_storage_path TEXT NOT NULL, -- Link to Supabase Storage bucket
    
    -- Gemini Analysis Output
    accessibility_score INTEGER CHECK (accessibility_score >= 0 AND accessibility_score <= 100),
    hazard_list JSONB, -- List of specific issues identified (e.g., narrow doorways)
    recommendations JSONB, -- Suggested AIP modifications
    
    -- Fal.ai Visualization Output
    visualization_image_url TEXT, -- Link to the "after" visualization image
    
    analysis_completed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for quick retrieval by homeowner
CREATE INDEX idx_assessment_homeowner ON public.ar_assessments (homeowner_id);


-- 4.2. projects
-- The core lead record, derived from an assessment.
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID UNIQUE REFERENCES public.ar_assessments(id) ON DELETE RESTRICT, -- 1:1
    homeowner_id UUID REFERENCES public.homeowner_profiles(profile_id) ON DELETE RESTRICT,
    
    project_title TEXT NOT NULL,
    project_description TEXT, -- Summary of required work
    
    budget_estimate NUMERIC(10, 2),
    urgency lead_urgency NOT NULL,
    
    status project_status NOT NULL DEFAULT 'LEAD_GENERATED',
    
    -- Final Contractor Selection (NULL until selection)
    selected_contractor_id UUID REFERENCES public.contractor_profiles(profile_id) ON DELETE SET NULL,
    selection_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Critical indexes for lead matching and filtering
CREATE INDEX idx_projects_status ON public.projects (status);
CREATE INDEX idx_projects_homeowner ON public.projects (homeowner_id);
CREATE INDEX idx_projects_selected_contractor ON public.projects (selected_contractor_id) WHERE selected_contractor_id IS NOT NULL;


-- 4.3. project_leads
-- Tracks the distribution and acceptance of leads.
CREATE TABLE public.project_leads (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES public.contractor_profiles(profile_id) ON DELETE CASCADE,
    
    lead_price NUMERIC(6, 2) NOT NULL, -- Price charged to the contractor for this lead
    lead_status lead_status NOT NULL DEFAULT 'OFFERED',
    
    offered_at TIMESTAMPTZ DEFAULT NOW(),
    viewed_at TIMESTAMPTZ,
    purchased_at TIMESTAMPTZ,
    
    PRIMARY KEY (project_id, contractor_id)
);

-- Indexing for fast retrieval of leads associated with a specific contractor
CREATE INDEX idx_project_leads_contractor ON public.project_leads (contractor_id, lead_status);


-- =================================================================
-- 5. FINANCIAL & FEEDBACK TABLES
-- =================================================================

-- 5.1. payments
-- Records all transactions processed via Stripe.
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE RESTRICT,
    contractor_id UUID REFERENCES public.contractor_profiles(profile_id) ON DELETE RESTRICT, -- For lead fees
    payer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT, -- Homeowner or Contractor
    
    amount NUMERIC(10, 2) NOT NULL,
    transaction_type TEXT NOT NULL, -- e.g., 'LEAD_FEE', 'PROJECT_DEPOSIT', 'FINAL_PAYMENT'
    
    stripe_charge_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL, -- e.g., 'SUCCESS', 'FAILED', 'PENDING'
    
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for financial reporting and reconciliation
CREATE INDEX idx_payments_project ON public.payments (project_id);
CREATE INDEX idx_payments_contractor ON public.payments (contractor_id);


-- 5.2. reviews
-- Stores homeowner reviews and ratings for selected contractors.
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE, -- 1 review per project
    contractor_id UUID REFERENCES public.contractor_profiles(profile_id) ON DELETE RESTRICT,
    homeowner_id UUID REFERENCES public.homeowner_profiles(profile_id) ON DELETE RESTRICT,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for calculating contractor averages
CREATE INDEX idx_reviews_contractor ON public.reviews (contractor_id);


-- =================================================================
-- 6. ASYNCHRONOUS WORKFLOW HOOKS (TRIGGERS/FUNCTIONS)
-- =================================================================

-- Supabase utilizes Postgres Triggers and Functions (via `pg_net` or standard functions)
-- to replace Google Cloud Pub/Sub and Cloud Functions for event-driven logic.

-- Example: Trigger for updating contractor average rating upon new review
CREATE OR REPLACE FUNCTION update_contractor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.contractor_profiles
    SET 
        average_rating = (
            SELECT AVG(rating) FROM public.reviews WHERE contractor_id = NEW.contractor_id
        ),
        total_reviews = (
            SELECT COUNT(*) FROM public.reviews WHERE contractor_id = NEW.contractor_id
        )
    WHERE profile_id = NEW.contractor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_contractor_rating
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_contractor_rating();

-- Example: Trigger for setting `updated_at` timestamps automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_update_projects_timestamp
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

---

### Step 3: Security Engineering, Supabase Specialist

**Metadata:**

```json
- subtask_id: A2_Auth_RLS
- title: Core Supabase Setup & Authentication Strategy
- expertise: Security Engineering, Supabase
- complexity: medium
- output_format: RLS policy definitions, Auth flow documentation, and user role management strategy.
```

**Content (9,592 characters):**

The Specialized Worker, leveraging expertise in Security Engineering and Supabase, presents the Core Supabase Setup and Authentication Strategy, including detailed Row-Level Security (RLS) policies necessary for the HOMEase | AI platform migration.

---

## I. Core Supabase Setup & Authentication Strategy

The migration from Firebase Authentication to Supabase Auth requires a robust, cookie-based session management strategy integrated seamlessly with the Next.js App Router architecture.

### 1. Authentication Flow Documentation

The HOMEase | AI authentication flow will utilize the official Supabase Next.js integration, which uses cookies to manage sessions securely across Server Components, Client Components, and Server Actions.

| Step | Component | Action/Mechanism | Security Implication |
| :--- | :--- | :--- | :--- |
| **1. Sign Up/Log In** | Client Component (e.g., `/login` page) | Uses `supabase.auth.signInWithPassword()` or `signUp()`. | Supabase generates a JWT and sets secure, HTTP-only session cookies (`sb-access-token`, `sb-refresh-token`). |
| **2. Middleware Refresh** | `middleware.ts` (Edge Runtime) | Intercepts all requests. Uses `supabase.auth.getSession()` to check the session validity. If the session is expired but the refresh token is valid, it refreshes the session and rewrites the response headers with new cookies. | Ensures continuous, non-blocking session validity and protects against token expiry during long user sessions. |
| **3. Server Access** | Server Component or Server Action | Uses a dedicated server-side Supabase client (`lib/supabase/server.ts`) configured to read the session cookies from the request headers. | Guarantees that all data fetching or mutations performed on the server are authenticated and implicitly enforced by RLS. |
| **4. Role Assignment** | Database Trigger | Upon successful insertion into `auth.users`, a trigger fires to insert a corresponding record into `public.profiles`, assigning the default `HOMEOWNER` role. | Ensures every authenticated user has a defined role immediately, crucial for RLS enforcement. |
| **5. Session Management** | Supabase Auth | The JWT payload (accessible via `auth.jwt()`) contains standard claims (`sub` for user ID). The User ID is used by PostgreSQL's `auth.uid()` function to enforce RLS. | The JWT is the single source of truth for user identity and security context within the database. |

### 2. User Role Management Strategy

The original architecture used Firebase Custom Claims to manage user roles (Homeowner, Contractor, Admin). In Supabase, this is managed directly within the PostgreSQL database using the `public.profiles` table and a helper function.

#### A. Role Storage and Definition

- **Location:** The `role` column in the `public.profiles` table (as defined in the Data Model) stores the `user_role` ENUM value.
- **Initial Assignment:** A PostgreSQL function and trigger are required to automatically populate the `profiles` table when a new user signs up via Supabase Auth.

```sql
-- Function to create a profile upon new user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (NEW.id, NEW.email, 'HOMEOWNER', '', ''); -- Default to HOMEOWNER
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### B. Role Retrieval for RLS

For complex RLS policies that depend on the user's role (e.g., only 'ADMIN' can delete records), a dedicated function is required to retrieve the authenticated user's role efficiently.

```sql
-- Helper function to retrieve the authenticated user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;
```

This `public.get_user_role()` function will be used extensively within the RLS policies to enforce granular access control.

---

## II. Row-Level Security (RLS) Policy Definitions

RLS is enabled on all tables handling sensitive user or project data. The following policies ensure that users can only access the data relevant to their role and ownership.

**Prerequisite:** RLS must be enabled on all tables below (`ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;`).

### 1. `public.profiles` (Base User Data)

| Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) |
| :--- | :--- | :--- | :--- |
| **`allow_self_read`** | `SELECT` | All | `auth.uid() = id` (Users can read their own profile.) |
| **`allow_self_update`** | `UPDATE` | All | `auth.uid() = id` (Users can update their own profile details.) |
| **`allow_admin_full_access`** | `ALL` | ADMIN | `public.get_user_role() = 'ADMIN'` (Admins bypass all other RLS.) |
| **`allow_contractor_public_read`** | `SELECT` | HOMEOWNER | `role = 'CONTRACTOR' AND EXISTS (SELECT 1 FROM public.contractor_profiles WHERE profile_id = id AND vetting_status = 'APPROVED')` (Homeowners can see basic profiles of approved contractors for matching/review.) |

### 2. `public.contractor_profiles` (Contractor Specific Data)

| Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) |
| :--- | :--- | :--- | :--- |
| **`allow_contractor_self_manage`** | `SELECT`, `UPDATE` | CONTRACTOR | `auth.uid() = profile_id` (Contractors can view and update their specific company and vetting data.) |
| **`allow_homeowner_read_approved`** | `SELECT` | HOMEOWNER | `vetting_status = 'APPROVED'` (Homeowners can only view approved contractor details during the selection process.) |
| **`allow_admin_full_access`** | `ALL` | ADMIN | `public.get_user_role() = 'ADMIN'` |

### 3. `public.homeowner_profiles` (Homeowner Specific Data)

| Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) |
| :--- | :--- | :--- | :--- |
| **`allow_homeowner_self_manage`** | `SELECT`, `UPDATE` | HOMEOWNER | `auth.uid() = profile_id` (Homeowners can manage their home address and specific details.) |
| **`allow_admin_full_access`** | `ALL` | ADMIN | `public.get_user_role() = 'ADMIN'` |

### 4. `public.projects` (Core Lead Records)

This table is critical as it defines the lead and project scope. Access must be strictly controlled by ownership and association.

| Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) |
| :--- | :--- | :--- | :--- |
| **`allow_homeowner_crud_own`** | `ALL` | HOMEOWNER | `auth.uid() = homeowner_id` (Homeowners can create, read, update, and delete their own projects.) |
| **`allow_contractor_read_matched`** | `SELECT` | CONTRACTOR | `EXISTS (SELECT 1 FROM public.project_leads WHERE project_id = id AND contractor_id = auth.uid())` (Contractors can only read projects they have been matched with or purchased.) |
| **`allow_contractor_read_selected`** | `SELECT` | CONTRACTOR | `selected_contractor_id = auth.uid()` (Contractors can read projects they have been officially selected for.) |
| **`allow_admin_full_access`** | `ALL` | ADMIN | `public.get_user_role() = 'ADMIN'` |

### 5. `public.project_leads` (Lead Distribution/Purchase Tracking)

This junction table tracks which contractor has access to which lead. Homeowners should not interact with this table directly.

| Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) |
| :--- | :--- | :--- | :--- |
| **`allow_contractor_self_read`** | `SELECT` | CONTRACTOR | `auth.uid() = contractor_id` (Contractors can see all leads offered to them.) |
| **`allow_contractor_update_status`** | `UPDATE` | CONTRACTOR | `auth.uid() = contractor_id AND lead_status IN ('OFFERED', 'VIEWED')` (Contractors can update the status of leads they own, typically from OFFERED to VIEWED or PURCHASED. The PURCHASED status update should often be handled by a secure Server Action post-Stripe payment webhook verification.) |
| **`allow_admin_full_access`** | `ALL` | ADMIN | `public.get_user_role() = 'ADMIN'` |

### 6. `public.ar_assessments` (Raw Data Storage)

| Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) |
| :--- | :--- | :--- | :--- |
| **`allow_homeowner_read_own`** | `SELECT` | HOMEOWNER | `auth.uid() = homeowner_id` (Homeowners can view the raw assessment data linked to their profile.) |
| **`allow_admin_full_access`** | `ALL` | ADMIN | `public.get_user_role() = 'ADMIN'` |

### 7. `public.payments` and `public.reviews` (Financial and Feedback)

Access control here ensures financial and review data integrity.

| Table | Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) |
| :--- | :--- | :--- | :--- |
| **`payments`** | `allow_self_read` | `SELECT` | All | `auth.uid() = payer_id` OR `auth.uid() = contractor_id` (Users can see transactions they initiated or were recipients of.) |
| **`reviews`** | `allow_homeowner_crud_own` | `ALL` | HOMEOWNER | `auth.uid() = homeowner_id` (Homeowners can create, read, and update their own reviews.) |
| **`reviews`** | `allow_contractor_read` | `SELECT` | CONTRACTOR | `auth.uid() = contractor_id` (Contractors can read reviews left for them.) |
| **`reviews`** | `allow_admin_full_access` | `ALL` | ADMIN | `public.get_user_role() = 'ADMIN'` |

This comprehensive RLS strategy ensures that the application's security rules are enforced at the database layer, providing a secure foundation for the Next.js App Router to interact with Supabase.

---

### Step 4: Serverless Architecture, Event Streaming Specialist

**Metadata:**

```json
- subtask_id: B1_Event_System
- title: Event-Driven Architecture Replacement (Pub/Sub to Supabase)
- expertise: Serverless Architecture, Event Streaming
- complexity: high
- output_format: Architecture diagram and detailed plan for event handling (Triggers, Realtime, Webhooks).
```

**Content (8,920 characters):**

This specialized technical architecture plan focuses on replacing the Google Cloud Pub/Sub event-driven system with a robust, Supabase-native solution utilizing PostgreSQL Triggers, `pg_net` Webhooks, and Supabase Realtime. This strategy ensures the maintenance of the asynchronous, event-driven behavior critical for the HOMEase | AI platform's core functions (AI analysis and lead matching).

---

## Event-Driven Architecture Replacement (Pub/Sub to Supabase)

### Architecture Diagram: Supabase Event Flow

The following diagram illustrates the chained asynchronous workflows, showing how database operations trigger external compute services via secure webhooks and notify the frontend via Realtime subscriptions.

```mermaid
graph TD
    subgraph Frontend (Next.js App Router)
        A[Homeowner Submits Assessment]
        K[Contractor Dashboard]
    end
    
    subgraph Supabase Core Services
        B(PostgreSQL Database)
        C(Supabase Realtime)
    end
    
    subgraph PostgreSQL Event Layer
        B -->|1. INSERT ar_assessments| D{Trigger: trg_assessment_created}
        D -->|2. PL/pgSQL Function: notify_ai_processor| E(pg_net Webhook Dispatch)
        
        B -->|4. UPDATE ar_assessments| F{Trigger: trg_analysis_completed}
        F -->|5. PL/pgSQL Function: create_project_from_assessment| B
        
        B -->|6. INSERT projects (LEAD_GENERATED)| G{Trigger: trg_lead_generated}
        G -->|7. PL/pgSQL Function: notify_lead_matcher| H(pg_net Webhook Dispatch)
        
        B -->|10. INSERT project_leads| C
    end
    
    subgraph External Compute Services
        I[AI Processing Service (Gemini/Fal.ai)]
        J[Lead Matching Service]
    end
    
    A --> B
    E -->|3. Webhook Payload| I
    I -->|3b. Update DB| B
    H -->|8. Webhook Payload| J
    J -->|9. Insert Matched Leads| B
    C -->|11. Realtime Broadcast| K
```

### Detailed Plan for Event Handling (Triggers, Realtime, Webhooks)

The event replacement strategy relies on PostgreSQL's ability to execute functions and send external HTTP requests asynchronously using the **`pg_net`** extension, which is provided by Supabase.

#### 1. Critical Event Mapping and Workflow Strategy

| Event Name | Triggering Database Action | Supabase Mechanism | Consumer Service | Rationale for Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **AR Analysis Initiation** | `INSERT` into `ar_assessments` | **Postgres Trigger + `pg_net` Webhook** | External AI Processing Service | Replaces Pub/Sub. Handles long-running external API calls (Gemini/Fal.ai) reliably. |
| **Lead Formalization** | `UPDATE` on `ar_assessments` (analysis complete) | **Postgres Trigger + PL/pgSQL Function** | Internal DB Logic | Chained workflow. Synchronous DB function transforms raw assessment into a formal `projects` lead record. |
| **Lead Matching Initiation** | `INSERT` into `projects` (status: `LEAD_GENERATED`) | **Postgres Trigger + `pg_net` Webhook** | External Lead Matching Service | Replaces Pub/Sub. Executes proprietary, complex matching algorithm outside the main database transaction. |
| **New Lead Notification** | `INSERT` into `project_leads` (by Matching Service) | **Supabase Realtime** | Contractor Dashboard (Next.js Frontend) | Provides immediate, low-latency notification to contractors, essential for a competitive lead platform. |
| **Project Status Update** | `UPDATE` on `projects` or `project_leads` | **Supabase Realtime** | Homeowner/Admin Dashboards | Allows the frontend to react instantly to payment confirmations or contractor selections. |

#### 2. PostgreSQL Trigger and Function Implementation

The following functions are defined using PL/pgSQL and `SECURITY DEFINER` (to ensure they run with necessary elevated permissions, while RLS protects data access) to manage the asynchronous flow.

##### A. Workflow 1: AR Assessment $\rightarrow$ AI Processing Service

This trigger fires when a homeowner submits an assessment, initiating the external AI analysis.

```sql
-- Function to notify the external AI service via webhook
CREATE OR REPLACE FUNCTION public.notify_ai_processor()
RETURNS TRIGGER AS $$
DECLARE
    payload JSONB;
    webhook_url TEXT := 'https://api.homease.ai/v1/ai-processing'; -- Dedicated external endpoint
BEGIN
    IF TG_OP = 'INSERT' THEN
        payload := jsonb_build_object(
            'assessment_id', NEW.id,
            'homeowner_id', NEW.homeowner_id,
            'storage_path', NEW.raw_scan_storage_path -- Path to data in Supabase Storage
        );
        
        -- Use pg_net to send the asynchronous HTTP request
        PERFORM net.http_post(
            url := webhook_url,
            body := payload,
            headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.ai_service_secret', true))
        );

        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_assessment_created
AFTER INSERT ON public.ar_assessments
FOR EACH ROW EXECUTE FUNCTION public.notify_ai_processor();
```

##### B. Workflow 2: AI Completion $\rightarrow$ Lead Formalization

This trigger fires when the external AI service returns results and updates the `ar_assessments` table, formalizing the lead in the `projects` table.

```sql
-- Function to create the formal project lead record
CREATE OR REPLACE FUNCTION public.create_project_from_assessment()
RETURNS TRIGGER AS $$
DECLARE
    h_id UUID;
    project_title_text TEXT;
BEGIN
    -- Check for transition: analysis_completed_at is now set
    IF OLD.analysis_completed_at IS NULL AND NEW.analysis_completed_at IS NOT NULL THEN
        SELECT homeowner_id INTO h_id FROM public.ar_assessments WHERE id = NEW.id;
        project_title_text := 'AIP Project for Home ' || h_id; 

        -- Insert the new project lead. This INSERT action triggers the next workflow (Lead Matching).
        INSERT INTO public.projects (assessment_id, homeowner_id, project_title, status, urgency)
        VALUES (NEW.id, h_id, project_title_text, 'LEAD_GENERATED', 'MEDIUM'); 

        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_analysis_completed
AFTER UPDATE ON public.ar_assessments
FOR EACH ROW EXECUTE FUNCTION public.create_project_from_assessment();
```

##### C. Workflow 3: Lead Formalized $\rightarrow$ Lead Matching Service

This trigger fires immediately after the lead is formalized, dispatching the event to the dedicated Lead Matching Service.

```sql
-- Function to notify the external Lead Matching Service
CREATE OR REPLACE FUNCTION public.notify_lead_matcher()
RETURNS TRIGGER AS $$
DECLARE
    payload JSONB;
    webhook_url TEXT := 'https://api.homease.ai/v1/lead-matcher'; 
BEGIN
    -- Only trigger when a new lead is generated
    IF TG_OP = 'INSERT' AND NEW.status = 'LEAD_GENERATED' THEN
        payload := jsonb_build_object(
            'project_id', NEW.id,
            'homeowner_id', NEW.homeowner_id
        );

        PERFORM net.http_post(
            url := webhook_url,
            body := payload,
            headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.matcher_service_secret', true))
        );

        -- Update status to prevent re-triggering and indicate processing has started
        UPDATE public.projects SET status = 'MATCHING_IN_PROGRESS' WHERE id = NEW.id;

        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_lead_generated
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.notify_lead_matcher();
```

#### 3. Supabase Realtime Configuration

Supabase Realtime provides the final layer of the event system, delivering notifications directly to the Next.js frontend, replacing the need for frontend polling or complex WebSockets setup.

1. **Replication:** Enable replication for the `projects` and `project_leads` tables in the Supabase dashboard.
2. **Security:** Realtime events are automatically filtered by the **Row-Level Security (RLS)** policies defined in the security plan (A2). A contractor will only receive Realtime messages about leads they are authorized to see in the `project_leads` table.
3. **Frontend Consumption:** The Next.js application will use the Supabase client library to subscribe:

| Subscription Channel | Event Type | Purpose |
| :--- | :--- | :--- |
| `supabase.channel('public:project_leads')` | `INSERT` | Notifies a contractor immediately when the Lead Matching Service inserts a new lead offer for them. |
| `supabase.channel('public:projects')` | `UPDATE` | Notifies the homeowner when their project status changes (e.g., from `MATCHING_IN_PROGRESS` to `CONTRACTOR_SELECTED`). |

This architecture successfully pivots the event-driven system from Pub/Sub to a native, highly integrated Supabase solution, maintaining asynchronous processing capabilities while centralizing control within the PostgreSQL data layer.

---

### Step 5: Frontend Architecture, Next.js Specialist

**Metadata:**

```json
- subtask_id: C2_Frontend_Structure
- title: Next.js App Router Structure & Data Fetching Strategy
- expertise: Frontend Architecture, Next.js
- complexity: medium
- output_format: Component map, file structure definition, and data fetching pattern documentation.
```

**Content (11,206 characters):**

The technical architecture pivot to Next.js App Router and Supabase requires a highly structured frontend design to maximize security, performance, and developer experience. As the Specialized Worker in Frontend Architecture, my focus is on defining the component architecture, file structure, and secure data fetching patterns that leverage Server Components and Server Actions, enforced by the pre-defined Supabase Row-Level Security (RLS).

---

## 1. Component Map and Architecture Definition

The HOMEase | AI platform is separated into three distinct, authenticated user experiences (Homeowner, Contractor, Admin) and the public marketing/authentication layer. This map defines the key components and their rendering environment (Server Component - SC or Client Component - CC).

| User Role | Route Example | Key Components (SC/CC) | Primary Function | Data Fetching Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Public** | `/login` | `AuthForm` (CC) | User authentication (Sign Up/In). | Client-side Supabase Auth calls, triggering Server Actions for session management. |
| **Homeowner** | `/dashboard` | `ProjectSummaryList` (SC), `AIPScoreWidget` (SC) | Overview of current projects and home safety score. | SC: Direct read from `projects` and `homeowner_profiles` using server client (RLS enforced). |
| | `/assess/[id]` | `AssessmentReport` (SC), `VisualizationViewer` (CC) | Display AI analysis, recommendations, and Fal.ai visualizations. | SC: Fetch `ar_assessments` and `project` data. CC: Handles 3D model rendering (WebXR/Fal.ai output). |
| | `/projects/[id]` | `ProjectDetails` (SC), `ContractorMatchList` (SC), `ProjectChat` (CC) | Lead submission, contractor selection, and real-time messaging. | SC: Fetch RLS-secured `project` and `contractor_profiles`. CC: Supabase Realtime subscription for chat. |
| **Contractor** | `/leads` | `LeadsMarketplace` (SC), `LeadFilter` (CC) | View and filter available pre-qualified leads. | SC: Paginated fetch of `project_leads` (RLS limits to leads visible/offered to the user). |
| | `/leads/[id]` | `LeadDetailCard` (SC), `ProposalGenerator` (CC) | Deep dive into a lead, including AR data and scope builder. | SC: Fetch detailed `project` data. CC: Form for proposal generation, submitting via Server Action. |
| **Admin** | `/admin/vetting` | `ContractorQueueTable` (SC), `VettingActionButtons` (CC) | Manage contractor approval and platform governance. | SC: Fetch `contractor_profiles` where `vetting_status = 'PENDING'`. |

---

## 2. Next.js App Router File Structure Definition

The directory structure utilizes Next.js Route Groups `(group)` to organize the application by user role, enabling role-based layout and middleware protection without cluttering the URL path.

```
/app
├── (public)                       # Publicly accessible routes (no authentication required)
│   ├── page.tsx                   # Marketing Landing Page
│   ├── login/page.tsx             # Login Form (CC)
│   └── signup/page.tsx            # Sign Up Form (CC)
├── (auth)                         # Authentication handlers
│   └── callback/route.ts          # Supabase Auth OAuth/Magic Link redirect handler
├── (homeowner)                    # Homeowner protected routes
│   ├── layout.tsx                 # Homeowner layout (Nav, Sidebar)
│   ├── dashboard/page.tsx         # Homeowner Dashboard (SC)
│   ├── assess
│   │   ├── page.tsx               # Start AR Assessment
│   │   └── [id]/page.tsx          # Assessment Results & Lead Creation
│   └── projects
│       ├── page.tsx               # List of all projects
│       └── [id]/page.tsx          # Individual Project Details
├── (contractor)                   # Contractor protected routes
│   ├── layout.tsx                 # Contractor layout
│   ├── dashboard/page.tsx         # Contractor Dashboard (SC)
│   └── leads
│       ├── page.tsx               # Lead Marketplace (SC)
│       └── [id]/page.tsx          # Lead Detail View
├── (admin)                        # Admin protected routes
│   ├── layout.tsx                 # Admin layout
│   └── dashboard/page.tsx         # Admin Metrics and Vetting Queue
├── api
│   └── webhooks
│       └── stripe/route.ts        # Secure Stripe Webhook Endpoint (API Route)
├── middleware.ts                  # Global session validation and role-based routing enforcement
└── global.css

/components
├── auth
│   └── AuthForm.tsx               # Shared login/signup form
├── homeowner
│   ├── AIPScoreWidget.tsx         # Homeowner dashboard component
│   └── ProjectChat.tsx            # Realtime messaging (CC)
├── contractor
│   └── LeadCard.tsx               # Component for displaying a single lead
└── shared
    └── NavHeader.tsx              # Shared UI elements

/lib
├── supabase                       # Supabase client configurations
│   ├── client.ts                  # Browser Client (for CCs and Realtime)
│   └── server.ts                  # Server Client (for SCs and SAs)
├── actions                        # All Server Actions for data mutations
│   ├── auth.ts                    # Login, Logout, Session updates
│   ├── project.ts                 # Create Project, Select Contractor
│   └── lead_management.ts         # Purchase Lead, Update Lead Status
└── services                       # External API integrations
    └── ai_processor.ts            # Logic for calling Gemini/Fal.ai (used within Server Actions)
```

---

## 3. Data Fetching and Mutation Pattern Documentation

The data strategy is built around leveraging the security and performance benefits of Server Components and Server Actions, ensuring all data access is implicitly secured by Supabase RLS.

### A. Secure Server Component Data Fetching (Read)

Server Components (SC) are used for all initial data rendering. This pattern ensures that data is fetched securely on the server, authenticated via the HTTP-only session cookies, and automatically filtered by RLS.

#### Pattern: `fetchDataFromSupabaseServer`

1. **Client Initialization:** Use the dedicated `createSupabaseServerClient` function, which reads the session cookies from the incoming request headers.
2. **RLS Enforcement:** The database query relies entirely on RLS to filter data based on the authenticated user's ID (`auth.uid()`) and role (`public.get_user_role()`).

```typescript
// Example: app/(contractor)/leads/page.tsx (Server Component)

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProjectLeadStatus } from '@/types/db_types'; // Custom type definition

interface LeadFilterParams {
    status: ProjectLeadStatus;
    page: number;
}

async function fetchContractorLeads({ status, page }: LeadFilterParams) {
    const supabase = createSupabaseServerClient();
    const PAGE_SIZE = 20;
    const offset = (page - 1) * PAGE_SIZE;

    // RLS policy 'allow_contractor_self_read' ensures only leads offered to this contractor are returned.
    const { data: leads, error, count } = await supabase
        .from('project_leads')
        .select(`
            project_id,
            lead_status,
            projects (title, urgency, zip_code, created_at)
        `, { count: 'exact' })
        .eq('lead_status', status)
        .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
        // Log error and handle potential session expiry (e.g., redirect to login via middleware)
        throw new Error(`Lead fetching failed: ${error.message}`);
    }

    return { leads, totalCount: count };
}

export default async function LeadsMarketplace({ searchParams }: { searchParams: { status?: ProjectLeadStatus, page?: string } }) {
    const status = searchParams.status || 'OFFERED';
    const page = parseInt(searchParams.page || '1');
    
    const { leads, totalCount } = await fetchContractorLeads({ status, page });

    return (
        <LeadsList leads={leads} totalCount={totalCount} currentPage={page} />
    );
}
```

### B. Data Mutation using Server Actions

Server Actions (SA) are the exclusive mechanism for data mutations (INSERT, UPDATE, DELETE). They provide a secure, server-side environment for handling form submissions and business logic, replacing the need for explicit API routes for most operations.

#### Pattern: `mutateDataWithServerAction`

1. **Security Context:** Server Actions run on the server and inherit the user's session context via the `createSupabaseServerClient` call, enforcing RLS during the mutation.
2. **Post-Mutation Logic:** Server Actions are used to handle complex business logic, such as triggering external AI services and managing cache revalidation.

```typescript
// Example: lib/actions/project.ts (Server Action)
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { processAIAnalysis } from '@/lib/services/ai_processor'; // External service call

export async function submitNewAssessmentAndLead(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const rawData = Object.fromEntries(formData.entries());

    // 1. Insert Project Record (RLS ensures homeowner_id is correct)
    const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({ 
            title: rawData.project_title as string,
            urgency: rawData.urgency_level as string,
            // ... other project details
        })
        .select('id')
        .single();

    if (projectError) {
        return { success: false, message: 'Database error creating project.' };
    }
    
    // 2. Asynchronously Trigger AI Analysis & Lead Matching
    // This is a critical step, replacing the original Google Cloud Pub/Sub flow.
    // The Server Action calls a dedicated service function which, in turn, can:
    // a) Call an external Supabase Edge Function (via RPC) or
    // b) Directly call the Gemini/Fal.ai APIs and update the database upon completion.
    
    try {
        await processAIAnalysis(newProject.id, rawData.ar_scan_data);
    } catch (aiError) {
        // Log and potentially update project status to 'ANALYSIS_FAILED'
        console.error("AI Processing failed:", aiError);
    }
    
    // 3. Revalidate affected paths to show the new project on the dashboard
    revalidatePath('/dashboard');
    revalidatePath('/projects');

    return { success: true, projectId: newProject.id, message: 'Assessment submitted for analysis.' };
}
```

### C. Realtime Data and Client Component Interaction

For interactive features like chat or immediate status changes (e.g., a lead being purchased), Client Components (CC) are necessary, using the less privileged browser-side Supabase client.

#### Pattern: `subscribeToRealtimeChanges`

1. **Client Initialization:** Uses the standard `createSupabaseBrowserClient` which manages the session JWT via cookies but operates in the browser environment.
2. **Subscription:** Subscribes to changes on specific tables and filters based on the relevant foreign key (e.g., `project_id`).

This combination ensures that the bulk of data fetching is secure and fast (SC), while user interactions and dynamic updates are handled securely via Server Actions (SA) and Realtime subscriptions (CC).

```

---

### Step 6: Cloud Storage, Security Engineering Specialist

**Metadata:**
- subtask_id: D1_Storage_Plan
- title: Storage and File Management Strategy (Supabase Storage)
- expertise: Cloud Storage, Security Engineering
- complexity: low
- output_format: Storage bucket structure and access control policy documentation.

**Content (8,795 characters):**

```

## Storage and File Management Strategy (Supabase Storage)

As the Specialized Worker focused on Cloud Storage and Security Engineering, this plan outlines the migration from Google Cloud Storage to Supabase Storage, ensuring the secure handling of sensitive AR assessment data and contractor documentation through rigorous Row-Level Security (RLS) enforcement and controlled access via Signed URLs.

---

## I. Supabase Storage Bucket Structure

The files are organized into three distinct buckets based on their sensitivity and required access patterns. All buckets will have RLS enabled by default.

| Bucket Name | Purpose | Sensitivity | Path Structure Convention |
| :--- | :--- | :--- | :--- |
| **`assessments`** | Stores raw AR scans, AI-generated reports (Gemini analysis), and Fal.ai visualizations. | High | `[homeowner_id]/[project_id]/[file_name]` |
| **`contractor_docs`** | Stores sensitive contractor vetting documents (licenses, insurance, certifications). | High | `[contractor_id]/[document_type]/[file_name]` |
| **`public_assets`** | Stores general, non-sensitive application assets (logos, default profile images, marketing visuals). | Low | `[asset_category]/[file_name]` |

### File Naming and Path Conventions

To effectively enforce RLS, the file path (`name` column in `storage.objects`) must contain explicit identifying information:

1. **Homeowner/Project Files (`assessments`):** The path must begin with the `homeowner_id` (a UUID), allowing RLS to easily check ownership against `auth.uid()`. The `project_id` is included for granular access control by contractors.
    - *Example:* `a4b1c2d3-1234-5678-abcd-ef0123456789/proj-001/kitchen_scan_01.jpg`
2. **Contractor Files (`contractor_docs`):** The path must begin with the `contractor_id` (a UUID), ensuring only the owning contractor and administrators can access the documents.
    - *Example:* `b1c2d3e4-5678-90ab-cdef-0123456789ab/license/general_liability_2025.pdf`

---

## II. Row-Level Security (RLS) Policy Definitions for Storage

RLS is enabled on the `storage.objects` table for each bucket. These policies use PostgreSQL functions, including the derived `public.get_user_role()` and a new custom function to verify contractor lead matching.

### A. Prerequisite Custom Function

To allow matched contractors to view the project assessment files, we must create a function that parses the path and cross-references the `project_leads` table.

```sql
-- Function to check if a user (contractor) is matched to the project associated with the file path
CREATE OR REPLACE FUNCTION storage.is_contractor_matched_to_assessment(user_id uuid, object_path text)
RETURNS boolean AS $$
DECLARE
    path_segments text[];
    project_uuid uuid;
BEGIN
    -- Split the path (e.g., 'homeowner_id/project_id/file.jpg')
    path_segments := regexp_split_to_array(object_path, '/');
    
    -- Check if path has enough segments (at least 2 for owner_id/project_id)
    IF array_length(path_segments, 1) < 2 THEN
        RETURN FALSE;
    END IF;

    -- Attempt to cast the second segment as the project UUID
    BEGIN
        project_uuid := path_segments[2]::uuid;
    EXCEPTION WHEN invalid_text_representation THEN
        RETURN FALSE; -- Not a valid UUID path structure
    END;

    -- Verify if the user is listed in project_leads for this project
    RETURN EXISTS (
        SELECT 1
        FROM public.project_leads pl
        WHERE pl.contractor_id = user_id
          AND pl.project_id = project_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### B. RLS Policies per Bucket

#### 1. `assessments` Bucket (High Sensitivity)

| Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`allow_homeowner_crud_own`** | `ALL` | Authenticated | `(bucket_id = 'assessments') AND (storage.foldername(name))[1] = auth.uid()::text` | Allows homeowners to upload, read, update, and delete files within their own top-level folder (identified by their UUID). |
| **`allow_contractor_read_matched`** | `SELECT` | Authenticated | `(bucket_id = 'assessments') AND (public.get_user_role() = 'CONTRACTOR') AND storage.is_contractor_matched_to_assessment(auth.uid(), name)` | Allows contractors to read assessment files only if they have been matched to the specific project referenced in the file path. |
| **`allow_admin_full_access`** | `ALL` | Authenticated | `(public.get_user_role() = 'ADMIN')` | Grants administrators full access to all assessment files. |

#### 2. `contractor_docs` Bucket (High Sensitivity)

| Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`allow_contractor_crud_own`** | `ALL` | Authenticated | `(bucket_id = 'contractor_docs') AND (storage.foldername(name))[1] = auth.uid()::text` | Allows contractors to upload, read, update, and delete their own vetting documents. |
| **`allow_admin_full_access`** | `ALL` | Authenticated | `(public.get_user_role() = 'ADMIN')` | Grants administrators full access to all contractor documents for vetting and compliance purposes. |
| **`deny_all_others`** | `ALL` | Anonymous | `FALSE` | Explicitly denies access to any unauthenticated or unauthorized user. |

#### 3. `public_assets` Bucket (Low Sensitivity)

| Policy Name | Command | Target Roles | Enforcement Logic (USING/WITH CHECK) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`allow_read_all`** | `SELECT` | Anonymous, Authenticated | `(bucket_id = 'public_assets')` | Allows anyone (public or logged in) to read general assets. |
| **`restrict_write_to_admin`** | `INSERT`, `UPDATE`, `DELETE` | Authenticated | `(public.get_user_role() = 'ADMIN')` | Only administrators are permitted to modify or add public assets, ensuring content integrity. |

---

## III. Secure Access Strategy via Signed URLs

Since the `assessments` and `contractor_docs` buckets are secured by RLS and are not publicly readable, clients cannot access them directly. Instead, the application will leverage Supabase's **Signed URL** feature for secure, temporary access.

### 1. The Need for Signed URLs

- **Security:** Prevents direct, unauthorized access to sensitive files, even if the file path is known.
- **Access Control:** The Signed URL generation process executes *after* the application has verified the user's RLS permissions, ensuring a double layer of security (application logic + database RLS).
- **Temporary Access:** URLs are time-limited (e.g., 60 seconds), minimizing the risk if a URL is intercepted.

### 2. Implementation Flow (Next.js Server Actions)

All requests for sensitive file access must be channeled through a secure Server Action (or API route) running on the Next.js server. This prevents the Supabase Service Key or any sensitive client keys from being exposed on the frontend.

| Step | Component | Action/Mechanism | Security Context |
| :--- | :--- | :--- | :--- |
| **1. Client Request** | Client Component | User clicks "View AR Report" or "Download License." Calls a Server Action (`/actions/storage.ts`). | Unauthenticated request payload (only includes file path/ID). |
| **2. Server Authentication** | Server Action | Uses the server-side Supabase client (`lib/supabase/server.ts`) to retrieve the authenticated user's session (`auth.uid()` and role). | Request is implicitly authenticated via secure HTTP-only cookies. |
| **3. Authorization Check** | Server Action / Database | The Server Action performs a database query (or relies on RLS) to ensure the authenticated user has permission to view that specific file path (e.g., checks if `auth.uid()` matches the file owner or is a matched contractor). | Verifies access rights based on application logic and RLS. |
| **4. Signed URL Generation** | Server Action | If authorized, the action calls: `supabase.storage.from('bucket_name').createSignedUrl(file_path, 60);` | Uses the elevated privileges of the server-side Supabase client (which operates with the Service Role key or a dedicated server key) to generate the URL. |
| **5. Client Access** | Client Component | The Server Action returns the temporary Signed URL (e.g., `https://[project_ref].supabase.co/storage/v1/object/sign/assessments/...`). The client then uses this URL to download or display the file. | The client gains temporary, read-only access to the file, bypassing the public access restrictions. |

### 3. Signed URL Configuration

For HOMEase | AI, a standard expiry time of **60 seconds** is recommended for immediate viewing needs (e.g., displaying an image). If the file is a large document intended for download, this may be extended to **300 seconds (5 minutes)**. The expiry time must be carefully managed to balance security and user experience.

```

---

### Step 7: Full-Stack Development, Serverless Specialist

**Metadata:**
- subtask_id: B2_Backend_Logic
- title: Backend Services Implementation Plan (Cloud Functions Replacement)
- expertise: Full-Stack Development, Serverless
- complexity: medium
- output_format: API endpoint mapping, function allocation strategy, and pseudocode for key logic flows.

**Content (11,265 characters):**

```

As the Specialized Worker focused on Backend Services and Serverless Architecture, I have planned the migration of all Google Cloud Functions logic to a strategic combination of Next.js Server Actions and Supabase Edge Functions (Deno). This plan ensures that the core business logic remains secure, scalable, and highly performant within the new stack.

## Backend Services Implementation Plan (Cloud Functions Replacement)

### 1. API Endpoint Mapping

The following table defines the primary routes and functions required for the HOMEase | AI platform, mapping them to the appropriate Next.js or Supabase component.

| Endpoint Category | Route/Function Name | Purpose | Allocation | Access/Security |
| :--- | :--- | :--- | :--- | :--- |
| **Homeowner Leads (CRUD)** | `/actions/assessments.ts` | Submission of AR assessment data and file upload initiation. | Server Action | User Session (Supabase Auth) |
| | `/actions/projects.ts` | Fetching and updating project details (e.g., setting urgency, budget). | Server Action | User Session + RLS |
| **Contractor Leads (CRUD)** | `/actions/leads.ts` | Fetching available leads, accepting/rejecting leads, messaging. | Server Action | User Session + RLS (Contractor Role) |
| **Stripe Payments** | `/actions/payments.ts` | Initiate Stripe Checkout session (synchronous call). | Server Action | User Session |
| **Stripe Webhook Listener** | `/edge/stripe-webhook` | Process asynchronous Stripe events (`payment.succeeded`, `account.updated`). | **Edge Function** (Deno) | Stripe Signature Verification |
| **AI Processing Callback** | `/edge/ai-result-ingest` | Receive and ingest results (score, recommendations) from Gemini/Fal.ai services. | **Edge Function** (Deno) | Dedicated API Key/Secret Header |
| **Lead Matching Callback** | `/edge/lead-match-ingest` | Receive final matched leads from the external matching service and insert into `project_leads`. | **Edge Function** (Deno) | Dedicated API Key/Secret Header |
| **Admin Management** | `/actions/admin.ts` | Vetting contractors, managing user roles, fetching platform analytics. | Server Action | Admin Role Check + RLS |

---

### 2. Function Allocation Strategy

The allocation strategy prioritizes using **Next.js Server Actions** for synchronous, user-initiated database mutations and data fetching, maximizing the benefits of the App Router's data flow. **Supabase Edge Functions** are reserved for tasks requiring high security, external API integration, or asynchronous processing decoupled from the user session.

| Task Description | Allocation | Rationale |
| :--- | :--- | :--- |
| **Transactional CRUD (e.g., Lead Status Update)** | **Next.js Server Action** | Direct, synchronous interaction with the Supabase client. Excellent integration with Next.js caching and revalidation features (`revalidatePath`). |
| **Initial AR Assessment Submission** | **Next.js Server Action** | Handles the form submission and coordinates the file upload to Supabase Storage. The subsequent heavy AI analysis is immediately delegated to the asynchronous event system (Postgres Triggers). |
| **Stripe Checkout Session Creation** | **Next.js Server Action** | This is a synchronous API call tied directly to the homeowner's action (clicking "Pay"). Server Actions provide a secure backend context for handling the secret keys. |
| **Stripe Webhook Handling** | **Supabase Edge Function** | **Security Critical.** Webhooks must be verified (Stripe signature) and processed immediately outside of the main application server. Edge Functions (running Deno) are lightweight, globally distributed, and ideal for this stateless, high-priority task. |
| **Ingesting AI Analysis Results** | **Supabase Edge Function** | **Backend-to-Backend Security.** This endpoint is called by the external AI service. It requires strict authorization (API key verification) and uses the Supabase Service Role Key to perform updates that trigger the next phase (Lead Formalization) in the database without being limited by RLS policies. |
| **Lead Matching Result Ingestion** | **Supabase Edge Function** | Similar to AI ingestion, this requires high security and the ability to insert multiple records (`project_leads`) efficiently and securely using the Service Role Key. |
| **Complex Lead Matching Algorithm Execution** | **External Service** (Triggered by `pg_net`) | As confirmed in the event plan (B1), the proprietary, resource-intensive matching logic remains external to avoid resource contention and maintain separation of concerns, triggered asynchronously by the database. |

---

### 3. Pseudocode for Key Logic Flows

The following pseudocode illustrates the structure and security considerations for the most critical backend flows: handling the secure ingestion of external AI results and managing the Stripe payment webhook.

#### A. Flow 1: Secure Ingestion of AI Analysis Results (Supabase Edge Function)

This Deno-based function acts as the secure callback listener for the external AI processing service (which handles Gemini/Fal.ai integration).

```typescript
// File: supabase/functions/ai-result-ingest/index.ts (Supabase Edge Function)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables: SUPABASE_SERVICE_ROLE_KEY, AI_SERVICE_SECRET

serve(async (req) => {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use Service Role Key
    );

    // --- 1. Security Check: API Key Verification ---
    const authHeader = req.headers.get('Authorization');
    const expectedSecret = Deno.env.get('AI_SERVICE_SECRET');

    if (req.method !== 'POST' || !authHeader || authHeader !== `Bearer ${expectedSecret}`) {
        return new Response('Unauthorized or Invalid Method', { status: 401 });
    }

    try {
        const payload = await req.json();
        const { assessment_id, analysis_score, recommendations, visualization_url } = payload;

        // --- 2. Input Validation ---
        if (!assessment_id || typeof analysis_score !== 'number') {
            return new Response('Invalid Payload Structure', { status: 400 });
        }

        // --- 3. Database Update (Triggers Lead Formalization) ---
        // The update below sets 'analysis_completed_at', which triggers the
        // trg_analysis_completed PL/pgSQL function (B1) to formalize the lead.
        const { error } = await supabase
            .from('ar_assessments')
            .update({
                accessibility_score: analysis_score,
                recommendations: recommendations,
                visualization_url: visualization_url,
                analysis_completed_at: new Date().toISOString(),
                status: 'ANALYSIS_COMPLETE',
            })
            .eq('id', assessment_id);

        if (error) {
            console.error('DB Update Error:', error);
            return new Response(JSON.stringify({ error: 'Database update failed' }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, message: 'Assessment updated and lead formalized.' }), { status: 200 });

    } catch (e) {
        console.error('Processing Error:', e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
});
```

#### B. Flow 2: Stripe Payment Webhook Processing (Supabase Edge Function)

This function handles critical payment confirmations, updating the project status immediately upon successful payment without involving the main Next.js server.

```typescript
// File: supabase/functions/stripe-webhook/index.ts (Supabase Edge Function)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.11.0';

// Environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
});

serve(async (req) => {
    // --- 1. Security Check: Stripe Signature Verification ---
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const rawBody = await req.text();
    let event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, signature!, webhookSecret!);
    } catch (err) {
        return new Response(JSON.stringify({ error: `Signature verification failed: ${err.message}` }), { status: 400 });
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use Service Role Key
    );

    // --- 2. Event Handling Logic ---
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const projectId = session.metadata?.project_id; // Custom metadata

            if (session.payment_status === 'paid' && projectId) {
                const { error } = await supabase
                    .from('projects')
                    .update({
                        status: 'PAYMENT_RECEIVED',
                        stripe_session_id: session.id,
                        payment_amount: session.amount_total,
                        contractor_payout_pending: true,
                    })
                    .eq('id', projectId);

                if (error) console.error('Payment DB Update Error:', error);
            }
            break;

        case 'account.updated':
            // Handle contractor Stripe Connect account updates
            // (e.g., verification status change)
            // Logic to update `contractor_profiles` table...
            break;
            
        // ... other events (e.g., invoice.payment_failed)
    }

    // 3. Acknowledge Receipt
    return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

#### C. Flow 3: Contractor Accepts Lead (Next.js Server Action)

This is a simple, synchronous user action handled efficiently by a Server Action, leveraging the user's session and RLS.

```typescript
// File: app/actions/leads.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Allows a contractor to accept a specific lead offer.
 */
export async function acceptLead(leadId: string) {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'contractor') {
        throw new Error('Contractor authentication required.');
    }

    // 1. Transactional Update
    const { error } = await supabase.rpc('accept_project_lead', {
        p_lead_id: leadId,
        p_contractor_id: user.id
    });
    // NOTE: Using a PostgreSQL stored procedure (RPC) is ideal here to ensure 
    // atomic operations, such as ensuring only one contractor can claim the lead.

    if (error) {
        console.error('Lead acceptance failed:', error);
        throw new Error('Failed to accept lead. It may have already been claimed.');
    }

    revalidatePath('/dashboard/contractor/leads');
    return { success: true };
}
```

```

---

### Step 8: API Integration, Security Engineering Specialist

**Metadata:**
- subtask_id: C1_AI_Integration
- title: AI Service Integration & Security Strategy (Gemini/Fal.ai)
- expertise: API Integration, Security Engineering
- complexity: medium
- output_format: Secure integration flow diagram and API key management strategy.

**Content (8,554 characters):**

```

The following plan details the secure integration strategy for the external AI services (Google Gemini for analysis and Fal.ai for visualization) within the Next.js App Router and Supabase architecture. This strategy ensures that all sensitive API keys are protected by proxying calls through secure, asynchronous backend services.

---

## AI Service Integration & Security Strategy (Gemini/Fal.ai)

### 1. Secure Integration Flow Diagram: Asynchronous AI Assessment

Due to the heavy, multi-step nature of the AR assessment (Gemini analysis + Fal.ai visualization) and the requirement to protect external API keys, the process is implemented as a secure, asynchronous, event-driven workflow. The Next.js application initiates the process, but the heavy lifting and external API calls are delegated to a dedicated, secure **External AI Orchestrator Service** (an isolated microservice, potentially hosted on a lightweight platform like Vercel Functions or a dedicated container, completely separate from the public-facing Next.js/Supabase environment).

#### Flow Steps

| Step | Component | Action | Security/Key Requirement |
| :--- | :--- | :--- | :--- |
| **1. Initiation** | **Homeowner Client** | Submits AR assessment data (e.g., image paths from Supabase Storage) via a form. | User session authenticated by Supabase Auth. |
| **2. Submission** | **Next.js Server Action** | Receives the submission, validates user session, and inserts a new record into the `ar_assessments` table with `status: PENDING_ANALYSIS`. | Supabase Client (RLS enforces user ownership). |
| **3. Trigger Outbound** | **Supabase Database (Postgres Trigger)** | The `INSERT` operation fires a PL/pgSQL trigger (`trg_initiate_ai_analysis`). This trigger uses the `pg_net` extension to make an asynchronous, authenticated request. | `pg_net` uses a dedicated, non-public API key (stored in Supabase Vault) to authenticate with the Orchestrator. |
| **4. Orchestration** | **External AI Orchestrator Service** | Receives the request (containing the assessment ID and file paths). Validates the inbound API key. | Environment variables securely holding the `pg_net` key and the Orchestrator's internal secrets. |
| **5. Analysis** | **External AI Orchestrator Service** | Calls the **Google Gemini API** for hazard identification and recommendations. | Uses the highly sensitive **Gemini API Key** (securely stored in the orchestrator's environment). |
| **6. Visualization** | **External AI Orchestrator Service** | Calls the **Fal.ai API** to generate the "after" visualization image. | Uses the highly sensitive **Fal.ai API Key** (securely stored in the orchestrator's environment). |
| **7. Callback** | **External AI Orchestrator Service** | Sends the final results (score, recommendations, visualization URL) to the secure Supabase Edge Function callback endpoint (`/edge/ai-result-ingest`). | **Authorization Header:** Sends a specific, pre-shared secret (e.g., `AI_SERVICE_SECRET`) to authenticate the callback. |
| **8. Ingestion** | **Supabase Edge Function** | Verifies the `AI_SERVICE_SECRET` header. If valid, uses the **Supabase Service Role Key** to update the `ar_assessments` record with the results and change status to `ANALYSIS_COMPLETE`. | Requires `AI_SERVICE_SECRET` (stored in Edge Function environment) and `SUPABASE_SERVICE_ROLE_KEY` (stored in Edge Function environment). |
| **9. Finalization** | **Supabase Database (Postgres Trigger)** | The status update triggers the final lead formalization and contractor matching process. | Internal database PL/pgSQL logic. |

---

### 2. API Key Management Strategy

A robust key management strategy is essential to prevent unauthorized access, data breaches, and service abuse. We will utilize a layered approach combining dedicated environment variables and Supabase Vault for PostgreSQL secrets.

#### A. Key Categorization and Storage Location

| Key/Secret Name | Purpose | Required By | Storage Location | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **GEMINI_API_KEY** | Access Google Gemini for analysis. | External AI Orchestrator Service | Secure Environment Variables (Orchestrator Host) | Highest (Read/Write) |
| **FAL_AI_API_KEY** | Access Fal.ai for visualization. | External AI Orchestrator Service | Secure Environment Variables (Orchestrator Host) | Highest (Read/Write) |
| **ORCHESTRATOR_INGRESS_KEY** | Authenticate the outbound request from `pg_net` to the Orchestrator (Step 3). | Supabase Database (`pg_net`) & Orchestrator | **Supabase Vault** (Postgres Secret) & Orchestrator Environment | High (Read-Only) |
| **AI_SERVICE_SECRET** | Authenticate the inbound callback from the Orchestrator to the Edge Function (Step 7). | Orchestrator & Supabase Edge Function | Edge Function Environment Variables (Deno) | High (Read-Only) |
| **SUPABASE_SERVICE_ROLE_KEY** | Allows Edge Functions to bypass RLS for administrative/backend updates. | Supabase Edge Functions | Edge Function Environment Variables (Deno) | Critical (Admin) |
| **STRIPE_SECRET_KEY** | Stripe API key for creating Checkout sessions and processing payments. | Next.js Server Actions & Supabase Edge Function | Next.js Environment Variables & Edge Function Environment | Critical (Admin) |

#### B. Implementation Details for Supabase Components

**1. Supabase Vault for Postgres Secrets (`pg_net` Authentication)**

The `pg_net` extension, used by the Postgres Trigger to initiate the AI workflow, requires secure storage for its API keys. Supabase Vault is the secure, recommended mechanism for this.

- **Storage:** The `ORCHESTRATOR_INGRESS_KEY` is encrypted and stored within Supabase Vault.
- **Usage (PL/pgSQL):** The `pg_net` function accesses this key securely via a reference, ensuring the key text is never exposed in the database code or logs.

```sql
-- Example PL/pgSQL using pg_net and Supabase Vault
CREATE OR REPLACE FUNCTION initiate_ai_analysis(assessment_id uuid)
RETURNS void AS $$
DECLARE
    orchestrator_key text;
BEGIN
    -- Securely retrieve the key from Supabase Vault
    SELECT decrypted_secret INTO orchestrator_key
    FROM vault.decrypted_secret('orchestrator_ingress_key_id');

    -- Make the secure HTTP request
    PERFORM net.http_post(
        url := 'https://orchestrator.homease.ai/api/analyze',
        body := json_build_object('assessment_id', assessment_id),
        headers := json_build_object('Authorization', 'Bearer ' || orchestrator_key)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**2. Supabase Edge Function Environment Variables (Deno)**

Edge Functions handle the secure ingestion of results and require the highest level of security for the Service Role Key.

- **Storage:** The `SUPABASE_SERVICE_ROLE_KEY` and the `AI_SERVICE_SECRET` are injected directly into the Deno runtime environment of the Edge Function via the Supabase Dashboard/CLI.
- **Access:** Edge Functions access these variables using `Deno.env.get()`. This ensures the secrets are isolated from the Next.js application and only available within the secure Edge runtime.

**Security Measure:** The Edge Function must perform a strict header validation check on every incoming request to the `/edge/ai-result-ingest` endpoint before using the powerful Service Role Key to update the database.

```typescript
// Inside /edge/ai-result-ingest (Edge Function)
const expectedSecret = Deno.env.get('AI_SERVICE_SECRET');
const authHeader = req.headers.get('Authorization');

// Strict comparison to prevent unauthorized updates
if (authHeader !== `Bearer ${expectedSecret}`) {
    return new Response('Unauthorized Callback', { status: 401 });
}

// Only proceed if authorized: initialize client with Service Role Key
const supabase = createClient(..., Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
```

#### C. Orchestrator Service Key Management

The External AI Orchestrator Service, which directly interfaces with Gemini and Fal.ai, must use its host platform's most secure environment variable or secret management system (e.g., AWS Secrets Manager, Vercel Secrets, or similar). These keys **must not** be stored in the Supabase environment, maintaining a critical security boundary.

- **Rotation:** All API keys (Gemini, Fal.ai, and the internal secrets) should be subject to a mandatory rotation schedule (e.g., quarterly) to minimize risk exposure.
- **Principle of Least Privilege:** The API keys used should be scoped as narrowly as possible if the AI providers allow it, limiting their capabilities only to the necessary analysis and visualization tasks.

```

---

### Step 9: DevOps, CI/CD Specialist

**Metadata:**
- subtask_id: D2_DevOps_CI_CD
- title: Deployment & CI/CD Pipeline Definition
- expertise: DevOps, CI/CD
- complexity: medium
- output_format: CI/CD workflow definition and deployment environment setup guide.

**Content (0 characters):**

```

```

---

### Step 10: Master Coordination, Technical Writing Specialist

**Metadata:**
- subtask_id: E1_Synthesis
- title: Final Architecture Synthesis and Documentation
- expertise: Master Coordination, Technical Writing
- complexity: low
- output_format: Comprehensive Technical Architecture Plan and Final Diagram.

**Content (11,783 characters):**

```

# HOMEase | AI Technical Architecture Plan: Next.js App Router & Supabase

**Role:** Specialized Worker (Master Coordination, Technical Writing)
**Objective:** To define a comprehensive, secure, and scalable technical architecture plan for the HOMEase | AI lead generation platform, leveraging Next.js App Router and Supabase as the unified, serverless stack, replacing the original GCP/Firebase architecture.

---

## 1. Executive Summary and Architectural Principles

The HOMEase | AI platform is pivoting to a unified, open-source-based serverless stack centered around **Next.js 15 (App Router)** and **Supabase**. This architectural pivot maintains the core principles of the original plan—scalability, security, and event-driven processing—while consolidating the data, authentication, storage, and compute layers into a single, cohesive ecosystem.

### Key Architectural Advantages of the Pivot

| Feature | Original GCP/Firebase Stack | New Next.js/Supabase Stack | Benefit |
| :--- | :--- | :--- | :--- |
| **Database** | Firebase Firestore (NoSQL) | PostgreSQL (Relational) | Superior relational integrity, complex querying (for contractor matching), and built-in geo-spatial capabilities. |
| **Backend Compute** | Google Cloud Functions | Next.js Server Actions & Supabase Edge Functions | Reduced complexity, improved developer experience, and Deno-powered performance for critical tasks. |
| **Eventing** | Google Cloud Pub/Sub | PostgreSQL Triggers (`pg_net`) & Supabase Realtime | Native, database-centric eventing that simplifies asynchronous workflows and ensures data consistency. |
| **Security** | Firebase Auth + GCP IAM | Supabase Auth + Row-Level Security (RLS) | Unified security model where RLS enforces policy directly at the data layer for both database and storage access. |

---

## 2. Core Technology Stack Definition

| Component | Technology/Service | Role and Function |
| :--- | :--- | :--- |
| **Frontend/Server** | Next.js 15 (App Router) | Handles routing, UI rendering (Server Components), and secure data mutations (Server Actions). Deployed on Vercel. |
| **Database** | Supabase (PostgreSQL) | Primary data store for projects, leads, contractors, and assessments. Enforces relational integrity and business logic via SQL functions/triggers. |
| **Authentication** | Supabase Auth | Handles user registration, sign-in, session management, and JWT generation. Integrated with Next.js via secure cookies. |
| **Storage** | Supabase Storage | Secure storage for AR scan images, AI reports, and sensitive contractor vetting documents. Access controlled by RLS and Signed URLs. |
| **Edge Compute** | Supabase Edge Functions (Deno) | High-performance, secure serverless functions used for handling sensitive tasks like Stripe Webhooks and the AI result ingestion callback, leveraging the Supabase Service Role Key. |
| **Asynchronous Events** | PostgreSQL Triggers & `pg_net` | Replaces Pub/Sub. Triggers initiate asynchronous workflows (e.g., AI analysis, contractor matching) upon database mutations. |
| **External AI** | Google Gemini, Fal.ai | External APIs for hazard analysis and visualization generation. Accessed via a secure, isolated **External AI Orchestrator Service**. |
| **Payments** | Stripe Connect & Checkout | Contractor onboarding, secure payment processing, and fund disbursement. |

---

## 3. Data Layer, Security, and RLS

The relational nature of PostgreSQL is crucial for the complex lead matching and transaction requirements of HOMEase | AI.

### 3.1. Database Schema Focus Areas

The schema will be designed to support the three primary user roles and the core lead generation workflow.

1. **`profiles`:** Stores user metadata (role: `HOMEOWNER`, `CONTRACTOR`, `ADMIN`), linked directly to `auth.users`.
2. **`projects`:** Core table for homeowner projects, capturing title, urgency, and final status.
3. **`ar_assessments`:** Stores the input data, status (`PENDING_ANALYSIS`, `ANALYSIS_COMPLETE`), and the final AI recommendations/score from Gemini.
4. **`contractor_profiles`:** Stores contractor-specific data (certifications, service areas, vetting status, Stripe Account ID).
5. **`project_leads`:** The critical junction table for matching. Tracks which contractor has been offered which lead, the lead price, and the status (`OFFERED`, `PURCHASED`, `REJECTED`).

### 3.2. Row-Level Security (RLS) Strategy

RLS is the foundation of the security model, ensuring that all data access is automatically filtered based on the authenticated user's role and ID.

| Use Case | RLS Policy Enforcement Mechanism |
| :--- | :--- |
| **Homeowner Data** | `USING (auth.uid() = homeowner_id)` |
| **Contractor Lead Access** | `USING (public.get_user_role() = 'CONTRACTOR' AND EXISTS (SELECT 1 FROM project_leads WHERE project_leads.project_id = projects.id AND project_leads.contractor_id = auth.uid()))` |
| **Admin Access** | `USING (public.get_user_role() = 'ADMIN')` (Bypasses most restrictions) |
| **Storage Access** | RLS policies on `storage.objects` using file path segmentation and the `storage.is_contractor_matched_to_assessment` function (as detailed in D1). |

---

## 4. Compute and Asynchronous Event Management

The serverless backend logic is distributed across Next.js Server Actions, Supabase Edge Functions, and PostgreSQL Triggers, effectively replacing Google Cloud Functions and Pub/Sub.

### 4.1. Next.js Server Actions (Synchronous Logic)

Server Actions handle user-initiated data mutations and complex business logic that requires immediate feedback.

- **Examples:** User sign-up/login, creating a new project record, submitting a proposal, initiating a Stripe Checkout session.
- **Security:** Inherit session cookies, ensuring RLS is enforced during the mutation.

### 4.2. Supabase Edge Functions (Secure API & Webhooks)

Edge Functions are used for highly secure, high-performance tasks that require the elevated **Supabase Service Role Key** or must handle external callbacks.

- **Stripe Webhooks:** A dedicated Edge Function securely receives and validates Stripe events (e.g., `payment_succeeded`). It uses the Service Role Key to update the database state, bypassing RLS to ensure the transaction is recorded regardless of the user's current session.
- **AI Result Ingestion:** The secure callback endpoint (`/edge/ai-result-ingest`) from the External AI Orchestrator (C1) is an Edge Function. It validates the `AI_SERVICE_SECRET` before using the Service Role Key to update the `ar_assessments` table.

### 4.3. PostgreSQL Triggers and `pg_net` (Asynchronous Eventing)

Postgres Triggers manage the event-driven decoupling of the lead workflow, replacing Pub/Sub.

| Trigger Event | Triggered Action | Purpose |
| :--- | :--- | :--- |
| `INSERT` on `ar_assessments` | Calls `pg_net` to hit the External AI Orchestrator. | Initiates the lengthy Gemini/Fal.ai analysis without blocking the user interface. |
| `UPDATE` on `ar_assessments` (status change to `ANALYSIS_COMPLETE`) | Calls a PL/pgSQL function (`fn_run_matching_algorithm`). | Executes the core business logic: runs the contractor matching and inserts records into the `project_leads` table. |
| `INSERT` on `project_leads` | Sends a Realtime notification. | Triggers an immediate notification to the matched contractor via the Supabase Realtime service. |

---

## 5. Critical Workflow Integration

### 5.1. Secure AI Assessment Workflow (C1 Integration)

The workflow is designed to protect the highly sensitive Gemini and Fal.ai API keys by isolating them in a separate, dedicated **External AI Orchestrator Service**.

1. **Submission:** Homeowner submits data via Next.js Server Action.
2. **Trigger:** DB INSERT triggers `pg_net` (using a secret from Supabase Vault) to call the Orchestrator.
3. **Processing:** Orchestrator uses its internal environment variables (securely holding the AI keys) to perform the analysis and visualization.
4. **Callback:** Orchestrator sends results to the secure Supabase Edge Function (`/edge/ai-result-ingest`), authenticated by the `AI_SERVICE_SECRET`.
5. **Update:** Edge Function updates the `ar_assessments` table using the Service Role Key.

### 5.2. Secure Storage and Access (D1 Integration)

All sensitive files are stored in Supabase Storage buckets (`assessments`, `contractor_docs`).

- **Uploads:** Handled by Next.js Server Actions, which validate the user and upload the file using the server-side Supabase client.
- **Downloads/Viewing:** Clients **cannot** directly access files. They must request a temporary **Signed URL** via a Server Action. The Server Action verifies the user's RLS permissions (e.g., is the user the homeowner, or is the contractor matched to the project?) before generating the time-limited URL.

---

## 6. Payment and Financial Integration (Stripe)

Stripe is integrated to manage the contractor marketplace and secure transactions.

1. **Contractor Onboarding (Stripe Connect):**
    - Contractors are onboarded using Stripe Connect (likely Express or Custom accounts).
    - A Next.js Server Action initiates the Stripe OAuth flow, and a dedicated API Route handles the final callback, securely storing the resulting `stripe_account_id` in the `contractor_profiles` table.
2. **Lead Purchase & Project Payment (Stripe Checkout):**
    - **Lead Purchase:** When a contractor purchases a lead, a Server Action calls the Stripe API to charge the contractor's saved payment method.
    - **Project Completion:** When a homeowner selects a contractor, a Server Action creates a secure Stripe Checkout session for the project cost.
3. **Webhook Reconciliation:**
    - The secure Stripe Webhook Edge Function receives events, ensuring the database state is updated accurately (e.g., confirming payment, initiating disbursements to the contractor's Stripe Connect account, and updating the project status to `PAID`).

---

## 7. Final Architecture Diagram

The following diagram illustrates the component interactions and the flow of data, emphasizing the secure, asynchronous nature of the AI assessment and lead matching process.

```mermaid
graph TD
    subgraph Client Layer
        A[Homeowner Client (CC)]
        B[Contractor Client (CC)]
    end

    subgraph Next.js App Router (Vercel)
        C[Next.js Server Components]
        D[Next.js Server Actions (SAs)]
        E[Middleware (Auth/Role Check)]
    end

    subgraph Supabase Ecosystem
        F[Supabase Auth]
        G[PostgreSQL Database (RLS)]
        H[Postgres Triggers / PL/pgSQL]
        I[Supabase Storage (RLS)]
        J[Supabase Edge Functions (Deno)]
        K[Supabase Realtime]
    end

    subgraph External Services
        L[External AI Orchestrator (Secure Host)]
        M[Google Gemini API]
        N[Fal.ai API]
        O[Stripe API (Connect/Checkout)]
    end

    A -- 1. Submit AR Data --> D
    D -- 2. Auth & Insert Project --> G
    G -- 3. INSERT Event --> H
    H -- 4. pg_net (Vault Secret) --> L
    
    L -- 5. Call Analysis/Viz Keys --> M
    L -- 6. Call Visualization Key --> N
    L -- 7. Secure Callback (AI_SERVICE_SECRET) --> J{AI Ingestion Endpoint}
    J -- 8. Update DB (Service Role Key) --> G
    
    G -- 9. ANALYSIS_COMPLETE Event --> H
    H -- 10. Run Matching Algorithm / Insert Leads --> G
    G -- 11. New Lead Event --> K
    
    K -- 12. Realtime Update --> B
    
    B -- 13. Request Lead Details / Purchase --> D
    D -- 14. Generate Signed URL (Storage Access Check) --> I
    I -- 15. Return Signed URL --> B
    
    D -- 16. Initiate Payment (SA) --> O
    O -- 17. Webhook Event --> J{Stripe Webhook Endpoint}
    J -- 18. Update Payment Status (Service Role Key) --> G
    
    C -- 19. Initial Render (Secure Read) --> G
    E --> C
    
    D -- 20. Upload Files --> I
```

---

```json
### Step 11: Results Synthesizer

**Metadata:**
- synthesis_data: {'recommendations': ['**Prioritize RLS Implementation:** Before writing any application code, fully implement and test all RLS policies on the database and storage layers. This ensures security is enforced at the source, regardless of frontend logic.', '**Establish External Orchestrator:** Immediately develop and deploy the External AI Orchestrator Service to securely manage the Gemini/Fal.ai API keys and handle the complex, multi-step AI processing workflow, ensuring it is only accessible via the authenticated `pg_net` webhook.', '**Utilize Supabase Vault:** Store all high-value, non-user-specific secrets (e.g., `ORCHESTRATOR_INGRESS_KEY`, Stripe secrets) in Supabase Vault rather than standard environment variables to enhance protection against exposure.', '**Adopt Supabase CLI for Migrations:** Implement a strict CI/CD process using the Supabase CLI to manage all database schema changes (including RLS, Triggers, and Functions) as version-controlled migrations, ensuring consistency across development, staging, and production environments.', '**Implement Role-Based Middleware:** Use Next.js middleware in conjunction with Supabase Auth to enforce role-based routing (Homeowner, Contractor, Admin) at the edge, preventing unauthorized users from even accessing restricted routes.'], 'gaps_identified': ['A dedicated, detailed result for Subtask 8 (Deployment & CI/CD Pipeline Definition) was not provided. The synthesis will include a high-level, actionable CI/CD plan based on industry best practices for the Next.js/Supabase stack to ensure the architecture is fully deployable.'], 'key_findings': ['The core architectural pivot successfully replaces all GCP/Firebase components with native Next.js/Supabase equivalents, maintaining the serverless, event-driven nature of the platform.', 'Row-Level Security (RLS) on PostgreSQL and Supabase Storage is the central security mechanism, enforcing role-based access control directly at the data layer for both database queries and file access.', 'The event-driven architecture is replaced by a database-centric model using PostgreSQL Triggers and the `pg_net` extension, which allows for reliable, asynchronous communication with external services (AI Orchestrator, Lead Matcher) without relying on a separate message queue (Pub/Sub).', 'Next.js Server Actions handle all synchronous user-initiated logic, while Supabase Edge Functions are reserved for critical, high-security tasks like webhook processing and AI result ingestion, leveraging the Supabase Service Role Key for administrative database access.', 'Sensitive external API keys (Gemini, Fal.ai) are securely isolated within a dedicated External AI Orchestrator Service, ensuring they are never exposed to the Next.js application or the public Supabase environment.'], 'quality_assessment': 'excellent', 'integrated_response': "# HOMEase | AI Technical Architecture Plan: Next.js App Router & Supabase\n\nThis document outlines the comprehensive technical architecture pivot for the HOMEase | AI platform, transitioning from the original Google Cloud Platform (GCP) and Firebase stack to a unified, serverless architecture built on **Next.js 15 App Router** and **Supabase**. This new stack is designed for high scalability, superior data integrity, and robust security, meeting all functional requirements for the lead generation platform.\n\n## 1. Architectural Principles and Stack Overview\n\nThe new architecture centralizes data, authentication, and event processing within the Supabase ecosystem, leveraging PostgreSQL's advanced features for complex business logic and security.\n\n| Original Component (GCP/Firebase) | New Component (Next.js/Supabase) | Functionality Replacement |\n| :--- | :--- | :--- |\n| Firebase Firestore (NoSQL) | **Supabase PostgreSQL** | Relational Data Store, Complex Querying |\n| Firebase Auth | **Supabase Auth** | User Authentication and Session Management |\n| Google Cloud Functions | **Next.js Server Actions & Supabase Edge Functions** | Backend Business Logic and API Handling |\n| Google Cloud Pub/Sub | **PostgreSQL Triggers (`pg_net`) & Supabase Realtime** | Asynchronous Event-Driven Workflows |\n| Google Cloud Storage | **Supabase Storage** | Secure File and Document Storage |\n\n## 2. Data Layer Redesign and Security Foundation\n\nThe migration from NoSQL (Firestore) to Relational SQL (PostgreSQL) is critical for enforcing data integrity and optimizing the complex contractor matching algorithms.\n\n### 2.1. Relational Data Model (DDL Summary)\n\nThe database schema is normalized around core entities, ensuring explicit relationships and referential integrity.\n\n| Table Name | Purpose | Key Relationships | Critical Fields |\n| :--- | :--- | :--- | :--- |\n| **`profiles`** | Base user data, linked to `auth.users`. | 1:1 `auth.users` | `role` (ENUM: HOMEOWNER, CONTRACTOR, ADMIN) |\n| **`projects`** | Core lead record, derived from assessments. | 1:1 `ar_assessments`, N:1 `homeowner_profiles` | `status` (ENUM), `urgency`, `selected_contractor_id` |\n| **`ar_assessments`** | Raw AR scan data, Gemini analysis output, Fal.ai links. | N:1 `homeowner_profiles` | `accessibility_score`, `hazard_list` (JSONB) |\n| **`contractor_profiles`** | Specific contractor data and vetting status. | 1:1 `profiles` | `caps_certified`, `vetting_status`, `average_rating` |\n| **`project_leads`** | Junction table tracking lead distribution and purchase. | N:M `projects` $\\leftrightarrow$ `contractor_profiles` | `lead_price`, `lead_status` (OFFERED, PURCHASED) |\n\n### 2.2. Row-Level Security (RLS) Strategy\n\nRLS is the primary security mechanism, enforced on all critical tables (`profiles`, `projects`, `ar_assessments`, `project_leads`, and Supabase Storage).\n\n*   **Role-Based Access:** Access is determined by the `public.get_user_role()` function, which reads the user's role from the `profiles` table.\n*   **Ownership Enforcement:** Homeowners are restricted to viewing and modifying records where `homeowner_id = auth.uid()`.\n*   **Contractor Access Control:** Contractors can only `SELECT` from the `projects` table if their ID is present in the `project_leads` junction table for that specific project, ensuring they only see leads they have been matched with or purchased.\n\n**Example RLS Policy on `projects` (SELECT for CONTRACTOR):**\n```sql\nUSING (EXISTS (SELECT 1 FROM public.project_leads WHERE project_id = id AND contractor_id = auth.uid()))\n```\n\n## 3. Compute and Event-Driven Architecture (GCP Replacements)\n\nThe backend logic (replacing Google Cloud Functions) is split between synchronous Server Actions and asynchronous Edge Functions/Triggers (replacing Pub/Sub).\n\n### 3.1. Compute Allocation Strategy\n\n| Logic Type | Component | Rationale |\n| :--- | :--- | :--- |\n| **Synchronous CRUD** | **Next.js Server Actions** | Handles user-initiated mutations (e.g., form submission, project updates, Stripe Checkout initiation). Securely runs on the server, enforcing RLS. |\n| **Secure Callbacks/Webhooks** | **Supabase Edge Functions (Deno)** | Handles high-security, stateless tasks like Stripe Webhook verification and the AI result ingestion callback, leveraging the **Supabase Service Role Key** to bypass RLS for administrative updates. |\n| **Asynchronous Orchestration** | **PostgreSQL Triggers + `pg_net`** | Decouples long-running processes (AI analysis, lead matching) from the user request, ensuring non-blocking performance. |\n\n### 3.2. Event-Driven Workflow (Pub/Sub Replacement)\n\nThe core AR assessment and lead matching workflow is now managed by database events:\n\n1.  **AR Analysis Initiation:**\n    *   **Action:** A Server Action inserts a new record into `ar_assessments`.\n    *   **Trigger:** The `trg_assessment_created` trigger fires `public.notify_ai_processor()`.\n    *   **Mechanism:** This function uses the `pg_net` extension to send an asynchronous, authenticated HTTP POST request to the **External AI Orchestrator Service**.\n2.  **Lead Formalization & Matching:**\n    *   **Action:** The Orchestrator calls the secure Edge Function callback, which updates `ar_assessments` (setting `analysis_completed_at`).\n    *   **Trigger:** The `trg_analysis_completed` trigger fires `public.create_project_from_assessment()`, which synchronously inserts the formal lead into the `projects` table (status: `LEAD_GENERATED`).\n    *   **Matching Initiation:** A subsequent trigger (`trg_lead_generated`) fires, using `pg_net` to call the **External Lead Matching Service**.\n3.  **Realtime Notification:**\n    *   **Action:** The Lead Matching Service inserts records into `project_leads`.\n    *   **Mechanism:** Supabase Realtime detects the `INSERT` and broadcasts the new lead offer instantly to the relevant contractor's dashboard, filtered by their RLS permissions.\n\n## 4. AI Service Integration and Key Management\n\nThe integration of Google Gemini and Fal.ai is secured by isolating the API keys from the Next.js application and the public Supabase environment.\n\n### 4.1. Key Isolation via External Orchestrator\n\n*   **External AI Orchestrator Service:** A dedicated, isolated microservice (separate from Vercel/Supabase) holds the highly sensitive **GEMINI\\_API\\_KEY** and **FAL\\_AI\\_API\\_KEY** as secure environment variables.\n*   **Secure Ingress:** The Orchestrator only receives requests authenticated by the **ORCHESTRATOR\\_INGRESS\\_KEY**, which is securely stored in **Supabase Vault** and accessed only by the `pg_net` trigger function.\n*   **Secure Egress (Callback):** The Orchestrator sends results to the Supabase Edge Function (`/edge/ai-result-ingest`) authenticated by the **AI\\_SERVICE\\_SECRET** header, preventing unauthorized database updates.\n\n### 4.2. Storage and Secure File Access\n\nSupabase Storage replaces Google Cloud Storage, with RLS applied to all sensitive buckets.\n\n| Bucket | Access Control Strategy |\n| :--- | :--- |\n| **`assessments`** | RLS allows access only to the owning homeowner or a contractor explicitly matched to the project (verified via the `storage.is_contractor_matched_to_assessment` function). |\n| **`contractor_docs`** | RLS allows access only to the owning contractor and administrators. |\n| **Access Method** | **Signed URLs** are mandatory. All client requests for sensitive files must be proxied through a Next.js Server Action, which verifies the user's RLS permissions and generates a time-limited (e.g., 60-second) URL for temporary access. |\n\n## 5. Next.js App Router Structure and Data Flow\n\nThe frontend architecture maximizes the performance and security benefits of the App Router.\n\n*   **Server Components (SC):** Used for all initial data fetching (e.g., `/leads`, `/dashboard`). SCs use the server-side Supabase client, which reads the session cookie and implicitly enforces RLS, ensuring fast, secure, and authenticated rendering.\n*   **Server Actions (SA):** Used exclusively for data mutations (e.g., `submitNewAssessmentAndLead`, `acceptLead`). SAs provide a secure server context, eliminating the need for separate API routes for most application logic and enabling seamless cache revalidation (`revalidatePath`).\n*   **Route Groups:** The application is organized into role-based route groups (e.g., `(homeowner)`, `(contractor)`, `(admin)`) to apply specific layouts and middleware for role-based access control.\n\n## 6. Deployment and CI/CD Pipeline\n\nThe deployment strategy is built around the highly integrated Vercel/Supabase workflow, utilizing GitHub Actions for automation.\n\n| Component | Deployment Target | CI/CD Automation | Secret Management |\n| :--- | :--- | :--- | :--- |\n| **Next.js App** | **Vercel** | **GitHub Actions:** Automated build and deployment upon push to `main` branch. Vercel's native integration handles secure environment variable injection. | Vercel Environment Variables (for public keys and Server Action secrets). |\n| **Supabase Database** | **Supabase Platform** | **Supabase CLI & GitHub Actions:** Migrations managed via the Supabase CLI (`supabase db push`). A dedicated action ensures that schema changes (including RLS, Triggers, and Functions) are reviewed and applied before deployment. | Supabase Dashboard/CLI (for Service Role Key) and **Supabase Vault** (for `pg_net` secrets like `ORCHESTRATOR_INGRESS_KEY`). |\n| **Edge Functions** | **Supabase Platform** | Deployed via Supabase CLI as part of the database migration process. | Supabase Edge Function Environment Variables (for `SUPABASE_SERVICE_ROLE_KEY`, `AI_SERVICE_SECRET`, etc.). |\n\n## Final Architecture Diagram\n\n```mermaid\ngraph TD\n    subgraph Client Layer\n        A[Homeowner/Contractor Browser (CC)]\n    end\n\n    subgraph Next.js App Router (Vercel)\n        C[Server Components (SC)]\n        D[Server Actions (SAs)]\n    end\n\n    subgraph Supabase Ecosystem\n        F[Supabase Auth]\n        G[PostgreSQL DB (RLS)]\n        H[Postgres Triggers / pg_net]\n        I[Supabase Storage (RLS)]\n        J[Supabase Edge Functions]\n        K[Supabase Realtime]\n    end\n\n    subgraph External Services\n        L[External AI Orchestrator]\n        M[Gemini/Fal.ai APIs]\n        N[Stripe API/Webhooks]\n    end\n\n    A -- 1. Authenticate --> F\n    F -- 2. Session Cookie --> C & D\n    \n    C -- 3. Secure Data Read (RLS enforced) --> G\n    \n    D -- 4. Mutation (e.g., Submit Assessment) --> G\n    G -- 5. DB Insert Event --> H\n    H -- 6. pg_net (Vault Secret) --> L\n    \n    L -- 7. Call AI Keys --> M\n    L -- 8. Secure Callback (AI_SERVICE_SECRET) --> J{AI Ingestion}\n    J -- 9. Update DB (Service Role Key) --> G\n    \n    G -- 10. Lead Formalized Event --> H\n    H -- 11. pg_net to Lead Matcher --> External Lead Matching Service\n    \n    External Lead Matching Service -- 12. Insert Matched Leads --> G\n    G -- 13. New Lead Event --> K\n    K -- 14. Realtime Notification --> A (Contractor Dashboard)\n    \n    D -- 15. File Upload / Signed URL Request --> I\n    N -- 16. Webhook Event --> J{Stripe Webhook}\n    J -- 17. Update DB (Service Role Key) --> G\n```,key_findings:["}
- subtasks_processed: 9
- quality_assessment: excellent
```

**Content (12,625 characters):**

**Key Findings:**
• The core architectural pivot successfully replaces all GCP/Firebase components with native Next.js/Supabase equivalents, maintaining the serverless, event-driven nature of the platform.
• Row-Level Security (RLS) on PostgreSQL and Supabase Storage is the central security mechanism, enforcing role-based access control directly at the data layer for both database queries and file access.
• The event-driven architecture is replaced by a database-centric model using PostgreSQL Triggers and the `pg_net` extension, which allows for reliable, asynchronous communication with external services (AI Orchestrator, Lead Matcher) without relying on a separate message queue (Pub/Sub).
• Next.js Server Actions handle all synchronous user-initiated logic, while Supabase Edge Functions are reserved for critical, high-security tasks like webhook processing and AI result ingestion, leveraging the Supabase Service Role Key for administrative database access.
• Sensitive external API keys (Gemini, Fal.ai) are securely isolated within a dedicated External AI Orchestrator Service, ensuring they are never exposed to the Next.js application or the public Supabase environment.

**Quality Assessment:** excellent

**Gaps Identified:**
• A dedicated, detailed result for Subtask 8 (Deployment & CI/CD Pipeline Definition) was not provided. The synthesis will include a high-level, actionable CI/CD plan based on industry best practices for the Next.js/Supabase stack to ensure the architecture is fully deployable.

**Final Integrated Response:**

# HOMEase | AI Technical Architecture Plan: Next.js App Router & Supabase

This document outlines the comprehensive technical architecture pivot for the HOMEase | AI platform, transitioning from the original Google Cloud Platform (GCP) and Firebase stack to a unified, serverless architecture built on **Next.js 15 App Router** and **Supabase**. This new stack is designed for high scalability, superior data integrity, and robust security, meeting all functional requirements for the lead generation platform.

## 1. Architectural Principles and Stack Overview

The new architecture centralizes data, authentication, and event processing within the Supabase ecosystem, leveraging PostgreSQL's advanced features for complex business logic and security.

| Original Component (GCP/Firebase) | New Component (Next.js/Supabase) | Functionality Replacement |
| :--- | :--- | :--- |
| Firebase Firestore (NoSQL) | **Supabase PostgreSQL** | Relational Data Store, Complex Querying |
| Firebase Auth | **Supabase Auth** | User Authentication and Session Management |
| Google Cloud Functions | **Next.js Server Actions & Supabase Edge Functions** | Backend Business Logic and API Handling |
| Google Cloud Pub/Sub | **PostgreSQL Triggers (`pg_net`) & Supabase Realtime** | Asynchronous Event-Driven Workflows |
| Google Cloud Storage | **Supabase Storage** | Secure File and Document Storage |

## 2. Data Layer Redesign and Security Foundation

The migration from NoSQL (Firestore) to Relational SQL (PostgreSQL) is critical for enforcing data integrity and optimizing the complex contractor matching algorithms.

### 2.1. Relational Data Model (DDL Summary)

The database schema is normalized around core entities, ensuring explicit relationships and referential integrity.

| Table Name | Purpose | Key Relationships | Critical Fields |
| :--- | :--- | :--- | :--- |
| **`profiles`** | Base user data, linked to `auth.users`. | 1:1 `auth.users` | `role` (ENUM: HOMEOWNER, CONTRACTOR, ADMIN) |
| **`projects`** | Core lead record, derived from assessments. | 1:1 `ar_assessments`, N:1 `homeowner_profiles` | `status` (ENUM), `urgency`, `selected_contractor_id` |
| **`ar_assessments`** | Raw AR scan data, Gemini analysis output, Fal.ai links. | N:1 `homeowner_profiles` | `accessibility_score`, `hazard_list` (JSONB) |
| **`contractor_profiles`** | Specific contractor data and vetting status. | 1:1 `profiles` | `caps_certified`, `vetting_status`, `average_rating` |
| **`project_leads`** | Junction table tracking lead distribution and purchase. | N:M `projects` $\leftrightarrow$ `contractor_profiles` | `lead_price`, `lead_status` (OFFERED, PURCHASED) |

### 2.2. Row-Level Security (RLS) Strategy

RLS is the primary security mechanism, enforced on all critical tables (`profiles`, `projects`, `ar_assessments`, `project_leads`, and Supabase Storage).

- **Role-Based Access:** Access is determined by the `public.get_user_role()` function, which reads the user's role from the `profiles` table.
- **Ownership Enforcement:** Homeowners are restricted to viewing and modifying records where `homeowner_id = auth.uid()`.
- **Contractor Access Control:** Contractors can only `SELECT` from the `projects` table if their ID is present in the `project_leads` junction table for that specific project, ensuring they only see leads they have been matched with or purchased.

**Example RLS Policy on `projects` (SELECT for CONTRACTOR):**

```sql
USING (EXISTS (SELECT 1 FROM public.project_leads WHERE project_id = id AND contractor_id = auth.uid()))
```

## 3. Compute and Event-Driven Architecture (GCP Replacements)

The backend logic (replacing Google Cloud Functions) is split between synchronous Server Actions and asynchronous Edge Functions/Triggers (replacing Pub/Sub).

### 3.1. Compute Allocation Strategy

| Logic Type | Component | Rationale |
| :--- | :--- | :--- |
| **Synchronous CRUD** | **Next.js Server Actions** | Handles user-initiated mutations (e.g., form submission, project updates, Stripe Checkout initiation). Securely runs on the server, enforcing RLS. |
| **Secure Callbacks/Webhooks** | **Supabase Edge Functions (Deno)** | Handles high-security, stateless tasks like Stripe Webhook verification and the AI result ingestion callback, leveraging the **Supabase Service Role Key** to bypass RLS for administrative updates. |
| **Asynchronous Orchestration** | **PostgreSQL Triggers + `pg_net`** | Decouples long-running processes (AI analysis, lead matching) from the user request, ensuring non-blocking performance. |

### 3.2. Event-Driven Workflow (Pub/Sub Replacement)

The core AR assessment and lead matching workflow is now managed by database events:

1. **AR Analysis Initiation:**
    - **Action:** A Server Action inserts a new record into `ar_assessments`.
    - **Trigger:** The `trg_assessment_created` trigger fires `public.notify_ai_processor()`.
    - **Mechanism:** This function uses the `pg_net` extension to send an asynchronous, authenticated HTTP POST request to the **External AI Orchestrator Service**.
2. **Lead Formalization & Matching:**
    - **Action:** The Orchestrator calls the secure Edge Function callback, which updates `ar_assessments` (setting `analysis_completed_at`).
    - **Trigger:** The `trg_analysis_completed` trigger fires `public.create_project_from_assessment()`, which synchronously inserts the formal lead into the `projects` table (status: `LEAD_GENERATED`).
    - **Matching Initiation:** A subsequent trigger (`trg_lead_generated`) fires, using `pg_net` to call the **External Lead Matching Service**.
3. **Realtime Notification:**
    - **Action:** The Lead Matching Service inserts records into `project_leads`.
    - **Mechanism:** Supabase Realtime detects the `INSERT` and broadcasts the new lead offer instantly to the relevant contractor's dashboard, filtered by their RLS permissions.

## 4. AI Service Integration and Key Management

The integration of Google Gemini and Fal.ai is secured by isolating the API keys from the Next.js application and the public Supabase environment.

### 4.1. Key Isolation via External Orchestrator

- **External AI Orchestrator Service:** A dedicated, isolated microservice (separate from Vercel/Supabase) holds the highly sensitive **GEMINI\_API\_KEY** and **FAL\_AI\_API\_KEY** as secure environment variables.
- **Secure Ingress:** The Orchestrator only receives requests authenticated by the **ORCHESTRATOR\_INGRESS\_KEY**, which is securely stored in **Supabase Vault** and accessed only by the `pg_net` trigger function.
- **Secure Egress (Callback):** The Orchestrator sends results to the Supabase Edge Function (`/edge/ai-result-ingest`) authenticated by the **AI\_SERVICE\_SECRET** header, preventing unauthorized database updates.

### 4.2. Storage and Secure File Access

Supabase Storage replaces Google Cloud Storage, with RLS applied to all sensitive buckets.

| Bucket | Access Control Strategy |
| :--- | :--- |
| **`assessments`** | RLS allows access only to the owning homeowner or a contractor explicitly matched to the project (verified via the `storage.is_contractor_matched_to_assessment` function). |
| **`contractor_docs`** | RLS allows access only to the owning contractor and administrators. |
| **Access Method** | **Signed URLs** are mandatory. All client requests for sensitive files must be proxied through a Next.js Server Action, which verifies the user's RLS permissions and generates a time-limited (e.g., 60-second) URL for temporary access. |

## 5. Next.js App Router Structure and Data Flow

The frontend architecture maximizes the performance and security benefits of the App Router.

- **Server Components (SC):** Used for all initial data fetching (e.g., `/leads`, `/dashboard`). SCs use the server-side Supabase client, which reads the session cookie and implicitly enforces RLS, ensuring fast, secure, and authenticated rendering.
- **Server Actions (SA):** Used exclusively for data mutations (e.g., `submitNewAssessmentAndLead`, `acceptLead`). SAs provide a secure server context, eliminating the need for separate API routes for most application logic and enabling seamless cache revalidation (`revalidatePath`).
- **Route Groups:** The application is organized into role-based route groups (e.g., `(homeowner)`, `(contractor)`, `(admin)`) to apply specific layouts and middleware for role-based access control.

## 6. Deployment and CI/CD Pipeline

The deployment strategy is built around the highly integrated Vercel/Supabase workflow, utilizing GitHub Actions for automation.

| Component | Deployment Target | CI/CD Automation | Secret Management |
| :--- | :--- | :--- | :--- |
| **Next.js App** | **Vercel** | **GitHub Actions:** Automated build and deployment upon push to `main` branch. Vercel's native integration handles secure environment variable injection. | Vercel Environment Variables (for public keys and Server Action secrets). |
| **Supabase Database** | **Supabase Platform** | **Supabase CLI & GitHub Actions:** Migrations managed via the Supabase CLI (`supabase db push`). A dedicated action ensures that schema changes (including RLS, Triggers, and Functions) are reviewed and applied before deployment. | Supabase Dashboard/CLI (for Service Role Key) and **Supabase Vault** (for `pg_net` secrets like `ORCHESTRATOR_INGRESS_KEY`). |
| **Edge Functions** | **Supabase Platform** | Deployed via Supabase CLI as part of the database migration process. | Supabase Edge Function Environment Variables (for `SUPABASE_SERVICE_ROLE_KEY`, `AI_SERVICE_SECRET`, etc.). |

## Final Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        A[Homeowner/Contractor Browser (CC)]
    end

    subgraph Next.js App Router (Vercel)
        C[Server Components (SC)]
        D[Server Actions (SAs)]
    end

    subgraph Supabase Ecosystem
        F[Supabase Auth]
        G[PostgreSQL DB (RLS)]
        H[Postgres Triggers / pg_net]
        I[Supabase Storage (RLS)]
        J[Supabase Edge Functions]
        K[Supabase Realtime]
    end

    subgraph External Services
        L[External AI Orchestrator]
        M[Gemini/Fal.ai APIs]
        N[Stripe API/Webhooks]
    end

    A -- 1. Authenticate --> F
    F -- 2. Session Cookie --> C & D
    
    C -- 3. Secure Data Read (RLS enforced) --> G
    
    D -- 4. Mutation (e.g., Submit Assessment) --> G
    G -- 5. DB Insert Event --> H
    H -- 6. pg_net (Vault Secret) --> L
    
    L -- 7. Call AI Keys --> M
    L -- 8. Secure Callback (AI_SERVICE_SECRET) --> J{AI Ingestion}
    J -- 9. Update DB (Service Role Key) --> G
    
    G -- 10. Lead Formalized Event --> H
    H -- 11. pg_net to Lead Matcher --> External Lead Matching Service
    
    External Lead Matching Service -- 12. Insert Matched Leads --> G
    G -- 13. New Lead Event --> K
    K -- 14. Realtime Notification --> A (Contractor Dashboard)
    
    D -- 15. File Upload / Signed URL Request --> I
    N -- 16. Webhook Event --> J{Stripe Webhook}
    J -- 17. Update DB (Service Role Key) --> G
```,key_findings:[
```

---

## 🎯 Final Response

# HOMEase | AI Technical Architecture Plan: Next.js App Router & Supabase

This document outlines the comprehensive technical architecture pivot for the HOMEase | AI platform, transitioning from the original Google Cloud Platform (GCP) and Firebase stack to a unified, serverless architecture built on **Next.js 15 App Router** and **Supabase**. This new stack is designed for high scalability, superior data integrity, and robust security, meeting all functional requirements for the lead generation platform.

## 1. Architectural Principles and Stack Overview

The new architecture centralizes data, authentication, and event processing within the Supabase ecosystem, leveraging PostgreSQL's advanced features for complex business logic and security.

| Original Component (GCP/Firebase) | New Component (Next.js/Supabase) | Functionality Replacement |
| :--- | :--- | :--- |
| Firebase Firestore (NoSQL) | **Supabase PostgreSQL** | Relational Data Store, Complex Querying |
| Firebase Auth | **Supabase Auth** | User Authentication and Session Management |
| Google Cloud Functions | **Next.js Server Actions & Supabase Edge Functions** | Backend Business Logic and API Handling |
| Google Cloud Pub/Sub | **PostgreSQL Triggers (`pg_net`) & Supabase Realtime** | Asynchronous Event-Driven Workflows |
| Google Cloud Storage | **Supabase Storage** | Secure File and Document Storage |

## 2. Data Layer Redesign and Security Foundation

The migration from NoSQL (Firestore) to Relational SQL (PostgreSQL) is critical for enforcing data integrity and optimizing the complex contractor matching algorithms.

### 2.1. Relational Data Model (DDL Summary)

The database schema is normalized around core entities, ensuring explicit relationships and referential integrity.

| Table Name | Purpose | Key Relationships | Critical Fields |
| :--- | :--- | :--- | :--- |
| **`profiles`** | Base user data, linked to `auth.users`. | 1:1 `auth.users` | `role` (ENUM: HOMEOWNER, CONTRACTOR, ADMIN) |
| **`projects`** | Core lead record, derived from assessments. | 1:1 `ar_assessments`, N:1 `homeowner_profiles` | `status` (ENUM), `urgency`, `selected_contractor_id` |
| **`ar_assessments`** | Raw AR scan data, Gemini analysis output, Fal.ai links. | N:1 `homeowner_profiles` | `accessibility_score`, `hazard_list` (JSONB) |
| **`contractor_profiles`** | Specific contractor data and vetting status. | 1:1 `profiles` | `caps_certified`, `vetting_status`, `average_rating` |
| **`project_leads`** | Junction table tracking lead distribution and purchase. | N:M `projects` $\leftrightarrow$ `contractor_profiles` | `lead_price`, `lead_status` (OFFERED, PURCHASED) |

### 2.2. Row-Level Security (RLS) Strategy

RLS is the primary security mechanism, enforced on all critical tables (`profiles`, `projects`, `ar_assessments`, `project_leads`, and Supabase Storage).

- **Role-Based Access:** Access is determined by the `public.get_user_role()` function, which reads the user's role from the `profiles` table.
- **Ownership Enforcement:** Homeowners are restricted to viewing and modifying records where `homeowner_id = auth.uid()`.
- **Contractor Access Control:** Contractors can only `SELECT` from the `projects` table if their ID is present in the `project_leads` junction table for that specific project, ensuring they only see leads they have been matched with or purchased.

**Example RLS Policy on `projects` (SELECT for CONTRACTOR):**

```sql
USING (EXISTS (SELECT 1 FROM public.project_leads WHERE project_id = id AND contractor_id = auth.uid()))
```

## 3. Compute and Event-Driven Architecture (GCP Replacements)

The backend logic (replacing Google Cloud Functions) is split between synchronous Server Actions and asynchronous Edge Functions/Triggers (replacing Pub/Sub).

### 3.1. Compute Allocation Strategy

| Logic Type | Component | Rationale |
| :--- | :--- | :--- |
| **Synchronous CRUD** | **Next.js Server Actions** | Handles user-initiated mutations (e.g., form submission, project updates, Stripe Checkout initiation). Securely runs on the server, enforcing RLS. |
| **Secure Callbacks/Webhooks** | **Supabase Edge Functions (Deno)** | Handles high-security, stateless tasks like Stripe Webhook verification and the AI result ingestion callback, leveraging the **Supabase Service Role Key** to bypass RLS for administrative updates. |
| **Asynchronous Orchestration** | **PostgreSQL Triggers + `pg_net`** | Decouples long-running processes (AI analysis, lead matching) from the user request, ensuring non-blocking performance. |

### 3.2. Event-Driven Workflow (Pub/Sub Replacement)

The core AR assessment and lead matching workflow is now managed by database events:

1. **AR Analysis Initiation:**
    - **Action:** A Server Action inserts a new record into `ar_assessments`.
    - **Trigger:** The `trg_assessment_created` trigger fires `public.notify_ai_processor()`.
    - **Mechanism:** This function uses the `pg_net` extension to send an asynchronous, authenticated HTTP POST request to the **External AI Orchestrator Service**.
2. **Lead Formalization & Matching:**
    - **Action:** The Orchestrator calls the secure Edge Function callback, which updates `ar_assessments` (setting `analysis_completed_at`).
    - **Trigger:** The `trg_analysis_completed` trigger fires `public.create_project_from_assessment()`, which synchronously inserts the formal lead into the `projects` table (status: `LEAD_GENERATED`).
    - **Matching Initiation:** A subsequent trigger (`trg_lead_generated`) fires, using `pg_net` to call the **External Lead Matching Service**.
3. **Realtime Notification:**
    - **Action:** The Lead Matching Service inserts records into `project_leads`.
    - **Mechanism:** Supabase Realtime detects the `INSERT` and broadcasts the new lead offer instantly to the relevant contractor's dashboard, filtered by their RLS permissions.

## 4. AI Service Integration and Key Management

The integration of Google Gemini and Fal.ai is secured by isolating the API keys from the Next.js application and the public Supabase environment.

### 4.1. Key Isolation via External Orchestrator

- **External AI Orchestrator Service:** A dedicated, isolated microservice (separate from Vercel/Supabase) holds the highly sensitive **GEMINI\_API\_KEY** and **FAL\_AI\_API\_KEY** as secure environment variables.
- **Secure Ingress:** The Orchestrator only receives requests authenticated by the **ORCHESTRATOR\_INGRESS\_KEY**, which is securely stored in **Supabase Vault** and accessed only by the `pg_net` trigger function.
- **Secure Egress (Callback):** The Orchestrator sends results to the Supabase Edge Function (`/edge/ai-result-ingest`) authenticated by the **AI\_SERVICE\_SECRET** header, preventing unauthorized database updates.

### 4.2. Storage and Secure File Access

Supabase Storage replaces Google Cloud Storage, with RLS applied to all sensitive buckets.

| Bucket | Access Control Strategy |
| :--- | :--- |
| **`assessments`** | RLS allows access only to the owning homeowner or a contractor explicitly matched to the project (verified via the `storage.is_contractor_matched_to_assessment` function). |
| **`contractor_docs`** | RLS allows access only to the owning contractor and administrators. |
| **Access Method** | **Signed URLs** are mandatory. All client requests for sensitive files must be proxied through a Next.js Server Action, which verifies the user's RLS permissions and generates a time-limited (e.g., 60-second) URL for temporary access. |

## 5. Next.js App Router Structure and Data Flow

The frontend architecture maximizes the performance and security benefits of the App Router.

- **Server Components (SC):** Used for all initial data fetching (e.g., `/leads`, `/dashboard`). SCs use the server-side Supabase client, which reads the session cookie and implicitly enforces RLS, ensuring fast, secure, and authenticated rendering.
- **Server Actions (SA):** Used exclusively for data mutations (e.g., `submitNewAssessmentAndLead`, `acceptLead`). SAs provide a secure server context, eliminating the need for separate API routes for most application logic and enabling seamless cache revalidation (`revalidatePath`).
- **Route Groups:** The application is organized into role-based route groups (e.g., `(homeowner)`, `(contractor)`, `(admin)`) to apply specific layouts and middleware for role-based access control.

## 6. Deployment and CI/CD Pipeline

The deployment strategy is built around the highly integrated Vercel/Supabase workflow, utilizing GitHub Actions for automation.

| Component | Deployment Target | CI/CD Automation | Secret Management |
| :--- | :--- | :--- | :--- |
| **Next.js App** | **Vercel** | **GitHub Actions:** Automated build and deployment upon push to `main` branch. Vercel's native integration handles secure environment variable injection. | Vercel Environment Variables (for public keys and Server Action secrets). |
| **Supabase Database** | **Supabase Platform** | **Supabase CLI & GitHub Actions:** Migrations managed via the Supabase CLI (`supabase db push`). A dedicated action ensures that schema changes (including RLS, Triggers, and Functions) are reviewed and applied before deployment. | Supabase Dashboard/CLI (for Service Role Key) and **Supabase Vault** (for `pg_net` secrets like `ORCHESTRATOR_INGRESS_KEY`). |
| **Edge Functions** | **Supabase Platform** | Deployed via Supabase CLI as part of the database migration process. | Supabase Edge Function Environment Variables (for `SUPABASE_SERVICE_ROLE_KEY`, `AI_SERVICE_SECRET`, etc.). |

## Final Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        A[Homeowner/Contractor Browser (CC)]
    end

    subgraph Next.js App Router (Vercel)
        C[Server Components (SC)]
        D[Server Actions (SAs)]
    end

    subgraph Supabase Ecosystem
        F[Supabase Auth]
        G[PostgreSQL DB (RLS)]
        H[Postgres Triggers / pg_net]
        I[Supabase Storage (RLS)]
        J[Supabase Edge Functions]
        K[Supabase Realtime]
    end

    subgraph External Services
        L[External AI Orchestrator]
        M[Gemini/Fal.ai APIs]
        N[Stripe API/Webhooks]
    end

    A -- 1. Authenticate --> F
    F -- 2. Session Cookie --> C & D
    
    C -- 3. Secure Data Read (RLS enforced) --> G
    
    D -- 4. Mutation (e.g., Submit Assessment) --> G
    G -- 5. DB Insert Event --> H
    H -- 6. pg_net (Vault Secret) --> L
    
    L -- 7. Call AI Keys --> M
    L -- 8. Secure Callback (AI_SERVICE_SECRET) --> J{AI Ingestion}
    J -- 9. Update DB (Service Role Key) --> G
    
    G -- 10. Lead Formalized Event --> H
    H -- 11. pg_net to Lead Matcher --> External Lead Matching Service
    
    External Lead Matching Service -- 12. Insert Matched Leads --> G
    G -- 13. New Lead Event --> K
    K -- 14. Realtime Notification --> A (Contractor Dashboard)
    
    D -- 15. File Upload / Signed URL Request --> I
    N -- 16. Webhook Event --> J{Stripe Webhook}
    J -- 17. Update DB (Service Role Key) --> G
```

key_findings:[

**Recommendations:**
• **Prioritize RLS Implementation:** Before writing any application code, fully implement and test all RLS policies on the database and storage layers. This ensures security is enforced at the source, regardless of frontend logic.
• **Establish External Orchestrator:** Immediately develop and deploy the External AI Orchestrator Service to securely manage the Gemini/Fal.ai API keys and handle the complex, multi-step AI processing workflow, ensuring it is only accessible via the authenticated `pg_net` webhook.
• **Utilize Supabase Vault:** Store all high-value, non-user-specific secrets (e.g., `ORCHESTRATOR_INGRESS_KEY`, Stripe secrets) in Supabase Vault rather than standard environment variables to enhance protection against exposure.
• **Adopt Supabase CLI for Migrations:** Implement a strict CI/CD process using the Supabase CLI to manage all database schema changes (including RLS, Triggers, and Functions) as version-controlled migrations, ensuring consistency across development, staging, and production environments.
• **Implement Role-Based Middleware:** Use Next.js middleware in conjunction with Supabase Auth to enforce role-based routing (Homeowner, Contractor, Admin) at the edge, preventing unauthorized users from even accessing restricted routes.

```

