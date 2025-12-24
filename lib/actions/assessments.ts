/**
 * Assessment Server Actions
 * 
 * Server-side actions for room analysis and visualization.
 * These run on the server and can safely access API keys and database.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGeminiService } from '@/lib/gemini'
import type { RoomAnalysis, MobilityConcern, RoomType } from '@/types/gemini'
import type { Json } from '@/types/database'

// ============================================================================
// Types
// ============================================================================

export interface AssessmentActionResult {
  success: boolean
  assessmentId?: string
  analysis?: RoomAnalysis
  visualizationUrl?: string
  error?: string
}

export interface QuickAnalysisResult {
  success: boolean
  analysis?: RoomAnalysis
  error?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  return Buffer.from(bytes).toString('base64')
}

async function uploadImageToStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  imageBase64: string,
  assessmentId: string,
  type: 'original' | 'visualization'
): Promise<string | null> {
  try {
    const fileName = `${assessmentId}/${type}.jpg`
    const buffer = Buffer.from(imageBase64, 'base64')

    const { data, error } = await supabase.storage
      .from('assessments')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error(`[uploadImage] Failed to upload ${type}:`, error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assessments')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (err) {
    console.error(`[uploadImage] Error uploading ${type}:`, err)
    return null
  }
}
// ============================================================================
// Form Submission Actions
// ============================================================================

/**
 * Submits a new AR assessment from the homeowner form.
 * Supports direct image file uploads.
 */
export async function submitArAssessment(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { z } = await import('zod')
  const { redirect } = await import('next/navigation')

  // Extract form fields
  const homeownerId = formData.get('homeowner_id') as string
  const homeAddress = formData.get('homeAddress') as string
  const assessmentDetails = formData.get('assessmentDetails') as string
  const roomType = formData.get('roomType') as string
  const budgetRange = formData.get('budgetRange') as string || undefined
  const imageFile = formData.get('image') as File | null

  // Validate required fields
  if (!homeownerId || !homeAddress || !assessmentDetails || !roomType) {
    throw new Error('Missing required fields')
  }

  try {
    // Create initial assessment record with 'analyzing' status
    const { data: assessment, error: insertError } = await supabase
      .from('ar_assessments')
      .insert({
        homeowner_id: homeownerId,
        status: 'analyzing',
        ai_analysis_result: {
          home_address: homeAddress,
          room_type: roomType,
          details: assessmentDetails,
          budget_range: budgetRange,
        },
      })
      .select()
      .single()

    if (insertError || !assessment) {
      console.error('Error creating assessment:', insertError)
      throw new Error('Failed to create assessment')
    }

    // Handle image upload if provided
    let imageUrl: string | null = null
    let imageBase64: string | null = null

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${assessment.id}/original.${fileExt}`

      // Convert File to ArrayBuffer
      const arrayBuffer = await imageFile.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Store base64 for AI analysis
      imageBase64 = Buffer.from(arrayBuffer).toString('base64')

      // Try to upload to Supabase Storage
      const uploadResult = await supabase.storage
        .from('assessments')
        .upload(fileName, uint8Array, {
          contentType: imageFile.type,
          upsert: true,
        })

      if (uploadResult.error) {
        console.error('Error uploading image:', uploadResult.error)
        // Continue without stored image URL - we still have base64 for AI
      } else {
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('assessments')
          .getPublicUrl(fileName)
        imageUrl = publicUrl
      }
    }

    // Update assessment with image URL if we have one
    if (imageUrl) {
      await supabase
        .from('ar_assessments')
        .update({ image_url: imageUrl })
        .eq('id', assessment.id)
    }

    // =========================================================================
    // RUN AI ANALYSIS WITH GEMINI
    // This is the critical step that actually analyzes the room!
    // =========================================================================
    let aiAnalysis: RoomAnalysis | null = null

    if (imageBase64) {
      try {
        console.log('[submitArAssessment] Starting Gemini AI analysis...')
        const gemini = getGeminiService()

        aiAnalysis = await gemini.analyzeRoom(
          imageBase64,
          roomType,
          ['general_aging'], // Default concern
          {
            budgetRange: budgetRange,
            additionalContext: assessmentDetails,
          }
        )

        console.log('[submitArAssessment] AI analysis complete:', aiAnalysis?.room_type)

        // Update assessment with AI analysis results
        await supabase
          .from('ar_assessments')
          .update({
            ai_analysis: aiAnalysis as unknown as Json,
            ai_analysis_result: {
              home_address: homeAddress,
              room_type: roomType,
              details: assessmentDetails,
              budget_range: budgetRange,
              summary: aiAnalysis.summary,
              recommendations: aiAnalysis.modifications?.map((m: { name: string }) => m.name).join(', '),
            },
            status: 'analyzed',
            analyzed_at: new Date().toISOString(),
          })
          .eq('id', assessment.id)

      } catch (aiError) {
        console.error('[submitArAssessment] AI analysis failed:', aiError)
        // Update status to indicate AI failed but assessment exists
        await supabase
          .from('ar_assessments')
          .update({
            status: 'pending',
            ai_analysis_result: {
              home_address: homeAddress,
              room_type: roomType,
              details: assessmentDetails,
              budget_range: budgetRange,
              ai_error: aiError instanceof Error ? aiError.message : 'AI analysis failed',
            },
          })
          .eq('id', assessment.id)
      }
    } else {
      // No image provided - mark as pending for manual review
      console.log('[submitArAssessment] No image provided, skipping AI analysis')
      await supabase
        .from('ar_assessments')
        .update({ status: 'pending' })
        .eq('id', assessment.id)
    }

    // =========================================================================
    // AUTO-CREATE PROJECT FROM ASSESSMENT
    // This ensures the assessment appears on the /projects page immediately
    // =========================================================================
    const projectTitle = `${roomType.charAt(0).toUpperCase() + roomType.slice(1).replace('_', ' ')} Assessment`

    // Use AI-generated description if available
    const projectDescription = aiAnalysis?.summary || assessmentDetails
    const budgetEstimate = aiAnalysis?.estimated_total_cost
      ? parseInt(aiAnalysis.estimated_total_cost.replace(/[^0-9]/g, ''))
      : (budgetRange ? parseBudgetRange(budgetRange) : null)

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        ar_assessment_id: assessment.id,
        homeowner_id: homeownerId,
        title: projectTitle,
        description: projectDescription,
        status: aiAnalysis ? 'pending' : 'draft',
        budget_estimate: budgetEstimate,
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error creating project from assessment:', projectError)
      // Don't fail - assessment was still created, we just won't have a project yet
    } else {
      console.log('Created project:', project?.id, 'from assessment:', assessment.id)
    }

    revalidatePath('/dashboard')
    revalidatePath('/projects')
    redirect('/projects')
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((issue) => issue.message).join(', ')
      console.error('Validation error:', errorMessage)
      throw new Error(errorMessage)
    }
    throw error
  }
}

/**
 * Helper to parse budget range strings into numeric estimates
 */
function parseBudgetRange(range: string): number | null {
  const ranges: Record<string, number> = {
    'under_1000': 500,
    '1000_5000': 3000,
    '5000_15000': 10000,
    '15000_50000': 32500,
    'over_50000': 75000,
  }
  return ranges[range] || null
}

// ============================================================================
// Main Actions
// ============================================================================

/**
 * Analyze a room and save to database.
 * 
 * This is the main action called from the assessment form.
 */
export async function analyzeRoom(formData: FormData): Promise<AssessmentActionResult> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be logged in to create an assessment.' }
  }

  try {
    // Extract form data
    const image = formData.get('image') as File
    const roomType = formData.get('roomType') as string
    const concernsJson = formData.get('concerns') as string
    const budgetRange = formData.get('budgetRange') as string | null
    const homeownerAge = formData.get('homeownerAge') as string | null
    const notes = formData.get('notes') as string | null

    if (!image || !roomType) {
      return { success: false, error: 'Image and room type are required.' }
    }

    const concerns: MobilityConcern[] = concernsJson
      ? JSON.parse(concernsJson)
      : ['general_aging']

    // Convert image to base64
    const imageBase64 = await fileToBase64(image)

    // Create assessment record first (status: analyzing)
    const { data: assessment, error: insertError } = await supabase
      .from('ar_assessments')
      .insert({
        homeowner_id: user.id,
        room_type: roomType,
        mobility_concerns: concerns,
        status: 'analyzing',
        notes: notes || null
      })
      .select()
      .single()

    if (insertError || !assessment) {
      console.error('[analyzeRoom] Insert error:', insertError)
      return { success: false, error: 'Failed to create assessment record.' }
    }

    // Upload original image
    const imageUrl = await uploadImageToStorage(
      supabase,
      imageBase64,
      assessment.id,
      'original'
    )

    if (imageUrl) {
      await supabase
        .from('ar_assessments')
        .update({ image_url: imageUrl })
        .eq('id', assessment.id)
    }

    // Run AI analysis
    const gemini = getGeminiService()
    const analysis = await gemini.analyzeRoom(
      imageBase64,
      roomType,
      concerns,
      {
        homeownerAge: homeownerAge ? parseInt(homeownerAge) : undefined,
        budgetRange: budgetRange || undefined,
        additionalContext: notes || undefined
      }
    )

    // Update with analysis results
    await supabase
      .from('ar_assessments')
      .update({
        ai_analysis: analysis as unknown as Json,
        status: 'analyzed',
        analyzed_at: new Date().toISOString()
      })
      .eq('id', assessment.id)

    // Revalidate the assessments page
    revalidatePath('/dashboard/assessments')

    return {
      success: true,
      assessmentId: assessment.id,
      analysis
    }

  } catch (err) {
    console.error('[analyzeRoom] Error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.'
    }
  }
}

/**
 * Generate visualization for an existing assessment.
 */
export async function generateVisualization(
  assessmentId: string,
  modifications?: string[]
): Promise<AssessmentActionResult> {
  const supabase = await createClient()

  // Verify user owns this assessment
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated.' }
  }

  try {
    // Get the assessment
    const { data: assessment, error: fetchError } = await supabase
      .from('ar_assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('homeowner_id', user.id)
      .single()

    if (fetchError || !assessment) {
      return { success: false, error: 'Assessment not found.' }
    }

    if (!assessment.image_url) {
      return { success: false, error: 'No image found for this assessment.' }
    }

    // Determine modifications to visualize
    const aiAnalysis = assessment.ai_analysis as any
    const modsToVisualize = modifications ||
      (aiAnalysis?.modifications?.slice(0, 3).map((m: any) => m.name) || [])

    if (modsToVisualize.length === 0) {
      return { success: false, error: 'No modifications to visualize.' }
    }

    // Download original image
    const imageResponse = await fetch(assessment.image_url)
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')

    // Generate visualization
    const gemini = getGeminiService()
    const { imageBase64: vizImageBase64, description } = await gemini.generateVisualization(
      imageBase64,
      modsToVisualize
    )

    // Upload visualization
    const vizUrl = await uploadImageToStorage(
      supabase,
      vizImageBase64,
      assessmentId,
      'visualization'
    )

    // Update assessment
    await supabase
      .from('ar_assessments')
      .update({
        visualization_url: vizUrl,
        visualization_description: description,
        status: 'visualized'
      })
      .eq('id', assessmentId)

    revalidatePath(`/dashboard/assessments/${assessmentId}`)

    return {
      success: true,
      assessmentId,
      visualizationUrl: vizUrl || undefined
    }

  } catch (err) {
    console.error('[generateVisualization] Error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate visualization.'
    }
  }
}

/**
 * Quick analysis without saving to database.
 * Useful for demos or previews.
 */
export async function quickAnalysis(formData: FormData): Promise<QuickAnalysisResult> {
  try {
    const image = formData.get('image') as File
    const roomType = formData.get('roomType') as string || 'bathroom'
    const concernsJson = formData.get('concerns') as string

    if (!image) {
      return { success: false, error: 'Image is required.' }
    }

    const concerns = concernsJson ? JSON.parse(concernsJson) : ['general_aging']
    const imageBase64 = await fileToBase64(image)

    const gemini = getGeminiService()
    const analysis = await gemini.analyzeRoom(imageBase64, roomType, concerns)

    return { success: true, analysis }

  } catch (err) {
    console.error('[quickAnalysis] Error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Analysis failed.'
    }
  }
}

/**
 * Convert assessment to a project (lead).
 */
export async function createProjectFromAssessment(
  assessmentId: string,
  selectedModifications: string[]
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated.' }
  }

  try {
    // Get assessment
    const { data: assessment } = await supabase
      .from('ar_assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('homeowner_id', user.id)
      .single()

    if (!assessment) {
      return { success: false, error: 'Assessment not found.' }
    }

    // Filter selected modifications
    const analysisData = assessment.ai_analysis as any
    const allMods = analysisData?.modifications || []
    const selectedMods = allMods.filter((m: any) =>
      selectedModifications.includes(m.name)
    )

    // Calculate estimated cost
    const costs = selectedMods.map((m: any) => {
      const match = m.estimated_cost_range?.match(/\$?([\d,]+)/g)
      return match ? parseInt(match[0].replace(/[$,]/g, '')) : 0
    })
    const totalCost = costs.reduce((a: number, b: number) => a + b, 0)

    // Create project
    const aiData = assessment.ai_analysis as { room_type?: string; summary?: string } | null
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ar_assessment_id: assessmentId,
        homeowner_id: user.id,
        title: `${aiData?.room_type || 'Room'} Modifications`,
        description: aiData?.summary || '',
        budget_estimate: totalCost,
        status: 'draft'
      })
      .select()
      .single()

    if (error || !project) {
      return { success: false, error: 'Failed to create project.' }
    }

    revalidatePath('/dashboard/projects')

    return { success: true, projectId: project.id }

  } catch (err) {
    console.error('[createProjectFromAssessment] Error:', err)
    return { success: false, error: 'Failed to create project.' }
  }
}