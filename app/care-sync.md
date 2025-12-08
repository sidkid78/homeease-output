Care-Sync aims to revolutionize family care coordination by leveraging Agentic AI within a robust, accessible, and secure platform built on Next.js App Router and Supabase. This technical architecture outlines the core components, AI integrations, supporting features, and monetization strategy, prioritizing security, data privacy (especially for health data), and an intuitive user experience.

Care-Sync: Technical Architecture Overview
Core Technologies
Frontend: Next.js (App Router) for hybrid rendering (Server Components for initial loads, Client Components for interactivity).
Backend, Database, Auth, Realtime, Storage: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions).
AI Integration: External APIs (OpenAI Whisper/GPT, Google Cloud Vision/NLP) or self-hosted alternatives, orchestrated via asynchronous worker services.
Payment Gateway: Stripe for subscription management.
High-Level System Architecture
graph TD
    subgraph Client Applications
        A[Mobile App / Web App (Next.js App Router)]
    end

    subgraph Supabase Core Platform
        B[Supabase Auth]
        C[Supabase Database (PostgreSQL)]
        D[Supabase Realtime]
        E[Supabase Storage]
        F[Supabase Edge Functions]
    end

    subgraph External Integrations & Async Processing
        G[Message Queues (e.g., SQS)]
        H[AI Worker Services (e.g., Lambda, ECS)]
        I[External AI APIs (OpenAI, GCP Vision/NLP)]
        J[Drug Databases (e.g., RxNorm, OpenFDA)]
        K[Stripe API (Payments)]
        L[Notification Services (Email/Push)]
    end

    subgraph Cross-Cutting Concerns
        M[Key Management System (KMS)]
        N[Monitoring & Logging]
        O[Secrets Management]
    end

    A -- User Actions / UI --> B
    A -- Data Fetch (Server Component) --> C
    A -- Realtime Updates (Client Component) --> D
    A -- Direct File Upload --> E
    A -- API Calls (Client Component / API Routes) --> F
    F -- Invoke --> G
    G -- Trigger --> H
    H -- Interact --> I
    H -- Interact --> J
    H -- Encrypt/Decrypt --> M
    H -- Store Results --> C
    C -- Encrypt/Decrypt --> M
    A -- Initiate Checkout --> K
    K -- Webhooks --> F
    F -- Update Status --> C
    H -- Send Alerts --> L
    A -- Receive Notifications --> L
    All -- Monitor --> N
    All -- Secure --> O

    style A fill:#D0E7FF,stroke:#3366CC,stroke-width:2px
    style B fill:#C0E0B8,stroke:#66AA55,stroke-width:2px
    style C fill:#C0E0B8,stroke:#66AA55,stroke-width:2px
    style D fill:#C0E0B8,stroke:#66AA55,stroke-width:2px
    style E fill:#C0E0B8,stroke:#66AA55,stroke-width:2px
    style F fill:#C0E0B8,stroke:#66AA55,stroke-width:2px
    style G fill:#FFFACD,stroke:#FFD700,stroke-width:2px
    style H fill:#E0FFFF,stroke:#00CED1,stroke-width:2px
    style I fill:#F0F8FF,stroke:#87CEEB,stroke-width:2px
    style J fill:#F0F8FF,stroke:#87CEEB,stroke-width:2px
    style K fill:#FFDDC1,stroke:#FF8C00,stroke-width:2px
    style L fill:#FFE0D0,stroke:#FF6347,stroke-width:2px
    style M fill:#E6E6FA,stroke:#9370DB,stroke-width:2px
    style N fill:#F0FFF0,stroke:#3CB371,stroke-width:2px
    style O fill:#F5F5DC,stroke:#DAA520,stroke-width:2px
I. Core Platform Services (Next.js & Supabase Foundation)
This forms the secure and scalable backbone for user and family management, leveraging Supabase's integrated services.

1. User Authentication & Profiles
Supabase Auth: Handles user registration, login (email/password, social OAuth), and session management.
profiles Table: Extends Supabase auth.users with application-specific data.
Fields: id (PK, FK to auth.users), full_name, username, avatar_url, role (senior, caregiver, admin), subscription_status, stripe_customer_id, current_period_end.
Next.js Integration:
Middleware: Protects routes (/dashboard, /family/:path*) by checking session and redirects unauthenticated users to /login. Refreshes auth tokens.
Client Components: Handle login/signup forms, interact with supabase.auth.signInWith....
Server Components: Fetch user data securely via createServerSupabaseClient for initial page loads (e.g., DashboardPage fetches profile and families).
Row Level Security (RLS): Policies on profiles ensure users can only view/update their own profile.
Profile Creation Trigger: A Supabase PostgreSQL trigger (handle_new_user) automatically creates a profile entry with a default role (caregiver) upon new auth.users insertion.
2. Family Management
families Table: Represents a family group.
Fields: id, name, created_by_profile_id, invite_code (unique code for joining).
family_members Table: Junction table linking profiles to families.
Fields: family_id (PK), profile_id (PK), role_in_family (primary_caregiver, member, senior_member, pending), joined_at.
RLS: Policies on families and family_members ensure users can only access data for families they belong to, with role_in_family dictating permissions (e.g., only primary_caregiver can remove members).
Next.js Flow:
Dashboard (Server Component): Fetches families a user belongs to.
CreateFamilyPage (Client Component): Allows authenticated users to create a new family, generating an invite_code, and adding themselves as primary_caregiver.
JoinFamilyPage (Client Component): Allows users to join a family using an invite_code.
MemberList (Client Component): Displays family members, with UI controls for primary_caregiver to manage roles or remove members (RLS enforces backend permissions).
3. Real-time Family Feed
feed_posts Table: Stores all family activity (posts, tasks, status updates).
Fields: id, family_id, author_profile_id, content, type (post, task, status_update), status (open, completed, archived), due_date, completed_by_profile_id, created_at.
RLS: Ensures only family members can view, insert, or update posts within their family.
Supabase Realtime:
Client Component (FamilyFeed): Subscribes to changes on the feed_posts table using supabase.channel().on('postgres_changes', ...).
Provides instant updates to all active family members when new posts are added, or existing ones are updated/deleted.
Handles fetching associated profile data for new posts on the client side to enrich real-time payload.
II. AI Agentic Features
These features leverage asynchronous processing and external AI APIs, carefully designed with privacy in mind.

1. General AI Integration Pattern
Asynchronous Processing: Long-running AI tasks are offloaded to asynchronous pipelines.
Message Queues: AWS SQS, Supabase Edge Functions acting as message producers/consumers.
AI Worker Services: Serverless functions (AWS Lambda, Google Cloud Functions) or containerized services (ECS, Kubernetes) for compute-intensive tasks. Supabase Edge Functions (Deno) can handle lighter-weight orchestration or proxying to external AI APIs.
External AI APIs: OpenAI (Whisper, GPT), Google Cloud Vision, Google Cloud Natural Language.
Data Flow: Client initiates -> Backend (API Gateway/Edge Function) -> Enqueue message -> Worker Service consumes, interacts with AI API -> Stores results in Supabase DB -> Notifies client via Realtime/Push Notifications.
Privacy & Security: All sensitive data (audio, images, transcripts) are encrypted in transit (TLS) and at rest (AES-256 with KMS/client-side). Raw inputs and intermediate data are subject to limited retention and deleted after processing. Explicit user consent is paramount.
2. Doctor Digest (Hero Feature)
Functionality: Audio recording -> Transcription -> Summarization -> Action Item extraction.
Client-Side (Next.js Client Component):
Secure Audio Recording (native mobile/Web Audio API).
Local Encryption (Recommended): Encrypts audio on-device before upload.
Secure Upload via pre-signed URL to Supabase Storage.
Backend (Supabase Edge Function / API Route):
Receives upload notification.
Creates DoctorDigestJob record (status: PENDING_TRANSCRIPTION).
Enqueues job to STT_QUEUE (via a message queue service).
STT Worker Service (Lambda / Edge Function):
Retrieves encrypted audio from Supabase Storage.
Decrypts (if locally encrypted, using KMS-managed key).
Speech-to-Text: Calls OpenAI Whisper API (or a self-hosted Whisper instance).
Stores raw transcript (encrypted, temporary retention).
Updates DoctorDigestJob status to PENDING_SUMMARIZATION.
Enqueues job to LLM_SUMMARIZE_QUEUE.
LLM Summarization Worker Service (Lambda):
Retrieves transcript.
LLM Interaction: Calls OpenAI GPT-4 (or similar LLM) with a carefully engineered prompt for medical summarization and structured action item extraction.
Stores summary and action items in Supabase DB (encrypted).
Updates DoctorDigestJob status to COMPLETED.
Triggers Realtime notification to family members.
3. Med-Cabinet Scanner
Functionality: Image capture -> OCR -> Drug identification -> Conflict checking.
Client-Side (Next.js Client Component):
Image Capture (device camera).
Secure Upload via pre-signed URL to Supabase Storage.
Backend (Supabase Edge Function / API Route):
Receives upload notification.
Creates MedCabinetScanJob (status: PENDING_OCR).
Enqueues job to OCR_QUEUE.
OCR Worker Service (Lambda / Edge Function):
Retrieves image from Supabase Storage.
OCR Processing: Calls Google Cloud Vision API (or self-hosted Tesseract/EasyOCR).
Stores extracted raw text (encrypted, temporary retention).
Updates MedCabinetScanJob status to PENDING_DRUG_IDENTIFICATION.
Enqueues job to DRUG_IDENTIFICATION_QUEUE.
Drug Identification Worker Service (Lambda):
Extracts drug names from OCR text using NLP.
Database Lookup/API Call: Queries internal drug database (e.g., RxNorm) or external APIs (OpenFDA) for drug details (dosage, active ingredients).
Stores identified drugs (normalized, encrypted).
Updates MedCabinetScanJob status to PENDING_CONFLICT_CHECK.
Enqueues job to CONFLICT_CHECK_QUEUE.
Conflict Checking Worker Service (Lambda):
Retrieves identified drugs and user's existing medication profile (from Supabase DB).
Conflict System: Queries drug-drug interaction database/API (e.g., OpenFDA) for interactions, contraindications, allergies.
Generates and stores warnings in Supabase DB (encrypted).
Triggers Realtime notification.
4. Vibe Check (Mood Tracking)
Functionality: Text input -> Sentiment analysis -> Trend visualization.
Client-Side (Next.js Client Component):
User provides text input (mood description).
Sends text to backend API (/vibe-check/analyze).
Backend (Supabase Edge Function / API Route):
Receives text input.
Sentiment Analysis: Calls Google Cloud Natural Language API or a custom NLP model.
Stores sentiment score/category in Supabase DB (encrypted, potentially anonymized for trend analysis).
Sends result back to client for immediate feedback and updates family's mood graph.
III. Supporting Features
1. Who’s On Duty? Calendar
shifts Table: Represents events, tasks, or duties.
Fields: id, family_id (Crucial for RLS), title, start_time, end_time, assigned_to_user_id, created_by_user_id, status (scheduled, completed, pending_swap), type.
shift_swap_requests Table: Manages requests for shift changes.
Fields: id, family_id (Crucial for RLS), original_shift_id, requester_user_id, target_user_id (optional), status (pending, accepted, rejected).
RLS: Policies on shifts and shift_swap_requests ensure users only interact with data within their family and according to their role_in_family.
Supabase Edge Functions:
Shift Swapping Logic: An Edge Function handles POST /api/shift-swaps/request and PUT /api/shift-swaps/{request_id}/approve|reject|cancel due to complex transactional logic. It verifies permissions, updates shifts and shift_swap_requests tables, and triggers notifications.
Supabase Realtime:
Clients subscribe to shifts and shift_swap_requests for instant updates on calendar changes and new/updated swap requests.
Notifications: Database triggers (PostgreSQL) on shift_swap_requests can invoke Supabase Edge Functions to send email or push notifications (via external services like SendGrid/FCM) to relevant users (requester, target, family admin).
2. The Vault (Secure Document Storage)
vault_documents Table: Stores metadata about encrypted documents.
Fields: id, family_id (Crucial for RLS), file_name, storage_path, mime_type, file_size (encrypted size), description, category, uploaded_by_user_id, encryption_iv (Base64), encryption_salt (Base64), checksum (SHA256 of encrypted file).
Supabase Storage: A private vault bucket for storing the encrypted binary files.
Storage Policies: RLS on the vault bucket ensures only authenticated members of a family can upload, download, or delete their family's documents.
Client-Side Encryption (CRITICAL for Privacy):
Upload:
User selects file, potentially provides a password (never stored).
Client-side JavaScript (Web Crypto API):
Generates unique encryption_salt and encryption_iv per document.
Derives strong AES-256 GCM key from user password + encryption_salt (e.g., PBKDF2).
Encrypts file content using AES-256 GCM.
Calculates SHA256 checksum of the encrypted file.
Uploads the encrypted file blob to Supabase Storage using supabase.storage.from('vault').upload(...).
Inserts vault_documents metadata (including encryption_iv, encryption_salt, checksum) into Supabase DB.
Download:
Client fetches vault_documents metadata (via RLS-protected Supabase DB query).
Requests a signed URL for the storage_path from Supabase Storage.
Downloads the encrypted file blob using the signed URL.
Client-side JavaScript:
Verifies the checksum of the downloaded encrypted file against stored checksum.
User provides password.
Derives decryption key using password + stored encryption_salt.
Decrypts file content using AES-256 GCM with derived key + stored encryption_iv.
Presents decrypted file to the user.
Implication: Supabase (and its administrators) can store and serve the encrypted files but cannot decrypt them, as the decryption key components (password + salt + IV) are either user-controlled or derived client-side.
IV. Business Model & Growth (Freemium)
1. Freemium Feature Gating
Free Tier: Manual task entry, shared calendar, basic chat.
Premium Tier ($9.99/mo per family):
"Doctor Digest" (unlimited AI recording).
Drug Interaction Warnings.
Advanced Document Vault storage (higher limits).
Gating Logic:
Client-Side: Conditional rendering of UI elements based on user.subscription_status. Displays upgrade prompts.
Server-Side (CRITICAL): Next.js API Routes and Supabase Edge Functions explicitly check user.subscription_status (fetched from profiles table) before executing premium logic or returning premium data. Unauthorized requests return 403 Forbidden.
2. Stripe Integration for Subscriptions
profiles Table: Stores subscription_status (free, premium, trialing, cancelled, past_due), stripe_customer_id, current_period_end.
Client-Side (Next.js):
"Upgrade" button triggers a call to /api/create-checkout-session.
Uses @stripe/stripe-js to redirect user to Stripe Checkout.
"Manage Billing" button calls /api/manage-billing to create a Stripe Customer Portal session.
Server-Side (Next.js API Routes):
/api/create-checkout-session: Creates a Stripe Checkout Session, passing userId as client_reference_id to link to Supabase user.
/api/manage-billing: Fetches stripe_customer_id from Supabase profiles table and creates a Stripe Customer Portal session.
Stripe Webhooks (/api/stripe-webhook):
Endpoint receives Stripe events (e.g., checkout.session.completed, customer.subscription.updated, customer.subscription.deleted).
Security: Verifies webhook signature (STRIPE_WEBHOOK_SECRET).
Supabase Synchronization: Uses SUPABASE_SERVICE_ROLE_KEY (Supabase Admin client) to bypass RLS and securely update profiles table with subscription_status, stripe_customer_id, and current_period_end.
3. B2B Angle
The robust, multi-tenant family structure and AI-driven automation can be adapted and sold as a white-label or API platform to Home Care Agencies. This leverages the existing architecture for a significant growth opportunity.
V. Cross-Cutting Concerns & Challenges
1. Security & Privacy (HIPAA Compliance)
Data Encryption:
In Transit (TLS/SSL): All client-server and server-server communication.
At Rest (AES-256): Supabase PostgreSQL, Supabase Storage (with KMS for keys).
Client-Side Encryption: Essential for "The Vault," ensuring documents are unreadable by anyone without the user's decryption key.
Row Level Security (RLS): Implemented across all Supabase tables (profiles, families, family_members, shifts, feed_posts, vault_documents) to enforce granular, context-aware data access.
Data Minimization & Retention: Collect and process only necessary data. Raw audio/images/intermediate transcripts are deleted after processing. Processed data (summaries, action items, drug info) retained only as long as necessary, often anonymized/pseudonymized for analytics.
User Consent: Explicit, informed consent for recording, transcription, image analysis, and data storage is paramount.
Secrets Management: API keys (Stripe, OpenAI, GCP) stored securely (e.g., Supabase environment variables, cloud secrets managers).
Access Control: Strict IAM policies for worker services to access only required resources. Regular security audits and penetration testing.
"Your data never trains our AI": A key marketing and architectural principle, achieved by using external AI models that guarantee data privacy (e.g., OpenAI enterprise offerings, Google Cloud data policies).
2. Robust Error Handling & Resilience
Client-Side: Retries with exponential backoff, clear user feedback messages.
Backend:
Input validation, appropriate timeouts for external API calls.
Retry mechanisms for transient errors.
Dead-Letter Queues (DLQs): For all message queues, to capture failed messages for later inspection/reprocessing.
Circuit Breakers: Prevent cascading failures when external AI services are unresponsive.
Idempotency: AI worker services designed to handle duplicate messages without side effects.
Graceful Degradation: Provide basic functionality or inform users if an AI service is temporarily unavailable.
Monitoring & Logging: Comprehensive logging and real-time alerts for errors, DLQ messages, and service failures.
3. Accessible UI/UX
High-Contrast & Large Text:
Tailwind CSS & CSS Variables: Custom themes defined in tailwind.config.js using CSS variables (--color-text-default, --font-size-base). These variables are dynamically changed by data-theme='high-contrast' and data-text-size='large' attributes on document.documentElement.
AccessibilityContext: Global React context manages isHighContrast and isLargeText states, persisting preferences in localStorage.
WCAG AAA contrast ratios verified for all text/background pairs.
Modern Aesthetic: Clean, uncluttered design with generous whitespace, consistent typography, subtle shadows, and responsive layouts.
Keyboard Navigation: All interactive elements (buttons, inputs, links) are reachable and operable via keyboard, with clear focus states.
Screen Reader Support: Semantic HTML, aria-label, aria-describedby, and role attributes used where necessary.
Simplicity: Designed primarily for caregivers, with an optional "Passive Mode" for seniors (large clock, next visitor photo) to reduce complexity for direct senior interaction.
This architecture provides a scalable, secure, and user-centric foundation for Care-Sync, addressing the technical requirements and business opportunities while meticulously handling sensitive health data and accessibility needs.