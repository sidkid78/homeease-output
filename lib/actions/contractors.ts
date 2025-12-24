
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contractorProfileSchema } from '@/lib/validations/schemas';
import { TablesInsert } from '@/types/database';

type ContractorProfileInsert = TablesInsert<'contractor_profiles'>;

/**
 * Creates or updates a contractor profile.
 * @param userId - The ID of the user associated with the contractor profile.
 * @param formData - FormData containing contractor profile details.
 * @returns A success message or an error message.
 */
export async function upsertContractorProfile(userId: string, formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());

  try {
    const validatedData = contractorProfileSchema.parse(rawData);

    const { data: existingProfile, error: fetchError } = await supabase
      .from('contractor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching existing contractor profile:', fetchError);
      return { success: false, error: fetchError.message };
    }

    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('contractor_profiles')
        .update(validatedData)
        .eq('user_id', userId)
        .select();
    } else {
      // Create new profile
      result = await supabase
        .from('contractor_profiles')
        .insert({ ...validatedData, user_id: userId } as ContractorProfileInsert)
        .select();
    }

    if (result.error) {
      console.error('Error upserting contractor profile:', result.error);
      return { success: false, error: result.error.message };
    }

    revalidatePath('/contractor-dashboard');
    return { success: true, data: result.data[0] };
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error('Unexpected error upserting contractor profile:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Deletes a contractor profile.
 * @param userId - The ID of the user whose contractor profile is to be deleted.
 * @returns A success message or an error message.
 */
export async function deleteContractorProfile(userId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('contractor_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting contractor profile:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/contractor-dashboard');
    return { success: true, message: 'Contractor profile deleted successfully.' };
  } catch (error) {
    console.error('Unexpected error deleting contractor profile:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
