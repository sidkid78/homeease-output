/**
 * HOMEase Gemini AI Module
 * 
 * @example
 * ```typescript
 * // Room Analysis
 * import { geminiService } from '@/lib/gemini'
 * const analysis = await geminiService.analyzeRoom(imageBase64, 'bathroom', ['balance_issues'])
 * 
 * // AR Detection (for WebXR)
 * import { arDetectionService } from '@/lib/gemini'
 * const result = await arDetectionService.detectBarriers(frameBase64)
 * ```
 */

// Core Room Analysis
export {
  GeminiService,
  geminiService,
  getGeminiService
} from './client';

// Schemas for Structured Output
export {
  roomAnalysisSchema,
  modificationSchema,
  safetyHazardSchema
} from './schemas';

// AR Detection (WebXR)
export {
  ARDetectionService,
  arDetectionService,
  getARDetectionService,
  type AROverlay,
  type DetectedObject,
  type BoundingBox,
  type ARDetectionResult,
  type SegmentationMask,
  type SegmentationResult
} from './ar-detection';
