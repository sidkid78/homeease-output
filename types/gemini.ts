/**
 * HOMEase AI Types
 * 
 * Type definitions for aging-in-place room analysis and visualization.
 */

// ============================================================================
// Enums
// ============================================================================

export enum RoomType {
  BATHROOM = "bathroom",
  BEDROOM = "bedroom",
  KITCHEN = "kitchen",
  LIVING_ROOM = "living_room",
  HALLWAY = "hallway",
  ENTRANCE = "entrance",
  STAIRS = "stairs",
  GARAGE = "garage",
  LAUNDRY = "laundry",
  OUTDOOR = "outdoor"
}

export enum MobilityConcern {
  WHEELCHAIR_ACCESS = "wheelchair_access",
  WALKER_USE = "walker_use",
  BALANCE_ISSUES = "balance_issues",
  LIMITED_REACH = "limited_reach",
  VISION_IMPAIRMENT = "vision_impairment",
  HEARING_IMPAIRMENT = "hearing_impairment",
  ARTHRITIS = "arthritis",
  COGNITIVE_DECLINE = "cognitive_decline",
  FATIGUE = "fatigue",
  GENERAL_AGING = "general_aging"
}

export enum ModificationCategory {
  GRAB_BARS = "grab_bars",
  RAMPS = "ramps",
  LIGHTING = "lighting",
  FLOORING = "flooring",
  DOOR_WIDENING = "door_widening",
  LEVER_HANDLES = "lever_handles",
  RAISED_TOILET = "raised_toilet",
  WALK_IN_SHOWER = "walk_in_shower",
  STAIR_LIFT = "stair_lift",
  HANDRAILS = "handrails",
  NON_SLIP_SURFACES = "non_slip_surfaces",
  SMART_HOME = "smart_home",
  SEATING = "seating",
  STORAGE = "storage",
  OTHER = "other"
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Severity = 'high' | 'medium' | 'low';

// ============================================================================
// Core Interfaces
// ============================================================================

export interface Modification {
  name: string;
  category: string;
  priority: Priority;
  description: string;
  location: string;
  estimated_cost_range: string;
  diy_possible: boolean;
  contractor_type: string;
  safety_impact: string;
  independence_impact: string;
}

export interface SafetyHazard {
  hazard: string;
  location: string;
  severity: Severity;
  immediate_action: string;
}

export interface RoomAnalysis {
  room_type: string;
  overall_accessibility_score: number;
  summary: string;
  safety_hazards: SafetyHazard[];
  modifications: Modification[];
  positive_features: string[];
  estimated_total_cost: string;
  priority_order: string[];
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface AnalysisRequest {
  imageBase64: string;
  roomType: RoomType | string;
  concerns: MobilityConcern[] | string[];
  budgetRange?: string;
  homeownerAge?: number;
  additionalContext?: string;
}

export interface VisualizationRequest {
  originalImageBase64: string;
  modifications: string[];
  style?: 'photorealistic' | 'sketch' | 'blueprint';
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: RoomAnalysis;
  error?: string;
}

export interface VisualizationResponse {
  success: boolean;
  imageBase64?: string;
  description?: string;
  error?: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface AssessmentState {
  // Loading states
  isAnalyzing: boolean;
  isVisualizing: boolean;

  // Results
  analysisResult: RoomAnalysis | null;
  visualizationImage: string | null;

  // Error handling
  error: string | null;

  // Progress tracking
  progress?: {
    stage: 'uploading' | 'analyzing' | 'visualizing' | 'complete';
    percent: number;
  };
}

export interface AssessmentFormData {
  image: File | null;
  roomType: RoomType;
  concerns: MobilityConcern[];
  budgetRange?: string;
  homeownerAge?: number;
  notes?: string;
}

// ============================================================================
// Database Types (for Supabase)
// ============================================================================

export interface DbAssessment {
  id: string;
  created_at: string;
  updated_at: string;
  homeowner_id: string;
  room_type: string;
  image_url: string;
  mobility_concerns: string[];
  ai_analysis: RoomAnalysis | null;
  visualization_url: string | null;
  status: 'pending' | 'analyzing' | 'analyzed' | 'visualized' | 'error';
  error_message: string | null;
}

export interface DbProject {
  id: string;
  assessment_id: string;
  homeowner_id: string;
  title: string;
  description: string;
  estimated_cost: string;
  status: 'draft' | 'published' | 'matched' | 'in_progress' | 'completed';
  modifications: Modification[];
  created_at: string;
}

// ============================================================================
// AR Detection Types (WebXR Integration)
// ============================================================================

/**
 * Bounding box for AR overlay rendering
 * Format: [ymin, xmin, ymax, xmax] normalized to 0-1000
 */
export type BoundingBox = [number, number, number, number];

export type AROverlaySeverity = 'critical' | 'high' | 'medium' | 'low' | 'ok';
export type AROverlayType = 'barrier' | 'measurement' | 'suggestion' | 'compliant';

/**
 * AR Overlay for rendering on WebXR/camera view
 */
export interface AROverlay {
  type: AROverlayType;
  box_2d: BoundingBox;
  label: string;
  severity: AROverlaySeverity;
  color: string;
  description: string;
  ada_requirement?: string;
}

/**
 * Object detected by AR analysis
 */
export interface DetectedObject {
  label: string;
  box_2d: BoundingBox;
  confidence: number;
  accessibility_concern: string;
  ada_compliant: boolean;
  estimated_dimension_inches?: {
    width?: number;
    height?: number;
    depth?: number;
  };
}

/**
 * Segmentation mask for precise measurements
 */
export interface SegmentationMask {
  label: string;
  box_2d: BoundingBox;
  mask_base64: string;
  accessibility_concern: string;
}

/**
 * Complete AR detection result
 */
export interface ARDetectionResult {
  objects: DetectedObject[];
  overlays: AROverlay[];
  ada_issues: string[];
  accessibility_score: number;
  frame_summary: string;
}

/**
 * Segmentation analysis result
 */
export interface SegmentationResult {
  segments: SegmentationMask[];
  room_dimensions_estimate?: {
    width_feet?: number;
    depth_feet?: number;
  };
}

/**
 * WebXR Scanner State
 */
export interface WebXRScannerState {
  isStreaming: boolean;
  isScanning: boolean;
  isWebXRSupported: boolean;
  error: string | null;
  currentResult: {
    overlays: AROverlay[];
    score: number;
    summary: string;
    ada_issues?: string[];
  } | null;
}