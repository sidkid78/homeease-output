
'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ZodError, z } from 'zod'

// Define Zod schemas for validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['HOMEOWNER', 'CONTRACTOR']).default('HOMEOWNER'),
})

/**
 * Handles user sign-in.
 * @param {FormData} formData - The form data containing email and password.
 * @returns {Promise<{ success: boolean; error?: string }>} - Result of the sign-in attempt.
 */
export async function signIn(formData: FormData) {
  try {
    const { email, password } = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign-in error:', error.message)
      return { success: false, error: error.message }
    }

    // Redirect to a protected route after successful login
    redirect('/dashboard')
  } catch (error) {
    // Re-throw redirect errors (Next.js uses these for navigation)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    if (error instanceof ZodError) {
      return { success: false, error: error.message }
    }
    console.error('Unexpected sign-in error:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

/**
 * Handles user sign-up.
 * @param {FormData} formData - The form data containing email, password, and role.
 * @returns {Promise<{ success: boolean; error?: string }>} - Result of the sign-up attempt.
 */
export async function signUp(formData: FormData) {
  try {
    const origin = (await headers()).get('origin')
    const { email, password, role } = signupSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
    })

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: { role }, // Pass role to the user metadata
      },
    })

    if (error) {
      console.error('Sign-up error:', error.message)
      return { success: false, error: error.message }
    }

    // After successful signup, create a profile entry
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          role: role,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError.message)
        // Optionally, handle this by deleting the user or notifying admin
        await supabase.auth.admin.deleteUser(data.user.id) // Rollback user creation
        return { success: false, error: 'Failed to create user profile.' }
      }

      // Based on the role, create specific profile entries
      if (role === 'HOMEOWNER') {
        const { error: homeownerProfileError } = await supabase
          .from('homeowner_profiles')
          .insert({
            id: data.user.id,
          })
        if (homeownerProfileError) {
          console.error('Homeowner profile creation error:', homeownerProfileError.message)
          return { success: false, error: 'Failed to create homeowner profile.' }
        }
      } else if (role === 'CONTRACTOR') {
        const { error: contractorProfileError } = await supabase
          .from('contractor_profiles')
          .insert({
            id: data.user.id,
          })
        if (contractorProfileError) {
          console.error('Contractor profile creation error:', contractorProfileError.message)
          return { success: false, error: 'Failed to create contractor profile.' }
        }
      }
    }

    return {
      success: true,
      error: 'Please check your email to confirm your account.',
    } // Return message to inform user about email confirmation
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.message }
    }
    console.error('Unexpected sign-up error:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
