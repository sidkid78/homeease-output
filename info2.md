Architecture Outline & Component Mapping
gemini-2.5-pro
ID: 1
54364ms
Prompt
Given the user's request, analyze the original GCP/Firebase architecture components of the HOMEase | AI platform and propose a direct mapping to Supabase services or other suitable open-source alternatives. Outline the high-level architecture with these new components. Specifically address: Next.js deployment, Database, Authentication, Storage, Backend Services (Cloud Functions replacement), and Asynchronous Workflows (Pub/Sub replacement). For AI models (Gemini), state they are external APIs to be called by the new backend.
Output
Here's a direct mapping of HOMEase's GCP/Firebase architecture components to Supabase services or suitable open-source alternatives, followed by a high-level architecture outline.

---

### HOMEase | AI Platform: GCP/Firebase to Supabase/Open-Source Mapping

| Original GCP/Firebase Component | Proposed Supabase / Open-Source Alternative | Rationale & Description |

| **1. Next.js Deployment**         | **Vercel**                                | Vercel provides seamless deployment for Next.js applications, offering automatic scaling, global CDN, and easy integration with Git repositories. It's built by the creators of Next.js, ensuring optimal performance and developer experience. |
| **2. Database** (Firestore/Realtime DB) | **Supabase PostgreSQL**                 | Supabase's core offering is a fully managed PostgreSQL database. It's a robust, relational database that offers strong consistency, complex querying capabilities, and is highly scalable. It serves as the primary data store, replacing the NoSQL model of Firestore. |
| **3. Authentication** (Firebase Auth) | **Supabase Auth**                       | Supabase Auth is a feature-rich authentication service that supports email/password, social logins (Google, Apple, etc.), magic links, and more. It's built on GoTrue and integrates directly with the PostgreSQL database for user management and Row-Level Security (RLS). |
| **4. Storage** (Cloud Storage)      | **Supabase Storage**                    | Supabase Storage provides an S3-compatible object storage service for managing user-uploaded files (images, documents, etc.). It integrates with Supabase Auth for fine-grained access control and RLS. |
| **5. Backend Services** (Cloud Functions) | **Supabase Edge Functions**<br/>**Custom API Service (e.g., Node.js/Python on Fly.io/Render)** | **Supabase Edge Functions:** For lightweight, event-driven serverless logic (e.g., database triggers, webhooks, simple data transformations), written in TypeScript/Deno and deployed globally on a CDN. <br/>**Custom API Service:** For more complex business logic, long-running tasks, custom framework usage, or third-party integrations, a dedicated backend API service (e.g., using Express.js, Fast API, Flask, NestJS) deployed on a platform like Fly.io or Render offers greater flexibility and control. This service would interact with Supabase via its client libraries and handle communication with external AI models. |
| **6. Asynchronous Workflows** (Pub/Sub) | **Redis Streams/Queue (e.g., hosted on Upstash or self-managed)**<br/>**PostgreSQL LISTEN/NOTIFY (for simple cases)** | For robust asynchronous processing and message queuing, a dedicated open-source solution like **Redis Streams** (for durable messaging) or **Redis Queue (e.g., BullMQ for Node.js, RQ for Python)** is ideal. This would be integrated with the Custom API Service for publishing and consuming messages. <br/>For simpler, intra-database event notifications, **PostgreSQL's LISTEN/NOTIFY** can be utilized by the Custom API Service or Edge Functions. |
| **7. AI Models** (Gemini)       | **External API Calls**                  | Gemini, or any other large language model (LLM) like OpenAI's GPT, will be consumed as an external API. The **Custom API Service** will be responsible for making these API calls, handling authentication, request/response parsing, and integrating the AI model's output into the application's logic. |

---

### High-Level Architecture with Supabase & Open-Source Components

```mermaid
graph TD
    subgraph Frontend
        A[Next.js Web App]
        B[Next.js Mobile App]
    end

    subgraph Supabase Cloud
        C[Supabase Auth]
        D[Supabase PostgreSQL Database]
        E[Supabase Storage]
        F[Supabase Edge Functions]
    end

    subgraph Custom Backend & Async Workflows
        G[Custom API Service (e.g., Node.js/Python on Fly.io/Render)]
        H[Redis Streams/Queue (e.g., Upstash or Self-managed)]
        I[Worker Service (consumes Redis Queue, part of G)]
    end

    subgraph External Services
        J[Google Gemini API]
        K[Other External APIs]
    end

    A -- "UI interactions" --> D
    A -- "User registration/login" --> C
    A -- "File uploads" --> E
    A -- "Specific API calls" --> G
    A -- "Trigger simple logic" --> F

    B -- "UI interactions" --> D
    B -- "User registration/login" --> C
    B -- "File uploads" --> E
    B -- "Specific API calls" --> G
    B -- "Trigger simple logic" --> F

    C -- "Manages user data" --> D
    D -- "Realtime changes" --> A & B
    E -- "Stores files" --> D
    F -- "DB triggers, webhooks" --> D

    G -- "CRUD operations" --> D
    G -- "Authenticates users" --> C
    G -- "Manages files" --> E
    G -- "Publishes async tasks" --> H
    G -- "Makes AI calls" --> J
    G -- "Integrates" --> K

    I -- "Processes async tasks" --> H
    I -- "Updates data" --> D
    I -- "Makes AI calls for background tasks" --> J

    style A fill:#D4EDDA,stroke:#28A745,stroke-width:2px
    style B fill:#D4EDDA,stroke:#28A745,stroke-width:2px
    style C fill:#D1ECF1,stroke:#17A2B8,stroke-width:2px
    style D fill:#D1ECF1,stroke:#17A2B8,stroke-width:2px
    style E fill:#D1ECF1,stroke:#17A2B8,stroke-width:2px
    style F fill:#D1ECF1,stroke:#17A2B8,stroke-width:2px
    style G fill:#FFF3CD,stroke:#FFC107,stroke-width:2px
    style H fill:#FFF3CD,stroke:#FFC107,stroke-width:2px
    style I fill:#FFF3CD,stroke:#FFC107,stroke-width:2px
    style J fill:#F8D7DA,stroke:#DC3545,stroke-width:2px
    style K fill:#F8D7DA,stroke:#DC3545,stroke-width:2px
```

---

### Component Breakdown

1. **Next.js Frontend (Web & Mobile)**
    * **Deployment:** Hosted on **Vercel**. Provides CI/CD, global CDN, and automatic scaling for the Next.js application.
    * **Interaction:** Utilizes the Supabase JavaScript SDK for direct client-side interactions with Supabase Auth, PostgreSQL (via PostgREST API), Storage, and Edge Functions. For more complex operations or sensitive logic, it calls the Custom API Service.

2. **Supabase Cloud Project**
    * **Supabase Auth (GoTrue):** Handles user registration, login, session management, and social logins. All user data is stored in the PostgreSQL database.
    * **Supabase PostgreSQL Database:** The central relational data store. Stores user profiles, property listings, AI analysis results, and other application data. Row-Level Security (RLS) is extensively used for data access control.
    * **Supabase Storage:** Stores user-uploaded media (property images, documents). Access control is managed through Storage Policies integrated with Supabase Auth.
    * **Supabase Edge Functions (Deno):** Used for lightweight serverless functions triggered by database events (e.g., new property added), webhooks (e.g., from a payment gateway), or simple API endpoints.

3. **Custom API Service (e.g., Node.js with Express/NestJS, Python with FastAPI/Flask)**
    * **Deployment:** Deployed on a managed container platform like **Fly.io** or **Render**, or a self-managed Kubernetes/Docker environment.
    * **Core Logic:** Houses complex business logic that goes beyond what Edge Functions can handle efficiently, such as multi-step workflows, intensive data processing, and orchestrating interactions with external services.
    * **Supabase Integration:** Connects directly to the Supabase PostgreSQL database using a PostgreSQL client library (e.g., `pg` for Node.js, `psycopg2` for Python) and interacts with Supabase Auth and Storage APIs as needed.
    * **AI Model Interaction:** Makes authenticated calls to external AI APIs (like Google Gemini) for property analysis, report generation, and other AI-powered features.
    * **Asynchronous Task Publishing:** Publishes messages/tasks to the Redis Queue for background processing.

4. **Asynchronous Workflows (Redis Streams/Queue)**
    * **Technology:** **Redis Streams** (for persistent, multi-consumer message queues) or a dedicated **Redis Queue library** (like BullMQ for Node.js or RQ for Python). This can be self-managed or use a managed service like **Upstash**.
    * **Purpose:** Decouples long-running or resource-intensive tasks from immediate API responses. Examples include:
        * Processing large property data sets.
        * Generating detailed AI-powered reports.
        * Image optimization (resizing, watermarking).
        * Sending email notifications.
    * **Worker Service:** A dedicated process (often part of the Custom API Service deployment, or a separate service) that constantly listens to the Redis Queue, fetches tasks, processes them, and updates the Supabase database with results.

5. **External AI Models (Google Gemini)**
    * **Integration:** The **Custom API Service** (and potentially the Worker Service for background tasks) consumes the Gemini API.
    * **Responsibilities:** Handles API key management, request formatting, error handling, and processing the AI model's responses before storing or presenting them.

This architecture provides a robust, scalable, and cost-effective alternative to a full GCP/Firebase stack by leveraging Supabase's managed open-source services and dedicated open-source components where needed.

Supabase Database Schema Design
gemini-2.5-pro
ID: 2
42585ms
Depends on:
1
Prompt
Based on the HOMEase | AI briefing document and the goal of migrating to Supabase, design a detailed PostgreSQL database schema. Identify key entities such as `users` (homeowners, contractors, admins), `homeowners`, `contractors`, `leads`, `ar_assessments`, `ar_visualizations`, `projects`, `payments`, `reviews`, `messages`. For each table, define relevant columns, their data types, primary keys, foreign keys, and any unique constraints. Briefly explain the relationships between tables. The output should be a SQL schema definition.
Output
The following PostgreSQL schema is designed for the HOMEase platform, leveraging Supabase's managed PostgreSQL database. It defines key entities, their attributes, data types, primary and foreign keys, and unique constraints, along with a brief explanation of the relationships.

```sql
-- Create UUID extension (if not already enabled by Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--
-- ENUM Types
--
-- Defines the different roles a user can have within the platform.
CREATE TYPE public.user_role_type AS ENUM ('homeowner', 'contractor', 'admin');

-- Defines the possible statuses for a lead/project request.
CREATE TYPE public.lead_status_type AS ENUM ('open', 'matched', 'in_progress', 'completed', 'cancelled');

-- Defines the possible statuses for a project lifecycle.
CREATE TYPE public.project_status_type AS ENUM ('pending_contract', 'in_progress', 'completed', 'cancelled', 'disputed');

-- Defines the possible statuses for a payment transaction.
CREATE TYPE public.payment_status_type AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Defines the possible statuses for an AR assessment process.
CREATE TYPE public.ar_assessment_status_type AS ENUM ('pending', 'processing', 'completed', 'failed');


--
-- Table: profiles
-- Description: Extends Supabase's auth.users table with public profile information.
--              All application-specific user entities (homeowners, contractors, admins) link to this table.
-- Relationships:
-- - One-to-one with auth.users (via id)
-- - One-to-one with homeowners (via id)
-- - One-to-one with contractors (via id)
--
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    user_type user_role_type NOT NULL, -- Differentiates between homeowner, contractor, admin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookup by user_type
CREATE INDEX profiles_user_type_idx ON public.profiles (user_type);

-- Trigger to update 'updated_at' column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: homeowners
-- Description: Stores specific information for users identified as homeowners.
-- Relationships:
-- - One-to-one with profiles (via profile_id)
-- - One-to-many with leads (a homeowner can create many leads)
-- - One-to-many with ar_assessments (a homeowner can request many assessments)
--
CREATE TABLE public.homeowners (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_homeowners_updated_at
BEFORE UPDATE ON public.homeowners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: contractors
-- Description: Stores specific information for users identified as contractors.
-- Relationships:
-- - One-to-one with profiles (via profile_id)
-- - One-to-many with projects (a contractor can work on many projects)
-- - One-to-many with reviews (a contractor can receive many reviews)
--
CREATE TABLE public.contractors (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    business_address_street TEXT,
    business_address_city TEXT,
    business_address_state TEXT,
    business_address_zip TEXT,
    phone_number TEXT,
    license_number TEXT UNIQUE, -- Unique license number for each contractor
    years_in_business SMALLINT CHECK (years_in_business >= 0),
    service_radius_miles INTEGER, -- The radius in miles a contractor is willing to travel
    website_url TEXT,
    stripe_account_id TEXT UNIQUE, -- Stripe Connect account ID for payouts
    average_rating NUMERIC(2,1) DEFAULT 0.0, -- Computed field, e.g., via a trigger or job
    num_reviews INTEGER DEFAULT 0, -- Computed field
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX contractors_company_name_idx ON public.contractors (company_name);
CREATE INDEX contractors_license_number_idx ON public.contractors (license_number);

CREATE TRIGGER update_contractors_updated_at
BEFORE UPDATE ON public.contractors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: contractor_specialties
-- Description: Manages the many-to-many relationship between contractors and their specialties.
-- Relationships:
-- - Many-to-one with contractors
--
CREATE TABLE public.contractor_specialties (
    contractor_id UUID REFERENCES public.contractors(profile_id) ON DELETE CASCADE,
    specialty TEXT NOT NULL, -- e.g., 'Roofing', 'Plumbing', 'Electrical', 'Painting'
    PRIMARY KEY (contractor_id, specialty) -- A contractor has a unique set of specialties
);

CREATE INDEX contractor_specialties_specialty_idx ON public.contractor_specialties (specialty);


--
-- Table: leads
-- Description: Represents a homeowner's initial request for a project.
-- Relationships:
-- - Many-to-one with homeowners
-- - One-to-one with projects (a lead can become one project)
-- - One-to-many with ar_assessments (optional, assessments can be linked to a lead)
--
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homeowner_id UUID NOT NULL REFERENCES public.homeowners(profile_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT, -- e.g., 'Single Family Home', 'Condo', 'Townhouse'
    num_bedrooms SMALLINT,
    num_bathrooms NUMERIC(3,1),
    square_footage INTEGER,
    property_address_street TEXT NOT NULL,
    property_address_city TEXT NOT NULL,
    property_address_state TEXT NOT NULL,
    property_address_zip TEXT NOT NULL,
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    preferred_start_date DATE,
    status lead_status_type DEFAULT 'open' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- When the lead automatically expires if no action is taken
);

CREATE INDEX leads_homeowner_id_idx ON public.leads (homeowner_id);
CREATE INDEX leads_status_idx ON public.leads (status);
CREATE INDEX leads_property_address_zip_idx ON public.leads (property_address_zip);

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: ar_assessments
-- Description: Stores details about Augmented Reality assessments performed on properties.
-- Relationships:
-- - Many-to-one with homeowners
-- - Many-to-one with leads (optional, an assessment might be general or specific to a lead)
-- - One-to-many with ar_visualizations
--
CREATE TABLE public.ar_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homeowner_id UUID NOT NULL REFERENCES public.homeowners(profile_id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL, -- Optional: an assessment can exist without a specific lead
    assessment_date TIMESTAMPTZ DEFAULT NOW(),
    assessment_type TEXT NOT NULL, -- e.g., 'Roof Damage Detection', 'Exterior Material Scan', 'Interior Layout'
    notes TEXT,
    ai_analysis_report_url TEXT, -- URL to the generated AI report in storage
    generated_by_ai_model TEXT, -- e.g., 'Gemini-Pro'
    raw_input_data_url TEXT, -- URL to raw input data (e.g., 3D scan, images) in storage
    status ar_assessment_status_type DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ar_assessments_homeowner_id_idx ON public.ar_assessments (homeowner_id);
CREATE INDEX ar_assessments_lead_id_idx ON public.ar_assessments (lead_id);
CREATE INDEX ar_assessments_assessment_type_idx ON public.ar_assessments (assessment_type);

CREATE TRIGGER update_ar_assessments_updated_at
BEFORE UPDATE ON public.ar_assessments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: ar_visualizations
-- Description: Stores URLs and metadata for AR visualizations generated from assessments.
-- Relationships:
-- - Many-to-one with ar_assessments
--
CREATE TABLE public.ar_visualizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ar_assessment_id UUID NOT NULL REFERENCES public.ar_assessments(id) ON DELETE CASCADE,
    visualization_url TEXT NOT NULL, -- URL to the 3D model, image, or interactive scene in storage
    description TEXT,
    visualization_type TEXT, -- e.g., '3D_Model', 'Image_Render', 'Interactive_Scene'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ar_visualizations_ar_assessment_id_idx ON public.ar_visualizations (ar_assessment_id);

CREATE TRIGGER update_ar_visualizations_updated_at
BEFORE UPDATE ON public.ar_visualizations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: projects
-- Description: Represents an accepted lead that is now an active project between a homeowner and a contractor.
-- Relationships:
-- - One-to-one with leads (a project originates from a single lead)
-- - Many-to-one with homeowners
-- - Many-to-one with contractors
-- - One-to-many with payments
-- - One-to-one with reviews (a project can have one review from the homeowner)
-- - One-to-many with conversations (messages related to this project)
--
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE, -- Ensures a lead can only become one project
    homeowner_id UUID NOT NULL REFERENCES public.homeowners(profile_id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES public.contractors(profile_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    estimated_end_date DATE,
    actual_completion_date DATE,
    agreed_price DECIMAL(12,2) NOT NULL CHECK (agreed_price > 0),
    status project_status_type DEFAULT 'pending_contract' NOT NULL,
    contract_url TEXT, -- URL to the signed contract document in storage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX projects_lead_id_idx ON public.projects (lead_id);
CREATE INDEX projects_homeowner_id_idx ON public.projects (homeowner_id);
CREATE INDEX projects_contractor_id_idx ON public.projects (contractor_id);
CREATE INDEX projects_status_idx ON public.projects (status);

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: payments
-- Description: Records financial transactions related to projects.
-- Relationships:
-- - Many-to-one with projects
-- - Many-to-one with profiles (for payer_id and payee_id)
--
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Typically the homeowner
    payee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Typically the contractor
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD' NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    status payment_status_type DEFAULT 'pending' NOT NULL,
    transaction_id TEXT UNIQUE, -- Unique ID from the payment gateway
    payment_method TEXT, -- e.g., 'Stripe', 'PayPal', 'Bank Transfer'
    description TEXT, -- e.g., 'Milestone 1 Payment', 'Final Payment'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX payments_project_id_idx ON public.payments (project_id);
CREATE INDEX payments_payer_id_idx ON public.payments (payer_id);
CREATE INDEX payments_payee_id_idx ON public.payments (payee_id);
CREATE INDEX payments_transaction_id_idx ON public.payments (transaction_id);

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: reviews
-- Description: Stores homeowner reviews and ratings for contractors after a project is completed.
-- Relationships:
-- - One-to-one with projects (each project can have one review from the homeowner)
-- - Many-to-one with homeowners (the reviewer)
-- - Many-to-one with contractors (the reviewed)
--
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE, -- Ensures only one review per project
    homeowner_id UUID NOT NULL REFERENCES public.homeowners(profile_id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES public.contractors(profile_id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Rating on a scale of 1 to 5
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX reviews_project_id_idx ON public.reviews (project_id);
CREATE INDEX reviews_contractor_id_idx ON public.reviews (contractor_id);
CREATE INDEX reviews_rating_idx ON public.reviews (rating);

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: conversations
-- Description: Groups messages related to a specific project or lead.
-- Relationships:
-- - One-to-many with messages
-- - Many-to-one with projects (optional, conversations can start pre-project phase linked to a lead)
-- - Many-to-one with leads (optional)
--
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE, -- Links conversation to a specific project
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE, -- Links conversation to a specific lead
    -- A conversation can be specific to a project OR a lead. It should not be both simultaneously if lead is converted to project.
    -- Consider a CHECK constraint if only one FK must be present. For now, allowing both to be NULL (general chat) or one of them.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint: A conversation must be linked to either a project OR a lead, but not both. Or neither (for general discussions).
-- A simple constraint for now could be that if project_id is not null, lead_id must be null,
-- but often a project conversation is a continuation of a lead conversation.
-- For simplicity, we'll allow both to be populated, assuming the business logic handles precedence (e.g., project_id takes precedence).
-- Or enforce that lead_id should be NULL if project_id is NOT NULL.
ALTER TABLE public.conversations
ADD CONSTRAINT check_project_or_lead_id
CHECK ((project_id IS NOT NULL AND lead_id IS NULL) OR (project_id IS NULL AND lead_id IS NOT NULL) OR (project_id IS NULL AND lead_id IS NULL));


CREATE INDEX conversations_project_id_idx ON public.conversations (project_id);
CREATE INDEX conversations_lead_id_idx ON public.conversations (lead_id);

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--
-- Table: conversation_participants
-- Description: Defines the participants in a conversation, allowing for group chats or 1-on-1.
-- Relationships:
-- - Many-to-one with conversations
-- - Many-to-one with profiles
--
CREATE TABLE public.conversation_participants (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, profile_id) -- A participant can join a conversation only once
);

CREATE INDEX conversation_participants_profile_id_idx ON public.conversation_participants (profile_id);


--
-- Table: messages
-- Description: Stores individual messages exchanged within a conversation.
-- Relationships:
-- - Many-to-one with conversations
-- - Many-to-one with profiles (the sender)
--
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ, -- Timestamp when the message was read by the receiver(s)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX messages_conversation_id_idx ON public.messages (conversation_id);
CREATE INDEX messages_sender_id_idx ON public.messages (sender_id);
CREATE INDEX messages_sent_at_idx ON public.messages (sent_at);

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

```

Supabase Authentication & Authorization Strategy
gemini-2.5-pro
ID: 3
37493ms
Depends on:
1
Prompt
Given the HOMEase | AI requirement to replace Firebase Authentication with Supabase Auth, detail a comprehensive authentication and authorization strategy. Explain how Supabase Auth will be integrated with NextAuth.js v5 (if applicable, otherwise describe direct integration) for handling user sign-up, sign-in, and session management. Specifically, describe how user roles (homeowner, contractor, admin) will be managed and enforced using Supabase's capabilities (e.g., Row Level Security, custom claims/metadata). The output should be a structured plan.
Output
To establish a comprehensive authentication and authorization strategy for HOMEase using Supabase Auth, integrating with Next.js, and managing user roles, we will leverage Supabase's native capabilities. Given that Supabase Auth provides a complete authentication solution with excellent Next.js helpers, direct integration is preferred over adding NextAuth.js v5 as an additional layer of abstraction, which would typically be used when integrating multiple, disparate authentication providers.

Here is a structured plan:

## HOMEase Authentication and Authorization Strategy

### 1. Supabase Auth Integration with Next.js

We will use the `@supabase/auth-helpers-nextjs` package, which is purpose-built to seamlessly integrate Supabase Auth with Next.js, handling server-side rendering (SSR), static site generation (SSG), and client-side authentication flows.

#### 1.1. Initial Setup

* **Supabase Project Configuration:**
  * Enable desired authentication providers (Email/Password, Google, Apple, etc.) in the Supabase Dashboard > Authentication > Providers.
  * Configure email templates for welcome, password reset, and magic links.
  * Set up redirect URLs for OAuth providers and email confirmations.
* **Next.js Environment Variables:**
  * `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project's public anon key.
  * `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase project's service role key (for server-side admin operations, to be used with extreme caution and only in secure server environments like API routes or Edge Functions).
* **Supabase Client Setup in Next.js:**
  * Create client-side and server-side Supabase client instances using `@supabase/auth-helpers-nextjs`.
  * **Client-side:** For direct user interactions (sign-up, sign-in, profile updates).
  * **Server-side (API Routes/Server Components/Server Actions):** For authenticated server-side data fetching and mutations, ensuring proper session handling across requests.

#### 1.2. User Sign-up

* **Email/Password:**
    1. User provides email and password.
    2. `supabase.auth.signUp({ email, password })` is called.
    3. Supabase sends a verification email.
    4. Upon email confirmation, the user's `auth.users` entry is activated, and a `public.user_profiles` entry (with a default role) is automatically created via a database trigger.
* **Social Logins (e.g., Google, Apple):**
    1. User clicks "Sign up with Google".
    2. `supabase.auth.signInWithOAuth({ provider: 'google' })` is called, redirecting to the provider.
    3. After successful OAuth, Supabase redirects back to the app, creates/updates the `auth.users` entry, and triggers the `public.user_profiles` creation.

#### 1.3. User Sign-in

* **Email/Password:**
    1. User provides email and password.
    2. `supabase.auth.signInWithPassword({ email, password })` is called.
    3. Upon success, a session is established, and a JWT is issued.
* **Social Logins:** Same flow as social sign-up; if the user exists, they are signed in.
* **Magic Link:**
    1. User enters email.
    2. `supabase.auth.signInWithOtp({ email })` is called.
    3. Supabase sends an email with a magic link.
    4. Clicking the link signs the user in.

#### 1.4. Session Management

* The `@supabase/auth-helpers-nextjs` library handles session management automatically, storing the session in secure HTTP-only cookies.
* The `useUser()` hook (from `@supabase/auth-helpers-nextjs`) or `createServerComponentClient` allows easy access to the current user's session, profile, and JWT on both the client and server.
* Supabase JWTs automatically refresh to maintain an active session.

#### 1.5. Other Auth Features

* **Password Reset:** `supabase.auth.resetPasswordForEmail(email)`. Supabase sends a password reset link.
* **Email Change:** `supabase.auth.updateUser({ email: newEmail })`. Requires email verification for the new email.
* **Logout:** `supabase.auth.signOut()`. Clears the session and invalidates the JWT.

### 2. User Role Management (Homeowner, Contractor, Admin)

Roles are crucial for authorization. We will manage them using a dedicated `user_profiles` table and propagate them into the user's JWT as custom claims for efficient access.

#### 2.1. Role Definition & Database Schema

1. **Define `app_role` ENUM:**

    ```sql
    CREATE TYPE public.app_role AS ENUM ('homeowner', 'contractor', 'admin');
    ```

2. **`public.user_profiles` Table:** This table stores detailed user information and their assigned role, linked to the `auth.users` table.

    ```sql
    CREATE TABLE public.user_profiles (
        id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        role public.app_role DEFAULT 'homeowner' NOT NULL, -- Default role upon signup
        full_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    -- Enable RLS on user_profiles
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    -- Policies for user_profiles (see section 3.1)
    ```

#### 2.2. Role Assignment

* **Initial Sign-up:** A `handle_new_user` trigger on `auth.users` will automatically insert a new row into `public.user_profiles` with the `DEFAULT 'homeowner'` role upon a new user's registration.

    ```sql
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.user_profiles (id, full_name, avatar_url)
      VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    ```

* **Admin Dashboard:** An administrative interface will allow 'admin' users to manually update roles for other users in the `public.user_profiles` table. This should be a secure, backend-driven operation.

#### 2.3. Propagating Roles to JWT Custom Claims

To make roles easily accessible for Row-Level Security (RLS) policies and backend API calls, we will embed the user's role directly into their JWT as a custom claim.

1. **PostgreSQL Function to Retrieve Role:**

    ```sql
    CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
    RETURNS public.app_role AS $$
        SELECT role FROM public.user_profiles WHERE id = user_id;
    $$ LANGUAGE sql STABLE SECURITY DEFINER;
    ```

    * The `SECURITY DEFINER` clause ensures the function runs with the privileges of the user who created it (typically `supabase_admin`), allowing it to read from `user_profiles` even if RLS would normally prevent it.
2. **Supabase JWT Custom Claims Configuration:**
    * In the Supabase Dashboard: Authentication > Settings > JWT Settings.
    * Add a custom claim entry: `{"user_role": "SELECT public.get_user_role(auth.uid())"}`.
    * Now, every time a user logs in, their JWT will include a `user_role` claim. This claim can be accessed within RLS policies using `auth.jwt()->>'user_role'`, and also parsed by backend services.

### 3. Authorization Enforcement

Authorization will be enforced at multiple layers: the database (RLS), the backend API, and the frontend UI.

#### 3.1. Row-Level Security (RLS) in Supabase PostgreSQL

RLS is the primary and most secure layer for data access control. It ensures users can only access data they are authorized to see or modify, even if they attempt to bypass the frontend or backend.

* **Enable RLS:** Enable RLS on all sensitive tables (e.g., `properties`, `projects`, `bids`, `user_profiles`).
* **Policies:** Policies will use `auth.uid()` (the ID of the currently authenticated user) and `auth.jwt()->>'user_role'` (the custom role claim) to determine access.

  * **`user_profiles` Policies:**

        ```sql
        CREATE POLICY "Allow authenticated users to read profiles" ON public.user_profiles FOR SELECT USING (auth.role() = 'authenticated');
        CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
        -- Admin policy for full access (example, combine or create specific policies)
        CREATE POLICY "Admins can manage all profiles" ON public.user_profiles FOR ALL USING (auth.jwt()->>'user_role' = 'admin');
        ```

  * **`properties` Table (Owned by Homeowners):**

        ```sql
        CREATE TABLE public.properties (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            homeowner_id uuid REFERENCES auth.users(id),
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Homeowners can create their own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = homeowner_id AND auth.jwt()->>'user_role' = 'homeowner');
        CREATE POLICY "Homeowners can read/update their own properties" ON public.properties FOR SELECT USING (auth.uid() = homeowner_id AND auth.jwt()->>'user_role' = 'homeowner');
        CREATE POLICY "Homeowners can update their own properties" ON public.properties FOR UPDATE USING (auth.uid() = homeowner_id AND auth.jwt()->>'user_role' = 'homeowner');
        CREATE POLICY "Homeowners can delete their own properties" ON public.properties FOR DELETE USING (auth.uid() = homeowner_id AND auth.jwt()->>'user_role' = 'homeowner');

        -- Contractors can view public properties (e.g., properties with status 'open_for_bids')
        CREATE POLICY "Contractors can view properties open for bids" ON public.properties FOR SELECT USING (auth.jwt()->>'user_role' = 'contractor' AND status = 'open_for_bids');

        -- Admins can manage all properties
        CREATE POLICY "Admins can manage all properties" ON public.properties FOR ALL USING (auth.jwt()->>'user_role' = 'admin');
        ```

  * **`bids` Table (Created by Contractors for Properties):**

        ```sql
        CREATE TABLE public.bids (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            contractor_id uuid REFERENCES auth.users(id),
            property_id uuid REFERENCES public.properties(id),
            amount NUMERIC(10, 2) NOT NULL,
            status TEXT DEFAULT 'submitted', -- e.g., 'submitted', 'accepted', 'rejected'
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Contractors can create their own bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = contractor_id AND auth.jwt()->>'user_role' = 'contractor');
        CREATE POLICY "Contractors can read/update their own bids" ON public.bids FOR SELECT USING (auth.uid() = contractor_id AND auth.jwt()->>'user_role' = 'contractor');
        CREATE POLICY "Contractors can update their own bids" ON public.bids FOR UPDATE USING (auth.uid() = contractor_id AND auth.jwt()->>'user_role' = 'contractor');
        CREATE POLICY "Contractors can delete their own bids" ON public.bids FOR DELETE USING (auth.uid() = contractor_id AND auth.jwt()->>'user_role' = 'contractor');

        -- Homeowners can view bids on their properties
        CREATE POLICY "Homeowners can view bids on their properties" ON public.bids FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND homeowner_id = auth.uid())
            AND auth.jwt()->>'user_role' = 'homeowner'
        );
        -- Homeowners can update bid status for bids on their properties (e.g., accept/reject)
        CREATE POLICY "Homeowners can update bid status on their properties" ON public.bids FOR UPDATE USING (
            EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND homeowner_id = auth.uid())
            AND auth.jwt()->>'user_role' = 'homeowner'
            AND OLD.status = 'submitted' -- Only allow status change from submitted
        );

        -- Admins can manage all bids
        CREATE POLICY "Admins can manage all bids" ON public.bids FOR ALL USING (auth.jwt()->>'user_role' = 'admin');
        ```

#### 3.2. API Service (Custom Backend & Supabase Edge Functions) Authorization

For actions involving complex business logic or external service interactions, the custom API service and Edge Functions will enforce authorization.

* **JWT Validation:** All requests to these services should include the Supabase JWT in the `Authorization: Bearer <token>` header.
  * **Custom Backend Service:** The service will validate the JWT signature (using the Supabase JWT secret) and check its expiry. Libraries like `jsonwebtoken` (Node.js) or `PyJWT` (Python) can be used.
  * **Supabase Edge Functions:** Supabase Edge Functions automatically receive the authenticated user's JWT in the `context.auth.token` (or `req.headers.authorization`) and can access `context.auth.user` for basic details. The custom `user_role` claim will be directly available in the parsed JWT.
* **Role-Based Access Control (RBAC) in Logic:**
  * Extract `user_id` (from `sub` claim) and `user_role` (from custom claim) from the validated JWT.
  * Implement conditional logic within the service code to allow or deny actions based on these roles.
  * **Example:** Only 'admin' users can trigger a service that purges old data or directly modifies other users' roles via the Supabase Service Role Key (which should *never* be exposed client-side).
  * **Important:** When the Custom API Service interacts with Supabase PostgreSQL, it can do so either as an authenticated user (passing the user's JWT) or as the `service_role` user (using the `SUPABASE_SERVICE_ROLE_KEY`). For actions where RLS should still apply, pass the user's JWT. For admin-level operations that bypass RLS (e.g., by an 'admin' role in your custom service), use the `service_role` key, but ensure strict access control within your service's code to prevent abuse.

#### 3.3. Frontend UI Authorization

The frontend will adjust its user experience based on the authenticated user's role. This is for usability, not security.

* **Access User Role:** The client-side Supabase client will provide the user's session, which includes the JWT with the `user_role` claim. This can be accessed via `supabase.auth.getSession()` or the `useUser()` hook.
* **Conditional Rendering:**
  * Hide/show navigation links (e.g., 'Admin Dashboard' for admins only).
  * Disable/enable buttons (e.g., 'Accept Bid' for homeowners, 'Submit Bid' for contractors).
  * Adjust form fields or data displays based on the user's permissions.
* **Reminder:** Always assume the frontend can be bypassed. All critical authorization checks MUST occur at the database (RLS) and backend API levels.

### 4. Security Considerations

* **Environment Variables:** Store Supabase keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) securely. `SUPABASE_SERVICE_ROLE_KEY` should *never* be exposed client-side.
* **SSL/TLS:** Supabase services are always accessed over HTTPS. Ensure your Next.js deployment also uses HTTPS.
* **Rate Limiting:** Implement rate limiting on authentication endpoints (sign-up, sign-in, password reset) to prevent brute-force attacks. Supabase Auth has some built-in rate limiting.
* **Secure Password Storage:** Handled automatically by Supabase Auth (GoTrue).
* **Strict RLS Policies:** Regularly review and test RLS policies to ensure no unintended data access is possible. Adhere to the principle of least privilege.
* **Input Validation:** Always validate all user inputs on both the client and server to prevent injection attacks.
* **Audit Logs:** Supabase provides audit logs for authentication events, which can be crucial for security monitoring.
* **Database Schema for sensitive data:** Ensure sensitive data is not publicly exposed and is protected by appropriate RLS policies.

By implementing this multi-layered approach with Supabase Auth, custom roles embedded in JWTs, and rigorous RLS policies, HOMEase can achieve robust authentication and fine-grained authorization across its application.

Supabase Storage Implementation Plan
gemini-2.5-flash
ID: 4
23948ms
Depends on:
1
Prompt
Detail the implementation plan for integrating Supabase Storage into the HOMEase | AI platform. Describe how AR scan images, AI-generated 'after' visualizations, and contractor-uploaded documents (licenses, insurance) will be stored, organized into buckets, and retrieved. Include considerations for public/private access control using Supabase's storage policies.
Output
The integration of Supabase Storage into the HOMEase | AI platform will leverage its S3-compatible object storage capabilities, tightly coupled with Supabase Auth and PostgreSQL's Row-Level Security (RLS) for robust access control. This plan details the storage, organization, retrieval, and access control for AR scan images, AI-generated 'after' visualizations, and contractor-uploaded documents.

---

### Implementation Plan: Supabase Storage Integration

#### I. Storage Architecture Overview

Supabase Storage will serve as the primary object storage for HOMEase. It integrates seamlessly with the Next.js frontend (via Supabase JS SDK) for direct user uploads, and with the Custom API Service for server-side generated content or more complex upload/processing workflows. Access to stored objects will be governed by Supabase Storage Policies, which utilize PostgreSQL's RLS capabilities to enforce fine-grained permissions based on authenticated user roles and data ownership.

**Key Components & Interactions:**

* **Next.js Frontend:** Directly uploads/downloads files to/from Supabase Storage using the Supabase JS client library for user-initiated content (e.g., AR scans, contractor documents).
* **Custom API Service:** Uploads AI-generated content to Supabase Storage. It can also act as a proxy for frontend uploads, adding additional validation or processing before storing files.
* **Supabase PostgreSQL:** Stores metadata about the files (e.g., file path, associated user/project, upload date, size) in relevant tables (e.g., `projects`, `contractor_profiles`).
* **Supabase Storage Policies:** PostgreSQL-backed policies that define who can perform `SELECT`, `INSERT`, `UPDATE`, `DELETE` operations on objects within specific buckets. These policies will check user authentication and RLS rules.

#### II. Bucket Strategy

We will organize files into logical buckets based on their type, source, and typical access patterns. This simplifies policy management and ensures data separation.

1. **`homease-projects` Bucket:**
    * **Purpose:** Stores all project-related media.
    * **Content:**
        * AR scan images (user-uploaded)
        * AI-generated 'after' visualizations
    * **Access:** Primarily private, accessible by the homeowner who owns the project and contractors assigned to that specific project.
    * **Path Structure:** `homease-projects/{user_id}/{project_id}/{file_type}/{filename.ext}`
        * Example: `homease-projects/uuid-user123/uuid-project456/ar_scans/living_room_01.jpg`
        * Example: `homease-projects/uuid-user123/uuid-project456/ai_visualizations/living_room_after_v1.png`

2. **`homease-contractor-docs` Bucket:**
    * **Purpose:** Stores official documents and media related to contractors.
    * **Content:**
        * Contractor licenses
        * Insurance certificates
        * Portfolio images/videos (if applicable, or a separate bucket for larger media)
    * **Access:** Private for sensitive documents, but selectively shareable with homeowners or platform admins.
    * **Path Structure:** `homease-contractor-docs/{contractor_id}/{document_type}/{filename.ext}`
        * Example: `homease-contractor-docs/uuid-contractor789/licenses/business_license_2024.pdf`
        * Example: `homease-contractor-docs/uuid-contractor789/insurance/liability_policy.pdf`

#### III. File Naming Conventions & Metadata Storage

**File Naming:**
A consistent naming convention is crucial for organization and retrieval. We will use a hierarchical path structure within each bucket:
`/{bucket_name}/{user_or_contractor_id}/{project_id_or_doc_type}/{timestamp_or_version}_{original_filename.ext}`

* Using UUIDs for `user_id`, `project_id`, and `contractor_id` ensures uniqueness.
* Timestamps or version numbers help manage multiple uploads or iterations.
* Original filename can be preserved for user reference.

**Metadata Storage in PostgreSQL:**
For each file stored in Supabase Storage, relevant metadata will be stored in corresponding PostgreSQL tables (e.g., `user_files`, `project_media`, `contractor_documents`). This allows for efficient querying and RLS enforcement.

Example `project_media` table:

```sql
CREATE TABLE project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Owner of the project
    file_path TEXT NOT NULL, -- e.g., 'homease-projects/uuid-user123/uuid-project456/ar_scans/living_room_01.jpg'
    file_type TEXT NOT NULL, -- 'ar_scan', 'ai_visualization'
    original_filename TEXT,
    mime_type TEXT,
    size_bytes BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}' -- e.g., { "ai_model_version": "gemini-v1", "scan_resolution": "1920x1080" }
);
```

#### IV. Implementation Steps for Storage & Retrieval

**A. AR Scan Images (Homeowner Uploads)**

1. **Upload Flow:**
    * **Frontend (Next.js):** Homeowner initiates an AR scan through the mobile or web app.
    * The app captures the image(s) and uses the Supabase JS SDK (`supabase.storage.from('homease-projects').upload(...)`) to directly upload the image to the `homease-projects` bucket.
    * The `user_id` and `project_id` are passed along with the file.
    * **Database Record:** Upon successful upload, the frontend or a triggered Supabase Edge Function (if a more complex validation/metadata extraction is needed) inserts a record into the `project_media` table in PostgreSQL, storing the `file_path` and other relevant metadata.
2. **Retrieval:**
    * **Frontend (Next.js):** When displaying project details, the frontend queries the PostgreSQL `project_media` table to get the `file_path` for AR images associated with the current `project_id`.
    * It then generates a public (or signed, if strict private access is needed) URL using `supabase.storage.from('homease-projects').getPublicUrl(filePath)` or `createSignedUrl(filePath, expiresIn)`.
    * The image is displayed using this URL.

**B. AI-Generated 'After' Visualizations**

1. **Upload Flow:**
    * **Custom API Service:** After processing an AR scan and generating an 'after' visualization using the Google Gemini API, the Custom API Service (e.g., running on Fly.io/Render) receives the generated image data.
    * It then uses the Supabase Server-side client library (`supabase.storage.from('homease-projects').upload(...)`) to store the image in the `homease-projects` bucket.
    * **Database Record:** The Custom API Service inserts a record into the `project_media` table, linking the visualization to the `project_id` and storing its `file_path`.
2. **Retrieval:**
    * Similar to AR scan images, the frontend queries the `project_media` table for the visualization's `file_path` and constructs a URL to display it.

**C. Contractor-Uploaded Documents (Licenses, Insurance)**

1. **Upload Flow:**
    * **Frontend (Next.js):** Contractors log in and navigate to their profile. They upload documents through a form.
    * The Supabase JS SDK (`supabase.storage.from('homease-contractor-docs').upload(...)`) is used to upload the document to the `homease-contractor-docs` bucket.
    * The `contractor_id` and `document_type` are included in the path.
    * **Database Record:** A record is inserted into a `contractor_documents` table in PostgreSQL, storing the `file_path`, `contractor_id`, `document_type`, expiration dates, and other relevant verification metadata.
2. **Retrieval:**
    * **For the contractor:** They can view their own uploaded documents by querying the `contractor_documents` table using their `contractor_id` and generating a signed URL.
    * **For homeowners:** When a homeowner views a contractor's profile or proposal, the system queries the `contractor_documents` table for publicly verifiable documents (e.g., active license) for that `contractor_id`. A signed URL is then generated to display these documents.
    * **For admins:** Admins can access all contractor documents via their backend interface, using their authenticated session to generate signed URLs for viewing.

#### V. Supabase Storage Policy & Access Control

Supabase Storage Policies are essential for controlling who can access which files. These policies are written in SQL and are evaluated against the current authenticated user (`auth.uid()`, `auth.role()`) and any data stored in your PostgreSQL database (e.g., `projects.user_id`).

**General Principles:**

* All buckets will initially be created as **private**.
* Access will be granted via explicit Storage Policies.
* Policies will leverage `auth.uid()` (the currently authenticated user's ID) and `auth.role()` (e.g., 'authenticated', 'anon', 'service_role', custom roles).
* RLS on metadata tables (`project_media`, `contractor_documents`) will complement storage policies by filtering *which* files a user can even know about.

**Detailed Policies:**

1. **`homease-projects` Bucket Policies:**
    * **Policy Name:** `Allow_Owner_Access`
        * **Operations:** `SELECT`, `INSERT`, `UPDATE`, `DELETE`
        * **Targets:** `objects` table (Supabase Storage's internal table)
        * **WITH CHECK/USING:** `EXISTS (SELECT 1 FROM project_media pm WHERE pm.file_path = objects.name AND pm.user_id = auth.uid())`
        * **Description:** Allows the project owner (the `user_id` linked to the `project_media` entry) to upload, view, update, or delete their own project files.
    * **Policy Name:** `Allow_Assigned_Contractor_Read`
        * **Operations:** `SELECT`
        * **Targets:** `objects` table
        * **WITH CHECK/USING:** `EXISTS (SELECT 1 FROM project_assignments pa JOIN project_media pm ON pa.project_id = pm.project_id WHERE pm.file_path = objects.name AND pa.contractor_id = auth.uid())`
        * **Description:** Allows a contractor (`auth.uid()`) who is `assigned` to a specific project (`project_assignments` table) to view files related to that project.
    * **Policy Name:** `Allow_AI_Service_Upload`
        * **Operations:** `INSERT`
        * **Targets:** `objects` table
        * **WITH CHECK/USING:** `auth.role() = 'service_role'` (This assumes the Custom API Service uses the service role key for uploading AI-generated files, or a specific API key associated with a custom role.)
        * **Description:** Grants permission for the backend AI service (Custom API Service) to upload generated images. This needs careful handling of `service_role` keys or creating a dedicated custom role for server-side operations.

2. **`homease-contractor-docs` Bucket Policies:**
    * **Policy Name:** `Allow_Contractor_Own_Docs`
        * **Operations:** `SELECT`, `INSERT`, `UPDATE`, `DELETE`
        * **Targets:** `objects` table
        * **WITH CHECK/USING:** `EXISTS (SELECT 1 FROM contractor_documents cd WHERE cd.file_path = objects.name AND cd.contractor_id = auth.uid())`
        * **Description:** Allows a contractor to manage (upload, view, update, delete) their own documents.
    * **Policy Name:** `Allow_Homeowner_View_Public_Docs`
        * **Operations:** `SELECT`
        * **Targets:** `objects` table
        * **WITH CHECK/USING:** `EXISTS (SELECT 1 FROM contractor_documents cd WHERE cd.file_path = objects.name AND cd.is_public = TRUE)` (Assuming an `is_public` flag on `contractor_documents` for things like active licenses that can be shown to homeowners).
        * **Description:** Allows any authenticated homeowner to view documents explicitly marked as public (e.g., verified licenses, insurance summaries). This would typically be achieved by generating a `createSignedUrl` through the Custom API service, which verifies the homeowner's right to see it.
    * **Policy Name:** `Allow_Admin_Access`
        * **Operations:** `SELECT`, `INSERT`, `UPDATE`, `DELETE`
        * **Targets:** `objects` table
        * **WITH CHECK/USING:** `auth.role() = 'admin'` (Requires a custom `admin` role set up in `auth.users` table or via a dedicated `admin_users` table.)
        * **Description:** Grants full access to platform administrators for moderation and management.

#### VI. Security Considerations

* **API Keys:** Use the `anon` key for client-side Supabase interactions and the `service_role` key (or a more restricted custom role key) for server-side Custom API Service operations. Never expose the `service_role` key to the client.
* **Rate Limiting:** Implement rate limiting on both frontend uploads and Custom API Service endpoints to prevent abuse.
* **File Type and Size Validation:** Implement client-side validation for file types and sizes before upload, and critical server-side validation in the Custom API Service (if acting as a proxy) or via Supabase Edge Functions on Storage events, to prevent malicious uploads or excessive storage use.
* **Presigned URLs:** For highly sensitive private files that need temporary access, use `createSignedUrl()` instead of `getPublicUrl()`. The signed URL grants temporary, time-limited access without requiring full authentication at the time of access. The generation of these URLs should happen on the Custom API Service after validating the requesting user's permissions.
* **Data Encryption:** Supabase Storage encrypts data at rest, and all traffic uses HTTPS for encryption in transit.

#### VII. Error Handling & Monitoring

* **Robust Error Handling:** Implement comprehensive error handling for all upload and retrieval operations in both the frontend and Custom API Service. Log errors to a centralized logging service.
* **Upload Retries:** Implement retry mechanisms for intermittent network issues during uploads.
* **Monitoring:** Set up monitoring for storage usage, upload/download activity, and policy violations within the Supabase dashboard and through external monitoring tools.

#### VIII. Future Enhancements

* **Image Transformations:** Supabase Storage offers basic image transformations (resizing, compression) on the fly using query parameters. This can be utilized for optimizing image delivery for different devices or display contexts.
* **CDN Integration:** For global performance and reduced latency, consider integrating a dedicated CDN (beyond Supabase's built-in CDN) for public-facing assets, although Vercel's CDN will already handle frontend assets effectively.
* **Virus Scanning:** For contractor documents, consider integrating a virus scanning service (e.g., ClamAV) via a Supabase Edge Function or the Custom API Service before final storage or on a scheduled basis.

By following this plan, HOMEase | AI will have a secure, scalable, and well-organized storage solution for all its critical media and documents, with flexible access control powered by Supabase's robust features.

Backend Services Re-platforming Design (Supabase Edge Functions / Custom Backend)
gemini-2.5-pro
ID: 5
62599ms
Depends on:
1
Prompt
The HOMEase | AI platform needs to re-platform its backend services from Google Cloud Functions. Design a detailed plan for this transition. Evaluate the suitability of Supabase Edge Functions (Deno-based) versus a separate custom backend service (e.g., Node.js/Express, Python/FastAPI) deployed alongside Supabase. Justify the recommendation. For the chosen approach, outline the high-level structure of API endpoints for key functionalities (e.g., lead submission, contractor matching, payment processing webhook handling) and how they will interact with the Supabase Database, Storage, and external Gemini APIs. Provide example pseudo-code or architectural patterns for a critical flow like 'Lead Creation'.
Output
The HOMEase | AI platform's re-platforming of backend services from Google Cloud Functions requires a strategic approach. This plan evaluates suitable architectures, recommends a primary approach, and details the API structure and a critical flow example.

---

### 1. Evaluation: Supabase Edge Functions (Deno-based) vs. Custom Backend Service

**Supabase Edge Functions (Deno-based)**

* **Pros:**
  * **Low Latency & Global Distribution:** Deployed on a global CDN (Deno Deploy), offering fast execution close to users.
  * **Tight Supabase Integration:** Native access to Supabase Auth, Database (PostgREST), and Storage clients. Ideal for database triggers and webhooks.
  * **Cost-Effective:** Pay-per-invocation model with a generous free tier, suitable for small, bursty workloads.
  * **Simplified Deployment:** Git-based deployment integrated directly with the Supabase project.
  * **TypeScript Native:** Deno's first-class TypeScript support can enhance developer experience and code quality.

* **Cons:**
  * **Execution Time Limits:** Designed for short-lived operations (typically up to 15 seconds). Unsuitable for long-running AI inferences or complex data processing.
  * **Resource Constraints:** Limited memory and CPU compared to dedicated server instances, which can be an issue for intensive tasks.
  * **Runtime Ecosystem:** Deno, while powerful, has a different module ecosystem and tooling compared to the more mature Node.js or Python environments.
  * **Framework Compatibility:** Not designed for full-fledged web frameworks (Express, FastAPI), limiting architectural flexibility for complex APIs.
  * **Cold Starts:** Can introduce latency for infrequent invocations.

**Custom Backend Service (e.g., Node.js/Express, Python/FastAPI deployed on Fly.io/Render)**

* **Pros:**
  * **Full Control & Flexibility:** Complete control over runtime, dependencies, frameworks, and application architecture.
  * **Long-Running & Resource-Intensive Tasks:** Ideal for complex business logic, multi-step workflows, heavy computations (e.g., extensive AI model interaction), and long-running background jobs.
  * **Mature Ecosystems:** Access to vast, well-established ecosystems of libraries, frameworks, and development tools in Node.js or Python.
  * **Predictable Performance:** Dedicated resources can offer more consistent performance and minimal cold starts.
  * **Robust Asynchronous Processing:** Seamless integration with message queues (Redis Streams/Queue) for background task processing and decoupling.
  * **Advanced Debugging & Monitoring:** More mature and comprehensive tools for logging, monitoring, and debugging.

* **Cons:**
  * **Increased Operational Overhead:** Requires more effort in terms of infrastructure setup, deployment, scaling configuration, and ongoing maintenance.
  * **Potentially Higher Cost:** Dedicated instances can be more expensive than serverless functions, especially for low-traffic applications.
  * **Scalability Management:** While platforms like Fly.io/Render simplify this, it still requires more conscious design and configuration than fully managed serverless offerings.

**Recommendation for HOMEase: Hybrid Approach with Custom Backend Service as Primary**

Given HOMEase's requirements, which include **complex business logic, significant AI model interaction (Gemini API), and asynchronous task processing**, a **Custom Backend Service** will be the primary backend component. Supabase Edge Functions will serve a complementary role for specific, lightweight, event-driven tasks.

**Justification:**

1. **AI Integration & Complex Logic:** Interacting with Google Gemini API for property analysis and report generation can involve significant data transfer and processing, potentially exceeding Edge Functions' execution limits and resource capabilities. The Custom Backend Service provides a stable, controlled environment for these critical AI-driven operations.
2. **Asynchronous Workflows:** Tasks like detailed AI analysis, report generation, and notifications are best handled asynchronously to avoid blocking user requests. The Custom Backend Service integrates seamlessly with Redis Streams/Queue and dedicated worker services for robust background job processing.
3. **Core Business Logic:** Lead submission, intricate contractor matching algorithms, and secure payment processing workflows require complex business logic that is more maintainable and testable within a full-fledged application framework (e.g., NestJS, FastAPI) provided by a custom backend.
4. **Robust Webhook Handling:** While Edge Functions can receive webhooks, the critical, multi-step processing required for payment webhooks (signature verification, database updates, subsequent actions) is better suited for the control and error handling capabilities of a custom backend service, optionally using an Edge Function as a rapid initial receiver/dispatcher.
5. **Developer Experience:** Leveraging mature Node.js or Python ecosystems offers a richer selection of libraries, frameworks, and a larger talent pool, which can accelerate development and improve maintainability for a platform of HOMEase's complexity.

**Role of Supabase Edge Functions:**

Edge Functions will be used for specific, lightweight tasks where their proximity to the Supabase database and low-latency execution are beneficial:

* **Database Triggers:** Automatically reacting to `INSERT`, `UPDATE`, or `DELETE` events in the PostgreSQL database (e.g., after a new lead is created, trigger a simple notification or denormalization).
* **Simple Data Transformations:** Minor data manipulation on database events before storage or further processing.
* **Lightweight API Proxies:** For very simple, single-purpose API endpoints that don't involve complex business logic or external integrations.

---

### 2. High-Level Structure of API Endpoints

The Custom Backend Service will expose RESTful API endpoints, secured by JWTs issued by Supabase Auth.

**Base URL:** `https://api.homease.com` (example)

**Authentication:** All protected endpoints will require a valid JWT in the `Authorization: Bearer <token>` header. The Custom Backend Service will validate these JWTs against Supabase's public key or using the Supabase client library to verify the user's identity and role.

---

#### A. Lead Submission & Management

* **`POST /leads`**
  * **Description:** Creates a new project lead submitted by a homeowner.
  * **Payload:** `{ property_details: { address, type, etc. }, project_description: string, budget: number, images_urls: string[], contact_info: { email, phone } }`
  * **Interaction:**
        1. Validate user's JWT (homeowner role).
        2. Sanitize and validate input data.
        3. Insert initial lead data into `Supabase DB (leads table)`.
        4. Publish an event to `Redis Queue` (e.g., `lead_submitted_for_analysis`) with the new `lead_id` for background AI processing.
        5. Return `201 Created` with `lead_id` and initial status.
* **`GET /leads/{lead_id}`**
  * **Description:** Retrieves detailed information for a specific lead.
  * **Interaction:**
        1. Validate user's JWT and ensure they are authorized to view this lead (homeowner or matched contractor).
        2. Query `Supabase DB (leads, ai_analysis_results, bids tables)` to retrieve comprehensive lead data.
        3. Return `200 OK` with lead details.
* **`GET /leads?status={status}&zip_code={zip}`**
  * **Description:** Lists leads based on various filters (e.g., for contractors to browse).
  * **Interaction:**
        1. Validate user's JWT (contractor role).
        2. Query `Supabase DB (leads table)` applying filters and Row-Level Security (RLS) policies to only show relevant leads.
        3. Return `200 OK` with a list of lead summaries.

---

#### B. Contractor Matching & Bidding

* **`GET /contractors/{contractor_id}/leads`**
  * **Description:** Retrieves a list of leads recommended or assigned to a specific contractor.
  * **Interaction:**
        1. Validate user's JWT (contractor role, matching `contractor_id`).
        2. Query `Supabase DB` to fetch leads relevant to the contractor's profile (service area, skills). This might involve complex joins and filtering logic.
        3. Return `200 OK` with tailored lead data.
* **`POST /leads/{lead_id}/bids`**
  * **Description:** Allows a contractor to submit a bid for a lead.
  * **Payload:** `{ contractor_id: string, bid_amount: number, estimated_completion_date: date, bid_details: string }`
  * **Interaction:**
        1. Validate user's JWT (contractor role, matching `contractor_id`), verify contractor is eligible to bid on `lead_id`.
        2. Insert bid data into `Supabase DB (bids table)`.
        3. **Optional:** Trigger a `Supabase Edge Function` via a database trigger on `bids` table `INSERT` to send a quick notification to the homeowner.
        4. Return `201 Created` with `bid_id`.
* **`PUT /leads/{lead_id}/bids/{bid_id}/accept`**
  * **Description:** Homeowner accepts a contractor's bid.
  * **Payload:** `{ homeowner_id: string }` (implicitly from JWT)
  * **Interaction:**
        1. Validate user's JWT (homeowner role, matching `homeowner_id`), verify ownership of the lead.
        2. Update `Supabase DB (bids table)` status to `accepted` and `leads table` status to `matched`.
        3. Publish an event to `Redis Queue` (e.g., `bid_accepted`) for subsequent payment initiation, contract generation, etc.
        4. Return `200 OK`.

---

#### C. Payment Processing Webhook Handling

* **`POST /webhooks/payment/{gateway_name}`** (e.g., `/webhooks/payment/stripe`)
  * **Description:** Receives and processes webhooks from external payment gateways.
  * **Payload:** Raw webhook payload from the payment gateway.
  * **Interaction (Custom Backend Service - primary handler):**
        1. **Receive & Acknowledge:** Rapidly receive the webhook POST request.
        2. **Signature Verification:** Verify the webhook's signature to ensure authenticity.
        3. **Robust Processing:** Parse the event type (e.g., `charge.succeeded`, `invoice.payment_failed`).
        4. Query `Supabase DB (payments table)` to find the associated transaction/order.
        5. Update payment status and details in the `payments` table.
        6. Publish relevant events to `Redis Queue` (e.g., `payment_succeeded`, `payment_failed`) to trigger further background actions (e.g., releasing funds to contractor, updating project status, sending receipts).
        7. Return `200 OK` to acknowledge receipt to the payment gateway.
  * **Note:** While a `Supabase Edge Function` could serve as an initial webhook receiver for quick acknowledgment, the complexity of signature verification, robust error handling, and multi-step database updates strongly favors the Custom Backend Service for the primary processing to ensure reliability and maintainability.

---

#### D. AI & Data Analysis

* **`POST /ai/analyze-property`** (Typically called internally by Lead Creation flow or by Worker Service)
  * **Description:** Triggers a detailed AI analysis for a given property/lead.
  * **Payload:** `{ lead_id: string, property_data: object, project_description: string, image_data_urls: string[] }`
  * **Interaction:**
        1. Retrieve detailed lead information and associated image URLs from `Supabase DB` and `Supabase Storage`.
        2. Format request for `Google Gemini API`.
        3. Make an authenticated call to `Google Gemini API`.
        4. Parse and process Gemini's response (e.g., extract estimated costs, required skills, feasibility).
        5. Store the structured analysis results in `Supabase DB (ai_analysis_results table)` and update the `leads` table with a summary and status.
        6. Return `200 OK` with analysis summary.
  * **Note:** This endpoint would primarily be invoked by internal worker services (consuming `Redis Queue` messages) rather than directly by the frontend, as it's a long-running operation.

---

### 3. Example Pseudo-Code / Architectural Pattern: 'Lead Creation' Critical Flow

**Scenario:** A homeowner submits a new project lead via the Next.js frontend, including property details, project description, and optionally images.

```mermaid
sequenceDiagram
    participant Frontend (Next.js)
    participant Custom Backend Service (Node.js/Express)
    participant Supabase Auth
    participant Supabase DB (PostgreSQL)
    participant Supabase Storage
    participant Redis Queue (Upstash)
    participant AI Worker Service (part of Custom Backend deployment)
    participant Google Gemini API

    Frontend->>Supabase Auth: Get Auth Token (if not already logged in)
    Supabase Auth-->>Frontend: JWT

    Frontend->>Custom Backend Service: POST /leads (lead_data, images_urls[], JWT)
    Custom Backend Service->>Supabase Auth: Validate JWT & Extract User ID
    Supabase Auth-->>Custom Backend Service: User ID (homeowner_id)

    Custom Backend Service->>Supabase DB: INSERT into leads (homeowner_id, property_address, project_description, budget, images_urls, status='submitted')
    Supabase DB-->>Custom Backend Service: lead_id (e.g., UUID)

    Custom Backend Service->>Redis Queue: PUBLISH 'lead_submitted_for_analysis' event ({ lead_id })
    Note over Custom Backend Service: Decouple long-running AI analysis

    Custom Backend Service-->>Frontend: 201 Created ({ lead_id, status: 'submitted' })
    Note over Frontend: User sees immediate confirmation, AI analysis happens in background

    Loop Async Processing
        AI Worker Service->>Redis Queue: LISTEN 'lead_submitted_for_analysis'
        Redis Queue-->>AI Worker Service: event ({ lead_id })

        AI Worker Service->>Supabase DB: SELECT lead_data, images_urls FROM leads WHERE id = lead_id
        Supabase DB-->>AI Worker Service: lead_data, images_urls

        alt If images_urls exist
            AI Worker Service->>Supabase Storage: Fetch image data from images_urls
            Supabase Storage-->>AI Worker Service: Image data (binary/base64)
        end

        AI Worker Service->>Google Gemini API: Call Gemini API (property_text_description, image_parts[])
        Google Gemini API-->>AI Worker Service: AI analysis results (JSON)

        AI Worker Service->>Supabase DB: UPDATE leads SET status='analyzed', ai_analysis_summary=..., updated_at=NOW() WHERE id = lead_id
        AI Worker Service->>Supabase DB: INSERT into ai_analysis_results (lead_id, full_analysis_json, generated_at=NOW())

        AI Worker Service->>Redis Queue: PUBLISH 'lead_analyzed' event ({ lead_id })
        Note over AI Worker Service: Triggers subsequent workflows like contractor matching or notification
    End
```

**Pseudo-code for Lead Creation (Custom Backend Service - Node.js/TypeScript with Express and Supabase SDK):**

```typescript
// --- Custom Backend Service: src/routes/leadRoutes.ts ---
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';
import { User } from '@supabase/supabase-js'; // Assuming User type from Supabase

// Initialize Supabase Admin Client (for server-side operations that bypass RLS)
// This key should be kept secure and never exposed to the client.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Redis client (e.g., for Upstash)
const redis = new Redis(process.env.REDIS_URL!);

// --- Middleware for Authentication and Authorization ---
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Authorization header missing');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Bearer token missing');
  }

  try {
    // Verify JWT using Supabase Auth Helper or directly
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      console.error('JWT verification failed:', error?.message);
      return res.status(401).send('Invalid or expired token');
    }

    (req as any).user = data.user; // Attach user object to request for downstream handlers
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(500).send('Authentication processing error');
  }
};

// --- API Endpoint: POST /leads ---
export const createLead = async (req: Request, res: Response) => {
  const { property_details, project_description, budget, images_urls, contact_info } = req.body;
  const homeowner_id = (req as any).user.id; // User ID from authenticated JWT

  // 1. Input Validation
  if (!property_details || !project_description || !homeowner_id) {
    return res.status(400).json({ error: 'Missing required lead data.' });
  }
  // Further validation for property_details, budget, etc.

  try {
    // 2. Insert Lead Data into Supabase Database
    const { data: newLead, error: dbError } = await supabaseAdmin
      .from('leads')
      .insert({
        homeowner_id,
        property_address: property_details.address, // Extract specific fields
        property_type: property_details.type,
        project_description,
        budget,
        contact_email: contact_info.email,
        contact_phone: contact_info.phone,
        images_urls: images_urls || [], // Store URLs provided by frontend (presumably pre-uploaded to Storage)
        status: 'submitted', // Initial status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id') // Select only the ID of the newly created lead
      .single();

    if (dbError || !newLead) {
      console.error('Error saving lead to DB:', dbError);
      return res.status(500).json({ error: 'Failed to create lead due to database error.' });
    }

    const leadId = newLead.id;

    // 3. Publish Message to Redis Queue for Asynchronous AI Analysis
    const eventPayload = {
      lead_id: leadId,
      timestamp: new Date().toISOString(),
      type: 'lead_submitted_for_analysis'
    };
    await redis.xadd('homease:leads_stream', '*', 'event_data', JSON.stringify(eventPayload));
    console.log(`Published 'lead_submitted_for_analysis' for lead ${leadId}`);

    // 4. Respond to Client
    return res.status(201).json({
      message: 'Lead created successfully and sent for AI analysis.',
      lead_id: leadId,
      status: 'submitted'
    });

  } catch (error) {
    console.error('Error in createLead:', error);
    return res.status(500).json({ error: 'Internal server error during lead creation.' });
  }
};


// --- AI Worker Service: src/workers/leadAnalysisWorker.ts ---
// Uses the Google GenAI TypeScript SDK (@google/genai)

import { createClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';
import { GoogleGenAI } from '@google/genai';

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Redis client
const redis = new Redis(process.env.REDIS_URL!);

// Initialize Google GenAI client
// API key is picked up from GEMINI_API_KEY environment variable automatically
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gemini client
const result = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [...],
});

export async function startLeadAnalysisWorker() {
  console.log('HOMEase Lead Analysis Worker started...');
  let lastId = '$'; // Start from the latest message in the stream

  while (true) {
    try {
      // XREAD BLOCK waits for new messages, COUNT 1 processes one at a time for simplicity
      const messages = await redis.xread(
        'BLOCK', 5000, // Block for 5 seconds if no new messages
        'COUNT', 1,
        'STREAMS', 'homease:leads_stream', lastId
      );

      if (messages && messages.length > 0) {
        for (const stream of messages) {
          const streamMessages = stream[1];

          for (const message of streamMessages) {
            const messageId = message[0];
            const eventData = JSON.parse(message[1][1]); // Assuming 'event_data' is the key

            if (eventData.type === 'lead_submitted_for_analysis' && eventData.lead_id) {
              console.log(`Processing lead ${eventData.lead_id} for AI analysis.`);
              await analyzeLeadWithGemini(eventData.lead_id);
            }
            lastId = messageId; // Update lastId for the next read
          }
        }
      }
    } catch (error) {
      console.error('Error in Lead Analysis Worker:', error);
      // Implement robust error handling: retry mechanisms, dead-letter queues, alert systems
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait before retrying stream read
    }
  }
}

async function analyzeLeadWithGemini(leadId: string) {
  try {
    // 1. Fetch Lead Data from Supabase Database
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) {
      console.error(`Lead ${leadId} not found or fetch error:`, fetchError?.message);
      // Update lead status to indicate analysis failure
      await supabaseAdmin.from('leads').update({ status: 'analysis_failed', updated_at: new Date().toISOString() }).eq('id', leadId);
      return;
    }

    // 2. Build the content parts array for Gemini
    const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    // Add the text prompt
    contentParts.push({
      text: `Analyze this property lead for a home improvement project:

Property Address: ${lead.property_address}
Property Type: ${lead.property_type}
Project Description: ${lead.project_description}
Homeowner Budget: $${lead.budget}

Please provide:
1. A feasibility assessment (High/Medium/Low)
2. Estimated cost range based on the project description
3. Required contractor skills/trades needed
4. Key observations about the property or project
5. Any potential concerns or recommendations

Respond in a structured JSON format with these fields:
{
  "feasibility": "High|Medium|Low",
  "estimated_cost_range": { "min": number, "max": number },
  "required_skills": ["skill1", "skill2"],
  "key_observations": ["observation1", "observation2"],
  "concerns": ["concern1", "concern2"],
  "recommendations": ["rec1", "rec2"],
  "summary": "brief summary text"
}`
    });

    // 3. Process images if available
    if (lead.images_urls && lead.images_urls.length > 0) {
      contentParts.push({
        text: "The following images show the property and/or project area. Please analyze them as part of your assessment:"
      });

      for (const imageUrl of lead.images_urls) {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.warn(`Failed to fetch image from ${imageUrl}: ${response.statusText}`);
            continue;
          }
          const arrayBuffer = await response.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString('base64');
          const mimeType = response.headers.get('content-type') || 'image/jpeg';

          // TypeScript SDK uses camelCase: inlineData, mimeType
          contentParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          });
          console.log(`Added image from ${imageUrl} to Gemini payload.`);
        } catch (imageFetchError) {
          console.error(`Error fetching or processing image ${imageUrl}:`, imageFetchError);
        }
      }
    }

    // 3. Call Google Gemini API
    console.log(`Calling Gemini API for lead ${leadId}...`);
    const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contentParts,
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  });

  const aiAnalysisText = result.text;

  // 5. Parse AI Response
    let aiStructuredData;
    try {
      // Parse the JSON response from Gemini
      aiStructuredData = JSON.parse(aiAnalysisText);
      // Add the raw response for reference
      aiStructuredData.full_raw_response = aiAnalysisText;
    } catch (parseError) {
      console.warn(`Could not parse structured AI response for lead ${leadId}:`, parseError);
      aiStructuredData = {
        summary: "AI analysis completed, but structured data parsing failed. Raw response available.",
        full_raw_response: aiAnalysisText,
        feasibility: 'Unknown',
        estimated_cost_range: { min: 0, max: 0 },
        required_skills: [],
        key_observations: [],
        concerns: [],
        recommendations: []
      };
    }

    // 6. Update Supabase DB with Analysis Results
    const { error: updateLeadError } = await supabaseAdmin
      .from('leads')
      .update({
        status: 'analyzed',
        ai_analysis_summary: aiStructuredData.summary || aiAnalysisText.substring(0, 500),
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (updateLeadError) {
      console.error(`Error updating lead ${leadId} status after analysis:`, updateLeadError.message);
    }

    const { error: insertAnalysisError } = await supabaseAdmin
      .from('ai_analysis_results')
      .insert({
        lead_id: leadId,
        analysis_data: aiStructuredData,
        generated_at: new Date().toISOString()
      });

    if (insertAnalysisError) {
      console.error(`Error inserting full AI analysis for lead ${leadId}:`, insertAnalysisError.message);
    }

    console.log(`Lead ${leadId} successfully analyzed by Gemini and database updated.`);

    // 7. Publish event for subsequent steps (e.g., contractor matching)
    await redis.xadd('homease:leads_stream', '*', 'event_data', JSON.stringify({
      type: 'lead_analyzed_successfully',
      lead_id: leadId,
      feasibility: aiStructuredData.feasibility,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error(`Fatal error in analyzeLeadWithGemini for lead ${leadId}:`, error);
    await supabaseAdmin.from('leads').update({ 
      status: 'analysis_failed', 
      updated_at: new Date().toISOString() 
    }).eq('id', leadId);
  }

// Example of how to integrate and start the worker (e.g., in your main app entry point or a dedicated worker executable)
// if (process.env.NODE_ENV !== 'test') {
//   startLeadAnalysisWorker();
// }
```

Asynchronous Workflows Design with Supabase
gemini-2.5-pro
ID: 6
22170ms
Depends on:
1
5
Prompt
The HOMEase | AI platform utilizes asynchronous workflows (e.g., AR analysis processing, contractor matching triggered by lead submission) currently handled by Google Cloud Pub/Sub. Design how these asynchronous processes will be implemented in a Supabase-centric architecture. Consider using Supabase features such as Database Triggers, Realtime subscriptions, Supabase Webhooks, or integrating with an external lightweight queueing service (e.g., Redis Queue if a custom backend is chosen). Provide a specific design for the 'Lead Created -> Contractor Matching' workflow, explaining the events, triggers, and handler components.
Output
The HOMEase | AI platform's asynchronous workflows will primarily leverage a **Custom Backend Service** integrated with a **Redis Streams/Queue** for robust, scalable, and durable message processing. Supabase features like **Database Triggers** and **Realtime subscriptions** will be used complementarily for immediate reactions and client-side updates where appropriate.

---

### General Design for Asynchronous Processes

1. **Primary Mechanism: Custom Backend Service with Redis Streams/Queue**
    * **Custom Backend Service (e.g., Node.js/Python on Fly.io/Render):** This service will house the core business logic and long-running tasks. It will act as both a **publisher** and a **consumer** of asynchronous messages.
        * **Publishers:** API endpoints within the Custom Backend will publish events (e.g., "lead created," "AR analysis requested") to the Redis queue.
        * **Worker Services:** Dedicated worker processes (running within the Custom Backend deployment or as separate services) will constantly listen to and consume messages from the Redis queue. These workers will execute the actual asynchronous tasks (e.g., AI analysis, contractor matching, sending notifications, processing payment webhooks).
    * **Redis Streams/Queue (e.g., Upstash or self-managed):** Chosen as the robust message broker.
        * **Streams:** Provide durable, ordered, and multi-consumer message queues, ideal for event sourcing and ensuring tasks are not lost.
        * **Queue Libraries (e.g., BullMQ, RQ):** Abstract Redis Streams/Pub/Sub for easier job management, retries, and error handling.
        * **Purpose:** Decouple time-consuming operations from user-facing requests, ensure task delivery, enable retries, and facilitate scaling of worker processes independently.

2. **Complementary Mechanisms:**
    * **Supabase Database Triggers:** For specific, lightweight, and immediate reactions to data changes within PostgreSQL. These triggers can:
        * Call a **Supabase Edge Function** directly (via a database webhook configured in Supabase).
        * Insert a simple record into another table which a **Supabase Realtime** client might subscribe to.
        * Potentially, insert a "task record" into a dedicated `tasks` table which a Custom Backend worker could poll (though Redis is preferred for robust queuing).
    * **Supabase Realtime:** For pushing immediate updates to connected frontend clients when database changes occur. This is not for processing tasks but for user experience, notifying them of background task progress or completion (e.g., "Your AR analysis is 50% complete").
    * **Supabase Webhooks:** Can trigger **Supabase Edge Functions** or send payloads to external HTTP endpoints (like our Custom Backend Service). This is useful for responding to Supabase-internal events (e.g., new user signed up via Supabase Auth) that need to kick off a custom process.

---

### Specific Design: 'Lead Created -> Contractor Matching' Workflow

This workflow involves several asynchronous steps, building upon the AI analysis detailed in Task 5.

```mermaid
sequenceDiagram
    participant Homeowner Frontend (Next.js)
    participant Custom Backend Service (API)
    participant Supabase DB (PostgreSQL)
    participant Redis Queue
    participant AI Worker Service
    participant Google Gemini API
    participant Contractor Matching Worker
    participant Notification Worker
    participant Matched Contractor Frontend (Next.js)

    Homeowner Frontend->>Custom Backend Service (API): POST /leads (Submit Lead)
    Custom Backend Service (API)->>Supabase DB: INSERT new lead (status: 'submitted')
    Supabase DB-->>Custom Backend Service (API): lead_id
    Custom Backend Service (API)->>Redis Queue: PUBLISH 'lead_submitted_for_analysis' ({ lead_id })
    Custom Backend Service (API)-->>Homeowner Frontend: 201 Created (lead_id, status: 'submitted')

    Note over Redis Queue,Google Gemini API: AI Analysis (from Task 5)
    AI Worker Service->>Redis Queue: LISTEN 'lead_submitted_for_analysis'
    Redis Queue-->>AI Worker Service: Event for lead_id
    AI Worker Service->>Supabase DB: FETCH lead details
    AI Worker Service->>Google Gemini API: Request AI Analysis
    Google Gemini API-->>AI Worker Service: Analysis Results
    AI Worker Service->>Supabase DB: UPDATE lead (status: 'analyzed'), INSERT ai_analysis_results
    AI Worker Service->>Redis Queue: PUBLISH 'lead_analyzed_successfully' ({ lead_id })

    Note over Redis Queue,Notification Worker: Contractor Matching
    Contractor Matching Worker->>Redis Queue: LISTEN 'lead_analyzed_successfully'
    Redis Queue-->>Contractor Matching Worker: Event for lead_id
    Contractor Matching Worker->>Supabase DB: FETCH lead, AI analysis, contractor profiles (skills, location)
    Contractor Matching Worker->>Supabase DB: EXECUTE matching logic: find suitable contractors
    Contractor Matching Worker->>Supabase DB: INSERT into lead_contractor_matches (lead_id, contractor_id, status: 'pending')
    Contractor Matching Worker->>Supabase DB: UPDATE lead (status: 'matching_complete')
    Contractor Matching Worker->>Redis Queue: PUBLISH 'contractors_matched_for_lead' ({ lead_id, matched_contractor_ids[] })

    Note over Redis Queue,Matched Contractor Frontend: Notifications & Realtime Updates
    Notification Worker->>Redis Queue: LISTEN 'contractors_matched_for_lead'
    Redis Queue-->>Notification Worker: Event for lead_id
    Notification Worker->>Supabase DB: FETCH contact_info for matched_contractor_ids
    Notification Worker->>External SMS/Email Service: Send "New Lead Available" notifications to contractors

    Homeowner Frontend->>Supabase DB: SUBSCRIBE to 'leads' table (via Realtime)
    Supabase DB-->>Homeowner Frontend: Realtime update: lead_id status changed to 'matching_complete'

    Matched Contractor Frontend->>Supabase DB: SUBSCRIBE to 'lead_contractor_matches' (via Realtime)
    Supabase DB-->>Matched Contractor Frontend: Realtime update: new match for contractor_id
```

#### Events, Triggers, and Handler Components

**1. Event: `Lead Created`**

* **Description:** A homeowner successfully submits a new project request.
* **Trigger:**
  * Homeowner's **Next.js Frontend** calls `POST /leads` on the **Custom Backend Service**.
* **Handler Components:**
  * **Custom Backend Service (API Layer):**
    * Receives the lead data.
    * Authenticates the homeowner via **Supabase Auth JWT**.
    * Performs initial validation.
    * Inserts the new lead record into the `leads` table in **Supabase PostgreSQL**.
    * Publishes a `lead_submitted_for_analysis` message to the **Redis Queue**.
    * Responds to the homeowner's frontend with an immediate success confirmation (e.g., `201 Created`).

**2. Event: `Lead Analyzed`**

* **Description:** The AI model (Google Gemini) has processed the lead details and images, generating a project analysis.
* **Trigger:**
  * The `lead_submitted_for_analysis` message is consumed from the **Redis Queue**.
* **Handler Components:**
  * **AI Worker Service (part of Custom Backend deployment):**
    * Consumes `lead_submitted_for_analysis` from the **Redis Queue**.
    * Fetches detailed lead data and associated image URLs from **Supabase PostgreSQL** and **Supabase Storage**.
    * Calls the **Google Gemini API** for comprehensive analysis.
    * Parses Gemini's response.
    * Updates the `leads` table status to `'analyzed'` and stores a summary in `ai_analysis_summary`.
    * Inserts the full AI analysis results into a dedicated `ai_analysis_results` table in **Supabase PostgreSQL**.
    * Publishes a `lead_analyzed_successfully` message to the **Redis Queue**, signaling the next stage of the workflow.

**3. Event: `Contractors Matched`**

* **Description:** The system has identified a list of suitable contractors for the analyzed lead based on various criteria.
* **Trigger:**
  * The `lead_analyzed_successfully` message is consumed from the **Redis Queue**.
* **Handler Components:**
  * **Contractor Matching Worker Service (part of Custom Backend deployment):**
    * Consumes `lead_analyzed_successfully` from the **Redis Queue**.
    * Fetches the `lead` details and its `ai_analysis_results` from **Supabase PostgreSQL**.
    * Queries **Supabase PostgreSQL** for `contractor_profiles`, considering:
      * `service_area`: Do contractors operate in the lead's location?
      * `skills/specialties`: Do contractors have the required skills identified by AI analysis?
      * `availability/load`: Are contractors currently available for new projects?
      * `rating/reviews`: Filter by minimum rating.
      * `preferences`: Match against any contractor-defined lead preferences.
    * Performs the matching algorithm to generate a ranked list of eligible contractors.
    * Inserts records into a new `lead_contractor_matches` table in **Supabase PostgreSQL** (e.g., `lead_id`, `contractor_id`, `match_score`, `status: 'pending'`).
    * Updates the `leads` table status to `'matching_complete'`.
    * Publishes a `contractors_matched_for_lead` message to the **Redis Queue**, containing `lead_id` and the `matched_contractor_ids`.

**4. Event: `Matched Contractors Notified` / `Client UI Updated`**

* **Description:** Matched contractors are informed, and the homeowner's frontend UI is updated to reflect the new status.
* **Trigger:**
  * The `contractors_matched_for_lead` message is consumed from the **Redis Queue**.
  * Database changes in `leads` or `lead_contractor_matches` tables are detected by **Supabase Realtime**.
* **Handler Components:**
  * **Notification Worker Service (part of Custom Backend deployment, or can be part of the Matching Worker):**
    * Consumes `contractors_matched_for_lead` from the **Redis Queue**.
    * Fetches contact information for the matched contractors from **Supabase PostgreSQL**.
    * Sends out automated notifications (e.g., email, SMS) to the matched contractors, informing them of a new lead available.
  * **Homeowner Frontend (Next.js):**
    * Subscribes to changes on the `leads` table using **Supabase Realtime**. When the `leads.status` for their lead changes to `'matching_complete'`, the UI immediately updates to show "Contractors found!"
  * **Matched Contractor Frontend (Next.js):**
    * Could subscribe to changes on the `lead_contractor_matches` table using **Supabase Realtime** to get immediate notifications if they are matched to a lead, or periodically poll the `GET /contractors/{id}/leads` endpoint on the Custom Backend.

This detailed design leverages the Custom Backend with Redis as the central hub for complex asynchronous logic, while integrating Supabase's powerful PostgreSQL database, real-time capabilities, and storage for efficient data management and client updates.

Next.js Frontend Adaptation Plan
gemini-2.5-pro
ID: 7
28861ms
Depends on:
3
4
5
Prompt
Detail the necessary adaptations for the Next.js 15 (App Router) frontend to integrate with the new Supabase-based backend for the HOMEase | AI platform. This should cover: 1) Updating authentication flows to use {dep:3} (Supabase Auth/NextAuth.js). 2) Changing data fetching strategies to interact with {dep:5} (Supabase Edge Functions/custom backend) or directly with the Supabase Database. 3) Modifying file upload/display logic to utilize {dep:4} (Supabase Storage). 4) Any specific considerations for real-time updates if needed.
Output
To integrate the Next.js 15 (App Router) frontend with the new Supabase-based backend for the HOMEase | AI platform, the following adaptations are necessary:

---

## Next.js 15 Frontend Adaptations for HOMEase | AI Platform

This document outlines the necessary changes for the Next.js 15 App Router frontend to seamlessly integrate with the new Supabase-based backend, covering authentication, data fetching, file management, and real-time updates.

### 1. Updating Authentication Flows

The frontend will leverage `@supabase/auth-helpers-nextjs` for robust and secure authentication, ensuring a smooth user experience across client and server components.

#### 1.1. Initial Setup and Client Configuration

* **Environment Variables:**
  * Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured in `.env.local` for client-side and server-side Supabase client instantiation.
* **Supabase Client Instances:**
  * **Client Components:** Create a client-side Supabase instance using `createBrowserClient` from `@supabase/auth-helpers-nextjs`. This client is used for direct user interactions (sign-up, sign-in, profile updates) in interactive client components.

        ```typescript
        // lib/supabase/client.ts
        import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

        export const createClient = () =>
          createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
        ```

  * **Server Components/Server Actions/Route Handlers:** Create a server-side Supabase instance using `createServerComponentClient` or `createRouteHandlerClient` from `@supabase/auth-helpers-nextjs`. This client securely accesses user sessions from cookies and respects Row-Level Security (RLS).

        ```typescript
        // lib/supabase/server.ts
        import { cookies } from 'next/headers'
        import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

        export const createClient = () =>
          createServerComponentClient({ cookies }, {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          })
        ```

* **Supabase Provider:** Wrap the application with a Supabase context provider (e.g., from `auth-helpers`) to make the Supabase client and session available throughout the component tree. This often involves a `SupabaseProvider` component in a Client Component that uses `createBrowserClient`.

#### 1.2. Authentication UI Components

* **Sign-up/Sign-in Forms:**
  * Update forms to call `supabase.auth.signUp({ email, password })`, `supabase.auth.signInWithPassword({ email, password })`, or `supabase.auth.signInWithOAuth({ provider: 'google' })`.
  * Handle success/error states: redirecting after successful login/signup, displaying error messages.
  * For social logins, `signInWithOAuth` will trigger a redirect to Supabase's OAuth flow and then back to the specified redirect URL (e.g., `/auth/callback`).
* **Session Management & User Profile:**
  * Utilize the `useUser()` hook (if custom-built from `@supabase/auth-helpers-nextjs`) or directly fetch the user session in Server Components using `supabase.auth.getSession()` to display user information or conditionally render UI elements.
  * The user's `auth.uid()` and custom `user_role` claim will be available within the session and JWT.
* **Password Reset/Email Change/Logout:**
  * Implement dedicated pages/components for `supabase.auth.resetPasswordForEmail()` and `supabase.auth.updateUser()`.
  * Create a logout button calling `supabase.auth.signOut()`, followed by a redirect to the login page.

#### 1.3. Protecting Routes and Role-Based UI

* **Route Protection (Middleware):**
  * Use Next.js Middleware (`middleware.ts`) to check authentication status and redirect unauthenticated users away from protected routes.
  * Middleware can also parse the Supabase session from cookies and extract the `user_role` from the JWT to enforce basic role-based access before rendering a page.

        ```typescript
        // middleware.ts
        import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
        import { NextResponse } from 'next/server'
        import type { NextRequest } from 'next/server'

        export async function middleware(req: NextRequest) {
          const res = NextResponse.next()
          const supabase = createMiddlewareClient({ req, res })
          const { data: { session } } = await supabase.auth.getSession()

          if (!session) {
            // No session, redirect to login
            return NextResponse.redirect(new URL('/login', req.url))
          }

          // Optional: Role-based redirect
          const userRole = session.user.user_metadata?.user_role || 'homeowner'; // Access custom claim
          if (req.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
          }

          return res
        }

        export const config = {
          matcher: ['/dashboard/:path*', '/profile/:path*', '/admin/:path*'],
        }
        ```

* **Server Components (Authorization):**
  * In Server Components, fetch the session using `createServerComponentClient().auth.getSession()`.
  * Extract `user.id` and `user.user_metadata.user_role` (from custom JWT claim).
  * Conditionally render components or fetch specific data based on the user's role.

        ```typescript
        // app/dashboard/page.tsx (Server Component)
        import { createClient } from '@/lib/supabase/server'
        import { redirect } from 'next/navigation'

        export default async function DashboardPage() {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()

          if (!session) {
            redirect('/login')
          }

          const userRole = session.user.user_metadata?.user_role;

          if (userRole === 'admin') {
            // Render admin dashboard
            return <AdminDashboard />
          } else if (userRole === 'homeowner') {
            // Render homeowner dashboard
            return <HomeownerDashboard userId={session.user.id} />
          } else if (userRole === 'contractor') {
            // Render contractor dashboard
            return <ContractorDashboard userId={session.user.id} />
          }

          return <p>Loading user role...</p>
        }
        ```

* **Client Components (Role-Based Rendering):**
  * Use a client-side Supabase context provider (`useUser()`) to get the current user and their role.
  * Conditionally render UI elements (e.g., navigation items, action buttons) based on the `user_role`.
  * **Crucially, this is for UI/UX only; all critical authorization MUST be handled by RLS and the backend API.**

### 2. Changing Data Fetching Strategies

The frontend will adapt its data fetching to interact primarily with the Custom Backend Service for complex operations and directly with Supabase PostgreSQL (via its API) for simpler, RLS-protected data access, leveraging Next.js 15's data fetching capabilities.

#### 2.1. Environment Variables

* Ensure `NEXT_PUBLIC_CUSTOM_BACKEND_URL` is set in `.env.local` for API calls to the custom service.

#### 2.2. Data Fetching in Next.js 15 App Router

* **Server Components (Read-only Data Fetching):**
  * **Direct Supabase DB Access:** For RLS-protected data, Server Components can directly query Supabase PostgreSQL using `createServerComponentClient`. This is secure as the client automatically passes the session cookie.

        ```typescript
        // app/projects/[id]/page.tsx (Server Component)
        import { createClient } from '@/lib/supabase/server'

        export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
          const supabase = createClient()
          const { data: project, error } = await supabase
            .from('properties') // Assuming 'properties' is the project table
            .select('*')
            .eq('id', params.id)
            .single()

          if (error || !project) {
            // Handle error or project not found, RLS would also prevent access here
            return <div>Error loading project or project not found.</div>
          }
          return <div>{project.title}</div>
        }
        ```

  * **Custom Backend Service Access:** For data requiring complex business logic or AI integration, Server Components will `fetch` data from the Custom Backend Service. The Supabase JWT from the session should be included in the `Authorization` header.

        ```typescript
        // app/analysis/[leadId]/page.tsx (Server Component)
        import { createClient } from '@/lib/supabase/server'

        export default async function LeadAnalysisPage({ params }: { params: { leadId: string } }) {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()

          if (!session) { /* handle redirect */ }

          const response = await fetch(`${process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL}/api/leads/${params.leadId}/analysis`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            next: { revalidate: 3600 } // Cache data for 1 hour
          });

          const analysis = await response.json();
          // Render analysis data
          return <div>{analysis.summary}</div>
        }
        ```

* **Client Components (Interactive Data Fetching):**
  * Use `useEffect` with `useState` and a client-side Supabase client or `fetch` API to interact with the backend.
  * For Custom Backend Service calls, retrieve the `access_token` from the client-side Supabase session (`supabase.auth.getSession()`) and include it in the `Authorization` header.

        ```typescript
        // components/BidList.tsx (Client Component)
        'use client'
        import { useState, useEffect } from 'react'
        import { createClient } from '@/lib/supabase/client'

        export default function BidList({ projectId }: { projectId: string }) {
          const [bids, setBids] = useState<any[]>([])
          const supabase = createClient()

          useEffect(() => {
            const fetchBids = async () => {
              const { data: { session } } = await supabase.auth.getSession()
              if (!session) return; // Or redirect to login

              const response = await fetch(`${process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL}/api/leads/${projectId}/bids`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
              });
              const data = await response.json();
              setBids(data);
            }
            fetchBids()
          }, [projectId, supabase]);

          return ( /* Render bids */ )
        }
        ```

* **Server Actions (Mutations):**
  * Server Actions are ideal for handling form submissions and mutations, as they run on the server and can securely interact with the backend.
  * They can use `createServerComponentClient` to access Supabase DB or `fetch` to the Custom Backend Service, including the JWT for authorization.

        ```typescript
        // app/leads/submit/actions.ts (Server Action)
        'use server'
        import { createClient } from '@/lib/supabase/server'
        import { redirect } from 'next/navigation'

        export async function submitLead(formData: FormData) {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()

          if (!session) {
            redirect('/login')
          }

          const leadData = {
            property_details: { address: formData.get('address'), type: formData.get('type') },
            project_description: formData.get('description'),
            budget: parseFloat(formData.get('budget') as string),
            // images_urls will be handled separately after upload
            contact_info: { email: session.user.email, phone: formData.get('phone') },
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL}/api/leads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit lead.');
          }

          const result = await response.json();
          redirect(`/leads/${result.lead_id}`);
        }
        ```

#### 2.3. Caching and Revalidation

* Leverage Next.js `fetch` options (`revalidate`, `cache`) and `revalidatePath`, `revalidateTag` for efficient data caching and invalidation strategies.
* For frequently changing data, or data affected by background processes (like AI analysis status), consider lower revalidation times or explicit revalidation from Server Actions.

### 3. Modifying File Upload/Display Logic (Supabase Storage)

The frontend will interact with Supabase Storage for all file operations, following the defined bucket strategy and RLS policies.

#### 3.1. Supabase Client for Storage

* Use the `supabase.storage` methods of the previously configured client instances (client-side for direct uploads, server-side for generating signed URLs).

#### 3.2. Upload Adaptations

* **AR Scan Images (Homeowner Uploads):**
  * **Client Component:** Create an input element (`<input type="file" multiple />`) or a custom capture component.
  * When files are selected, use `supabase.storage.from('homease-projects').upload(path, file)`.
  * Generate a unique `path` including `user_id`, `project_id`, and a unique filename (e.g., `homease-projects/${userId}/${projectId}/ar_scans/${uuid()}_${file.name}`).
  * Upon successful upload, either store the full Supabase Storage path/URL in your `project_media` PostgreSQL table via a Server Action, or directly pass it to the Custom Backend Service if further processing is needed before database entry.
  * Show upload progress and error messages to the user.
* **AI-Generated 'After' Visualizations:**
  * These are uploaded by the Custom Backend Service (as per the backend plan). The frontend's role is primarily retrieval and display.
* **Contractor-Uploaded Documents:**
  * **Client Component:** Similar to AR scans, contractors will use `supabase.storage.from('homease-contractor-docs').upload(path, file)`.
  * The `path` should follow `homease-contractor-docs/{contractor_id}/{document_type}/{filename.ext}`.
  * Store the path/URL and other metadata (e.g., `document_type`, `expiration_date`) in the `contractor_documents` table via a Server Action.

#### 3.3. Display Adaptations

* **Retrieval of File Paths:** Frontend components (Server or Client) will query the PostgreSQL tables (`project_media`, `contractor_documents`) to get the `file_path`s.
* **Generating URLs:**
  * **Public URLs (rare):** `supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl` for truly public, non-sensitive assets (e.g., a contractor's public portfolio images, if that bucket were public).
  * **Signed URLs (recommended for private content):** For most private content (AR scans, AI visualizations, contractor documents), generate `createSignedUrl`. This ensures access only if the user has a valid Supabase session and meets Storage Policy criteria.
    * **Server Component/Server Action:** Generate signed URLs on the server to protect the `service_role_key` or for more complex authorization logic.

            ```typescript
            // Server Component example for fetching a signed URL
            import { createClient } from '@/lib/supabase/server'

            export async function getProjectImageSignedUrl(projectId: string, filePath: string) {
              const supabase = createClient(); // uses anon key with RLS protection
              const { data: projectMedia, error: mediaError } = await supabase
                .from('project_media')
                .select('file_path')
                .eq('project_id', projectId)
                .eq('file_path', filePath)
                .single();

              if (mediaError || !projectMedia) {
                console.error("Failed to fetch media for signed URL generation", mediaError);
                return null;
              }

              const { data, error } = await supabase.storage
                .from('homease-projects')
                .createSignedUrl(projectMedia.file_path, 3600); // URL valid for 1 hour

              if (error) {
                console.error('Error creating signed URL:', error.message);
                return null;
              }
              return data.signedUrl;
            }
            ```

    * Client Components would call a Server Action to get these signed URLs.
* **Image Optimization:** Next.js `Image` component can integrate with Supabase Storage URLs. Consider Supabase's built-in image transformations (query parameters) for resizing/optimizing images for display.

#### 3.4. Security and Error Handling

* **Client-side Validation:** Before upload, validate file types, sizes, and quantity to provide immediate feedback and reduce unnecessary backend load.
* **Error Handling:** Implement robust `try-catch` blocks for all storage operations and display user-friendly error messages.

### 4. Real-time Updates

Supabase Realtime will be crucial for delivering dynamic, live updates to the frontend without constant polling.

#### 4.1. Use Cases for Real-time in HOMEase

* **Project Status:** Homeowners seeing live updates on their project's status (e.g., 'submitted', 'analyzed', 'bids_open', 'matched').
* **New Bids:** Homeowners receiving instant notifications when new bids are placed on their projects.
* **Bid Status Changes:** Contractors seeing their bid status change (e.g., 'accepted', 'rejected') by a homeowner.
* **Chat/Notifications:** (If implemented) Instant messaging between homeowners and contractors, or platform-wide notifications.

#### 4.2. Implementation with Supabase Realtime in Next.js

* **Client Components Only:** Supabase Realtime subscriptions must be set up in Client Components, typically within a `useEffect` hook.
* **Supabase Client:** Use the client-side Supabase client (`createBrowserClient`).
* **Subscription Setup:**

    ```typescript
    // components/ProjectUpdates.tsx (Client Component)
    'use client'
    import { useState, useEffect } from 'react'
    import { createClient } from '@/lib/supabase/client'
    import { RealtimeChannel } from '@supabase/supabase-js'

    export default function ProjectUpdates({ projectId }: { projectId: string }) {
      const [status, setStatus] = useState<string>('loading');
      const [newBids, setNewBids] = useState<number>(0);
      const supabase = createClient();
      let projectChannel: RealtimeChannel | null = null;

      useEffect(() => {
        // Fetch initial project status for Server Components
        // This component focuses on subsequent real-time updates.

        // 1. Subscribe to project status changes (e.g., 'properties' table)
        projectChannel = supabase
          .channel(`project:${projectId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'properties',
              filter: `id=eq.${projectId}`
            },
            (payload) => {
              console.log('Project status updated!', payload);
              if (payload.new && (payload.new as any).status) {
                setStatus((payload.new as any).status);
              }
            }
          )
          .subscribe();

        // 2. Subscribe to new bids for this project (e.g., 'bids' table)
        const bidsChannel = supabase
          .channel(`bids_on_project:${projectId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'bids',
              filter: `property_id=eq.${projectId}` // Assuming property_id in bids table
            },
            (payload) => {
              console.log('New bid received!', payload);
              setNewBids((prev) => prev + 1);
              // Optionally trigger a toast notification
            }
          )
          .subscribe();

        return () => {
          projectChannel?.unsubscribe();
          bidsChannel?.unsubscribe();
        };
      }, [projectId, supabase]);

      return (
        <div>
          <p>Project Status: {status}</p>
          {newBids > 0 && <p>{newBids} new bids received!</p>}
        </div>
      );
    }
    ```

* **Authorization for Realtime:**
  * Supabase Realtime respects RLS policies. If a user is not authorized to read a row according to your RLS, they will not receive real-time updates for that row.
  * For broadcasting specific events (like notifications that might not directly correspond to RLS), consider using custom channels and emitting events from a Supabase Edge Function or the Custom Backend Service after authorization checks.
* **Error Handling:** Implement `onError` callbacks for channels and `try-catch` blocks around subscription logic to handle connection issues or authorization failures.
* **Performance:** Be mindful of the number of active subscriptions, especially for large lists. Consider lazy loading subscriptions or using a single broad channel with client-side filtering if appropriate.

By meticulously implementing these adaptations, the Next.js 15 frontend for HOMEase | AI will be fully integrated with the new Supabase-based backend, providing a secure, efficient, and real-time user experience.

Google Gemini AI Integration Specifics
gemini-2.5-flash
ID: 8
38035ms
Depends on:
5
Prompt
The HOMEase | AI platform relies on Google Gemini 2.5-flash for AR assessment analysis and gemini-2.5-flash-image for 'after' visualizations. Based on the chosen backend services (from {dep:5}), describe the specific method of integrating and calling these external Google Gemini APIs. Include considerations for API key management, request/response formats, and handling potential rate limits or errors. Provide a high-level sequence diagram or pseudo-code for an AR assessment request flowing through the backend to Gemini and back.
Output
HOMEase's Custom Backend Service will leverage Google's Generative AI platform, specifically the `gemini-2.5-flash` model for AR assessment analysis and `gemini-2.5-flash-image` for generating 'after' visualizations. This integration will occur within the dedicated `AI Worker Service` component, which handles asynchronous, long-running AI tasks.

---

### 1. Integration Method for Google Gemini APIs

The integration will primarily use the official Google Cloud Generative AI client libraries (SDKs) for Node.js (or Python, depending on the chosen language for the Custom Backend Service). This approach simplifies API calls, handles authentication, and provides type safety.

#### A. API Key Management

* **Environment Variables:** Google Gemini API keys (e.g., `GEMINI_API_KEY`) will be stored securely as environment variables in the production environment. These variables will be injected into the `AI Worker Service` containers (e.g., via Fly.io/Render's secrets management).
* **No Client Exposure:** API keys will *never* be exposed to the client-side (frontend). All calls to Gemini APIs must originate from the Custom Backend Service.
* **Service Accounts (Optional but Recommended for Production):** For higher security and fine-grained access control, especially when using Google Cloud services beyond just the Generative AI API (e.g., Google Cloud Storage, logging), a Google Cloud Service Account with appropriate IAM roles (e.g., `Vertex AI User`, `Generative Language Client`) could be used. The service account key JSON would be mounted securely as a secret to the `AI Worker Service`. This allows for more robust authentication (OAuth 2.0) compared to simple API keys. For simpler deployments, API keys are sufficient.

#### B. Specific Gemini Models and Their Use Cases

1. **`gemini-2.5-flash` for AR Assessment Analysis:**
    * **Purpose:** This model is designed for general multimodal understanding, making it ideal for analyzing property details, project descriptions, and existing images to provide a textual assessment. It's optimized for speed and cost-efficiency.
    * **Input:** Combines textual data (property address, type, project description, budget from the `leads` table) with existing property images (fetched from `Supabase Storage`).
    * **Output:** Structured text (e.g., JSON or parseable natural language) containing feasibility assessment, estimated cost ranges, required contractor skills, and any other relevant insights.

2. **`gemini-2.5-flash-image` for 'After' Visualizations:**
    * **Purpose:** This model is assumed to have capabilities for image generation or modification based on textual prompts and input images. It would be used to create simulated "after" images of a property after renovation or modification.
    * **Input:** An "before" image (from `Supabase Storage`) and a detailed textual prompt describing the desired changes (e.g., "add a modern wooden patio," "repaint the exterior walls white," "replace windows with large, energy-efficient ones"). This prompt could be derived from the `project_description` or further refined by a more intelligent prompt engineering step.
    * **Output:** A new image (base64 encoded or a temporary URL) representing the 'after' visualization. *Note: If `gemini-2.5-flash-image` primarily outputs text descriptions for image generation, then this text output would be fed into a separate dedicated image generation service (e.g., DALL-E, Midjourney, or Google's Imagen API) to produce the final image.* For the scope of this response, we'll assume direct image generation capability from the model as per the prompt's naming convention.

#### C. Request/Response Formats

**For `gemini-2.5-flash` (AR Assessment):**

* **Request Format (Node.js SDK):** The request uses the `generateContent` method, accepting an array of `Part` objects.
  * **Text Parts:** `{ text: "Your detailed prompt here..." }`
  * **Image Parts:** `{ inline_data: { data: base64_encoded_image_string, mime_type: "image/jpeg" } }`
  * **Example Payload:**

        ```json
        {
          "contents": [
            {
              "parts": [
                { "text": "Analyze this property located at 123 Main St. for a kitchen renovation. Project scope: fully remodel, new cabinets, new appliances. Budget: $20,000. Provide a feasibility, estimated cost range, and suggested contractor skills." },
                { "inline_data": { "data": "BASE64_ENCODED_IMAGE_OF_KITCHEN_1", "mime_type": "image/jpeg" } },
                { "inline_data": { "data": "BASE64_ENCODED_IMAGE_OF_KITCHEN_2", "mime_type": "image/png" } }
              ]
            }
          ]
        }
        ```

* **Response Format:** The response object typically contains a `candidates` array, each with a `content` object that has `parts`. The primary output will be textual.
  * **Example Response (parsed):**

        ```json
        {
          "text": "{\n  \"feasibility\": \"High\",\n  \"estimated_cost_range\": \"$18,000 - $28,000\",\n  \"required_skills\": [\"Kitchen Remodeling\", \"Plumbing\", \"Electrical\", \"Cabinetry\"],\n  \"recommendations\": \"Consider budget allocation for high-end appliances.\"\n}"
        }
        ```

  * **Parsing:** The `AI Worker Service` will extract the text response. If the prompt instructs Gemini to output JSON, the service will parse this string into a JavaScript object for structured storage in Supabase DB.

**For `gemini-2.5-flash-image` ('After' Visualizations):**

* **Request Format (Node.js SDK - illustrative, assuming image generation capability):**
  * **Text Parts:** `{ text: "Prompt describing desired changes..." }`
  * **Image Parts (for input image context):** `{ inline_data: { data: base64_encoded_before_image, mime_type: "image/jpeg" } }`
  * **Example Payload:**

        ```json
        {
          "contents": [
            {
              "parts": [
                { "text": "Redesign this living room to be modern minimalist. Change wall color to light gray, add a sleek black sofa, and minimalist coffee table. Remove existing decor." },
                { "inline_data": { "data": "BASE64_ENCODED_ORIGINAL_LIVING_ROOM_IMAGE", "mime_type": "image/jpeg" } }
              ]
            }
          ]
        }
        ```

* **Response Format (illustrative, assuming image generation output):** The model would ideally return a reference to the generated image. This might be a temporary URL, or direct base64 encoded image data if the payload size is manageable.
  * **Example Response (parsed):**

        ```json
        {
          "image_data": {
            "base64": "BASE64_ENCODED_GENERATED_IMAGE",
            "mime_type": "image/jpeg"
          },
          "description": "Modern minimalist living room with grey walls and black sofa."
        }
        ```

  * **Handling:** The `AI Worker Service` would receive the generated image, convert it from base64 (if necessary), and upload it to `Supabase Storage`, then store the resulting URL in the Supabase DB (`ai_analysis_results` or a dedicated `project_visualizations` table).

#### D. Handling Potential Rate Limits and Errors

* **Rate Limits:**
  * **Retry Logic (Exponential Backoff):** Implement a robust retry mechanism with exponential backoff for API calls that return rate limit errors (HTTP 429) or transient server errors (HTTP 5xx). The `GoogleGenerativeAI` SDK might offer some built-in retries, but custom logic ensures proper handling.
  * **Queuing/Throttling:** If high request volume is anticipated, the `AI Worker Service` can implement internal throttling or batching strategies, and potentially distribute work across multiple worker instances.
  * **Monitoring:** Set up monitoring and alerting for Gemini API usage and error rates to detect if rate limits are being hit consistently and adjust worker concurrency or upgrade API quotas if needed.
* **Errors:**
  * **Specific Error Handling:** Catch various error types (network errors, API errors, invalid input errors) and log them with sufficient detail.
  * **Dead-Letter Queue (DLQ):** Messages from `Redis Queue` that repeatedly fail processing (e.g., after several retries due to persistent API errors or malformed data) should be moved to a Dead-Letter Queue for manual inspection and debugging, preventing them from blocking the main processing stream.
  * **Status Updates:** Update the `leads` table status to `analysis_failed` or `visualization_failed` in case of unrecoverable errors during AI processing, providing clear feedback in the database.
  * **Alerting:** Integrate with an alerting system (e.g., PagerDuty, Slack, email) to notify developers of critical failures or sustained error rates.

---

### 2. AR Assessment Request Flow (Sequence Diagram and Pseudo-code)

This flow extends the "Lead Creation" example provided in the dependency context, focusing on the AI Worker's interaction with Gemini.

```mermaid
sequenceDiagram
    participant Frontend (Next.js)
    participant Custom Backend Service (Node.js/Express)
    participant Supabase DB
    participant Supabase Storage
    participant Redis Queue (Upstash)
    participant AI Worker Service
    participant Google Gemini 2.5-flash
    participant Google Gemini 2.5-flash-image

    Frontend->>Custom Backend Service: POST /leads (lead_data, images_urls[], JWT)
    Custom Backend Service->>Supabase DB: INSERT initial lead (status='submitted')
    Custom Backend Service->>Redis Queue: PUBLISH 'lead_submitted_for_analysis' event
    Custom Backend Service-->>Frontend: 201 Created

    AI Worker Service->>Redis Queue: LISTEN 'lead_submitted_for_analysis'
    Redis Queue-->>AI Worker Service: event ({ lead_id })

    AI Worker Service->>Supabase DB: SELECT lead_data (id=lead_id)
    Supabase DB-->>AI Worker Service: lead_data (includes images_urls)

    AI Worker Service->>Supabase Storage: Fetch image data from images_urls
    Supabase Storage-->>AI Worker Service: Image data (binary)

    AI Worker Service->>Google Gemini 2.5-flash: Call generateContent (text_prompt, image_parts[])
    Note over Google Gemini 2.5-flash: AR Assessment Analysis
    Google Gemini 2.5-flash-->>AI Worker Service: Textual AI analysis results (JSON/string)

    AI Worker Service->>Supabase DB: UPDATE leads SET status='analyzed', ai_analysis_summary=..., updated_at=NOW() WHERE id = lead_id
    AI Worker Service->>Supabase DB: INSERT into ai_analysis_results (lead_id, analysis_data)

    AI Worker Service->>Google Gemini 2.5-flash-image: Call generateContent / image_generation (original_image_part, text_prompt_for_visualization)
    Note over Google Gemini 2.5-flash-image: 'After' Visualization
    Google Gemini 2.5-flash-image-->>AI Worker Service: Generated Image Data (base64 or temp URL)

    AI Worker Service->>Supabase Storage: UPLOAD generated 'after' image
    Supabase Storage-->>AI Worker Service: 'After' image URL

    AI Worker Service->>Supabase DB: UPDATE ai_analysis_results SET after_image_url=... WHERE lead_id = lead_id
    AI Worker Service->>Redis Queue: PUBLISH 'lead_analysis_and_visuals_completed' event ({ lead_id })
    Note over AI Worker Service: Triggers further workflows like contractor matching, notifications etc.
```

**Refined Pseudo-code for AI Worker Service (`leadAnalysisWorker.ts`):**

```typescript
// --- AI Worker Service: src/workers/leadAnalysisWorker.ts ---
import { createClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';
import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import fetch from 'node-fetch'; // For fetching images from URLs

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Redis client
const redis = new Redis(process.env.REDIS_URL!);

// Gemini clients for specific models
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const arAssessmentModel: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
// Assuming 'gemini-2.5-flash-image' is a valid model name for image generation/manipulation
// If it behaves differently, this part needs adjustment (e.g., using a separate API for image generation).
const afterVisualizationModel: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

export async function startLeadAnalysisWorker() {
  console.log('HOMEase Lead Analysis Worker started...');
  let lastId = '$'; // Start from the latest message in the stream

  while (true) {
    try {
      const messages = await redis.xread(
        'BLOCK', 5000, // Block for 5 seconds if no new messages
        'COUNT', 1, // Process one message at a time for simplicity in example
        'STREAMS', 'homease:leads_stream', lastId
      );

      if (messages && messages.length > 0) {
        for (const stream of messages) {
          const streamMessages = stream[1];
          for (const message of streamMessages) {
            const messageId = message[0];
            const eventData = JSON.parse(message[1][1]);

            if (eventData.type === 'lead_submitted_for_analysis' && eventData.lead_id) {
              console.log(`Processing lead ${eventData.lead_id} for AI analysis.`);
              await processLeadForAI(eventData.lead_id);
            }
            lastId = messageId;
          }
        }
      }
    } catch (error) {
      console.error('Error in Lead Analysis Worker:', error);
      // Robust error handling: retry mechanisms, dead-letter queues, alert systems
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait before retrying
    }
  }
}

async function processLeadForAI(leadId: string) {
  try {
    // 1. Fetch Lead Data from Supabase Database
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) {
      console.error(`Lead ${leadId} not found or fetch error:`, fetchError?.message);
      await supabaseAdmin.from('leads').update({ status: 'analysis_failed', updated_at: new Date().toISOString() }).eq('id', leadId);
      return;
    }

    // Prepare common image parts for both Gemini calls
    const imageParts: Part[] = [];
    let originalImageUrls: string[] = lead.images_urls || [];
    let fetchedImages: { url: string, base64: string, mimeType: string }[] = [];

    if (originalImageUrls.length > 0) {
      for (const imageUrl of originalImageUrls) {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.warn(`Failed to fetch image from ${imageUrl}: ${response.statusText}`);
            continue;
          }
          const arrayBuffer = await response.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString('base64');
          const mimeType = response.headers.get('content-type') || 'application/octet-stream';
          
          fetchedImages.push({ url: imageUrl, base64: base64Image, mimeType });
          imageParts.push({
            inline_data: {
              data: base64Image,
              mime_type: mimeType,
            },
          });
          console.log(`Added image from ${imageUrl} to Gemini payload.`);
        } catch (imageFetchError) {
          console.error(`Error fetching or processing image ${imageUrl}:`, imageFetchError);
        }
      }
    }

    // --- AR Assessment Analysis using gemini-2.5-flash ---
    let aiStructuredData: any = {};
    let aiAnalysisText = '';

    try {
      const arAssessmentTextParts = [
        `You are HOMEase AI, an expert in home renovation assessment. Analyze this property for a project.`,
        `Property details: Address: ${lead.property_address}, Type: ${lead.property_type}.`,
        `Project description: ${lead.project_description}.`,
        `Homeowner budget: $${lead.budget}.`,
        `Provide a concise JSON output with the following keys: 'feasibility' (High/Medium/Low), 'estimated_cost_range' (e.g., '$20,000 - $35,000'), 'required_skills' (array of strings), 'risks' (array of strings), 'recommendations' (string).`,
        `Also, provide a detailed natural language summary explaining your assessment based on the provided text and images.`
      ];

      console.log(`Calling gemini-2.5-flash for AR assessment for lead ${leadId}...`);
      const arAssessmentResult = await arAssessmentModel.generateContent({
        contents: [{
          parts: [
            ...arAssessmentTextParts.map(text => ({ text })),
            ...imageParts // Include images for multimodal understanding
          ]
        }]
      });
      const arAssessmentResponse = await arAssessmentResult.response;
      aiAnalysisText = arAssessmentResponse.text();

      // Attempt to parse JSON from Gemini's response
      const jsonMatch = aiAnalysisText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        aiStructuredData = JSON.parse(jsonMatch[1]);
        // Clean up the text response to remove the JSON part for the summary
        aiAnalysisText = aiAnalysisText.replace(jsonMatch[0], '').trim();
      } else {
        console.warn(`No structured JSON found in Gemini 2.5-flash response for lead ${leadId}.`);
        aiStructuredData.summary = aiAnalysisText.substring(0, 500) + '...';
      }
      aiStructuredData.full_raw_response = aiAnalysisText;

    } catch (geminiError) {
      console.error(`Error during gemini-2.5-flash AR assessment for lead ${leadId}:`, geminiError);
      aiStructuredData.summary = `AR assessment failed: ${geminiError.message}`;
      aiStructuredData.full_raw_response = `Error: ${geminiError.message}`;
      // Consider re-throwing or marking lead as failed if this is critical
    }

    // --- 'After' Visualization using gemini-2.5-flash-image ---
    let afterImageUrl: string | null = null;
    if (fetchedImages.length > 0) {
      try {
        const firstOriginalImage = fetchedImages[0]; // Use the first available image as base
        const visualizationPrompt = `Based on the project description: "${lead.project_description}", generate an 'after' visualization of the property. Focus on showing the proposed changes. Maintain the original lighting and perspective as much as possible.`;

        console.log(`Calling gemini-2.5-flash-image for 'after' visualization for lead ${leadId}...`);
        const visualizationResult = await afterVisualizationModel.generateContent({
          contents: [{
            parts: [
              { text: visualizationPrompt },
              { inline_data: { data: firstOriginalImage.base64, mime_type: firstOriginalImage.mimeType } }
            ]
          }]
        });
        const visualizationResponse = await visualizationResult.response;
        // Assuming visualizationResponse directly contains or points to image data
        const generatedImageBase64 = visualizationResponse.text(); // Or a specific image_data field if the SDK supports it directly

        if (generatedImageBase64) {
            const uploadResult = await supabaseAdmin.storage
                .from('project-visualizations') // Dedicated bucket for generated images
                .upload(`after-visuals/${leadId}-${Date.now()}.jpeg`, Buffer.from(generatedImageBase64, 'base64'), {
                    contentType: 'image/jpeg', // Adjust based on actual generated image type
                    upsert: false,
                });

            if (uploadResult.error) {
                console.error(`Error uploading generated image for lead ${leadId}:`, uploadResult.error.message);
            } else {
                const publicUrlResult = supabaseAdmin.storage.from('project-visualizations').getPublicUrl(uploadResult.data.path);
                afterImageUrl = publicUrlResult.data.publicUrl;
                console.log(`Generated 'after' image uploaded: ${afterImageUrl}`);
            }
        } else {
            console.warn(`Gemini 2.5-flash-image did not return image data for lead ${leadId}.`);
        }

      } catch (vizError) {
        console.error(`Error during gemini-2.5-flash-image visualization for lead ${leadId}:`, vizError);
        // Continue without 'after' image if it fails
      }
    }


    // 3. Store/Update Analysis Results in Supabase DB
    const { data: existingAnalysis, error: fetchAnalysisError } = await supabaseAdmin
      .from('ai_analysis_results')
      .select('id')
      .eq('lead_id', leadId)
      .single();

    if (fetchAnalysisError && fetchAnalysisError.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        console.error(`Error checking for existing analysis for lead ${leadId}:`, fetchAnalysisError.message);
    }

    const analysisRecord = {
      lead_id: leadId,
      analysis_data: aiStructuredData,
      after_image_url: afterImageUrl, // Store the generated image URL
      generated_at: new Date().toISOString()
    };

    if (existingAnalysis) {
        const { error: updateAnalysisError } = await supabaseAdmin
            .from('ai_analysis_results')
            .update(analysisRecord)
            .eq('id', existingAnalysis.id);
        if (updateAnalysisError) console.error(`Error updating AI analysis for lead ${leadId}:`, updateAnalysisError.message);
    } else {
        const { error: insertAnalysisError } = await supabaseAdmin
            .from('ai_analysis_results')
            .insert(analysisRecord);
        if (insertAnalysisError) console.error(`Error inserting full AI analysis for lead ${leadId}:`, insertAnalysisError.message);
    }

    // 4. Update Lead Status and Summary
    const { error: updateLeadError } = await supabaseAdmin
      .from('leads')
      .update({
        status: afterImageUrl ? 'analyzed_with_visuals' : 'analyzed',
        ai_analysis_summary: aiStructuredData.summary || aiAnalysisText.substring(0, 500) + '...',
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (updateLeadError) {
      console.error(`Error updating lead ${leadId} status after analysis:`, updateLeadError.message);
    }

    console.log(`Lead ${leadId} successfully analyzed and visualized (if images provided).`);

    // 5. Publish event for subsequent steps
    await redis.xadd('homease:leads_stream', '*', 'event_data', JSON.stringify({
      type: 'lead_analysis_and_visuals_completed',
      lead_id: leadId,
      timestamp: new Date().toISOString(),
      has_visuals: !!afterImageUrl
    }));

  } catch (error) {
    console.error(`Fatal error in processLeadForAI for lead ${leadId}:`, error);
    await supabaseAdmin.from('leads').update({ status: 'analysis_failed', updated_at: new Date().toISOString() }).eq('id', leadId);
  }
}
```

CI/CD Pipeline Update Plan
gemini-2.5-flash
ID: 9
34644ms
Depends on:
5
7
Prompt
Update the CI/CD pipeline plan for HOMEase | AI, currently using GitHub Actions. Detail the necessary modifications to deploy the Next.js frontend to a new hosting environment (e.g., Vercel, or a Dockerized deployment compatible with a generic cloud provider) and the chosen backend services (from {dep:5}) (e.g., Supabase Edge Functions deployment, or custom backend deployment). Include steps for environment variable management for Supabase API keys and secrets, and ensuring database migrations (if applicable) are handled. Focus on secure and automated deployment.
Output
The HOMEase | AI platform requires a robust and automated CI/CD pipeline to manage its Next.js frontend, custom backend services, and Supabase Edge Functions. Leveraging GitHub Actions, Vercel for the frontend, Render for the custom backend, and Supabase's native deployment for Edge Functions provides an efficient and secure deployment strategy.

---

## CI/CD Pipeline Plan Update for HOMEase | AI

### 1. Overview of CI/CD Strategy

**Current Tooling:** GitHub Actions
**Target Hosting:**

* **Frontend (Next.js):** Vercel
* **Custom Backend Service (Node.js/Express & AI Worker):** Render (Dockerized deployment)
* **Supabase Edge Functions (Deno-based):** Supabase Native Deployment (via Supabase CLI)
**Database:** Supabase PostgreSQL (managed by Supabase migrations)
**Message Queue:** Upstash Redis (external service, requires connection strings)

**Core Principles:**

* **Automation:** Reduce manual intervention for builds, tests, and deployments.
* **Consistency:** Ensure deployments are repeatable and reliable across environments.
* **Security:** Secure handling of secrets and credentials.
* **Separation of Concerns:** Distinct workflows for each service where appropriate.
* **Environments:**
  * **Development:** Local development, feature branches, pull requests.
  * **Staging:** Deployed from `develop` branch, for internal testing and review.
  * **Production:** Deployed from `main` branch, stable and public-facing.

**Branching Strategy (Gitflow-like simplification):**

* `main`: Production-ready code. Merges trigger production deployments.
* `develop`: Staging environment code. Merges trigger staging deployments.
* `feature/*`: Feature development branches.
* `bugfix/*`: Bug fix branches.

### 2. Frontend CI/CD (Next.js to Vercel)

The Next.js frontend will be deployed to Vercel, which offers native support and optimization for Next.js applications, along with seamless GitHub integration.

**A. Vercel Project Setup:**

1. Connect the GitHub repository containing the Next.js frontend to Vercel.
2. Create two Vercel projects: `homease-frontend-staging` and `homease-frontend-production`.
3. Configure environment variables within Vercel project settings for both staging and production environments (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CUSTOM_BACKEND_URL`). Mark sensitive variables as `secrets`.

**B. GitHub Actions Workflow: `.github/workflows/frontend-deploy.yml`**

```yaml
name: Deploy Next.js Frontend

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID_STAGING: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
  VERCEL_PROJECT_ID_PRODUCTION: ${{ secrets.VERCEL_PROJECT_ID_PRODUCTION }}

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm' # or 'yarn', 'pnpm'

      - name: Install Dependencies
        run: npm install # or yarn install, pnpm install

      - name: Run Unit & Integration Tests
        run: npm test # Assuming `npm test` runs all relevant frontend tests
        # continue-on-error: true # Consider allowing builds to proceed even if tests fail, but mark as warning

      - name: Lint Code
        run: npm run lint

      - name: Build Next.js Application
        run: npm run build

      - name: Deploy to Vercel (Staging)
        if: github.ref == 'refs/heads/develop'
        run: |
          echo "Deploying to Staging (Vercel Project: homease-frontend-staging)"
          npm install -g vercel # Install Vercel CLI
          vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN_STAGING }} --scope=${{ secrets.VERCEL_ORG_ID }} --project=${{ secrets.VERCEL_PROJECT_ID_STAGING }}
          vercel build --token=${{ secrets.VERCEL_TOKEN_STAGING }}
          vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN_STAGING }} --prod --scope=${{ secrets.VERCEL_ORG_ID }} --project=${{ secrets.VERCEL_PROJECT_ID_STAGING }}
        env:
          # Pass required public env vars for build. Non-public are pulled by Vercel automatically.
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL_STAGING }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING }}
          NEXT_PUBLIC_CUSTOM_BACKEND_URL: ${{ secrets.NEXT_PUBLIC_CUSTOM_BACKEND_URL_STAGING }}

      - name: Deploy to Vercel (Production)
        if: github.ref == 'refs/heads/main'
        run: |
          echo "Deploying to Production (Vercel Project: homease-frontend-production)"
          npm install -g vercel # Install Vercel CLI
          vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN_PRODUCTION }} --scope=${{ secrets.VERCEL_ORG_ID }} --project=${{ secrets.VERCEL_PROJECT_ID_PRODUCTION }}
          vercel build --token=${{ secrets.VERCEL_TOKEN_PRODUCTION }}
          vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN_PRODUCTION }} --prod --scope=${{ secrets.VERCEL_ORG_ID }} --project=${{ secrets.VERCEL_PROJECT_ID_PRODUCTION }}
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL_PRODUCTION }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY_PRODUCTION }}
          NEXT_PUBLIC_CUSTOM_BACKEND_URL: ${{ secrets.NEXT_PUBLIC_CUSTOM_BACKEND_URL_PRODUCTION }}
```

**C. Environment Variable Management (Frontend):**

* **GitHub Secrets:**
  * `VERCEL_ORG_ID`: Your Vercel organization ID.
  * `VERCEL_PROJECT_ID_STAGING`: Vercel project ID for staging.
  * `VERCEL_PROJECT_ID_PRODUCTION`: Vercel project ID for production.
  * `VERCEL_TOKEN_STAGING`: Vercel API token with deployment permissions for staging.
  * `VERCEL_TOKEN_PRODUCTION`: Vercel API token with deployment permissions for production.
  * `NEXT_PUBLIC_SUPABASE_URL_STAGING`, `_PRODUCTION`: Supabase project URL.
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING`, `_PRODUCTION`: Supabase public key.
  * `NEXT_PUBLIC_CUSTOM_BACKEND_URL_STAGING`, `_PRODUCTION`: URL of the deployed custom backend.
* **Vercel Dashboard:** All other environment variables (including those needed at runtime for serverless functions within Next.js, if any) should be configured directly in the Vercel project settings for each environment (Preview, Production). This prevents leaking sensitive data into GitHub Actions logs.

### 3. Custom Backend Service CI/CD (Node.js/Express & AI Worker to Render)

The Custom Backend Service, including the API and the AI Worker, will be containerized using Docker and deployed to Render. Render simplifies Docker deployment and scaling.

**A. Dockerization Strategy:**

* A single `Dockerfile` will be used to build an image containing both the Express API and the AI Worker process. The application's `package.json` will define separate `start` scripts (e.g., `start:api` and `start:worker`), and Render will run two services from the same image, each with a different command.
* **Example `Dockerfile`:**

    ```dockerfile
    # Base image for Node.js application
    FROM node:20-slim

    # Set working directory
    WORKDIR /app

    # Copy package.json and package-lock.json first to leverage Docker cache
    COPY package*.json ./

    # Install dependencies
    RUN npm install --omit=dev

    # Copy the rest of the application code
    COPY . .

    # Build TypeScript (if applicable)
    RUN npm run build # Assuming a build step for TypeScript projects

    # Expose the port the API server listens on
    EXPOSE 8080 # Or whatever port your Express app uses

    # Define the default command to run the API service
    CMD ["npm", "run", "start:api"]

    # For the worker service, Render will override this CMD with "npm run start:worker"
    ```

**B. Render Project Setup:**

1. Connect Render to your GitHub repository.
2. Create a **Web Service** in Render for the API:
    * **Repository:** Your GitHub repo.
    * **Build Command:** `npm install && npm run build` (or similar for TypeScript).
    * **Start Command:** `npm run start:api`.
    * **Port:** `8080` (or as defined in your Express app).
    * **Environment Variables:** Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `REDIS_URL`, `GEMINI_API_KEY`, etc. Mark sensitive variables as `secrets`.
3. Create a **Background Worker** in Render for the AI Worker:
    * **Repository:** Your GitHub repo (can point to the same repo/branch).
    * **Build Command:** `npm install && npm run build`.
    * **Start Command:** `npm run start:worker`.
    * **Environment Variables:** Same as the web service, but ensure `GEMINI_API_KEY` and Supabase keys are accessible.

**C. GitHub Actions Workflow: `.github/workflows/backend-deploy.yml`**

```yaml
name: Deploy Custom Backend Service

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    # Define service directories if using a monorepo
    # defaults:
    #   run: |
    #     cd backend_service_dir # Example for monorepo
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm install

      - name: Run Backend Tests
        run: npm test

      # Trigger Render deployment via their API (or rely on Render's native GitHub integration)
      # This example uses a manual trigger to Render for more control.
      # For simpler setups, Render's native GitHub integration can automatically build/deploy on push.
      # If using native integration, this workflow might just run tests and rely on Render for deployment.

      - name: Deploy to Render (Staging)
        if: github.ref == 'refs/heads/develop'
        uses: "johnbeynon/render-deploy-action@v0.0.8" # A community action for Render deployments
        with:
          service-id: ${{ secrets.RENDER_API_SERVICE_ID_STAGING }}
          api-key: ${{ secrets.RENDER_API_KEY }}

      - name: Deploy to Render (Production)
        if: github.ref == 'refs/heads/main'
        uses: "johnbeynon/render-deploy-action@v0.0.8"
        with:
          service-id: ${{ secrets.RENDER_API_SERVICE_ID_PRODUCTION }}
          api-key: ${{ secrets.RENDER_API_KEY }}

      # Alternative: If Render doesn't support the action or more control is needed,
      # build and push Docker image to GHCR, then notify Render via their API/CLI if available
      # - name: Docker Login to GHCR
      #   uses: docker/login-action@v3
      #   with:
      #     registry: ghcr.io
      #     username: ${{ github.actor }}
      #     password: ${{ secrets.GITHUB_TOKEN }}
      # - name: Build and Push Docker Image
      #   uses: docker/build-push-action@v5
      #   with:
      #     context: .
      #     push: true
      #     tags: ghcr.io/${{ github.repository }}/backend:${{ github.sha }}
      # - name: Trigger Render Redeploy (if image changed)
      #   run: |
      #     curl -X POST -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
      #     "https://api.render.com/v1/services/${{ secrets.RENDER_API_SERVICE_ID_STAGING }}/deploys"
      #     # Render specific API call to trigger a redeploy from new image
```

**D. Environment Variable Management (Custom Backend):**

* **GitHub Secrets:**
  * `RENDER_API_KEY`: Render API key (can be global for your Render account).
  * `RENDER_API_SERVICE_ID_STAGING`: Render Service ID for the staging backend API.
  * `RENDER_API_SERVICE_ID_PRODUCTION`: Render Service ID for the production backend API.
  * (Optionally) Render Service IDs for worker services if separate triggers are needed.
  * `SUPABASE_URL_STAGING`, `_PRODUCTION`: Supabase project URL.
  * `SUPABASE_SERVICE_ROLE_KEY_STAGING`, `_PRODUCTION`: Supabase **Service Role Key** (highly sensitive, never expose client-side).
  * `REDIS_URL_STAGING`, `_PRODUCTION`: Upstash Redis connection string.
  * `GEMINI_API_KEY_STAGING`, `_PRODUCTION`: Google Gemini API key.
* **Render Dashboard:** All backend environment variables are configured in the Render service settings (Web Service and Background Worker). This is the primary location for these variables. GitHub Actions only needs the Render API key and Service IDs to trigger deployments.

### 4. Supabase Edge Functions CI/CD

Supabase Edge Functions are deployed directly via the Supabase CLI, often integrated with Git.

**A. Supabase CLI Setup:**

1. Ensure `supabase-cli` is installed and configured in the CI environment.
2. The Edge Functions code resides in the `supabase/functions` directory within your repository.

**B. GitHub Actions Workflow: `.github/workflows/edge-functions-deploy.yml`**

```yaml
name: Deploy Supabase Edge Functions

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'supabase/functions/**' # Trigger only when Edge Function code changes
  pull_request:
    branches:
      - main
      - develop
    paths:
      - 'supabase/functions/**'

jobs:
  deploy_edge_functions:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest # Or a specific version, e.g., '1.x.x'

      - name: Link Supabase Project (Staging)
        if: github.ref == 'refs/heads/develop'
        run: supabase link --project-id ${{ secrets.SUPABASE_PROJECT_ID_STAGING }} --db-url ${{ secrets.SUPABASE_DB_URL_STAGING }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }} # For CLI authentication

      - name: Link Supabase Project (Production)
        if: github.ref == 'refs/heads/main'
        run: supabase link --project-id ${{ secrets.SUPABASE_PROJECT_ID_PRODUCTION }} --db-url ${{ secrets.SUPABASE_DB_URL_PRODUCTION }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Deploy Edge Functions
        run: supabase functions deploy --no-verify-jwt # Deploy all functions in the directory
                                                      # --no-verify-jwt if not using JWT for internal function calls
        working-directory: supabase # Ensure CLI runs from the root or correct path

      # Optional: Test Edge Functions after deployment (e.g., with curl or another tool)
      - name: Test Deployed Edge Functions
        # ... add steps to invoke and verify function responses
        run: |
          echo "Testing Edge Functions (manual step needed)"
          # Example: curl https://${{ secrets.SUPABASE_PROJECT_REF_STAGING }}.supabase.co/functions/v1/my-edge-function
```

**C. Environment Variable Management (Edge Functions):**

* **GitHub Secrets:**
  * `SUPABASE_ACCESS_TOKEN`: A Supabase Personal Access Token with permissions to manage Edge Functions.
  * `SUPABASE_PROJECT_ID_STAGING`, `_PRODUCTION`: Your Supabase project reference ID.
  * `SUPABASE_DB_URL_STAGING`, `_PRODUCTION`: Supabase project database URL (used by `supabase link`).
* **Supabase Dashboard (Project Settings -> Edge Functions -> Environment Variables):**
  * For Edge Functions, any environment variables they need (e.g., API keys for third-party services, specific configurations) should be set directly in the Supabase project dashboard's Edge Functions settings. These are automatically injected at runtime.
  * For staging/production, ensure corresponding environment variables are set for each Supabase project.

### 5. Database Migrations (Supabase PostgreSQL)

Database migrations are critical for evolving the schema. Supabase CLI provides tools for this.

**A. Migration Strategy:**

* Migrations will be managed as SQL files within the `supabase/migrations` directory.
* **Local Development:** Developers create new migrations using `supabase migration new <name>`.
* **Staging/Production:** Migrations are applied in the CI/CD pipeline.

**B. GitHub Actions Workflow: `.github/workflows/db-migrations.yml`**

```yaml
name: Apply Database Migrations

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'supabase/migrations/**' # Trigger only when migration files change

jobs:
  apply_migrations:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase Project (Staging)
        if: github.ref == 'refs/heads/develop'
        run: supabase link --project-id ${{ secrets.SUPABASE_PROJECT_ID_STAGING }} --db-url ${{ secrets.SUPABASE_DB_URL_STAGING }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Apply Migrations to Staging
        if: github.ref == 'refs/heads/develop'
        run: supabase db diff --linked > /tmp/migration.sql && supabase db push --db-url ${{ secrets.SUPABASE_DB_URL_STAGING }} --auto-approve
        working-directory: supabase
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Link Supabase Project (Production)
        if: github.ref == 'refs/heads/main'
        run: supabase link --project-id ${{ secrets.SUPABASE_PROJECT_ID_PRODUCTION }} --db-url ${{ secrets.SUPABASE_DB_URL_PRODUCTION }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Apply Migrations to Production
        if: github.ref == 'refs/heads/main'
        run: supabase db diff --linked > /tmp/migration.sql && supabase db push --db-url ${{ secrets.SUPABASE_DB_URL_PRODUCTION }} --auto-approve
        working-directory: supabase
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

**C. Environment Variable Management (Migrations):**

* **GitHub Secrets:**
  * `SUPABASE_ACCESS_TOKEN`: The same Supabase Personal Access Token used for Edge Functions deployment.
  * `SUPABASE_PROJECT_ID_STAGING`, `_PRODUCTION`: Supabase project reference ID.
  * `SUPABASE_DB_URL_STAGING`, `_PRODUCTION`: The direct database connection URL (e.g., `postgresql://postgres:[YOUR-PASSWORD]@db.<PROJECT-REF>.supabase.co:5432/postgres`) for applying migrations. This is highly sensitive and distinct from the `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 6. Consolidated Environment Variable Management

All sensitive environment variables for CI/CD should be stored as **GitHub Secrets**.

**Required GitHub Secrets Summary:**

* **Vercel:**
  * `VERCEL_ORG_ID`
  * `VERCEL_PROJECT_ID_STAGING`
  * `VERCEL_PROJECT_ID_PRODUCTION`
  * `VERCEL_TOKEN_STAGING`
  * `VERCEL_TOKEN_PRODUCTION`
* **Render:**
  * `RENDER_API_KEY`
  * `RENDER_API_SERVICE_ID_STAGING`
  * `RENDER_API_SERVICE_ID_PRODUCTION`
* **Supabase (General CLI & Migrations):**
  * `SUPABASE_ACCESS_TOKEN`
  * `SUPABASE_PROJECT_ID_STAGING`
  * `SUPABASE_PROJECT_ID_PRODUCTION`
  * `SUPABASE_DB_URL_STAGING` (direct connection string with password)
  * `SUPABASE_DB_URL_PRODUCTION` (direct connection string with password)
* **Application-Specific (Staging/Production for each):**
  * `NEXT_PUBLIC_SUPABASE_URL_STAGING/PRODUCTION`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING/PRODUCTION`
  * `NEXT_PUBLIC_CUSTOM_BACKEND_URL_STAGING/PRODUCTION`
  * `SUPABASE_URL_STAGING/PRODUCTION` (for backend service)
  * `SUPABASE_SERVICE_ROLE_KEY_STAGING/PRODUCTION`
  * `REDIS_URL_STAGING/PRODUCTION`
  * `GEMINI_API_KEY_STAGING/PRODUCTION`

**Where to configure variables for runtime:**

* **Vercel:** Configure in Vercel project settings (Environment Variables tab).
* **Render:** Configure in Render service settings (Environment Variables tab).
* **Supabase Edge Functions:** Configure in Supabase Dashboard (Project Settings -> Edge Functions -> Environment Variables).

### 7. Security Best Practices

* **Least Privilege:** Grant deployment tokens (Vercel, Render, Supabase) only the necessary permissions.
* **Secrets Rotation:** Regularly rotate API keys and tokens.
* **Code Scanning:** Integrate GitHub's built-in code scanning or third-party tools to identify vulnerabilities in the codebase before deployment.
* **Image Scanning:** If using a custom container registry, enable vulnerability scanning for Docker images.
* **Environment Segregation:** Use separate Supabase projects, Vercel projects, and Render services for staging and production, each with its own set of environment variables and secrets.
* **Audit Logs:** Regularly review audit logs for GitHub, Vercel, Render, and Supabase to monitor access and changes.

---

This updated CI/CD plan provides a comprehensive and secure approach for deploying HOMEase | AI's Next.js frontend, custom backend services, and Supabase Edge Functions across staging and production environments using GitHub Actions.

HOMEase | AI Platform: Comprehensive Technical Architecture Plan
Introduction
The HOMEase | AI platform aims to revolutionize home renovations by connecting homeowners with qualified contractors and leveraging advanced AI tools for property assessment and project management. This document outlines the comprehensive technical architecture plan, detailing the transition from an initial Google Cloud/Firebase-centric stack to a robust, scalable, and cost-effective solution built primarily on Next.js, Supabase, and custom backend services. This plan ensures that existing functionality is maintained while integrating Google Gemini AI models, providing a clear roadmap for development and deployment.

1. High-Level Architecture Overview
The HOMEase platform will operate on a hybrid architecture, combining the benefits of a modern frontend framework, a powerful Backend-as-a-Service (BaaS), and dedicated custom backend microservices for complex, resource-intensive operations.

graph TD
    subgraph Frontend
        A[Next.js Web App]
        B[Next.js Mobile App]
    end

    subgraph Supabase Cloud
        C[Supabase Auth]
        D[Supabase PostgreSQL Database]
        E[Supabase Storage]
        F[Supabase Edge Functions]
        S[Supabase Realtime]
    end

    subgraph Custom Backend & Async Workflows
        G[Custom API Service (e.g., Node.js/Python on Fly.io/Render)]
        H[Redis Streams/Queue (e.g., Upstash or Self-managed)]
        I[AI Worker Service (consumes Redis Queue)]
        J[Contractor Matching Worker (consumes Redis Queue)]
        K[Notification Worker (consumes Redis Queue)]
    end

    subgraph External Services
        L[Google Gemini API]
        M[Stripe Payments]
        N[External SMS/Email Service]
        O[Other External APIs]
    end

    A -- "UI interactions" --> D
    A -- "User registration/login" --> C
    A -- "File uploads" --> E
    A -- "Specific API calls" --> G
    A -- "Trigger simple logic" --> F
    A -- "Realtime updates" --> S

    B -- "UI interactions" --> D
    B -- "User registration/login" --> C
    B -- "File uploads" --> E
    B -- "Specific API calls" --> G
    B -- "Trigger simple logic" --> F
    B -- "Realtime updates" --> S

    C -- "Manages user data" --> D
    D -- "Realtime changes" --> S
    E -- "Stores files" --> D
    F -- "DB triggers, webhooks" --> D
    F -- "Simple API endpoints" --> G

    G -- "CRUD operations" --> D
    G -- "Authenticates users" --> C
    G -- "Manages files" --> E
    G -- "Publishes async tasks" --> H
    G -- "Handles payment webhooks" --> M
    G -- "Integrates with other APIs" --> O

    I -- "Processes AI tasks" --> H
    I -- "Fetches data" --> D
    I -- "Fetches images" --> E
    I -- "Makes AI calls" --> L
    I -- "Updates data" --> D
    I -- "Publishes events" --> H

    J -- "Processes matching tasks" --> H
    J -- "Fetches data" --> D
    J -- "Publishes events" --> H

    K -- "Processes notification tasks" --> H
    K -- "Fetches data" --> D
    K -- "Sends notifications" --> N

    S -- "Broadcasts DB changes" --> A & B

    style A fill:#D4EDDA,stroke:#28A745,stroke-width:2px
    style B fill:#D4EDDA,stroke:#28A745,stroke-width:2px
    style C fill:#D1ECF1,stroke:#17A2B8,stroke-width:2px
    style D fill:#D1ECF1,stroke:#17A2B8,stroke-width:2px
    style E fill:#D1ECF1,stroke:#17A2B8,stroke-width:2px
    style F fill:#D1ECF1,stroke:#17A2B8,stroke-width:2px
    style S fill:#D1ECF1,stroke:#17A2B8,stroke-width:2px
    style G fill:#FFF3CD,stroke:#FFC107,stroke-width:2px
    style H fill:#FFF3CD,stroke:#FFC107,stroke-width:2px
    style I fill:#FFF3CD,stroke:#FFC107,stroke-width:2px
    style J fill:#FFF3CD,stroke:#FFC107,stroke-width:2px
    style K fill:#FFF3CD,stroke:#FFC107,stroke-width:2px
    style L fill:#F8D7DA,stroke:#DC3545,stroke-width:2px
    style M fill:#F8D7DA,stroke:#DC3545,stroke-width:2px
    style N fill:#F8D7DA,stroke:#DC3545,stroke-width:2px
    style O fill:#F8D7DA,stroke:#DC3545,stroke-width:2px
2. Component Mapping: GCP/Firebase to Supabase/Open-Source
This section provides a direct mapping of HOMEase's original GCP/Firebase architecture components to their proposed Supabase or suitable open-source alternatives, along with the rationale for each choice.

| Original GCP/Firebase Component | Proposed Supabase / Open-Source Alternative | Rationale & Description | |

## HOMEase Platform: Technical Architecture Plan

Introduction
The HOMEase | AI platform aims to connect homeowners with qualified contractors, leveraging AI for property assessment and project management. This plan details the architectural blueprint for migrating from a Google Cloud/Firebase stack to a Next.js App Router and Supabase foundation, while ensuring existing functionality is maintained and new Google Gemini AI models are seamlessly integrated. The architecture emphasizes modularity, scalability, security, and developer efficiency.

1. High-Level Architecture Overview
The HOMEase platform adopts a hybrid backend approach, combining a modern Next.js frontend with Supabase's comprehensive BaaS features (database, authentication, storage, real-time) and dedicated custom backend services for complex AI orchestration and business logic.

graph TD
    subgraph Frontend
        A[Next.js Web App]
        B[Next.js Mobile App]
    end

    subgraph Supabase Cloud
        C[Supabase Auth]
        D[Supabase PostgreSQL Database]
        E[Supabase Storage]
        F[Supabase Edge Functions]
        S[Supabase Realtime]
    end

    subgraph Custom Backend & Async Workflows
        G[Custom API Service (e.g., Node.js/Python on Fly.io/Render)]
        H[Redis Streams/Queue (e.g., Upstash or Self-managed)]
        I[AI Worker Service (consumes Redis Queue)]
        J[Contractor Matching Worker (consumes Redis Queue)]
        K[Notification Worker (consumes Redis Queue)]
    end

    subgraph External Services
        L[Google Gemini API]
        M[Stripe Payments]
        N[External SMS/Email Service]
        O[Other External APIs]
    end

    A -- "UI interactions" --> D
    A -- "User registration/login" --> C
    A -- "File uploads" --> E
    A -- "Specific API calls" --> G
    A -- "Trigger simple logic" --> F
    A -- "Realtime updates" --> S

    B -- "UI interactions" --> D
    B -- "User registration/login" --> C
    B -- "File uploads" --> E
    B -- "Specific API calls" --> G
    B -- "Trigger simple logic" --> F
    B -- "Realtime updates" --> S

    C -- "Manages user data" --> D
    D -- "Realtime changes" --> S
    E -- "Stores files" --> D
    F -- "DB triggers, webhooks" --> D
    F -- "Simple API endpoints" --> G

    G -- "CRUD operations" --> D
    G -- "Authenticates users" --> C
    G -- "Manages files" --> E
    G -- "Publishes async tasks" --> H
    G -- "Handles payment webhooks" --> M
    G -- "Integrates with other APIs" --> O

    I -- "Processes AI tasks" --> H
    I -- "Fetches data" --> D
    I -- "Fetches images" --> E
    I -- "Makes AI calls" --> L
    I -- "Updates data" --> D
    I -- "Publishes events" --> H

    J -- "Processes matching tasks" --> H
    J -- "Fetches data" --> D
    J -- "Publishes events" --> H

    K -- "Processes notification tasks" --> H
    K -- "Fetches data" --> D
    K -- "Sends notifications" --> N

    S -- "Broadcasts DB changes" --> A & B
2. Component Mapping: GCP/Firebase to Supabase/Open-Source
This table outlines the transition of existing GCP/Firebase components to their new Supabase or open-source counterparts.

| Original GCP/Firebase Component | Proposed Supabase / Open-Source Alternative | Rationale & Description | |
