import { z } from 'zod';
import { Enums } from '@/types/database';

/**
 * @module Schemas
 * @description Zod validation schemas for various data models in the HOMEase | AI application.
 * These schemas ensure data integrity and type safety for inputs and outputs.
 */

/**
 * Enum for user roles.
 * Corresponds to the `user_role` enum in the Supabase database.
 */
export const userRoleEnum = z.enum(['HOMEOWNER', 'CONTRACTOR', 'ADMIN']);

/**
 * Schema for a user profile.
 * Used for validating profile data when creating or updating a user.
 */
export const profileSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  email: z.string().email({ message: 'Invalid email address' }),
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }).max(100).optional().nullable(),
  avatar_url: z.string().url({ message: 'Invalid URL format' }).optional().nullable(),
  role: userRoleEnum.default('HOMEOWNER'),
});

/**
 * Schema for a homeowner profile.
 * Extends the basic profile schema with homeowner-specific fields.
 */
export const homeownerProfileSchema = profileSchema.extend({
  address: z.string().min(5).max(255).optional().nullable(),
  city: z.string().min(2).max(100).optional().nullable(),
  state: z.string().length(2, { message: 'State must be a 2-letter abbreviation.' }).optional().nullable(),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, { message: 'Invalid ZIP code format' }).optional().nullable(),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' }).optional().nullable(),
});

/**
 * Schema for a contractor profile.
 * Extends the basic profile schema with contractor-specific fields.
 */
export const contractorProfileSchema = profileSchema.extend({
  company_name: z.string().min(2).max(255).optional().nullable(),
  license_number: z.string().min(5).max(50).optional().nullable(),
  service_areas: z.array(z.string()).optional().nullable(),
  specialties: z.array(z.string()).optional().nullable(),
  is_verified: z.boolean().default(false).optional(),
  rating: z.number().min(0).max(5).default(0).optional(),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' }).optional().nullable(),
  stripe_account_id: z.string().optional().nullable(),
});

/**
 * Schema for an AR assessment.
 */
export const arAssessmentSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  homeowner_id: z.string().uuid(),
  assessment_data: z.record(z.any()).optional().nullable(), // Loosely typed JSON for now
  ai_analysis_result: z.record(z.any()).optional().nullable(), // Loosely typed JSON for now
  fal_ai_visualization_url: z.string().url().optional().nullable(),
  status: z.string().default('pending'),
});

/**
 * Schema for a project.
 */
export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  homeowner_id: z.string().uuid(),
  ar_assessment_id: z.string().uuid().optional().nullable(),
  title: z.string().min(5, { message: 'Project title must be at least 5 characters.' }).max(255),
  description: z.string().min(10).optional().nullable(),
  status: z.string().default('open'),
  budget_estimate: z.number().positive().optional().nullable(),
  start_date: z.string().datetime().optional().nullable(),
  end_date: z.string().datetime().optional().nullable(),
});

/**
 * Schema for a project lead.
 */
export const projectLeadSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  project_id: z.string().uuid(),
  contractor_id: z.string().uuid(),
  status: z.string().default('available'),
  lead_cost: z.number().positive(),
  purchased_at: z.string().datetime().optional().nullable(),
});

/**
 * Schema for a payment.
 */
export const paymentSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  project_id: z.string().uuid(),
  payer_id: z.string().uuid(),
  payee_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('usd'),
  stripe_charge_id: z.string().optional().nullable(),
  status: z.string().default('pending'),
  payment_type: z.string().optional().nullable(),
});

/**
 * Schema for a review.
 */
export const reviewSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  project_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  reviewed_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).optional().nullable(),
});
