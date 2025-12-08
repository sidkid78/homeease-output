# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HOMEase | AI is a Next.js 15 platform connecting homeowners with contractors through AR-based home assessments, AI analysis, and lead matching. The application features role-based authentication (Homeowner, Contractor, Admin) with Supabase for backend services and Stripe for payments.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth
- **Payments**: Stripe Connect/Checkout
- **Styling**: Tailwind CSS + Shadcn UI
- **AI Integration**: Google Gemini API, Fal.ai

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Project Structure

### Route Groups

The app uses Next.js route groups for role-based separation:

- `app/(auth)/*` - Authentication pages (login, signup, callback)
- `app/(homeowner)/*` - Homeowner dashboard, projects, assessments
- `app/(contractor)/*` - Contractor dashboard, leads, profile
- `app/api/*` - API routes (Stripe webhooks)

### Key Directories

- `lib/supabase/` - Supabase client configuration for server/client/middleware
- `lib/actions/` - Server actions for data mutations (auth, projects, leads, contractors, assessments, payments)
- `lib/validations/` - Zod schemas for form validation
- `lib/stripe/` - Stripe client configuration
- `components/auth/` - Authentication forms
- `components/homeowner/` - Homeowner-specific components
- `components/contractor/` - Contractor-specific components
- `components/shared/` - Shared components across roles
- `types/` - TypeScript type definitions (auto-generated database types)
- `supabase/migrations/` - Database schema and RLS policies

## Architecture Patterns

### Supabase Client Usage

**Server Components and Server Actions:**
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()
```

**Client Components:**
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

**Middleware:**
```typescript
import { createClient } from '@/lib/supabase/server'
// Used in middleware.ts for session validation and role-based routing
```

### Server Actions Pattern

All server actions follow a consistent pattern:

1. Import `createClient` from `@/lib/supabase/server`
2. Validate input with Zod schemas from `lib/validations/schemas.ts`
3. Perform database operations
4. Return typed response: `{ success: boolean, data?: T, error?: string }`
5. Call `revalidatePath()` for cache invalidation
6. Handle errors gracefully with user-friendly messages

Example:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = createClient()

  // Validation, database operations, error handling

  revalidatePath('/homeowner/dashboard')
  return { success: true, data }
}
```

### Authentication & Role-Based Access

The middleware (`middleware.ts`) handles:

- Session validation using `updateSession()` from `@/lib/supabase/middleware`
- Role-based redirection (HOMEOWNER → `/homeowner/dashboard`, CONTRACTOR → `/contractor/dashboard`)
- Protected route enforcement (homeowners cannot access contractor routes and vice versa)
- Public paths: `/login`, `/signup`, `/auth/callback`, `/`

User roles are stored in the `profiles` table with type `user_role` enum.

### Database Schema

Core tables:

- `profiles` - Base user profiles with role (HOMEOWNER, CONTRACTOR, ADMIN)
- `homeowner_profiles` - Extended homeowner data (address, phone)
- `contractor_profiles` - Extended contractor data (company, license, specialties, Stripe account)
- `ar_assessments` - AR scan data, AI analysis, Fal.ai visualizations
- `projects` - Project records linked to homeowners and assessments
- `project_leads` - Junction table for contractor-project matching
- `payments` - Stripe transaction records
- `reviews` - Homeowner/contractor ratings and feedback

All tables use Row Level Security (RLS). See `supabase/migrations/002_rls_policies.sql` for policy definitions.

### Environment Variables

Required variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`
- `GEMINI_API_KEY` - For AI analysis
- `FAL_AI_API_KEY` - For visualization generation

## Code Style Guidelines

### TypeScript

- Use interfaces for props and data shapes
- Avoid `any`, use proper types or `unknown`
- Leverage discriminated unions for state management
- Use const assertions for literal types

### Component Patterns

- Default to Server Components
- Use `'use client'` directive only when necessary (forms, interactivity, hooks)
- Keep components focused and small
- Use composition over prop drilling

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Constants: `SCREAMING_SNAKE.ts` (e.g., `API_ROUTES.ts`)
- Directories: `kebab-case/` (e.g., `user-profile/`)

### Import Organization

1. React imports
2. External library imports
3. Internal imports (use `@/` alias)
4. Type imports

Sort alphabetically within each group.

## Database Operations

### Type Safety

Database types are auto-generated in `types/database.ts`. Use the provided type helpers:

```typescript
import { TablesInsert } from '@/types/database'
type ProjectInsert = TablesInsert<'projects'>
```

### RLS (Row Level Security)

All tables have RLS enabled. Policies enforce:

- Users can only view/modify their own data
- Homeowners access their projects and assessments
- Contractors access leads they've purchased
- Admin role has elevated permissions

## Stripe Integration

- Lead purchases use Stripe Checkout
- Contractor payouts use Stripe Connect
- Webhooks handled in `app/api/webhooks/stripe/route.ts`
- All transactions recorded in `payments` table

## Known Issues & Considerations

- The middleware contains a typo on line 100: `'/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*) K'` - the trailing `K` should be removed
- Server client creation in middleware uses synchronous `createClient()` but the function is async - ensure compatibility with Next.js middleware constraints
- Generic dashboard redirect (`/dashboard`) routes to role-specific dashboards based on user profile

## Testing & Deployment

- No test framework currently configured
- Build process: `npm run build` compiles TypeScript and generates Next.js production build
- Supabase migrations should be applied using Supabase CLI: `supabase db push`
