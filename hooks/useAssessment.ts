/**
 * useAssessment Hook
 * 
 * Client-side state management for the room assessment flow.
 * Works with the server actions for actual API calls.
 * 
 * @example
 * ```tsx
 * 'use client'
 * 
 * import { useAssessment } from '@/hooks/useAssessment'
 * 
 * export function AssessmentForm() {
 *   const { 
 *     state, 
 *     analyzeRoom, 
 *     generateVisualization,
 *     reset 
 *   } = useAssessment()
 *   
 *   // ...
 * }
 * ```
 */

'use client'

import { useState, useCallback, useTransition } from 'react'
import {
  analyzeRoom as analyzeRoomAction,
  generateVisualization as generateVisualizationAction,
  quickAnalysis as quickAnalysisAction
} from '@/lib/actions/assessments'
import type {
  AssessmentState,
  RoomAnalysis,
  RoomType,
  MobilityConcern
} from '@/types/gemini'

// ============================================================================
// Types
// ============================================================================

interface UseAssessmentOptions {
  onAnalysisComplete?: (analysis: RoomAnalysis) => void
  onVisualizationComplete?: (imageUrl: string) => void
  onError?: (error: string) => void
}

interface UseAssessmentReturn {
  state: AssessmentState
  isPending: boolean

  // Actions
  analyzeRoom: (formData: FormData) => Promise<void>
  generateVisualization: (assessmentId: string, modifications?: string[]) => Promise<void>
  quickAnalysis: (formData: FormData) => Promise<RoomAnalysis | null>

  // State management
  reset: () => void
  clearError: () => void
  setAnalysisResult: (analysis: RoomAnalysis) => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: AssessmentState = {
  isAnalyzing: false,
  isVisualizing: false,
  analysisResult: null,
  visualizationImage: null,
  error: null,
  progress: undefined
}

// ============================================================================
// Hook
// ============================================================================

export function useAssessment(options: UseAssessmentOptions = {}): UseAssessmentReturn {
  const [state, setState] = useState<AssessmentState>(initialState)
  const [isPending, startTransition] = useTransition()

  const { onAnalysisComplete, onVisualizationComplete, onError } = options

  // ---------------------------------------------------------------------------
  // Analyze Room
  // ---------------------------------------------------------------------------

  const analyzeRoom = useCallback(async (formData: FormData) => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      progress: { stage: 'uploading', percent: 10 }
    }))

    try {
      setState(prev => ({
        ...prev,
        progress: { stage: 'analyzing', percent: 50 }
      }))

      const result = await analyzeRoomAction(formData)

      if (result.success && result.analysis) {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          analysisResult: result.analysis!,
          progress: { stage: 'complete', percent: 100 }
        }))

        onAnalysisComplete?.(result.analysis)
      } else {
        throw new Error(result.error || 'Analysis failed')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
        progress: undefined
      }))

      onError?.(errorMessage)
    }
  }, [onAnalysisComplete, onError])

  // ---------------------------------------------------------------------------
  // Generate Visualization
  // ---------------------------------------------------------------------------

  const generateVisualization = useCallback(async (
    assessmentId: string,
    modifications?: string[]
  ) => {
    setState(prev => ({
      ...prev,
      isVisualizing: true,
      error: null,
      progress: { stage: 'visualizing', percent: 30 }
    }))

    try {
      const result = await generateVisualizationAction(assessmentId, modifications)

      if (result.success && result.visualizationUrl) {
        setState(prev => ({
          ...prev,
          isVisualizing: false,
          visualizationImage: result.visualizationUrl!,
          progress: { stage: 'complete', percent: 100 }
        }))

        onVisualizationComplete?.(result.visualizationUrl)
      } else {
        throw new Error(result.error || 'Visualization failed')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Visualization failed'

      setState(prev => ({
        ...prev,
        isVisualizing: false,
        error: errorMessage,
        progress: undefined
      }))

      onError?.(errorMessage)
    }
  }, [onVisualizationComplete, onError])

  // ---------------------------------------------------------------------------
  // Quick Analysis (no DB save)
  // ---------------------------------------------------------------------------

  const quickAnalysis = useCallback(async (formData: FormData): Promise<RoomAnalysis | null> => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null
    }))

    try {
      const result = await quickAnalysisAction(formData)

      if (result.success && result.analysis) {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          analysisResult: result.analysis!
        }))

        return result.analysis
      } else {
        throw new Error(result.error || 'Quick analysis failed')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Quick analysis failed'

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }))

      onError?.(errorMessage)
      return null
    }
  }, [onError])

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const setAnalysisResult = useCallback((analysis: RoomAnalysis) => {
    setState(prev => ({ ...prev, analysisResult: analysis }))
  }, [])

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    state,
    isPending,
    analyzeRoom,
    generateVisualization,
    quickAnalysis,
    reset,
    clearError,
    setAnalysisResult
  }
}

// ============================================================================
// Utility Hook for Form State
// ============================================================================

interface AssessmentFormState {
  image: File | null
  imagePreview: string | null
  roomType: RoomType
  concerns: MobilityConcern[]
  budgetRange: string
  homeownerAge: string
  notes: string
}

const initialFormState: AssessmentFormState = {
  image: null,
  imagePreview: null,
  roomType: 'bathroom' as RoomType,
  concerns: [],
  budgetRange: '',
  homeownerAge: '',
  notes: ''
}

export function useAssessmentForm() {
  const [form, setForm] = useState<AssessmentFormState>(initialFormState)

  const setImage = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setForm(prev => ({
        ...prev,
        image: null,
        imagePreview: null
      }))
    }
  }, [])

  const setRoomType = useCallback((type: RoomType) => {
    setForm(prev => ({ ...prev, roomType: type }))
  }, [])

  const toggleConcern = useCallback((concern: MobilityConcern) => {
    setForm(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }))
  }, [])

  const setField = useCallback((
    field: 'budgetRange' | 'homeownerAge' | 'notes',
    value: string
  ) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const toFormData = useCallback((): FormData | null => {
    if (!form.image) return null

    const formData = new FormData()
    formData.set('image', form.image)
    formData.set('roomType', form.roomType)
    formData.set('concerns', JSON.stringify(form.concerns))

    if (form.budgetRange) formData.set('budgetRange', form.budgetRange)
    if (form.homeownerAge) formData.set('homeownerAge', form.homeownerAge)
    if (form.notes) formData.set('notes', form.notes)

    return formData
  }, [form])

  const reset = useCallback(() => {
    setForm(initialFormState)
  }, [])

  return {
    form,
    setImage,
    setRoomType,
    toggleConcern,
    setField,
    toFormData,
    reset,
    isValid: !!form.image
  }
}