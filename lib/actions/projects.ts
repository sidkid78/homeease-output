
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { projectSchema } from '@/lib/validations/schemas';
import { TablesInsert } from '@/types/database';

type ProjectInsert = TablesInsert<'projects'>;

/**
 * Creates a new project in the database.
 * @param formData - FormData containing project details.
 * @returns A success message or an error message.
 */
export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());

  try {
    const validatedData = projectSchema.parse(rawData);

    const { data, error } = await supabase
      .from('projects')
      .insert(validatedData as ProjectInsert)
      .select();

    if (error) {
      console.error('Error creating project:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true, data: data[0] };
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error('Unexpected error creating project:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Updates an existing project in the database.
 * @param projectId - The ID of the project to update.
 * @param formData - FormData containing the updated project details.
 * @returns A success message or an error message.
 */
export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());

  try {
    const validatedData = projectSchema.partial().parse(rawData);

    const { data, error } = await supabase
      .from('projects')
      .update(validatedData)
      .eq('id', projectId)
      .select();

    if (error) {
      console.error('Error updating project:', error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: data[0] };
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error) {
      return { success: false, error: error.message };
    }
    console.error('Unexpected error updating project:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Deletes a project from the database.
 * @param projectId - The ID of the project to delete.
 * @returns A success message or an error message.
 */
export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Project deleted successfully.' };
  } catch (error) {
    console.error('Unexpected error deleting project:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
