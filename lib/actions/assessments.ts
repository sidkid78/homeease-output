
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { arAssessmentSchema } from '@/lib/validations/schemas';
import { TablesInsert } from '@/types/database';

type ArAssessmentInsert = TablesInsert<'ar_assessments'>;

/**
 * Submits a new AR assessment.
 * @param formData - FormData containing AR assessment details.
 * @returns A success message or an error message.
 */
export async function submitArAssessment(formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());

  try {
    const validatedData = arAssessmentSchema.parse(rawData);

    const { data, error } = await supabase
      .from('ar_assessments')
      .insert(validatedData as ArAssessmentInsert)
      .select();

    if (error) {
      console.error('Error submitting AR assessment:', error);
      return { success: false, error: error.message };
    }

    // Trigger AI analysis and lead creation here (e.g., via a Supabase Edge Function or Webhook)
    // For now, we'll just revalidate the path.

    revalidatePath('/homeowner/dashboard');
    revalidatePath(`/homeowner/assess/${data[0].id}`);
    return { success: true, data: data[0] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(err => err.message).join(', ') };
    }
    console.error('Unexpected error submitting AR assessment:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Updates an existing AR assessment.
 * @param assessmentId - The ID of the AR assessment to update.
 * @param formData - FormData containing the updated AR assessment details.
 * @returns A success message or an error message.
 */
export async function updateArAssessment(assessmentId: string, formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());

  try {
    const validatedData = arAssessmentSchema.partial().parse(rawData);

    const { data, error } = await supabase
      .from('ar_assessments')
      .update(validatedData)
      .eq('id', assessmentId)
      .select();

    if (error) {
      console.error('Error updating AR assessment:', error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/homeowner/assess/${assessmentId}`);
    return { success: true, data: data[0] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(err => err.message).join(', ') };
    }
    console.error('Unexpected error updating AR assessment:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Deletes an AR assessment.
 * @param assessmentId - The ID of the AR assessment to delete.
 * @returns A success message or an error message.
 */
export async function deleteArAssessment(assessmentId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ar_assessments')
      .delete()
      .eq('id', assessmentId);

    if (error) {
      console.error('Error deleting AR assessment:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/homeowner/dashboard');
    return { success: true, message: 'AR assessment deleted successfully.' };
  } catch (error) {
    console.error('Unexpected error deleting AR assessment:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
