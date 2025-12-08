
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { projectLeadSchema } from '@/lib/validations/schemas';
import { TablesInsert } from '@/types/database';

type ProjectLeadInsert = TablesInsert<'project_leads'>;

/**
 * Creates a new project lead (matches a contractor to a project).
 * @param formData - FormData containing project lead details.
 * @returns A success message or an error message.
 */
export async function createProjectLead(formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());

  try {
    const validatedData = projectLeadSchema.parse(rawData);

    const { data, error } = await supabase
      .from('project_leads')
      .insert(validatedData as ProjectLeadInsert)
      .select();

    if (error) {
      console.error('Error creating project lead:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/contractor/dashboard');
    revalidatePath(`/homeowner/projects/${validatedData.project_id}`);
    return { success: true, data: data[0] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(err => err.message).join(', ') };
    }
    console.error('Unexpected error creating project lead:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Updates an existing project lead (e.g., status, purchase).
 * @param leadId - The ID of the project lead to update.
 * @param formData - FormData containing the updated project lead details.
 * @returns A success message or an error message.
 */
export async function updateProjectLead(leadId: string, formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());

  try {
    const validatedData = projectLeadSchema.partial().parse(rawData);

    const { data, error } = await supabase
      .from('project_leads')
      .update(validatedData)
      .eq('id', leadId)
      .select();

    if (error) {
      console.error('Error updating project lead:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/contractor/leads');
    revalidatePath(`/homeowner/projects/${data[0]?.project_id}`);
    return { success: true, data: data[0] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(err => err.message).join(', ') };
    }
    console.error('Unexpected error updating project lead:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Purchases a lead for a contractor.
 * This involves updating the lead status and potentially handling payment logic.
 * @param leadId - The ID of the lead to purchase.
 * @returns A success message or an error message.
 */
export async function purchaseLead(leadId: string) {
  const supabase = await createClient();

  try {
    // In a real application, this would involve Stripe integration.
    // For now, we'll just update the status.
    const { data, error } = await supabase
      .from('project_leads')
      .update({ status: 'purchased', purchased_at: new Date().toISOString() })
      .eq('id', leadId)
      .select();

    if (error) {
      console.error('Error purchasing lead:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Lead not found or not authorized to purchase.' };
    }

    revalidatePath('/contractor/leads');
    revalidatePath(`/homeowner/projects/${data[0]?.project_id}`);
    return { success: true, message: 'Lead purchased successfully!', data: data[0] };
  } catch (error) {
    console.error('Unexpected error purchasing lead:', error);
    return { success: false, error: 'An unexpected error occurred during lead purchase.' };
  }
}
